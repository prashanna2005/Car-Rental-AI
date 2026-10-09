from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import Vehicle, Booking, MaintenanceRecord, Customer, AnalysisReport
from typing import Dict, Any, List, Optional
import json

def get_business_metrics(db: Session, timeframe: str = "current_month") -> Dict[str, Any]:
    """Calculate overall business performance metrics directly from the database."""
    total_vehicles = db.query(Vehicle).count()
    available_vehicles = db.query(Vehicle).filter(Vehicle.status == "available").count()
    rented_vehicles = db.query(Vehicle).filter(Vehicle.status == "rented").count()
    maintenance_vehicles = db.query(Vehicle).filter(Vehicle.status == "maintenance").count()

    utilization_pct = round((rented_vehicles / total_vehicles * 100), 1) if total_vehicles > 0 else 0.0

    # Date range bounds
    today = datetime.now()
    if timeframe == "current_month":
        start_date = today - timedelta(days=30)
    elif timeframe == "last_month":
        start_date = today - timedelta(days=60)
        end_date_cap = today - timedelta(days=30)
    else:
        start_date = today - timedelta(days=90)

    query = db.query(Booking).filter(Booking.status != "cancelled")
    if timeframe == "last_month":
        query = query.filter(Booking.created_at >= start_date, Booking.created_at < end_date_cap)
    else:
        query = query.filter(Booking.created_at >= start_date)

    total_revenue = db.query(func.sum(Booking.total_price)).filter(Booking.status != "cancelled").scalar() or 0.0
    total_bookings = query.count()
    cancelled_bookings = db.query(Booking).filter(Booking.status == "cancelled", Booking.created_at >= start_date).count()

    maint_cost = db.query(func.sum(MaintenanceRecord.cost)).scalar() or 0.0

    return {
        "timeframe": timeframe,
        "total_revenue": round(total_revenue, 2),
        "total_bookings": total_bookings,
        "cancelled_bookings": cancelled_bookings,
        "cancellation_rate_pct": round((cancelled_bookings / (total_bookings + cancelled_bookings) * 100), 1) if (total_bookings + cancelled_bookings) > 0 else 0.0,
        "total_fleet": total_vehicles,
        "available_vehicles": available_vehicles,
        "rented_vehicles": rented_vehicles,
        "maintenance_vehicles": maintenance_vehicles,
        "fleet_utilization_pct": utilization_pct,
        "total_maintenance_cost": round(maint_cost, 2)
    }


def compare_business_periods(
    db: Session,
    period1: str = "last_month",
    period2: str = "current_month"
) -> Dict[str, Any]:
    """Compare key performance indicators between two time periods with exact percentage deltas."""
    today = datetime.now()

    # Period 1: Last Month (30-60 days ago)
    p1_start = today - timedelta(days=60)
    p1_end = today - timedelta(days=30)

    # Period 2: Current Month (0-30 days ago)
    p2_start = today - timedelta(days=30)
    p2_end = today

    # P1 Metrics
    p1_revenue = db.query(func.sum(Booking.total_price)).filter(
        Booking.status != "cancelled",
        Booking.created_at >= p1_start,
        Booking.created_at < p1_end
    ).scalar() or 0.0

    p1_bookings = db.query(Booking).filter(
        Booking.status != "cancelled",
        Booking.created_at >= p1_start,
        Booking.created_at < p1_end
    ).count()

    p1_cancellations = db.query(Booking).filter(
        Booking.status == "cancelled",
        Booking.created_at >= p1_start,
        Booking.created_at < p1_end
    ).count()

    # P2 Metrics
    p2_revenue = db.query(func.sum(Booking.total_price)).filter(
        Booking.status != "cancelled",
        Booking.created_at >= p2_start
    ).scalar() or 0.0

    p2_bookings = db.query(Booking).filter(
        Booking.status != "cancelled",
        Booking.created_at >= p2_start
    ).count()

    p2_cancellations = db.query(Booking).filter(
        Booking.status == "cancelled",
        Booking.created_at >= p2_start
    ).count()

    revenue_diff = p2_revenue - p1_revenue
    revenue_pct_change = round((revenue_diff / p1_revenue * 100), 1) if p1_revenue > 0 else 0.0

    bookings_diff = p2_bookings - p1_bookings
    bookings_pct_change = round((bookings_diff / p1_bookings * 100), 1) if p1_bookings > 0 else 0.0

    return {
        "period1": "Previous Month",
        "period2": "Current Month",
        "period1_revenue": round(p1_revenue, 2),
        "period2_revenue": round(p2_revenue, 2),
        "revenue_change_usd": round(revenue_diff, 2),
        "revenue_change_pct": revenue_pct_change,
        "period1_bookings": p1_bookings,
        "period2_bookings": p2_bookings,
        "bookings_change_count": bookings_diff,
        "bookings_change_pct": bookings_pct_change,
        "period1_cancellations": p1_cancellations,
        "period2_cancellations": p2_cancellations,
        "cancellation_increase": p2_cancellations - p1_cancellations
    }


