"""
Página de Generación de Reportes
Exportación de datos y generación de documentos técnicos
"""

import streamlit as st
import requests
from pathlib import Path

# Configuración de la página
st.set_page_config(
    page_title="Reportes y Exportación",
    page_icon="📄",
    layout="wide"
)

# URL de la API
API_URL = "http://localhost:8000/api/v1"

# Título
st.title("📄 Reportes y Exportación")
st.markdown("Genere reportes técnicos y exporte datos en diferentes formatos")
st.markdown("---")

# Tabs
tab1, tab2, tab3 = st.tabs(["📊 Reporte PDF", "📁 Exportar Datos", "🗺️ Exportar GIS"])

# TAB 1: REPORTE PDF
with tab1:
    st.header("📊 Generar Reporte Técnico en PDF")

    st.markdown("""
    El reporte incluye:
    - Resumen ejecutivo
    - Ubicación geográfica y coordenadas
    - Resultados de biomasa por componente
    - Cálculos de carbono y CO₂ equivalente
    - Metodología aplicada
    - Gráficos y tablas
    """)

    st.divider()

    # Seleccionar tipo de reporte
    tipo_reporte = st.radio(
        "Tipo de Reporte",
        options=["individual", "consolidado"],
        format_func=lambda x: {
            "individual": "📄 Reporte Individual (una parcela)",
            "consolidado": "📊 Reporte Consolidado (múltiples parcelas)"
        }[x]
    )

    st.divider()

    if tipo_reporte == "individual":
        # Reporte individual
        try:
            response = requests.get(f"{API_URL}/parcelas/", timeout=10)

            if response.status_code == 200:
                parcelas = response.json().get("parcelas", [])

                if not parcelas:
                    st.warning("⚠️ No hay parcelas para generar reporte")
                else:
                    parcelas_dict = {
                        f"{p['codigo']} - {p.get('nombre', 'Sin nombre')}": p
                        for p in parcelas
                    }

                    parcela_seleccionada = st.selectbox(
                        "📍 Seleccionar Parcela",
                        options=list(parcelas_dict.keys())
                    )

                    # Opciones adicionales
                    col1, col2 = st.columns(2)

                    with col1:
                        incluir_mapas = st.checkbox(
                            "Incluir mapas de ubicación",
                            value=True
                        )

                    with col2:
                        incluir_fotos = st.checkbox(
                            "Incluir fotografías de campo",
                            value=False,
                            help="Requiere fotos cargadas previamente"
                        )

                    modelo_alometrico = st.selectbox(
                        "Modelo Alométrico",
                        options=["chave_2014", "ipcc_2006", "ideam"],
                        format_func=lambda x: {
                            "chave_2014": "Chave et al. 2014",
                            "ipcc_2006": "IPCC 2006",
                            "ideam": "IDEAM Colombia"
                        }[x]
                    )

                    st.divider()

                    if st.button("📄 Generar Reporte PDF", type="primary", use_container_width=True):
                        with st.spinner("Generando reporte..."):
                            # TODO: Llamar a la API para generar reporte
                            st.info("🚧 Generación de PDF en desarrollo")

                            # Simulación
                            import time
                            time.sleep(2)

                            parcela = parcelas_dict[parcela_seleccionada]

                            st.success("✅ Reporte generado exitosamente")

                            # Mostrar preview
                            st.subheader("📋 Vista Previa del Reporte")

                            col1, col2 = st.columns(2)

                            with col1:
                                st.markdown(f"""
                                **Información General:**
                                - Código: {parcela['codigo']}
                                - Nombre: {parcela.get('nombre', 'N/A')}
                                - Zona: {parcela.get('zona_priorizada', 'N/A')}
                                - Responsable: {parcela.get('responsable', 'N/A')}
                                """)

                            with col2:
                                st.markdown("""
                                **Resultados (simulados):**
                                - Biomasa Total: 245.8 Mg/ha
                                - Carbono: 115.5 Mg C/ha
                                - CO₂eq: 423.8 Mg/ha
                                - Modelo: Chave 2014
                                """)

                            # Botón de descarga simulado
                            st.download_button(
                                label="⬇️ Descargar PDF",
                                data=b"PDF placeholder",
                                file_name=f"reporte_{parcela['codigo']}.pdf",
                                mime="application/pdf",
                                use_container_width=True
                            )

            else:
                st.error("❌ Error al obtener parcelas")

        except Exception as e:
            st.error(f"❌ Error: {str(e)}")

    else:
        # Reporte consolidado
        st.subheader("📊 Reporte Consolidado")

        st.info("🚧 Reporte consolidado en desarrollo")

        st.markdown("""
        El reporte consolidado incluirá:
        - Resumen de todas las parcelas
        - Comparación entre parcelas
        - Estadísticas agregadas
        - Mapas de distribución
        - Análisis de diversidad
        """)

        # Filtros
        col1, col2 = st.columns(2)

        with col1:
            filtro_zona = st.multiselect(
                "Filtrar por Zona",
                options=["Zona A", "Zona B", "Zona C"]
            )

        with col2:
            filtro_estado = st.multiselect(
                "Filtrar por Estado",
                options=["activa", "completada", "inactiva"]
            )

        if st.button("📊 Generar Reporte Consolidado", use_container_width=True):
            st.info("🚧 En desarrollo")


