from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.tools import analyst_tools
from app.database.models import AnalysisReport
import json

router = APIRouter(prefix="/analytics", tags=["Business Analytics"])

@router.get("/metrics")
def get_metrics(timeframe: str = "current_month", db: Session = Depends(get_db)):
    return analyst_tools.get_business_metrics(db, timeframe)

@router.get("/compare")
def compare_periods(period1: str = "last_month", period2: str = "current_month", db: Session = Depends(get_db)):
    return analyst_tools.compare_business_periods(db, period1, period2)

@router.get("/utilization")
def get_utilization(db: Session = Depends(get_db)):
    return analyst_tools.analyze_vehicle_utilization(db)

@router.get("/anomalies")
def get_anomalies(db: Session = Depends(get_db)):
    return analyst_tools.detect_business_anomalies(db)

@router.get("/revenue-breakdown")
def get_revenue_breakdown(group_by: str = "category", db: Session = Depends(get_db)):
    return analyst_tools.get_revenue_breakdown(db, group_by)

@router.get("/reports")
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(AnalysisReport).order_by(AnalysisReport.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "timeframe": r.timeframe,
            "key_findings": json.loads(r.key_findings_json),
            "recommendations": json.loads(r.recommendations_json),
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M")
        } for r in reports
    ]
