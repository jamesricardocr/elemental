"""
Página de Registro de Árboles
Mediciones de árboles por parcela
"""

import streamlit as st
import requests
from src.ui.components import (
    formulario_medicion_arbol,
    tabla_arboles,
    tabla_resumen_especies
)

# Configuración de la página
st.set_page_config(
    page_title="Registro de Árboles",
    page_icon="🌳",
    layout="wide"
)

# URL de la API
API_URL = "http://localhost:8000/api/v1"

# Título
st.title("🌳 Registro de Árboles")
st.markdown("---")

# Tabs
tab1, tab2, tab3 = st.tabs(["➕ Nueva Medición", "📋 Lista de Árboles", "📊 Análisis por Especie"])

# TAB 1: NUEVA MEDICIÓN
with tab1:
    st.header("Registrar Medición de Árbol")

    # Seleccionar parcela
    try:
        response = requests.get(f"{API_URL}/parcelas/", timeout=10)

        if response.status_code == 200:
            data = response.json()
            parcelas = data.get("parcelas", [])

            if not parcelas:
                st.warning("⚠️ No hay parcelas registradas. Cree una parcela primero.")
            else:
                # Selector de parcela
                parcelas_dict = {
                    f"{p['codigo']} - {p.get('nombre', 'Sin nombre')}": p['id']
                    for p in parcelas
                }

                parcela_seleccionada = st.selectbox(
                    "📍 Seleccionar Parcela",
                    options=list(parcelas_dict.keys()),
                    help="Seleccione la parcela donde se midió el árbol"
                )

                parcela_id = parcelas_dict[parcela_seleccionada]

                st.divider()

                # Obtener especies disponibles
                # TODO: Crear endpoint de especies
                especies_mock = [
                    {"id": 1, "nombre_cientifico": "Bertholletia excelsa", "nombre_comun": "Castaño del Brasil"},
                    {"id": 2, "nombre_cientifico": "Cedrelinga cateniformis", "nombre_comun": "Cedro"},
                    {"id": 3, "nombre_cientifico": "Hevea brasiliensis", "nombre_comun": "Siringa"}
                ]

                # Formulario de medición
                arbol_creado = formulario_medicion_arbol(
                    parcela_id=parcela_id,
                    especies=especies_mock,
                    api_url=API_URL
                )

                if arbol_creado:
                    st.success("✅ Árbol registrado exitosamente")

                    col1, col2, col3 = st.columns(3)

                    with col1:
                        st.metric("Número Árbol", arbol_creado.get("numero_arbol"))
                        st.metric("DAP", f"{arbol_creado.get('dap', 0):.1f} cm")

                    with col2:
                        if arbol_creado.get("altura_total"):
                            st.metric("Altura", f"{arbol_creado.get('altura_total', 0):.1f} m")
                        st.metric("Especie ID", arbol_creado.get("especie_id"))

                    with col3:
                        st.metric("Parcela ID", arbol_creado.get("parcela_id"))
                        st.metric("Fecha", arbol_creado.get("fecha_medicion"))

        else:
            st.error(f"❌ Error al obtener parcelas: {response.status_code}")

    except requests.exceptions.ConnectionError:
        st.error("❌ No se pudo conectar con la API. Verifica que esté ejecutándose.")
        st.info("💡 Ejecuta: `uvicorn src.api.main:app --reload`")
    except Exception as e:
        st.error(f"❌ Error: {str(e)}")


# TAB 2: LISTA DE ÁRBOLES
with tab2:
    st.header("Lista de Árboles Medidos")

    # Filtros
    col1, col2, col3 = st.columns([2, 2, 1])

    with col1:
        try:
            response = requests.get(f"{API_URL}/parcelas/", timeout=10)
            if response.status_code == 200:
                parcelas = response.json().get("parcelas", [])
                parcelas_opciones = {
                    "Todas las parcelas": None,
                    **{f"{p['codigo']} - {p.get('nombre', 'Sin nombre')}": p['id'] for p in parcelas}
                }

                filtro_parcela = st.selectbox(
                    "🔍 Filtrar por Parcela",
                    options=list(parcelas_opciones.keys())
                )
                parcela_filtro_id = parcelas_opciones[filtro_parcela]
        except:
            st.error("❌ Error al cargar parcelas")
            parcela_filtro_id = None

    with col2:
        filtro_dap_min = st.number_input(
            "DAP Mínimo (cm)",
            min_value=0.0,
            value=10.0,
            step=1.0
        )

    with col3:
        if st.button("🔄 Actualizar", use_container_width=True):
            st.rerun()

    st.divider()

    # TODO: Obtener árboles desde la API cuando exista el endpoint
    st.info("🚧 Endpoint de árboles en desarrollo")

    # Mock data para demostración
    arboles_mock = [
        {
            "numero_arbol": 1,
            "especie": {
                "nombre_cientifico": "Bertholletia excelsa",
                "nombre_comun": "Castaño del Brasil"
            },
            "dap": 45.5,
            "altura_total": 25.0,
            "altura_comercial": 15.0,
            "fecha_medicion": "2025-11-08"
        },
        {
            "numero_arbol": 2,
            "especie": {
                "nombre_cientifico": "Cedrelinga cateniformis",
                "nombre_comun": "Cedro"
            },
            "dap": 32.0,
            "altura_total": 18.5,
            "altura_comercial": 12.0,
            "fecha_medicion": "2025-11-08"
        }
    ]

    tabla_arboles(arboles_mock, mostrar_calculos=True)


