from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app


def test_health_ok() -> None:
    app.dependency_overrides[get_db] = lambda: MagicMock()
    try:
        response = TestClient(app).get("/health")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "connected"}
