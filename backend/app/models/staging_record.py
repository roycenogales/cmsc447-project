from typing import Any

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class StagingRecord(Base):
    """Normalized rows from an upload, awaiting validation. Aggregate counts only."""

    __tablename__ = "staging_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    upload_id: Mapped[int] = mapped_column(ForeignKey("uploads.id"))
    data: Mapped[dict[str, Any]] = mapped_column(JSONB)
