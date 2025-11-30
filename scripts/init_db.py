"""
Script para inicializar la base de datos
Crea todas las tablas y poblala con datos iniciales
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al path
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

from config.database import Base, engine, SessionLocal
from src.models import Parcela, Especie, Arbol, Necromasa, Herbaceas, CalculoBiomasa, Zona
from datetime import date


def create_tables():
    """Crea todas las tablas en la base de datos"""
    print("Creando tablas en la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tablas creadas exitosamente")


def seed_especies():
    """Pobla la tabla de especies con datos iniciales"""
    db = SessionLocal()

    try:
        # Verificar si ya existen especies
        count = db.query(Especie).count()
        if count > 0:
            print(f"✓ Ya existen {count} especies en la base de datos")
            return

        print("Poblando catálogo de especies...")

        # Especies comunes del Amazonas colombiano con densidad de madera
        especies_amazonicas = [
            {
                "nombre_comun": "Ceiba",
                "nombre_cientifico": "Ceiba pentandra",
                "familia": "Malvaceae",
                "densidad_madera": 0.35,
                "descripcion": "Árbol emergente de gran tamaño, característico de bosques tropicales"
            },
            {
                "nombre_comun": "Cedro",
                "nombre_cientifico": "Cedrela odorata",
                "familia": "Meliaceae",
                "densidad_madera": 0.48,
                "descripcion": "Madera valiosa, ampliamente utilizada en carpintería"
            },
            {
                "nombre_comun": "Caoba",
                "nombre_cientifico": "Swietenia macrophylla",
                "familia": "Meliaceae",
                "densidad_madera": 0.55,
                "descripcion": "Madera preciosa, especie amenazada"
            },
            {
                "nombre_comun": "Abarco",
                "nombre_cientifico": "Cariniana pyriformis",
                "familia": "Lecythidaceae",
                "densidad_madera": 0.62,
                "descripcion": "Madera dura, utilizada en construcción"
            },
            {
                "nombre_comun": "Caucho",
                "nombre_cientifico": "Hevea brasiliensis",
                "familia": "Euphorbiaceae",
                "densidad_madera": 0.58,
                "descripcion": "Fuente de látex natural"
            },
            {
                "nombre_comun": "Sangre de Drago",
                "nombre_cientifico": "Croton lechleri",
                "familia": "Euphorbiaceae",
                "densidad_madera": 0.42,
                "descripcion": "Propiedades medicinales, látex rojizo"
            },
            {
                "nombre_comun": "Guamo",
                "nombre_cientifico": "Inga edulis",
                "familia": "Fabaceae",
                "densidad_madera": 0.45,
                "descripcion": "Leguminosa, fijadora de nitrógeno"
            },
            {
                "nombre_comun": "Achapo",
                "nombre_cientifico": "Cedrelinga cateniformis",
                "familia": "Fabaceae",
                "densidad_madera": 0.52,
                "descripcion": "Madera semi-dura, crecimiento rápido"
            },
            {
                "nombre_comun": "Palisangre",
                "nombre_cientifico": "Brosimum rubescens",
                "familia": "Moraceae",
                "densidad_madera": 0.75,
                "descripcion": "Madera muy dura y pesada"
            },
            {
                "nombre_comun": "Desconocida",
                "nombre_cientifico": None,
                "familia": None,
                "densidad_madera": 0.60,  # Valor promedio para bosques tropicales
                "descripcion": "Especie sin identificar"
            },
        ]

        for especie_data in especies_amazonicas:
            especie = Especie(**especie_data)
            db.add(especie)

        db.commit()
        print(f"✓ {len(especies_amazonicas)} especies agregadas al catálogo")

    except Exception as e:
        print(f"✗ Error al poblar especies: {e}")
        db.rollback()
    finally:
        db.close()


def create_example_data():
    """Crea datos de ejemplo para testing (opcional)"""
    db = SessionLocal()

    try:
        # Verificar si ya existen parcelas
        count = db.query(Parcela).count()
        if count > 0:
            print(f"✓ Ya existen {count} parcelas en la base de datos")
            return

        print("Creando datos de ejemplo...")

        # Parcela de ejemplo
        parcela_ejemplo = Parcela(
            codigo="P001",
            nombre="Parcela Experimental 1",
            zona_priorizada="Zona A - Leticia",
            fecha_establecimiento=date.today(),
            latitud=-4.2156,
            longitud=-69.9406,
            altitud=96.0,
            utm_x=679834.0,
            utm_y=9532650.0,
            utm_zone="18M",
            pendiente=5.0,
            tipo_cobertura="Bosque primario",
            accesibilidad="fácil",
            responsable="Investigador Principal",
            estado="activa",
            observaciones="Parcela de ejemplo para testing del sistema"
        )

        db.add(parcela_ejemplo)
        db.commit()

        print("✓ Datos de ejemplo creados")

    except Exception as e:
        print(f"✗ Error al crear datos de ejemplo: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """Función principal"""
    print("=" * 60)
    print("INICIALIZACIÓN DE BASE DE DATOS - Sistema IAP")
    print("=" * 60)
    print()

    # Crear tablas
    create_tables()
    print()

    # Poblar catálogo de especies
    seed_especies()
    print()

    # Crear datos de ejemplo (comentar si no se desea)
    create_example_data()
    print()

    print("=" * 60)
    print("✓ Inicialización completada exitosamente")
    print("=" * 60)


if __name__ == "__main__":
    main()