# TAB 2: EXPORTAR DATOS
with tab2:
    st.header("📁 Exportar Datos")

    st.markdown("""
    Exporte sus datos en diferentes formatos para análisis externos o respaldo.
    """)

    st.divider()

    # Seleccionar qué exportar
    tipo_datos = st.selectbox(
        "📦 Tipo de Datos a Exportar",
        options=["parcelas", "arboles", "necromasa", "herbaceas", "todos"],
        format_func=lambda x: {
            "parcelas": "📍 Parcelas",
            "arboles": "🌳 Árboles",
            "necromasa": "🪵 Necromasa",
            "herbaceas": "🌿 Herbáceas",
            "todos": "📦 Todos los Datos"
        }[x]
    )

    # Formato de exportación
    formato = st.radio(
        "📄 Formato de Archivo",
        options=["excel", "csv", "json"],
        format_func=lambda x: {
            "excel": "📊 Excel (.xlsx)",
            "csv": "📄 CSV (.csv)",
            "json": "🔧 JSON (.json)"
        }[x],
        horizontal=True
    )

    st.divider()

    # Opciones de exportación
    if tipo_datos != "todos":
        col1, col2 = st.columns(2)

        with col1:
            incluir_metadatos = st.checkbox(
                "Incluir metadatos",
                value=True,
                help="Fechas de creación, actualización, etc."
            )

        with col2:
            incluir_calculos = st.checkbox(
                "Incluir cálculos",
                value=True,
                help="Biomasa, carbono, área basal calculados"
            )

    if st.button(f"📥 Exportar a {formato.upper()}", type="primary", use_container_width=True):
        with st.spinner(f"Exportando datos a {formato}..."):
            st.info("🚧 Exportación en desarrollo")

            # Simulación
            import time
            time.sleep(1)

            st.success(f"✅ Datos exportados exitosamente a {formato}")

            # Estadísticas de exportación
            col1, col2, col3 = st.columns(3)

            with col1:
                st.metric("Registros Exportados", "125")

            with col2:
                st.metric("Tamaño del Archivo", "45.2 KB")

            with col3:
                st.metric("Tiempo", "1.2 seg")

            # Botón de descarga simulado
            st.download_button(
                label="⬇️ Descargar Archivo",
                data=b"Data placeholder",
                file_name=f"export_{tipo_datos}.{formato}",
                mime={
                    "excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "csv": "text/csv",
                    "json": "application/json"
                }[formato],
                use_container_width=True
            )


