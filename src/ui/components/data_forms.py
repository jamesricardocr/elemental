"""
Componentes de Formularios
Formularios reutilizables para entrada de datos con Streamlit
"""

import streamlit as st
from datetime import date
from typing import Optional, Dict, Any, List
import requests
from src.utils.validators import (
    validar_coordenadas,
    validar_dap,
    validar_altura,
    validar_peso,
    validar_codigo_parcela
)
from src.utils.constants import (
    DAP_MINIMO,
    ALTURA_MAXIMA,
    ESTADOS_PARCELA,
    TIPO_COBERTURA_OPCIONES,
    ACCESIBILIDAD_OPCIONES
)


def formulario_nueva_parcela(
    api_url: str = "http://localhost:8000/api/v1"
) -> Optional[Dict[str, Any]]:
    """
    Formulario para crear una nueva parcela.

    Args:
        api_url: URL base de la API

    Returns:
        Datos de la parcela si se creó exitosamente, None si no
    """
    st.subheader("📝 Nueva Parcela")

    with st.form("form_nueva_parcela"):
        col1, col2 = st.columns(2)

        with col1:
            codigo = st.text_input(
                "Código de Parcela *",
                placeholder="P001",
                help="Código único de identificación"
            )

            nombre = st.text_input(
                "Nombre de la Parcela",
                placeholder="Parcela Experimental 1",
                help="Nombre descriptivo (opcional)"
            )

            zona = st.text_input(
                "Zona Priorizada",
                placeholder="Zona A - Leticia",
                help="Zona geográfica del proyecto"
            )

            tipo_cobertura = st.selectbox(
                "Tipo de Cobertura Vegetal",
                options=[""] + TIPO_COBERTURA_OPCIONES,
                help="Tipo de vegetación predominante"
            )

            accesibilidad = st.selectbox(
                "Accesibilidad",
                options=[""] + ACCESIBILIDAD_OPCIONES,
                help="Nivel de accesibilidad al sitio"
            )

        with col2:
            latitud = st.number_input(
                "Latitud (centro) *",
                min_value=-5.0,
                max_value=0.0,
                value=-4.2156,
                format="%.6f",
                help="Latitud en grados decimales (-5° a 0°)"
            )

            longitud = st.number_input(
                "Longitud (centro) *",
                min_value=-75.0,
                max_value=-66.0,
                value=-69.9406,
                format="%.6f",
                help="Longitud en grados decimales (-75° a -66°)"
            )

            altitud = st.number_input(
                "Altitud (m.s.n.m.)",
                min_value=0.0,
                max_value=5000.0,
                value=96.0,
                help="Altitud en metros sobre el nivel del mar"
            )

            pendiente = st.number_input(
                "Pendiente (%)",
                min_value=0.0,
                max_value=100.0,
                value=5.0,
                help="Pendiente del terreno en porcentaje"
            )

            estado = st.selectbox(
                "Estado",
                options=ESTADOS_PARCELA,
                help="Estado actual de la parcela"
            )

        responsable = st.text_input(
            "Responsable",
            placeholder="Nombre del investigador",
            help="Persona responsable de la parcela"
        )

        fecha_establecimiento = st.date_input(
            "Fecha de Establecimiento",
            value=date.today(),
            help="Fecha en que se estableció la parcela"
        )

        generar_vertices = st.checkbox(
            "Generar vértices automáticamente (20m × 50m)",
            value=True,
            help="Genera automáticamente los 4 vértices de la parcela rectangular"
        )

        observaciones = st.text_area(
            "Observaciones",
            placeholder="Notas adicionales sobre la parcela...",
            help="Cualquier observación relevante"
        )

        submitted = st.form_submit_button("✅ Crear Parcela", use_container_width=True)

        if submitted:
            # Validar campos requeridos
            if not codigo:
                st.error("❌ El código de parcela es requerido")
                return None

            # Validar código
            valido, mensaje = validar_codigo_parcela(codigo)
            if not valido:
                st.error(f"❌ {mensaje}")
                return None

            # Validar coordenadas
            valido, mensaje = validar_coordenadas(latitud, longitud)
            if not valido:
                st.error(f"❌ {mensaje}")
                return None

            # Preparar datos
            parcela_data = {
                "codigo": codigo,
                "nombre": nombre if nombre else None,
                "zona_priorizada": zona if zona else None,
                "latitud": latitud,
                "longitud": longitud,
                "altitud": altitud if altitud > 0 else None,
                "pendiente": pendiente if pendiente > 0 else None,
                "tipo_cobertura": tipo_cobertura if tipo_cobertura else None,
                "accesibilidad": accesibilidad if accesibilidad else None,
                "estado": estado,
                "responsable": responsable if responsable else None,
                "fecha_establecimiento": fecha_establecimiento.isoformat(),
                "generar_vertices": generar_vertices,
                "observaciones": observaciones if observaciones else None
            }

            # Enviar a la API
            try:
                with st.spinner("Creando parcela..."):
                    response = requests.post(
                        f"{api_url}/parcelas/",
                        json=parcela_data,
                        timeout=10
                    )

                    if response.status_code == 201:
                        parcela_creada = response.json()
                        st.success(f"✅ Parcela '{codigo}' creada exitosamente")
                        st.balloons()
                        return parcela_creada
                    else:
                        error_detail = response.json().get("detail", "Error desconocido")
                        st.error(f"❌ Error al crear parcela: {error_detail}")
                        return None

            except requests.exceptions.ConnectionError:
                st.error("❌ No se pudo conectar con la API. Verifica que esté ejecutándose.")
                return None
            except Exception as e:
                st.error(f"❌ Error inesperado: {str(e)}")
                return None

    return None


