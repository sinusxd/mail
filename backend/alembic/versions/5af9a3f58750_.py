"""

Revision ID: 5af9a3f58750
Revises: 334c6752a8f7
Create Date: 2025-05-11 21:41:13.483734

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5af9a3f58750'
down_revision: Union[str, None] = '334c6752a8f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('folders', sa.Column('last_uid', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('folders', 'last_uid')
    # ### end Alembic commands ###