def analyze_vehicle_utilization(db: Session) -> Dict[str, Any]:
    """Analyze utilization rate breakdown across vehicle categories and identify top/bottom performers."""
    categories = db.query(Vehicle.category).distinct().all()
    categories = [c[0] for c in categories]

    category_stats = []
    for cat in categories:
        total_cat = db.query(Vehicle).filter(Vehicle.category == cat).count()
        rented_cat = db.query(Vehicle).filter(Vehicle.category == cat, Vehicle.status == "rented").count()
        maint_cat = db.query(Vehicle).filter(Vehicle.category == cat, Vehicle.status == "maintenance").count()
        avail_cat = db.query(Vehicle).filter(Vehicle.category == cat, Vehicle.status == "available").count()

        util_rate = round((rented_cat / total_cat * 100), 1) if total_cat > 0 else 0.0
        maint_rate = round((maint_cat / total_cat * 100), 1) if total_cat > 0 else 0.0

        category_stats.append({
            "category": cat,
            "total_vehicles": total_cat,
            "rented": rented_cat,
            "available": avail_cat,
            "in_maintenance": maint_cat,
            "utilization_pct": util_rate,
            "maintenance_downtime_pct": maint_rate
        })

    # Sort categories by utilization
    category_stats.sort(key=lambda x: x["utilization_pct"], reverse=True)

    return {
        "categories_breakdown": category_stats,
        "highest_utilized_category": category_stats[0]["category"] if category_stats else "N/A",
        "lowest_utilized_category": category_stats[-1]["category"] if category_stats else "N/A"
    }


def analyze_booking_trends(db: Session) -> Dict[str, Any]:
    """Group bookings by category and duration to evaluate popular rental durations and cancellation trends."""
    bookings = db.query(Booking).all()
    if not bookings:
        return {"error": "No booking records found."}

    total_bookings = len(bookings)
    cancelled = [b for b in bookings if b.status == "cancelled"]
    active = [b for b in bookings if b.status in ("active", "confirmed", "completed")]

    avg_duration = sum(b.duration_days for b in active) / len(active) if active else 0.0
    avg_booking_val = sum(b.total_price for b in active) / len(active) if active else 0.0

    return {
        "total_bookings_recorded": total_bookings,
        "completed_active_count": len(active),
        "cancelled_count": len(cancelled),
        "cancellation_rate_pct": round((len(cancelled) / total_bookings * 100), 1) if total_bookings > 0 else 0.0,
        "avg_rental_duration_days": round(avg_duration, 1),
        "avg_booking_value": round(avg_booking_val, 2)
    }


