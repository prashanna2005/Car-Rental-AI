import os

class Settings:
    PROJECT_NAME: str = "FleetIQ AI — AI Car Rental Business Agent Hub"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fleetiq.db")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "gpt-4o-mini")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "t") or not os.getenv("OPENAI_API_KEY")

settings = Settings()
