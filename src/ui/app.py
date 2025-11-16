"""
Aplicación Principal - Streamlit
Sistema de Gestión de Biomasa y Carbono - Proyecto Ecoturismo Amazónico
PAP_2025_36_18 - SENA
"""

import streamlit as st
import sys
from pathlib import Path

# Agregar el directorio raíz al path
root_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(root_dir))

from config.settings import settings


# Configuración de la página
st.set_page_config(
    page_title="Sistema IAP - Biomasa y Carbono",
    page_icon="🌳",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        'About': f"# {settings.APP_NAME}\nVersión {settings.APP_VERSION}\n\nSENA - Centro para la Biodiversidad y el Turismo del Amazonas"
    }
)

# CSS personalizado
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1e7e34;
        font-weight: bold;
        text-align: center;
        margin-bottom: 2rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #666;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        text-align: center;
    }
    .info-box {
        background-color: #e7f3e7;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #1e7e34;
    }
</style>
""", unsafe_allow_html=True)


def main():
    """Función principal de la aplicación"""

    # Header
    st.markdown('<div class="main-header">🌳 Sistema de Gestión de Biomasa y Carbono</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="sub-header">Proyecto Ecoturismo Amazónico - PAP_2025_36_18</div>',
        unsafe_allow_html=True
    )
    st.markdown('<div class="sub-header">SENA - Centro para la Biodiversidad y el Turismo del Amazonas</div>', unsafe_allow_html=True)

    st.markdown("---")

    # Información del proyecto
    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("""
        ### 📍 Objetivo
        Cuantificar la biomasa y el carbono almacenado en zonas priorizadas del Amazonas
        para la promoción del turismo de naturaleza.
        """)

    with col2:
        st.markdown("""
        ### 🔬 Metodología
        - Parcelas de 0,1 hectáreas (20m × 50m)
        - Modelos alométricos (Chave, IPCC, IDEAM)
        - Factor de carbono: 0,47
        - Georreferenciación UTM/WGS84
        """)

    with col3:
        st.markdown("""
        ### 📊 Componentes
        - Biomasa aérea (árboles)
        - Biomasa subterránea (raíces)
        - Necromasa (material muerto)
        - Herbáceas
        """)

    st.markdown("---")

    # Módulos disponibles
    st.header("🚀 Módulos del Sistema")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.info("**📍 Mapa de Parcelas**\nVisualiza y gestiona parcelas georeferenciadas")
        st.info("**🌳 Registro de Árboles**\nRegistra mediciones de DAP y altura")
        st.info("**🪵 Registro de Necromasa**\nMediciones de biomasa muerta")

    with col2:
        st.info("**🌿 Registro de Herbáceas**\nVegetación herbácea por cuadrantes")
        st.info("**🧮 Cálculos de Biomasa**\nAplica modelos alométricos")
        st.info("**📊 Dashboard**\nVisualiza resultados y estadísticas")

    with col3:
        st.info("**📄 Reportes**\nGenera informes técnicos en PDF")
        st.info("**📦 Exportación**\nExporta a Excel, Shapefile, GeoJSON")
        st.info("**⚙️ Configuración**\nAdministración del sistema")

    st.markdown("---")

    # Estadísticas rápidas (placeholder)
    st.header("📈 Estadísticas Rápidas")

    col1, col2, col3, col4 = st.columns(4)

    col1.metric(
        label="Parcelas Registradas",
        value="0",
        help="Total de parcelas establecidas"
    )

    col2.metric(
        label="Árboles Medidos",
        value="0",
        help="Total de individuos con DAP ≥ 10 cm"
    )

    col3.metric(
        label="Carbono Total (t)",
        value="0.0",
        help="Toneladas de carbono almacenado"
    )

    col4.metric(
        label="Carbono/ha (t C/ha)",
        value="0.0",
        help="Promedio de carbono por hectárea"
    )

    st.markdown("---")

    # Instrucciones
    st.header("📖 Cómo Usar el Sistema")

    with st.expander("1️⃣ Establecer Parcelas", expanded=False):
        st.markdown("""
        1. Ve a **📍 Mapa de Parcelas**
        2. Haz clic en "Nueva Parcela"
        3. Ingresa las coordenadas GPS (UTM o Lat/Lon)
        4. Define los 4 vértices de la parcela (20m × 50m)
        5. Agrega información del sitio (pendiente, cobertura, etc.)
        """)

    with st.expander("2️⃣ Registrar Mediciones de Campo", expanded=False):
        st.markdown("""
        **Árboles:**
        - Medir DAP (≥ 10 cm) a 1,3 m del suelo
        - Medir altura total con hipsómetro
        - Identificar especie
        - Registrar en **🌳 Registro de Árboles**

        **Necromasa:**
        - Establecer subparcelas de 5m × 5m
        - Pesar material muerto (fresco y seco)
        - Registrar en **🪵 Registro de Necromasa**

        **Herbáceas:**
        - Establecer cuadrantes de 1m × 1m
        - Pesar vegetación herbácea
        - Registrar en **🌿 Registro de Herbáceas**
        """)

    with st.expander("3️⃣ Calcular Biomasa y Carbono", expanded=False):
        st.markdown("""
        1. Ve a **🧮 Cálculos de Biomasa**
        2. Selecciona la parcela
        3. Elige el modelo alométrico (Chave 2014, IPCC, IDEAM)
        4. El sistema calculará automáticamente:
           - Biomasa por componente
           - Carbono almacenado (× 0,47)
           - Valores por hectárea
        5. Valida los resultados
        """)

    with st.expander("4️⃣ Generar Reportes", expanded=False):
        st.markdown("""
        1. Ve a **📄 Reportes**
        2. Selecciona el tipo de reporte
        3. Elige las parcelas a incluir
        4. Genera PDF o exporta datos
        """)

    st.markdown("---")

    # Footer
    st.markdown("""
    <div style="text-align: center; color: #666; margin-top: 3rem;">
        <p><strong>Sistema IAP - Versión {}</strong></p>
        <p>SENA - Regional Amazonas | Centro para la Biodiversidad y el Turismo</p>
        <p>Proyecto: Ecoturismo Amazónico (PAP_2025_36_18)</p>
        <p style="font-size: 0.8rem; margin-top: 1rem;">
            ⚠️ Información confidencial - No divulgar sin autorización SENA<br>
            Período de confidencialidad: 2 años desde la fecha de terminación del contrato
        </p>
    </div>
    """.format(settings.APP_VERSION), unsafe_allow_html=True)

    # Sidebar
    with st.sidebar:
        st.image("https://via.placeholder.com/200x80/1e7e34/ffffff?text=SENA+Amazonas", use_container_width=True)

        st.markdown("### 📋 Navegación")
        st.info("Usa el menú principal para acceder a los diferentes módulos del sistema.")

        st.markdown("### ℹ️ Información")
        st.markdown(f"""
        **Versión:** {settings.APP_VERSION}
        **Entorno:** {settings.ENVIRONMENT}
        **Base de Datos:** Conectada ✓
        """)

        st.markdown("### 📞 Soporte")
        st.markdown("""
        Para asistencia técnica, contacta al administrador del sistema.
        """)


if __name__ == "__main__":
    main()
