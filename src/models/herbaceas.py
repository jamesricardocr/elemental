"""
Modelo de Herbáceas - Representa mediciones de vegetación herbácea en cuadrantes
"""

from sqlalchemy import Column, Integer, Float, Date, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class Herbaceas(Base):
    __tablename__ = "herbaceas"

    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    parcela_id = Column(Integer, ForeignKey("parcelas.id", ondelete="CASCADE"), nullable=False)
    subparcela_id = Column(Integer, ForeignKey("subparcelas.id", ondelete="CASCADE"), nullable=True)

    # Identificación de cuadrante (1m x 1m)
    cuadrante_numero = Column(Integer)
    cuadrante_x = Column(Float)  # Posición X del cuadrante
    cuadrante_y = Column(Float)  # Posición Y del cuadrante

    # Mediciones
    peso_fresco = Column(Float)  # kg
    peso_seco = Column(Float)  # kg

    # Especies presentes (lista separada por comas)
    especies_presentes = Column(Text)
    cobertura_visual = Column(Float)  # Porcentaje de cobertura (0-100)

    # Fechas
    fecha_medicion = Column(Date)
    fecha_secado = Column(Date)

    # Metadatos
    observaciones = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    parcela = relationship("Parcela", back_populates="herbaceas")
    subparcela = relationship("Subparcela", back_populates="herbaceas")

    def __repr__(self):
        return f"<Herbaceas(cuadrante={self.cuadrante_numero}, peso_seco={self.peso_seco}kg)>"

    @property
    def relacion_seco_fresco(self):
        """Calcula la relación peso seco / peso fresco"""
        if self.peso_fresco and self.peso_fresco > 0:
            return self.peso_seco / self.peso_fresco
        return None

    @property
    def area_cuadrante_m2(self):
        """Área del cuadrante en m²"""
        return 1.0  # 1m x 1m = 1 m²

    def extrapolar_por_hectarea(self):
        """
        Extrapola el peso seco a toneladas por hectárea
        Cuadrante: 1 m² = 0.0001 ha
        1 hectárea = 10,000 m²
        """
        if self.peso_seco:
            # Factor de conversión: 1 ha / 1 m² = 10,000
            kg_por_hectarea = self.peso_seco * 10000
            return kg_por_hectarea / 1000  # Convertir a toneladas
        return None
