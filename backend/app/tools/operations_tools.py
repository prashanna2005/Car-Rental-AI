from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database.models import Vehicle, Booking, MaintenanceRecord, OperationalTask
from typing import Dict, Any, List, Optional
from app.tools.sales_tools import search_available_cars

def get_fleet_status(db: Session) -> Dict[str, Any]:
    """Retrieve full operational fleet status breakdown."""
    total = db.query(Vehicle).count()
    available = db.query(Vehicle).filter(Vehicle.status == "available").all()
    rented = db.query(Vehicle).filter(Vehicle.status == "rented").all()
    maintenance = db.query(Vehicle).filter(Vehicle.status == "maintenance").all()
    reserved = db.query(Vehicle).filter(Vehicle.status == "reserved").all()

    return {
        "total_fleet": total,
        "available_count": len(available),
        "rented_count": len(rented),
        "maintenance_count": len(maintenance),
        "reserved_count": len(reserved),
        "maintenance_vehicles": [
            {
                "id": v.id,
                "registration_number": v.registration_number,
                "vehicle": f"{v.make} {v.model}",
                "category": v.category,
                "maintenance_status": v.maintenance_status
            } for v in maintenance
        ]
    }


def check_vehicle_availability(
    db: Session,
    vehicle_id: str,
    start_date: str,
    end_date: str
) -> Dict[str, Any]:
    """Check if a vehicle is operational, not in maintenance, and free of conflicting bookings."""
    v = db.query(Vehicle).filter(
        (Vehicle.id == vehicle_id) | (Vehicle.registration_number == vehicle_id)
    ).first()

    if not v:
        return {"is_available": False, "reason": "Vehicle record not found."}

    if v.status == "maintenance" or v.maintenance_status == "in_repair":
        return {
            "is_available": False,
            "reason": f"Vehicle {v.registration_number} ({v.make} {v.model}) is currently undergoing maintenance ({v.maintenance_status}).",
            "vehicle_id": v.id,
            "category": v.category
        }

    conflicts = db.query(Booking).filter(
        Booking.vehicle_id == v.id,
        Booking.status.in_(["confirmed", "active"]),
        Booking.start_date <= end_date,
        Booking.end_date >= start_date
    ).first()

    if conflicts:
        return {
            "is_available": False,
            "reason": f"Vehicle {v.registration_number} has a confirmed booking ({conflicts.booking_reference}) from {conflicts.start_date} to {conflicts.end_date}.",
            "vehicle_id": v.id,
            "category": v.category
        }

    return {
        "is_available": True,
        "reason": f"Vehicle {v.registration_number} ({v.make} {v.model}) is ready and available for assignment.",
        "vehicle_id": v.id,
        "category": v.category,
        "daily_rate": v.daily_rate
    }


def get_maintenance_records(
    db: Session,
    vehicle_id: Optional[str] = None,
    status: Optional[str] = None
) -> Dict[str, Any]:
    """Fetch active or historical vehicle maintenance records."""
    query = db.query(MaintenanceRecord)
    if vehicle_id:
        query = query.filter(MaintenanceRecord.vehicle_id == vehicle_id)
    if status:
        query = query.filter(MaintenanceRecord.status == status)

    records = query.all()
    return {
        "count": len(records),
        "records": [
            {
                "id": r.id,
                "vehicle_id": r.vehicle_id,
                "service_type": r.service_type,
                "description": r.description,
                "cost": r.cost,
                "start_date": r.start_date,
                "status": r.status,
                "technician": r.technician
            } for r in records
        ]
    }


