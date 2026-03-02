"""Health check endpoint."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime

from app.api.dependencies import get_openai_client, get_qdrant_client, get_postgres_pool
from app.utils.logging import get_logger

router = APIRouter()
logger = get_logger("health")


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    timestamp: str
    services: dict


@router.get("/health", response_model=HealthResponse)
async def health_check(
    openai_client=Depends(get_openai_client),
    qdrant_client=Depends(get_qdrant_client),
    postgres_pool=Depends(get_postgres_pool)
):
    """
    Health check endpoint to verify all services are operational.

    Returns:
        HealthResponse with status of all services
    """
    services = {
        "openai": "unknown",
        "qdrant": "unknown",
        "postgres": "unknown"
    }

    # Check OpenAI
    try:
        if openai_client:
            services["openai"] = "operational"
    except Exception as e:
        logger.error(f"OpenAI health check failed: {e}")
        services["openai"] = "degraded"

    # Check Qdrant
    try:
        if qdrant_client:
            qdrant_client.get_collections()
            services["qdrant"] = "operational"
    except Exception as e:
        logger.error(f"Qdrant health check failed: {e}")
        services["qdrant"] = "degraded"

    # Check Postgres
    try:
        if postgres_pool:
            async with postgres_pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            services["postgres"] = "operational"
    except Exception as e:
        logger.error(f"Postgres health check failed: {e}")
        services["postgres"] = "degraded"

    # Determine overall status
    if all(status == "operational" for status in services.values()):
        overall_status = "healthy"
    elif any(status == "operational" for status in services.values()):
        overall_status = "degraded"
    else:
        overall_status = "unhealthy"

    return HealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow().isoformat(),
        services=services
    )
