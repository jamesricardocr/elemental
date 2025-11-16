"""
Página de Integraciones con APIs Externas
Búsqueda de especies, datos climáticos y validación de coordenadas
"""

import streamlit as st
import requests
from src.config.settings import get_settings

# Configuración de la página
st.set_page_config(
    page_title="Integraciones Externas",
    page_icon="🌐",
    layout="wide"
)

# Título
st.title("🌐 Integraciones con APIs Externas")
st.markdown("Consulte bases de datos científicas y valide información geográfica")
st.markdown("---")

# Tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "🌿 GBIF - Especies",
    "🌍 Google Maps",
    "🌡️ IDEAM - Clima",
    "🌲 Global Forest Watch"
])

# TAB 1: GBIF
with tab1:
    st.header("🌿 GBIF - Global Biodiversity Information Facility")

    st.markdown("""
    Consulte la base de datos global de biodiversidad para obtener:
    - Información taxonómica completa
    - Nombres comunes en diferentes idiomas
    - Registros de ocurrencia geográfica
    - Imágenes y referencias
    """)

    st.divider()

    # Buscador de especies
    st.subheader("🔍 Buscar Especie")

    col1, col2 = st.columns([3, 1])

    with col1:
        nombre_buscar = st.text_input(
            "Nombre Científico",
            placeholder="Ej: Bertholletia excelsa",
            help="Ingrese el nombre científico de la especie"
        )

    with col2:
        limite_resultados = st.number_input(
            "Resultados",
            min_value=1,
            max_value=50,
            value=10
        )

    if st.button("🔍 Buscar en GBIF", use_container_width=True):
        if nombre_buscar:
            with st.spinner("Consultando GBIF..."):
                try:
                    # Llamar a GBIF API directamente
                    url = "https://api.gbif.org/v1/species/search"
                    params = {
                        "q": nombre_buscar,
                        "limit": limite_resultados,
                        "status": "ACCEPTED"
                    }

                    response = requests.get(url, params=params, timeout=10)

                    if response.status_code == 200:
                        data = response.json()
                        resultados = data.get("results", [])

                        if resultados:
                            st.success(f"✅ Encontrados {len(resultados)} resultado(s)")

                            for i, r in enumerate(resultados, 1):
                                with st.expander(f"📋 {i}. {r.get('scientificName', 'N/A')}"):
                                    col1, col2 = st.columns(2)

                                    with col1:
                                        st.markdown(f"""
                                        **Taxonomía:**
                                        - **Reino:** {r.get('kingdom', 'N/A')}
                                        - **Filo:** {r.get('phylum', 'N/A')}
                                        - **Clase:** {r.get('class', 'N/A')}
                                        - **Orden:** {r.get('order', 'N/A')}
                                        - **Familia:** {r.get('family', 'N/A')}
                                        - **Género:** {r.get('genus', 'N/A')}
                                        """)

                                    with col2:
                                        st.markdown(f"""
                                        **Información:**
                                        - **Nombre común:** {r.get('vernacularName', 'N/A')}
                                        - **Autor:** {r.get('authorship', 'N/A')}
                                        - **Rango:** {r.get('rank', 'N/A')}
                                        - **Estado:** {r.get('taxonomicStatus', 'N/A')}
                                        - **GBIF Key:** {r.get('key', 'N/A')}
                                        """)

                                    # Botón para agregar a la base de datos
                                    if st.button(
                                        "➕ Agregar a mi catálogo",
                                        key=f"add_{r.get('key')}",
                                        help="Agregar esta especie a la base de datos local"
                                    ):
                                        st.info("🚧 Funcionalidad en desarrollo")

                        else:
                            st.warning("⚠️ No se encontraron resultados")

                    else:
                        st.error(f"❌ Error al consultar GBIF: {response.status_code}")

                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")
        else:
            st.warning("⚠️ Ingrese un nombre científico")

    st.divider()

    # Ocurrencias geográficas
    st.subheader("📍 Registros de Ocurrencia")

    st.markdown("""
    Consulte registros de ocurrencia geográfica de una especie en Colombia.
    Útil para validar distribución y verificar presencia en la región.
    """)

    nombre_ocurrencias = st.text_input(
        "Especie para buscar ocurrencias",
        placeholder="Ej: Hevea brasiliensis",
        key="ocurrencias_input"
    )

    if st.button("🗺️ Buscar Ocurrencias", use_container_width=True):
        if nombre_ocurrencias:
            with st.spinner("Consultando registros de ocurrencia..."):
                try:
                    url = "https://api.gbif.org/v1/occurrence/search"
                    params = {
                        "scientificName": nombre_ocurrencias,
                        "country": "CO",
                        "hasCoordinate": "true",
                        "limit": 50
                    }

                    response = requests.get(url, params=params, timeout=15)

                    if response.status_code == 200:
                        data = response.json()
                        resultados = data.get("results", [])

                        if resultados:
                            st.success(f"✅ {len(resultados)} registros encontrados")

                            # Crear mapa con Folium
                            import folium
                            from streamlit_folium import folium_static

                            # Centro en Colombia - Amazonas
                            mapa = folium.Map(
                                location=[-4.2, -69.9],
                                zoom_start=6,
                                tiles='OpenStreetMap'
                            )

                            # Agregar marcadores
                            for r in resultados:
                                lat = r.get('decimalLatitude')
                                lon = r.get('decimalLongitude')

                                if lat and lon:
                                    folium.Marker(
                                        [lat, lon],
                                        popup=f"{r.get('locality', 'Sin localidad')}<br>{r.get('eventDate', 'Sin fecha')}",
                                        tooltip=r.get('stateProvince', 'Colombia'),
                                        icon=folium.Icon(color='green', icon='leaf', prefix='fa')
                                    ).add_to(mapa)

                            folium_static(mapa, width=700, height=500)

                            # Tabla de registros
                            st.subheader("📋 Lista de Registros")

                            import pandas as pd

                            registros_tabla = []
                            for r in resultados:
                                registros_tabla.append({
                                    "Fecha": r.get('eventDate', 'N/A'),
                                    "Localidad": r.get('locality', 'N/A'),
                                    "Departamento": r.get('stateProvince', 'N/A'),
                                    "Latitud": f"{r.get('decimalLatitude', 0):.4f}",
                                    "Longitud": f"{r.get('decimalLongitude', 0):.4f}",
                                    "Elevación (m)": r.get('elevation', 'N/A')
                                })

                            df = pd.DataFrame(registros_tabla)
                            st.dataframe(df, use_container_width=True, hide_index=True)

                        else:
                            st.warning("⚠️ No se encontraron registros de ocurrencia")

                    else:
                        st.error(f"❌ Error: {response.status_code}")

                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")


