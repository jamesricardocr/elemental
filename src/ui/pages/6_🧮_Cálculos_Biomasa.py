"""
Página de Cálculos de Biomasa y Carbono
Aplicación de modelos alométricos y visualización de resultados
"""

import streamlit as st
import requests
import pandas as pd

# Configuración de la página
st.set_page_config(
    page_title="Cálculos de Biomasa",
    page_icon="🧮",
    layout="wide"
)

# URL de la API
API_URL = "http://localhost:8000/api/v1"

# Título
st.title("🧮 Cálculos de Biomasa y Carbono")
st.markdown("Aplicación de modelos alométricos y cuantificación de carbono almacenado")
st.markdown("---")

# Tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "🌳 Biomasa Arbórea",
    "🪵 Biomasa Necromasa",
    "🌿 Biomasa Herbáceas",
    "📊 Resumen Total"
])

# TAB 1: BIOMASA ARBÓREA
with tab1:
    st.header("🌳 Biomasa Arbórea - Modelos Alométricos")

    # Información sobre modelos
    with st.expander("📖 Modelos Alométricos Disponibles"):
        st.markdown("""
        ### 1. Modelo Chave et al. 2014 (Recomendado)
        **Ecuación:** AGB = 0.0673 × (ρ × DAP² × H)^0.976

        **Variables:**
        - ρ: Densidad de la madera (g/cm³)
        - DAP: Diámetro a la altura del pecho (cm)
        - H: Altura total (m)

        **Características:**
        - Desarrollado para bosques pantropicales
        - Incluye más de 4,000 árboles medidos
        - Alta precisión para bosques húmedos tropicales
        - Estima altura si no se midió

        ---

        ### 2. Modelo IPCC 2006
        **Ecuación:** AGB = a × DAP^b

        **Coeficientes para bosque tropical húmedo:**
        - a = 0.11
        - b = 2.62

        **Características:**
        - Modelo simplificado del IPCC
        - No requiere altura
        - Ajustado por densidad de madera
        - Usado en inventarios nacionales

        ---

        ### 3. Modelo IDEAM Colombia
        **Ecuación:** AGB = exp(-2.4090 + 0.9522 × ln(ρ × DAP² × H))

        **Características:**
        - Desarrollado para bosques colombianos
        - Calibrado con datos locales
        - Incluye variabilidad regional
        - Recomendado para reportes oficiales en Colombia

        ---

        ### Cálculo de Carbono
        **C = AGB × 0.47**

        Factor de carbono: 47% de la biomasa seca

        ### CO₂ Equivalente
        **CO₂eq = C × (44/12) = C × 3.67**

        Relación molecular CO₂/C
        """)

    st.divider()

    # Seleccionar parcela
    try:
        response = requests.get(f"{API_URL}/parcelas/", timeout=10)

        if response.status_code == 200:
            parcelas = response.json().get("parcelas", [])

            if not parcelas:
                st.warning("⚠️ No hay parcelas registradas")
            else:
                parcelas_dict = {
                    f"{p['codigo']} - {p.get('nombre', 'Sin nombre')}": p['id']
                    for p in parcelas
                }

                parcela_seleccionada = st.selectbox(
                    "📍 Seleccionar Parcela",
                    options=list(parcelas_dict.keys())
                )

                parcela_id = parcelas_dict[parcela_seleccionada]

                st.divider()

                # Selector de modelo
                col1, col2 = st.columns([2, 1])

                with col1:
                    modelo = st.selectbox(
                        "🔬 Modelo Alométrico",
                        options=[
                            "chave_2014",
                            "ipcc_2006",
                            "ideam"
                        ],
                        format_func=lambda x: {
                            "chave_2014": "Chave et al. 2014 (Recomendado)",
                            "ipcc_2006": "IPCC 2006",
                            "ideam": "IDEAM Colombia"
                        }[x]
                    )

                with col2:
                    comparar_modelos = st.checkbox(
                        "Comparar modelos",
                        help="Muestra resultados de los 3 modelos"
                    )

                if st.button("🧮 Calcular Biomasa", type="primary", use_container_width=True):
                    # TODO: Llamar a la API para calcular
                    st.info("🚧 Cálculo en desarrollo - Datos de demostración")

                    # Mock data - resultados simulados
                    if comparar_modelos:
                        st.subheader("📊 Comparación de Modelos")

                        comparacion = pd.DataFrame({
                            "Modelo": ["Chave 2014", "IPCC 2006", "IDEAM"],
                            "Biomasa (Mg/ha)": [245.8, 238.2, 252.1],
                            "Carbono (Mg C/ha)": [115.5, 112.0, 118.5],
                            "CO₂eq (Mg/ha)": [423.8, 410.8, 434.7]
                        })

                        st.dataframe(comparacion, use_container_width=True, hide_index=True)

                        st.bar_chart(comparacion.set_index("Modelo")["Biomasa (Mg/ha)"])

                        st.info("""
                        💡 **Interpretación:**
                        - Variación entre modelos: ~5%
                        - Se recomienda usar Chave 2014 para bosques tropicales
                        - IDEAM es preferido para reportes oficiales en Colombia
                        """)

                    else:
                        st.subheader(f"📊 Resultados - {modelo.replace('_', ' ').title()}")

                        # Resultados principales
                        col1, col2, col3, col4 = st.columns(4)

                        with col1:
                            st.metric(
                                "Biomasa Total",
                                "24.58 Mg",
                                help="Biomasa total en la parcela (0.1 ha)"
                            )

                        with col2:
                            st.metric(
                                "Biomasa por Hectárea",
                                "245.8 Mg/ha",
                                help="Biomasa arbórea extrapolada"
                            )

                        with col3:
                            st.metric(
                                "Carbono Almacenado",
                                "115.5 Mg C/ha",
                                delta="+5.2% vs promedio regional",
                                help="Carbono en biomasa arbórea"
                            )

                        with col4:
                            st.metric(
                                "CO₂ Equivalente",
                                "423.8 Mg CO₂/ha",
                                help="Emisiones evitadas"
                            )

                        st.divider()

                        # Detalles del cálculo
                        st.subheader("📋 Detalles del Cálculo")

                        col1, col2 = st.columns(2)

                        with col1:
                            st.markdown("""
                            **Datos de entrada:**
                            - Número de árboles medidos: 45
                            - DAP promedio: 28.5 cm
                            - Altura promedio: 18.2 m
                            - Densidad madera promedio: 0.62 g/cm³
                            - Área de la parcela: 0.1 ha
                            """)

                        with col2:
                            st.markdown(f"""
                            **Parámetros del modelo:**
                            - Modelo: {modelo.replace('_', ' ').title()}
                            - Factor de carbono: 0.47
                            - Factor CO₂/C: 3.67
                            - Área basal total: 2.85 m²
                            """)

                        st.divider()

                        # Distribución por clases diamétricas
                        st.subheader("📏 Biomasa por Clase Diamétrica")

                        biomasa_clases = pd.DataFrame({
                            "Clase DAP (cm)": ["10-20", "20-30", "30-40", "40-50", "50+"],
                            "No. Árboles": [15, 18, 8, 3, 1],
                            "Biomasa (Mg)": [2.5, 8.2, 7.8, 4.1, 1.98],
                            "% Total": [10.2, 33.4, 31.7, 16.7, 8.0]
                        })

                        st.dataframe(biomasa_clases, use_container_width=True, hide_index=True)

                        st.bar_chart(biomasa_clases.set_index("Clase DAP (cm)")["Biomasa (Mg)"])

        else:
            st.error("❌ Error al obtener parcelas")

    except Exception as e:
        st.error(f"❌ Error: {str(e)}")