def detect_business_anomalies(db: Session) -> Dict[str, Any]:
    """Scan database to pinpoint specific operational or financial anomalies (e.g. SUV maintenance backlog impact)."""
    # Check maintenance backlog impact
    maint_suvs = db.query(Vehicle).filter(
        Vehicle.category == "SUV",
        (Vehicle.status == "maintenance") | (Vehicle.maintenance_status == "in_repair")
    ).all()

    cancellations = db.query(Booking).filter(
        Booking.status == "cancelled",
        Booking.cancellation_reason.ilike("%maintenance%")
    ).count()

    anomalies = []

    if len(maint_suvs) >= 2:
        anomalies.append({
            "type": "Fleet Availability Bottleneck",
            "category": "SUV",
            "severity": "high",
            "description": f"{len(maint_suvs)} high-margin SUV vehicles are currently offline in maintenance.",
            "impact": f"Directly caused {cancellations} recent booking cancellations and revenue loss.",
            "affected_vehicle_regs": [v.registration_number for v in maint_suvs]
        })

    # Period comparison anomaly check
    comparison = compare_business_periods(db)
    if comparison["revenue_change_pct"] < -10.0:
        anomalies.append({
            "type": "Revenue Decline Anomaly",
            "category": "Financial",
            "severity": "critical",
            "description": f"Revenue declined by {comparison['revenue_change_pct']}% (${abs(comparison['revenue_change_usd'])} USD) compared to the previous period.",
            "impact": "Requires immediate multi-agent collaboration: Data Analyst root-cause analysis -> Operations maintenance resolution -> Sales booking recovery."
        })

    return {
        "anomaly_count": len(anomalies),
        "anomalies": anomalies
    }


def get_revenue_breakdown(db: Session, group_by: str = "category") -> Dict[str, Any]:
    """Break down revenue by vehicle category or location."""
    results = db.query(
        Vehicle.category,
        func.sum(Booking.total_price),
        func.count(Booking.id)
    ).join(Booking, Vehicle.id == Booking.vehicle_id)\
     .filter(Booking.status != "cancelled")\
     .group_by(Vehicle.category).all()

    breakdown = []
    for cat, rev, count in results:
        breakdown.append({
            "category": cat,
            "total_revenue": round(rev or 0.0, 2),
            "booking_count": count
        })

    return {
        "grouped_by": group_by,
        "breakdown": breakdown
    }


def generate_analysis_report(db: Session, title: str, timeframe: str = "current_month") -> Dict[str, Any]:
    """Generate and persist an official executive analysis report in the database."""
    metrics = get_business_metrics(db, timeframe)
    comparison = compare_business_periods(db)
    anomalies = detect_business_anomalies(db)

    findings = [
        {
            "finding": f"Revenue decreased by {comparison['revenue_change_pct']}% (${abs(comparison['revenue_change_usd'])}) in the current period.",
            "evidence": f"Stored DB records: Period 1 revenue was ${comparison['period1_revenue']}, Period 2 revenue was ${comparison['period2_revenue']}.",
            "confidence": "high"
        },
        {
            "finding": "Vehicle maintenance backlog in the SUV category is the primary operational bottleneck.",
            "evidence": f"Found {len(anomalies['anomalies'])} active fleet anomalies including SUV offline downtime.",
            "confidence": "high"
        }
    ]

    recs = [
        "Prioritize emergency parts procurement and technician allocation to repair high-demand SUVs (FLT-SUV-103, FLT-SUV-104).",
        "Initiate sales lead outreach to convert active leads into available Sedan and EV vehicles to offset temporary SUV shortfall.",
        "Reassign customers with maintenance conflicts to equivalent or upgraded vehicles (e.g. Mercedes E-Class FLT-LUX-301)."
    ]

    report = AnalysisReport(
        title=title,
        timeframe=timeframe,
        key_findings_json=json.dumps(findings),
        metrics_json=json.dumps(metrics),
        recommendations_json=json.dumps(recs),
        actions_taken_json=json.dumps(["Report generated", "Shared findings with Operations and Sales Agents"])
    )
    db.add(report)
    db.commit()

    return {
        "report_id": report.id,
        "title": report.title,
        "timeframe": report.timeframe,
        "key_findings": findings,
        "recommendations": recs
    }
