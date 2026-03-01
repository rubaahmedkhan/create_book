from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Textbook Platform Backend API",
    description="User profile management and questionnaire API",
    version="1.0.0"
)

# CORS configuration - allow all services to communicate
origins = [
    "http://localhost:3000",  # Auth service
    "http://localhost:3001",  # Frontend
    "http://localhost:3002",  # Main site / Module 1
    "http://localhost:3003",  # Module 2 (Simulation)
    "http://localhost:3004",  # Module 3 (Isaac)
    "http://localhost:3005",  # Module 4 (VLA)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "backend"}

# Import API routers
from src.api import questionnaire, profile, content

app.include_router(questionnaire.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(content.router, prefix="/api")

# GDPR router will be added in Phase 5
# from src.api import gdpr
# app.include_router(gdpr.router, prefix="/api/gdpr")