def create_maintenance_task(
    db: Session,
    vehicle_id: str,
    service_type: str,
    description: str,
    cost: float = 0.0,
    technician: str = "Master Tech Fleet Services"
) -> Dict[str, Any]:
    """Flag vehicle as in maintenance and create a maintenance record and operational task."""
    v = db.query(Vehicle).filter(
        (Vehicle.id == vehicle_id) | (Vehicle.registration_number == vehicle_id)
    ).first()

    if not v:
        return {"error": f"Vehicle '{vehicle_id}' not found."}

    v.status = "maintenance"
    v.maintenance_status = "in_repair"

    today_str = datetime.now().strftime("%Y-%m-%d")
    m_record = MaintenanceRecord(
        vehicle_id=v.id,
        service_type=service_type,
        description=description,
        cost=cost,
        start_date=today_str,
        status="in_progress",
        technician=technician
    )
    db.add(m_record)

    task = OperationalTask(
        title=f"Complete {service_type} on {v.registration_number}",
        description=description,
        priority="high" if cost > 1000 else "medium",
        status="in_progress",
        assigned_role="Fleet Technician",
        related_vehicle_id=v.id,
        due_date=(datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
    )
    db.add(task)
    db.commit()

    return {
        "success": True,
        "vehicle": f"{v.make} {v.model} ({v.registration_number})",
        "maintenance_id": m_record.id,
        "task_id": task.id,
        "status": "maintenance / in_repair"
    }


def create_operational_task(
    db: Session,
    title: str,
    description: str,
    priority: str = "medium",
    assigned_role: str = "Operations Specialist",
    related_vehicle_id: Optional[str] = None,
    related_booking_id: Optional[str] = None,
    due_date: Optional[str] = None
) -> Dict[str, Any]:
    """Create a new operational task in the database."""
    if not due_date:
        due_date = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")

    task = OperationalTask(
        title=title,
        description=description,
        priority=priority,
        status="pending",
        assigned_role=assigned_role,
        related_vehicle_id=related_vehicle_id,
        related_booking_id=related_booking_id,
        due_date=due_date
    )
    db.add(task)
    db.commit()

    return {
        "success": True,
        "task_id": task.id,
        "title": task.title,
        "priority": task.priority,
        "status": task.status,
        "assigned_role": task.assigned_role,
        "due_date": task.due_date
    }


def update_vehicle_status(
    db: Session,
    vehicle_id: str,
    new_status: str,
    maintenance_status: Optional[str] = None
) -> Dict[str, Any]:
    """Update vehicle operational availability or maintenance status."""
    v = db.query(Vehicle).filter(
        (Vehicle.id == vehicle_id) | (Vehicle.registration_number == vehicle_id)
    ).first()

    if not v:
        return {"error": "Vehicle not found."}

    v.status = new_status
    if maintenance_status:
        v.maintenance_status = maintenance_status
    elif new_status == "available":
        v.maintenance_status = "good"

    db.commit()

    return {
        "success": True,
        "vehicle_id": v.id,
        "registration_number": v.registration_number,
        "status": v.status,
        "maintenance_status": v.maintenance_status
    }


def get_overdue_rentals(db: Session) -> Dict[str, Any]:
    """Identify active bookings that have passed their scheduled return date."""
    today_str = datetime.now().strftime("%Y-%m-%d")
    overdue = db.query(Booking).filter(
        Booking.status == "active",
        Booking.end_date < today_str
    ).all()

    return {
        "overdue_count": len(overdue),
        "overdue_rentals": [
            {
                "booking_reference": b.booking_reference,
                "customer_id": b.customer_id,
                "vehicle_id": b.vehicle_id,
                "scheduled_end_date": b.end_date
            } for b in overdue
        ]
    }


def find_alternative_vehicles(
    db: Session,
    category: str,
    start_date: str,
    end_date: str,
    target_vehicle_id: Optional[str] = None
) -> Dict[str, Any]:
    """Find available vehicles in same or upgrade category when a requested vehicle is unavailable."""
    # First check exact category available cars
    res = search_available_cars(db, category=category, start_date=start_date, end_date=end_date)
    
    if res["count"] > 0:
        return {
            "found_alternatives": True,
            "tier": "same_category",
            "alternatives": res["available_vehicles"]
        }

    # Fallback to general available cars if exact category is fully booked/in maintenance
    res_all = search_available_cars(db, start_date=start_date, end_date=end_date)
    return {
        "found_alternatives": res_all["count"] > 0,
        "tier": "alternative_category",
        "alternatives": res_all["available_vehicles"]
    }
