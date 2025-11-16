"""
Componentes de Tablas
Tablas reutilizables para visualización de datos con Streamlit
"""

import streamlit as st
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime


def tabla_parcelas(
    parcelas: List[Dict[str, Any]],
    mostrar_acciones: bool = True
) -> Optional[int]:
    """
    Tabla interactiva para mostrar parcelas.

    Args:
        parcelas: Lista de parcelas
        mostrar_acciones: Si True, muestra botones de acción

    Returns:
        ID de la parcela seleccionada si se hace clic, None si no
    """
    if not parcelas:
        st.info("📋 No hay parcelas para mostrar")
        return None

    # Convertir a DataFrame
    df_data = []
    for p in parcelas:
        df_data.append({
            "ID": p.get("id"),
            "Código": p.get("codigo"),
            "Nombre": p.get("nombre", "N/A"),
            "Zona": p.get("zona_priorizada", "N/A"),
            "Estado": p.get("estado", "N/A"),
            "Latitud": f"{p.get('latitud', 0):.6f}" if p.get('latitud') else "N/A",
            "Longitud": f"{p.get('longitud', 0):.6f}" if p.get('longitud') else "N/A",
            "Responsable": p.get("responsable", "N/A"),
            "Fecha": p.get("fecha_establecimiento", "N/A")
        })

    df = pd.DataFrame(df_data)

    # Aplicar estilos según estado
    def highlight_estado(row):
        estado = row["Estado"]
        if estado == "activa":
            return ["background-color: #d4edda"] * len(row)
        elif estado == "completada":
            return ["background-color: #d1ecf1"] * len(row)
        elif estado == "inactiva":
            return ["background-color: #f8d7da"] * len(row)
        else:
            return [""] * len(row)

    # Mostrar tabla con estilos
    st.dataframe(
        df.style.apply(highlight_estado, axis=1),
        use_container_width=True,
        hide_index=True
    )

    # Leyenda de colores
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("🟢 **Activa** = verde")
    with col2:
        st.markdown("🔵 **Completada** = azul")
    with col3:
        st.markdown("🔴 **Inactiva** = rojo")

    # Acciones
    if mostrar_acciones:
        st.divider()
        st.subheader("⚙️ Acciones")

        col1, col2 = st.columns([3, 1])

        with col1:
            parcela_ids = {f"{p['codigo']} - {p.get('nombre', 'Sin nombre')}": p['id']
                          for p in parcelas}

            parcela_seleccionada = st.selectbox(
                "Seleccionar parcela para ver detalles:",
                options=[""] + list(parcela_ids.keys())
            )

        with col2:
            if parcela_seleccionada:
                if st.button("👁️ Ver Detalles", use_container_width=True):
                    return parcela_ids[parcela_seleccionada]

    return None


def tabla_arboles(
    arboles: List[Dict[str, Any]],
    mostrar_calculos: bool = True
) -> None:
    """
    Tabla interactiva para mostrar mediciones de árboles.

    Args:
        arboles: Lista de árboles
        mostrar_calculos: Si True, muestra columnas de cálculos
    """
    if not arboles:
        st.info("🌳 No hay árboles registrados")
        return

    # Convertir a DataFrame
    df_data = []
    for a in arboles:
        row = {
            "No.": a.get("numero_arbol"),
            "Especie": a.get("especie", {}).get("nombre_cientifico", "N/A"),
            "Nombre Común": a.get("especie", {}).get("nombre_comun", "N/A"),
            "DAP (cm)": f"{a.get('dap', 0):.1f}",
            "Altura (m)": f"{a.get('altura_total', 0):.1f}" if a.get('altura_total') else "N/A",
            "H. Comercial (m)": f"{a.get('altura_comercial', 0):.1f}" if a.get('altura_comercial') else "N/A",
            "Fecha": a.get("fecha_medicion", "N/A")
        }

        if mostrar_calculos:
            # Cálculo de área basal (π * (DAP/2)²) en cm²
            dap = a.get('dap', 0)
            if dap > 0:
                import math
                radio_cm = dap / 2
                area_basal_cm2 = math.pi * (radio_cm ** 2)
                area_basal_m2 = area_basal_cm2 / 10000
                row["Área Basal (m²)"] = f"{area_basal_m2:.4f}"
            else:
                row["Área Basal (m²)"] = "N/A"

        df_data.append(row)

    df = pd.DataFrame(df_data)

    # Mostrar tabla
    st.dataframe(df, use_container_width=True, hide_index=True)

    # Estadísticas resumidas
    if len(arboles) > 0:
        st.divider()
        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric("Total de Árboles", len(arboles))

        with col2:
            daps = [a.get('dap', 0) for a in arboles if a.get('dap')]
            if daps:
                st.metric("DAP Promedio", f"{sum(daps)/len(daps):.1f} cm")
            else:
                st.metric("DAP Promedio", "N/A")

        with col3:
            alturas = [a.get('altura_total', 0) for a in arboles if a.get('altura_total')]
            if alturas:
                st.metric("Altura Promedio", f"{sum(alturas)/len(alturas):.1f} m")
            else:
                st.metric("Altura Promedio", "N/A")

        with col4:
            especies_unicas = set(a.get("especie", {}).get("nombre_cientifico")
                                for a in arboles if a.get("especie"))
            st.metric("Especies", len(especies_unicas))


