"""
Página de Registro de Vegetación Herbácea
Mediciones de vegetación herbácea en cuadrantes de 1m × 1m
"""

import streamlit as st
import requests
from src.ui.components import (
    formulario_medicion_herbaceas,
    tabla_herbaceas
)

# Configuración de la página
st.set_page_config(
    page_title="Registro de Herbáceas",
    page_icon="🌿",
    layout="wide"
)

# URL de la API
API_URL = "http://localhost:8000/api/v1"

# Título
st.title("🌿 Registro de Vegetación Herbácea")
st.markdown("Medición de biomasa herbácea en cuadrantes de 1m × 1m")
st.markdown("---")

# Tabs
tab1, tab2, tab3 = st.tabs(["➕ Nueva Medición", "📋 Lista de Mediciones", "📊 Análisis"])

# TAB 1: NUEVA MEDICIÓN
with tab1:
    st.header("Registrar Medición de Vegetación Herbácea")

    # Información sobre el protocolo
    with st.expander("📖 Protocolo de Medición de Herbáceas"):
        st.markdown("""
        ### Definición
        La vegetación herbácea incluye:
        - Hierbas de sotobosque
        - Plántulas < 10 cm DAP
        - Arbustos pequeños
        - Helechos
        - Plantas rastreras

        ### Metodología
        1. **Cuadrantes:** Usar marcos de 1m × 1m
        2. **Distribución:** Colocar aleatoriamente en la parcela
        3. **Mínimo:** 10-20 cuadrantes por parcela

        ### Mediciones en Campo
        1. **Cobertura:** Porcentaje visual (0-100%)
        2. **Altura promedio:** En centímetros
        3. **Especies dominantes:** Identificación básica
        4. **Cosecha:**
           - Cortar toda la vegetación a ras de suelo
           - Pesar en campo (peso fresco)
           - Tomar submuestra para laboratorio

        ### Procesamiento en Laboratorio
        1. Secar en estufa (65°C, 48-72h)
        2. Pesar muestra seca
        3. Calcular relación peso seco/fresco
        4. Extrapolar a toda la muestra

        ### Extrapolación
        - Cuadrante: 1 m² = 0.0001 ha
        - Parcela: 1000 m² = 0.1 ha
        - Hectárea: 10,000 m²
        """)

    st.divider()

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
                    help="Seleccione la parcela donde se midió la vegetación"
                )

                parcela_id = parcelas_dict[parcela_seleccionada]

                st.info("""
                💡 **Recomendación de Muestreo**

                - Mínimo: 10 cuadrantes por parcela
                - Recomendado: 15-20 cuadrantes
                - Distribución: Aleatoria o sistemática
                """)

                st.divider()

                # Formulario de medición
                herbaceas_creada = formulario_medicion_herbaceas(
                    parcela_id=parcela_id,
                    api_url=API_URL
                )

                if herbaceas_creada:
                    st.success("✅ Medición de herbáceas registrada")

                    col1, col2, col3 = st.columns(3)

                    with col1:
                        st.metric("Cuadrante", herbaceas_creada.get("numero_cuadrante"))
                        st.metric("Peso Fresco", f"{herbaceas_creada.get('peso_fresco', 0):.2f} kg")

                    with col2:
                        if herbaceas_creada.get("peso_seco"):
                            st.metric("Peso Seco", f"{herbaceas_creada.get('peso_seco', 0):.2f} kg")

                            # Calcular contenido de humedad
                            peso_fresco = herbaceas_creada.get("peso_fresco", 0)
                            peso_seco = herbaceas_creada.get("peso_seco", 0)
                            if peso_fresco > 0:
                                humedad = ((peso_fresco - peso_seco) / peso_fresco) * 100
                                st.metric("Humedad", f"{humedad:.1f}%")

                    with col3:
                        if herbaceas_creada.get("cobertura_porcentaje"):
                            st.metric("Cobertura", f"{herbaceas_creada['cobertura_porcentaje']}%")
                        if herbaceas_creada.get("altura_promedio"):
                            st.metric("Altura", f"{herbaceas_creada['altura_promedio']:.1f} cm")

                    # Calcular biomasa del cuadrante
                    if herbaceas_creada.get("peso_seco"):
                        biomasa_kg_m2 = herbaceas_creada["peso_seco"] / 1.0  # 1 m²
                        st.divider()
                        st.subheader("📊 Biomasa del Cuadrante")

                        col1, col2, col3 = st.columns(3)

                        with col1:
                            st.metric("Biomasa", f"{biomasa_kg_m2:.3f} kg/m²")

                        with col2:
                            biomasa_mgha = biomasa_kg_m2 * 10  # kg/m² a Mg/ha
                            st.metric("Extrapolado", f"{biomasa_mgha:.2f} Mg/ha")

                        with col3:
                            carbono = biomasa_mgha * 0.47
                            st.metric("Carbono", f"{carbono:.2f} Mg C/ha")

        else:
            st.error(f"❌ Error al obtener parcelas: {response.status_code}")

    except requests.exceptions.ConnectionError:
        st.error("❌ No se pudo conectar con la API.")
        st.info("💡 Ejecuta: `uvicorn src.api.main:app --reload`")
    except Exception as e:
        st.error(f"❌ Error: {str(e)}")


