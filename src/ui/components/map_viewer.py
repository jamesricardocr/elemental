"""
Componentes de Mapa
Funciones reutilizables para crear y manipular mapas con Folium
"""

import folium
from typing import Optional, List, Tuple
from src.utils.constants import LETICIA_LAT, LETICIA_LON, LETICIA_ZOOM


def crear_mapa_base(
    centro: Optional[Tuple[float, float]] = None,
    zoom: int = 10,
    tiles: str = 'OpenStreetMap'
) -> folium.Map:
    """
    Crea un mapa base con Folium.

    Args:
        centro: Tupla (latitud, longitud) para centrar el mapa
        zoom: Nivel de zoom (1-20)
        tiles: Tipo de tiles ('OpenStreetMap', 'Stamen Terrain', etc.)

    Returns:
        Mapa de Folium
    """
    if centro is None:
        centro = (LETICIA_LAT, LETICIA_LON)
        zoom = LETICIA_ZOOM

    mapa = folium.Map(
        location=centro,
        zoom_start=zoom,
        tiles=tiles
    )

    # Agregar capas adicionales
    folium.TileLayer('Stamen Terrain', name='Terreno').add_to(mapa)
    folium.TileLayer('CartoDB positron', name='CartoDB').add_to(mapa)
    folium.TileLayer('Stamen Toner', name='Toner').add_to(mapa)

    # Control de capas
    folium.LayerControl().add_to(mapa)

    return mapa


def agregar_marcador_parcela(
    mapa: folium.Map,
    latitud: float,
    longitud: float,
    codigo: str,
    nombre: Optional[str] = None,
    estado: str = 'activa',
    popup_html: Optional[str] = None
) -> folium.Map:
    """
    Agrega un marcador de parcela al mapa.

    Args:
        mapa: Mapa de Folium
        latitud: Latitud del marcador
        longitud: Longitud del marcador
        codigo: Código de la parcela
        nombre: Nombre de la parcela
        estado: Estado de la parcela
        popup_html: HTML personalizado para el popup

    Returns:
        Mapa actualizado
    """
    # Color según estado
    color_map = {
        'activa': 'green',
        'completada': 'blue',
        'inactiva': 'gray',
        'en_proceso': 'orange'
    }
    color = color_map.get(estado, 'red')

    # Popup por defecto si no se proporciona
    if popup_html is None:
        popup_html = f"""
        <div style="font-family: Arial;">
            <h4 style="color: {color};">{codigo}</h4>
            <p><strong>Nombre:</strong> {nombre or 'N/A'}</p>
            <p><strong>Estado:</strong> {estado}</p>
        </div>
        """

    # Agregar marcador
    folium.Marker(
        location=[latitud, longitud],
        popup=folium.Popup(popup_html, max_width=300),
        tooltip=f"{codigo} - {estado}",
        icon=folium.Icon(color=color, icon='tree', prefix='fa')
    ).add_to(mapa)

    return mapa


def agregar_poligono_parcela(
    mapa: folium.Map,
    vertices: List[Tuple[float, float]],
    codigo: str,
    color: str = 'green',
    fill_opacity: float = 0.2
) -> folium.Map:
    """
    Agrega un polígono (parcela) al mapa.

    Args:
        mapa: Mapa de Folium
        vertices: Lista de tuplas (latitud, longitud)
        codigo: Código de la parcela
        color: Color del polígono
        fill_opacity: Opacidad del relleno (0-1)

    Returns:
        Mapa actualizado
    """
    if len(vertices) < 3:
        return mapa

    folium.Polygon(
        locations=vertices,
        color=color,
        fill=True,
        fill_color=color,
        fill_opacity=fill_opacity,
        weight=2,
        popup=f"Parcela {codigo}",
        tooltip=f"Parcela {codigo}"
    ).add_to(mapa)

    return mapa


def agregar_circulo_radio(
    mapa: folium.Map,
    latitud: float,
    longitud: float,
    radio_metros: float,
    color: str = 'blue',
    popup: Optional[str] = None
) -> folium.Map:
    """
    Agrega un círculo (radio de búsqueda) al mapa.

    Args:
        mapa: Mapa de Folium
        latitud: Latitud del centro
        longitud: Longitud del centro
        radio_metros: Radio en metros
        color: Color del círculo
        popup: Texto del popup

    Returns:
        Mapa actualizado
    """
    folium.Circle(
        location=[latitud, longitud],
        radius=radio_metros,
        color=color,
        fill=True,
        fill_opacity=0.1,
        popup=popup or f"Radio: {radio_metros}m",
        tooltip=f"Radio: {radio_metros/1000:.2f} km"
    ).add_to(mapa)

    return mapa
