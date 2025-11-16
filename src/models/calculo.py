"""
Modelo de Cálculo de Biomasa - Almacena resultados de cálculos de biomasa y carbono
"""

from sqlalchemy import Column, Integer, String, Float, Date, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class CalculoBiomasa(Base):
    __tablename__ = "calculos_biomasa"

    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    parcela_id = Column(Integer, ForeignKey("parcelas.id", ondelete="CASCADE"), nullable=False)

    # Modelo alométrico utilizado
    modelo_alometrico = Column(String(100))  # 'Chave2014', 'IPCC', 'IDEAM', etc.

    # Biomasa por componente (toneladas)
    biomasa_aerea = Column(Float)
    biomasa_subterranea = Column(Float)
    biomasa_necromasa = Column(Float)
    biomasa_herbaceas = Column(Float)
    biomasa_total = Column(Float)

    # Carbono almacenado (toneladas)
    carbono_aerea = Column(Float)
    carbono_subterranea = Column(Float)
    carbono_necromasa = Column(Float)
    carbono_herbaceas = Column(Float)
    carbono_total = Column(Float)

    # Factor de carbono usado
    factor_carbono = Column(Float, default=0.47)

    # Valores por hectárea
    carbono_por_hectarea = Column(Float)  # t C/ha

    # Área basal
    area_basal = Column(Float)  # m²

    # Estadísticas
    numero_arboles = Column(Integer)
    dap_promedio = Column(Float)
    altura_promedio = Column(Float)

    # Fecha de cálculo
    fecha_calculo = Column(Date)

    # Validación
    validado = Column(Boolean, default=False)
    validado_por = Column(String(100))
    fecha_validacion = Column(Date)

    # Metadatos
    observaciones = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    parcela = relationship("Parcela", back_populates="calculos")

    def __repr__(self):
        return f"<CalculoBiomasa(parcela_id={self.parcela_id}, carbono_total={self.carbono_total}t)>"

    def calcular_carbono_total(self):
        """Calcula el carbono total sumando todos los componentes"""
        componentes = [
            self.carbono_aerea or 0,
            self.carbono_subterranea or 0,
            self.carbono_necromasa or 0,
            self.carbono_herbaceas or 0
        ]
        self.carbono_total = sum(componentes)
        return self.carbono_total

    def calcular_biomasa_total(self):
        """Calcula la biomasa total sumando todos los componentes"""
        componentes = [
            self.biomasa_aerea or 0,
            self.biomasa_subterranea or 0,
            self.biomasa_necromasa or 0,
            self.biomasa_herbaceas or 0
        ]
        self.biomasa_total = sum(componentes)
        return self.biomasa_total

    def extrapolar_a_hectarea(self, area_parcela_ha=0.1):
        """
        Extrapola el carbono total a toneladas por hectárea

        Args:
            area_parcela_ha: Área de la parcela en hectáreas (default: 0.1)
        """
        if self.carbono_total:
            self.carbono_por_hectarea = self.carbono_total / area_parcela_ha
        return self.carbono_por_hectarea

    @property
    def porcentaje_carbono_aereo(self):
        """Porcentaje de carbono en biomasa aérea"""
        if self.carbono_total and self.carbono_total > 0:
            return (self.carbono_aerea / self.carbono_total) * 100
        return None

    @property
    def porcentaje_carbono_subterraneo(self):
        """Porcentaje de carbono en biomasa subterránea"""
        if self.carbono_total and self.carbono_total > 0:
            return (self.carbono_subterranea / self.carbono_total) * 100
        return None
