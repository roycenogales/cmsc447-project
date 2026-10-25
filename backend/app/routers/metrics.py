from collections.abc import Sequence

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import WeeklyMetric
from app.schemas import ErrorResponse, WeeklyMetricOut
from app.services.metrics import list_weekly_metrics

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get(
    "",
    response_model=list[WeeklyMetricOut],
    responses={status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
)
def list_metrics(db: Session = Depends(get_db)) -> Sequence[WeeklyMetric]:
    """All weekly metric rows, newest week first. 404 if the table is empty.

    Temporary: will be replaced by the aggregation endpoint.
    """
    rows = list_weekly_metrics(db)
    if not rows:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No metrics found")
    return rows
