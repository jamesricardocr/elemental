"""
Modelo de Árbol - Representa un árbol individual medido en una parcela
"""

from sqlalchemy import Column, Integer, String, Float, Date, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class Arbol(Base):
    __tablename__ = "arboles"

    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    parcela_id = Column(Integer, ForeignKey("parcelas.id", ondelete="CASCADE"), nullable=False)
    subparcela_id = Column(Integer, ForeignKey("subparcelas.id", ondelete="CASCADE"), nullable=True)
    especie_id = Column(Integer, ForeignKey("especies.id"))

    numero_arbol = Column(Integer, nullable=False)  # Número único dentro de la parcela
    codigo = Column(String(50))  # Código opcional (ej: "P01-A001")

    # Mediciones dendrométricas
    dap = Column(Float, nullable=False)  # Diámetro a la Altura del Pecho (cm) - ≥ 10 cm
    altura = Column(Float)  # Altura total (metros)

    # Ubicación dentro de la parcela
    posicion_x = Column(Float)  # Metros desde un punto de referencia
    posicion_y = Column(Float)

    # Características
    forma_fuste = Column(String(50))  # recto, torcido, bifurcado, etc.
    estado_sanitario = Column(String(100))  # sano, enfermo, muerto en pie, etc.

    # Fecha de medición
    fecha_medicion = Column(Date)

    # Metadatos
    observaciones = Column(Text)
    foto_url = Column(String(500))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    parcela = relationship("Parcela", back_populates="arboles")
    subparcela = relationship("Subparcela", back_populates="arboles")
    especie = relationship("Especie", back_populates="arboles")

    def __repr__(self):
        return f"<Arbol(numero={self.numero_arbol}, dap={self.dap}cm, altura={self.altura}m)>"

    @property
    def area_basal(self):
        """
        Calcula el área basal del árbol en m²
        Fórmula: AB = π * (DAP/2)² / 10000
        """
        if self.dap:
            import math
            radio_cm = self.dap / 2
            area_cm2 = math.pi * (radio_cm ** 2)
            return area_cm2 / 10000  # Convertir a m²
        return None

    def validar_dap(self):
        """Valida que el DAP sea mayor o igual a 10 cm"""
        return self.dap >= 10 if self.dap else False
