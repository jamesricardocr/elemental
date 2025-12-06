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

    # Tipo de necromasa según protocolo
    tipo_necromasa = Column(String(50))  # 'hojarasca', 'fragmentos_finos', 'ramas_medianas', 'ramas_gruesas', 'troncos_caidos'
    tamano_cuadro = Column(String(20))  # '25x25cm' o '2x2m'

    # DEPRECADO - mantener para compatibilidad
    tipo = Column(String(50))  # 'gruesa' (>10cm) o 'fina'

    # Mediciones de campo - Pesos
    pf_total = Column(Float)  # Peso fresco total del cuadrante (kg)
    pf_submuestra = Column(Float)  # Peso fresco de submuestra (kg)
    ps_submuestra = Column(Float)  # Peso seco de submuestra (kg)

    # DEPRECADO - mantener para compatibilidad
    peso_fresco = Column(Float)  # kg
    peso_seco = Column(Float)  # kg

    # Mediciones para ramas
    n_ramas = Column(Integer)  # Número de ramas (para ramas medianas)
    circunferencia = Column(Float)  # Circunferencia medida en campo (cm) - C1 para troncos
    circunferencia_2 = Column(Float)  # C2 para troncos caídos (formula cono truncado)
    longitud = Column(Float)  # Longitud de la rama (m)
    escala_descomposicion = Column(String(50))  # 'fresco', 'poco_descompuesto', 'moderado', 'muy_descompuesto', 'desintegrado'
    densidad_madera = Column(Float)  # ρ (densidad de la madera) g/cm³

    # DEPRECADO - mantener para compatibilidad
    diametro = Column(Float)  # cm

    # Cálculos intermedios
    fraccion_seca = Column(Float)  # Fs = PS_sub / PF_sub
    area_transversal = Column(Float)  # A = π(D/2)² (cm²)
    volumen = Column(Float)  # V = A × L (cm³)

    # Resultados finales
    biomasa_seca = Column(Float)  # Biomasa seca calculada (kg)
    biomasa_01ha = Column(Float)  # Biomasa extrapolada a 0.1 ha (kg)
    carbono = Column(Float)  # Carbono = Biomasa × 0.47 (kg)
    factor_extrapolacion = Column(Integer)  # 16000 o 250 según tamaño de cuadro

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
        tipo_display = self.tipo_necromasa or self.tipo
        return f"<Necromasa(tipo='{tipo_display}', biomasa_seca={self.biomasa_seca}kg)>"

    @staticmethod
    def obtener_densidad_ipcc(escala_descomposicion):
        """
        Retorna la densidad de madera según la escala de descomposición IPCC

        Valores promedio por clase:
        - Clase 1 (Fresco): 0.70 g/cm³ (rango 0.60-0.80)
        - Clase 2 (Poco descompuesto): 0.525 g/cm³ (rango 0.45-0.60)
        - Clase 3 (Moderado): 0.375 g/cm³ (rango 0.30-0.45)
        - Clase 4 (Muy descompuesto): 0.225 g/cm³ (rango 0.15-0.30)
        - Clase 5 (Desintegrado): 0.115 g/cm³ (rango 0.08-0.15)
        """
        densidades_ipcc = {
            'fresco': 0.70,
            'poco_desc': 0.525,
            'moderado': 0.375,
            'muy_desc': 0.225,
            'desint': 0.115
        }
        return densidades_ipcc.get(escala_descomposicion)

    def calcular_todos(self):
        """
        Ejecuta todos los cálculos posibles con los datos disponibles.
        NO falla si faltan datos, simplemente no calcula ese paso.
        """
        import math

        # 1. Calcular fracción seca (si hay datos)
        if self.pf_submuestra and self.ps_submuestra and self.pf_submuestra > 0:
            self.fraccion_seca = self.ps_submuestra / self.pf_submuestra

        # 2. Determinar factor de extrapolación según tamaño de cuadro
        if self.tamano_cuadro == '25x25cm':
            self.factor_extrapolacion = 16000
        elif self.tamano_cuadro == '2x2m':
            self.factor_extrapolacion = 250

        # 3. HOJARASCA o FRAGMENTOS FINOS
        # Unidades: PFtotal, PFsub, PSsub en gramos (g)
        # Biomasa seca resultante en kilogramos (kg)
        if self.tipo_necromasa in ['hojarasca', 'fragmentos_finos']:
            if self.pf_total and self.fraccion_seca:
                biomasa_g = self.pf_total * self.fraccion_seca  # gramos
                self.biomasa_seca = biomasa_g / 1000  # convertir a kg

        # 4. TRONCOS CAÍDOS - Fórmula de cono truncado
        elif self.tipo_necromasa == 'troncos_caidos':
            # Requiere dos circunferencias (C1 y C2) para el cono truncado
            if self.circunferencia and self.circunferencia_2 and self.longitud:
                # Calcular diámetros desde circunferencias
                D1 = self.circunferencia / math.pi
                D2 = self.circunferencia_2 / math.pi

                # Calcular áreas transversales
                A1 = math.pi * (D1 / 2) ** 2
                A2 = math.pi * (D2 / 2) ** 2

                # Fórmula de cono truncado: V = (A1 + A2)/2 × L
                longitud_cm = self.longitud * 100  # convertir m a cm
                self.volumen = ((A1 + A2) / 2) * longitud_cm

                # Guardar diámetro promedio en campo deprecado
                self.diametro = (D1 + D2) / 2
                self.area_transversal = (A1 + A2) / 2

                # Calcular/asignar densidad según escala IPCC si no está definida manualmente
                if not self.densidad_madera and self.escala_descomposicion:
                    self.densidad_madera = self.obtener_densidad_ipcc(self.escala_descomposicion)

                # Calcular biomasa
                if self.densidad_madera and self.volumen:
                    biomasa_g = self.volumen * self.densidad_madera
                    self.biomasa_seca = biomasa_g / 1000  # convertir a kg

        # 5. RAMAS (medianas, gruesas) - Fórmula de cilindro
        elif self.tipo_necromasa in ['ramas_medianas', 'ramas_gruesas']:
            # Calcular diámetro desde circunferencia
            if self.circunferencia:
                diametro_cm = self.circunferencia / math.pi
                self.diametro = diametro_cm

                # Calcular área transversal: A = π(D/2)²
                radio_cm = diametro_cm / 2
                self.area_transversal = math.pi * (radio_cm ** 2)

                # Calcular volumen: V = π(D/2)² × L
                if self.longitud and self.area_transversal:
                    longitud_cm = self.longitud * 100  # convertir m a cm
                    self.volumen = self.area_transversal * longitud_cm

                    # Calcular/asignar densidad según escala IPCC si no está definida manualmente
                    if not self.densidad_madera and self.escala_descomposicion:
                        self.densidad_madera = self.obtener_densidad_ipcc(self.escala_descomposicion)

                    # Calcular biomasa: Biomasa = V × ρ
                    if self.densidad_madera and self.volumen:
                        biomasa_g = self.volumen * self.densidad_madera
                        self.biomasa_seca = biomasa_g / 1000  # convertir a kg

                        # Para ramas medianas, multiplicar por número de ramas
                        if self.tipo_necromasa == 'ramas_medianas' and self.n_ramas:
                            self.biomasa_seca = self.biomasa_seca * self.n_ramas

        # 6. Extrapolar a 0.1 ha (si hay biomasa seca y factor)
        if self.biomasa_seca and self.factor_extrapolacion:
            self.biomasa_01ha = self.biomasa_seca * self.factor_extrapolacion

        # 7. Calcular carbono (si hay biomasa extrapolada)
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
    def area_subparcela_m2(self):
        """Área del cuadro de muestreo en m²"""
        if self.tamano_cuadro == '25x25cm':
            return 0.0625  # 0.25m × 0.25m
        elif self.tamano_cuadro == '2x2m':
            return 4.0
        return 25.0  # Default legacy

    def extrapolar_por_hectarea(self):
        """DEPRECADO - usar biomasa_01ha"""
        if self.biomasa_01ha:
            return self.biomasa_01ha / 1000  # Convertir a toneladas
        return None

    @property
    def datos_completos(self):
        """Verifica si tiene todos los datos necesarios para cálculos completos"""
        if self.tipo_necromasa in ['hojarasca', 'fragmentos_finos']:
            return all([self.pf_total, self.pf_submuestra, self.ps_submuestra])
        elif self.tipo_necromasa == 'troncos_caidos':
            # Troncos caídos requiere dos circunferencias para cono truncado
            # La densidad puede venir de escala_descomposicion (IPCC) o manual
            tiene_densidad = self.densidad_madera or self.escala_descomposicion
            return all([self.circunferencia, self.circunferencia_2, self.longitud, tiene_densidad])
        elif self.tipo_necromasa in ['ramas_medianas', 'ramas_gruesas']:
            # La densidad puede venir de escala_descomposicion (IPCC) o manual
            tiene_densidad = self.densidad_madera or self.escala_descomposicion
            basicos = all([self.circunferencia, self.longitud, tiene_densidad])
            if self.tipo_necromasa == 'ramas_medianas':
                return basicos and self.n_ramas is not None
            return basicos
        return False

    @property
    def calculos_posibles(self):
        """Retorna qué cálculos se pueden realizar con los datos actuales"""
        posibles = []
        if self.pf_submuestra and self.ps_submuestra and self.pf_submuestra > 0:
            posibles.append('fraccion_seca')
        if self.fraccion_seca and self.pf_total:
            posibles.append('biomasa_seca')
        if self.circunferencia:
            posibles.append('diametro')
        if self.diametro and self.longitud:
            posibles.append('volumen')
        if self.biomasa_seca and self.factor_extrapolacion:
            posibles.append('biomasa_01ha')
        if self.biomasa_01ha:
            posibles.append('carbono')
        return posibles