# TAB 3: EXPORTAR GIS
with tab3:
    st.header("🗺️ Exportar para GIS")

    st.markdown("""
    Exporte datos geoespaciales para uso en software GIS como QGIS, ArcGIS, o Google Earth.
    """)

    st.divider()

    # Formato GIS
    formato_gis = st.selectbox(
        "📦 Formato GIS",
        options=["shapefile", "geojson", "kml", "gpkg"],
        format_func=lambda x: {
            "shapefile": "📁 Shapefile (.shp) - Para QGIS/ArcGIS",
            "geojson": "🗺️ GeoJSON (.geojson) - Para web",
            "kml": "🌍 KML (.kml) - Para Google Earth",
            "gpkg": "📦 GeoPackage (.gpkg) - Formato moderno"
        }[x]
    )

    st.divider()

    # Capas a exportar
    st.subheader("📊 Capas a Exportar")

    col1, col2 = st.columns(2)

    with col1:
        exportar_puntos = st.checkbox(
            "📍 Puntos centrales de parcelas",
            value=True
        )

        exportar_poligonos = st.checkbox(
            "⬜ Polígonos de parcelas",
            value=True
        )

    with col2:
        exportar_arboles = st.checkbox(
            "🌳 Ubicación de árboles",
            value=False,
            help="Requiere GPS de cada árbol"
        )

        exportar_vertices = st.checkbox(
            "📐 Vértices de parcelas",
            value=False
        )

    st.divider()

    # Sistema de coordenadas
    st.subheader("🌐 Sistema de Coordenadas")

    sistema_coords = st.radio(
        "Seleccione el sistema de coordenadas de salida",
        options=["EPSG:4326", "EPSG:3857", "UTM18M"],
        format_func=lambda x: {
            "EPSG:4326": "WGS84 (Lat/Lon) - EPSG:4326",
            "EPSG:3857": "Web Mercator - EPSG:3857",
            "UTM18M": "UTM Zona 18M (Colombia Amazonas)"
        }[x]
    )

    st.divider()

    # Atributos a incluir
    with st.expander("⚙️ Atributos a Incluir"):
        atributos = st.multiselect(
            "Seleccione los atributos",
            options=[
                "codigo",
                "nombre",
                "zona_priorizada",
                "area_ha",
                "num_arboles",
                "biomasa_mgha",
                "carbono_mgha",
                "estado",
                "responsable",
                "fecha_establecimiento"
            ],
            default=["codigo", "nombre", "zona_priorizada", "area_ha"]
        )

    if st.button(f"🗺️ Exportar a {formato_gis.upper()}", type="primary", use_container_width=True):
        with st.spinner(f"Exportando a {formato_gis}..."):
            st.info("🚧 Exportación GIS en desarrollo")

            # Simulación
            import time
            time.sleep(1.5)

            st.success(f"✅ Datos exportados exitosamente a {formato_gis}")

            # Información del archivo
            st.subheader("📋 Información del Archivo Generado")

            col1, col2, col3 = st.columns(3)

            with col1:
                st.metric("Geometrías", "15")
                st.metric("Capas", sum([exportar_puntos, exportar_poligonos, exportar_arboles, exportar_vertices]))

            with col2:
                st.metric("Sistema Coords", sistema_coords)
                st.metric("Atributos", len(atributos))

            with col3:
                st.metric("Tamaño", "128 KB")
                st.metric("Formato", formato_gis.upper())

            # Instrucciones de uso
            st.info(f"""
            **📖 Cómo usar el archivo {formato_gis}:**

            {
                "shapefile": "1. Descomprima el archivo .zip\n2. Abra en QGIS o ArcGIS\n3. Arrastre el archivo .shp al mapa",
                "geojson": "1. Abra en QGIS o cualquier visor web\n2. Compatible con Leaflet, Mapbox, etc.",
                "kml": "1. Abra en Google Earth\n2. También compatible con Google Maps",
                "gpkg": "1. Abra directamente en QGIS 3.x\n2. Formato moderno, sin límite de campos"
            }[formato_gis]
            """)

            # Botón de descarga simulado
            st.download_button(
                label=f"⬇️ Descargar {formato_gis.upper()}",
                data=b"GIS data placeholder",
                file_name=f"parcelas.{formato_gis if formato_gis != 'shapefile' else 'zip'}",
                mime="application/octet-stream",
                use_container_width=True
            )


# Sidebar
with st.sidebar:
    st.header("ℹ️ Información")

    st.markdown("""
    ### 📄 Reportes

    **PDF Técnico:**
    - Formato profesional
    - Incluye gráficos y tablas
    - Listo para presentación

    **Consolidado:**
    - Múltiples parcelas
    - Análisis comparativo
    - Estadísticas agregadas

    ### 📁 Formatos de Exportación

    **Excel (.xlsx):**
    - Múltiples hojas
    - Fórmulas y formato
    - Editable

    **CSV (.csv):**
    - Compatible con todo
    - Importación rápida
    - Ligero

    **JSON (.json):**
    - Para desarrollo
    - APIs y scripts
    - Formato estructurado

    ### 🗺️ Formatos GIS

    **Shapefile:**
    - Estándar de facto
    - QGIS, ArcGIS
    - Límite: 10 campos

    **GeoJSON:**
    - Formato moderno
    - Web mapping
    - Sin límites

    **KML:**
    - Google Earth
    - Visualización 3D
    - Fácil de compartir

    **GeoPackage:**
    - SQLite espacial
    - Sin límites
    - Recomendado
    """)

    st.divider()

    st.markdown("""
    ### 📂 Carpeta de Reportes

    Los archivos generados se guardan en:
    ```
    IAP/reports/
    ```
    """)
