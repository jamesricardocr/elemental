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

    # Ubicación GPS del árbol (coordenadas exactas)
    latitud = Column(Float)  # Latitud GPS del árbol
    longitud = Column(Float)  # Longitud GPS del árbol

    # DEPRECADO - mantener para compatibilidad
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

    @property
    def biomasa_aerea(self):
        """
        Calcula la biomasa aérea (AGB) del árbol en kg
        Fórmula alométrica (Chave et al.): AGB = 0.0673 × (ρ × D² × H)^0.976

        Requiere:
        - DAP (D) en cm
        - Altura (H) en m
        - Densidad de madera (ρ) en g/cm³ desde la especie
        """
        if not all([self.dap, self.altura, self.especie, self.especie.densidad_madera]):
            return None

        # Extraer valores
        D = self.dap  # cm
        H = self.altura  # m
        rho = self.especie.densidad_madera  # g/cm³

        # Aplicar fórmula: AGB = 0.0673 × (ρ × D² × H)^0.976
        agb = 0.0673 * ((rho * (D ** 2) * H) ** 0.976)

        return agb  # kg

    @property
    def carbono_aereo(self):
        """
        Calcula el carbono almacenado en biomasa aérea (kg)
        Usa el factor de carbono de la especie (default 0.47)
        """
        if self.biomasa_aerea and self.especie:
            factor = self.especie.factor_carbono or 0.47
            return self.biomasa_aerea * factor
        return None

    def validar_dap(self):
        """Valida que el DAP sea mayor o igual a 10 cm"""
        return self.dap >= 10 if self.dap else False
