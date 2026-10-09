import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.schemas.pydantic_schemas import AgentState, RouteDecision, FinalReport, KeyFinding
from app.agents.sales_agent import SalesAgent
from app.agents.analyst_agent import AnalystAgent
from app.agents.operations_agent import OperationsAgent
from app.database.models import AgentRun, AgentEvent, Conversation
from app.core.config import settings
import uuid

class IntelligentRouter:
    def __init__(self):
        self.sales_agent = SalesAgent()
        self.analyst_agent = AnalystAgent()
        self.operations_agent = OperationsAgent()

    def classify_intent(self, request_text: str) -> RouteDecision:
        """Classify user request intent into agent handoff sequence."""
        req_lower = request_text.lower()

        # Multi-Agent Investigation Scenario: Revenue Drop / Low Bookings
        if ("revenue" in req_lower and ("drop" in req_lower or "decrease" in req_lower or "why" in req_lower or "fall" in req_lower or "recover" in req_lower)) \
           or ("booking" in req_lower and ("decrease" in req_lower or "drop" in req_lower or "recover" in req_lower or "investigate" in req_lower)):
            return RouteDecision(
                selected_agents=["data_analyst", "operations", "sales"],
                reasoning="Complex business inquiry requiring multi-agent collaboration: Data Analyst for metric root-cause analysis -> Operations for fleet maintenance check -> Sales for booking recovery actions.",
                investigation_plan=[
                    "Step 1: Data Analyst compares current vs prior month metrics and identifies anomalies.",
                    "Step 2: Operations checks active vehicle maintenance backlogs and fleet downtime.",
                    "Step 3: Sales recommends fleet recovery strategies and lead follow-up campaigns."
                ],
                hand_off_sequence=["data_analyst", "operations", "sales"]
            )

        # Multi-Agent Scenario: Maintenance conflict for customer booking
        if ("maintenance" in req_lower and ("alternative" in req_lower or "customer" in req_lower or "booking" in req_lower or "replace" in req_lower)):
            return RouteDecision(
                selected_agents=["operations", "sales"],
                reasoning="Maintenance conflict on customer booking. Operations verifies vehicle status -> Sales searches alternative and updates booking.",
                investigation_plan=[
                    "Step 1: Operations checks affected vehicle maintenance status.",
                    "Step 2: Sales searches available alternative vehicles and calculates pricing."
                ],
                hand_off_sequence=["operations", "sales"]
            )

        # Analyst intent
        if any(k in req_lower for k in ["revenue", "analytics", "trend", "utilization", "metric", "report", "cancellation rate", "profit"]):
            return RouteDecision(
                selected_agents=["data_analyst"],
                reasoning="Query regarding business metrics, financial trends, or fleet utilization analytics.",
                investigation_plan=["Step 1: Data Analyst extracts database metrics and generates report."],
                hand_off_sequence=["data_analyst"]
            )

        # Operations intent
        if any(k in req_lower for k in ["maintenance", "repair", "overdue", "task", "technician", "fleet status", "inspection"]):
            return RouteDecision(
                selected_agents=["operations"],
                reasoning="Query regarding operational status, vehicle maintenance, or technician tasks.",
                investigation_plan=["Step 1: Operations agent assesses fleet status and updates task records."],
                hand_off_sequence=["operations"]
            )

        # Default: Sales intent
        return RouteDecision(
            selected_agents=["sales"],
            reasoning="Query regarding vehicle availability, price quotes, or customer rental bookings.",
            investigation_plan=["Step 1: Sales agent searches matching vehicles and calculates rental price."],
            hand_off_sequence=["sales"]
        )

    def process_request(self, db: Session, conversation_id: str, user_request: str) -> Dict[str, Any]:
        """Execute full router orchestration, multi-agent handoffs, and return final structured report."""
        # Ensure conversation exists
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            conv = Conversation(id=conversation_id, title=user_request[:40])
            db.add(conv)
            db.commit()

        # Step 1: Route Decision
        route_decision = self.classify_intent(user_request)

        # Create AgentRun entry
        run = AgentRun(
            conversation_id=conversation_id,
            user_request=user_request,
            initial_agent=route_decision.selected_agents[0] if route_decision.selected_agents else "sales",
            status="running"
        )
        db.add(run)
        db.commit()

        # Log Routing Event
        router_event = AgentEvent(
            agent_run_id=run.id,
            conversation_id=conversation_id,
            step_number=1,
            agent_name="Intelligent Router",
            event_type="routing",
            title=f"Routed Request to [{', '.join(route_decision.selected_agents)}]",
            details_json=json.dumps({
                "reasoning": route_decision.reasoning,
                "plan": route_decision.investigation_plan,
                "sequence": route_decision.hand_off_sequence
            })
        )
        db.add(router_event)
        db.commit()

        # Initialize Shared Agent State
        state = AgentState(
            conversation_id=conversation_id,
            user_request=user_request,
            selected_agents=route_decision.selected_agents,
            investigation_plan=route_decision.investigation_plan
        )

        step_counter = 2
        handoff_log = []

        # Execute Hand-off Sequence (Max 5 steps safety cap)
        for idx, agent_code in enumerate(route_decision.hand_off_sequence[:5]):
            state.current_agent = agent_code

            if agent_code == "data_analyst":
                res = self.analyst_agent.run_step(db, state, run.id, step_counter)
            elif agent_code == "operations":
                res = self.operations_agent.run_step(db, state, run.id, step_counter)
            elif agent_code == "sales":
                res = self.sales_agent.run_step(db, state, run.id, step_counter)

            step_counter += 3

            # Record handoff if next agent exists
            if idx < len(route_decision.hand_off_sequence) - 1:
                next_agent = route_decision.hand_off_sequence[idx + 1]
                handoff_entry = {
                    "from_agent": agent_code,
                    "to_agent": next_agent,
                    "reason": f"Handoff findings to {next_agent} for operational execution.",
                    "findings_passed": res.get("summary")
                }
                state.handoff_history.append(handoff_entry)
                
                handoff_event = AgentEvent(
                    agent_run_id=run.id,
                    conversation_id=conversation_id,
                    step_number=step_counter,
                    agent_name="Intelligent Router",
                    event_type="handoff",
                    title=f"Handoff: {agent_code.upper()} ➔ {next_agent.upper()}",
                    details_json=json.dumps(handoff_entry)
                )
                db.add(handoff_event)
                db.commit()
                step_counter += 1

        run.status = "completed"
        db.commit()

        # Compile Final Structured Report
        key_findings = [
            KeyFinding(
                finding=f["finding"],
                evidence=f["evidence"],
                confidence=f.get("confidence", "high")
            ) for f in state.findings
        ]

        if not key_findings:
            key_findings.append(KeyFinding(
                finding="Request processed successfully.",
                evidence="All deterministic business database queries executed.",
                confidence="high"
            ))

        recs = [
            "Expedite SUV maintenance turnaround to restore primary revenue-generating fleet.",
            "Contact corporate leads for alternative available vehicle categories (Sedan / Luxury).",
            "Monitor vehicle availability and enforce preventative maintenance schedule."
        ]

        report = FinalReport(
            request=user_request,
            selected_agents=route_decision.selected_agents,
            summary=state.findings[0]["finding"] if state.findings else "Multi-agent collaboration complete.",
            key_findings=key_findings,
            metrics=state.business_metrics,
            recommendations=recs,
            actions_created=state.completed_actions,
            pending_approvals=state.recommended_actions,
            limitations=["Calculations based on actual stored database records up to current timestamp."]
        )

        state.final_response = report.model_dump_json()

        # Log Final Report Event
        report_event = AgentEvent(
            agent_run_id=run.id,
            conversation_id=conversation_id,
            step_number=step_counter + 1,
            agent_name="Intelligent Router",
            event_type="report",
            title="Final Multi-Agent Executive Report Generated",
            details_json=report.model_dump_json()
        )
        db.add(report_event)
        db.commit()

        return {
            "run_id": run.id,
            "conversation_id": conversation_id,
            "route_decision": route_decision.model_dump(),
            "report": report.model_dump(),
            "tool_execution_history": state.tool_results,
            "handoff_history": state.handoff_history
        }
