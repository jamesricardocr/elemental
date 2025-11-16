"""
Servicio de Árboles
Lógica de negocio para gestión de mediciones de árboles
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date

from src.models.arbol import Arbol
from src.models.parcela import Parcela
from src.models.especie import Especie
from src.utils.validators import validar_dap, validar_altura


class ArbolService:
    """Servicio para operaciones relacionadas con árboles"""

    def __init__(self, db: Session):
        self.db = db

    def crear_arbol(
        self,
        parcela_id: int,
        especie_id: int,
        numero_arbol: int,
        dap: float,
        altura_total: Optional[float] = None,
        altura_comercial: Optional[float] = None,
        fecha_medicion: Optional[date] = None,
        observaciones: Optional[str] = None
    ) -> Arbol:
        """
        Crea un nuevo registro de árbol.

        Args:
            parcela_id: ID de la parcela
            especie_id: ID de la especie
            numero_arbol: Número correlativo del árbol
            dap: Diámetro a la altura del pecho (cm)
            altura_total: Altura total del árbol (m)
            altura_comercial: Altura comercial (m)
            fecha_medicion: Fecha de medición
            observaciones: Notas adicionales

        Returns:
            Árbol creado

        Raises:
            ValueError: Si los datos no son válidos
        """
        # Validar que la parcela existe
        parcela = self.db.query(Parcela).filter(Parcela.id == parcela_id).first()
        if not parcela:
            raise ValueError(f"La parcela con ID {parcela_id} no existe")

        # Validar que la especie existe
        especie = self.db.query(Especie).filter(Especie.id == especie_id).first()
        if not especie:
            raise ValueError(f"La especie con ID {especie_id} no existe")

        # Validar DAP
        valido, mensaje = validar_dap(dap)
        if not valido:
            raise ValueError(mensaje)

        # Validar alturas
        if altura_total is not None:
            valido, mensaje = validar_altura(altura_total)
            if not valido:
                raise ValueError(f"Altura total: {mensaje}")

        if altura_comercial is not None:
            valido, mensaje = validar_altura(altura_comercial)
            if not valido:
                raise ValueError(f"Altura comercial: {mensaje}")

            # Validar que altura comercial <= altura total
            if altura_total is not None and altura_comercial > altura_total:
                raise ValueError("La altura comercial no puede ser mayor que la altura total")

        # Verificar que no exista otro árbol con el mismo número en la parcela
        arbol_existente = self.db.query(Arbol).filter(
            Arbol.parcela_id == parcela_id,
            Arbol.numero_arbol == numero_arbol
        ).first()

        if arbol_existente:
            raise ValueError(
                f"Ya existe un árbol con número {numero_arbol} en la parcela {parcela.codigo}"
            )

        # Crear árbol
        nuevo_arbol = Arbol(
            parcela_id=parcela_id,
            especie_id=especie_id,
            numero_arbol=numero_arbol,
            dap=dap,
            altura_total=altura_total,
            altura_comercial=altura_comercial,
            fecha_medicion=fecha_medicion or date.today(),
            observaciones=observaciones
        )

        self.db.add(nuevo_arbol)
        self.db.commit()
        self.db.refresh(nuevo_arbol)

        return nuevo_arbol

    def obtener_arbol(self, arbol_id: int) -> Optional[Arbol]:
        """Obtiene un árbol por su ID"""
        return self.db.query(Arbol).filter(Arbol.id == arbol_id).first()

    def listar_arboles(
        self,
        parcela_id: Optional[int] = None,
        especie_id: Optional[int] = None,
        dap_minimo: Optional[float] = None,
        dap_maximo: Optional[float] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Arbol]:
        """
        Lista árboles con filtros opcionales.

        Args:
            parcela_id: Filtrar por parcela
            especie_id: Filtrar por especie
            dap_minimo: DAP mínimo
            dap_maximo: DAP máximo
            skip: Registros a saltar (paginación)
            limit: Número máximo de registros

        Returns:
            Lista de árboles
        """
        query = self.db.query(Arbol)

        if parcela_id is not None:
            query = query.filter(Arbol.parcela_id == parcela_id)

        if especie_id is not None:
            query = query.filter(Arbol.especie_id == especie_id)

        if dap_minimo is not None:
            query = query.filter(Arbol.dap >= dap_minimo)

        if dap_maximo is not None:
            query = query.filter(Arbol.dap <= dap_maximo)

        return query.offset(skip).limit(limit).all()

    def contar_arboles(
        self,
        parcela_id: Optional[int] = None,
        especie_id: Optional[int] = None
    ) -> int:
        """Cuenta el número total de árboles con filtros opcionales"""
        query = self.db.query(Arbol)

        if parcela_id is not None:
            query = query.filter(Arbol.parcela_id == parcela_id)

        if especie_id is not None:
            query = query.filter(Arbol.especie_id == especie_id)

        return query.count()

    def actualizar_arbol(
        self,
        arbol_id: int,
        **kwargs
    ) -> Optional[Arbol]:
        """
        Actualiza un árbol existente.

        Args:
            arbol_id: ID del árbol
            **kwargs: Campos a actualizar

        Returns:
            Árbol actualizado o None si no existe
        """
        arbol = self.obtener_arbol(arbol_id)
        if not arbol:
            return None

        # Validar DAP si se proporciona
        if 'dap' in kwargs:
            valido, mensaje = validar_dap(kwargs['dap'])
            if not valido:
                raise ValueError(mensaje)

        # Validar alturas si se proporcionan
        if 'altura_total' in kwargs and kwargs['altura_total'] is not None:
            valido, mensaje = validar_altura(kwargs['altura_total'])
            if not valido:
                raise ValueError(f"Altura total: {mensaje}")

        if 'altura_comercial' in kwargs and kwargs['altura_comercial'] is not None:
            valido, mensaje = validar_altura(kwargs['altura_comercial'])
            if not valido:
                raise ValueError(f"Altura comercial: {mensaje}")

        # Actualizar campos
        for key, value in kwargs.items():
            if hasattr(arbol, key):
                setattr(arbol, key, value)

        self.db.commit()
        self.db.refresh(arbol)

        return arbol

    def eliminar_arbol(self, arbol_id: int) -> bool:
        """
        Elimina un árbol.

        Args:
            arbol_id: ID del árbol

        Returns:
            True si se eliminó, False si no existía
        """
        arbol = self.obtener_arbol(arbol_id)
        if not arbol:
            return False

        self.db.delete(arbol)
        self.db.commit()

        return True

    def obtener_estadisticas_parcela(self, parcela_id: int) -> Dict[str, Any]:
        """
        Obtiene estadísticas de árboles de una parcela.

        Args:
            parcela_id: ID de la parcela

        Returns:
            Diccionario con estadísticas
        """
        arboles = self.listar_arboles(parcela_id=parcela_id, limit=10000)

        if not arboles:
            return {
                "total_arboles": 0,
                "dap_promedio": 0,
                "dap_minimo": 0,
                "dap_maximo": 0,
                "altura_promedio": 0,
                "altura_minima": 0,
                "altura_maxima": 0,
                "area_basal_total_m2": 0,
                "num_especies": 0
            }

        daps = [a.dap for a in arboles]
        alturas = [a.altura_total for a in arboles if a.altura_total is not None]
        especies_unicas = set(a.especie_id for a in arboles)

        # Calcular área basal total
        area_basal_total = sum(a.area_basal for a in arboles if a.area_basal is not None)

        return {
            "total_arboles": len(arboles),
            "dap_promedio": sum(daps) / len(daps) if daps else 0,
            "dap_minimo": min(daps) if daps else 0,
            "dap_maximo": max(daps) if daps else 0,
            "altura_promedio": sum(alturas) / len(alturas) if alturas else 0,
            "altura_minima": min(alturas) if alturas else 0,
            "altura_maxima": max(alturas) if alturas else 0,
            "area_basal_total_m2": area_basal_total,
            "num_especies": len(especies_unicas)
        }

    def obtener_distribucion_diametrica(
        self,
        parcela_id: int,
        intervalo_cm: float = 10.0
    ) -> List[Dict[str, Any]]:
        """
        Obtiene la distribución diamétrica de una parcela.

        Args:
            parcela_id: ID de la parcela
            intervalo_cm: Tamaño del intervalo de clase (cm)

        Returns:
            Lista de diccionarios con rangos y frecuencias
        """
        arboles = self.listar_arboles(parcela_id=parcela_id, limit=10000)

        if not arboles:
            return []

        # Determinar rangos
        dap_min = min(a.dap for a in arboles)
        dap_max = max(a.dap for a in arboles)

        # Crear clases diamétricas
        clases = []
        clase_inicio = (dap_min // intervalo_cm) * intervalo_cm
        clase_fin = ((dap_max // intervalo_cm) + 1) * intervalo_cm

        actual = clase_inicio
        while actual < clase_fin:
            clases.append({
                "rango_inicio": actual,
                "rango_fin": actual + intervalo_cm,
                "frecuencia": 0,
                "arboles": []
            })
            actual += intervalo_cm

        # Contar árboles en cada clase
        for arbol in arboles:
            for clase in clases:
                if clase["rango_inicio"] <= arbol.dap < clase["rango_fin"]:
                    clase["frecuencia"] += 1
                    clase["arboles"].append(arbol.id)
                    break

        return clases

    def obtener_arboles_por_especie(self, parcela_id: int) -> List[Dict[str, Any]]:
        """
        Agrupa árboles por especie con estadísticas.

        Args:
            parcela_id: ID de la parcela

        Returns:
            Lista de diccionarios con datos por especie
        """
        from sqlalchemy import func

        resultado = (
            self.db.query(
                Especie.nombre_cientifico,
                Especie.nombre_comun,
                Especie.familia,
                func.count(Arbol.id).label('cantidad'),
                func.avg(Arbol.dap).label('dap_promedio'),
                func.avg(Arbol.altura_total).label('altura_promedio')
            )
            .join(Arbol, Arbol.especie_id == Especie.id)
            .filter(Arbol.parcela_id == parcela_id)
            .group_by(Especie.id)
            .order_by(func.count(Arbol.id).desc())
            .all()
        )

        return [
            {
                "nombre_cientifico": r.nombre_cientifico,
                "nombre_comun": r.nombre_comun,
                "familia": r.familia,
                "cantidad": r.cantidad,
                "dap_promedio": float(r.dap_promedio) if r.dap_promedio else 0,
                "altura_promedio": float(r.altura_promedio) if r.altura_promedio else 0
            }
            for r in resultado
        ]

    def calcular_indice_valor_importancia(self, parcela_id: int) -> List[Dict[str, Any]]:
        """
        Calcula el Índice de Valor de Importancia (IVI) para especies en una parcela.

        IVI = Abundancia Relativa + Frecuencia Relativa + Dominancia Relativa

        Args:
            parcela_id: ID de la parcela

        Returns:
            Lista de especies con IVI
        """
        arboles = self.listar_arboles(parcela_id=parcela_id, limit=10000)

        if not arboles:
            return []

        # Total de árboles
        total_arboles = len(arboles)

        # Área basal total
        area_basal_total = sum(a.area_basal for a in arboles if a.area_basal is not None)

        # Agrupar por especie
        especies_datos = {}
        for arbol in arboles:
            especie_id = arbol.especie_id

            if especie_id not in especies_datos:
                especies_datos[especie_id] = {
                    "especie": arbol.especie,
                    "cantidad": 0,
                    "area_basal": 0
                }

            especies_datos[especie_id]["cantidad"] += 1
            if arbol.area_basal:
                especies_datos[especie_id]["area_basal"] += arbol.area_basal

        # Calcular IVI
        resultado = []
        for especie_id, datos in especies_datos.items():
            # Abundancia relativa
            abundancia_relativa = (datos["cantidad"] / total_arboles) * 100

            # Frecuencia relativa (simplificado: todas las especies están presentes)
            frecuencia_relativa = (1 / len(especies_datos)) * 100

            # Dominancia relativa
            dominancia_relativa = (
                (datos["area_basal"] / area_basal_total) * 100
                if area_basal_total > 0 else 0
            )

            # IVI
            ivi = abundancia_relativa + frecuencia_relativa + dominancia_relativa

            resultado.append({
                "especie": datos["especie"].nombre_cientifico,
                "nombre_comun": datos["especie"].nombre_comun,
                "cantidad": datos["cantidad"],
                "abundancia_relativa": abundancia_relativa,
                "frecuencia_relativa": frecuencia_relativa,
                "dominancia_relativa": dominancia_relativa,
                "ivi": ivi
            })

        # Ordenar por IVI descendente
        resultado.sort(key=lambda x: x["ivi"], reverse=True)

        return resultado
