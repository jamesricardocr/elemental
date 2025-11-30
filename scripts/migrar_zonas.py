"""
Script para migrar zonas existentes de parcelas y puntos a la tabla zonas
"""
import sys
from pathlib import Path

# Agregar el directorio raíz al path
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

from config.database import SessionLocal
from src.models.zona import Zona
from src.models.parcela import Parcela
from load_puntos_referencia import PuntoReferencia


def migrar_zonas():
    """Migra las zonas existentes de parcelas y puntos a la tabla zonas"""
    db = SessionLocal()

    try:
        print("🔄 Migrando zonas existentes...")
        print("=" * 60)

        # Obtener zonas desde parcelas
        zonas_parcelas = db.query(Parcela.zona_priorizada).distinct().all()
        zonas_parcelas = set([z[0] for z in zonas_parcelas if z[0]])

        # Obtener zonas desde puntos de referencia
        zonas_puntos = db.query(PuntoReferencia.zona).distinct().all()
        zonas_puntos = set([z[0] for z in zonas_puntos if z[0]])

        # Combinar ambas listas
        zonas_todas = zonas_parcelas.union(zonas_puntos)

        print(f"📊 Encontradas {len(zonas_todas)} zonas únicas:")
        for zona_nombre in sorted(zonas_todas):
            print(f"  • {zona_nombre}")

        print("\n🔨 Creando zonas en la tabla zonas...")

        zonas_creadas = 0
        zonas_existentes = 0

        for zona_nombre in sorted(zonas_todas):
            # Verificar si ya existe
            zona_existente = db.query(Zona).filter(Zona.nombre == zona_nombre).first()

            if zona_existente:
                print(f"  ⚠️  {zona_nombre} - Ya existe")
                zonas_existentes += 1
                continue

            # Crear nueva zona
            nueva_zona = Zona(
                nombre=zona_nombre,
                descripcion=f"Zona migrada automáticamente"
            )
            db.add(nueva_zona)
            print(f"  ✅ {zona_nombre} - Creada")
            zonas_creadas += 1

        db.commit()

        print("\n" + "=" * 60)
        print(f"✅ Migración completada:")
        print(f"   • Zonas creadas: {zonas_creadas}")
        print(f"   • Zonas ya existentes: {zonas_existentes}")
        print(f"   • Total: {zonas_creadas + zonas_existentes}")

    except Exception as e:
        print(f"\n❌ Error durante la migración: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrar_zonas()
