"""
Modelo de Necromasa - Representa mediciones de biomasa muerta en subparcelas
"""

from sqlalchemy import Column, Integer, String, Float, Date, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class Necromasa(Base):
    __tablename__ = "necromasa"

    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    parcela_id = Column(Integer, ForeignKey("parcelas.id", ondelete="CASCADE"), nullable=False)
    subparcela_id = Column(Integer, ForeignKey("subparcelas.id", ondelete="CASCADE"), nullable=True)

    # Identificación de subparcela (5m x 5m)
    subparcela_numero = Column(Integer)
    subparcela_x = Column(Float)  # Posición X de la subparcela
    subparcela_y = Column(Float)  # Posición Y de la subparcela

    # Tipo de necromasa
    tipo = Column(String(50))  # 'gruesa' (>10cm) o 'fina'

    # Mediciones
    peso_fresco = Column(Float)  # kg
    peso_seco = Column(Float)  # kg

    # Dimensiones (para necromasa gruesa)
    diametro = Column(Float)  # cm
    longitud = Column(Float)  # m

    # Fechas
    fecha_medicion = Column(Date)
    fecha_secado = Column(Date)

    # Metadatos
    observaciones = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    parcela = relationship("Parcela", back_populates="necromasa")
    subparcela = relationship("Subparcela", back_populates="necromasa")

    def __repr__(self):
        return f"<Necromasa(tipo='{self.tipo}', peso_seco={self.peso_seco}kg)>"

    @property
    def relacion_seco_fresco(self):
        """Calcula la relación peso seco / peso fresco"""
        if self.peso_fresco and self.peso_fresco > 0:
            return self.peso_seco / self.peso_fresco
        return None

    @property
    def area_subparcela_m2(self):
        """Área de la subparcela en m²"""
        return 25.0  # 5m x 5m = 25 m²

    def extrapolar_por_hectarea(self):
        """
        Extrapola el peso seco a toneladas por hectárea
        Subparcela: 25 m² = 0.0025 ha
        1 hectárea = 10,000 m²
        """
        if self.peso_seco:
            # Factor de conversión: 1 ha / 25 m² = 400
            kg_por_hectarea = self.peso_seco * 400
            return kg_por_hectarea / 1000  # Convertir a toneladas
        return None
