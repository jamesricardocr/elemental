"""
Modelo de Herbáceas - Representa mediciones de vegetación herbácea en cuadrantes
"""

from sqlalchemy import Column, Integer, String, Float, Date, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class Herbaceas(Base):
    __tablename__ = "herbaceas"

    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    parcela_id = Column(Integer, ForeignKey("parcelas.id", ondelete="CASCADE"), nullable=False)
    subparcela_id = Column(Integer, ForeignKey("subparcelas.id", ondelete="CASCADE"), nullable=True)

    # Identificación de cuadrante (2m x 2m = 4 m²)
    cuadrante_numero = Column(Integer)
    cuadrante_x = Column(Float)  # Posición X del cuadrante
    cuadrante_y = Column(Float)  # Posición Y del cuadrante

    # Tipo de agrupación según protocolo
    tipo_agrupacion = Column(String(50))  # 'gramineas', 'helechos', 'plantulas', 'hojas_anchas'

    # Conteo y alturas
    n_individuos = Column(Integer)  # Número de individuos en cuadrante 2×2m
    altura_maxima = Column(Float)  # Altura máxima en metros
    altura_minima = Column(Float)  # Altura mínima en metros
    altura_promedio = Column(Float)  # Altura promedio en metros

    # Mediciones de campo - Pesos
    pf_total = Column(Float)  # Peso fresco total del tipo de agrupación (kg)
    pf_submuestra = Column(Float)  # Peso fresco submuestra 200-300g (kg)
    ps_submuestra = Column(Float)  # Peso seco submuestra (kg)

    # DEPRECADO - mantener para compatibilidad
    peso_fresco = Column(Float)  # kg
    peso_seco = Column(Float)  # kg

    # Especies presentes (lista separada por comas)
    especies_presentes = Column(Text)
    cobertura_visual = Column(Float)  # Porcentaje de cobertura (0-100)

    # Cálculos
    fraccion_seca = Column(Float)  # Fs = PS_sub / PF_sub
    biomasa_seca = Column(Float)  # Biomasa seca = PF_total × Fs (kg)
    biomasa_01ha = Column(Float)  # Biomasa extrapolada a 0.1 ha = Biomasa × 250 (kg)
    carbono = Column(Float)  # Carbono = B_0.1ha × 0.47 (kg)

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
        tipo_display = self.tipo_agrupacion or 'herbaceas'
        return f"<Herbaceas(tipo='{tipo_display}', biomasa_seca={self.biomasa_seca}kg)>"

    def calcular_todos(self):
        """
        Ejecuta todos los cálculos posibles con los datos disponibles.
        NO falla si faltan datos, simplemente no calcula ese paso.
        """
        # 1. Calcular fracción seca (si hay datos)
        if self.pf_submuestra and self.ps_submuestra and self.pf_submuestra > 0:
            self.fraccion_seca = self.ps_submuestra / self.pf_submuestra

        # 2. Calcular biomasa seca
        if self.pf_total and self.fraccion_seca:
            self.biomasa_seca = self.pf_total * self.fraccion_seca

        # 3. Extrapolar a 0.1 ha (cuadro 2×2m = 4 m², factor = 250)
        if self.biomasa_seca:
            self.biomasa_01ha = self.biomasa_seca * 250

        # 4. Calcular carbono
        if self.biomasa_01ha:
            self.carbono = self.biomasa_01ha * 0.47

        # Compatibilidad con campos deprecados
        if self.biomasa_seca and not self.peso_seco:
            self.peso_seco = self.biomasa_seca

    @property
    def relacion_seco_fresco(self):
        """Calcula la relación peso seco / peso fresco (fracción seca)"""
        return self.fraccion_seca

    @property
    def area_cuadrante_m2(self):
        """Área del cuadrante en m² (2m × 2m según protocolo)"""
        return 4.0

    def extrapolar_por_hectarea(self):
        """DEPRECADO - usar biomasa_01ha"""
        if self.biomasa_01ha:
            return self.biomasa_01ha / 1000  # Convertir a toneladas
        return None

    @property
    def datos_completos(self):
        """Verifica si tiene todos los datos necesarios para cálculos completos"""
        return all([self.pf_total, self.pf_submuestra, self.ps_submuestra])

    @property
    def calculos_posibles(self):
        """Retorna qué cálculos se pueden realizar con los datos actuales"""
        posibles = []
        if self.pf_submuestra and self.ps_submuestra and self.pf_submuestra > 0:
            posibles.append('fraccion_seca')
        if self.fraccion_seca and self.pf_total:
            posibles.append('biomasa_seca')
        if self.biomasa_seca:
            posibles.append('biomasa_01ha')
        if self.biomasa_01ha:
            posibles.append('carbono')
        return posibles
