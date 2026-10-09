from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database.database import get_db
from app.database.models import MaintenanceRecord, OperationalTask, Vehicle
from app.schemas.pydantic_schemas import TaskCreateRequest
from app.tools import operations_tools

router = APIRouter(prefix="/maintenance", tags=["Maintenance & Tasks"])

@router.get("/records")
def list_maintenance_records(db: Session = Depends(get_db)):
    records = db.query(MaintenanceRecord).order_by(MaintenanceRecord.created_at.desc()).all()
    results = []
    for r in records:
        v = db.query(Vehicle).filter(Vehicle.id == r.vehicle_id).first()
        results.append({
            "id": r.id,
            "vehicle_name": f"{v.make} {v.model}" if v else "Unknown Vehicle",
            "vehicle_reg": v.registration_number if v else "N/A",
            "service_type": r.service_type,
            "description": r.description,
            "cost": r.cost,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "status": r.status,
            "technician": r.technician
        })
    return results

@router.get("/tasks")
def list_operational_tasks(priority: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(OperationalTask)
    if priority:
        query = query.filter(OperationalTask.priority == priority)
    if status:
        query = query.filter(OperationalTask.status == status)

    tasks = query.order_by(OperationalTask.created_at.desc()).all()
    results = []
    for t in tasks:
        v = db.query(Vehicle).filter(Vehicle.id == t.related_vehicle_id).first() if t.related_vehicle_id else None
        results.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "priority": t.priority,
            "status": t.status,
            "assigned_role": t.assigned_role,
            "related_vehicle": f"{v.make} {v.model} ({v.registration_number})" if v else None,
            "due_date": t.due_date,
            "created_at": t.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return results

@router.post("/tasks")
def create_task(req: TaskCreateRequest, db: Session = Depends(get_db)):
    return operations_tools.create_operational_task(
        db,
        title=req.title,
        description=req.description,
        priority=req.priority,
        assigned_role=req.assigned_role,
        related_vehicle_id=req.related_vehicle_id,
        related_booking_id=req.related_booking_id,
        due_date=req.due_date
    )

@router.patch("/tasks/{task_id}/status")
def update_task_status(task_id: str, status: str, db: Session = Depends(get_db)):
    t = db.query(OperationalTask).filter(OperationalTask.id == task_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    t.status = status
    db.commit()
    return {"message": "Task status updated", "task_id": t.id, "status": t.status}
