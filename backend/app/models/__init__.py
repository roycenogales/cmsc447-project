# Import every model here so Alembic autogenerate can see them.
from app.models.office import Office
from app.models.staging_record import StagingRecord
from app.models.upload import Upload
from app.models.weekly_metric import WeeklyMetric

__all__ = ["Office", "StagingRecord", "Upload", "WeeklyMetric"]
