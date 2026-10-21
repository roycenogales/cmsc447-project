from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import HealthResponse
from app.services.health import check_database

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health(response: Response, db: Session = Depends(get_db)) -> HealthResponse:
    if check_database(db):
        return HealthResponse(status="ok", database="connected")
    response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return HealthResponse(status="error", database="unreachable")