# TAB 2: BIOMASA NECROMASA
with tab2:
    st.header("🪵 Biomasa de Necromasa")

    st.markdown("""
    La biomasa de necromasa se calcula a partir del volumen y densidad de la madera muerta.

    **Fórmula:** Biomasa = Volumen × Densidad
    """)

    st.divider()

    # Seleccionar parcela
    try:
        response = requests.get(f"{API_URL}/parcelas/", timeout=10)

        if response.status_code == 200 and response.json().get("parcelas"):
            parcelas = response.json()["parcelas"]

            parcelas_dict = {
                f"{p['codigo']} - {p.get('nombre', 'Sin nombre')}": p['id']
                for p in parcelas
            }

            parcela_necromasa = st.selectbox(
                "📍 Seleccionar Parcela",
                options=list(parcelas_dict.keys()),
                key="necromasa_calc"
            )

            st.divider()

            # Parámetros
            col1, col2 = st.columns(2)

            with col1:
                densidad_necromasa = st.slider(
                    "Densidad de Madera Muerta (g/cm³)",
                    min_value=0.2,
                    max_value=0.8,
                    value=0.4,
                    step=0.05,
                    help="Densidad típica: 0.3-0.5 g/cm³"
                )

            with col2:
                st.info(f"""
                **Densidad seleccionada:** {densidad_necromasa} g/cm³

                Valores típicos:
                - Fresca: 0.6-0.8
                - Intermedia: 0.4-0.6
                - Avanzada: 0.2-0.4
                """)

            if st.button("🧮 Calcular Biomasa Necromasa", use_container_width=True):
                st.info("🚧 Cálculo en desarrollo - Datos de demostración")

                # Resultados
                col1, col2, col3, col4 = st.columns(4)

                with col1:
                    st.metric("Volumen Total", "2.35 m³")

                with col2:
                    st.metric("Biomasa", "9.4 Mg/ha")

                with col3:
                    st.metric("Carbono", "4.42 Mg C/ha")

                with col4:
                    st.metric("CO₂eq", "16.2 Mg CO₂/ha")

    except:
        st.error("❌ Error al cargar datos")


