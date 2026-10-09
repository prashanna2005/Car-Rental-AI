import os
import json
import random
from datetime import datetime, timedelta
from app.database.database import engine, SessionLocal, Base
from app.database.models import (
    Vehicle, Customer, Lead, Booking, MaintenanceRecord,
    OperationalTask, Conversation, AgentRun, AgentEvent, AnalysisReport
)

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("Seeding vehicles...")
        vehicles_data = [
            # SUVs
            {"reg": "FLT-SUV-101", "make": "Toyota", "model": "RAV4 Hybrid", "year": 2023, "cat": "SUV", "rate": 85.0, "cap": 5, "loc": "Downtown Hub", "status": "available", "maint": "good"},
            {"reg": "FLT-SUV-102", "make": "Honda", "model": "CR-V", "year": 2022, "cat": "SUV", "rate": 80.0, "cap": 5, "loc": "Airport Hub", "status": "available", "maint": "good"},
            {"reg": "FLT-SUV-103", "make": "Jeep", "model": "Grand Cherokee", "year": 2023, "cat": "SUV", "rate": 110.0, "cap": 5, "loc": "Downtown Hub", "status": "maintenance", "maint": "in_repair"},
            {"reg": "FLT-SUV-104", "make": "Ford", "model": "Explorer", "year": 2023, "cat": "SUV", "rate": 105.0, "cap": 7, "loc": "Westside Branch", "status": "maintenance", "maint": "needs_inspection"},
            {"reg": "FLT-SUV-105", "make": "BMW", "model": "X5", "year": 2024, "cat": "SUV", "rate": 160.0, "cap": 5, "loc": "Airport Hub", "status": "rented", "maint": "good"},
            {"reg": "FLT-SUV-106", "make": "Hyundai", "model": "Palisade", "year": 2023, "cat": "SUV", "rate": 95.0, "cap": 7, "loc": "Downtown Hub", "status": "available", "maint": "good"},

            # Sedans
            {"reg": "FLT-SED-201", "make": "Toyota", "model": "Camry", "year": 2023, "cat": "Sedan", "rate": 65.0, "cap": 5, "loc": "Downtown Hub", "status": "available", "maint": "good"},
            {"reg": "FLT-SED-202", "make": "Honda", "model": "Accord", "year": 2023, "cat": "Sedan", "rate": 68.0, "cap": 5, "loc": "Airport Hub", "status": "rented", "maint": "good"},
            {"reg": "FLT-SED-203", "make": "Nissan", "model": "Altima", "year": 2022, "cat": "Sedan", "rate": 58.0, "cap": 5, "loc": "Westside Branch", "status": "available", "maint": "good"},
            {"reg": "FLT-SED-204", "make": "Mazda", "model": "Mazda6", "year": 2022, "cat": "Sedan", "rate": 62.0, "cap": 5, "loc": "Downtown Hub", "status": "available", "maint": "good"},
            {"reg": "FLT-SED-205", "make": "Hyundai", "model": "Sonata", "year": 2023, "cat": "Sedan", "rate": 60.0, "cap": 5, "loc": "Airport Hub", "status": "available", "maint": "good"},

            # Luxury
            {"reg": "FLT-LUX-301", "make": "Mercedes-Benz", "model": "E-Class", "year": 2024, "cat": "Luxury", "rate": 195.0, "cap": 5, "loc": "Airport Hub", "status": "available", "maint": "good"},
            {"reg": "FLT-LUX-302", "make": "Audi", "model": "A6", "year": 2023, "cat": "Luxury", "rate": 180.0, "cap": 5, "loc": "Downtown Hub", "status": "rented", "maint": "good"},
            {"reg": "FLT-LUX-303", "make": "BMW", "model": "5 Series", "year": 2024, "cat": "Luxury", "rate": 190.0, "cap": 5, "loc": "Airport Hub", "status": "maintenance", "maint": "in_repair"},
            {"reg": "FLT-LUX-304", "make": "Porsche", "model": "Macan", "year": 2023, "cat": "Luxury", "rate": 220.0, "cap": 5, "loc": "Downtown Hub", "status": "available", "maint": "good"},

            # Electric
            {"reg": "FLT-EV-401", "make": "Tesla", "model": "Model Y", "year": 2024, "cat": "Electric", "rate": 120.0, "cap": 5, "loc": "Downtown Hub", "status": "available", "maint": "good"},
            {"reg": "FLT-EV-402", "make": "Tesla", "model": "Model 3", "year": 2023, "cat": "Electric", "rate": 95.0, "cap": 5, "loc": "Airport Hub", "status": "rented", "maint": "good"},
            {"reg": "FLT-EV-403", "make": "Hyundai", "model": "Ioniq 5", "year": 2023, "cat": "Electric", "rate": 100.0, "cap": 5, "loc": "Westside Branch", "status": "available", "maint": "good"},
            {"reg": "FLT-EV-404", "make": "Ford", "model": "Mustang Mach-E", "year": 2023, "cat": "Electric", "rate": 115.0, "cap": 5, "loc": "Downtown Hub", "status": "available", "maint": "good"},

            # Compact
            {"reg": "FLT-CMP-501", "make": "Volkswagen", "model": "Golf", "year": 2022, "cat": "Compact", "rate": 45.0, "cap": 5, "loc": "Downtown Hub", "status": "available", "maint": "good"},
            {"reg": "FLT-CMP-502", "make": "Toyota", "model": "Corolla", "year": 2023, "cat": "Compact", "rate": 48.0, "cap": 5, "loc": "Westside Branch", "status": "available", "maint": "good"},
            {"reg": "FLT-CMP-503", "make": "Honda", "model": "Civic", "year": 2023, "cat": "Compact", "rate": 50.0, "cap": 5, "loc": "Airport Hub", "status": "available", "maint": "good"},

            # Trucks
            {"reg": "FLT-TRK-601", "make": "Ford", "model": "F-150 Lightning", "year": 2023, "cat": "Truck", "rate": 130.0, "cap": 5, "loc": "Westside Branch", "status": "available", "maint": "good"},
            {"reg": "FLT-TRK-602", "make": "Chevrolet", "model": "Silverado", "year": 2022, "cat": "Truck", "rate": 125.0, "cap": 5, "loc": "Downtown Hub", "status": "available", "maint": "good"},
            {"reg": "FLT-TRK-603", "make": "RAM", "model": "1500", "year": 2023, "cat": "Truck", "rate": 135.0, "cap": 5, "loc": "Airport Hub", "status": "maintenance", "maint": "needs_inspection"}
        ]

        vehicles_map = {}
        for item in vehicles_data:
            v = Vehicle(
                registration_number=item["reg"],
                make=item["make"],
                model=item["model"],
                year=item["year"],
                category=item["cat"],
                daily_rate=item["rate"],
                deposit_amount=round(item["rate"] * 2.5, 2),
                location=item["loc"],
                capacity=item["cap"],
                status=item["status"],
                maintenance_status=item["maint"],
                odometer=random.randint(5000, 45000),
                fuel_level=random.choice([80.0, 90.0, 100.0])
            )
            db.add(v)
            vehicles_map[item["reg"]] = v

        db.flush()

        print("Seeding customers...")
        customers_data = [
            {"name": "Sarah Jenkins", "email": "sarah.j@techcorp.com", "phone": "+1 (555) 234-5678", "license": "DL-9847120", "rentals": 8, "status": "VIP"},
            {"name": "Marcus Vance", "email": "marcus.vance@gmail.com", "phone": "+1 (555) 876-5432", "license": "DL-4821039", "rentals": 4, "status": "active"},
            {"name": "Elena Rostova", "email": "elena.r@designstudio.io", "phone": "+1 (555) 345-6789", "license": "DL-1092837", "rentals": 2, "status": "active"},
            {"name": "David Chen", "email": "dchen@innovate.org", "phone": "+1 (555) 765-4321", "license": "DL-5738291", "rentals": 12, "status": "VIP"},
            {"name": "Rachel Adams", "email": "rachel.adams@venture.co", "phone": "+1 (555) 456-7890", "license": "DL-3829104", "rentals": 1, "status": "active"},
            {"name": "James Mitchell", "email": "jmitchell@globalexec.com", "phone": "+1 (555) 654-9870", "license": "DL-7482910", "rentals": 6, "status": "VIP"},
            {"name": "Sophia Martinez", "email": "smartinez@architects.net", "phone": "+1 (555) 987-1234", "license": "DL-2938471", "rentals": 3, "status": "active"},
        ]

        customers_list = []
        for c_data in customers_data:
            c = Customer(
                name=c_data["name"],
                email=c_data["email"],
                phone=c_data["phone"],
                driver_license=c_data["license"],
                total_rentals=c_data["rentals"],
                rating=4.9 if c_data["status"] == "VIP" else 4.7,
                status=c_data["status"]
            )
            db.add(c)
            customers_list.append(c)

        db.flush()

        print("Seeding leads...")
        leads_data = [
            {"name": "Alexander Wright", "email": "alex.w@summit.com", "phone": "+1 (555) 111-2233", "cat": "SUV", "budget": 400.0, "days": 4, "source": "Corporate Referral", "status": "qualified", "score": 88, "val": 400.0, "notes": "Needs premium SUV for corporate retreat next week."},
            {"name": "Jessica Taylor", "email": "jess.t@events.org", "phone": "+1 (555) 444-5566", "cat": "Luxury", "budget": 1000.0, "days": 5, "source": "Website Inquiry", "status": "new", "score": 75, "val": 1000.0, "notes": "Inquired about Porsche Macan or Audi A6 for wedding weekend."},
            {"name": "Brian Miller", "email": "bmiller@logistics.com", "phone": "+1 (555) 777-8899", "cat": "Truck", "budget": 650.0, "days": 5, "source": "Direct Call", "status": "qualified", "score": 82, "val": 650.0, "notes": "Requires Ford F-150 Lightning for field operations trip."},
            {"name": "Amanda Sterling", "email": "asterling@media.io", "phone": "+1 (555) 222-3344", "cat": "Electric", "budget": 350.0, "days": 3, "source": "Google Ad", "status": "new", "score": 65, "val": 350.0, "notes": "Interested in Tesla Model Y for coastal road trip."}
        ]
        for l_data in leads_data:
            today_str = datetime.now().strftime("%Y-%m-%d")
            l = Lead(
                customer_name=l_data["name"],
                email=l_data["email"],
                phone=l_data["phone"],
                requested_category=l_data["cat"],
                budget_max=l_data["budget"],
                duration_days=l_data["days"],
                start_date=today_str,
                lead_source=l_data["source"],
                lead_status=l_data["status"],
                qualification_score=l_data["score"],
                qualification_notes=l_data["notes"],
                estimated_value=l_data["val"]
            )
            db.add(l)

        print("Seeding historical bookings for multi-period trend analysis...")
        today = datetime.now()
        
        # Period 1: Two Months Ago (60-30 days ago) -> 35 high-utilization bookings
        # Period 2: Last Month (30-0 days ago peak) -> 42 high-utilization bookings ($52,000 revenue)
        # Period 3: Current Month (0-30 days present) -> Drop due to 4 SUVs in maintenance ($34,000 revenue)

        v_keys = list(vehicles_map.keys())

        # Generate realistic historical bookings for past 90 days
        for day_offset in range(90, 0, -1):
            booking_date = today - timedelta(days=day_offset)
            date_str = booking_date.strftime("%Y-%m-%d")
            end_date_str = (booking_date + timedelta(days=3)).strftime("%Y-%m-%d")

            # High volume in days 90-30, lower in recent 30 days
            if day_offset > 30:
                count_today = random.choice([1, 2, 2, 3])
            else:
                # Revenue drop scenario: Fewer bookings fulfilled because premium SUVs were out for repair
                count_today = random.choice([0, 1, 1, 2])

            for _ in range(count_today):
                v_reg = random.choice(v_keys)
                veh = vehicles_map[v_reg]
                cust = random.choice(customers_list)
                dur = random.choice([2, 3, 4, 5, 7])
                total = round(veh.daily_rate * dur, 2)
                ref = f"BK-{random.randint(10000, 99999)}"

                # Some cancellations in recent month
                if day_offset <= 30 and random.random() < 0.25:
                    status = "cancelled"
                    c_reason = "Vehicle unavailable / maintenance delay"
                else:
                    status = "completed" if day_offset > 5 else "active"
                    c_reason = None

                b = Booking(
                    booking_reference=ref,
                    customer_id=cust.id,
                    vehicle_id=veh.id,
                    start_date=date_str,
                    end_date=end_date_str,
                    duration_days=dur,
                    daily_rate=veh.daily_rate,
                    total_price=total,
                    deposit_paid=veh.deposit_amount,
                    status=status,
                    cancellation_reason=c_reason,
                    created_at=booking_date
                )
                db.add(b)

        print("Seeding active maintenance records and operational tasks...")

        m1 = MaintenanceRecord(
            vehicle_id=vehicles_map["FLT-SUV-103"].id,
            service_type="Transmission Repair",
            description="Severe shifting hesitation; awaiting replacement transmission torque converter.",
            cost=2450.0,
            start_date=(today - timedelta(days=12)).strftime("%Y-%m-%d"),
            status="in_progress",
            technician="Master Tech Fleet Services"
        )
        m2 = MaintenanceRecord(
            vehicle_id=vehicles_map["FLT-LUX-303"].id,
            service_type="Brake System Overhaul",
            description="Front rotor wear beyond tolerance; ABS sensor fault code.",
            cost=1200.0,
            start_date=(today - timedelta(days=5)).strftime("%Y-%m-%d"),
            status="in_progress",
            technician="Apex Euro Mechanics"
        )
        m3 = MaintenanceRecord(
            vehicle_id=vehicles_map["FLT-SUV-104"].id,
            service_type="Scheduled 30,000 Mi Service",
            description="Routine multi-point safety inspection & fluid flush.",
            cost=350.0,
            start_date=(today - timedelta(days=2)).strftime("%Y-%m-%d"),
            status="scheduled",
            technician="Downtown QuickCare"
        )
        db.add_all([m1, m2, m3])

        t1 = OperationalTask(
            title="Accelerate Parts Delivery for FLT-SUV-103",
            description="Follow up with Jeep dealership supplier regarding torque converter backorder to restore high-margin SUV to available fleet.",
            priority="urgent",
            status="in_progress",
            assigned_role="Fleet Operations Manager",
            related_vehicle_id=vehicles_map["FLT-SUV-103"].id,
            due_date=(today + timedelta(days=1)).strftime("%Y-%m-%d")
        )
        t2 = OperationalTask(
            title="Reassign Customer Booking from FLT-LUX-303 to FLT-LUX-301",
            description="FLT-LUX-303 undergoing brake repair. Contact customer Marcus Vance to confirm upgrade to Mercedes E-Class.",
            priority="high",
            status="pending",
            assigned_role="Sales & Ops Specialist",
            related_vehicle_id=vehicles_map["FLT-LUX-303"].id,
            due_date=today.strftime("%Y-%m-%d")
        )
        t3 = OperationalTask(
            title="Conduct Fleet Fuel & Battery Audit",
            description="Ensure all EV units (Tesla Model Y, Mustang Mach-E) are charged to 100% prior to weekend rentals.",
            priority="medium",
            status="pending",
            assigned_role="Turnaround Supervisor",
            due_date=(today + timedelta(days=2)).strftime("%Y-%m-%d")
        )
        db.add_all([t1, t2, t3])

        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
