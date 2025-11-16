"""
Página: Mapa de Parcelas
Visualización geoespacial de parcelas con Google Maps API
"""

import streamlit as st
import streamlit.components.v1 as components
import sys
from pathlib import Path
import json

# Agregar el directorio raíz al path
root_dir = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(root_dir))

from config.database import SessionLocal
from config.settings import get_settings
from src.services.parcela_service import ParcelaService
from src.utils.constants import LETICIA_LAT, LETICIA_LON

# Obtener configuración
settings = get_settings()
GOOGLE_API_KEY = settings.GOOGLE_MAPS_API_KEY


# Configuración de página
st.set_page_config(
    page_title="Mapa de Parcelas - IAP",
    page_icon="📍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS para eliminar TODOS los paddings y márgenes
st.markdown("""
<style>
    /* Eliminar TODO el padding y margin */
    .main .block-container {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
    }

    /* Ocultar elementos de Streamlit */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* Hacer que el contenedor ocupe todo */
    .stApp {
        margin: 0 !important;
        padding: 0 !important;
    }

    section[data-testid="stSidebar"] {
        background-color: #f8f9fa;
    }
</style>
""", unsafe_allow_html=True)


def crear_mapa_html(parcelas, api_key):
    """Crea el HTML del mapa de Google Maps con las parcelas"""

    # Preparar datos de parcelas para JavaScript
    parcelas_data = []
    for p in parcelas:
        if p.latitud and p.longitud:
            parcelas_data.append({
                'codigo': p.codigo,
                'nombre': p.nombre or 'N/A',
                'zona': p.zona_priorizada or 'N/A',
                'estado': p.estado,
                'lat': p.latitud,
                'lng': p.longitud,
                'vertices': p.vertices if hasattr(p, 'vertices') else []
            })

    parcelas_json = json.dumps(parcelas_data)

    # Determinar centro del mapa
    if parcelas_data:
        center_lat = parcelas_data[0]['lat']
        center_lng = parcelas_data[0]['lng']
        zoom = 14
    else:
        center_lat = LETICIA_LAT
        center_lng = LETICIA_LON
        zoom = 12

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            html, body {{
                height: 100%;
                width: 100%;
                overflow: hidden;
            }}
            #map {{
                height: 100vh;
                width: 100%;
            }}
        </style>
    </head>
    <body>
        <div id="map"></div>

        <script>
            let map;
            let markers = [];
            let polygons = [];

            const parcelas = {parcelas_json};

            const colorMap = {{
                'activa': '#28a745',
                'completada': '#007bff',
                'inactiva': '#6c757d',
                'en_proceso': '#fd7e14'
            }};

            function initMap() {{
                // Crear mapa con Google Satélite
                map = new google.maps.Map(document.getElementById('map'), {{
                    center: {{ lat: {center_lat}, lng: {center_lng} }},
                    zoom: {zoom},
                    mapTypeId: 'satellite',
                    mapTypeControl: true,
                    mapTypeControlOptions: {{
                        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                        position: google.maps.ControlPosition.TOP_LEFT,
                        mapTypeIds: ['satellite', 'hybrid', 'roadmap', 'terrain']
                    }},
                    fullscreenControl: true,
                    streetViewControl: false,
                    zoomControl: true,
                    zoomControlOptions: {{
                        position: google.maps.ControlPosition.RIGHT_CENTER
                    }}
                }});

                // Agregar parcelas al mapa
                parcelas.forEach(parcela => {{
                    const color = colorMap[parcela.estado] || '#dc3545';

                    // Crear marcador
                    const marker = new google.maps.Marker({{
                        position: {{ lat: parcela.lat, lng: parcela.lng }},
                        map: map,
                        title: parcela.codigo,
                        icon: {{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: color,
                            fillOpacity: 0.9,
                            strokeColor: '#ffffff',
                            strokeWeight: 2
                        }}
                    }});

                    // Crear info window
                    const infoContent = `
                        <div style="font-family: Arial; padding: 10px; min-width: 200px;">
                            <h3 style="color: ${{color}}; margin: 0 0 10px 0;">${{parcela.codigo}}</h3>
                            <p style="margin: 5px 0;"><strong>Nombre:</strong> ${{parcela.nombre}}</p>
                            <p style="margin: 5px 0;"><strong>Zona:</strong> ${{parcela.zona}}</p>
                            <p style="margin: 5px 0;"><strong>Estado:</strong> ${{parcela.estado}}</p>
                            <p style="margin: 5px 0;"><strong>Coords:</strong> ${{parcela.lat.toFixed(6)}}, ${{parcela.lng.toFixed(6)}}</p>
                        </div>
                    `;

                    const infoWindow = new google.maps.InfoWindow({{
                        content: infoContent
                    }});

                    marker.addListener('click', () => {{
                        infoWindow.open(map, marker);
                    }});

                    markers.push(marker);

                    // Dibujar polígono si tiene vértices
                    if (parcela.vertices && parcela.vertices.length === 4) {{
                        const vertices = parcela.vertices.map(v => ({{ lat: v[0], lng: v[1] }}));

                        // Verificar que todos los vértices sean válidos
                        const validVertices = vertices.every(v => v.lat && v.lng);

                        if (validVertices) {{
                            const polygon = new google.maps.Polygon({{
                                paths: vertices,
                                strokeColor: color,
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                                fillColor: color,
                                fillOpacity: 0.2,
                                map: map
                            }});

                            polygons.push(polygon);
                        }}
                    }}
                }});

                // Ajustar vista para mostrar todas las parcelas
                if (parcelas.length > 1) {{
                    const bounds = new google.maps.LatLngBounds();
                    parcelas.forEach(p => {{
                        bounds.extend({{ lat: p.lat, lng: p.lng }});
                    }});
                    map.fitBounds(bounds);
                }}
            }}

            window.initMap = initMap;
        </script>

        <script async defer
            src="https://maps.googleapis.com/maps/api/js?key={api_key}&callback=initMap&libraries=geometry">
        </script>
    </body>
    </html>
    """

    return html


def main():
    """Función principal"""

    # Sidebar con filtros
    with st.sidebar:
        st.header("🔍 Filtros y Configuración")

        # Obtener datos para filtros
        db = SessionLocal()
        service = ParcelaService(db)

        todas_parcelas = service.listar_parcelas(limit=1000)
        zonas = list(set([p.zona_priorizada for p in todas_parcelas if p.zona_priorizada]))

        # Filtros
        zona_seleccionada = st.selectbox(
            "Zona Priorizada",
            ["Todas"] + sorted(zonas)
        )

        estado_seleccionado = st.selectbox(
            "Estado",
            ["Todos", "activa", "completada", "inactiva", "en_proceso"]
        )

        st.markdown("---")
        st.subheader("📊 Estadísticas")

    # Filtrar parcelas
    zona_filtro = None if zona_seleccionada == "Todas" else zona_seleccionada
    estado_filtro = None if estado_seleccionado == "Todos" else estado_seleccionado

    parcelas = service.listar_parcelas(
        zona=zona_filtro,
        estado=estado_filtro,
        limit=1000
    )

    # Calcular estadísticas
    parcelas_activas = len([p for p in parcelas if p.estado == 'activa'])
    total_arboles = sum([len(p.arboles) for p in parcelas if p.arboles])
    con_calculos = len([p for p in parcelas if p.calculos and len(p.calculos) > 0])

    # Mostrar estadísticas en sidebar
    with st.sidebar:
        st.metric("Total Parcelas", len(parcelas))
        st.metric("Activas", parcelas_activas)
        st.metric("Árboles Totales", total_arboles)
        st.metric("Con Cálculos", con_calculos)

        st.markdown("---")

        # Lista de parcelas en sidebar
        if len(parcelas) > 0:
            st.subheader("📋 Parcelas")

            # Limitar a las primeras 15 parcelas
            for parcela in parcelas[:15]:
                with st.expander(f"📍 {parcela.codigo}", expanded=False):
                    st.write(f"**Nombre:** {parcela.nombre or 'N/A'}")
                    st.write(f"**Zona:** {parcela.zona_priorizada or 'N/A'}")
                    st.write(f"**Estado:** {parcela.estado}")
                    if parcela.latitud and parcela.longitud:
                        st.write(f"**Coords:** {parcela.latitud:.6f}, {parcela.longitud:.6f}")

                    # Estadísticas de la parcela
                    stats = service.obtener_estadisticas_parcela(parcela.id)
                    st.write(f"**Árboles:** {stats['num_arboles']}")
                    st.write(f"**Área:** {stats['area_ha']} ha")

            if len(parcelas) > 15:
                st.info(f"Mostrando 15 de {len(parcelas)} parcelas")

        st.markdown("---")

        # Botón para recargar
        if st.button("🔄 Recargar Mapa", use_container_width=True):
            st.rerun()

    # Crear y mostrar mapa de Google Maps
    mapa_html = crear_mapa_html(parcelas, GOOGLE_API_KEY)

    # Mostrar el mapa ocupando TODO el espacio
    components.html(mapa_html, height=900, scrolling=False)

    # Cerrar sesión de BD
    db.close()


if __name__ == "__main__":
    main()
