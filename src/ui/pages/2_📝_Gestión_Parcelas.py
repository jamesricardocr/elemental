"""
Página de Gestión de Parcelas
Crear, editar y visualizar parcelas
"""

import streamlit as st
import requests
from src.ui.components import (
    formulario_nueva_parcela,
    tabla_parcelas
)

# Configuración de la página
st.set_page_config(
    page_title="Gestión de Parcelas",
    page_icon="📝",
    layout="wide"
)

# URL de la API
API_URL = "http://localhost:8000/api/v1"

# Título
st.title("📝 Gestión de Parcelas")
st.markdown("---")

# Tabs para organizar el contenido
tab1, tab2, tab3 = st.tabs(["➕ Nueva Parcela", "📋 Lista de Parcelas", "📊 Estadísticas"])

# TAB 1: NUEVA PARCELA
with tab1:
    st.header("Crear Nueva Parcela")
    st.markdown("""
    Complete el formulario para registrar una nueva parcela de muestreo.
    Los campos marcados con * son obligatorios.
    """)

    # Formulario de nueva parcela
    parcela_creada = formulario_nueva_parcela(api_url=API_URL)

    if parcela_creada:
        # Mostrar resumen de la parcela creada
        st.success("✅ Parcela creada exitosamente")

        st.subheader("📄 Resumen de la Parcela")
        col1, col2, col3 = st.columns(3)

        with col1:
            st.metric("Código", parcela_creada.get("codigo"))
            st.metric("Estado", parcela_creada.get("estado"))
            st.metric("Zona", parcela_creada.get("zona_priorizada", "N/A"))

        with col2:
            st.metric("Latitud", f"{parcela_creada.get('latitud', 0):.6f}°")
            st.metric("Longitud", f"{parcela_creada.get('longitud', 0):.6f}°")
            st.metric("Altitud", f"{parcela_creada.get('altitud', 0):.1f} m")

        with col3:
            st.metric("UTM X", f"{parcela_creada.get('utm_x', 0):.2f} m")
            st.metric("UTM Y", f"{parcela_creada.get('utm_y', 0):.2f} m")
            st.metric("Zona UTM", parcela_creada.get("utm_zone", "N/A"))

        # Mostrar vértices si existen
        if parcela_creada.get("vertice1_lat"):
            st.subheader("📍 Vértices de la Parcela")
            vertices_info = f"""
            - **Vértice 1:** {parcela_creada.get('vertice1_lat', 0):.6f}°, {parcela_creada.get('vertice1_lon', 0):.6f}°
            - **Vértice 2:** {parcela_creada.get('vertice2_lat', 0):.6f}°, {parcela_creada.get('vertice2_lon', 0):.6f}°
            - **Vértice 3:** {parcela_creada.get('vertice3_lat', 0):.6f}°, {parcela_creada.get('vertice3_lon', 0):.6f}°
            - **Vértice 4:** {parcela_creada.get('vertice4_lat', 0):.6f}°, {parcela_creada.get('vertice4_lon', 0):.6f}°
            """
            st.markdown(vertices_info)

        # Botón para crear otra parcela
        if st.button("➕ Crear Otra Parcela"):
            st.rerun()


