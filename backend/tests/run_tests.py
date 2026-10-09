import unittest
import os
import sys

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.models import Base, Vehicle, Customer, Booking, MaintenanceRecord, OperationalTask
from app.tools import sales_tools, analyst_tools, operations_tools
from app.agents.router import IntelligentRouter

class TestFleetIQBackend(unittest.TestCase):
    def setUp(self):
        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()

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

        self.db.add_all([v1, v2, c1])
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_1_calculate_rental_price(self):
        pricing = sales_tools.calculate_rental_price(daily_rate=100.0, duration_days=5)
        self.assertEqual(pricing["subtotal"], 500.0)
        self.assertEqual(pricing["total_price"], 540.0) # Subtotal + 8% tax
        self.assertEqual(pricing["refundable_deposit"], 250.0)
        print("✓ test_1_calculate_rental_price PASSED")

    def test_2_search_available_cars(self):
        res = sales_tools.search_available_cars(self.db, category="SUV")
        self.assertEqual(res["count"], 1)
        self.assertEqual(res["available_vehicles"][0]["registration_number"], "TEST-SUV-01")
        print("✓ test_2_search_available_cars PASSED")

    def test_3_booking_maintenance_rejection(self):
        res = sales_tools.create_booking_request(self.db, customer_id="c1", vehicle_id="v2", start_date="2026-10-10", end_date="2026-10-12")
        self.assertFalse(res["success"])
        self.assertIn("maintenance", res["reason"].lower())
        print("✓ test_3_booking_maintenance_rejection PASSED")

    def test_4_operations_availability_check(self):
        avail1 = operations_tools.check_vehicle_availability(self.db, "v1", "2026-10-10", "2026-10-12")
        self.assertTrue(avail1["is_available"])

        avail2 = operations_tools.check_vehicle_availability(self.db, "v2", "2026-10-10", "2026-10-12")
        self.assertFalse(avail2["is_available"])
        print("✓ test_4_operations_availability_check PASSED")

    def test_5_router_intent_classification(self):
        router = IntelligentRouter()
        
        dec1 = router.classify_intent("Find an SUV for 3 days")
        self.assertEqual(dec1.selected_agents, ["sales"])

        dec2 = router.classify_intent("Our rental revenue has dropped this month. Find the reason and help us recover bookings.")
        self.assertEqual(dec2.selected_agents, ["data_analyst", "operations", "sales"])

        dec3 = router.classify_intent("Which cars require maintenance?")
        self.assertEqual(dec3.selected_agents, ["operations"])
        print("✓ test_5_router_intent_classification PASSED")

    def test_6_end_to_end_multi_agent_process(self):
        router = IntelligentRouter()
        result = router.process_request(self.db, "test-conv-001", "Our revenue dropped this month. Investigate cause and recover bookings.")
        
        self.assertIn("report", result)
        self.assertEqual(result["route_decision"]["selected_agents"], ["data_analyst", "operations", "sales"])
        self.assertGreaterEqual(len(result["report"]["key_findings"]), 1)
        print("✓ test_6_end_to_end_multi_agent_process PASSED")

if __name__ == "__main__":
    unittest.main()
