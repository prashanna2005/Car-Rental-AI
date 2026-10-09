from app.agents.base_agent import BaseAgent
from app.tools import analyst_tools
from app.schemas.pydantic_schemas import AgentState
from sqlalchemy.orm import Session
from typing import Dict, Any, List

class AnalystAgent(BaseAgent):
    def __init__(self):
        tools = {
            "get_business_metrics": analyst_tools.get_business_metrics,
            "compare_business_periods": analyst_tools.compare_business_periods,
            "analyze_vehicle_utilization": analyst_tools.analyze_vehicle_utilization,
            "analyze_booking_trends": analyst_tools.analyze_booking_trends,
            "detect_business_anomalies": analyst_tools.detect_business_anomalies,
            "get_revenue_breakdown": analyst_tools.get_revenue_breakdown,
            "generate_analysis_report": analyst_tools.generate_analysis_report
        }

        system_instruction = (
            "You are FleetIQ AI's Data Analyst Agent. Your responsibility is to analyze rental metrics, "
            "investigate revenue drops or utilization declines from stored database records, detect anomalies, "
            "and quantify exact financial and operational impacts. Share evidence with Operations and Sales."
        )

        super().__init__(
            name="AI Data Analyst Agent",
            role_description="Analyzes revenue, utilization, bookings, period comparisons, and business anomalies.",
            system_instruction=system_instruction,
            tools=tools
        )

    def run_step(self, db: Session, state: AgentState, run_id: str, step_num: int) -> Dict[str, Any]:
        """Execute Data Analyst Agent analysis logic."""
        self.log_event(
            db, run_id, state.conversation_id, step_num, "agent_active",
            "AI Data Analyst Agent Activated", {"user_request": state.user_request}
        )

        # Tool 1: Compare periods
        comp_res = self.execute_tool(db, "compare_business_periods", {})
        self.log_event(
            db, run_id, state.conversation_id, step_num + 1, "tool_call",
            "Called tool: compare_business_periods", {"result": comp_res}
        )
        state.tool_results.append({
            "agent": self.name,
            "tool": "compare_business_periods",
            "result": comp_res
        })

        # Tool 2: Detect anomalies
        anomaly_res = self.execute_tool(db, "detect_business_anomalies", {})
        self.log_event(
            db, run_id, state.conversation_id, step_num + 2, "tool_call",
            "Called tool: detect_business_anomalies", {"result": anomaly_res}
        )
        state.tool_results.append({
            "agent": self.name,
            "tool": "detect_business_anomalies",
            "result": anomaly_res
        })

        # Tool 3: Vehicle utilization breakdown
        util_res = self.execute_tool(db, "analyze_vehicle_utilization", {})
        state.tool_results.append({
            "agent": self.name,
            "tool": "analyze_vehicle_utilization",
            "result": util_res
        })

        # Generate report
        report_res = self.execute_tool(db, "generate_analysis_report", {"title": "Revenue & Fleet Downtime Root-Cause Report"})
        state.tool_results.append({
            "agent": self.name,
            "tool": "generate_analysis_report",
            "result": report_res
        })

        # Store metrics in shared state
        state.business_metrics = comp_res

        # Findings
        rev_change = comp_res.get("revenue_change_pct", 0)
        abs_change = comp_res.get("revenue_change_usd", 0)

        f1 = (
            f"Financial Analysis: Revenue dropped by {rev_change}% (${abs(abs_change)} USD) in the current month compared to the previous month. "
            f"Booking cancellations increased by {comp_res.get('cancellation_increase', 0)} bookings."
        )
        state.findings.append({
            "agent": self.name,
            "finding": f1,
            "evidence": f"Calculated from stored DB records: Period 1 Revenue = ${comp_res.get('period1_revenue')}, Period 2 Revenue = ${comp_res.get('period2_revenue')}.",
            "confidence": "high"
        })

        if anomaly_res.get("anomalies"):
            anom_desc = anomaly_res["anomalies"][0]["description"]
            f2 = f"Root-Cause Anomaly Identified: {anom_desc}"
            state.findings.append({
                "agent": self.name,
                "finding": f2,
                "evidence": anomaly_res["anomalies"][0]["impact"],
                "confidence": "high"
            })

        return {
            "status": "completed",
            "summary": f1
        }
