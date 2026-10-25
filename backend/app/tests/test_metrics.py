from datetime import date

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import WeeklyMetric


def test_metrics_empty_table_is_404(client: TestClient) -> None:
    response = client.get("/metrics")

    assert response.status_code == 404
    assert response.json() == {"detail": "No metrics found"}


def test_metrics_returns_all_rows_newest_week_first(client: TestClient, db_session: Session) -> None:
    db_session.add_all(
        [
            WeeklyMetric(week_start=date(2026, 9, 7), demographic_group="freshman", metric="retention", count=30),
            WeeklyMetric(week_start=date(2026, 9, 7), demographic_group="sophomore", metric="visits", count=8),
            WeeklyMetric(week_start=date(2026, 9, 14), demographic_group="freshman", metric="visits", count=12),
            WeeklyMetric(week_start=date(2026, 9, 21), demographic_group="sophomore", metric="visits", count=5),
        ]
    )
    db_session.flush()

    response = client.get("/metrics")

    assert response.status_code == 200
    rows = response.json()
    assert [(r["week_start"], r["demographic_group"], r["metric"], r["count"]) for r in rows] == [
        ("2026-09-21", "sophomore", "visits", 5),
        ("2026-09-14", "freshman", "visits", 12),
        ("2026-09-07", "freshman", "retention", 30),
        ("2026-09-07", "sophomore", "visits", 8),
    ]
    assert set(rows[0]) == {"id", "week_start", "demographic_group", "metric", "count"}
