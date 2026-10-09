from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database.database import get_db
from app.database.models import Customer, Lead
from app.schemas.pydantic_schemas import LeadCreateRequest
from app.tools import sales_tools

router = APIRouter(prefix="/customers", tags=["Customers & Leads"])

@router.get("")
def list_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "driver_license": c.driver_license,
            "total_rentals": c.total_rentals,
            "rating": c.rating,
            "status": c.status
        } for c in customers
    ]

@router.get("/leads")
def list_leads(db: Session = Depends(get_db)):
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()
    return [
        {
            "id": l.id,
            "customer_name": l.customer_name,
            "email": l.email,
            "phone": l.phone,
            "requested_category": l.requested_category,
            "budget_max": l.budget_max,
            "duration_days": l.duration_days,
            "start_date": l.start_date,
            "lead_source": l.lead_source,
            "lead_status": l.lead_status,
            "qualification_score": l.qualification_score,
            "qualification_notes": l.qualification_notes,
            "estimated_value": l.estimated_value
        } for l in leads
    ]

@router.post("/leads")
def create_lead(req: LeadCreateRequest, db: Session = Depends(get_db)):
    lead = Lead(
        customer_name=req.customer_name,
        email=req.email,
        phone=req.phone,
        requested_category=req.requested_category,
        budget_max=req.budget_max,
        duration_days=req.duration_days,
        start_date=req.start_date,
        lead_source=req.lead_source or "Website Enquiry",
        lead_status="new"
    )
    db.add(lead)
    db.commit()

    # Qualify lead automatically
    qual_res = sales_tools.qualify_customer_lead(
        db, lead.id, req.budget_max, req.duration_days, req.requested_category
    )
    return qual_res
