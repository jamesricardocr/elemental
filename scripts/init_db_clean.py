"""
Script para inicializar la base de datos LIMPIA
Solo crea las tablas sin datos de ejemplo
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al path
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

from config.database import Base, engine
from src.models import Parcela, Especie, Arbol, Necromasa, Herbaceas, CalculoBiomasa, CalculoSatelital, Zona
from load_puntos_referencia import PuntoReferencia


def create_tables():
    """Crea todas las tablas en la base de datos"""
    print("=" * 60)
    print("INICIALIZACIÓN DE BASE DE DATOS LIMPIA - Sistema IAP")
    print("=" * 60)
    print()
    print("🔨 Creando tablas en la base de datos...")

    Base.metadata.create_all(bind=engine)

    print("✅ Tablas creadas exitosamente")
    print()
    print("📋 Tablas disponibles:")
    print("   • zonas (tabla independiente para zonas)")
    print("   • puntos_referencia")
    print("   • parcelas")
    print("   • especies")
    print("   • arboles")
    print("   • necromasa")
    print("   • herbaceas")
    print("   • calculos_biomasa")
    print("   • calculos_satelitales")
    print()
    print("=" * 60)
    print("✅ Base de datos limpia lista para usar")
    print("=" * 60)


if __name__ == "__main__":
    create_tables()
