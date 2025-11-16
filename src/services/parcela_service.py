"""
Servicio de Gestión de Parcelas
CRUD completo y operaciones especializadas
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date

from src.models.parcela import Parcela
from src.utils.coordinate_converter import CoordinateConverter
from src.utils.validators import validar_parcela, validar_coordenadas
from src.utils.constants import UTM_ZONE_AMAZONAS


class ParcelaService:
    """Servicio para gestionar parcelas"""

    def __init__(self, db: Session):
        """
        Inicializa el servicio con una sesión de base de datos.

        Args:
            db: Sesión de SQLAlchemy
        """
        self.db = db
        self.converter = CoordinateConverter(UTM_ZONE_AMAZONAS)

    # ========== CRUD Básico ==========

    def crear_parcela(
        self,
        codigo: str,
        nombre: Optional[str] = None,
        zona_priorizada: Optional[str] = None,
        latitud: Optional[float] = None,
        longitud: Optional[float] = None,
        generar_vertices: bool = True,
        **kwargs
    ) -> Parcela:
        """
        Crea una nueva parcela.

        Args:
            codigo: Código único de la parcela
            nombre: Nombre descriptivo
            zona_priorizada: Zona geográfica
            latitud: Latitud del centro
            longitud: Longitud del centro
            generar_vertices: Si True, genera automáticamente los 4 vértices
            **kwargs: Otros campos opcionales

        Returns:
            Parcela creada

        Raises:
            ValueError: Si los datos no son válidos
        """
        # Validar datos básicos
        es_valido, mensaje = validar_parcela(codigo, latitud, longitud)
        if not es_valido:
            raise ValueError(mensaje)

        # Verificar que el código no exista
        existente = self.db.query(Parcela).filter(Parcela.codigo == codigo).first()
        if existente:
            raise ValueError(f"Ya existe una parcela con el código '{codigo}'")

        # Crear parcela
        parcela = Parcela(
            codigo=codigo,
            nombre=nombre,
            zona_priorizada=zona_priorizada,
            latitud=latitud,
            longitud=longitud,
            fecha_establecimiento=kwargs.get('fecha_establecimiento', date.today()),
            **{k: v for k, v in kwargs.items() if k != 'fecha_establecimiento'}
        )

        # Calcular coordenadas UTM si hay lat/lon
        if latitud and longitud:
            utm_x, utm_y = self.converter.latlon_a_utm(latitud, longitud)
            parcela.utm_x = utm_x
            parcela.utm_y = utm_y
            parcela.utm_zone = UTM_ZONE_AMAZONAS

            # Generar vértices automáticamente si se solicita
            if generar_vertices:
                vertices = self.converter.generar_vertices_rectangulo(
                    latitud, longitud,
                    ancho=20, largo=50
                )
                self._asignar_vertices(parcela, vertices)

        self.db.add(parcela)
        self.db.commit()
        self.db.refresh(parcela)

        return parcela

    def obtener_parcela(self, parcela_id: int) -> Optional[Parcela]:
        """
        Obtiene una parcela por su ID.

        Args:
            parcela_id: ID de la parcela

        Returns:
            Parcela o None si no existe
        """
        return self.db.query(Parcela).filter(Parcela.id == parcela_id).first()

    def obtener_parcela_por_codigo(self, codigo: str) -> Optional[Parcela]:
        """
        Obtiene una parcela por su código.

        Args:
            codigo: Código único de la parcela

        Returns:
            Parcela o None si no existe
        """
        return self.db.query(Parcela).filter(Parcela.codigo == codigo).first()

    def listar_parcelas(
        self,
        zona: Optional[str] = None,
        estado: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Parcela]:
        """
        Lista parcelas con filtros opcionales.

        Args:
            zona: Filtrar por zona priorizada
            estado: Filtrar por estado
            skip: Número de registros a saltar (paginación)
            limit: Número máximo de registros a retornar

        Returns:
            Lista de parcelas
        """
        query = self.db.query(Parcela)

        if zona:
            query = query.filter(Parcela.zona_priorizada == zona)

        if estado:
            query = query.filter(Parcela.estado == estado)

        return query.offset(skip).limit(limit).all()

    def actualizar_parcela(self, parcela_id: int, **kwargs) -> Optional[Parcela]:
        """
        Actualiza una parcela existente.

        Args:
            parcela_id: ID de la parcela
            **kwargs: Campos a actualizar

        Returns:
            Parcela actualizada o None si no existe
        """
        parcela = self.obtener_parcela(parcela_id)
        if not parcela:
            return None

        # Actualizar campos
        for key, value in kwargs.items():
            if hasattr(parcela, key) and value is not None:
                setattr(parcela, key, value)

        # Si se actualizan lat/lon, recalcular UTM
        if 'latitud' in kwargs or 'longitud' in kwargs:
            if parcela.latitud and parcela.longitud:
                utm_x, utm_y = self.converter.latlon_a_utm(parcela.latitud, parcela.longitud)
                parcela.utm_x = utm_x
                parcela.utm_y = utm_y

        self.db.commit()
        self.db.refresh(parcela)

        return parcela

    def eliminar_parcela(self, parcela_id: int) -> bool:
        """
        Elimina una parcela.

        Args:
            parcela_id: ID de la parcela

        Returns:
            True si se eliminó, False si no existía
        """
        parcela = self.obtener_parcela(parcela_id)
        if not parcela:
            return False

        self.db.delete(parcela)
        self.db.commit()

        return True

    # ========== Operaciones Especializadas ==========

    def _asignar_vertices(self, parcela: Parcela, vertices: List[tuple]):
        """Asigna los 4 vértices a una parcela"""
        if len(vertices) != 4:
            raise ValueError("Se requieren exactamente 4 vértices")

        parcela.vertice1_lat, parcela.vertice1_lon = vertices[0]
        parcela.vertice2_lat, parcela.vertice2_lon = vertices[1]
        parcela.vertice3_lat, parcela.vertice3_lon = vertices[2]
        parcela.vertice4_lat, parcela.vertice4_lon = vertices[3]

    def establecer_vertices_manualmente(
        self,
        parcela_id: int,
        vertices: List[tuple]
    ) -> Optional[Parcela]:
        """
        Establece los vértices de una parcela manualmente.

        Args:
            parcela_id: ID de la parcela
            vertices: Lista de 4 tuplas (lat, lon)

        Returns:
            Parcela actualizada
        """
        parcela = self.obtener_parcela(parcela_id)
        if not parcela:
            return None

        # Validar vértices
        es_valido, mensaje = validar_parcela("", vertices=vertices)
        if not es_valido:
            raise ValueError(mensaje)

        self._asignar_vertices(parcela, vertices)

        self.db.commit()
        self.db.refresh(parcela)

        return parcela

    def calcular_area_parcela(self, parcela_id: int) -> Optional[float]:
        """
        Calcula el área de una parcela en m² usando sus vértices.

        Args:
            parcela_id: ID de la parcela

        Returns:
            Área en m² o None si no tiene vértices completos
        """
        parcela = self.obtener_parcela(parcela_id)
        if not parcela:
            return None

        vertices = parcela.vertices
        if not all(v[0] and v[1] for v in vertices):
            return None

        return self.converter.calcular_area_poligono(vertices)

    def calcular_perimetro_parcela(self, parcela_id: int) -> Optional[float]:
        """
        Calcula el perímetro de una parcela en metros.

        Args:
            parcela_id: ID de la parcela

        Returns:
            Perímetro en metros o None si no tiene vértices completos
        """
        parcela = self.obtener_parcela(parcela_id)
        if not parcela:
            return None

        vertices = parcela.vertices
        if not all(v[0] and v[1] for v in vertices):
            return None

        return self.converter.calcular_perimetro_poligono(vertices)

    def obtener_parcelas_cercanas(
        self,
        latitud: float,
        longitud: float,
        radio_km: float = 5.0
    ) -> List[Dict[str, Any]]:
        """
        Obtiene parcelas cercanas a un punto dado.

        Args:
            latitud: Latitud del punto de referencia
            longitud: Longitud del punto de referencia
            radio_km: Radio de búsqueda en kilómetros

        Returns:
            Lista de diccionarios con parcelas y distancias
        """
        parcelas = self.listar_parcelas()
        resultados = []

        for parcela in parcelas:
            if parcela.latitud and parcela.longitud:
                distancia = self.converter.calcular_distancia_haversine(
                    latitud, longitud,
                    parcela.latitud, parcela.longitud
                )

                if distancia <= radio_km * 1000:  # Convertir km a metros
                    resultados.append({
                        'parcela': parcela,
                        'distancia_m': distancia,
                        'distancia_km': distancia / 1000
                    })

        # Ordenar por distancia
        resultados.sort(key=lambda x: x['distancia_m'])

        return resultados

    def obtener_estadisticas_parcela(self, parcela_id: int) -> Optional[Dict[str, Any]]:
        """
        Obtiene estadísticas de una parcela.

        Args:
            parcela_id: ID de la parcela

        Returns:
            Diccionario con estadísticas
        """
        parcela = self.obtener_parcela(parcela_id)
        if not parcela:
            return None

        return {
            'codigo': parcela.codigo,
            'nombre': parcela.nombre,
            'area_m2': self.calcular_area_parcela(parcela_id),
            'area_ha': parcela.area_hectareas,
            'perimetro_m': self.calcular_perimetro_parcela(parcela_id),
            'num_arboles': len(parcela.arboles) if parcela.arboles else 0,
            'num_necromasa': len(parcela.necromasa) if parcela.necromasa else 0,
            'num_herbaceas': len(parcela.herbaceas) if parcela.herbaceas else 0,
            'tiene_calculos': len(parcela.calculos) > 0 if parcela.calculos else False,
            'estado': parcela.estado,
            'fecha_establecimiento': parcela.fecha_establecimiento
        }

    def buscar_parcelas(self, termino: str) -> List[Parcela]:
        """
        Busca parcelas por código, nombre o zona.

        Args:
            termino: Término de búsqueda

        Returns:
            Lista de parcelas que coinciden
        """
        termino_like = f"%{termino}%"

        return self.db.query(Parcela).filter(
            or_(
                Parcela.codigo.ilike(termino_like),
                Parcela.nombre.ilike(termino_like),
                Parcela.zona_priorizada.ilike(termino_like)
            )
        ).all()

    def contar_parcelas(self, zona: Optional[str] = None, estado: Optional[str] = None) -> int:
        """
        Cuenta el número total de parcelas con filtros opcionales.

        Args:
            zona: Filtrar por zona
            estado: Filtrar por estado

        Returns:
            Número de parcelas
        """
        query = self.db.query(Parcela)

        if zona:
            query = query.filter(Parcela.zona_priorizada == zona)

        if estado:
            query = query.filter(Parcela.estado == estado)

        return query.count()