# TAB 2: GOOGLE MAPS
with tab2:
    st.header("🌍 Google Maps - Geocodificación y Elevación")

    st.markdown("""
    Utilice Google Maps para:
    - Validar coordenadas
    - Obtener elevación de un punto
    - Calcular distancias entre puntos
    - Geocodificar direcciones
    """)

    st.divider()

    # Verificar API key
    settings = get_settings()
    google_key = settings.GOOGLE_MAPS_API_KEY

    if not google_key or google_key == "your-google-maps-api-key":
        st.warning("""
        ⚠️ **API Key de Google Maps no configurada**

        Para usar esta funcionalidad:
        1. Obtén una API key en: https://console.cloud.google.com/
        2. Habilita: Maps Elevation API, Geocoding API, Distance Matrix API
        3. Agrégala al archivo `.env`: `GOOGLE_MAPS_API_KEY=tu-key-aqui`
        """)

    st.subheader("📐 Obtener Elevación")

    col1, col2 = st.columns(2)

    with col1:
        lat_elevacion = st.number_input(
            "Latitud",
            min_value=-5.0,
            max_value=0.0,
            value=-4.2156,
            format="%.6f",
            key="lat_elev"
        )

    with col2:
        lon_elevacion = st.number_input(
            "Longitud",
            min_value=-75.0,
            max_value=-66.0,
            value=-69.9406,
            format="%.6f",
            key="lon_elev"
        )

    if st.button("🏔️ Obtener Elevación", use_container_width=True):
        if google_key and google_key != "your-google-maps-api-key":
            with st.spinner("Consultando Google Maps..."):
                try:
                    url = "https://maps.googleapis.com/maps/api/elevation/json"
                    params = {
                        "locations": f"{lat_elevacion},{lon_elevacion}",
                        "key": google_key
                    }

                    response = requests.get(url, params=params, timeout=10)

                    if response.status_code == 200:
                        data = response.json()

                        if data.get("status") == "OK" and data.get("results"):
                            elevacion = data["results"][0]["elevation"]
                            st.success("✅ Elevación obtenida exitosamente")

                            col1, col2, col3 = st.columns(3)

                            with col1:
                                st.metric("Elevación", f"{elevacion:.1f} m")

                            with col2:
                                st.metric("Latitud", f"{lat_elevacion:.6f}°")

                            with col3:
                                st.metric("Longitud", f"{lon_elevacion:.6f}°")

                        else:
                            st.error(f"❌ Error en la respuesta: {data.get('status')}")

                    else:
                        st.error(f"❌ Error HTTP: {response.status_code}")

                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")
        else:
            st.warning("⚠️ Configure primero su API key de Google Maps")

    st.divider()

    # Geocodificación
    st.subheader("🔍 Geocodificar Dirección")

    direccion = st.text_input(
        "Dirección",
        placeholder="Ej: Leticia, Amazonas, Colombia",
        help="Ingrese una dirección para obtener sus coordenadas"
    )

    if st.button("📍 Geocodificar", use_container_width=True):
        if direccion and google_key and google_key != "your-google-maps-api-key":
            with st.spinner("Geocodificando..."):
                try:
                    url = "https://maps.googleapis.com/maps/api/geocode/json"
                    params = {
                        "address": direccion,
                        "key": google_key
                    }

                    response = requests.get(url, params=params, timeout=10)

                    if response.status_code == 200:
                        data = response.json()

                        if data.get("status") == "OK" and data.get("results"):
                            resultado = data["results"][0]
                            location = resultado["geometry"]["location"]

                            st.success("✅ Dirección geocodificada")

                            st.markdown(f"""
                            **Dirección formateada:** {resultado.get('formatted_address')}

                            **Coordenadas:**
                            - Latitud: {location['lat']:.6f}°
                            - Longitud: {location['lng']:.6f}°
                            """)

                            # Mostrar en mapa
                            import folium
                            from streamlit_folium import folium_static

                            mapa = folium.Map(
                                location=[location['lat'], location['lng']],
                                zoom_start=13
                            )

                            folium.Marker(
                                [location['lat'], location['lng']],
                                popup=resultado.get('formatted_address'),
                                icon=folium.Icon(color='red', icon='info-sign')
                            ).add_to(mapa)

                            folium_static(mapa, width=700, height=400)

                        else:
                            st.error(f"❌ No se pudo geocodificar: {data.get('status')}")

                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")


