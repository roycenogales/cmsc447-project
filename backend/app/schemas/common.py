from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    database: str


class NotImplementedResponse(BaseModel):
    detail: str

class UploadResponse(BaseModel):
    detail: str