def tabla_necromasa(
    necromasa_list: List[Dict[str, Any]]
) -> None:
    """
    Tabla interactiva para mostrar mediciones de necromasa.

    Args:
        necromasa_list: Lista de mediciones de necromasa
    """
    if not necromasa_list:
        st.info("🪵 No hay mediciones de necromasa")
        return

    # Convertir a DataFrame
    df_data = []
    for n in necromasa_list:
        df_data.append({
            "Subparcela": n.get("numero_subparcela"),
            "Muestra": n.get("numero_muestra"),
            "Tipo": n.get("tipo_necromasa", "N/A"),
            "Diámetro (cm)": f"{n.get('diametro', 0):.1f}",
            "Longitud (m)": f"{n.get('longitud', 0):.1f}" if n.get('longitud') else "N/A",
            "Peso Fresco (kg)": f"{n.get('peso_fresco', 0):.2f}" if n.get('peso_fresco') else "N/A",
            "Peso Seco (kg)": f"{n.get('peso_seco', 0):.2f}" if n.get('peso_seco') else "N/A",
            "Estado": n.get("estado_descomposicion", "N/A"),
            "Fecha": n.get("fecha_medicion", "N/A")
        })

    df = pd.DataFrame(df_data)

    # Mostrar tabla
    st.dataframe(df, use_container_width=True, hide_index=True)

    # Estadísticas resumidas
    if len(necromasa_list) > 0:
        st.divider()
        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric("Total de Muestras", len(necromasa_list))

        with col2:
            pesos_frescos = [n.get('peso_fresco', 0) for n in necromasa_list if n.get('peso_fresco')]
            if pesos_frescos:
                st.metric("Peso Fresco Total", f"{sum(pesos_frescos):.2f} kg")
            else:
                st.metric("Peso Fresco Total", "N/A")

        with col3:
            pesos_secos = [n.get('peso_seco', 0) for n in necromasa_list if n.get('peso_seco')]
            if pesos_secos:
                st.metric("Peso Seco Total", f"{sum(pesos_secos):.2f} kg")
            else:
                st.metric("Peso Seco Total", "N/A")

        with col4:
            subparcelas_unicas = set(n.get("numero_subparcela") for n in necromasa_list)
            st.metric("Subparcelas", len(subparcelas_unicas))


def tabla_herbaceas(
    herbaceas_list: List[Dict[str, Any]]
) -> None:
    """
    Tabla interactiva para mostrar mediciones de vegetación herbácea.

    Args:
        herbaceas_list: Lista de mediciones de herbáceas
    """
    if not herbaceas_list:
        st.info("🌿 No hay mediciones de vegetación herbácea")
        return

    # Convertir a DataFrame
    df_data = []
    for h in herbaceas_list:
        df_data.append({
            "Cuadrante": h.get("numero_cuadrante"),
            "Peso Fresco (kg)": f"{h.get('peso_fresco', 0):.2f}",
            "Peso Seco (kg)": f"{h.get('peso_seco', 0):.2f}" if h.get('peso_seco') else "N/A",
            "Cobertura (%)": f"{h.get('cobertura_porcentaje', 0)}" if h.get('cobertura_porcentaje') else "N/A",
            "Altura (cm)": f"{h.get('altura_promedio', 0):.1f}" if h.get('altura_promedio') else "N/A",
            "Especies": h.get("especies_dominantes", "N/A"),
            "Fecha": h.get("fecha_medicion", "N/A")
        })

    df = pd.DataFrame(df_data)

    # Mostrar tabla
    st.dataframe(df, use_container_width=True, hide_index=True)

    # Estadísticas resumidas
    if len(herbaceas_list) > 0:
        st.divider()
        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric("Total de Cuadrantes", len(herbaceas_list))

        with col2:
            pesos_frescos = [h.get('peso_fresco', 0) for h in herbaceas_list]
            st.metric("Peso Fresco Total", f"{sum(pesos_frescos):.2f} kg")

        with col3:
            pesos_secos = [h.get('peso_seco', 0) for h in herbaceas_list if h.get('peso_seco')]
            if pesos_secos:
                st.metric("Peso Seco Total", f"{sum(pesos_secos):.2f} kg")
            else:
                st.metric("Peso Seco Total", "N/A")

        with col4:
            coberturas = [h.get('cobertura_porcentaje', 0) for h in herbaceas_list if h.get('cobertura_porcentaje')]
            if coberturas:
                st.metric("Cobertura Promedio", f"{sum(coberturas)/len(coberturas):.1f}%")
            else:
                st.metric("Cobertura Promedio", "N/A")