# TAB 3: BIOMASA HERBÁCEAS
with tab3:
    st.header("🌿 Biomasa de Vegetación Herbácea")

    st.markdown("""
    La biomasa herbácea se extrapola del peso seco medido en cuadrantes de 1m × 1m.

    **Extrapolación:** Biomasa_ha = (Peso_seco_promedio / 1m²) × 10,000 m²
    """)

    st.divider()

    # Seleccionar parcela
    try:
        response = requests.get(f"{API_URL}/parcelas/", timeout=10)

        if response.status_code == 200 and response.json().get("parcelas"):
            parcelas = response.json()["parcelas"]

            parcelas_dict = {
                f"{p['codigo']} - {p.get('nombre', 'Sin nombre')}": p['id']
                for p in parcelas
            }

            parcela_herbaceas = st.selectbox(
                "📍 Seleccionar Parcela",
                options=list(parcelas_dict.keys()),
                key="herbaceas_calc"
            )

            if st.button("🧮 Calcular Biomasa Herbáceas", use_container_width=True):
                st.info("🚧 Cálculo en desarrollo - Datos de demostración")

                # Resultados
                col1, col2, col3, col4 = st.columns(4)

                with col1:
                    st.metric("Cuadrantes", "15")

                with col2:
                    st.metric("Biomasa", "3.53 Mg/ha")

                with col3:
                    st.metric("Carbono", "1.66 Mg C/ha")

                with col4:
                    st.metric("CO₂eq", "6.09 Mg CO₂/ha")

    except:
        st.error("❌ Error al cargar datos")


