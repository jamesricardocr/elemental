"""
Script de Inicialización de Base de Datos
Crea las tablas y carga datos iniciales
"""

from config.database import engine, Base, SessionLocal
from src.models import Parcela, Especie, Arbol, Necromasa, Herbaceas, CalculoBiomasa

def init_database():
    """Inicializa la base de datos y carga datos de ejemplo."""

    print("🗄️  Creando tablas en la base de datos...")

    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)

    print("✅ Tablas creadas exitosamente")

    # Crear sesión
    db = SessionLocal()

    try:
        # Verificar si ya hay especies cargadas
        especies_count = db.query(Especie).count()

        if especies_count == 0:
            print("\n🌿 Cargando catálogo de especies amazónicas...")

            # Especies comunes del Amazonas colombiano
            especies_amazonas = [
                {
                    "nombre_cientifico": "Bertholletia excelsa",
                    "nombre_comun": "Castaño del Brasil",
                    "familia": "Lecythidaceae",
                    "densidad_madera": 0.69,
                    "factor_carbono": 0.47
                },
                {
                    "nombre_cientifico": "Cedrelinga cateniformis",
                    "nombre_comun": "Cedro",
                    "familia": "Fabaceae",
                    "densidad_madera": 0.45,
                    "factor_carbono": 0.47
                },
                {
                    "nombre_cientifico": "Hevea brasiliensis",
                    "nombre_comun": "Siringa",
                    "familia": "Euphorbiaceae",
                    "densidad_madera": 0.56,
                    "factor_carbono": 0.47
                },
                {
                    "nombre_cientifico": "Swietenia macrophylla",
                    "nombre_comun": "Caoba",
                    "familia": "Meliaceae",
                    "densidad_madera": 0.55,
                    "factor_carbono": 0.47
                },
                {
                    "nombre_cientifico": "Ceiba pentandra",
                    "nombre_comun": "Ceiba",
                    "familia": "Malvaceae",
                    "densidad_madera": 0.25,
                    "factor_carbono": 0.47
                },
                {
                    "nombre_cientifico": "Virola sebifera",
                    "nombre_comun": "Sangretoro",
                    "familia": "Myristicaceae",
                    "densidad_madera": 0.48,
                    "factor_carbono": 0.47
                },
                {
                    "nombre_cientifico": "Dipteryx odorata",
                    "nombre_comun": "Shihuahuaco",
                    "familia": "Fabaceae",
                    "densidad_madera": 0.82,
                    "factor_carbono": 0.47
                },
                {
                    "nombre_cientifico": "Tabebuia serratifolia",
                    "nombre_comun": "Tahuarí amarillo",
                    "familia": "Bignoniaceae",
                    "densidad_madera": 0.75,
                    "factor_carbono": 0.47
                },
                {
                    "nombre_cientifico": "Couratari guianensis",
                    "nombre_comun": "Abarco",
                    "familia": "Lecythidaceae",
                    "densidad_madera": 0.64,
                    "factor_carbono": 0.47
                },
                {
                    "nombre_cientifico": "Hymenaea courbaril",
                    "nombre_comun": "Algarrobo",
                    "familia": "Fabaceae",
                    "densidad_madera": 0.88,
                    "factor_carbono": 0.47
                }
            ]

            # Insertar especies
            for especie_data in especies_amazonas:
                especie = Especie(**especie_data)
                db.add(especie)

            db.commit()
            print(f"✅ {len(especies_amazonas)} especies cargadas")
        else:
            print(f"\n✅ Base de datos ya tiene {especies_count} especies cargadas")

        print("\n🎉 ¡Base de datos inicializada correctamente!")
        print("\n📋 Resumen:")
        print(f"   - Especies: {db.query(Especie).count()}")
        print(f"   - Parcelas: {db.query(Parcela).count()}")
        print(f"   - Árboles: {db.query(Arbol).count()}")

    except Exception as e:
        print(f"\n❌ Error al cargar datos: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("   Sistema de Gestión de Biomasa y Carbono")
    print("   Inicialización de Base de Datos")
    print("=" * 60)

    init_database()

    print("\n💡 Siguiente paso:")
    print("   1. Inicia la API: uvicorn src.api.main:app --reload")
    print("   2. Inicia la UI: streamlit run src/ui/app.py")
    print("=" * 60)
