from datetime import datetime
from pydantic import BaseModel

class UploadCreate(BaseModel):
    id: int
    office_id: int
    filename: str
    status: str
    uploaded_at: datetime
