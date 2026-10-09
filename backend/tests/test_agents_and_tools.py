import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.models import Base, Vehicle, Customer, Booking, MaintenanceRecord, OperationalTask
from app.tools import sales_tools, analyst_tools, operations_tools
from app.agents.router import IntelligentRouter

TEST_DB_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db():
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Seed test vehicle
    v1 = Vehicle(
        id="v1", registration_number="TEST-SUV-01", make="Toyota", model="RAV4",
        year=2023, category="SUV", daily_rate=80.0, deposit_amount=200.0,
        location="Downtown", capacity=5, status="available", maintenance_status="good"
    )
    v2 = Vehicle(
        id="v2", registration_number="TEST-SUV-02", make="Jeep", model="Cherokee",
        year=2023, category="SUV", daily_rate=100.0, deposit_amount=250.0,
        location="Airport", capacity=5, status="maintenance", maintenance_status="in_repair"
    )
    c1 = Customer(id="c1", name="John Tester", email="john@test.com", phone="+15551234", driver_license="DL1234")

    session.add_all([v1, v2, c1])
    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=engine)


def test_calculate_rental_price():
    pricing = sales_tools.calculate_rental_price(daily_rate=100.0, duration_days=5)
    assert pricing["subtotal"] == 500.0
    assert pricing["total_price"] == 540.0 # Subtotal + 8% tax
    assert pricing["refundable_deposit"] == 250.0


def test_search_available_cars(db):
    res = sales_tools.search_available_cars(db, category="SUV")
    assert res["count"] == 1 # v2 is in maintenance, so only v1 available
    assert res["available_vehicles"][0]["registration_number"] == "TEST-SUV-01"


def test_booking_maintenance_rejection(db):
    res = sales_tools.create_booking_request(db, customer_id="c1", vehicle_id="v2", start_date="2026-10-10", end_date="2026-10-12")
    assert res["success"] is False
    assert "maintenance" in res["reason"].lower()


def test_operations_availability_check(db):
    avail1 = operations_tools.check_vehicle_availability(db, "v1", "2026-10-10", "2026-10-12")
    assert avail1["is_available"] is True

    avail2 = operations_tools.check_vehicle_availability(db, "v2", "2026-10-10", "2026-10-12")
    assert avail2["is_available"] is False


def test_router_intent_classification():
    router = IntelligentRouter()
    
    dec1 = router.classify_intent("Find an SUV for 3 days")
    assert dec1.selected_agents == ["sales"]

    dec2 = router.classify_intent("Our rental revenue has dropped this month. Find the reason and help us recover bookings.")
    assert dec2.selected_agents == ["data_analyst", "operations", "sales"]

    dec3 = router.classify_intent("Which cars require maintenance?")
    assert dec3.selected_agents == ["operations"]


def test_end_to_end_multi_agent_process(db):
    router = IntelligentRouter()
    result = router.process_request(db, "test-conv-001", "Our revenue dropped this month. Investigate cause and recover bookings.")
    
    assert "report" in result
    assert result["route_decision"]["selected_agents"] == ["data_analyst", "operations", "sales"]
    assert len(result["report"]["key_findings"]) >= 1
