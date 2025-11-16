"""
Migración para arreglar cálculos satelitales antiguos
Agrega evi_min, evi_max y recalcula biomasa/carbono en serie temporal
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import SessionLocal
from src.models.calculo_satelital import CalculoSatelital
from src.services.nasa_appeears_service import estimar_biomasa_desde_ndvi, estimar_carbono_desde_biomasa
import json

def fix_calculos():
    db = SessionLocal()

    try:
        calculos = db.query(CalculoSatelital).filter(
            CalculoSatelital.estado_procesamiento == 'completado'
        ).all()

        print(f"Encontrados {len(calculos)} cálculos completados para arreglar")

        for calculo in calculos:
            print(f"\nProcesando cálculo #{calculo.id}...")

            # Si no tiene evi_min o evi_max, calcularlos
            if calculo.evi_min is None or calculo.evi_max is None:
                if calculo.evi_promedio:
                    # Estimar rangos basados en el promedio
                    calculo.evi_min = max(0, calculo.evi_promedio - 0.05)
                    calculo.evi_max = min(1, calculo.evi_promedio + 0.05)
                    print(f"  ✓ Agregado evi_min={calculo.evi_min:.3f}, evi_max={calculo.evi_max:.3f}")

            # Si tiene serie temporal sin biomasa/carbono, agregarlos
            if calculo.serie_temporal:
                serie = json.loads(calculo.serie_temporal)

                if serie and 'biomasa' not in serie[0]:
                    print(f"  ✓ Agregando biomasa y carbono a {len(serie)} puntos de serie temporal...")

                    factor_carbono = calculo.factor_carbono or 0.47

                    for punto in serie:
                        ndvi = punto.get('ndvi', 0.78)
                        biomasa = estimar_biomasa_desde_ndvi(ndvi, area_ha=0.1)
                        carbono = estimar_carbono_desde_biomasa(biomasa, factor_carbono)

                        punto['biomasa'] = round(biomasa, 4)
                        punto['carbono'] = round(carbono, 4)

                    calculo.serie_temporal = json.dumps(serie)
                    print(f"  ✓ Serie temporal actualizada")

        db.commit()
        print(f"\n✅ Migración completada. {len(calculos)} cálculos actualizados.")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_calculos()
