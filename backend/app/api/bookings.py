from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database.database import get_db
from app.database.models import Booking, Vehicle, Customer
from app.schemas.pydantic_schemas import BookingCreateRequest
from app.tools import sales_tools

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.get("")
def list_bookings(status: Optional[str] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    if search:
        query = query.filter(Booking.booking_reference.ilike(f"%{search}%"))

    bookings = query.order_by(Booking.created_at.desc()).all()
    results = []
    for b in bookings:
        v = db.query(Vehicle).filter(Vehicle.id == b.vehicle_id).first()
        c = db.query(Customer).filter(Customer.id == b.customer_id).first()
        results.append({
            "id": b.id,
            "booking_reference": b.booking_reference,
            "customer_name": c.name if c else "Unknown Customer",
            "customer_email": c.email if c else "N/A",
            "vehicle_name": f"{v.make} {v.model}" if v else "Unknown Vehicle",
            "vehicle_reg": v.registration_number if v else "N/A",
            "vehicle_category": v.category if v else "N/A",
            "start_date": b.start_date,
            "end_date": b.end_date,
            "duration_days": b.duration_days,
            "daily_rate": b.daily_rate,
            "total_price": b.total_price,
            "deposit_paid": b.deposit_paid,
            "status": b.status,
            "cancellation_reason": b.cancellation_reason
        })
    return results

@router.post("")
def create_booking(req: BookingCreateRequest, db: Session = Depends(get_db)):
    res = sales_tools.create_booking_request(
        db,
        customer_id=req.customer_id,
        vehicle_id=req.vehicle_id,
        start_date=req.start_date,
        end_date=req.end_date
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("reason", "Booking creation failed"))
    return res
