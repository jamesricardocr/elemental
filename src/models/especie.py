"""
Modelo de Especie - Catálogo de especies vegetales
"""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class Especie(Base):
    __tablename__ = "especies"

    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    nombre_comun = Column(String(200), nullable=False, index=True)
    nombre_cientifico = Column(String(200), index=True)
    familia = Column(String(100))

    # Propiedades para cálculos
    densidad_madera = Column(Float)  # g/cm³
    factor_carbono = Column(Float, default=0.47)  # Factor específico de carbono

    # Información adicional
    descripcion = Column(Text)
    usos = Column(Text)
    distribucion = Column(Text)
    observaciones = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    arboles = relationship("Arbol", back_populates="especie")

    def __repr__(self):
        return f"<Especie(nombre_comun='{self.nombre_comun}', cientifico='{self.nombre_cientifico}')>"
