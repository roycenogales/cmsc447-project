from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WeeklyMetric(Base):
    """Final aggregated counts the dashboard reads."""

    __tablename__ = "weekly_metrics"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Nullable until uploads are tied to an office (the demo CSV has no office column).
    office_id: Mapped[int | None] = mapped_column(ForeignKey("offices.id"))
    week_start: Mapped[date] = mapped_column(Date)
    metric: Mapped[str] = mapped_column(String(100))
    demographic_group: Mapped[str] = mapped_column(String(100))
    count: Mapped[int]
