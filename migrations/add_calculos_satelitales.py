"""
Migración: Agregar tabla calculos_satelitales
Ejecutar con: python migrations/add_calculos_satelitales.py
"""

import sys
import os

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from config.database import Base
from src.models.parcela import Parcela
from src.models.arbol import Arbol
from src.models.necromasa import Necromasa
from src.models.herbaceas import Herbaceas
from src.models.calculo import CalculoBiomasa
from src.models.calculo_satelital import CalculoSatelital  # Nuevo modelo


def run_migration():
    """Ejecuta la migración para agregar tabla de cálculos satelitales"""

    # Conectar a base de datos
    database_path = os.path.join(os.path.dirname(__file__), '..', 'iap_database.db')
    engine = create_engine(f'sqlite:///{database_path}')

    print("🚀 Ejecutando migración: Agregar tabla calculos_satelitales")

    # Crear solo la nueva tabla (las demás ya existen)
    CalculoSatelital.__table__.create(engine, checkfirst=True)

    print("✅ Migración completada exitosamente")
    print("📊 Tabla 'calculos_satelitales' creada")
    print("\nColumnas agregadas:")
    print("  - id, parcela_id, fecha_inicio, fecha_fin")
    print("  - ndvi_promedio, evi_promedio, lai_promedio")
    print("  - biomasa_aerea_estimada, carbono_estimado")
    print("  - nasa_task_id, estado_procesamiento")
    print("  - serie_temporal (JSON)")
    print("  - Y más...")


if __name__ == "__main__":
    run_migration()
