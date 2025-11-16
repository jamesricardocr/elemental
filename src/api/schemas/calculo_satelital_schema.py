"""
Schemas Pydantic para Cálculos Satelitales
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import date, datetime


class CalculoSatelitalRequest(BaseModel):
    """Schema para solicitar un cálculo satelital"""
    parcela_id: int = Field(..., description="ID de la parcela a analizar")
    fecha_inicio: date = Field(..., description="Fecha de inicio del análisis")
    fecha_fin: date = Field(..., description="Fecha de fin del análisis")
    productos: Optional[List[str]] = Field(
        default=None,
        description="Productos a utilizar (default: MODIS NDVI/EVI)"
    )
    modelo_estimacion: str = Field(
        default="NDVI_Foody2003",
        description="Modelo para estimar biomasa desde índices"
    )
    factor_carbono: float = Field(
        default=0.47,
        description="Factor de conversión biomasa → carbono"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "parcela_id": 1,
                "fecha_inicio": "2024-01-01",
                "fecha_fin": "2025-11-08",
                "modelo_estimacion": "NDVI_Foody2003",
                "factor_carbono": 0.47
            }
        }


class CalculoSatelitalResponse(BaseModel):
    """Schema para respuesta de cálculo satelital"""
    id: int
    parcela_id: int

    # Periodo
    fecha_inicio: date
    fecha_fin: date
    dias_analizados: Optional[int]

    # Fuente
    fuente_datos: Optional[str]
    producto: Optional[str]

    # Índices de vegetación
    ndvi_promedio: Optional[float]
    ndvi_min: Optional[float]
    ndvi_max: Optional[float]
    ndvi_std: Optional[float]

    evi_promedio: Optional[float]
    lai_promedio: Optional[float]

    # Estructura
    altura_dosel_m: Optional[float]
    cobertura_dosel_pct: Optional[float]

    # Biomasa y carbono
    biomasa_aerea_estimada: Optional[float]
    biomasa_por_hectarea: Optional[float]
    carbono_estimado: Optional[float]
    carbono_por_hectarea: Optional[float]

    # Calidad
    cobertura_nubosidad_pct: Optional[float]
    num_imagenes_usadas: Optional[int]
    calidad_datos: Optional[str]

    # Modelo
    modelo_estimacion: Optional[str]
    factor_carbono: Optional[float]

    # Cambios
    cambio_detectado: Optional[str]

    # Estado
    estado_procesamiento: Optional[str]
    nasa_task_id: Optional[str]

    # Timestamps
    created_at: datetime

    class Config:
        from_attributes = True


class CalculoSatelitalSimple(BaseModel):
    """Schema simplificado para listado"""
    id: int
    parcela_id: int
    fecha_inicio: date
    fecha_fin: date
    ndvi_promedio: Optional[float]
    carbono_estimado: Optional[float]
    estado_procesamiento: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class CalculoSatelitalEstado(BaseModel):
    """Schema para verificar estado de procesamiento"""
    id: int
    parcela_id: int
    nasa_task_id: Optional[str]
    estado_procesamiento: str
    progreso_pct: Optional[int] = None
    mensaje: Optional[str] = None
    error_mensaje: Optional[str] = None

    class Config:
        from_attributes = True


class SerieTemporalResponse(BaseModel):
    """Schema para serie temporal de índices"""
    parcela_id: int
    periodo: str
    datos: List[Dict]  # [{"fecha": "2024-01-01", "ndvi": 0.75, "evi": 0.62}, ...]
    estadisticas: Dict  # {"ndvi_promedio": 0.75, "ndvi_max": 0.85, ...}

    class Config:
        json_schema_extra = {
            "example": {
                "parcela_id": 1,
                "periodo": "2024-01-01 a 2025-11-08",
                "datos": [
                    {"fecha": "2024-01-01", "ndvi": 0.75, "evi": 0.62},
                    {"fecha": "2024-01-17", "ndvi": 0.78, "evi": 0.64}
                ],
                "estadisticas": {
                    "ndvi_promedio": 0.76,
                    "ndvi_max": 0.85,
                    "ndvi_min": 0.65,
                    "num_observaciones": 23
                }
            }
        }
