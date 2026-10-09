from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, default=generate_uuid)
    registration_number = Column(String, unique=True, nullable=False, index=True)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    category = Column(String, nullable=False, index=True) # SUV, Sedan, Luxury, Electric, Compact, Truck
    daily_rate = Column(Float, nullable=False)
    deposit_amount = Column(Float, nullable=False, default=200.0)
    location = Column(String, nullable=False, default="Downtown Hub")
    capacity = Column(Integer, nullable=False, default=5)
    status = Column(String, nullable=False, default="available") # available, rented, maintenance, reserved
    maintenance_status = Column(String, nullable=False, default="good") # good, needs_inspection, in_repair
    odometer = Column(Integer, default=15000)
    fuel_level = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    bookings = relationship("Booking", back_populates="vehicle")
    maintenance_records = relationship("MaintenanceRecord", back_populates="vehicle")
    operational_tasks = relationship("OperationalTask", back_populates="vehicle")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=False)
    driver_license = Column(String, nullable=False)
    total_rentals = Column(Integer, default=0)
    rating = Column(Float, default=5.0)
    status = Column(String, default="active") # active, VIP, suspended
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="customer")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String, primary_key=True, default=generate_uuid)
    customer_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    requested_category = Column(String, nullable=False)
    budget_max = Column(Float, nullable=False)
    duration_days = Column(Integer, nullable=False)
    start_date = Column(String, nullable=False)
    lead_source = Column(String, default="Website Enquiry")
    lead_status = Column(String, default="new") # new, qualified, converted, lost
    qualification_score = Column(Integer, default=70)
    qualification_notes = Column(Text, nullable=True)
    estimated_value = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=generate_uuid)
    booking_reference = Column(String, unique=True, nullable=False, index=True)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    start_date = Column(String, nullable=False) # YYYY-MM-DD
    end_date = Column(String, nullable=False) # YYYY-MM-DD
    duration_days = Column(Integer, nullable=False)
    daily_rate = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    deposit_paid = Column(Float, default=0.0)
    status = Column(String, default="confirmed") # pending, confirmed, active, completed, cancelled
    cancellation_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="bookings")
    vehicle = relationship("Vehicle", back_populates="bookings")


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    service_type = Column(String, nullable=False) # Brake Inspection, Oil Change, Engine Diagnostic, Tire Replacement, Detailing
    description = Column(Text, nullable=False)
    cost = Column(Float, nullable=False, default=0.0)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=True)
    status = Column(String, default="scheduled") # scheduled, in_progress, completed, cancelled
    technician = Column(String, default="Master Tech Fleet Services")
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="maintenance_records")


class OperationalTask(Base):
    __tablename__ = "operational_tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, default="medium") # low, medium, high, urgent
    status = Column(String, default="pending") # pending, in_progress, completed, cancelled
    assigned_role = Column(String, default="Operations Specialist")
    related_vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=True)
    related_booking_id = Column(String, ForeignKey("bookings.id"), nullable=True)
    due_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="operational_tasks")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False, default="Business Inquiry")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    runs = relationship("AgentRun", back_populates="conversation")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    user_request = Column(Text, nullable=False)
    initial_agent = Column(String, nullable=False)
    status = Column(String, default="completed") # running, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="runs")
    events = relationship("AgentEvent", back_populates="agent_run")


class AgentEvent(Base):
    __tablename__ = "agent_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    agent_run_id = Column(String, ForeignKey("agent_runs.id"), nullable=False)
    conversation_id = Column(String, nullable=False)
    step_number = Column(Integer, nullable=False)
    agent_name = Column(String, nullable=False)
    event_type = Column(String, nullable=False) # routing, tool_call, tool_result, handoff, report
    title = Column(String, nullable=False)
    details_json = Column(Text, nullable=False) # JSON encoded data
    created_at = Column(DateTime, default=datetime.utcnow)

    agent_run = relationship("AgentRun", back_populates="events")


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    timeframe = Column(String, nullable=False)
    key_findings_json = Column(Text, nullable=False)
    metrics_json = Column(Text, nullable=False)
    recommendations_json = Column(Text, nullable=False)
    actions_taken_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
