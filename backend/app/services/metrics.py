from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import WeeklyMetric


# TODO: add optional filters (metric, demographic_group, week_start range) for the final product.
def list_weekly_metrics(db: Session) -> Sequence[WeeklyMetric]:
    """Return every weekly_metrics row, newest week first."""
    query = select(WeeklyMetric).order_by(
        WeeklyMetric.week_start.desc(),
        WeeklyMetric.demographic_group,
        WeeklyMetric.metric,
        WeeklyMetric.id,
    )
    return db.scalars(query).all()
