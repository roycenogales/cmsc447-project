from collections.abc import Generator
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.main import app

# Tests use a separate database on the same Postgres server so they never touch dev data.
TEST_DB_NAME = f"{settings.postgres_db}_test"
ALEMBIC_INI = Path(__file__).resolve().parents[2] / "alembic.ini"


@pytest.fixture(scope="session")
def db_engine() -> Generator[Engine, None, None]:
    """Recreate the test database and build it with the real Alembic migrations."""
    admin_engine = create_engine(settings.database_url, isolation_level="AUTOCOMMIT")
    try:
        with admin_engine.connect() as conn:
            conn.execute(text(f'DROP DATABASE IF EXISTS "{TEST_DB_NAME}" WITH (FORCE)'))
            conn.execute(text(f'CREATE DATABASE "{TEST_DB_NAME}"'))
    except OperationalError as exc:
        pytest.fail(
            "Can't reach Postgres for the test database. Start it with "
            f"`docker compose up -d db` and check backend/.env.\n{exc}",
            pytrace=False,
        )
    finally:
        admin_engine.dispose()

    test_url = settings.database_url_for(TEST_DB_NAME)
    alembic_cfg = Config(str(ALEMBIC_INI))
    alembic_cfg.set_main_option("sqlalchemy.url", test_url.replace("%", "%%"))
    command.upgrade(alembic_cfg, "head")

    engine = create_engine(test_url)
    yield engine
    engine.dispose()


@pytest.fixture
def db_session(db_engine: Engine) -> Generator[Session, None, None]:
    """A session inside a transaction that's rolled back after each test."""
    with db_engine.connect() as conn:
        transaction = conn.begin()
        session = Session(bind=conn, join_transaction_mode="create_savepoint")
        try:
            yield session
        finally:
            session.close()
            transaction.rollback()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """TestClient whose requests use the rolled-back test session."""
    app.dependency_overrides[get_db] = lambda: db_session
    yield TestClient(app)
    app.dependency_overrides.clear()
