from app.agents.base_agent import BaseAgent
from app.tools import operations_tools
from app.schemas.pydantic_schemas import AgentState
from sqlalchemy.orm import Session
from typing import Dict, Any, List

class OperationsAgent(BaseAgent):
    def __init__(self):
        tools = {
            "get_fleet_status": operations_tools.get_fleet_status,
            "check_vehicle_availability": operations_tools.check_vehicle_availability,
            "get_maintenance_records": operations_tools.get_maintenance_records,
            "create_maintenance_task": operations_tools.create_maintenance_task,
            "create_operational_task": operations_tools.create_operational_task,
            "update_vehicle_status": operations_tools.update_vehicle_status,
            "get_overdue_rentals": operations_tools.get_overdue_rentals,
            "find_alternative_vehicles": operations_tools.find_alternative_vehicles
        }

        system_instruction = (
            "You are FleetIQ AI's Operations Agent. Your responsibility is to monitor fleet status, manage "
            "maintenance tasks, verify operational readiness, create maintenance/operational tasks, resolve "
            "vehicle availability bottlenecks, and find alternative available vehicles for affected bookings."
        )

        super().__init__(
            name="AI Operations Agent",
            role_description="Manages vehicle readiness, maintenance records, operational tasks, and fleet allocation.",
            system_instruction=system_instruction,
            tools=tools
        )

    def run_step(self, db: Session, state: AgentState, run_id: str, step_num: int) -> Dict[str, Any]:
        """Execute Operations Agent logic."""
        self.log_event(
            db, run_id, state.conversation_id, step_num, "agent_active",
            "AI Operations Agent Activated", {"user_request": state.user_request}
        )

        # Tool 1: Get fleet status
        fleet_res = self.execute_tool(db, "get_fleet_status", {})
        self.log_event(
            db, run_id, state.conversation_id, step_num + 1, "tool_call",
            "Called tool: get_fleet_status", {"result": fleet_res}
        )
        state.tool_results.append({
            "agent": self.name,
            "tool": "get_fleet_status",
            "result": fleet_res
        })

        # Tool 2: Get maintenance records
        maint_res = self.execute_tool(db, "get_maintenance_records", {"status": "in_progress"})
        state.tool_results.append({
            "agent": self.name,
            "tool": "get_maintenance_records",
            "result": maint_res
        })

        # Tool 3: Expedite maintenance operational task creation
        task_res = self.execute_tool(
            db, "create_operational_task",
            {
                "title": "Expedite High-Priority SUV Maintenance & Turnaround",
                "description": "Authorize expedited parts delivery and priority technician shift to restore offline SUVs (FLT-SUV-103) to active status.",
                "priority": "urgent",
                "assigned_role": "Lead Fleet Technician"
            }
        )
        self.log_event(
            db, run_id, state.conversation_id, step_num + 2, "tool_call",
            "Called tool: create_operational_task", {"result": task_res}
        )
        state.tool_results.append({
            "agent": self.name,
            "tool": "create_operational_task",
            "result": task_res
        })

        # Tool 4: Find alternative vehicles for sales recovery
        alt_res = self.execute_tool(db, "find_alternative_vehicles", {"category": "SUV", "start_date": "2026-10-10", "end_date": "2026-10-15"})
        state.tool_results.append({
            "agent": self.name,
            "tool": "find_alternative_vehicles",
            "result": alt_res
        })

        # Findings
        maint_count = fleet_res.get("maintenance_count", 0)
        f1 = (
            f"Fleet Operational Assessment: {fleet_res.get('available_count')} vehicles currently available, "
            f"{fleet_res.get('rented_count')} rented, and {maint_count} in maintenance repair. "
            f"Created urgent operational task #{task_res.get('task_id', 'N/A')} to expedite SUV repair."
        )

        state.findings.append({
            "agent": self.name,
            "finding": f1,
            "evidence": f"Found {maint_count} vehicles offline in active maintenance records.",
            "confidence": "high"
        })

        state.completed_actions.append({
            "action_id": task_res.get("task_id"),
            "agent": self.name,
            "title": task_res.get("title"),
            "status": "created"
        })

        return {
            "status": "completed",
            "summary": f1
        }
