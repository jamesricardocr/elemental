#!/usr/bin/env python3
"""
Script para generar PDFs profesionales de la documentación
Genera dos PDFs: README.pdf y GUIA_USUARIO.pdf
"""

import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, Image, KeepTogether
)
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import markdown2
from datetime import datetime

# Colores del tema claro de la aplicación
COLOR_PRIMARY = colors.HexColor('#059669')  # Verde esmeralda
COLOR_SECONDARY = colors.HexColor('#10b981')  # Verde claro
COLOR_ACCENT = colors.HexColor('#34d399')  # Verde menta
COLOR_TEXT = colors.HexColor('#1f2937')  # Gris oscuro
COLOR_TEXT_LIGHT = colors.HexColor('#6b7280')  # Gris medio
COLOR_BACKGROUND = colors.HexColor('#f9fafb')  # Gris muy claro
COLOR_BORDER = colors.HexColor('#e5e7eb')  # Gris borde

class DocumentacionPDF:
    def __init__(self, output_filename, title, subtitle=None):
        self.output_filename = output_filename
        self.title = title
        self.subtitle = subtitle
        self.doc = SimpleDocTemplate(
            output_filename,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
        )
        self.story = []
        self.styles = self._crear_estilos()

    def _crear_estilos(self):
        """Crear estilos personalizados para el documento"""
        styles = getSampleStyleSheet()

        # Estilo para título principal
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Heading1'],
            fontSize=28,
            textColor=COLOR_PRIMARY,
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))

        # Estilo para subtítulo
        styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=COLOR_TEXT_LIGHT,
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica'
        ))

        # Estilo para encabezados H1
        styles.add(ParagraphStyle(
            name='CustomHeading1',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=COLOR_PRIMARY,
            spaceAfter=12,
            spaceBefore=24,
            fontName='Helvetica-Bold',
            borderPadding=10,
            borderColor=COLOR_PRIMARY,
            borderWidth=0,
            leftIndent=0,
        ))

        # Estilo para encabezados H2
        styles.add(ParagraphStyle(
            name='CustomHeading2',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=COLOR_SECONDARY,
            spaceAfter=10,
            spaceBefore=20,
            fontName='Helvetica-Bold'
        ))

        # Estilo para encabezados H3
        styles.add(ParagraphStyle(
            name='CustomHeading3',
            parent=styles['Heading3'],
            fontSize=14,
            textColor=COLOR_TEXT,
            spaceAfter=8,
            spaceBefore=16,
            fontName='Helvetica-Bold'
        ))

        # Estilo para párrafos normales
        styles.add(ParagraphStyle(
            name='CustomBody',
            parent=styles['BodyText'],
            fontSize=11,
            textColor=COLOR_TEXT,
            spaceAfter=12,
            alignment=TA_JUSTIFY,
            fontName='Helvetica',
            leading=16
        ))

        # Estilo para código
        styles.add(ParagraphStyle(
            name='CustomCode',
            parent=styles['Code'],
            fontSize=9,
            textColor=COLOR_TEXT,
            backColor=COLOR_BACKGROUND,
            borderColor=COLOR_BORDER,
            borderWidth=1,
            borderPadding=8,
            fontName='Courier',
            leftIndent=10,
            rightIndent=10,
            spaceAfter=12
        ))

        # Estilo para listas
        styles.add(ParagraphStyle(
            name='CustomBullet',
            parent=styles['BodyText'],
            fontSize=11,
            textColor=COLOR_TEXT,
            leftIndent=20,
            bulletIndent=10,
            spaceAfter=6,
            fontName='Helvetica'
        ))

        return styles

    def agregar_portada(self, logo_path=None):
        """Agregar portada con logo"""
        # Logo de texto si no hay imagen
        self.story.append(Spacer(1, 1.5*inch))

        if logo_path and os.path.exists(logo_path):
            try:
                img = Image(logo_path, width=3*inch, height=1.5*inch)
                img.hAlign = 'CENTER'
                self.story.append(img)
                self.story.append(Spacer(1, 0.5*inch))
            except:
                # Logo de texto como fallback
                logo_text = '<para align=center><font size=36 color="#059669"><b>JC2R</b></font></para>'
                self.story.append(Paragraph(logo_text, self.styles['CustomBody']))
                self.story.append(Spacer(1, 0.3*inch))
        else:
            # Logo de texto
            logo_text = '<para align=center><font size=36 color="#059669"><b>JC2R</b></font></para>'
            self.story.append(Paragraph(logo_text, self.styles['CustomBody']))
            self.story.append(Spacer(1, 0.3*inch))

        # Título
        self.story.append(Spacer(1, 0.5*inch))
        title = Paragraph(self.title, self.styles['CustomTitle'])
        self.story.append(title)
        self.story.append(Spacer(1, 0.2*inch))

        # Subtítulo
        if self.subtitle:
            subtitle = Paragraph(self.subtitle, self.styles['CustomSubtitle'])
            self.story.append(subtitle)

        # Información del proyecto
        self.story.append(Spacer(1, 0.5*inch))
        info_text = f"""
        <para align=center>
        <font color="{COLOR_TEXT_LIGHT.hexval()}" size=10>
        <b>Proyecto Open Source</b><br/>
        Sistema de Monitoreo y Cuantificación de Carbono Forestal<br/>
        <br/>
        <b>Desarrollado por:</b> JC2R S.A.S<br/>
        https://jc2r.com<br/>
        https://elemental.jc2r.com<br/>
        <br/>
        <b>Versión:</b> 1.0.1<br/>
        <b>Fecha:</b> {datetime.now().strftime('%B %Y')}
        </font>
        </para>
        """
        self.story.append(Paragraph(info_text, self.styles['CustomBody']))

        self.story.append(PageBreak())

    def procesar_markdown(self, md_content):
        """Convertir markdown a elementos de ReportLab"""
        lines = md_content.split('\n')
        i = 0

        while i < len(lines):
            line = lines[i].strip()

            # Saltar líneas vacías
            if not line:
                i += 1
                continue

            # Encabezados H1 (# o ----)
            if line.startswith('# '):
                text = line[2:].strip()
                self.story.append(Paragraph(text, self.styles['CustomHeading1']))
                self.story.append(Spacer(1, 0.1*inch))
                i += 1
                continue

            # Encabezados H2 (##)
            if line.startswith('## '):
                text = line[3:].strip()
                self.story.append(Paragraph(text, self.styles['CustomHeading2']))
                self.story.append(Spacer(1, 0.1*inch))
                i += 1
                continue

            # Encabezados H3 (###)
            if line.startswith('### '):
                text = line[4:].strip()
                self.story.append(Paragraph(text, self.styles['CustomHeading3']))
                self.story.append(Spacer(1, 0.05*inch))
                i += 1
                continue

            # Línea horizontal (---)
            if line.startswith('---'):
                self.story.append(Spacer(1, 0.2*inch))
                i += 1
                continue

            # Bloques de código (```)
            if line.startswith('```'):
                code_lines = []
                i += 1
                while i < len(lines) and not lines[i].strip().startswith('```'):
                    code_lines.append(lines[i])
                    i += 1

                code_text = '\n'.join(code_lines)
                # Escapar caracteres especiales para ReportLab
                code_text = code_text.replace('&', '&amp;')
                code_text = code_text.replace('<', '&lt;')
                code_text = code_text.replace('>', '&gt;')
                code_text = f'<pre>{code_text}</pre>'

                self.story.append(Paragraph(code_text, self.styles['CustomCode']))
                i += 1
                continue

            # Listas con viñetas (-, *, +)
            if line.startswith('- ') or line.startswith('* ') or line.startswith('+ '):
                bullet_items = []
                while i < len(lines):
                    line = lines[i].strip()
                    if line.startswith('- ') or line.startswith('* ') or line.startswith('+ '):
                        text = line[2:].strip()
                        # Procesar negritas y cursivas
                        text = self._procesar_formato_inline(text)
                        bullet_items.append(Paragraph(f'• {text}', self.styles['CustomBullet']))
                        i += 1
                    elif not line:
                        i += 1
                        break
                    else:
                        break

                for item in bullet_items:
                    self.story.append(item)
                continue

            # Listas numeradas
            if line and line[0].isdigit() and '. ' in line:
                numbered_items = []
                while i < len(lines):
                    line = lines[i].strip()
                    if line and line[0].isdigit() and '. ' in line:
                        parts = line.split('. ', 1)
                        if len(parts) == 2:
                            num, text = parts
                            text = self._procesar_formato_inline(text)
                            numbered_items.append(Paragraph(f'{num}. {text}', self.styles['CustomBullet']))
                        i += 1
                    elif not line:
                        i += 1
                        break
                    else:
                        break

                for item in numbered_items:
                    self.story.append(item)
                continue

            # Párrafo normal
            text = self._procesar_formato_inline(line)
            self.story.append(Paragraph(text, self.styles['CustomBody']))
            i += 1

    def _procesar_formato_inline(self, text):
        """Procesar formato inline: negritas, cursivas, código, links"""
        # Escapar caracteres especiales
        text = text.replace('&', '&amp;')
        text = text.replace('<', '&lt;')
        text = text.replace('>', '&gt;')

        # Negritas (**texto** o __texto__)
        import re
        text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
        text = re.sub(r'__(.+?)__', r'<b>\1</b>', text)

        # Cursivas (*texto* o _texto_)
        text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
        text = re.sub(r'_(.+?)_', r'<i>\1</i>', text)

        # Código inline (`código`)
        text = re.sub(r'`(.+?)`', r'<font name="Courier" color="#059669">\1</font>', text)

        # Links [texto](url)
        text = re.sub(
            r'\[(.+?)\]\((.+?)\)',
            r'<font color="#059669"><u>\1</u></font>',
            text
        )

        return text

    def generar(self):
        """Generar el PDF"""
        self.doc.build(self.story, onFirstPage=self._agregar_footer, onLaterPages=self._agregar_footer)
        print(f"✅ PDF generado: {self.output_filename}")

    def _agregar_footer(self, canvas, doc):
        """Agregar pie de página con número de página"""
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(COLOR_TEXT_LIGHT)

        # Número de página
        page_num = canvas.getPageNumber()
        text = f"Página {page_num}"
        canvas.drawRightString(A4[0] - 72, 40, text)

        # Nombre del documento
        canvas.drawString(72, 40, "Elemental by JC2R - Sistema de Monitoreo Forestal")

        canvas.restoreState()


