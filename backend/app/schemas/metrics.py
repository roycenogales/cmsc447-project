from datetime import date

from pydantic import BaseModel, ConfigDict


class WeeklyMetricOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    week_start: date
    demographic_group: str
    metric: str
    count: int