# TAB 2: LISTA DE PARCELAS
with tab2:
    st.header("Lista de Parcelas")

    # Filtros
    col1, col2, col3 = st.columns([2, 2, 1])

    with col1:
        filtro_zona = st.text_input(
            "🔍 Filtrar por Zona",
            placeholder="Ej: Zona A",
            help="Buscar parcelas por zona priorizada"
        )

    with col2:
        filtro_estado = st.selectbox(
            "🔍 Filtrar por Estado",
            options=["Todas", "activa", "completada", "inactiva"],
            help="Filtrar por estado de la parcela"
        )

    with col3:
        if st.button("🔄 Actualizar", use_container_width=True):
            st.rerun()

    # Obtener parcelas de la API
    try:
        params = {}
        if filtro_zona:
            params["zona"] = filtro_zona
        if filtro_estado != "Todas":
            params["estado"] = filtro_estado

        response = requests.get(f"{API_URL}/parcelas/", params=params, timeout=10)

        if response.status_code == 200:
            data = response.json()
            parcelas = data.get("parcelas", [])
            total = data.get("total", 0)

            st.info(f"📊 Total de parcelas: **{total}**")

            # Mostrar tabla de parcelas
            parcela_seleccionada_id = tabla_parcelas(parcelas, mostrar_acciones=True)

            # Si se seleccionó una parcela, mostrar detalles
            if parcela_seleccionada_id:
                st.divider()
                st.subheader("📄 Detalles de la Parcela")

                # Obtener detalles completos
                detail_response = requests.get(
                    f"{API_URL}/parcelas/{parcela_seleccionada_id}",
                    timeout=10
                )

                if detail_response.status_code == 200:
                    parcela_detail = detail_response.json()

                    col1, col2 = st.columns(2)

                    with col1:
                        st.markdown(f"""
                        **Código:** {parcela_detail.get('codigo')}
                        **Nombre:** {parcela_detail.get('nombre', 'N/A')}
                        **Zona:** {parcela_detail.get('zona_priorizada', 'N/A')}
                        **Estado:** {parcela_detail.get('estado')}
                        **Responsable:** {parcela_detail.get('responsable', 'N/A')}
                        **Fecha Establecimiento:** {parcela_detail.get('fecha_establecimiento', 'N/A')}
                        """)

                    with col2:
                        st.markdown(f"""
                        **Latitud:** {parcela_detail.get('latitud', 0):.6f}°
                        **Longitud:** {parcela_detail.get('longitud', 0):.6f}°
                        **Altitud:** {parcela_detail.get('altitud', 0):.1f} m.s.n.m.
                        **Pendiente:** {parcela_detail.get('pendiente', 0):.1f}%
                        **Tipo Cobertura:** {parcela_detail.get('tipo_cobertura', 'N/A')}
                        **Accesibilidad:** {parcela_detail.get('accesibilidad', 'N/A')}
                        """)

                    if parcela_detail.get('observaciones'):
                        st.markdown(f"**Observaciones:** {parcela_detail.get('observaciones')}")

                    # Obtener estadísticas
                    stats_response = requests.get(
                        f"{API_URL}/parcelas/{parcela_seleccionada_id}/estadisticas",
                        timeout=10
                    )

                    if stats_response.status_code == 200:
                        stats = stats_response.json()

                        st.divider()
                        st.subheader("📊 Estadísticas")

                        col1, col2, col3, col4 = st.columns(4)

                        with col1:
                            st.metric("Área", f"{stats.get('area_ha', 0):.2f} ha")

                        with col2:
                            st.metric("Árboles", stats.get('num_arboles', 0))

                        with col3:
                            st.metric("Necromasa", stats.get('num_necromasa', 0))

                        with col4:
                            st.metric("Herbáceas", stats.get('num_herbaceas', 0))

        else:
            st.error(f"❌ Error al obtener parcelas: {response.status_code}")

    except requests.exceptions.ConnectionError:
        st.error("❌ No se pudo conectar con la API. Verifica que esté ejecutándose en http://localhost:8000")
        st.info("💡 Ejecuta: `uvicorn src.api.main:app --reload` desde la raíz del proyecto")

    except Exception as e:
        st.error(f"❌ Error inesperado: {str(e)}")


# TAB 3: ESTADÍSTICAS GENERALES
with tab3:
    st.header("📊 Estadísticas Generales")

    try:
        # Obtener resumen general
        response = requests.get(f"{API_URL}/parcelas/stats/resumen", timeout=10)

        if response.status_code == 200:
            resumen = response.json()

            # Métricas principales
            col1, col2, col3, col4 = st.columns(4)

            with col1:
                st.metric(
                    "Total de Parcelas",
                    resumen.get("total_parcelas", 0),
                    help="Número total de parcelas registradas"
                )

            with col2:
                st.metric(
                    "Activas",
                    resumen.get("parcelas_activas", 0),
                    help="Parcelas en estado activo"
                )

            with col3:
                st.metric(
                    "Completadas",
                    resumen.get("parcelas_completadas", 0),
                    help="Parcelas completadas"
                )

            with col4:
                st.metric(
                    "Inactivas",
                    resumen.get("parcelas_inactivas", 0),
                    help="Parcelas inactivas"
                )

            # Gráfico de distribución
            st.divider()
            st.subheader("📈 Distribución por Estado")

            import pandas as pd

            chart_data = pd.DataFrame({
                "Estado": ["Activas", "Completadas", "Inactivas"],
                "Cantidad": [
                    resumen.get("parcelas_activas", 0),
                    resumen.get("parcelas_completadas", 0),
                    resumen.get("parcelas_inactivas", 0)
                ]
            })

            st.bar_chart(chart_data.set_index("Estado"))

            # Información adicional
            st.divider()
            st.subheader("ℹ️ Información del Sistema")

            st.markdown(f"""
            - **Área estándar por parcela:** 0.1 hectáreas (20m × 50m)
            - **Área total monitoreada:** {resumen.get('total_parcelas', 0) * 0.1:.2f} ha
            - **Sistema de coordenadas:** WGS84 (Lat/Lon) y UTM Zona 18M
            - **Factor de carbono:** 0.47
            """)

        else:
            st.error(f"❌ Error al obtener estadísticas: {response.status_code}")

    except requests.exceptions.ConnectionError:
        st.error("❌ No se pudo conectar con la API")

    except Exception as e:
        st.error(f"❌ Error: {str(e)}")

# Sidebar con información
with st.sidebar:
    st.header("ℹ️ Ayuda")

    st.markdown("""
    ### Gestión de Parcelas

    **Nueva Parcela:**
    - Complete los campos requeridos (*)
    - Las coordenadas deben estar en el rango del Amazonas colombiano
    - Los vértices se generan automáticamente (20m × 50m)

    **Lista de Parcelas:**
    - Use los filtros para buscar parcelas específicas
    - Haga clic en "Ver Detalles" para más información

    **Estados:**
    - 🟢 **Activa:** En proceso de medición
    - 🔵 **Completada:** Mediciones finalizadas
    - 🔴 **Inactiva:** Temporalmente suspendida
    """)

    st.divider()

    st.markdown("""
    ### 📞 Contacto
    Si tiene problemas técnicos, contacte al equipo de soporte.
    """)
