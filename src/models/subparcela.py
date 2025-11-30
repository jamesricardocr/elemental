"""
Modelo de Subparcela - Representa una subparcela de 10m x 10m dentro de una parcela
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class Subparcela(Base):
    __tablename__ = "subparcelas"

    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    parcela_id = Column(Integer, ForeignKey("parcelas.id", ondelete="CASCADE"), nullable=False)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    nombre = Column(String(200))

    # Vértice de origen (desde qué vértice de la parcela se genera)
    vertice_origen = Column(Integer, nullable=False)  # 1, 2, 3, o 4

    # Centro de la subparcela (calculado)
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)

    # Los 4 vértices de la subparcela (10m x 10m)
    vertice1_lat = Column(Float, nullable=False)
    vertice1_lon = Column(Float, nullable=False)
    vertice2_lat = Column(Float, nullable=False)
    vertice2_lon = Column(Float, nullable=False)
    vertice3_lat = Column(Float, nullable=False)
    vertice3_lon = Column(Float, nullable=False)
    vertice4_lat = Column(Float, nullable=False)
    vertice4_lon = Column(Float, nullable=False)

    # Metadatos
    proposito = Column(String(200))  # "Necromasa", "Herbáceas", "Muestreo específico", etc.
    observaciones = Column(Text)
    estado = Column(String(50), default="activa")  # activa, completada, inactiva

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    parcela = relationship("Parcela", back_populates="subparcelas")
    arboles = relationship("Arbol", back_populates="subparcela", cascade="all, delete-orphan")
    necromasa = relationship("Necromasa", back_populates="subparcela", cascade="all, delete-orphan")
    herbaceas = relationship("Herbaceas", back_populates="subparcela", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Subparcela(codigo='{self.codigo}', parcela_id={self.parcela_id}, origen=vertice{self.vertice_origen})>"

    @property
    def area_metros_cuadrados(self):
        """Área de la subparcela en m²"""
        return 100  # 10m x 10m = 100 m²

    @property
    def coordenadas_centro(self):
        """Devuelve las coordenadas del centro de la subparcela"""
        if self.latitud and self.longitud:
            return (self.latitud, self.longitud)
        return None

    @property
    def vertices(self):
        """Devuelve lista de vértices de la subparcela"""
        return [
            (self.vertice1_lat, self.vertice1_lon),
            (self.vertice2_lat, self.vertice2_lon),
            (self.vertice3_lat, self.vertice3_lon),
            (self.vertice4_lat, self.vertice4_lon),
        ]
