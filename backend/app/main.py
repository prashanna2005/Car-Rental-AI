from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.database import engine, Base
from app.database.seed import seed_database
from app.database.models import Vehicle

# API Routers
from app.api.dashboard import router as dashboard_router
from app.api.vehicles import router as vehicles_router
from app.api.bookings import router as bookings_router
from app.api.customers import router as customers_router
from app.api.analytics import router as analytics_router
from app.api.maintenance import router as maintenance_router
from app.api.agent_hub import router as agent_hub_router
from app.api.activity import router as activity_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FleetIQ AI — AI Car Rental Business Agent Hub REST Backend",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(vehicles_router, prefix=settings.API_V1_STR)
app.include_router(bookings_router, prefix=settings.API_V1_STR)
app.include_router(customers_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(maintenance_router, prefix=settings.API_V1_STR)
app.include_router(agent_hub_router, prefix=settings.API_V1_STR)
app.include_router(activity_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    from app.database.database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(Vehicle).count() == 0:
            print("Database empty. Auto-seeding FleetIQ data...")
            seed_database()
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "demo_mode": settings.DEMO_MODE,
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
