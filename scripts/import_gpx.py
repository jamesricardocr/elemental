"""
Script para importar archivos GPX a la base de datos
Importa waypoints como puntos de referencia
"""

import xml.etree.ElementTree as ET
import sqlite3
from pathlib import Path
from datetime import datetime

# Namespace GPX
GPX_NS = {'gpx': 'http://www.topografix.com/GPX/1/1'}

def parse_gpx_file(gpx_path):
    """Parse un archivo GPX y extrae waypoints"""
    tree = ET.parse(gpx_path)
    root = tree.getroot()

    waypoints = []

    # Extraer waypoints
    for wpt in root.findall('gpx:wpt', GPX_NS):
        lat = float(wpt.get('lat'))
        lon = float(wpt.get('lon'))

        name_elem = wpt.find('gpx:name', GPX_NS)
        desc_elem = wpt.find('gpx:desc', GPX_NS)
        time_elem = wpt.find('gpx:time', GPX_NS)

        name = name_elem.text if name_elem is not None else None
        desc = desc_elem.text if desc_elem is not None else None
        time = time_elem.text if time_elem is not None else None

        waypoints.append({
            'lat': lat,
            'lon': lon,
            'name': name,
            'desc': desc,
            'time': time
        })

    return waypoints

def import_gpx_to_db(gpx_path, zona_name, db_path='iap_database.db'):
    """Importa waypoints de un archivo GPX a la base de datos"""

    print(f"\n📍 Procesando: {gpx_path.name}")
    print(f"   Zona: {zona_name}")

    # Parsear GPX
    waypoints = parse_gpx_file(gpx_path)
    print(f"   Encontrados: {len(waypoints)} waypoints")

    if len(waypoints) == 0:
        print("   ⚠️  No se encontraron waypoints")
        return 0

    # Conectar a la base de datos
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    imported = 0
    skipped = 0

    for wpt in waypoints:
        # Verificar si ya existe un punto con las mismas coordenadas
        cursor.execute("""
            SELECT id FROM puntos_referencia
            WHERE ABS(latitud - ?) < 0.00001 AND ABS(longitud - ?) < 0.00001
        """, (wpt['lat'], wpt['lon']))

        existing = cursor.fetchone()

        if existing:
            print(f"   ⏭️  Saltado (duplicado): {wpt['name']}")
            skipped += 1
            continue

        # Insertar nuevo punto
        cursor.execute("""
            INSERT INTO puntos_referencia (
                zona, nombre, descripcion, latitud, longitud, fuente
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            zona_name,
            wpt['name'],
            wpt['desc'],
            wpt['lat'],
            wpt['lon'],
            f"GPX: {gpx_path.name}"
        ))

        imported += 1
        print(f"   ✅ Importado: {wpt['name']} ({wpt['lat']:.6f}, {wpt['lon']:.6f})")

    conn.commit()
    conn.close()

    print(f"   📊 Resumen: {imported} importados, {skipped} saltados\n")
    return imported

def main():
    """Importa todos los archivos GPX de data/raw"""

    gpx_dir = Path('data/raw')
    gpx_files = list(gpx_dir.glob('*.gpx'))

    if not gpx_files:
        print("❌ No se encontraron archivos GPX en data/raw")
        return

    print(f"🗺️  Encontrados {len(gpx_files)} archivos GPX")
    print("=" * 60)

    # Mapeo de archivos a zonas
    zone_mapping = {
        'Patruyeros puntos de referencia.gpx': 'Patruyeros',
        'Patruyeros Sendero 22 octubre.gpx': 'Patruyeros',
        'Patruyeros Zona ribereña Puerto Nariño Com. Patruyeros.gpx': 'Patruyeros',
        'Patruyeros sendero 21 octubre 2025.gpx': 'Patruyeros',
        'Hostal Pica Flor (Santa Sofía).gpx': 'Santa Sofía',
    }

    total_imported = 0

    for gpx_file in sorted(gpx_files):
        # Determinar zona
        zona = zone_mapping.get(gpx_file.name, 'General')

        # Importar
        imported = import_gpx_to_db(gpx_file, zona)
        total_imported += imported

    print("=" * 60)
    print(f"✅ Importación completada: {total_imported} puntos importados en total")

if __name__ == '__main__':
    main()
