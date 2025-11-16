"""
Modelo de Cálculo Satelital - Almacena resultados de análisis con datos de teledetección
"""

from sqlalchemy import Column, Integer, String, Float, Date, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class CalculoSatelital(Base):
    __tablename__ = "calculos_satelitales"

    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    parcela_id = Column(Integer, ForeignKey("parcelas.id", ondelete="CASCADE"), nullable=False)

    # Periodo analizado
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)

    # Fuente de datos
    fuente_datos = Column(String(100))  # 'NASA_MODIS', 'NASA_GEDI', 'Sentinel2'
    producto = Column(String(100))  # 'MOD13Q1.061', etc.

    # Índices de vegetación (promedios del periodo)
    ndvi_promedio = Column(Float)
    ndvi_min = Column(Float)
    ndvi_max = Column(Float)
    ndvi_std = Column(Float)  # Desviación estándar

    evi_promedio = Column(Float)
    evi_min = Column(Float)
    evi_max = Column(Float)

    lai_promedio = Column(Float)  # Leaf Area Index
    ndmi_promedio = Column(Float)  # Normalized Difference Moisture Index

    # Datos estructurales (si disponibles desde GEDI)
    altura_dosel_m = Column(Float)
    cobertura_dosel_pct = Column(Float)

    # Estimaciones de biomasa y carbono
    biomasa_aerea_estimada = Column(Float)  # Toneladas (Mg)
    biomasa_por_hectarea = Column(Float)  # Mg/ha
    carbono_estimado = Column(Float)  # Toneladas de carbono
    carbono_por_hectarea = Column(Float)  # t C/ha

    # Modelo usado para estimación
    modelo_estimacion = Column(String(100))  # 'NDVI_Foody2003', 'EVI_Random_Forest', etc.
    factor_carbono = Column(Float, default=0.47)

    # Calidad de los datos
    cobertura_nubosidad_pct = Column(Float)  # % de nubosidad promedio
    num_imagenes_usadas = Column(Integer)  # Cantidad de imágenes satelitales procesadas
    calidad_datos = Column(String(50))  # 'excelente', 'buena', 'regular', 'pobre'

    # Detección de cambios
    cambio_detectado = Column(String(200))  # 'Sin cambios', 'Deforestación detectada', etc.
    alerta_generada = Column(Text)  # Descripción de alertas

    # Metadatos de la tarea
    nasa_task_id = Column(String(100))  # ID de tarea en AppEEARS
    estado_procesamiento = Column(String(50))  # 'pendiente', 'procesando', 'completado', 'error'

    # Serie temporal (JSON con valores por fecha)
    # Formato: [{"fecha": "2024-01-01", "ndvi": 0.75, "evi": 0.62}, ...]
    serie_temporal = Column(JSON)

    # Archivos generados
    archivos_descargados = Column(JSON)  # Lista de archivos GeoTIFF descargados

    # Observaciones
    observaciones = Column(Text)
    error_mensaje = Column(Text)  # Si hubo error en procesamiento

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    parcela = relationship("Parcela", back_populates="calculos_satelitales")

    def __repr__(self):
        return f"<CalculoSatelital(parcela_id={self.parcela_id}, ndvi={self.ndvi_promedio}, carbono={self.carbono_estimado}t)>"

    @property
    def dias_analizados(self):
        """Calcula la cantidad de días del periodo analizado"""
        if self.fecha_inicio and self.fecha_fin:
            return (self.fecha_fin - self.fecha_inicio).days
        return None

    @property
    def frecuencia_temporal_dias(self):
        """Calcula frecuencia promedio entre imágenes"""
        if self.num_imagenes_usadas and self.dias_analizados:
            if self.num_imagenes_usadas > 1:
                return self.dias_analizados / (self.num_imagenes_usadas - 1)
        return None

    def clasificar_calidad_ndvi(self) -> str:
        """
        Clasifica la calidad de los datos basado en NDVI y cantidad de imágenes

        Returns:
            'excelente', 'buena', 'regular', 'pobre', 'sin_datos'
        """
        if not self.ndvi_promedio or not self.num_imagenes_usadas:
            return 'sin_datos'

        # Criterios de calidad
        nubosidad = self.cobertura_nubosidad_pct if self.cobertura_nubosidad_pct is not None else 100

        if self.num_imagenes_usadas >= 10 and nubosidad < 20:
            return 'excelente'
        elif self.num_imagenes_usadas >= 5 and nubosidad < 40:
            return 'buena'
        elif self.num_imagenes_usadas >= 3:
            return 'regular'
        else:
            return 'pobre'

    def interpretar_ndvi(self) -> str:
        """
        Interpreta el valor de NDVI

        Returns:
            Descripción de la cobertura vegetal
        """
        if not self.ndvi_promedio:
            return "Sin datos"

        ndvi = self.ndvi_promedio

        if ndvi < 0.1:
            return "Sin vegetación / Agua / Suelo desnudo"
        elif ndvi < 0.3:
            return "Vegetación escasa o degradada"
        elif ndvi < 0.5:
            return "Vegetación moderada"
        elif ndvi < 0.7:
            return "Vegetación densa"
        else:
            return "Vegetación muy densa / Bosque maduro"