# TAB 2: LISTA DE MEDICIONES
with tab2:
    st.header("Lista de Mediciones de Herbáceas")

    # Filtros
    col1, col2 = st.columns([3, 1])

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
        except:
            st.error("❌ Error al cargar parcelas")

    with col2:
        if st.button("🔄 Actualizar", use_container_width=True):
            st.rerun()

    st.divider()

    # TODO: Obtener mediciones desde la API
    st.info("🚧 Endpoint de herbáceas en desarrollo")

    # Mock data para demostración
    herbaceas_mock = [
        {
            "numero_cuadrante": 1,
            "peso_fresco": 0.85,
            "peso_seco": 0.35,
            "cobertura_porcentaje": 65,
            "altura_promedio": 12.5,
            "especies_dominantes": "Heliconias, helechos",
            "fecha_medicion": "2025-11-08"
        },
        {
            "numero_cuadrante": 2,
            "peso_fresco": 1.20,
            "peso_seco": 0.52,
            "cobertura_porcentaje": 80,
            "altura_promedio": 15.0,
            "especies_dominantes": "Gramíneas, plántulas",
            "fecha_medicion": "2025-11-08"
        },
        {
            "numero_cuadrante": 3,
            "peso_fresco": 0.65,
            "peso_seco": 0.28,
            "cobertura_porcentaje": 50,
            "altura_promedio": 8.5,
            "especies_dominantes": "Helechos",
            "fecha_medicion": "2025-11-08"
        }
    ]

    tabla_herbaceas(herbaceas_mock)


