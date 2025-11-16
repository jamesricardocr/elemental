"""
Servicio de Necromasa
Lógica de negocio para gestión de mediciones de necromasa
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date
import math

from src.models.necromasa import Necromasa
from src.models.parcela import Parcela
from src.utils.validators import validar_peso


class NecromasaService:
    """Servicio para operaciones relacionadas con necromasa"""

    def __init__(self, db: Session):
        self.db = db

    def crear_necromasa(
        self,
        parcela_id: int,
        numero_subparcela: int,
        numero_muestra: int,
        tipo_necromasa: str,
        diametro: float,
        longitud: Optional[float] = None,
        peso_fresco: Optional[float] = None,
        peso_seco: Optional[float] = None,
        estado_descomposicion: Optional[str] = None,
        fecha_medicion: Optional[date] = None,
        observaciones: Optional[str] = None
    ) -> Necromasa:
        """
        Crea un nuevo registro de necromasa.

        Args:
            parcela_id: ID de la parcela
            numero_subparcela: Número de subparcela (5m × 5m)
            numero_muestra: Número de muestra
            tipo_necromasa: Tipo de necromasa
            diametro: Diámetro (cm)
            longitud: Longitud (m)
            peso_fresco: Peso fresco (kg)
            peso_seco: Peso seco (kg)
            estado_descomposicion: Estado de descomposición
            fecha_medicion: Fecha de medición
            observaciones: Notas adicionales

        Returns:
            Necromasa creada

        Raises:
            ValueError: Si los datos no son válidos
        """
        # Validar que la parcela existe
        parcela = self.db.query(Parcela).filter(Parcela.id == parcela_id).first()
        if not parcela:
            raise ValueError(f"La parcela con ID {parcela_id} no existe")

        # Validar pesos
        if peso_fresco is not None:
            valido, mensaje = validar_peso(peso_fresco)
            if not valido:
                raise ValueError(f"Peso fresco: {mensaje}")

        if peso_seco is not None:
            valido, mensaje = validar_peso(peso_seco)
            if not valido:
                raise ValueError(f"Peso seco: {mensaje}")

            # Validar que peso seco <= peso fresco
            if peso_fresco is not None and peso_seco > peso_fresco:
                raise ValueError("El peso seco no puede ser mayor que el peso fresco")

        # Validar diámetro
        if diametro <= 0:
            raise ValueError("El diámetro debe ser mayor que 0")

        # Crear necromasa
        nueva_necromasa = Necromasa(
            parcela_id=parcela_id,
            numero_subparcela=numero_subparcela,
            numero_muestra=numero_muestra,
            tipo_necromasa=tipo_necromasa,
            diametro=diametro,
            longitud=longitud,
            peso_fresco=peso_fresco,
            peso_seco=peso_seco,
            estado_descomposicion=estado_descomposicion,
            fecha_medicion=fecha_medicion or date.today(),
            observaciones=observaciones
        )

        self.db.add(nueva_necromasa)
        self.db.commit()
        self.db.refresh(nueva_necromasa)

        return nueva_necromasa

    def obtener_necromasa(self, necromasa_id: int) -> Optional[Necromasa]:
        """Obtiene una medición de necromasa por su ID"""
        return self.db.query(Necromasa).filter(Necromasa.id == necromasa_id).first()

    def listar_necromasa(
        self,
        parcela_id: Optional[int] = None,
        numero_subparcela: Optional[int] = None,
        tipo_necromasa: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Necromasa]:
        """
        Lista mediciones de necromasa con filtros opcionales.

        Args:
            parcela_id: Filtrar por parcela
            numero_subparcela: Filtrar por subparcela
            tipo_necromasa: Filtrar por tipo
            skip: Registros a saltar (paginación)
            limit: Número máximo de registros

        Returns:
            Lista de mediciones
        """
        query = self.db.query(Necromasa)

        if parcela_id is not None:
            query = query.filter(Necromasa.parcela_id == parcela_id)

        if numero_subparcela is not None:
            query = query.filter(Necromasa.numero_subparcela == numero_subparcela)

        if tipo_necromasa is not None:
            query = query.filter(Necromasa.tipo_necromasa == tipo_necromasa)

        return query.offset(skip).limit(limit).all()

    def contar_necromasa(
        self,
        parcela_id: Optional[int] = None,
        numero_subparcela: Optional[int] = None
    ) -> int:
        """Cuenta el número total de mediciones con filtros opcionales"""
        query = self.db.query(Necromasa)

        if parcela_id is not None:
            query = query.filter(Necromasa.parcela_id == parcela_id)

        if numero_subparcela is not None:
            query = query.filter(Necromasa.numero_subparcela == numero_subparcela)

        return query.count()

    def actualizar_necromasa(
        self,
        necromasa_id: int,
        **kwargs
    ) -> Optional[Necromasa]:
        """
        Actualiza una medición de necromasa.

        Args:
            necromasa_id: ID de la medición
            **kwargs: Campos a actualizar

        Returns:
            Necromasa actualizada o None si no existe
        """
        necromasa = self.obtener_necromasa(necromasa_id)
        if not necromasa:
            return None

        # Validar pesos si se proporcionan
        if 'peso_fresco' in kwargs and kwargs['peso_fresco'] is not None:
            valido, mensaje = validar_peso(kwargs['peso_fresco'])
            if not valido:
                raise ValueError(f"Peso fresco: {mensaje}")

        if 'peso_seco' in kwargs and kwargs['peso_seco'] is not None:
            valido, mensaje = validar_peso(kwargs['peso_seco'])
            if not valido:
                raise ValueError(f"Peso seco: {mensaje}")

        # Actualizar campos
        for key, value in kwargs.items():
            if hasattr(necromasa, key):
                setattr(necromasa, key, value)

        self.db.commit()
        self.db.refresh(necromasa)

        return necromasa

    def eliminar_necromasa(self, necromasa_id: int) -> bool:
        """
        Elimina una medición de necromasa.

        Args:
            necromasa_id: ID de la medición

        Returns:
            True si se eliminó, False si no existía
        """
        necromasa = self.obtener_necromasa(necromasa_id)
        if not necromasa:
            return False

        self.db.delete(necromasa)
        self.db.commit()

        return True

    def obtener_estadisticas_parcela(self, parcela_id: int) -> Dict[str, Any]:
        """
        Obtiene estadísticas de necromasa de una parcela.

        Args:
            parcela_id: ID de la parcela

        Returns:
            Diccionario con estadísticas
        """
        mediciones = self.listar_necromasa(parcela_id=parcela_id, limit=10000)

        if not mediciones:
            return {
                "total_mediciones": 0,
                "peso_fresco_total_kg": 0,
                "peso_seco_total_kg": 0,
                "volumen_total_m3": 0,
                "diametro_promedio_cm": 0,
                "longitud_promedio_m": 0,
                "num_subparcelas": 0,
                "distribucion_tipos": {}
            }

        pesos_frescos = [m.peso_fresco for m in mediciones if m.peso_fresco is not None]
        pesos_secos = [m.peso_seco for m in mediciones if m.peso_seco is not None]
        diametros = [m.diametro for m in mediciones]
        longitudes = [m.longitud for m in mediciones if m.longitud is not None]

        # Calcular volumen total (cilindro: π * r² * h)
        volumen_total = 0
        for m in mediciones:
            if m.diametro and m.longitud:
                radio_m = (m.diametro / 100) / 2  # Convertir cm a m y calcular radio
                volumen_m3 = math.pi * (radio_m ** 2) * m.longitud
                volumen_total += volumen_m3

        # Distribución por tipo
        tipos = {}
        for m in mediciones:
            tipo = m.tipo_necromasa or "Sin clasificar"
            tipos[tipo] = tipos.get(tipo, 0) + 1

        # Subparcelas únicas
        subparcelas_unicas = set(m.numero_subparcela for m in mediciones)

        return {
            "total_mediciones": len(mediciones),
            "peso_fresco_total_kg": sum(pesos_frescos) if pesos_frescos else 0,
            "peso_seco_total_kg": sum(pesos_secos) if pesos_secos else 0,
            "volumen_total_m3": volumen_total,
            "diametro_promedio_cm": sum(diametros) / len(diametros) if diametros else 0,
            "longitud_promedio_m": sum(longitudes) / len(longitudes) if longitudes else 0,
            "num_subparcelas": len(subparcelas_unicas),
            "distribucion_tipos": tipos
        }

    def calcular_contenido_humedad(
        self,
        parcela_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Calcula el contenido de humedad promedio de las muestras.

        Contenido de humedad (%) = ((Peso Fresco - Peso Seco) / Peso Fresco) * 100

        Args:
            parcela_id: ID de la parcela (opcional)

        Returns:
            Diccionario con estadísticas de humedad
        """
        mediciones = self.listar_necromasa(parcela_id=parcela_id, limit=10000)

        # Filtrar solo mediciones con ambos pesos
        mediciones_completas = [
            m for m in mediciones
            if m.peso_fresco is not None and m.peso_seco is not None and m.peso_fresco > 0
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

    def obtener_necromasa_por_subparcela(
        self,
        parcela_id: int
    ) -> List[Dict[str, Any]]:
        """
        Agrupa mediciones por subparcela con estadísticas.

        Args:
            parcela_id: ID de la parcela

        Returns:
            Lista de diccionarios con datos por subparcela
        """
        from sqlalchemy import func

        resultado = (
            self.db.query(
                Necromasa.numero_subparcela,
                func.count(Necromasa.id).label('cantidad'),
                func.sum(Necromasa.peso_fresco).label('peso_fresco_total'),
                func.sum(Necromasa.peso_seco).label('peso_seco_total'),
                func.avg(Necromasa.diametro).label('diametro_promedio')
            )
            .filter(Necromasa.parcela_id == parcela_id)
            .group_by(Necromasa.numero_subparcela)
            .order_by(Necromasa.numero_subparcela)
            .all()
        )

        return [
            {
                "numero_subparcela": r.numero_subparcela,
                "cantidad": r.cantidad,
                "peso_fresco_total_kg": float(r.peso_fresco_total) if r.peso_fresco_total else 0,
                "peso_seco_total_kg": float(r.peso_seco_total) if r.peso_seco_total else 0,
                "diametro_promedio_cm": float(r.diametro_promedio) if r.diametro_promedio else 0
            }
            for r in resultado
        ]

    def calcular_densidad_madera_promedio(
        self,
        parcela_id: int
    ) -> Optional[float]:
        """
        Calcula la densidad de madera promedio basada en peso seco y volumen.

        Densidad (g/cm³) = Peso Seco (g) / Volumen (cm³)

        Args:
            parcela_id: ID de la parcela

        Returns:
            Densidad promedio en g/cm³ o None si no hay datos
        """
        mediciones = self.listar_necromasa(parcela_id=parcela_id, limit=10000)

        # Filtrar mediciones con peso seco, diámetro y longitud
        mediciones_completas = [
            m for m in mediciones
            if m.peso_seco is not None and m.diametro and m.longitud
        ]

        if not mediciones_completas:
            return None

        densidades = []
        for m in mediciones_completas:
            # Calcular volumen en cm³
            radio_cm = m.diametro / 2
            longitud_cm = m.longitud * 100  # Convertir m a cm
            volumen_cm3 = math.pi * (radio_cm ** 2) * longitud_cm

            # Peso seco en g
            peso_seco_g = m.peso_seco * 1000  # Convertir kg a g

            # Densidad
            if volumen_cm3 > 0:
                densidad = peso_seco_g / volumen_cm3
                densidades.append(densidad)

        if not densidades:
            return None

        return sum(densidades) / len(densidades)
