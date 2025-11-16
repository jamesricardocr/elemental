"""
Generador de Reportes
Crea reportes técnicos en PDF con resultados de biomasa y carbono
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import io
from pathlib import Path


class ReportGenerator:
    """
    Generador de reportes técnicos en formato PDF.

    Utiliza ReportLab para crear documentos profesionales con:
    - Encabezados y pies de página
    - Tablas de datos
    - Gráficos y mapas
    - Resumen ejecutivo
    """

    def __init__(self):
        self.output_dir = Path("reports")
        self.output_dir.mkdir(exist_ok=True)

    def generar_reporte_parcela(
        self,
        parcela: Dict[str, Any],
        estadisticas: Dict[str, Any],
        biomasa_data: Dict[str, Any],
        incluir_mapas: bool = True
    ) -> str:
        """
        Genera reporte completo de una parcela.

        Args:
            parcela: Datos de la parcela
            estadisticas: Estadísticas generales
            biomasa_data: Resultados de cálculos de biomasa
            incluir_mapas: Si True, incluye mapa de ubicación

        Returns:
            Ruta del archivo PDF generado
        """
        try:
            from reportlab.lib import colors
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.platypus import (
                SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                PageBreak, Image
            )
            from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
        except ImportError:
            raise ImportError(
                "ReportLab no está instalado. Instálalo con: pip install reportlab"
            )

        # Nombre del archivo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"reporte_parcela_{parcela['codigo']}_{timestamp}.pdf"
        filepath = self.output_dir / filename

        # Crear documento
        doc = SimpleDocTemplate(
            str(filepath),
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )

        # Contenedor para elementos
        story = []

        # Estilos
        styles = getSampleStyleSheet()

        # Estilo personalizado para título
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2E7D32'),
            spaceAfter=30,
            alignment=TA_CENTER
        )

        # Estilo para subtítulos
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#388E3C'),
            spaceAfter=12,
            spaceBefore=12
        )

        # ===== PORTADA =====
        story.append(Spacer(1, 2*inch))

        title = Paragraph(
            "REPORTE TÉCNICO<br/>BIOMASA Y CARBONO ALMACENADO",
            title_style
        )
        story.append(title)
        story.append(Spacer(1, 0.5*inch))

        # Información de la parcela
        info_data = [
            ["Código de Parcela:", parcela.get('codigo', 'N/A')],
            ["Nombre:", parcela.get('nombre', 'N/A')],
            ["Zona Priorizada:", parcela.get('zona_priorizada', 'N/A')],
            ["Fecha de Establecimiento:", str(parcela.get('fecha_establecimiento', 'N/A'))],
            ["Responsable:", parcela.get('responsable', 'N/A')],
            ["Fecha del Reporte:", datetime.now().strftime("%d/%m/%Y")]
        ]

        info_table = Table(info_data, colWidths=[3*inch, 3*inch])
        info_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))

        story.append(info_table)
        story.append(Spacer(1, 0.5*inch))

        # Pie de portada
        footer = Paragraph(
            "<b>SENA - Centro para la Biodiversidad y el Turismo del Amazonas</b><br/>"
            "Proyecto de Ecoturismo Amazónico - PAP_2025_36_18",
            styles['Normal']
        )
        story.append(footer)

        story.append(PageBreak())

        # ===== RESUMEN EJECUTIVO =====
        story.append(Paragraph("1. RESUMEN EJECUTIVO", subtitle_style))
        story.append(Spacer(1, 12))

        resumen_text = f"""
        Este reporte presenta los resultados de la cuantificación de biomasa y carbono
        almacenado en la parcela <b>{parcela['codigo']}</b>, ubicada en
        {parcela.get('zona_priorizada', 'la zona de estudio')}.

        La parcela tiene un área de {estadisticas.get('area_ha', 0.1):.2f} hectáreas
        y se registraron {estadisticas.get('num_arboles', 0)} árboles con DAP ≥ 10 cm.

        Los resultados muestran una biomasa total de <b>{biomasa_data.get('biomasa_total_mgha', 0):.2f} Mg/ha</b>,
        con un almacenamiento de carbono de <b>{biomasa_data.get('carbono_total_mgha', 0):.2f} Mg C/ha</b>,
        equivalente a <b>{biomasa_data.get('co2_equivalente_mgha', 0):.2f} Mg CO₂/ha</b> de emisiones evitadas.
        """

        story.append(Paragraph(resumen_text, styles['Normal']))
        story.append(Spacer(1, 24))

        # ===== COORDENADAS Y UBICACIÓN =====
        story.append(Paragraph("2. UBICACIÓN GEOGRÁFICA", subtitle_style))
        story.append(Spacer(1, 12))

        ubicacion_data = [
            ["Coordenada", "Valor"],
            ["Latitud (centro)", f"{parcela.get('latitud', 0):.6f}°"],
            ["Longitud (centro)", f"{parcela.get('longitud', 0):.6f}°"],
            ["Altitud", f"{parcela.get('altitud', 0):.1f} m.s.n.m."],
            ["UTM X", f"{parcela.get('utm_x', 0):.2f} m"],
            ["UTM Y", f"{parcela.get('utm_y', 0):.2f} m"],
            ["Zona UTM", parcela.get('utm_zone', 'N/A')],
        ]

        ubicacion_table = Table(ubicacion_data, colWidths=[3*inch, 3*inch])
        ubicacion_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4CAF50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))

        story.append(ubicacion_table)
        story.append(Spacer(1, 24))

        # ===== RESULTADOS DE BIOMASA =====
        story.append(Paragraph("3. RESULTADOS DE BIOMASA Y CARBONO", subtitle_style))
        story.append(Spacer(1, 12))

        resultados_data = [
            ["Componente", "Biomasa (Mg/ha)", "% Total", "Carbono (Mg C/ha)", "CO₂eq (Mg/ha)"],
            [
                "Arbórea",
                f"{biomasa_data.get('biomasa_arborea_mgha', 0):.2f}",
                f"{biomasa_data.get('porcentaje_arborea', 0):.1f}%",
                f"{biomasa_data.get('biomasa_arborea_mgha', 0) * 0.47:.2f}",
                f"{biomasa_data.get('biomasa_arborea_mgha', 0) * 0.47 * 3.67:.2f}"
            ],
            [
                "Necromasa",
                f"{biomasa_data.get('biomasa_necromasa_mgha', 0):.2f}",
                f"{biomasa_data.get('porcentaje_necromasa', 0):.1f}%",
                f"{biomasa_data.get('biomasa_necromasa_mgha', 0) * 0.47:.2f}",
                f"{biomasa_data.get('biomasa_necromasa_mgha', 0) * 0.47 * 3.67:.2f}"
            ],
            [
                "Herbáceas",
                f"{biomasa_data.get('biomasa_herbaceas_mgha', 0):.2f}",
                f"{biomasa_data.get('porcentaje_herbaceas', 0):.1f}%",
                f"{biomasa_data.get('biomasa_herbaceas_mgha', 0) * 0.47:.2f}",
                f"{biomasa_data.get('biomasa_herbaceas_mgha', 0) * 0.47 * 3.67:.2f}"
            ],
            [
                "TOTAL",
                f"{biomasa_data.get('biomasa_total_mgha', 0):.2f}",
                "100.0%",
                f"{biomasa_data.get('carbono_total_mgha', 0):.2f}",
                f"{biomasa_data.get('co2_equivalente_mgha', 0):.2f}"
            ],
        ]

        resultados_table = Table(resultados_data, colWidths=[1.5*inch, 1.2*inch, 1*inch, 1.3*inch, 1.3*inch])
        resultados_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4CAF50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#E8F5E9')),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))

        story.append(resultados_table)
        story.append(Spacer(1, 24))

        # ===== METODOLOGÍA =====
        story.append(Paragraph("4. METODOLOGÍA", subtitle_style))
        story.append(Spacer(1, 12))

        metodologia_text = f"""
        <b>4.1 Modelo Alométrico Utilizado:</b> {biomasa_data.get('modelo_usado', 'N/A')}<br/><br/>

        <b>4.2 Parámetros:</b><br/>
        • Factor de carbono: {biomasa_data.get('factor_carbono_usado', 0.47)}<br/>
        • Área de la parcela: {biomasa_data.get('area_parcela_ha', 0.1)} ha<br/>
        • Conversión CO₂/C: 3.67 (44/12)<br/><br/>

        <b>4.3 Componentes Medidos:</b><br/>
        • <b>Arbórea:</b> Árboles con DAP ≥ 10 cm usando modelos alométricos<br/>
        • <b>Necromasa:</b> Madera muerta en subparcelas de 5m × 5m<br/>
        • <b>Herbáceas:</b> Vegetación en cuadrantes de 1m × 1m<br/>
        """

        story.append(Paragraph(metodologia_text, styles['Normal']))
        story.append(Spacer(1, 24))

        # ===== PIE DE PÁGINA =====
        story.append(PageBreak())

        firma_text = """
        <br/><br/><br/><br/>
        _________________________________<br/>
        Responsable: """ + parcela.get('responsable', 'N/A') + """<br/>
        Fecha: """ + datetime.now().strftime("%d/%m/%Y") + """<br/><br/>

        <i>Este reporte fue generado automáticamente por el Sistema de Gestión de Biomasa y Carbono<br/>
        SENA - Centro para la Biodiversidad y el Turismo del Amazonas</i>
        """

        story.append(Paragraph(firma_text, styles['Normal']))

        # Construir PDF
        doc.build(story)

        return str(filepath)

    def generar_reporte_consolidado(
        self,
        parcelas: List[Dict[str, Any]],
        estadisticas_generales: Dict[str, Any]
    ) -> str:
        """
        Genera reporte consolidado de múltiples parcelas.

        Args:
            parcelas: Lista de parcelas con sus datos
            estadisticas_generales: Estadísticas agregadas

        Returns:
            Ruta del archivo PDF generado
        """
        # TODO: Implementar reporte consolidado
        raise NotImplementedError("Reporte consolidado en desarrollo")

    def exportar_a_excel(
        self,
        datos: Dict[str, Any],
        tipo: str = "parcelas"
    ) -> str:
        """
        Exporta datos a formato Excel.

        Args:
            datos: Datos a exportar
            tipo: Tipo de datos ('parcelas', 'arboles', 'necromasa', 'herbaceas')

        Returns:
            Ruta del archivo Excel generado
        """
        try:
            import pandas as pd
        except ImportError:
            raise ImportError(
                "Pandas no está instalado. Instálalo con: pip install pandas openpyxl"
            )

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"export_{tipo}_{timestamp}.xlsx"
        filepath = self.output_dir / filename

        # Crear Excel con múltiples hojas
        with pd.ExcelWriter(str(filepath), engine='openpyxl') as writer:
            # Convertir datos a DataFrame y escribir
            if isinstance(datos, list):
                df = pd.DataFrame(datos)
                df.to_excel(writer, sheet_name=tipo.capitalize(), index=False)
            elif isinstance(datos, dict):
                for sheet_name, data in datos.items():
                    df = pd.DataFrame(data) if isinstance(data, list) else pd.DataFrame([data])
                    df.to_excel(writer, sheet_name=sheet_name[:31], index=False)

        return str(filepath)

    def exportar_a_csv(
        self,
        datos: List[Dict[str, Any]],
        nombre_archivo: str
    ) -> str:
        """
        Exporta datos a formato CSV.

        Args:
            datos: Lista de diccionarios con datos
            nombre_archivo: Nombre base del archivo

        Returns:
            Ruta del archivo CSV generado
        """
        try:
            import pandas as pd
        except ImportError:
            raise ImportError("Pandas no está instalado")

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{nombre_archivo}_{timestamp}.csv"
        filepath = self.output_dir / filename

        df = pd.DataFrame(datos)
        df.to_csv(str(filepath), index=False, encoding='utf-8-sig')

        return str(filepath)

    def exportar_shapefile(
        self,
        parcelas: List[Dict[str, Any]]
    ) -> str:
        """
        Exporta parcelas a formato Shapefile para GIS.

        Args:
            parcelas: Lista de parcelas con coordenadas

        Returns:
            Ruta del archivo shapefile generado
        """
        try:
            import geopandas as gpd
            from shapely.geometry import Point, Polygon
        except ImportError:
            raise ImportError(
                "GeoPandas no está instalado. Instálalo con: pip install geopandas"
            )

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"parcelas_{timestamp}.shp"
        filepath = self.output_dir / filename

        # Crear geometrías
        geometrias = []
        datos = []

        for p in parcelas:
            # Crear punto central
            if p.get('latitud') and p.get('longitud'):
                punto = Point(p['longitud'], p['latitud'])
                geometrias.append(punto)

                datos.append({
                    'codigo': p.get('codigo'),
                    'nombre': p.get('nombre'),
                    'zona': p.get('zona_priorizada'),
                    'area_ha': p.get('area_ha', 0.1),
                    'estado': p.get('estado')
                })

        # Crear GeoDataFrame
        gdf = gpd.GeoDataFrame(datos, geometry=geometrias, crs="EPSG:4326")

        # Guardar shapefile
        gdf.to_file(str(filepath))

        return str(filepath)