def tabla_calculos_biomasa(
    calculos: List[Dict[str, Any]]
) -> None:
    """
    Tabla interactiva para mostrar resultados de cálculos de biomasa y carbono.

    Args:
        calculos: Lista de cálculos de biomasa
    """
    if not calculos:
        st.info("🧮 No hay cálculos de biomasa disponibles")
        return

    # Convertir a DataFrame
    df_data = []
    for c in calculos:
        df_data.append({
            "Fecha Cálculo": c.get("fecha_calculo", "N/A"),
            "Biomasa Arbórea (Mg/ha)": f"{c.get('biomasa_arborea_mgha', 0):.2f}",
            "Biomasa Necromasa (Mg/ha)": f"{c.get('biomasa_necromasa_mgha', 0):.2f}",
            "Biomasa Herbáceas (Mg/ha)": f"{c.get('biomasa_herbaceas_mgha', 0):.2f}",
            "Biomasa Total (Mg/ha)": f"{c.get('biomasa_total_mgha', 0):.2f}",
            "Carbono Total (Mg/ha)": f"{c.get('carbono_total_mgha', 0):.2f}",
            "CO₂ Equivalente (Mg/ha)": f"{c.get('co2_equivalente_mgha', 0):.2f}",
            "Modelo": c.get("modelo_alometrico", "N/A")
        })

    df = pd.DataFrame(df_data)

    # Mostrar tabla
    st.dataframe(df, use_container_width=True, hide_index=True)

    # Gráfico de barras comparativo si hay múltiples cálculos
    if len(calculos) > 1:
        st.divider()
        st.subheader("📊 Comparación de Biomasa")

        # Preparar datos para gráfico
        chart_data = pd.DataFrame({
            "Arbórea": [c.get('biomasa_arborea_mgha', 0) for c in calculos],
            "Necromasa": [c.get('biomasa_necromasa_mgha', 0) for c in calculos],
            "Herbáceas": [c.get('biomasa_herbaceas_mgha', 0) for c in calculos]
        })

        st.bar_chart(chart_data)

    # Métricas resumidas
    if len(calculos) > 0:
        st.divider()
        # Usar el cálculo más reciente
        ultimo_calculo = calculos[-1]

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            st.metric(
                "Biomasa Total",
                f"{ultimo_calculo.get('biomasa_total_mgha', 0):.2f} Mg/ha"
            )

        with col2:
            st.metric(
                "Carbono Total",
                f"{ultimo_calculo.get('carbono_total_mgha', 0):.2f} Mg/ha"
            )

        with col3:
            st.metric(
                "CO₂ Equivalente",
                f"{ultimo_calculo.get('co2_equivalente_mgha', 0):.2f} Mg/ha"
            )

        with col4:
            # Calcular carbono total en la parcela (0.1 ha)
            carbono_parcela = ultimo_calculo.get('carbono_total_mgha', 0) * 0.1
            st.metric(
                "Carbono en Parcela",
                f"{carbono_parcela:.2f} Mg"
            )


def tabla_resumen_especies(
    arboles: List[Dict[str, Any]]
) -> None:
    """
    Tabla resumen agrupada por especies.

    Args:
        arboles: Lista de árboles medidos
    """
    if not arboles:
        st.info("🌳 No hay datos de especies")
        return

    # Agrupar por especie
    especies_dict = {}
    for a in arboles:
        especie = a.get("especie", {})
        nombre_cientifico = especie.get("nombre_cientifico", "Desconocida")

        if nombre_cientifico not in especies_dict:
            especies_dict[nombre_cientifico] = {
                "nombre_comun": especie.get("nombre_comun", "N/A"),
                "familia": especie.get("familia", "N/A"),
                "densidad_madera": especie.get("densidad_madera", 0),
                "cantidad": 0,
                "daps": [],
                "alturas": []
            }

        especies_dict[nombre_cientifico]["cantidad"] += 1
        if a.get('dap'):
            especies_dict[nombre_cientifico]["daps"].append(a.get('dap'))
        if a.get('altura_total'):
            especies_dict[nombre_cientifico]["alturas"].append(a.get('altura_total'))

    # Convertir a DataFrame
    df_data = []
    for nombre_cientifico, datos in especies_dict.items():
        dap_promedio = sum(datos["daps"]) / len(datos["daps"]) if datos["daps"] else 0
        altura_promedio = sum(datos["alturas"]) / len(datos["alturas"]) if datos["alturas"] else 0

        df_data.append({
            "Especie": nombre_cientifico,
            "Nombre Común": datos["nombre_comun"],
            "Familia": datos["familia"],
            "Cantidad": datos["cantidad"],
            "DAP Promedio (cm)": f"{dap_promedio:.1f}" if dap_promedio > 0 else "N/A",
            "Altura Promedio (m)": f"{altura_promedio:.1f}" if altura_promedio > 0 else "N/A",
            "Densidad (g/cm³)": f"{datos['densidad_madera']:.3f}" if datos['densidad_madera'] > 0 else "N/A"
        })

    df = pd.DataFrame(df_data)

    # Ordenar por cantidad (descendente)
    df = df.sort_values("Cantidad", ascending=False)

    # Mostrar tabla
    st.dataframe(df, use_container_width=True, hide_index=True)

    # Gráfico de barras de especies más abundantes
    st.divider()
    st.subheader("📊 Especies Más Abundantes")

    chart_data = df.head(10).set_index("Especie")["Cantidad"]
    st.bar_chart(chart_data)
