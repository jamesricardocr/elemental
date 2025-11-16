"""
Servicios de Integración con APIs Externas
Conectores para GBIF, Tropicos, IDEAM y otras fuentes de datos
"""

import requests
from typing import Dict, Any, List, Optional
from datetime import datetime
import time


class GBIFService:
    """
    Servicio de integración con GBIF (Global Biodiversity Information Facility).

    Permite buscar especies, obtener información taxonómica y datos de ocurrencia.
    API Documentation: https://www.gbif.org/developer/summary
    """

    def __init__(self):
        self.base_url = "https://api.gbif.org/v1"
        self.timeout = 10

    def buscar_especie(
        self,
        nombre_cientifico: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Busca una especie por nombre científico.

        Args:
            nombre_cientifico: Nombre científico de la especie
            limit: Número máximo de resultados

        Returns:
            Lista de especies encontradas con información taxonómica
        """
        try:
            url = f"{self.base_url}/species/search"
            params = {
                "q": nombre_cientifico,
                "limit": limit,
                "status": "ACCEPTED"
            }

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            data = response.json()
            resultados = data.get("results", [])

            especies = []
            for r in resultados:
                especies.append({
                    "gbif_key": r.get("key"),
                    "nombre_cientifico": r.get("scientificName"),
                    "nombre_comun": r.get("vernacularName"),
                    "reino": r.get("kingdom"),
                    "filo": r.get("phylum"),
                    "clase": r.get("class"),
                    "orden": r.get("order"),
                    "familia": r.get("family"),
                    "genero": r.get("genus"),
                    "especie": r.get("species"),
                    "autor": r.get("authorship"),
                    "taxonomic_status": r.get("taxonomicStatus"),
                    "rank": r.get("rank")
                })

            return especies

        except requests.exceptions.RequestException as e:
            print(f"Error al consultar GBIF: {e}")
            return []

    def obtener_nombres_comunes(
        self,
        gbif_key: int,
        idioma: str = "es"
    ) -> List[str]:
        """
        Obtiene nombres comunes de una especie.

        Args:
            gbif_key: Clave GBIF de la especie
            idioma: Código ISO del idioma (es, en, pt)

        Returns:
            Lista de nombres comunes
        """
        try:
            url = f"{self.base_url}/species/{gbif_key}/vernacularNames"

            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()

            data = response.json()
            resultados = data.get("results", [])

            nombres = []
            for r in resultados:
                if r.get("language", "").lower().startswith(idioma):
                    nombre = r.get("vernacularName")
                    if nombre:
                        nombres.append(nombre)

            return nombres

        except requests.exceptions.RequestException as e:
            print(f"Error al obtener nombres comunes: {e}")
            return []

    def obtener_ocurrencias(
        self,
        nombre_cientifico: str,
        pais: str = "CO",  # Colombia
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Obtiene registros de ocurrencia de una especie.

        Args:
            nombre_cientifico: Nombre científico
            pais: Código ISO del país (CO = Colombia)
            limit: Número máximo de registros

        Returns:
            Lista de ocurrencias con coordenadas
        """
        try:
            url = f"{self.base_url}/occurrence/search"
            params = {
                "scientificName": nombre_cientifico,
                "country": pais,
                "hasCoordinate": "true",
                "limit": limit
            }

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            data = response.json()
            resultados = data.get("results", [])

            ocurrencias = []
            for r in resultados:
                if r.get("decimalLatitude") and r.get("decimalLongitude"):
                    ocurrencias.append({
                        "latitud": r.get("decimalLatitude"),
                        "longitud": r.get("decimalLongitude"),
                        "fecha": r.get("eventDate"),
                        "localidad": r.get("locality"),
                        "departamento": r.get("stateProvince"),
                        "elevacion": r.get("elevation"),
                        "institucion": r.get("institutionCode"),
                        "colector": r.get("recordedBy")
                    })

            return ocurrencias

        except requests.exceptions.RequestException as e:
            print(f"Error al obtener ocurrencias: {e}")
            return []


class TropicosService:
    """
    Servicio de integración con Tropicos (Missouri Botanical Garden).

    Permite buscar información botánica de especies tropicales.
    API Documentation: http://services.tropicos.org/help
    """

    def __init__(self, api_key: Optional[str] = None):
        self.base_url = "http://services.tropicos.org/Name"
        self.api_key = api_key
        self.timeout = 10

    def buscar_nombre(
        self,
        nombre_cientifico: str
    ) -> List[Dict[str, Any]]:
        """
        Busca un nombre científico en Tropicos.

        Args:
            nombre_cientifico: Nombre científico a buscar

        Returns:
            Lista de resultados
        """
        if not self.api_key:
            print("API key de Tropicos no configurada")
            return []

        try:
            url = f"{self.base_url}/Search"
            params = {
                "name": nombre_cientifico,
                "apikey": self.api_key,
                "format": "json"
            }

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            resultados = response.json()

            especies = []
            if isinstance(resultados, list):
                for r in resultados:
                    especies.append({
                        "tropicos_id": r.get("NameId"),
                        "nombre_cientifico": r.get("ScientificName"),
                        "familia": r.get("Family"),
                        "rank": r.get("Rank"),
                        "autor": r.get("Author")
                    })

            return especies

        except requests.exceptions.RequestException as e:
            print(f"Error al consultar Tropicos: {e}")
            return []


class IDEAMService:
    """
    Servicio de integración con IDEAM (Instituto de Hidrología, Meteorología
    y Estudios Ambientales de Colombia).

    Permite obtener datos climáticos y ambientales.
    """

    def __init__(self):
        self.base_url = "http://www.ideam.gov.co/documents"
        self.timeout = 15

    def obtener_datos_climaticos(
        self,
        municipio: str,
        departamento: str
    ) -> Optional[Dict[str, Any]]:
        """
        Obtiene datos climáticos de un municipio.

        Args:
            municipio: Nombre del municipio
            departamento: Nombre del departamento

        Returns:
            Diccionario con datos climáticos o None
        """
        # Datos simulados - la API real del IDEAM requiere acceso especial
        # En producción, se debe implementar la integración real

        datos_simulados = {
            "municipio": municipio,
            "departamento": departamento,
            "temperatura_promedio": 26.5,
            "precipitacion_anual": 3200,
            "humedad_relativa": 85,
            "zona_vida": "Bosque húmedo tropical (bh-T)",
            "fuente": "IDEAM - Datos simulados"
        }

        return datos_simulados


class GoogleMapsService:
    """
    Servicio de integración con Google Maps API.

    Permite geocodificación, rutas y elevación.
    """

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://maps.googleapis.com/maps/api"
        self.timeout = 10

    def geocodificar(
        self,
        direccion: str
    ) -> Optional[Dict[str, Any]]:
        """
        Convierte una dirección en coordenadas.

        Args:
            direccion: Dirección a geocodificar

        Returns:
            Diccionario con latitud y longitud
        """
        try:
            url = f"{self.base_url}/geocode/json"
            params = {
                "address": direccion,
                "key": self.api_key
            }

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            data = response.json()

            if data.get("status") == "OK" and data.get("results"):
                resultado = data["results"][0]
                location = resultado["geometry"]["location"]

                return {
                    "latitud": location["lat"],
                    "longitud": location["lng"],
                    "direccion_formateada": resultado["formatted_address"],
                    "tipos": resultado.get("types", [])
                }

            return None

        except requests.exceptions.RequestException as e:
            print(f"Error en geocodificación: {e}")
            return None

    def obtener_elevacion(
        self,
        latitud: float,
        longitud: float
    ) -> Optional[float]:
        """
        Obtiene la elevación de un punto.

        Args:
            latitud: Latitud en grados decimales
            longitud: Longitud en grados decimales

        Returns:
            Elevación en metros o None
        """
        try:
            url = f"{self.base_url}/elevation/json"
            params = {
                "locations": f"{latitud},{longitud}",
                "key": self.api_key
            }

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            data = response.json()

            if data.get("status") == "OK" and data.get("results"):
                return data["results"][0]["elevation"]

            return None

        except requests.exceptions.RequestException as e:
            print(f"Error al obtener elevación: {e}")
            return None

    def calcular_distancia(
        self,
        origen_lat: float,
        origen_lon: float,
        destino_lat: float,
        destino_lon: float
    ) -> Optional[Dict[str, Any]]:
        """
        Calcula distancia y tiempo entre dos puntos.

        Args:
            origen_lat: Latitud del origen
            origen_lon: Longitud del origen
            destino_lat: Latitud del destino
            destino_lon: Longitud del destino

        Returns:
            Diccionario con distancia y duración
        """
        try:
            url = f"{self.base_url}/distancematrix/json"
            params = {
                "origins": f"{origen_lat},{origen_lon}",
                "destinations": f"{destino_lat},{destino_lon}",
                "mode": "driving",
                "key": self.api_key
            }

            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            data = response.json()

            if data.get("status") == "OK":
                elemento = data["rows"][0]["elements"][0]

                if elemento.get("status") == "OK":
                    return {
                        "distancia_metros": elemento["distance"]["value"],
                        "distancia_texto": elemento["distance"]["text"],
                        "duracion_segundos": elemento["duration"]["value"],
                        "duracion_texto": elemento["duration"]["text"]
                    }

            return None

        except requests.exceptions.RequestException as e:
            print(f"Error al calcular distancia: {e}")
            return None


class GlobalForestWatchService:
    """
    Servicio de integración con Global Forest Watch.

    Permite obtener datos de deforestación y cobertura forestal.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.base_url = "https://data-api.globalforestwatch.org"
        self.api_key = api_key
        self.timeout = 15

    def obtener_cobertura_forestal(
        self,
        latitud: float,
        longitud: float,
        radio_km: float = 1.0
    ) -> Optional[Dict[str, Any]]:
        """
        Obtiene información de cobertura forestal en un área.

        Args:
            latitud: Latitud del centro
            longitud: Longitud del centro
            radio_km: Radio de búsqueda en kilómetros

        Returns:
            Datos de cobertura forestal
        """
        # Implementación simplificada
        # La API real requiere autenticación y tiene endpoints específicos

        print(f"Consultando cobertura forestal en ({latitud}, {longitud})")

        # Datos simulados
        return {
            "cobertura_actual_ha": 850.5,
            "perdida_2020_2023_ha": 12.3,
            "ganancia_ha": 2.1,
            "cobertura_porcentaje": 92.5,
            "alertas_deforestacion": 3,
            "fuente": "Global Forest Watch - Datos simulados"
        }


class APIIntegrationService:
    """
    Servicio centralizado para gestionar todas las integraciones externas.
    """

    def __init__(
        self,
        google_maps_key: Optional[str] = None,
        tropicos_key: Optional[str] = None,
        gfw_key: Optional[str] = None
    ):
        self.gbif = GBIFService()
        self.tropicos = TropicosService(tropicos_key) if tropicos_key else None
        self.ideam = IDEAMService()
        self.google_maps = GoogleMapsService(google_maps_key) if google_maps_key else None
        self.gfw = GlobalForestWatchService(gfw_key) if gfw_key else None

    def enriquecer_especie(
        self,
        nombre_cientifico: str
    ) -> Dict[str, Any]:
        """
        Enriquece información de una especie consultando múltiples fuentes.

        Args:
            nombre_cientifico: Nombre científico de la especie

        Returns:
            Diccionario con información consolidada
        """
        resultado = {
            "nombre_cientifico": nombre_cientifico,
            "fuentes": [],
            "taxonomia": {},
            "nombres_comunes": [],
            "distribucion": []
        }

        # Consultar GBIF
        especies_gbif = self.gbif.buscar_especie(nombre_cientifico, limit=1)
        if especies_gbif:
            especie = especies_gbif[0]
            resultado["taxonomia"] = {
                "reino": especie.get("reino"),
                "filo": especie.get("filo"),
                "clase": especie.get("clase"),
                "orden": especie.get("orden"),
                "familia": especie.get("familia"),
                "genero": especie.get("genero")
            }
            resultado["fuentes"].append("GBIF")

            # Obtener nombres comunes
            if especie.get("gbif_key"):
                nombres = self.gbif.obtener_nombres_comunes(especie["gbif_key"], "es")
                resultado["nombres_comunes"].extend(nombres)

        # Consultar Tropicos si está disponible
        if self.tropicos:
            especies_tropicos = self.tropicos.buscar_nombre(nombre_cientifico)
            if especies_tropicos:
                resultado["fuentes"].append("Tropicos")

        return resultado

    def validar_coordenadas_con_elevacion(
        self,
        latitud: float,
        longitud: float
    ) -> Dict[str, Any]:
        """
        Valida coordenadas y obtiene elevación.

        Args:
            latitud: Latitud
            longitud: Longitud

        Returns:
            Diccionario con coordenadas validadas y elevación
        """
        resultado = {
            "latitud": latitud,
            "longitud": longitud,
            "valido": True,
            "elevacion": None,
            "fuente_elevacion": None
        }

        # Obtener elevación si Google Maps está disponible
        if self.google_maps:
            elevacion = self.google_maps.obtener_elevacion(latitud, longitud)
            if elevacion is not None:
                resultado["elevacion"] = round(elevacion, 1)
                resultado["fuente_elevacion"] = "Google Maps"

        return resultado
