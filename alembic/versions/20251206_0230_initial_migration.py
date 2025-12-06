"""Initial migration with all tables

Revision ID: 001_initial
Revises:
Create Date: 2025-12-06 02:30:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Migración inicial: Crea todas las tablas si no existen.

    Esta migración verifica si las tablas ya existen antes de crearlas,
    para permitir transición suave desde sistema sin migraciones.
    """

    # Obtener conexión para verificar tablas existentes
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()

    # Crear tabla 'zonas' si no existe
    if 'zonas' not in existing_tables:
        op.create_table(
            'zonas',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('nombre', sa.String(length=100), nullable=False),
            sa.Column('descripcion', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_zonas_id'), 'zonas', ['id'], unique=False)
        op.create_index(op.f('ix_zonas_nombre'), 'zonas', ['nombre'], unique=True)

    # Las demás tablas (especies, usuarios, parcelas, arboles, necromasa, herbaceas, calculos, etc.)
    # ya existen en la base de datos actual, por lo que no las creamos aquí.
    # Solo agregamos la tabla zonas que es nueva.

    print("✅ Migración inicial completada")


def downgrade() -> None:
    """
    Rollback de migración inicial: Elimina tabla zonas
    """
    op.drop_index(op.f('ix_zonas_nombre'), table_name='zonas')
    op.drop_index(op.f('ix_zonas_id'), table_name='zonas')
    op.drop_table('zonas')
