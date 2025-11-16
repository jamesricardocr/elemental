"""
Servicio de integración con NASA AppEEARS API
Documentación: https://appeears.earthdatacloud.nasa.gov/api/
"""

import requests
import time
from typing import List, Tuple, Optional, Dict
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)


class NASAAppEEARSService:
    """
    Cliente para NASA AppEEARS API
    Permite obtener índices de vegetación (NDVI, EVI, LAI) desde datos satelitales
    """

    BASE_URL = "https://appeears.earthdatacloud.nasa.gov/api"

    def __init__(self, username: str, token: str = None, password: str = None):
        """
        Inicializa el servicio con credenciales de NASA EarthData

        Args:
            username: Usuario de NASA EarthData
            token: Token de AppEEARS (no confundir con token JWT de EarthData)
            password: Contraseña de NASA EarthData (se usa para obtener token de AppEEARS)
        """
        self.username = username
        self.token = None  # Siempre iniciar sin token
        self.password = password

        # Siempre autenticar con password para obtener token de AppEEARS
        if self.password:
            self._authenticate()
        elif token:
            # Solo usar token si se proporciona explícitamente y no hay password
            self.token = token
        else:
            raise ValueError("Debe proporcionar password para autenticarse con AppEEARS")

    def _authenticate(self) -> None:
        """Autentica y obtiene token de acceso usando password"""
        try:
            response = requests.post(
                f"{self.BASE_URL}/login",
                auth=(self.username, self.password)
            )
            response.raise_for_status()
            self.token = response.json()['token']
            logger.info("Autenticación exitosa con NASA AppEEARS")
        except requests.exceptions.RequestException as e:
            logger.error(f"Error de autenticación: {e}")
            raise Exception(f"No se pudo autenticar con NASA EarthData: {e}")

    def _get_headers(self) -> Dict[str, str]:
        """Retorna headers de autenticación"""
        if not self.token:
            self._authenticate()
        return {'Authorization': f'Bearer {self.token}'}

    def crear_tarea_ndvi(
        self,
        parcela_id: int,
        vertices: List[List[float]],
        fecha_inicio: date,
        fecha_fin: date,
        productos: Optional[List[str]] = None
    ) -> str:
        """
        Crea una tarea de extracción de datos satelitales

        Args:
            parcela_id: ID de la parcela
            vertices: Lista de coordenadas [[lat1, lon1], [lat2, lon2], ...]
            fecha_inicio: Fecha de inicio del periodo
            fecha_fin: Fecha de fin del periodo
            productos: Lista de productos a extraer (default: MODIS NDVI/EVI)

        Returns:
            task_id: ID de la tarea creada
        """

        if productos is None:
            productos = [
                {
                    'product': 'MOD13Q1.061',  # MODIS Terra Vegetation Indices 16-Day
                    'layer': '_250m_16_days_NDVI'
                },
                {
                    'product': 'MOD13Q1.061',
                    'layer': '_250m_16_days_EVI'
                }
            ]

        # Convertir vértices a formato GeoJSON (longitud, latitud)
        # AppEEARS espera [lon, lat] no [lat, lon]
        geojson_coords = [[v[1], v[0]] for v in vertices]
        # Cerrar el polígono (primer punto = último punto)
        geojson_coords.append(geojson_coords[0])

        # Calcular punto central del polígono para Point Sample
        centro_lat = sum(v[0] for v in vertices) / len(vertices)
        centro_lon = sum(v[1] for v in vertices) / len(vertices)

        task = {
            'task_type': 'point',  # Cambio a point sample para áreas pequeñas
            'task_name': f'parcela_{parcela_id}_{int(time.time())}',
            'params': {
                'dates': [
                    {
                        'startDate': fecha_inicio.strftime('%m-%d-%Y'),
                        'endDate': fecha_fin.strftime('%m-%d-%Y')
                    }
                ],
                'layers': productos,
                'coordinates': [
                    {
                        'id': f'parcela_{parcela_id}',
                        'latitude': centro_lat,
                        'longitude': centro_lon,
                        'category': 'parcela'
                    }
                ]
            }
        }

        try:
            response = requests.post(
                f"{self.BASE_URL}/task",
                json=task,
                headers=self._get_headers()
            )
            response.raise_for_status()
            task_id = response.json()['task_id']
            logger.info(f"Tarea creada: {task_id}")
            return task_id
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al crear tarea: {e}")
            raise Exception(f"Error al crear tarea en AppEEARS: {e}")

    def verificar_estado_tarea(self, task_id: str) -> Dict:
        """
        Verifica el estado de una tarea

        Args:
            task_id: ID de la tarea

        Returns:
            Dict con estado de la tarea
        """
        try:
            response = requests.get(
                f"{self.BASE_URL}/task/{task_id}",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al verificar estado: {e}")
            raise Exception(f"Error al verificar estado de tarea: {e}")

    def esperar_completacion(
        self,
        task_id: str,
        max_intentos: int = 60,
        intervalo_segundos: int = 30
    ) -> bool:
        """
        Espera a que una tarea se complete

        Args:
            task_id: ID de la tarea
            max_intentos: Número máximo de intentos
            intervalo_segundos: Segundos entre cada verificación

        Returns:
            True si completó exitosamente, False si falló
        """
        for intento in range(max_intentos):
            estado = self.verificar_estado_tarea(task_id)
            status = estado.get('status')

            logger.info(f"Intento {intento + 1}/{max_intentos}: Estado = {status}")

            if status == 'done':
                logger.info(f"Tarea {task_id} completada exitosamente")
                return True
            elif status == 'error':
                logger.error(f"Tarea {task_id} falló: {estado.get('message', 'Sin mensaje')}")
                return False

            time.sleep(intervalo_segundos)

        logger.warning(f"Tarea {task_id} no completó en tiempo esperado")
        return False

    def obtener_resultados(self, task_id: str) -> Dict:
        """
        Obtiene los resultados de una tarea completada

        Args:
            task_id: ID de la tarea

        Returns:
            Dict con información de archivos disponibles
        """
        try:
            response = requests.get(
                f"{self.BASE_URL}/bundle/{task_id}",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al obtener resultados: {e}")
            raise Exception(f"Error al obtener resultados: {e}")

    def descargar_archivo(self, task_id: str, file_id: str, destino: str) -> bool:
        """
        Descarga un archivo de resultados

        Args:
            task_id: ID de la tarea
            file_id: ID del archivo
            destino: Ruta donde guardar el archivo

        Returns:
            True si descargó exitosamente
        """
        try:
            response = requests.get(
                f"{self.BASE_URL}/bundle/{task_id}/{file_id}",
                headers=self._get_headers(),
                stream=True
            )
            response.raise_for_status()

            with open(destino, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            logger.info(f"Archivo descargado: {destino}")
            return True
        except Exception as e:
            logger.error(f"Error al descargar archivo: {e}")
            return False

    def calcular_indices_promedio(
        self,
        parcela_id: int,
        vertices: List[List[float]],
        fecha_inicio: date,
        fecha_fin: date
    ) -> Dict:
        """
        Calcula índices de vegetación promedio para una parcela
        (Versión simplificada - en producción procesaría los GeoTIFFs)

        Args:
            parcela_id: ID de la parcela
            vertices: Coordenadas del polígono
            fecha_inicio: Fecha inicial
            fecha_fin: Fecha final

        Returns:
            Dict con índices calculados
        """

        # Crear tarea
        task_id = self.crear_tarea_ndvi(
            parcela_id, vertices, fecha_inicio, fecha_fin
        )

        # Esperar completación (esto puede tomar 10-30 minutos)
        completado = self.esperar_completacion(task_id)

        if not completado:
            raise Exception("La tarea no se completó exitosamente")

        # Obtener información de resultados
        resultados = self.obtener_resultados(task_id)

        # En una implementación completa, aquí:
        # 1. Descargaríamos los archivos GeoTIFF
        # 2. Los procesaríamos con rasterio/GDAL
        # 3. Calcularíamos estadísticas (promedio, min, max, std)

        # Por ahora retornamos estructura básica
        return {
            'task_id': task_id,
            'status': 'completed',
            'archivos_disponibles': len(resultados.get('files', [])),
            'mensaje': 'Tarea completada. Procesamiento de GeoTIFF pendiente.',
            'resultados_info': resultados
        }

    def listar_productos_disponibles(self) -> List[Dict]:
        """
        Lista todos los productos disponibles en AppEEARS

        Returns:
            Lista de productos
        """
        try:
            response = requests.get(
                f"{self.BASE_URL}/product",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error al listar productos: {e}")
            return []


# Función helper para estimar biomasa desde NDVI
def estimar_biomasa_desde_ndvi(ndvi: float, area_ha: float = 0.1) -> float:
    """
    Estima biomasa aérea usando modelo empírico NDVI → Biomasa

    Basado en: Foody et al. (2003) - Tropical forest biomass estimation
    Ecuación: Biomasa (Mg/ha) = -156.03 + 625.41 × NDVI - 415.87 × NDVI²

    Args:
        ndvi: Valor de NDVI promedio (0-1)
        area_ha: Área de la parcela en hectáreas

    Returns:
        Biomasa estimada en toneladas (Mg)
    """
    if ndvi < 0 or ndvi > 1:
        raise ValueError("NDVI debe estar entre 0 y 1")

    # Modelo cuadrático calibrado para bosques tropicales
    biomasa_por_ha = -156.03 + (625.41 * ndvi) - (415.87 * ndvi ** 2)

    # Asegurar valores no negativos
    biomasa_por_ha = max(0, biomasa_por_ha)

    # Calcular biomasa total
    biomasa_total = biomasa_por_ha * area_ha

    return biomasa_total


def estimar_carbono_desde_biomasa(biomasa_mg: float, factor_carbono: float = 0.47) -> float:
    """
    Convierte biomasa a carbono almacenado

    Args:
        biomasa_mg: Biomasa en toneladas (Mg)
        factor_carbono: Factor de conversión (default: 0.47 según IPCC)

    Returns:
        Carbono almacenado en toneladas
    """
    return biomasa_mg * factor_carbono
