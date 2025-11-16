"""
Página de Registro de Necromasa
Mediciones de madera muerta por parcela
"""

import streamlit as st
import requests
from src.ui.components import (
    formulario_medicion_necromasa,
    tabla_necromasa
)

# Configuración de la página
st.set_page_config(
    page_title="Registro de Necromasa",
    page_icon="🪵",
    layout="wide"
)

# URL de la API
API_URL = "http://localhost:8000/api/v1"

# Título
st.title("🪵 Registro de Necromasa")
st.markdown("Medición de madera muerta en subparcelas de 5m × 5m")
st.markdown("---")

# Tabs
tab1, tab2, tab3 = st.tabs(["➕ Nueva Medición", "📋 Lista de Mediciones", "📊 Análisis"])

# TAB 1: NUEVA MEDICIÓN
with tab1:
    st.header("Registrar Medición de Necromasa")

    # Información sobre el protocolo
    with st.expander("📖 Protocolo de Medición de Necromasa"):
        st.markdown("""
        ### Definición
        La necromasa incluye toda la biomasa de madera muerta:
        - Troncos caídos
        - Ramas gruesas (diámetro > 10 cm)
        - Árboles muertos en pie
        - Tocones

        ### Metodología
        1. **Subparcelas:** Medir en subparcelas de 5m × 5m
        2. **Diámetro mínimo:** 10 cm
        3. **Mediciones:**
           - Diámetro en el punto medio
           - Longitud total
           - Tipo de necromasa
           - Estado de descomposición

        4. **Muestras de laboratorio:**
           - Peso fresco (en campo)
           - Peso seco (después de 48-72h a 65°C)

        ### Estados de Descomposición
        - **Fresco:** Madera dura, corteza intacta
        - **Intermedio:** Madera parcialmente blanda, corteza parcial
        - **Avanzado:** Madera blanda, sin corteza
        - **Muy avanzado:** Madera muy blanda, fragmentada
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
                    help="Seleccione la parcela donde se midió la necromasa"
                )

                parcela_id = parcelas_dict[parcela_seleccionada]

                # Mostrar esquema de subparcelas
                st.info("""
                💡 **Distribución de Subparcelas**

                La parcela de 20m × 50m se divide en 20 subparcelas de 5m × 5m.
                Registre el número de subparcela (1-20) donde realizó la medición.
                """)

                st.divider()

                # Formulario de medición
                necromasa_creada = formulario_medicion_necromasa(
                    parcela_id=parcela_id,
                    api_url=API_URL
                )

                if necromasa_creada:
                    st.success("✅ Medición de necromasa registrada")

                    col1, col2, col3, col4 = st.columns(4)

                    with col1:
                        st.metric("Subparcela", necromasa_creada.get("numero_subparcela"))
                        st.metric("Muestra", necromasa_creada.get("numero_muestra"))

                    with col2:
                        st.metric("Tipo", necromasa_creada.get("tipo_necromasa", "N/A"))
                        st.metric("Diámetro", f"{necromasa_creada.get('diametro', 0):.1f} cm")

                    with col3:
                        if necromasa_creada.get("longitud"):
                            st.metric("Longitud", f"{necromasa_creada.get('longitud', 0):.1f} m")
                        if necromasa_creada.get("peso_fresco"):
                            st.metric("Peso Fresco", f"{necromasa_creada.get('peso_fresco', 0):.2f} kg")

                    with col4:
                        if necromasa_creada.get("peso_seco"):
                            st.metric("Peso Seco", f"{necromasa_creada.get('peso_seco', 0):.2f} kg")
                            # Calcular contenido de humedad
                            if necromasa_creada.get("peso_fresco", 0) > 0:
                                humedad = ((necromasa_creada["peso_fresco"] - necromasa_creada["peso_seco"]) /
                                          necromasa_creada["peso_fresco"]) * 100
                                st.metric("Humedad", f"{humedad:.1f}%")

        else:
            st.error(f"❌ Error al obtener parcelas: {response.status_code}")

    except requests.exceptions.ConnectionError:
        st.error("❌ No se pudo conectar con la API.")
        st.info("💡 Ejecuta: `uvicorn src.api.main:app --reload`")
    except Exception as e:
        st.error(f"❌ Error: {str(e)}")


# TAB 2: LISTA DE MEDICIONES
with tab2:
    st.header("Lista de Mediciones de Necromasa")

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
        except:
            st.error("❌ Error al cargar parcelas")

    with col2:
        filtro_tipo = st.selectbox(
            "🔍 Filtrar por Tipo",
            options=["Todos", "Tronco caído", "Rama gruesa", "Tocón", "Árbol en pie muerto"]
        )

    with col3:
        if st.button("🔄 Actualizar", use_container_width=True):
            st.rerun()

    st.divider()

    # TODO: Obtener mediciones desde la API
    st.info("🚧 Endpoint de necromasa en desarrollo")

    # Mock data para demostración
    necromasa_mock = [
        {
            "numero_subparcela": 1,
            "numero_muestra": 1,
            "tipo_necromasa": "Tronco caído",
            "diametro": 25.5,
            "longitud": 3.2,
            "peso_fresco": 15.5,
            "peso_seco": 8.2,
            "estado_descomposicion": "Intermedio",
            "fecha_medicion": "2025-11-08"
        },
        {
            "numero_subparcela": 1,
            "numero_muestra": 2,
            "tipo_necromasa": "Rama gruesa",
            "diametro": 12.0,
            "longitud": 1.8,
            "peso_fresco": 4.5,
            "peso_seco": 2.1,
            "estado_descomposicion": "Avanzado",
            "fecha_medicion": "2025-11-08"
        }
    ]

    tabla_necromasa(necromasa_mock)


# TAB 3: ANÁLISIS
with tab3:
    st.header("📊 Análisis de Necromasa")

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
                    key="analisis_necromasa"
                )

                st.divider()

                # TODO: Obtener estadísticas reales
                st.info("🚧 Análisis en desarrollo - Datos de demostración")

                # Métricas principales
                col1, col2, col3, col4 = st.columns(4)

                with col1:
                    st.metric("Total Muestras", "25")
                    st.metric("Subparcelas", "8")

                with col2:
                    st.metric("Peso Fresco Total", "125.5 kg")
                    st.metric("Peso Seco Total", "62.3 kg")

                with col3:
                    st.metric("Volumen Total", "2.35 m³")
                    st.metric("Diámetro Promedio", "18.5 cm")

                with col4:
                    st.metric("Humedad Promedio", "50.4%")
                    st.metric("Densidad Promedio", "0.42 g/cm³")

                st.divider()

                # Distribución por tipo
                st.subheader("📊 Distribución por Tipo de Necromasa")

                import pandas as pd

                tipo_data = pd.DataFrame({
                    "Tipo": ["Tronco caído", "Rama gruesa", "Tocón", "Árbol en pie"],
                    "Cantidad": [12, 8, 3, 2]
                })

                st.bar_chart(tipo_data.set_index("Tipo"))

                st.divider()

                # Estado de descomposición
                st.subheader("🍄 Estado de Descomposición")

                estado_data = pd.DataFrame({
                    "Estado": ["Fresco", "Intermedio", "Avanzado", "Muy avanzado"],
                    "Cantidad": [5, 10, 7, 3],
                    "Peso Seco (kg)": [25.5, 22.0, 10.8, 4.0]
                })

                col1, col2 = st.columns(2)

                with col1:
                    st.dataframe(estado_data, use_container_width=True, hide_index=True)

                with col2:
                    st.bar_chart(estado_data.set_index("Estado")["Cantidad"])

                st.divider()

                # Biomasa extrapolada
                st.subheader("🌲 Biomasa de Necromasa")

                st.markdown("""
                **Cálculos basados en:**
                - Volumen total: 2.35 m³
                - Densidad promedio: 0.42 g/cm³
                - Factor de carbono: 0.47
                """)

                col1, col2, col3 = st.columns(3)

                with col1:
                    st.metric(
                        "Biomasa Total",
                        "987.0 kg",
                        help="Biomasa seca total de necromasa"
                    )

                with col2:
                    st.metric(
                        "Biomasa por Hectárea",
                        "9.87 Mg/ha",
                        help="Extrapolado a hectárea"
                    )

                with col3:
                    st.metric(
                        "Carbono Almacenado",
                        "4.64 Mg C/ha",
                        help="Carbono en necromasa por hectárea"
                    )

            else:
                st.warning("⚠️ No hay parcelas para analizar")

    except Exception as e:
        st.error(f"❌ Error: {str(e)}")


# Sidebar
with st.sidebar:
    st.header("ℹ️ Información")

    st.markdown("""
    ### Necromasa

    **Definición:**
    Biomasa de madera muerta que incluye:
    - Troncos caídos
    - Ramas gruesas (> 10 cm)
    - Árboles muertos en pie
    - Tocones

    ### Importancia

    La necromasa es importante porque:
    - **Almacena carbono** a largo plazo
    - **Hábitat** para fauna y hongos
    - **Nutrientes** para el suelo
    - **Indicador** de salud del bosque

    ### Protocolo

    **Subparcelas:** 5m × 5m
    **Diámetro mínimo:** 10 cm
    **Mediciones:**
    - Diámetro en punto medio
    - Longitud total
    - Tipo y estado
    - Pesos (fresco y seco)

    ### Densidad de Madera

    Valores típicos (g/cm³):
    - Fresca: 0.6 - 0.8
    - Intermedia: 0.4 - 0.6
    - Avanzada: 0.2 - 0.4
    - Muy avanzada: < 0.2
    """)

    st.divider()

    st.markdown("""
    ### 🧮 Cálculos

    **Volumen (cilindro):**
    V = π × r² × L

    **Biomasa:**
    B = V × ρ

    **Carbono:**
    C = B × 0.47
    """)
