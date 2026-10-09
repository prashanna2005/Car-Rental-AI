from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# Router Schemas
class RouteDecision(BaseModel):
    selected_agents: List[str] = Field(..., description="List of agents chosen to handle the request ('sales', 'data_analyst', 'operations')")
    reasoning: str = Field(..., description="Explanation for agent selection")
    investigation_plan: List[str] = Field(default=[], description="Structured multi-step execution plan")
    hand_off_sequence: List[str] = Field(default=[], description="Order of agent execution handoffs")
    needs_clarification: bool = Field(default=False, description="True if essential user information is missing")
    clarification_prompt: Optional[str] = Field(default=None, description="Question for the user if info is missing")

# Agent State
class AgentState(BaseModel):
    conversation_id: str
    user_request: str
    selected_agents: List[str] = []
    current_agent: str = "router"
    investigation_plan: List[str] = []
    rental_dates: Dict[str, str] = {}
    customer_requirements: Dict[str, Any] = {}
    relevant_vehicle_ids: List[str] = []
    relevant_booking_ids: List[str] = []
    tool_results: List[Dict[str, Any]] = []
    business_metrics: Dict[str, Any] = {}
    findings: List[Dict[str, Any]] = []
    handoff_history: List[Dict[str, Any]] = []
    recommended_actions: List[Dict[str, Any]] = []
    completed_actions: List[Dict[str, Any]] = []
    pending_approvals: List[Dict[str, Any]] = []
    limitations: List[str] = []
    final_response: Optional[str] = None

# Structured Report Schema
class KeyFinding(BaseModel):
    finding: str
    evidence: str
    confidence: str = "high" # high, medium, low

class FinalReport(BaseModel):
    request: str
    selected_agents: List[str]
    summary: str
    key_findings: List[KeyFinding]
    metrics: Dict[str, Any] = {}
    recommendations: List[str] = []
    actions_created: List[Dict[str, Any]] = []
    pending_approvals: List[Dict[str, Any]] = []
    limitations: List[str] = []

# Tool Execution Record
class ToolExecutionRecord(BaseModel):
    tool_name: str
    agent_name: str
    arguments: Dict[str, Any]
    result: Dict[str, Any]
    status: str = "success"

# API DTO Schemas
class VehicleDTO(BaseModel):
    id: str
    registration_number: str
    make: str
    model: str
    year: int
    category: str
    daily_rate: float
    deposit_amount: float
    location: str
    capacity: int
    status: str
    maintenance_status: str
    odometer: int
    fuel_level: float

class BookingCreateRequest(BaseModel):
    customer_id: str
    vehicle_id: str
    start_date: str
    end_date: str

class LeadCreateRequest(BaseModel):
    customer_name: str
    email: str
    phone: str
    requested_category: str
    budget_max: float
    duration_days: int
    start_date: str
    lead_source: Optional[str] = "Website Enquiry"

class TaskCreateRequest(BaseModel):
    title: str
    description: str
    priority: str = "medium"
    assigned_role: str = "Operations Specialist"
    related_vehicle_id: Optional[str] = None
    related_booking_id: Optional[str] = None
    due_date: Optional[str] = None
