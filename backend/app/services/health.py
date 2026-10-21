from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


def check_database(db: Session) -> bool:
    """Return True if the database answers a trivial query."""
    try:
        db.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError:
        return False
