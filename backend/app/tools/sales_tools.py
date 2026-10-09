from datetime import datetime
from sqlalchemy.orm import Session
from app.database.models import Vehicle, Customer, Lead, Booking, MaintenanceRecord, OperationalTask
from typing import Dict, Any, List, Optional

def search_available_cars(
    db: Session,
    category: Optional[str] = None,
    min_capacity: Optional[int] = None,
    max_daily_rate: Optional[float] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> Dict[str, Any]:
    """Search available vehicles matching customer criteria and date availability."""
    query = db.query(Vehicle).filter(Vehicle.status != "maintenance", Vehicle.maintenance_status != "in_repair")

    if category:
        query = query.filter(Vehicle.category.iloclike(f"%{category}%") if hasattr(Vehicle.category, 'iloclike') else Vehicle.category.ilike(f"%{category}%"))
    if min_capacity:
        query = query.filter(Vehicle.capacity >= min_capacity)
    if max_daily_rate:
        query = query.filter(Vehicle.daily_rate <= max_daily_rate)

    candidate_vehicles = query.all()
    available = []

    for v in candidate_vehicles:
        # Check date overlap if dates provided
        if start_date and end_date:
            conflicts = db.query(Booking).filter(
                Booking.vehicle_id == v.id,
                Booking.status.in_(["confirmed", "active"]),
                Booking.start_date <= end_date,
                Booking.end_date >= start_date
            ).first()
            if conflicts:
                continue
        
        available.append({
            "id": v.id,
            "registration_number": v.registration_number,
            "make": v.make,
            "model": v.model,
            "category": v.category,
            "daily_rate": v.daily_rate,
            "capacity": v.capacity,
            "location": v.location,
            "status": v.status,
            "maintenance_status": v.maintenance_status
        })

    return {
        "count": len(available),
        "available_vehicles": available,
        "criteria": {
            "category": category,
            "min_capacity": min_capacity,
            "max_daily_rate": max_daily_rate,
            "start_date": start_date,
            "end_date": end_date
        }
    }


def get_vehicle_details(db: Session, vehicle_id_or_reg: str) -> Dict[str, Any]:
    """Fetch complete details for a specific vehicle by ID or registration number."""
    v = db.query(Vehicle).filter(
        (Vehicle.id == vehicle_id_or_reg) | (Vehicle.registration_number == vehicle_id_or_reg)
    ).first()

    if not v:
        return {"error": f"Vehicle '{vehicle_id_or_reg}' not found."}

    return {
        "id": v.id,
        "registration_number": v.registration_number,
        "make": v.make,
        "model": v.model,
        "year": v.year,
        "category": v.category,
        "daily_rate": v.daily_rate,
        "deposit_amount": v.deposit_amount,
        "location": v.location,
        "capacity": v.capacity,
        "status": v.status,
        "maintenance_status": v.maintenance_status,
        "odometer": v.odometer,
        "fuel_level": v.fuel_level
    }


def calculate_rental_price(
    daily_rate: float,
    duration_days: int,
    category: Optional[str] = None,
    customer_status: str = "active"
) -> Dict[str, Any]:
    """Deterministically calculate total rental price, discounts, deposits, and tax."""
    subtotal = round(daily_rate * duration_days, 2)
    
    # Discounts
    discount_pct = 0.0
    if customer_status.upper() == "VIP":
        discount_pct += 0.15 # 15% VIP discount
    elif duration_days >= 7:
        discount_pct += 0.10 # 10% weekly discount

    discount_amount = round(subtotal * discount_pct, 2)
    discounted_subtotal = subtotal - discount_amount

    tax_rate = 0.08 # 8% sales tax
    tax_amount = round(discounted_subtotal * tax_rate, 2)
    total_price = round(discounted_subtotal + tax_amount, 2)

    deposit = round(daily_rate * 2.5, 2)

    return {
        "daily_rate": daily_rate,
        "duration_days": duration_days,
        "subtotal": subtotal,
        "discount_applied_pct": int(discount_pct * 100),
        "discount_amount": discount_amount,
        "tax_amount": tax_amount,
        "total_price": total_price,
        "refundable_deposit": deposit,
        "currency": "USD"
    }


def qualify_customer_lead(
    db: Session,
    lead_id: str,
    customer_budget: float,
    duration_days: int,
    requested_category: str
) -> Dict[str, Any]:
    """Qualify a lead based on budget vs estimated rental rates and set qualification score."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        return {"error": f"Lead '{lead_id}' not found."}

    # Find benchmark average rate for category
    avg_veh = db.query(Vehicle).filter(Vehicle.category.ilike(f"%{requested_category}%")).first()
    bench_rate = avg_veh.daily_rate if avg_veh else 80.0
    est_cost = bench_rate * duration_days

    score = 70
    if customer_budget >= est_cost:
        score += 20
        status = "qualified"
        notes = f"Budget ${customer_budget} comfortably covers estimated cost ${est_cost} for {requested_category}."
    else:
        score -= 20
        status = "review_needed"
        notes = f"Budget ${customer_budget} is below estimated cost ${est_cost}. Upsell or budget option suggested."

    lead.qualification_score = score
    lead.lead_status = status
    lead.qualification_notes = notes
    lead.estimated_value = max(customer_budget, est_cost)
    db.commit()

    return {
        "lead_id": lead.id,
        "customer_name": lead.customer_name,
        "status": lead.lead_status,
        "score": lead.qualification_score,
        "notes": lead.qualification_notes,
        "estimated_value": lead.estimated_value
    }


def create_booking_request(
    db: Session,
    customer_id: str,
    vehicle_id: str,
    start_date: str,
    end_date: str
) -> Dict[str, Any]:
    """Validate availability & maintenance rules before creating booking."""
    veh = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not veh:
        return {"error": "Vehicle not found."}

    if veh.status == "maintenance" or veh.maintenance_status == "in_repair":
        return {
            "success": False,
            "reason": f"Vehicle {veh.registration_number} ({veh.make} {veh.model}) is currently in maintenance and cannot be booked."
        }

    # Check date overlap
    conflicts = db.query(Booking).filter(
        Booking.vehicle_id == vehicle_id,
        Booking.status.in_(["confirmed", "active"]),
        Booking.start_date <= end_date,
        Booking.end_date >= start_date
    ).first()

    if conflicts:
        return {
            "success": False,
            "reason": f"Vehicle {veh.registration_number} has an existing conflicting booking ({conflicts.booking_reference}) from {conflicts.start_date} to {conflicts.end_date}."
        }

    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        # Create a default guest customer record if customer_id is a name or unknown
        cust = Customer(
            name=customer_id if len(customer_id) > 5 else "Walk-in Guest",
            email=f"guest_{int(datetime.now().timestamp())}@fleetiq.demo",
            phone="+1 (555) 000-1122",
            driver_license=f"DL-{int(datetime.now().timestamp())}"
        )
        db.add(cust)
        db.flush()

    d1 = datetime.strptime(start_date, "%Y-%m-%d")
    d2 = datetime.strptime(end_date, "%Y-%m-%d")
    duration_days = max(1, (d2 - d1).days)

    pricing = calculate_rental_price(veh.daily_rate, duration_days, veh.category, cust.status)
    ref = f"BK-{int(datetime.now().timestamp()) % 100000:05d}"

    booking = Booking(
        booking_reference=ref,
        customer_id=cust.id,
        vehicle_id=veh.id,
        start_date=start_date,
        end_date=end_date,
        duration_days=duration_days,
        daily_rate=veh.daily_rate,
        total_price=pricing["total_price"],
        deposit_paid=pricing["refundable_deposit"],
        status="confirmed"
    )
    db.add(booking)
    cust.total_rentals += 1
    db.commit()

    return {
        "success": True,
        "booking_reference": ref,
        "customer_name": cust.name,
        "vehicle": f"{veh.make} {veh.model} ({veh.registration_number})",
        "dates": f"{start_date} to {end_date}",
        "duration_days": duration_days,
        "total_price": pricing["total_price"],
        "status": "confirmed"
    }


def get_customer_booking_history(db: Session, customer_id: str) -> Dict[str, Any]:
    """Retrieve past bookings for a customer."""
    cust = db.query(Customer).filter((Customer.id == customer_id) | (Customer.email == customer_id)).first()
    if not cust:
        return {"error": f"Customer '{customer_id}' not found."}

    bookings = db.query(Booking).filter(Booking.customer_id == cust.id).all()
    return {
        "customer": cust.name,
        "email": cust.email,
        "status": cust.status,
        "total_rentals": cust.total_rentals,
        "history": [
            {
                "reference": b.booking_reference,
                "vehicle_id": b.vehicle_id,
                "dates": f"{b.start_date} to {b.end_date}",
                "total_price": b.total_price,
                "status": b.status
            } for b in bookings
        ]
    }
