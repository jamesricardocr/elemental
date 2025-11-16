"""
Script para cargar puntos de referencia desde el Excel a la base de datos
"""

import pandas as pd
from sqlalchemy import create_engine, Column, Integer, String, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.database import Base, engine, SessionLocal

# Modelo para puntos de referencia
class PuntoReferencia(Base):
    __tablename__ = 'puntos_referencia'

    id = Column(Integer, primary_key=True, index=True)
    zona = Column(String(100), index=True, nullable=False)
    nombre = Column(String(200))
    descripcion = Column(Text)
    fuente = Column(String(100))
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)


def load_puntos_from_excel():
    """Carga puntos de referencia desde el archivo Excel"""

    excel_file = 'data/raw/Base de Datos puntos georeferenciados.xlsx'

    # Crear tablas
    Base.metadata.create_all(bind=engine)

    # Crear sesión
    db = SessionLocal()

    try:
        # Leer todas las hojas del Excel
        xls = pd.ExcelFile(excel_file)

        total_puntos = 0

        for sheet_name in xls.sheet_names:
            # Saltar la hoja INICIO que está vacía
            if sheet_name == 'INICIO':
                continue

            print(f"\n📍 Procesando zona: {sheet_name}")

            # Leer la hoja
            df = pd.read_excel(excel_file, sheet_name=sheet_name)

            # Verificar que tenga las columnas necesarias
            if len(df) == 0:
                print(f"  ⚠️  Hoja vacía, saltando...")
                continue

            # Normalizar nombres de columnas (algunos tienen variaciones)
            df.columns = df.columns.str.lower().str.strip()

            # Identificar columnas de lat/lon (pueden variar)
            lat_col = None
            lon_col = None

            for col in df.columns:
                if 'latitud' in col or 'lat' in col:
                    lat_col = col
                if 'longitud' in col or 'lon' in col or 'longitd' in col:
                    lon_col = col

            if not lat_col or not lon_col:
                print(f"  ⚠️  No se encontraron columnas de coordenadas, saltando...")
                continue

            # Procesar cada punto
            puntos_zona = 0
            for _, row in df.iterrows():
                try:
                    # Extraer datos
                    latitud = float(row[lat_col])
                    longitud = float(row[lon_col])

                    # Validar coordenadas
                    if pd.isna(latitud) or pd.isna(longitud):
                        continue

                    if not (-90 <= latitud <= 90 and -180 <= longitud <= 180):
                        continue

                    # Crear punto de referencia
                    punto = PuntoReferencia(
                        zona=sheet_name,
                        nombre=str(row.get('name', '')) if not pd.isna(row.get('name')) else None,
                        descripcion=str(row.get('description', '')) if not pd.isna(row.get('description')) else None,
                        fuente=str(row.get('source', '')) if not pd.isna(row.get('source')) else None,
                        latitud=latitud,
                        longitud=longitud
                    )

                    db.add(punto)
                    puntos_zona += 1

                except (ValueError, TypeError) as e:
                    print(f"  ⚠️  Error procesando fila: {e}")
                    continue

            db.commit()
            total_puntos += puntos_zona
            print(f"  ✅ Cargados {puntos_zona} puntos")

        print(f"\n✅ TOTAL: {total_puntos} puntos de referencia cargados exitosamente")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌳 IAP - Cargador de Puntos de Referencia")
    print("=" * 60)
    load_puntos_from_excel()
