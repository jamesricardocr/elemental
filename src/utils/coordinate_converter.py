"""
Convertidor de Coordenadas - UTM ↔ Lat/Lon
Sistema IAP - Amazonas
"""

from typing import Tuple, Optional
from pyproj import Transformer, CRS
import math


class CoordinateConverter:
    """
    Clase para convertir coordenadas entre diferentes sistemas.
    Enfocado en la zona UTM del Amazonas (18M).
    """

    def __init__(self, utm_zone: str = "18M"):
        """
        Inicializa el convertidor con una zona UTM específica.

        Args:
            utm_zone: Zona UTM (ej: "18M", "18N", "19M")
        """
        self.utm_zone = utm_zone

        # Extraer número de zona y hemisferio
        zone_number = int(''.join(filter(str.isdigit, utm_zone)))
        hemisphere = 'north' if utm_zone[-1].upper() == 'N' else 'south'

        # Crear CRS para UTM
        self.utm_crs = CRS(f"+proj=utm +zone={zone_number} +{'south' if hemisphere == 'south' else ''} +datum=WGS84 +units=m +no_defs")

        # CRS para Lat/Lon (WGS84)
        self.latlon_crs = CRS("EPSG:4326")

        # Transformadores
        self.utm_to_latlon = Transformer.from_crs(self.utm_crs, self.latlon_crs, always_xy=True)
        self.latlon_to_utm = Transformer.from_crs(self.latlon_crs, self.utm_crs, always_xy=True)

    def utm_a_latlon(self, x: float, y: float) -> Tuple[float, float]:
        """
        Convierte coordenadas UTM a Lat/Lon.

        Args:
            x: Coordenada Este (Easting) en metros
            y: Coordenada Norte (Northing) en metros

        Returns:
            Tupla (latitud, longitud) en grados decimales
        """
        lon, lat = self.utm_to_latlon.transform(x, y)
        return lat, lon

    def latlon_a_utm(self, lat: float, lon: float) -> Tuple[float, float]:
        """
        Convierte coordenadas Lat/Lon a UTM.

        Args:
            lat: Latitud en grados decimales
            lon: Longitud en grados decimales

        Returns:
            Tupla (x, y) - Coordenadas UTM en metros
        """
        x, y = self.latlon_to_utm.transform(lon, lat)
        return x, y

    @staticmethod
    def calcular_distancia_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calcula la distancia entre dos puntos usando la fórmula de Haversine.

        Args:
            lat1, lon1: Coordenadas del primer punto
            lat2, lon2: Coordenadas del segundo punto

        Returns:
            Distancia en metros
        """
        R = 6371000  # Radio de la Tierra en metros

        # Convertir a radianes
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)

        # Fórmula de Haversine
        a = math.sin(delta_lat / 2) ** 2 + \
            math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        distancia = R * c
        return distancia

    def calcular_area_poligono(self, vertices: list[Tuple[float, float]]) -> float:
        """
        Calcula el área de un polígono dado por sus vértices (Lat/Lon).
        Usa la fórmula de Shoelace convertiendo primero a UTM.

        Args:
            vertices: Lista de tuplas (latitud, longitud)

        Returns:
            Área en metros cuadrados
        """
        if len(vertices) < 3:
            return 0.0

        # Convertir todos los vértices a UTM
        vertices_utm = [self.latlon_a_utm(lat, lon) for lat, lon in vertices]

        # Fórmula de Shoelace
        area = 0.0
        n = len(vertices_utm)

        for i in range(n):
            j = (i + 1) % n
            area += vertices_utm[i][0] * vertices_utm[j][1]
            area -= vertices_utm[j][0] * vertices_utm[i][1]

        area = abs(area) / 2.0
        return area

    def calcular_perimetro_poligono(self, vertices: list[Tuple[float, float]]) -> float:
        """
        Calcula el perímetro de un polígono dado por sus vértices (Lat/Lon).

        Args:
            vertices: Lista de tuplas (latitud, longitud)

        Returns:
            Perímetro en metros
        """
        if len(vertices) < 2:
            return 0.0

        perimetro = 0.0
        n = len(vertices)

        for i in range(n):
            j = (i + 1) % n
            lat1, lon1 = vertices[i]
            lat2, lon2 = vertices[j]
            perimetro += self.calcular_distancia_haversine(lat1, lon1, lat2, lon2)

        return perimetro

    def generar_vertices_rectangulo(
        self,
        centro_lat: float,
        centro_lon: float,
        ancho: float = 20,
        largo: float = 50,
        orientacion: float = 0
    ) -> list[Tuple[float, float]]:
        """
        Genera los 4 vértices de un rectángulo dado su centro y dimensiones.

        Args:
            centro_lat: Latitud del centro
            centro_lon: Longitud del centro
            ancho: Ancho en metros (default: 20m)
            largo: Largo en metros (default: 50m)
            orientacion: Ángulo de rotación en grados desde el norte (default: 0)

        Returns:
            Lista de 4 tuplas (latitud, longitud) - vértices del rectángulo
        """
        # Convertir centro a UTM
        centro_x, centro_y = self.latlon_a_utm(centro_lat, centro_lon)

        # Calcular desplazamientos
        medio_ancho = ancho / 2
        medio_largo = largo / 2

        # Ángulo en radianes
        theta = math.radians(orientacion)
        cos_theta = math.cos(theta)
        sin_theta = math.sin(theta)

        # Calcular vértices en coordenadas locales
        vertices_local = [
            (-medio_largo, -medio_ancho),  # Inferior izquierdo
            (medio_largo, -medio_ancho),   # Inferior derecho
            (medio_largo, medio_ancho),    # Superior derecho
            (-medio_largo, medio_ancho),   # Superior izquierdo
        ]

        # Rotar y trasladar vértices
        vertices_utm = []
        for dx, dy in vertices_local:
            # Aplicar rotación
            x_rot = dx * cos_theta - dy * sin_theta
            y_rot = dx * sin_theta + dy * cos_theta

            # Trasladar al centro
            x = centro_x + x_rot
            y = centro_y + y_rot

            vertices_utm.append((x, y))

        # Convertir de UTM a Lat/Lon
        vertices_latlon = [self.utm_a_latlon(x, y) for x, y in vertices_utm]

        return vertices_latlon


# Funciones de conveniencia para uso rápido
_converter_default = None


def get_converter(utm_zone: str = "18M") -> CoordinateConverter:
    """Obtiene una instancia del convertidor (singleton para zona por defecto)"""
    global _converter_default
    if _converter_default is None or _converter_default.utm_zone != utm_zone:
        _converter_default = CoordinateConverter(utm_zone)
    return _converter_default


def convertir_utm_a_latlon(x: float, y: float, utm_zone: str = "18M") -> Tuple[float, float]:
    """
    Función de conveniencia para convertir UTM a Lat/Lon.

    Args:
        x: Coordenada Este (Easting)
        y: Coordenada Norte (Northing)
        utm_zone: Zona UTM (default: "18M" para Amazonas)

    Returns:
        Tupla (latitud, longitud)
    """
    converter = get_converter(utm_zone)
    return converter.utm_a_latlon(x, y)


def convertir_latlon_a_utm(lat: float, lon: float, utm_zone: str = "18M") -> Tuple[float, float]:
    """
    Función de conveniencia para convertir Lat/Lon a UTM.

    Args:
        lat: Latitud
        lon: Longitud
        utm_zone: Zona UTM (default: "18M" para Amazonas)

    Returns:
        Tupla (x, y) en coordenadas UTM
    """
    converter = get_converter(utm_zone)
    return converter.latlon_a_utm(lat, lon)


# Ejemplo de uso
if __name__ == "__main__":
    # Crear convertidor para la zona del Amazonas
    conv = CoordinateConverter("18M")

    # Coordenadas de Leticia, Amazonas
    leticia_lat = -4.2156
    leticia_lon = -69.9406

    print(f"Leticia - Lat/Lon: {leticia_lat}, {leticia_lon}")

    # Convertir a UTM
    x, y = conv.latlon_a_utm(leticia_lat, leticia_lon)
    print(f"Leticia - UTM: X={x:.2f}, Y={y:.2f}")

    # Convertir de vuelta a Lat/Lon
    lat, lon = conv.utm_a_latlon(x, y)
    print(f"Verificación - Lat/Lon: {lat:.6f}, {lon:.6f}")

    # Generar vértices de una parcela de 20m × 50m
    vertices = conv.generar_vertices_rectangulo(leticia_lat, leticia_lon, ancho=20, largo=50)
    print(f"\nVértices de parcela 20m × 50m:")
    for i, (lat, lon) in enumerate(vertices, 1):
        print(f"  Vértice {i}: {lat:.8f}, {lon:.8f}")

    # Calcular área
    area = conv.calcular_area_poligono(vertices)
    print(f"\nÁrea calculada: {area:.2f} m² ({area/10000:.4f} ha)")

    # Calcular perímetro
    perimetro = conv.calcular_perimetro_poligono(vertices)
    print(f"Perímetro: {perimetro:.2f} m")