def formulario_medicion_arbol(
    parcela_id: int,
    especies: List[Dict],
    api_url: str = "http://localhost:8000/api/v1"
) -> Optional[Dict[str, Any]]:
    """
    Formulario para registrar medición de un árbol.

    Args:
        parcela_id: ID de la parcela
        especies: Lista de especies disponibles
        api_url: URL base de la API

    Returns:
        Datos del árbol si se creó exitosamente, None si no
    """
    st.subheader("🌳 Medición de Árbol")

    with st.form("form_medicion_arbol"):
        col1, col2 = st.columns(2)

        with col1:
            numero_arbol = st.number_input(
                "Número de Árbol *",
                min_value=1,
                step=1,
                help="Número correlativo del árbol en la parcela"
            )

            # Selector de especies
            especies_opciones = {f"{e['nombre_cientifico']} - {e['nombre_comun']}": e['id']
                               for e in especies}

            especie_seleccionada = st.selectbox(
                "Especie *",
                options=["Seleccione una especie..."] + list(especies_opciones.keys()),
                help="Nombre científico y común de la especie"
            )

            dap = st.number_input(
                f"DAP (cm) * [Mínimo: {DAP_MINIMO} cm]",
                min_value=DAP_MINIMO,
                max_value=300.0,
                value=DAP_MINIMO,
                step=0.1,
                format="%.1f",
                help="Diámetro a la altura del pecho (1.3m)"
            )

        with col2:
            altura = st.number_input(
                f"Altura Total (m)",
                min_value=0.1,
                max_value=ALTURA_MAXIMA,
                value=10.0,
                step=0.1,
                format="%.1f",
                help="Altura total del árbol en metros"
            )

            altura_comercial = st.number_input(
                "Altura Comercial (m)",
                min_value=0.0,
                max_value=ALTURA_MAXIMA,
                value=0.0,
                step=0.1,
                format="%.1f",
                help="Altura hasta la primera rama principal"
            )

            fecha_medicion = st.date_input(
                "Fecha de Medición",
                value=date.today()
            )

        observaciones = st.text_area(
            "Observaciones",
            placeholder="Estado del árbol, condiciones especiales...",
            help="Notas sobre el árbol"
        )

        submitted = st.form_submit_button("✅ Registrar Árbol", use_container_width=True)

        if submitted:
            # Validar especie seleccionada
            if especie_seleccionada == "Seleccione una especie...":
                st.error("❌ Debe seleccionar una especie")
                return None

            # Validar DAP
            valido, mensaje = validar_dap(dap)
            if not valido:
                st.error(f"❌ {mensaje}")
                return None

            # Validar altura
            if altura > 0:
                valido, mensaje = validar_altura(altura)
                if not valido:
                    st.error(f"❌ {mensaje}")
                    return None

            # Preparar datos
            arbol_data = {
                "parcela_id": parcela_id,
                "especie_id": especies_opciones[especie_seleccionada],
                "numero_arbol": numero_arbol,
                "dap": dap,
                "altura_total": altura if altura > 0 else None,
                "altura_comercial": altura_comercial if altura_comercial > 0 else None,
                "fecha_medicion": fecha_medicion.isoformat(),
                "observaciones": observaciones if observaciones else None
            }

            # TODO: Implementar cuando exista el endpoint
            st.info("🚧 Endpoint de árboles pendiente de implementación")
            return arbol_data

    return None


