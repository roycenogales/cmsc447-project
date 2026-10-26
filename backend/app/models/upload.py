from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Upload(Base):
    """Audit log of CSV uploads."""

    __tablename__ = "uploads"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Nullable until tied to an office
    office_id: Mapped[int | None] = mapped_column(ForeignKey("offices.id"))
    filename: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), default="pending")
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
