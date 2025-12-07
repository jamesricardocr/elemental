#!/usr/bin/env python3
"""
Script de migración para actualizar la base de datos de producción
Agrega columnas faltantes sin borrar datos existentes
"""

import sqlite3

def migrate_database(db_path):
    """Aplica las migraciones necesarias a la base de datos"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print(f"🔧 Migrando base de datos: {db_path}")

    # Lista de columnas a verificar/agregar por tabla
    migrations = {
        'arboles': [
            ('latitud', 'FLOAT'),
            ('longitud', 'FLOAT'),
        ],
        'necromasa': [
            ('tipo_necromasa', 'VARCHAR(50)'),
            ('tamano_cuadro', 'VARCHAR(20)'),
            ('pf_total', 'FLOAT'),
            ('pf_submuestra', 'FLOAT'),
            ('ps_submuestra', 'FLOAT'),
            ('n_ramas', 'INTEGER'),
            ('circunferencia', 'FLOAT'),
            ('circunferencia_2', 'FLOAT'),
            ('longitud', 'FLOAT'),
            ('escala_descomposicion', 'VARCHAR(50)'),
            ('densidad_madera', 'FLOAT'),
            ('fraccion_seca', 'FLOAT'),
            ('area_transversal', 'FLOAT'),
            ('volumen', 'FLOAT'),
            ('biomasa_seca', 'FLOAT'),
            ('biomasa_01ha', 'FLOAT'),
            ('carbono', 'FLOAT'),
            ('factor_extrapolacion', 'INTEGER'),
            ('fecha_secado', 'DATE'),
        ],
        'herbaceas': [
            ('tipo_agrupacion', 'VARCHAR(50)'),
            ('n_individuos', 'INTEGER'),
            ('altura_maxima', 'FLOAT'),
            ('altura_minima', 'FLOAT'),
            ('altura_promedio', 'FLOAT'),
            ('pf_total', 'FLOAT'),
            ('pf_submuestra', 'FLOAT'),
            ('ps_submuestra', 'FLOAT'),
            ('especies_presentes', 'TEXT'),
            ('cobertura_visual', 'FLOAT'),
            ('fraccion_seca', 'FLOAT'),
            ('biomasa_seca', 'FLOAT'),
            ('biomasa_01ha', 'FLOAT'),
            ('carbono', 'FLOAT'),
            ('fecha_secado', 'DATE'),
        ],
    }

    for table_name, columns in migrations.items():
        print(f"\n📊 Procesando tabla: {table_name}")

        # Obtener columnas existentes
        cursor.execute(f"PRAGMA table_info({table_name})")
        existing_columns = {row[1] for row in cursor.fetchall()}

        # Agregar columnas faltantes
        for column_name, column_type in columns:
            if column_name not in existing_columns:
                try:
                    sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"
                    cursor.execute(sql)
                    print(f"  ✅ Agregada columna: {column_name} ({column_type})")
                except sqlite3.OperationalError as e:
                    print(f"  ⚠️  Error agregando {column_name}: {e}")
            else:
                print(f"  ⏭️  Columna ya existe: {column_name}")

    # Commit cambios
    conn.commit()
    conn.close()

    print("\n✅ Migración completada exitosamente!")

if __name__ == "__main__":
    # Migrar la base de datos de producción descargada
    db_path = "/Users/jc2r/Developer/IAP/iap_database_produccion_backup.db"
    migrate_database(db_path)
