import json
from typing import Dict, Any, List, Callable, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.schemas.pydantic_schemas import AgentState
from app.database.models import AgentEvent, AgentRun

class BaseAgent:
    def __init__(
        self,
        name: str,
        role_description: str,
        system_instruction: str,
        tools: Dict[str, Callable]
    ):
        self.name = name
        self.role_description = role_description
        self.system_instruction = system_instruction
        self.tools = tools

    def log_event(
        self,
        db: Session,
        run_id: str,
        conversation_id: str,
        step_number: int,
        event_type: str,
        title: str,
        details: Dict[str, Any]
    ):
        """Persist structured agent activity event in the database."""
        event = AgentEvent(
            agent_run_id=run_id,
            conversation_id=conversation_id,
            step_number=step_number,
            agent_name=self.name,
            event_type=event_type,
            title=title,
            details_json=json.dumps(details, default=str)
        )
        db.add(event)
        db.commit()

    def execute_tool(self, db: Session, tool_name: str, kwargs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool deterministically with argument validation and error safety."""
        if tool_name not in self.tools:
            return {"error": f"Tool '{tool_name}' not available for agent '{self.name}'."}

        tool_func = self.tools[tool_name]
        try:
            # Inject db session if required
            import inspect
            sig = inspect.signature(tool_func)
            if "db" in sig.parameters:
                kwargs["db"] = db

            result = tool_func(**kwargs)
            return result
        except Exception as e:
            return {"error": f"Error executing tool '{tool_name}': {str(e)}"}