# TAB 3: IDEAM
with tab3:
    st.header("🌡️ IDEAM - Datos Climáticos")

    st.markdown("""
    Consulte datos climáticos y ambientales del Instituto de Hidrología,
    Meteorología y Estudios Ambientales de Colombia (IDEAM).
    """)

    st.divider()

    st.info("""
    🚧 **En desarrollo**

    La integración con IDEAM está en desarrollo. Los datos mostrados son simulados
    para fines demostrativos.

    La API oficial del IDEAM requiere acceso especial y autenticación.
    """)

    st.subheader("🌦️ Datos Climáticos por Municipio")

    col1, col2 = st.columns(2)

    with col1:
        municipio = st.selectbox(
            "Municipio",
            options=["Leticia", "Puerto Nariño", "Tarapacá", "La Pedrera"]
        )

    with col2:
        departamento = st.text_input(
            "Departamento",
            value="Amazonas",
            disabled=True
        )

    if st.button("🌡️ Consultar Datos Climáticos", use_container_width=True):
        with st.spinner("Consultando IDEAM..."):
            import time
            time.sleep(1)

            # Datos simulados
            st.success("✅ Datos obtenidos (simulados)")

            col1, col2, col3, col4 = st.columns(4)

            with col1:
                st.metric("Temperatura Promedio", "26.5 °C")

            with col2:
                st.metric("Precipitación Anual", "3,200 mm")

            with col3:
                st.metric("Humedad Relativa", "85%")

            with col4:
                st.metric("Zona de Vida", "bh-T")

            st.divider()

            st.info("""
            **Zona de Vida:** Bosque húmedo tropical (bh-T)

            **Características:**
            - Temperatura media > 24°C
            - Precipitación: 2000-4000 mm/año
            - Alta biodiversidad
            - Cobertura forestal densa
            """)


