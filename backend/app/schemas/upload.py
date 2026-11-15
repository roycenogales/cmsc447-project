from pydantic import BaseModel


class UploadResponse(BaseModel):
    rows_inserted: int


class CsvErrorOut(BaseModel):
    msg: str
    row: int | None = None
    column: str | None = None


class UploadErrorResponse(BaseModel):
    detail: list[CsvErrorOut]
