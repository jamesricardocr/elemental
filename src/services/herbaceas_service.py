"""
Servicio de Vegetación Herbácea
Lógica de negocio para gestión de mediciones de herbáceas
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date

from src.models.herbaceas import Herbaceas
from src.models.parcela import Parcela
from src.utils.validators import validar_peso


class HerbaceasService:
    """Servicio para operaciones relacionadas con vegetación herbácea"""

    def __init__(self, db: Session):
        self.db = db

    def crear_herbaceas(
        self,
        parcela_id: int,
        numero_cuadrante: int,
        peso_fresco: float,
        peso_seco: Optional[float] = None,
        cobertura_porcentaje: Optional[int] = None,
        altura_promedio: Optional[float] = None,
        especies_dominantes: Optional[str] = None,
        fecha_medicion: Optional[date] = None,
        observaciones: Optional[str] = None
    ) -> Herbaceas:
        """
        Crea un nuevo registro de vegetación herbácea.

        Args:
            parcela_id: ID de la parcela
            numero_cuadrante: Número del cuadrante (1m × 1m)
            peso_fresco: Peso fresco (kg)
            peso_seco: Peso seco (kg)
            cobertura_porcentaje: Porcentaje de cobertura (0-100)
            altura_promedio: Altura promedio (cm)
            especies_dominantes: Especies predominantes
            fecha_medicion: Fecha de medición
            observaciones: Notas adicionales

        Returns:
            Herbáceas creada

        Raises:
            ValueError: Si los datos no son válidos
        """
        # Validar que la parcela existe
        parcela = self.db.query(Parcela).filter(Parcela.id == parcela_id).first()
        if not parcela:
            raise ValueError(f"La parcela con ID {parcela_id} no existe")

        # Validar peso fresco
        valido, mensaje = validar_peso(peso_fresco)
        if not valido:
            raise ValueError(f"Peso fresco: {mensaje}")

        # Validar peso seco
        if peso_seco is not None:
            valido, mensaje = validar_peso(peso_seco)
            if not valido:
                raise ValueError(f"Peso seco: {mensaje}")

            # Validar que peso seco <= peso fresco
            if peso_seco > peso_fresco:
                raise ValueError("El peso seco no puede ser mayor que el peso fresco")

        # Validar cobertura
        if cobertura_porcentaje is not None:
            if not (0 <= cobertura_porcentaje <= 100):
                raise ValueError("La cobertura debe estar entre 0 y 100%")

        # Validar altura
        if altura_promedio is not None and altura_promedio < 0:
            raise ValueError("La altura no puede ser negativa")

        # Crear herbáceas
        nueva_herbaceas = Herbaceas(
            parcela_id=parcela_id,
            numero_cuadrante=numero_cuadrante,
            peso_fresco=peso_fresco,
            peso_seco=peso_seco,
            cobertura_porcentaje=cobertura_porcentaje,
            altura_promedio=altura_promedio,
            especies_dominantes=especies_dominantes,
            fecha_medicion=fecha_medicion or date.today(),
            observaciones=observaciones
        )

        self.db.add(nueva_herbaceas)
        self.db.commit()
        self.db.refresh(nueva_herbaceas)

        return nueva_herbaceas

    def obtener_herbaceas(self, herbaceas_id: int) -> Optional[Herbaceas]:
        """Obtiene una medición de herbáceas por su ID"""
        return self.db.query(Herbaceas).filter(Herbaceas.id == herbaceas_id).first()

    def listar_herbaceas(
        self,
        parcela_id: Optional[int] = None,
        numero_cuadrante: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Herbaceas]:
        """
        Lista mediciones de herbáceas con filtros opcionales.

        Args:
            parcela_id: Filtrar por parcela
            numero_cuadrante: Filtrar por cuadrante
            skip: Registros a saltar (paginación)
            limit: Número máximo de registros

        Returns:
            Lista de mediciones
        """
        query = self.db.query(Herbaceas)

        if parcela_id is not None:
            query = query.filter(Herbaceas.parcela_id == parcela_id)

        if numero_cuadrante is not None:
            query = query.filter(Herbaceas.numero_cuadrante == numero_cuadrante)

        return query.offset(skip).limit(limit).all()

    def contar_herbaceas(
        self,
        parcela_id: Optional[int] = None
    ) -> int:
        """Cuenta el número total de mediciones con filtros opcionales"""
        query = self.db.query(Herbaceas)

        if parcela_id is not None:
            query = query.filter(Herbaceas.parcela_id == parcela_id)

        return query.count()

    def actualizar_herbaceas(
        self,
        herbaceas_id: int,
        **kwargs
    ) -> Optional[Herbaceas]:
        """
        Actualiza una medición de herbáceas.

        Args:
            herbaceas_id: ID de la medición
            **kwargs: Campos a actualizar

        Returns:
            Herbáceas actualizada o None si no existe
        """
        herbaceas = self.obtener_herbaceas(herbaceas_id)
        if not herbaceas:
            return None

        # Validar pesos si se proporcionan
        if 'peso_fresco' in kwargs:
            valido, mensaje = validar_peso(kwargs['peso_fresco'])
            if not valido:
                raise ValueError(f"Peso fresco: {mensaje}")

        if 'peso_seco' in kwargs and kwargs['peso_seco'] is not None:
            valido, mensaje = validar_peso(kwargs['peso_seco'])
            if not valido:
                raise ValueError(f"Peso seco: {mensaje}")

        # Validar cobertura si se proporciona
        if 'cobertura_porcentaje' in kwargs and kwargs['cobertura_porcentaje'] is not None:
            if not (0 <= kwargs['cobertura_porcentaje'] <= 100):
                raise ValueError("La cobertura debe estar entre 0 y 100%")

        # Actualizar campos
        for key, value in kwargs.items():
            if hasattr(herbaceas, key):
                setattr(herbaceas, key, value)

        self.db.commit()
        self.db.refresh(herbaceas)

        return herbaceas

    def eliminar_herbaceas(self, herbaceas_id: int) -> bool:
        """
        Elimina una medición de herbáceas.

        Args:
            herbaceas_id: ID de la medición

        Returns:
            True si se eliminó, False si no existía
        """
        herbaceas = self.obtener_herbaceas(herbaceas_id)
        if not herbaceas:
            return False

        self.db.delete(herbaceas)
        self.db.commit()

        return True

    def obtener_estadisticas_parcela(self, parcela_id: int) -> Dict[str, Any]:
        """
        Obtiene estadísticas de herbáceas de una parcela.

        Args:
            parcela_id: ID de la parcela

        Returns:
            Diccionario con estadísticas
        """
        mediciones = self.listar_herbaceas(parcela_id=parcela_id, limit=10000)

        if not mediciones:
            return {
                "total_cuadrantes": 0,
                "peso_fresco_total_kg": 0,
                "peso_seco_total_kg": 0,
                "peso_fresco_promedio_kg": 0,
                "peso_seco_promedio_kg": 0,
                "cobertura_promedio": 0,
                "altura_promedio_cm": 0
            }

        pesos_frescos = [m.peso_fresco for m in mediciones]
        pesos_secos = [m.peso_seco for m in mediciones if m.peso_seco is not None]
        coberturas = [m.cobertura_porcentaje for m in mediciones if m.cobertura_porcentaje is not None]
        alturas = [m.altura_promedio for m in mediciones if m.altura_promedio is not None]

        return {
            "total_cuadrantes": len(mediciones),
            "peso_fresco_total_kg": sum(pesos_frescos),
            "peso_seco_total_kg": sum(pesos_secos) if pesos_secos else 0,
            "peso_fresco_promedio_kg": sum(pesos_frescos) / len(pesos_frescos),
            "peso_seco_promedio_kg": sum(pesos_secos) / len(pesos_secos) if pesos_secos else 0,
            "cobertura_promedio": sum(coberturas) / len(coberturas) if coberturas else 0,
            "altura_promedio_cm": sum(alturas) / len(alturas) if alturas else 0
        }

    def calcular_biomasa_por_cuadrante(
        self,
        parcela_id: int,
        factor_conversion: float = 0.45
    ) -> List[Dict[str, Any]]:
        """
        Calcula la biomasa por cuadrante.

        Biomasa (kg/m²) = Peso Seco / Área del cuadrante (1 m²)

        Args:
            parcela_id: ID de la parcela
            factor_conversion: Factor para convertir peso fresco a seco si no se midió

        Returns:
            Lista de cuadrantes con biomasa calculada
        """
        mediciones = self.listar_herbaceas(parcela_id=parcela_id, limit=10000)

        resultado = []
        for m in mediciones:
            # Usar peso seco medido, o estimarlo del peso fresco
            peso_seco_kg = m.peso_seco if m.peso_seco is not None else (m.peso_fresco * factor_conversion)

            # Biomasa por m² (el cuadrante es de 1m²)
            biomasa_kg_m2 = peso_seco_kg / 1.0

            resultado.append({
                "numero_cuadrante": m.numero_cuadrante,
                "peso_fresco_kg": m.peso_fresco,
                "peso_seco_kg": peso_seco_kg,
                "biomasa_kg_m2": biomasa_kg_m2,
                "cobertura_porcentaje": m.cobertura_porcentaje,
                "altura_cm": m.altura_promedio
            })

        return resultado

    def calcular_contenido_humedad(
        self,
        parcela_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Calcula el contenido de humedad promedio.

        Contenido de humedad (%) = ((Peso Fresco - Peso Seco) / Peso Fresco) * 100

        Args:
            parcela_id: ID de la parcela (opcional)

        Returns:
            Diccionario con estadísticas de humedad
        """
        mediciones = self.listar_herbaceas(parcela_id=parcela_id, limit=10000)

        # Filtrar solo mediciones con ambos pesos
        mediciones_completas = [
            m for m in mediciones
            if m.peso_seco is not None and m.peso_fresco > 0
        ]

        if not mediciones_completas:
            return {
                "num_muestras": 0,
                "contenido_humedad_promedio": 0,
                "contenido_humedad_minimo": 0,
                "contenido_humedad_maximo": 0
            }

        contenidos_humedad = []
        for m in mediciones_completas:
            contenido = ((m.peso_fresco - m.peso_seco) / m.peso_fresco) * 100
            contenidos_humedad.append(contenido)

        return {
            "num_muestras": len(mediciones_completas),
            "contenido_humedad_promedio": sum(contenidos_humedad) / len(contenidos_humedad),
            "contenido_humedad_minimo": min(contenidos_humedad),
            "contenido_humedad_maximo": max(contenidos_humedad)
        }

    def extrapolar_a_parcela(
        self,
        parcela_id: int,
        area_parcela_m2: float = 1000.0  # 0.1 ha = 1000 m²
    ) -> Dict[str, Any]:
        """
        Extrapola las mediciones de cuadrantes a la parcela completa.

        Args:
            parcela_id: ID de la parcela
            area_parcela_m2: Área total de la parcela en m²

        Returns:
            Diccionario con biomasa total extrapolada
        """
        stats = self.obtener_estadisticas_parcela(parcela_id)

        if stats["total_cuadrantes"] == 0:
            return {
                "area_parcela_m2": area_parcela_m2,
                "biomasa_total_kg": 0,
                "biomasa_por_hectarea_kg": 0,
                "biomasa_por_hectarea_mg": 0
            }

        # Biomasa promedio por m² (cada cuadrante es 1 m²)
        biomasa_promedio_kg_m2 = stats["peso_seco_promedio_kg"]

        # Extrapolar a toda la parcela
        biomasa_total_kg = biomasa_promedio_kg_m2 * area_parcela_m2

        # Convertir a por hectárea (10,000 m²)
        biomasa_por_hectarea_kg = biomasa_promedio_kg_m2 * 10000
        biomasa_por_hectarea_mg = biomasa_por_hectarea_kg / 1000  # Megagramos (Mg)

        return {
            "area_parcela_m2": area_parcela_m2,
            "num_cuadrantes_medidos": stats["total_cuadrantes"],
            "biomasa_promedio_kg_m2": biomasa_promedio_kg_m2,
            "biomasa_total_parcela_kg": biomasa_total_kg,
            "biomasa_por_hectarea_kg": biomasa_por_hectarea_kg,
            "biomasa_por_hectarea_mg": biomasa_por_hectarea_mg
        }

    def obtener_resumen_especies(
        self,
        parcela_id: int
    ) -> Dict[str, int]:
        """
        Obtiene un resumen de las especies dominantes mencionadas.

        Args:
            parcela_id: ID de la parcela

        Returns:
            Diccionario con frecuencia de cada especie/tipo
        """
        mediciones = self.listar_herbaceas(parcela_id=parcela_id, limit=10000)

        especies_contador = {}
        for m in mediciones:
            if m.especies_dominantes:
                # Dividir por comas o punto y coma
                especies = [e.strip() for e in m.especies_dominantes.replace(';', ',').split(',')]

                for especie in especies:
                    if especie:
                        especies_contador[especie] = especies_contador.get(especie, 0) + 1

        return especies_contador