# TAB 3: ANÁLISIS
with tab3:
    st.header("📊 Análisis de Vegetación Herbácea")

    # Seleccionar parcela
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
                    "📍 Seleccionar Parcela",
                    options=list(parcelas_dict.keys()),
                    key="analisis_herbaceas"
                )

                st.divider()

                # TODO: Obtener estadísticas reales
                st.info("🚧 Análisis en desarrollo - Datos de demostración")

                # Métricas principales
                st.subheader("📈 Estadísticas Generales")

                col1, col2, col3, col4 = st.columns(4)

                with col1:
                    st.metric("Cuadrantes", "15")
                    st.metric("Peso Fresco Total", "12.5 kg")

                with col2:
                    st.metric("Peso Seco Total", "5.3 kg")
                    st.metric("Peso Seco Promedio", "0.35 kg/m²")

                with col3:
                    st.metric("Cobertura Promedio", "62.5%")
                    st.metric("Altura Promedio", "11.2 cm")

                with col4:
                    st.metric("Humedad Promedio", "57.6%")
                    st.metric("CV Peso Seco", "28.5%")

                st.divider()

                # Extrapolación a parcela
                st.subheader("🌲 Biomasa Extrapolada")

                st.markdown("""
                **Parámetros de extrapolación:**
                - Cuadrantes medidos: 15 (15 m²)
                - Área de la parcela: 1000 m² (0.1 ha)
                - Peso seco promedio: 0.35 kg/m²
                """)

                col1, col2, col3 = st.columns(3)

                with col1:
                    st.metric(
                        "Biomasa Parcela",
                        "353.3 kg",
                        help="Biomasa total en la parcela (1000 m²)"
                    )

                with col2:
                    st.metric(
                        "Biomasa por Hectárea",
                        "3.53 Mg/ha",
                        help="Extrapolado a hectárea"
                    )

                with col3:
                    carbono = 3.53 * 0.47
                    st.metric(
                        "Carbono Almacenado",
                        f"{carbono:.2f} Mg C/ha",
                        help="Carbono en vegetación herbácea"
                    )

                st.divider()

                # Distribución de cobertura
                st.subheader("📊 Distribución de Cobertura")

                import pandas as pd

                cobertura_data = pd.DataFrame({
                    "Rango Cobertura (%)": ["0-25", "25-50", "50-75", "75-100"],
                    "Frecuencia": [1, 4, 7, 3]
                })

                col1, col2 = st.columns(2)

                with col1:
                    st.bar_chart(cobertura_data.set_index("Rango Cobertura (%)"))

                with col2:
                    st.dataframe(cobertura_data, use_container_width=True, hide_index=True)

                st.divider()

                # Especies más frecuentes
                st.subheader("🌱 Especies/Tipos Más Frecuentes")

                especies_freq = pd.DataFrame({
                    "Tipo": ["Heliconias", "Helechos", "Gramíneas", "Plántulas", "Otros"],
                    "Frecuencia": [8, 12, 6, 7, 4],
                    "Porcentaje": [21.6, 32.4, 16.2, 18.9, 10.8]
                })

                st.dataframe(especies_freq, use_container_width=True, hide_index=True)

                st.divider()

                # Relación cobertura-biomasa
                st.subheader("📈 Relación Cobertura-Biomasa")

                st.markdown("""
                Análisis de correlación entre cobertura vegetal y biomasa medida.
                """)

                # Gráfico scatter (simulado)
                scatter_data = pd.DataFrame({
                    "Cobertura (%)": [30, 45, 50, 60, 65, 70, 75, 80, 85, 90],
                    "Biomasa (kg/m²)": [0.18, 0.25, 0.28, 0.32, 0.35, 0.38, 0.42, 0.52, 0.48, 0.55]
                })

                st.line_chart(scatter_data.set_index("Cobertura (%)"))

                st.info("💡 Se observa una correlación positiva entre cobertura y biomasa (r² ≈ 0.85)")

            else:
                st.warning("⚠️ No hay parcelas para analizar")

    except Exception as e:
        st.error(f"❌ Error: {str(e)}")


# Sidebar
with st.sidebar:
    st.header("ℹ️ Información")

    st.markdown("""
    ### Vegetación Herbácea

    **Incluye:**
    - Hierbas de sotobosque
    - Plántulas (DAP < 10 cm)
    - Arbustos pequeños
    - Helechos y musgos
    - Plantas rastreras

    ### Importancia

    - **Productividad primaria** del sotobosque
    - **Ciclado de nutrientes** rápido
    - **Regeneración** del bosque
    - **Hábitat** para fauna pequeña

    ### Protocolo de Campo

    1. **Cuadrantes:** 1m × 1m
    2. **Número:** 10-20 por parcela
    3. **Distribución:** Aleatoria
    4. **Mediciones:**
       - Cobertura visual (%)
       - Altura promedio (cm)
       - Cosecha total
       - Peso fresco inmediato

    ### Laboratorio

    1. Secar a 65°C
    2. Secar 48-72 horas
    3. Pesar hasta peso constante
    4. Calcular % materia seca
    """)

    st.divider()

    st.markdown("""
    ### 🧮 Cálculos

    **Biomasa por m²:**
    B = Peso seco / Área

    **Extrapolación a ha:**
    B_ha = B_m² × 10,000

    **Carbono:**
    C = B × 0.47

    **Intervalo de confianza:**
    IC = x̄ ± (t × SE)
    """)

    st.divider()

    st.markdown("""
    ### 📊 Valores Típicos

    **Bosque tropical:**
    - 1-5 Mg/ha de biomasa
    - 0.5-2.5 Mg C/ha
    - Cobertura: 40-90%
    - Altura: 5-30 cm
    """)
