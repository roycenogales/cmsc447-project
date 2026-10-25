"""weekly_metrics: make office_id nullable, rename metric_name to metric

The CSV format for the ingestion demo has no office column, so office_id has to
allow NULL for now. TODO: make office_id NOT NULL again once uploads are tied to
an office.

Revision ID: cb2343b0dd31
Revises: e1fa99e2b147
Create Date: 2026-10-24 23:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cb2343b0dd31'
down_revision: Union[str, Sequence[str], None] = 'e1fa99e2b147'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('weekly_metrics', 'office_id', existing_type=sa.Integer(), nullable=True)
    op.alter_column('weekly_metrics', 'metric_name', new_column_name='metric')


def downgrade() -> None:
    """Downgrade schema. Fails if any row has a NULL office_id."""
    op.alter_column('weekly_metrics', 'metric', new_column_name='metric_name')
    op.alter_column('weekly_metrics', 'office_id', existing_type=sa.Integer(), nullable=False)