def formulario_medicion_necromasa(
    parcela_id: int,
    api_url: str = "http://localhost:8000/api/v1"
) -> Optional[Dict[str, Any]]:
    """
    Formulario para registrar medición de necromasa.

    Args:
        parcela_id: ID de la parcela
        api_url: URL base de la API

    Returns:
        Datos de necromasa si se creó exitosamente, None si no
    """
    st.subheader("🪵 Medición de Necromasa")

    with st.form("form_medicion_necromasa"):
        col1, col2 = st.columns(2)

        with col1:
            numero_subparcela = st.number_input(
                "Número de Subparcela (5m × 5m) *",
                min_value=1,
                max_value=20,
                step=1,
                help="Número de la subparcela donde se midió"
            )

            numero_muestra = st.number_input(
                "Número de Muestra *",
                min_value=1,
                step=1,
                help="Número correlativo de la muestra"
            )

            tipo_necromasa = st.selectbox(
                "Tipo de Necromasa *",
                options=["", "Tronco caído", "Rama gruesa", "Tocón", "Árbol en pie muerto"],
                help="Clasificación del material medido"
            )

            diametro = st.number_input(
                "Diámetro (cm) *",
                min_value=0.1,
                max_value=200.0,
                value=10.0,
                step=0.1,
                format="%.1f",
                help="Diámetro de la pieza de necromasa"
            )

        with col2:
            longitud = st.number_input(
                "Longitud (m)",
                min_value=0.1,
                max_value=50.0,
                value=1.0,
                step=0.1,
                format="%.1f",
                help="Longitud de la pieza"
            )

            peso_fresco = st.number_input(
                "Peso Fresco (kg)",
                min_value=0.0,
                value=0.0,
                step=0.1,
                format="%.2f",
                help="Peso en campo (húmedo)"
            )

            peso_seco = st.number_input(
                "Peso Seco (kg)",
                min_value=0.0,
                value=0.0,
                step=0.1,
                format="%.2f",
                help="Peso después de secado en laboratorio"
            )

            fecha_medicion = st.date_input(
                "Fecha de Medición",
                value=date.today()
            )

        estado_descomposicion = st.selectbox(
            "Estado de Descomposición",
            options=["", "Fresco", "Intermedio", "Avanzado", "Muy avanzado"],
            help="Grado de descomposición observado"
        )

        observaciones = st.text_area(
            "Observaciones",
            placeholder="Condición, presencia de hongos, etc...",
            help="Notas sobre la muestra"
        )

        submitted = st.form_submit_button("✅ Registrar Necromasa", use_container_width=True)

        if submitted:
            # Validar campos requeridos
            if not tipo_necromasa:
                st.error("❌ Debe seleccionar el tipo de necromasa")
                return None

            # Validar pesos
            if peso_fresco > 0:
                valido, mensaje = validar_peso(peso_fresco)
                if not valido:
                    st.error(f"❌ Peso fresco: {mensaje}")
                    return None

            if peso_seco > 0:
                valido, mensaje = validar_peso(peso_seco)
                if not valido:
                    st.error(f"❌ Peso seco: {mensaje}")
                    return None

            # Preparar datos
            necromasa_data = {
                "parcela_id": parcela_id,
                "numero_subparcela": numero_subparcela,
                "numero_muestra": numero_muestra,
                "tipo_necromasa": tipo_necromasa,
                "diametro": diametro,
                "longitud": longitud if longitud > 0 else None,
                "peso_fresco": peso_fresco if peso_fresco > 0 else None,
                "peso_seco": peso_seco if peso_seco > 0 else None,
                "estado_descomposicion": estado_descomposicion if estado_descomposicion else None,
                "fecha_medicion": fecha_medicion.isoformat(),
                "observaciones": observaciones if observaciones else None
            }

            # TODO: Implementar cuando exista el endpoint
            st.info("🚧 Endpoint de necromasa pendiente de implementación")
            return necromasa_data

    return None


