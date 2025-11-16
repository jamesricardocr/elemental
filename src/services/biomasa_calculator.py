"""
Calculadora de Biomasa
Implementa modelos alométricos para calcular biomasa aérea y carbono
"""

import math
from typing import Dict, Any, Optional, List
from datetime import date

from src.models.arbol import Arbol
from src.models.especie import Especie
from src.utils.constants import FACTOR_CARBONO, AREA_PARCELA_HA


class BiomasaCalculator:
    """
    Calculadora de biomasa usando modelos alométricos.

    Implementa:
    - Modelo Chave et al. 2014 (pantropical)
    - Modelo IPCC 2006
    - Modelo IDEAM (Colombia)
    """

    def __init__(self):
        self.factor_carbono = FACTOR_CARBONO
        self.area_parcela_ha = AREA_PARCELA_HA

    def chave_2014(
        self,
        dap: float,
        altura: Optional[float],
        densidad_madera: float
    ) -> float:
        """
        Modelo alométrico de Chave et al. 2014 para bosques tropicales.

        AGB = 0.0673 × (ρ × DAP² × H)^0.976

        Donde:
        - AGB: Biomasa aérea (kg)
        - ρ: Densidad de la madera (g/cm³)
        - DAP: Diámetro a la altura del pecho (cm)
        - H: Altura total del árbol (m)

        Args:
            dap: Diámetro a la altura del pecho (cm)
            altura: Altura total (m). Si no se tiene, se estima
            densidad_madera: Densidad de la madera (g/cm³)

        Returns:
            Biomasa aérea en kg
        """
        # Si no hay altura, estimarla usando relación DAP-Altura
        if altura is None or altura <= 0:
            altura = self._estimar_altura_chave(dap)

        # Validar densidad
        if densidad_madera <= 0 or densidad_madera > 1.5:
            # Usar densidad promedio para bosques tropicales si no es válida
            densidad_madera = 0.6

        # Calcular biomasa
        # AGB = 0.0673 × (ρ × DAP² × H)^0.976
        base = densidad_madera * (dap ** 2) * altura
        agb_kg = 0.0673 * (base ** 0.976)

        return agb_kg

    def _estimar_altura_chave(self, dap: float) -> float:
        """
        Estima altura del árbol basándose en DAP usando relación alométrica.

        H = exp(0.893 - E + 0.760 × ln(DAP) - 0.0340 × ln(DAP)²)

        Donde E es un parámetro climático. Para Amazonía colombiana E ≈ 0.0

        Args:
            dap: Diámetro a la altura del pecho (cm)

        Returns:
            Altura estimada en metros
        """
        E = 0.0  # Parámetro climático para bosque húmedo tropical
        ln_dap = math.log(dap)

        altura = math.exp(
            0.893 - E + 0.760 * ln_dap - 0.0340 * (ln_dap ** 2)
        )

        return altura

    def ipcc_2006(
        self,
        dap: float,
        densidad_madera: float,
        zona_climatica: str = "tropical_humedo"
    ) -> float:
        """
        Modelo alométrico IPCC 2006 para biomasa aérea.

        AGB = a × DAP^b

        Coeficientes para bosque tropical húmedo:
        - a = 0.11
        - b = 2.62

        Args:
            dap: Diámetro a la altura del pecho (cm)
            densidad_madera: Densidad de la madera (g/cm³)
            zona_climatica: Zona climática

        Returns:
            Biomasa aérea en kg
        """
        # Coeficientes según zona climática
        coeficientes = {
            "tropical_humedo": {"a": 0.11, "b": 2.62},
            "tropical_seco": {"a": 0.09, "b": 2.56},
            "tropical_montano": {"a": 0.08, "b": 2.50}
        }

        coef = coeficientes.get(zona_climatica, coeficientes["tropical_humedo"])

        # Calcular biomasa base
        agb_kg = coef["a"] * (dap ** coef["b"])

        # Ajustar por densidad si es muy diferente de 0.6
        if densidad_madera > 0:
            factor_densidad = densidad_madera / 0.6
            agb_kg *= factor_densidad

        return agb_kg

    def ideam_colombia(
        self,
        dap: float,
        altura: Optional[float],
        densidad_madera: float
    ) -> float:
        """
        Modelo IDEAM para bosques colombianos.

        AGB = exp(-2.4090 + 0.9522 × ln(ρ × DAP² × H))

        Args:
            dap: Diámetro a la altura del pecho (cm)
            altura: Altura total (m)
            densidad_madera: Densidad de la madera (g/cm³)

        Returns:
            Biomasa aérea en kg
        """
        # Si no hay altura, estimarla
        if altura is None or altura <= 0:
            altura = self._estimar_altura_chave(dap)

        # Validar densidad
        if densidad_madera <= 0 or densidad_madera > 1.5:
            densidad_madera = 0.6

        # Calcular biomasa
        # AGB = exp(-2.4090 + 0.9522 × ln(ρ × DAP² × H))
        base = densidad_madera * (dap ** 2) * altura

        if base <= 0:
            return 0.0

        agb_kg = math.exp(-2.4090 + 0.9522 * math.log(base))

        return agb_kg

    def calcular_biomasa_arbol(
        self,
        arbol: Arbol,
        modelo: str = "chave_2014"
    ) -> Dict[str, float]:
        """
        Calcula la biomasa de un árbol individual.

        Args:
            arbol: Objeto Arbol con mediciones
            modelo: Modelo alométrico a usar ('chave_2014', 'ipcc_2006', 'ideam')

        Returns:
            Diccionario con biomasa y carbono
        """
        # Obtener densidad de la especie
        densidad = arbol.especie.densidad_madera if arbol.especie else 0.6

        # Calcular biomasa según modelo
        if modelo == "chave_2014":
            biomasa_kg = self.chave_2014(arbol.dap, arbol.altura_total, densidad)
        elif modelo == "ipcc_2006":
            biomasa_kg = self.ipcc_2006(arbol.dap, densidad)
        elif modelo == "ideam":
            biomasa_kg = self.ideam_colombia(arbol.dap, arbol.altura_total, densidad)
        else:
            raise ValueError(f"Modelo '{modelo}' no reconocido")

        # Calcular carbono
        carbono_kg = biomasa_kg * self.factor_carbono

        # CO2 equivalente (relación molecular CO2/C = 44/12)
        co2_equivalente_kg = carbono_kg * (44 / 12)

        return {
            "biomasa_kg": biomasa_kg,
            "carbono_kg": carbono_kg,
            "co2_equivalente_kg": co2_equivalente_kg,
            "modelo_usado": modelo
        }

    def calcular_biomasa_parcela(
        self,
        arboles: List[Arbol],
        modelo: str = "chave_2014"
    ) -> Dict[str, Any]:
        """
        Calcula la biomasa total de una parcela.

        Args:
            arboles: Lista de árboles de la parcela
            modelo: Modelo alométrico a usar

        Returns:
            Diccionario con estadísticas de biomasa
        """
        if not arboles:
            return {
                "num_arboles": 0,
                "biomasa_total_kg": 0,
                "biomasa_total_mg": 0,
                "biomasa_por_hectarea_mg": 0,
                "carbono_total_kg": 0,
                "carbono_total_mg": 0,
                "carbono_por_hectarea_mg": 0,
                "co2_equivalente_total_kg": 0,
                "co2_equivalente_por_hectarea_mg": 0,
                "modelo_usado": modelo
            }

        # Calcular biomasa de cada árbol
        biomasa_total = 0
        carbono_total = 0
        co2_total = 0

        for arbol in arboles:
            resultado = self.calcular_biomasa_arbol(arbol, modelo)
            biomasa_total += resultado["biomasa_kg"]
            carbono_total += resultado["carbono_kg"]
            co2_total += resultado["co2_equivalente_kg"]

        # Convertir a megagramos (Mg = 1000 kg)
        biomasa_total_mg = biomasa_total / 1000
        carbono_total_mg = carbono_total / 1000
        co2_total_mg = co2_total / 1000

        # Extrapolar a hectárea
        biomasa_por_ha_mg = biomasa_total_mg / self.area_parcela_ha
        carbono_por_ha_mg = carbono_total_mg / self.area_parcela_ha
        co2_por_ha_mg = co2_total_mg / self.area_parcela_ha

        return {
            "num_arboles": len(arboles),
            "biomasa_total_kg": biomasa_total,
            "biomasa_total_mg": biomasa_total_mg,
            "biomasa_por_hectarea_mg": biomasa_por_ha_mg,
            "carbono_total_kg": carbono_total,
            "carbono_total_mg": carbono_total_mg,
            "carbono_por_hectarea_mg": carbono_por_ha_mg,
            "co2_equivalente_total_kg": co2_total,
            "co2_equivalente_total_mg": co2_total_mg,
            "co2_equivalente_por_hectarea_mg": co2_por_ha_mg,
            "modelo_usado": modelo,
            "area_parcela_ha": self.area_parcela_ha
        }

    def calcular_biomasa_necromasa(
        self,
        volumen_total_m3: float,
        densidad_promedio: float = 0.4
    ) -> Dict[str, float]:
        """
        Calcula biomasa de necromasa a partir del volumen.

        Biomasa = Volumen × Densidad

        Args:
            volumen_total_m3: Volumen total de necromasa (m³)
            densidad_promedio: Densidad promedio de madera muerta (g/cm³)
                              Valor típico: 0.4 para madera en descomposición

        Returns:
            Diccionario con biomasa y carbono
        """
        # Convertir volumen a cm³
        volumen_cm3 = volumen_total_m3 * 1000000

        # Calcular masa en g
        masa_g = volumen_cm3 * densidad_promedio

        # Convertir a kg
        biomasa_kg = masa_g / 1000

        # Calcular carbono
        carbono_kg = biomasa_kg * self.factor_carbono

        # CO2 equivalente
        co2_kg = carbono_kg * (44 / 12)

        # Convertir a Mg
        biomasa_mg = biomasa_kg / 1000
        carbono_mg = carbono_kg / 1000
        co2_mg = co2_kg / 1000

        # Por hectárea
        biomasa_por_ha = biomasa_mg / self.area_parcela_ha
        carbono_por_ha = carbono_mg / self.area_parcela_ha
        co2_por_ha = co2_mg / self.area_parcela_ha

        return {
            "volumen_m3": volumen_total_m3,
            "biomasa_kg": biomasa_kg,
            "biomasa_mg": biomasa_mg,
            "biomasa_por_hectarea_mg": biomasa_por_ha,
            "carbono_kg": carbono_kg,
            "carbono_mg": carbono_mg,
            "carbono_por_hectarea_mg": carbono_por_ha,
            "co2_equivalente_kg": co2_kg,
            "co2_equivalente_mg": co2_mg,
            "co2_equivalente_por_hectarea_mg": co2_por_ha
        }

    def calcular_biomasa_herbaceas(
        self,
        peso_seco_total_kg: float
    ) -> Dict[str, float]:
        """
        Calcula biomasa y carbono de vegetación herbácea.

        Args:
            peso_seco_total_kg: Peso seco total extrapolado a la parcela (kg)

        Returns:
            Diccionario con biomasa y carbono
        """
        biomasa_kg = peso_seco_total_kg

        # Calcular carbono
        carbono_kg = biomasa_kg * self.factor_carbono

        # CO2 equivalente
        co2_kg = carbono_kg * (44 / 12)

        # Convertir a Mg
        biomasa_mg = biomasa_kg / 1000
        carbono_mg = carbono_kg / 1000
        co2_mg = co2_kg / 1000

        # Por hectárea
        biomasa_por_ha = biomasa_mg / self.area_parcela_ha
        carbono_por_ha = carbono_mg / self.area_parcela_ha
        co2_por_ha = co2_mg / self.area_parcela_ha

        return {
            "biomasa_kg": biomasa_kg,
            "biomasa_mg": biomasa_mg,
            "biomasa_por_hectarea_mg": biomasa_por_ha,
            "carbono_kg": carbono_kg,
            "carbono_mg": carbono_mg,
            "carbono_por_hectarea_mg": carbono_por_ha,
            "co2_equivalente_kg": co2_kg,
            "co2_equivalente_mg": co2_mg,
            "co2_equivalente_por_hectarea_mg": co2_por_ha
        }

    def calcular_biomasa_total_parcela(
        self,
        biomasa_arborea: Dict[str, float],
        biomasa_necromasa: Dict[str, float],
        biomasa_herbaceas: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Calcula la biomasa total de la parcela sumando todos los componentes.

        Args:
            biomasa_arborea: Resultados de biomasa arbórea
            biomasa_necromasa: Resultados de biomasa de necromasa
            biomasa_herbaceas: Resultados de biomasa herbácea

        Returns:
            Diccionario con totales
        """
        # Sumar biomasas (en Mg/ha)
        biomasa_total_mgha = (
            biomasa_arborea.get("biomasa_por_hectarea_mg", 0) +
            biomasa_necromasa.get("biomasa_por_hectarea_mg", 0) +
            biomasa_herbaceas.get("biomasa_por_hectarea_mg", 0)
        )

        # Sumar carbono (en Mg/ha)
        carbono_total_mgha = (
            biomasa_arborea.get("carbono_por_hectarea_mg", 0) +
            biomasa_necromasa.get("carbono_por_hectarea_mg", 0) +
            biomasa_herbaceas.get("carbono_por_hectarea_mg", 0)
        )

        # Sumar CO2 equivalente (en Mg/ha)
        co2_total_mgha = (
            biomasa_arborea.get("co2_equivalente_por_hectarea_mg", 0) +
            biomasa_necromasa.get("co2_equivalente_por_hectarea_mg", 0) +
            biomasa_herbaceas.get("co2_equivalente_por_hectarea_mg", 0)
        )

        # Calcular porcentajes de contribución
        if biomasa_total_mgha > 0:
            porcentaje_arborea = (
                biomasa_arborea.get("biomasa_por_hectarea_mg", 0) / biomasa_total_mgha
            ) * 100
            porcentaje_necromasa = (
                biomasa_necromasa.get("biomasa_por_hectarea_mg", 0) / biomasa_total_mgha
            ) * 100
            porcentaje_herbaceas = (
                biomasa_herbaceas.get("biomasa_por_hectarea_mg", 0) / biomasa_total_mgha
            ) * 100
        else:
            porcentaje_arborea = 0
            porcentaje_necromasa = 0
            porcentaje_herbaceas = 0

        return {
            "biomasa_arborea_mgha": biomasa_arborea.get("biomasa_por_hectarea_mg", 0),
            "biomasa_necromasa_mgha": biomasa_necromasa.get("biomasa_por_hectarea_mg", 0),
            "biomasa_herbaceas_mgha": biomasa_herbaceas.get("biomasa_por_hectarea_mg", 0),
            "biomasa_total_mgha": biomasa_total_mgha,
            "carbono_total_mgha": carbono_total_mgha,
            "co2_equivalente_mgha": co2_total_mgha,
            "porcentaje_arborea": porcentaje_arborea,
            "porcentaje_necromasa": porcentaje_necromasa,
            "porcentaje_herbaceas": porcentaje_herbaceas,
            "factor_carbono_usado": self.factor_carbono,
            "area_parcela_ha": self.area_parcela_ha
        }

    def comparar_modelos(
        self,
        arboles: List[Arbol]
    ) -> Dict[str, Dict[str, float]]:
        """
        Compara los resultados de diferentes modelos alométricos.

        Args:
            arboles: Lista de árboles

        Returns:
            Diccionario con resultados por modelo
        """
        modelos = ["chave_2014", "ipcc_2006", "ideam"]
        resultados = {}

        for modelo in modelos:
            resultados[modelo] = self.calcular_biomasa_parcela(arboles, modelo)

        return resultados
