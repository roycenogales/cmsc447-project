from dataclasses import asdict

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import UploadErrorResponse, UploadResponse
from app.services.ingestion import MAX_UPLOAD_BYTES, CsvValidationError, ingest_metrics_csv

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post(
    "",
    response_model=UploadResponse,
    responses={status.HTTP_400_BAD_REQUEST: {"model": UploadErrorResponse}},
)
def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)) -> UploadResponse:
    """Upload a CSV with columns week_start, demographic_group, metric, count.

    All-or-nothing: if any row is invalid, nothing is inserted and every problem is
    listed in the 400 response.
    """
    # Read one byte past the limit so the service can tell the file is too large.
    content = file.file.read(MAX_UPLOAD_BYTES + 1)
    try:
        rows_inserted = ingest_metrics_csv(db, file.filename, content)
    except CsvValidationError as exc:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail=[asdict(e) for e in exc.errors]
        ) from exc
    return UploadResponse(rows_inserted=rows_inserted)