# TAB 4: GLOBAL FOREST WATCH
with tab4:
    st.header("🌲 Global Forest Watch - Cobertura Forestal")

    st.markdown("""
    Consulte datos de cobertura forestal, deforestación y alertas de cambio
    en la cobertura vegetal.
    """)

    st.divider()

    st.info("""
    🚧 **En desarrollo**

    La integración con Global Forest Watch está en desarrollo.
    Los datos mostrados son simulados.
    """)

    st.subheader("🌍 Análisis de Cobertura Forestal")

    col1, col2 = st.columns(2)

    with col1:
        lat_gfw = st.number_input(
            "Latitud",
            min_value=-5.0,
            max_value=0.0,
            value=-4.2156,
            format="%.6f",
            key="lat_gfw"
        )

    with col2:
        lon_gfw = st.number_input(
            "Longitud",
            min_value=-75.0,
            max_value=-66.0,
            value=-69.9406,
            format="%.6f",
            key="lon_gfw"
        )

    radio_km = st.slider(
        "Radio de análisis (km)",
        min_value=0.5,
        max_value=10.0,
        value=1.0,
        step=0.5
    )

    if st.button("🌲 Analizar Cobertura", use_container_width=True):
        with st.spinner("Analizando cobertura forestal..."):
            import time
            time.sleep(1.5)

            # Datos simulados
            st.success("✅ Análisis completado (datos simulados)")

            col1, col2, col3, col4 = st.columns(4)

            with col1:
                st.metric("Cobertura Actual", "850.5 ha")

            with col2:
                st.metric("Pérdida 2020-2023", "12.3 ha", delta="-1.4%", delta_color="inverse")

            with col3:
                st.metric("Cobertura %", "92.5%")

            with col4:
                st.metric("Alertas", "3", delta="+2")

            st.divider()

            # Gráfico de tendencia
            st.subheader("📈 Tendencia de Cobertura Forestal")

            import pandas as pd

            tendencia_data = pd.DataFrame({
                "Año": [2018, 2019, 2020, 2021, 2022, 2023],
                "Cobertura (ha)": [865, 862, 858, 855, 852, 850.5]
            })

            st.line_chart(tendencia_data.set_index("Año"))

            st.warning("""
            ⚠️ **Alertas de Deforestación**

            Se detectaron 3 alertas de posible deforestación en los últimos 6 meses:
            - 2 alertas menores (< 1 ha)
            - 1 alerta moderada (1-5 ha)

            Se recomienda verificación en campo.
            """)


# Sidebar
with st.sidebar:
    st.header("ℹ️ APIs Disponibles")

    st.markdown("""
    ### 🌿 GBIF
    **Estado:** ✅ Activa
    - Base de datos global
    - Acceso libre
    - Sin API key requerida

    ### 🌍 Google Maps
    **Estado:** ⚙️ Configuración requerida
    - Requiere API key
    - Cuota gratuita: $200/mes
    - Habilitar APIs específicas

    ### 🌡️ IDEAM
    **Estado:** 🚧 En desarrollo
    - Datos climáticos Colombia
    - Acceso especial requerido
    - Alternativa: datos simulados

    ### 🌲 Global Forest Watch
    **Estado:** 🚧 En desarrollo
    - Deforestación
    - Cobertura forestal
    - Alertas GLAD

    ### 📚 Tropicos
    **Estado:** 🚧 Planificado
    - Missouri Botanical Garden
    - Especies tropicales
    - Requiere API key
    """)

    st.divider()

    st.markdown("""
    ### 🔑 Configuración

    Para configurar las API keys:

    1. Edita el archivo `.env`
    2. Agrega tus claves:
    ```
    GOOGLE_MAPS_API_KEY=tu-key
    TROPICOS_API_KEY=tu-key
    GFW_API_KEY=tu-key
    ```
    3. Reinicia la aplicación
    """)
