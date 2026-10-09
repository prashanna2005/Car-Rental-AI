from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.database import get_db
from app.database.models import Vehicle

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("")
def list_vehicles(
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle)
    if category:
        query = query.filter(Vehicle.category.ilike(f"%{category}%"))
    if status:
        query = query.filter(Vehicle.status == status)
    if search:
        query = query.filter(
            (Vehicle.make.ilike(f"%{search}%")) |
            (Vehicle.model.ilike(f"%{search}%")) |
            (Vehicle.registration_number.ilike(f"%{search}%"))
        )
    
    vehicles = query.all()
    return [
        {
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
        } for v in vehicles
    ]

@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter((Vehicle.id == vehicle_id) | (Vehicle.registration_number == vehicle_id)).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
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

@router.patch("/{vehicle_id}/status")
def update_vehicle_status(vehicle_id: str, status: str, maintenance_status: Optional[str] = None, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    v.status = status
    if maintenance_status:
        v.maintenance_status = maintenance_status
    elif status == "available":
        v.maintenance_status = "good"
    db.commit()
    return {"message": "Status updated successfully", "status": v.status, "maintenance_status": v.maintenance_status}
