from fastapi import APIRouter, status

from app.schemas import NotImplementedResponse

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post(
    "",
    response_model=NotImplementedResponse,
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
)
def upload_csv() -> NotImplementedResponse:
    """Placeholder for the CSV upload endpoint."""
    return NotImplementedResponse(detail="CSV upload not implemented yet")
