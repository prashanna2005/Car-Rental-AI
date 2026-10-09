from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import AgentEvent, AgentRun
import json

router = APIRouter(prefix="/activity", tags=["Activity History"])

@router.get("")
def list_activity_history(limit: int = 50, db: Session = Depends(get_db)):
    events = db.query(AgentEvent).order_by(AgentEvent.created_at.desc()).limit(limit).all()
    results = []
    for e in events:
        run = db.query(AgentRun).filter(AgentRun.id == e.agent_run_id).first()
        results.append({
            "id": e.id,
            "run_id": e.agent_run_id,
            "conversation_id": e.conversation_id,
            "user_request": run.user_request if run else "N/A",
            "step_number": e.step_number,
            "agent_name": e.agent_name,
            "event_type": e.event_type,
            "title": e.title,
            "details": json.loads(e.details_json),
            "timestamp": e.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })
    return results
