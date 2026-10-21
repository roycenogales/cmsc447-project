from fastapi import APIRouter, status

from app.schemas import NotImplementedResponse

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get(
    "",
    response_model=NotImplementedResponse,
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
)
def list_metrics() -> NotImplementedResponse:
    """Placeholder for aggregated weekly metrics."""
    return NotImplementedResponse(detail="Metrics not implemented yet")
