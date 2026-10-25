from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Upload
from app.schemas import ErrorResponse, UploadCreate

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post(
    "",
    response_model=UploadResponse
    status_code=status.HTTP_400_BAD_REQUEST,
)
def upload_csv(item: UploadCreate, db: Session = Depends(get_db)) -> Sequence[Upload]: #not sure about Sequence[...]
    """Placeholder for the CSV upload endpoint."""
    db_item = Upload(**item.model_dump()) ##placeholder in parameters
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
