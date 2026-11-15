"""CSV ingestion for weekly_metrics.

Demo format only: one CSV with exactly the columns week_start, demographic_group,
metric, count. Per-office column mapping will live in services/mappings/ later.
"""

import csv
import io
import re
from dataclasses import dataclass
from datetime import date

from sqlalchemy import select, tuple_
from sqlalchemy.orm import Session

from app.models import WeeklyMetric

REQUIRED_COLUMNS = ("week_start", "demographic_group", "metric", "count")
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_ERRORS = 20
MAX_TEXT_LENGTH = 100  # matches the String(100) columns on weekly_metrics
MAX_COUNT = 2_147_483_647  # Postgres INTEGER upper bound

ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
WHOLE_NUMBER = re.compile(r"^\d+$")


@dataclass
class CsvError:
    """One problem in the file. row is the spreadsheet row number (header is row 1)."""

    msg: str
    row: int | None = None
    column: str | None = None


class CsvValidationError(Exception):
    """The file was rejected. Nothing was inserted."""

    def __init__(self, errors: list[CsvError]) -> None:
        super().__init__(f"{len(errors)} problem(s) in uploaded CSV")
        self.errors = errors


@dataclass
class MetricRow:
    row: int
    week_start: date
    demographic_group: str
    metric: str
    count: int

    @property
    def key(self) -> tuple[date, str, str]:
        return (self.week_start, self.demographic_group, self.metric)


def ingest_metrics_csv(db: Session, filename: str | None, content: bytes) -> int:
    """Validate the whole file, then insert every row in one transaction.

    All-or-nothing: raises CsvValidationError and inserts nothing if any row is bad
    or duplicates data that's already loaded. Returns the number of rows inserted.
    """
    rows = parse_metrics_csv(filename, content)
    _reject_existing_rows(db, rows)

    db.add_all(
        WeeklyMetric(
            week_start=r.week_start,
            demographic_group=r.demographic_group,
            metric=r.metric,
            count=r.count,
        )
        for r in rows
    )
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    return len(rows)


def parse_metrics_csv(filename: str | None, content: bytes) -> list[MetricRow]:
    """Parse and validate the CSV. Raises CsvValidationError listing every problem found."""
    if not filename or not filename.lower().endswith(".csv"):
        raise CsvValidationError([CsvError("File must be a .csv file")])
    if len(content) > MAX_UPLOAD_BYTES:
        raise CsvValidationError(
            [CsvError(f"File is larger than {MAX_UPLOAD_BYTES // (1024 * 1024)} MB")]
        )
    try:
        # utf-8-sig drops the byte-order mark Excel adds when saving as CSV UTF-8.
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise CsvValidationError([CsvError("File is not valid UTF-8 text")]) from None

    reader = csv.reader(io.StringIO(text, newline=""))
    header = next(reader, None)
    if header is None:
        raise CsvValidationError([CsvError("File is empty")])
    columns = [name.strip() for name in header]
    _check_header(columns)

    errors: list[CsvError] = []
    rows: list[MetricRow] = []
    first_seen: dict[tuple[date, str, str], int] = {}

    # Header is row 1, so the first data row is row 2, the same as in Excel.
    for row_number, values in enumerate(reader, start=2):
        if not any(v.strip() for v in values):
            continue  # skip blank lines
        if len(errors) >= MAX_ERRORS:
            errors.append(CsvError(f"Stopped after {MAX_ERRORS} errors; fix these and upload again"))
            break
        if len(values) != len(columns):
            errors.append(
                CsvError(
                    f"Row {row_number}: expected {len(columns)} values, found {len(values)}",
                    row=row_number,
                )
            )
            continue

        record = {column: value.strip() for column, value in zip(columns, values)}
        row = _parse_row(row_number, record, errors)
        if row is None:
            continue
        if row.key in first_seen:
            errors.append(
                CsvError(
                    f"Row {row_number}: duplicates row {first_seen[row.key]} "
                    f"({row.week_start}, {row.demographic_group}, {row.metric})",
                    row=row_number,
                )
            )
            continue
        first_seen[row.key] = row_number
        rows.append(row)

    if errors:
        raise CsvValidationError(errors)
    if not rows:
        raise CsvValidationError([CsvError("File has a header but no data rows")])
    return rows


def _check_header(columns: list[str]) -> None:
    missing = [c for c in REQUIRED_COLUMNS if c not in columns]
    unexpected = [c for c in columns if c not in REQUIRED_COLUMNS]
    repeated = sorted({c for c in columns if columns.count(c) > 1})

    errors = []
    if missing:
        errors.append(CsvError(f"Missing column(s): {', '.join(missing)}", row=1))
    if unexpected:
        shown = ", ".join(repr(c) for c in unexpected)
        errors.append(CsvError(f"Unexpected column(s): {shown}", row=1))
    if repeated:
        errors.append(CsvError(f"Column(s) listed more than once: {', '.join(repeated)}", row=1))
    if errors:
        errors.append(CsvError(f"Expected exactly these columns: {', '.join(REQUIRED_COLUMNS)}", row=1))
        raise CsvValidationError(errors)


def _parse_row(row_number: int, record: dict[str, str], errors: list[CsvError]) -> MetricRow | None:
    """Validate one row. Appends to errors and returns None if anything is wrong."""
    start = len(errors)

    def fail(column: str, problem: str) -> None:
        errors.append(CsvError(f"Row {row_number}, {column}: {problem}", row=row_number, column=column))

    week_start = None
    raw_date = record["week_start"]
    if ISO_DATE.match(raw_date):
        try:
            week_start = date.fromisoformat(raw_date)
        except ValueError:
            pass
    if week_start is None:
        fail("week_start", f"'{raw_date}' is not a valid date (expected YYYY-MM-DD)")

    for column in ("demographic_group", "metric"):
        if not record[column]:
            fail(column, "is empty")
        elif len(record[column]) > MAX_TEXT_LENGTH:
            fail(column, f"is longer than {MAX_TEXT_LENGTH} characters")

    count = None
    raw_count = record["count"]
    if WHOLE_NUMBER.match(raw_count) and int(raw_count) <= MAX_COUNT:
        count = int(raw_count)
    elif WHOLE_NUMBER.match(raw_count):
        fail("count", f"'{raw_count}' is too large")
    else:
        fail("count", f"'{raw_count}' is not a non-negative whole number")

    if len(errors) > start or week_start is None or count is None:
        return None
    return MetricRow(row_number, week_start, record["demographic_group"], record["metric"], count)


def _reject_existing_rows(db: Session, rows: list[MetricRow]) -> None:
    """Re-uploading a week would double its counts, so reject rows that are already loaded."""
    keys = [r.key for r in rows]
    existing = set(
        db.execute(
            select(WeeklyMetric.week_start, WeeklyMetric.demographic_group, WeeklyMetric.metric).where(
                tuple_(WeeklyMetric.week_start, WeeklyMetric.demographic_group, WeeklyMetric.metric).in_(keys)
            )
        ).tuples()
    )
    errors = [
        CsvError(
            f"Row {r.row}: data for ({r.week_start}, {r.demographic_group}, {r.metric}) is already loaded",
            row=r.row,
        )
        for r in rows
        if r.key in existing
    ]
    if errors:
        if len(errors) > MAX_ERRORS:
            hidden = len(errors) - MAX_ERRORS
            errors = errors[:MAX_ERRORS] + [CsvError(f"...and {hidden} more rows already loaded")]
        raise CsvValidationError(errors)