def generar_pdfs():
    """Generar ambos PDFs de documentación"""

    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logo_svg_path = os.path.join(base_path, 'frontend', 'public', 'JC2R_LOGO_BLACK.svg')
    logo_png_path = os.path.join(base_path, 'docs', 'JC2R_LOGO.png')

    # Convertir SVG a PNG
    try:
        import cairosvg
        cairosvg.svg2png(url=logo_svg_path, write_to=logo_png_path, output_width=600)
        logo_path = logo_png_path
        print(f"✅ Logo convertido a PNG: {logo_png_path}")
    except Exception as e:
        print(f"⚠️  No se pudo convertir el logo SVG: {e}")
        logo_path = None

    print("📄 Generando PDFs de documentación...")
    print()

    # 1. Generar README.pdf
    print("📝 Procesando README.md...")
    readme_path = os.path.join(base_path, 'README.md')
    with open(readme_path, 'r', encoding='utf-8') as f:
        readme_content = f.read()

    pdf_readme = DocumentacionPDF(
        os.path.join(base_path, 'docs', 'README.pdf'),
        'Elemental by JC2R',
        'Documentación Técnica - Sistema de Monitoreo y Cuantificación de Carbono'
    )
    pdf_readme.agregar_portada(logo_path)
    pdf_readme.procesar_markdown(readme_content)
    pdf_readme.generar()

    print()

    # 2. Generar GUIA_USUARIO.pdf
    print("📝 Procesando GUIA_USUARIO.md...")
    guia_path = os.path.join(base_path, 'GUIA_USUARIO.md')
    with open(guia_path, 'r', encoding='utf-8') as f:
        guia_content = f.read()

    pdf_guia = DocumentacionPDF(
        os.path.join(base_path, 'docs', 'GUIA_USUARIO.pdf'),
        'Guía del Usuario',
        'Sistema Elemental - Monitoreo de Biomasa y Carbono en Bosques Amazónicos'
    )
    pdf_guia.agregar_portada(logo_path)
    pdf_guia.procesar_markdown(guia_content)
    pdf_guia.generar()

    print()
    print("✅ PDFs generados exitosamente en el directorio docs/")
    print("   - docs/README.pdf")
    print("   - docs/GUIA_USUARIO.pdf")


if __name__ == '__main__':
    generar_pdfs()
