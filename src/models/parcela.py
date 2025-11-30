"""
Modelo de Parcela - Representa una parcela de 0.1 hectáreas (20m x 50m)
"""

from sqlalchemy import Column, Integer, String, Float, Date, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class Parcela(Base):
    __tablename__ = "parcelas"

    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    nombre = Column(String(200))
    zona_priorizada = Column(String(100))
    fecha_establecimiento = Column(Date)

    # Coordenadas (punto central) - Lat/Lon
    latitud = Column(Float(precision=10))
    longitud = Column(Float(precision=10))
    altitud = Column(Float)

    # Coordenadas UTM
    utm_x = Column(Float)
    utm_y = Column(Float)
    utm_zone = Column(String(10))

    # Vértices de la parcela (20m x 50m)
    vertice1_lat = Column(Float)
    vertice1_lon = Column(Float)
    vertice2_lat = Column(Float)
    vertice2_lon = Column(Float)
    vertice3_lat = Column(Float)
    vertice3_lon = Column(Float)
    vertice4_lat = Column(Float)
    vertice4_lon = Column(Float)

    # Características del sitio
    pendiente = Column(Float)  # Grados o porcentaje
    tipo_cobertura = Column(String(100))
    accesibilidad = Column(String(50))

    # Metadatos
    observaciones = Column(Text)
    croquis_url = Column(String(500))
    responsable = Column(String(100))
    estado = Column(String(50), default="activa")  # activa, completada, inactiva

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    arboles = relationship("Arbol", back_populates="parcela", cascade="all, delete-orphan")
    necromasa = relationship("Necromasa", back_populates="parcela", cascade="all, delete-orphan")
    herbaceas = relationship("Herbaceas", back_populates="parcela", cascade="all, delete-orphan")
    calculos = relationship("CalculoBiomasa", back_populates="parcela", cascade="all, delete-orphan")
    calculos_satelitales = relationship("CalculoSatelital", back_populates="parcela", cascade="all, delete-orphan")
    subparcelas = relationship("Subparcela", back_populates="parcela", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Parcela(codigo='{self.codigo}', zona='{self.zona_priorizada}')>"

    @property
    def area_hectareas(self):
        """Área de la parcela en hectáreas"""
        return 0.1

    @property
    def coordenadas_centro(self):
        """Devuelve las coordenadas del centro de la parcela"""
        if self.latitud and self.longitud:
            return (self.latitud, self.longitud)
        return None

    @property
    def vertices(self):
        """Devuelve lista de vértices de la parcela"""
        return [
            (self.vertice1_lat, self.vertice1_lon),
            (self.vertice2_lat, self.vertice2_lon),
            (self.vertice3_lat, self.vertice3_lon),
            (self.vertice4_lat, self.vertice4_lon),
        ]
