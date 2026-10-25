from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.database import get_db
from app.main import app


@pytest.fixture
def client():
    app.dependency_overrides[get_db] = lambda: MagicMock()
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.mark.parametrize("origin", ["http://localhost:5173", "http://127.0.0.1:5173"])
def test_dev_origins_allowed(client: TestClient, origin: str) -> None:
    response = client.get("/health", headers={"Origin": origin})
    assert response.headers["access-control-allow-origin"] == origin


def test_unhandled_error_keeps_cors_headers(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def boom(_db: object) -> bool:
        raise RuntimeError("boom")

    monkeypatch.setattr("app.routers.health.check_database", boom)
    response = client.get("/health", headers={"Origin": "http://localhost:5173"})

    assert response.status_code == 500
    assert response.json() == {"detail": "Internal server error"}
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