def formulario_medicion_herbaceas(
    parcela_id: int,
    api_url: str = "http://localhost:8000/api/v1"
) -> Optional[Dict[str, Any]]:
    """
    Formulario para registrar medición de vegetación herbácea.

    Args:
        parcela_id: ID de la parcela
        api_url: URL base de la API

    Returns:
        Datos de herbáceas si se creó exitosamente, None si no
    """
    st.subheader("🌿 Medición de Vegetación Herbácea")

    with st.form("form_medicion_herbaceas"):
        col1, col2 = st.columns(2)

        with col1:
            numero_cuadrante = st.number_input(
                "Número de Cuadrante (1m × 1m) *",
                min_value=1,
                max_value=100,
                step=1,
                help="Número del cuadrante de muestreo"
            )

            peso_fresco = st.number_input(
                "Peso Fresco (kg) *",
                min_value=0.01,
                max_value=50.0,
                value=0.5,
                step=0.01,
                format="%.2f",
                help="Peso en campo (húmedo)"
            )

            peso_seco = st.number_input(
                "Peso Seco (kg)",
                min_value=0.0,
                max_value=50.0,
                value=0.0,
                step=0.01,
                format="%.2f",
                help="Peso después de secado (48-72h a 65°C)"
            )

        with col2:
            cobertura_porcentaje = st.slider(
                "Cobertura (%)",
                min_value=0,
                max_value=100,
                value=50,
                step=5,
                help="Porcentaje de cobertura vegetal en el cuadrante"
            )

            altura_promedio = st.number_input(
                "Altura Promedio (cm)",
                min_value=0.0,
                max_value=200.0,
                value=10.0,
                step=0.5,
                format="%.1f",
                help="Altura promedio de la vegetación"
            )

            fecha_medicion = st.date_input(
                "Fecha de Medición",
                value=date.today()
            )

        especies_dominantes = st.text_input(
            "Especies Dominantes",
            placeholder="Heliconias, gramíneas, helechos...",
            help="Tipos de vegetación predominantes"
        )

        observaciones = st.text_area(
            "Observaciones",
            placeholder="Condiciones del suelo, humedad, etc...",
            help="Notas sobre el cuadrante"
        )

        submitted = st.form_submit_button("✅ Registrar Herbáceas", use_container_width=True)

        if submitted:
            # Validar peso fresco
            valido, mensaje = validar_peso(peso_fresco)
            if not valido:
                st.error(f"❌ {mensaje}")
                return None

            # Validar peso seco si se proporcionó
            if peso_seco > 0:
                valido, mensaje = validar_peso(peso_seco)
                if not valido:
                    st.error(f"❌ Peso seco: {mensaje}")
                    return None

            # Preparar datos
            herbaceas_data = {
                "parcela_id": parcela_id,
                "numero_cuadrante": numero_cuadrante,
                "peso_fresco": peso_fresco,
                "peso_seco": peso_seco if peso_seco > 0 else None,
                "cobertura_porcentaje": cobertura_porcentaje if cobertura_porcentaje > 0 else None,
                "altura_promedio": altura_promedio if altura_promedio > 0 else None,
                "especies_dominantes": especies_dominantes if especies_dominantes else None,
                "fecha_medicion": fecha_medicion.isoformat(),
                "observaciones": observaciones if observaciones else None
            }

            # TODO: Implementar cuando exista el endpoint
            st.info("🚧 Endpoint de herbáceas pendiente de implementación")
            return herbaceas_data

    return None