# TAB 4: RESUMEN TOTAL
with tab4:
    st.header("📊 Resumen Total de Biomasa y Carbono")

    # Seleccionar parcela
    try:
        response = requests.get(f"{API_URL}/parcelas/", timeout=10)

        if response.status_code == 200 and response.json().get("parcelas"):
            parcelas = response.json()["parcelas"]

            parcelas_dict = {
                f"{p['codigo']} - {p.get('nombre', 'Sin nombre')}": p['id']
                for p in parcelas
            }

            parcela_resumen = st.selectbox(
                "📍 Seleccionar Parcela",
                options=list(parcelas_dict.keys()),
                key="resumen_calc"
            )

            modelo_resumen = st.selectbox(
                "🔬 Modelo Alométrico",
                options=["chave_2014", "ipcc_2006", "ideam"],
                format_func=lambda x: {
                    "chave_2014": "Chave et al. 2014",
                    "ipcc_2006": "IPCC 2006",
                    "ideam": "IDEAM Colombia"
                }[x],
                key="modelo_resumen"
            )

            if st.button("🧮 Calcular Biomasa Total", type="primary", use_container_width=True):
                st.info("🚧 Cálculo completo en desarrollo - Datos de demostración")

                st.divider()

                # Resumen por componente
                st.subheader("📊 Biomasa por Componente")

                componentes = pd.DataFrame({
                    "Componente": ["Arbórea", "Necromasa", "Herbáceas", "TOTAL"],
                    "Biomasa (Mg/ha)": [245.8, 9.4, 3.5, 258.7],
                    "% del Total": [95.0, 3.6, 1.4, 100.0],
                    "Carbono (Mg C/ha)": [115.5, 4.4, 1.7, 121.6],
                    "CO₂eq (Mg/ha)": [423.8, 16.2, 6.1, 446.1]
                })

                st.dataframe(
                    componentes.style.highlight_max(subset=["Biomasa (Mg/ha)"], color="lightgreen"),
                    use_container_width=True,
                    hide_index=True
                )

                # Gráfico de pastel
                st.divider()
                st.subheader("🥧 Distribución de Biomasa")

                col1, col2 = st.columns(2)

                with col1:
                    biomasa_dist = pd.DataFrame({
                        "Componente": ["Arbórea", "Necromasa", "Herbáceas"],
                        "Biomasa": [245.8, 9.4, 3.5]
                    })
                    st.bar_chart(biomasa_dist.set_index("Componente"))

                with col2:
                    st.markdown("""
                    **Interpretación:**

                    - **Arbórea (95.0%):** Principal almacén de carbono
                    - **Necromasa (3.6%):** Almacenamiento a largo plazo
                    - **Herbáceas (1.4%):** Ciclado rápido de nutrientes

                    **Total:** 258.7 Mg/ha de biomasa
                    **Carbono:** 121.6 Mg C/ha
                    """)

                st.divider()

                # Métricas principales
                st.subheader("🎯 Resultados Principales")

                col1, col2, col3 = st.columns(3)

                with col1:
                    st.metric(
                        "Biomasa Total",
                        "258.7 Mg/ha",
                        delta="+12.5% vs promedio Amazonía",
                        help="Biomasa aérea total"
                    )

                with col2:
                    st.metric(
                        "Carbono Almacenado",
                        "121.6 Mg C/ha",
                        help="Carbono total en todos los componentes"
                    )

                with col3:
                    st.metric(
                        "CO₂ Equivalente",
                        "446.1 Mg CO₂/ha",
                        help="Emisiones evitadas si se conserva"
                    )

                st.divider()

                # Equivalencias
                st.subheader("🌍 Equivalencias del Carbono Almacenado")

                st.markdown(f"""
                El carbono almacenado en esta parcela (0.1 ha) equivale a:

                - 🚗 **Emisiones de {121.6 * 0.1 / 4.6:.1f} vehículos** por un año
                - ✈️ **{121.6 * 0.1 / 0.9:.0f} vuelos** Bogotá-Leticia (ida y vuelta)
                - 🏭 **{121.6 * 0.1 * 1000 / 411:.0f} kg de carbón** quemado
                - 🌳 **{121.6 * 0.1 / 0.02:.0f} árboles urbanos** de 10 años

                💡 **Conservar este bosque evita la emisión de {446.1 * 0.1:.1f} toneladas de CO₂**
                """)

    except Exception as e:
        st.error(f"❌ Error: {str(e)}")


# Sidebar
with st.sidebar:
    st.header("ℹ️ Información")

    st.markdown("""
    ### Modelos Alométricos

    **Chave 2014:**
    - Bosques tropicales
    - Alta precisión
    - Requiere densidad madera

    **IPCC 2006:**
    - Inventarios nacionales
    - Modelo simplificado
    - No requiere altura

    **IDEAM:**
    - Específico para Colombia
    - Reportes oficiales
    - Validado localmente

    ### Factor de Carbono

    **C = Biomasa × 0.47**

    El 47% de la biomasa seca es carbono

    ### CO₂ Equivalente

    **CO₂ = C × 3.67**

    Relación molecular CO₂/C = 44/12

    ### Valores de Referencia

    **Amazonía colombiana:**
    - Biomasa: 200-350 Mg/ha
    - Carbono: 100-165 Mg C/ha
    - CO₂eq: 350-600 Mg/ha
    """)