# TAB 3: ANÁLISIS POR ESPECIE
with tab3:
    st.header("📊 Análisis por Especie")

    # Seleccionar parcela para análisis
    try:
        response = requests.get(f"{API_URL}/parcelas/", timeout=10)

        if response.status_code == 200:
            parcelas = response.json().get("parcelas", [])

            if parcelas:
                parcelas_dict = {
                    f"{p['codigo']} - {p.get('nombre', 'Sin nombre')}": p['id']
                    for p in parcelas
                }

                parcela_analisis = st.selectbox(
                    "📍 Seleccionar Parcela para Análisis",
                    options=list(parcelas_dict.keys()),
                    key="analisis_parcela"
                )

                st.divider()

                # TODO: Obtener estadísticas reales desde la API
                st.info("🚧 Análisis en desarrollo - Datos de demostración")

                # Resumen por especies (mock)
                tabla_resumen_especies(arboles_mock)

                st.divider()

                # Distribución diamétrica
                st.subheader("📏 Distribución Diamétrica")

                import pandas as pd

                # Mock data
                distribucion_data = pd.DataFrame({
                    "Clase Diamétrica (cm)": ["10-20", "20-30", "30-40", "40-50", "50-60"],
                    "Frecuencia": [15, 25, 18, 8, 3]
                })

                st.bar_chart(distribucion_data.set_index("Clase Diamétrica (cm)"))

                st.divider()

                # Índice de Valor de Importancia (IVI)
                st.subheader("🎯 Índice de Valor de Importancia (IVI)")

                st.markdown("""
                El IVI combina tres parámetros:
                - **Abundancia Relativa**: Proporción de individuos de la especie
                - **Frecuencia Relativa**: Distribución de la especie en el área
                - **Dominancia Relativa**: Área basal de la especie
                """)

                # Mock IVI data
                ivi_data = pd.DataFrame({
                    "Especie": ["Bertholletia excelsa", "Cedrelinga cateniformis", "Hevea brasiliensis"],
                    "IVI": [85.5, 72.3, 45.2],
                    "Abundancia %": [35.0, 28.0, 15.0],
                    "Dominancia %": [40.5, 35.3, 22.2]
                })

                st.dataframe(ivi_data, use_container_width=True, hide_index=True)

            else:
                st.warning("⚠️ No hay parcelas para analizar")

    except Exception as e:
        st.error(f"❌ Error: {str(e)}")


# Sidebar con información
with st.sidebar:
    st.header("ℹ️ Ayuda")

    st.markdown("""
    ### Medición de Árboles

    **Criterios de Inclusión:**
    - DAP ≥ 10 cm (1.3 m de altura)
    - Árbol vivo y en pie
    - Dentro de los límites de la parcela

    **Instrucciones:**
    1. Seleccione la parcela
    2. Mida el DAP con cinta diamétrica
    3. Mida la altura con clinómetro (opcional)
    4. Identifique la especie
    5. Registre observaciones

    **Datos Requeridos:**
    - ✅ Número de árbol
    - ✅ Especie
    - ✅ DAP (cm)
    - 📝 Altura total (m) - opcional
    - 📝 Altura comercial (m) - opcional
    """)

    st.divider()

    st.markdown("""
    ### 📐 Área Basal

    Se calcula automáticamente:

    **AB = π × (DAP/2)²**

    Expresada en m²
    """)

    st.divider()

    st.markdown("""
    ### 🔢 Estadísticas

    El sistema calcula:
    - DAP promedio, mínimo, máximo
    - Altura promedio
    - Área basal total
    - Número de especies
    - Distribución diamétrica
    - IVI por especie
    """)
