from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from app.database.database import get_db
from app.agents.router import IntelligentRouter
from app.database.models import AgentEvent, AgentRun
import uuid
import json

router = APIRouter(prefix="/agent-hub", tags=["AI Agent Hub"])
intelligent_router = IntelligentRouter()

class ProcessRequestPayload(BaseModel):
    conversation_id: Optional[str] = None
    user_request: str

@router.post("/process")
def process_user_request(payload: ProcessRequestPayload, db: Session = Depends(get_db)):
    conv_id = payload.conversation_id or str(uuid.uuid4())
    if not payload.user_request.strip():
        raise HTTPException(status_code=400, detail="User request cannot be empty")

    result = intelligent_router.process_request(db, conv_id, payload.user_request)
    return result

@router.get("/events/{run_id}")
def get_run_events(run_id: str, db: Session = Depends(get_db)):
    events = db.query(AgentEvent).filter(AgentEvent.agent_run_id == run_id).order_by(AgentEvent.step_number.asc()).all()
    return [
        {
            "id": e.id,
            "step_number": e.step_number,
            "agent_name": e.agent_name,
            "event_type": e.event_type,
            "title": e.title,
            "details": json.loads(e.details_json),
            "created_at": e.created_at.strftime("%H:%M:%S")
        } for e in events
    ]
