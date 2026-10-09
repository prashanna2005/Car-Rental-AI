from app.agents.base_agent import BaseAgent
from app.tools import sales_tools
from app.schemas.pydantic_schemas import AgentState
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import json

class SalesAgent(BaseAgent):
    def __init__(self):
        tools = {
            "search_available_cars": sales_tools.search_available_cars,
            "get_vehicle_details": sales_tools.get_vehicle_details,
            "calculate_rental_price": sales_tools.calculate_rental_price,
            "qualify_customer_lead": sales_tools.qualify_customer_lead,
            "create_booking_request": sales_tools.create_booking_request,
            "get_customer_booking_history": sales_tools.get_customer_booking_history
        }

        system_instruction = (
            "You are FleetIQ AI's Sales Agent. Your core role is to assist customers with rental inquiries, "
            "search available cars in the database, calculate precise rental pricing, qualify leads, and create "
            "validated booking requests. If vehicle maintenance conflicts arise, hand off to Operations Agent."
        )

        super().__init__(
            name="AI Sales Agent",
            role_description="Handles customer leads, car search, price calculation, and booking creation.",
            system_instruction=system_instruction,
            tools=tools
        )

    def run_step(self, db: Session, state: AgentState, run_id: str, step_num: int) -> Dict[str, Any]:
        """Execute Sales Agent logic, tool calls, and update state."""
        user_req = state.user_request.lower()

        # Step 1: Log entry
        self.log_event(
            db, run_id, state.conversation_id, step_num, "agent_active",
            "AI Sales Agent Activated", {"user_request": state.user_request}
        )

        # Check for specific search / booking intent
        category = None
        if "suv" in user_req:
            category = "SUV"
        elif "sedan" in user_req:
            category = "Sedan"
        elif "luxury" in user_req:
            category = "Luxury"
        elif "electric" in user_req or "ev" in user_req:
            category = "Electric"
        elif "truck" in user_req:
            category = "Truck"

        # Execute search_available_cars tool
        search_res = self.execute_tool(db, "search_available_cars", {"category": category})
        self.log_event(
            db, run_id, state.conversation_id, step_num + 1, "tool_call",
            "Called tool: search_available_cars", {"category": category, "result": search_res}
        )

        state.tool_results.append({
            "agent": self.name,
            "tool": "search_available_cars",
            "result": search_res
        })

        # Calculate price estimate if duration mentioned
        days = 3
        if "day" in user_req:
            for token in user_req.split():
                if token.isdigit():
                    days = int(token)
                    break

        if search_res.get("available_vehicles"):
            top_car = search_res["available_vehicles"][0]
            price_res = self.execute_tool(
                db, "calculate_rental_price",
                {"daily_rate": top_car["daily_rate"], "duration_days": days, "category": top_car["category"]}
            )

            self.log_event(
                db, run_id, state.conversation_id, step_num + 2, "tool_call",
                "Called tool: calculate_rental_price", {"vehicle": top_car["make"] + " " + top_car["model"], "days": days, "pricing": price_res}
            )

            state.tool_results.append({
                "agent": self.name,
                "tool": "calculate_rental_price",
                "result": price_res
            })

            rec = (
                f"Recommended Vehicle: {top_car['make']} {top_car['model']} ({top_car['category']}) - Reg: {top_car['registration_number']}. "
                f"Daily Rate: ${top_car['daily_rate']}/day. Estimated total for {days} days: ${price_res['total_price']} USD "
                f"(Includes ${price_res['refundable_deposit']} refundable deposit)."
            )
            state.findings.append({
                "agent": self.name,
                "finding": rec,
                "evidence": f"Found {search_res['count']} available vehicles matching criteria.",
                "confidence": "high"
            })
            state.recommended_actions.append({
                "type": "create_booking",
                "title": f"Create Booking for {top_car['make']} {top_car['model']}",
                "details": f"Vehicle ID: {top_car['id']}, Daily Rate: ${top_car['daily_rate']}"
            })
            finding_text = rec
        else:
            finding_text = f"No {category or 'matching'} vehicles currently available. Requesting Operations Agent for alternative fleet allocation."
            state.findings.append({
                "agent": self.name,
                "finding": finding_text,
                "evidence": "0 vehicles returned by database search.",
                "confidence": "high"
            })

        return {
            "status": "completed",
            "summary": finding_text
        }
