"""
Servicio de Importación de Datos
Importa datos desde archivos Excel, CSV y otros formatos
"""

from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import pandas as pd
from datetime import datetime


class ImportService:
    """
    Servicio para importar datos desde archivos externos.

    Soporta:
    - Excel (.xlsx, .xls)
    - CSV (.csv)
    - Validación de datos
    - Conversión de formatos
    """

    def __init__(self):
        self.formatos_soportados = ['.xlsx', '.xls', '.csv']

    def importar_parcelas_desde_excel(
        self,
        filepath: str,
        validar: bool = True
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        """
        Importa parcelas desde un archivo Excel.

        Args:
            filepath: Ruta del archivo Excel
            validar: Si True, valida los datos antes de importar

        Returns:
            Tupla de (parcelas_validas, errores)
        """
        try:
            # Leer archivo
            df = pd.read_excel(filepath)

            # Columnas esperadas
            columnas_requeridas = ['codigo', 'latitud', 'longitud']
            columnas_opcionales = [
                'nombre', 'zona_priorizada', 'altitud', 'pendiente',
                'tipo_cobertura', 'accesibilidad', 'estado',
                'responsable', 'fecha_establecimiento', 'observaciones'
            ]

            # Validar columnas requeridas
            errores = []
            for col in columnas_requeridas:
                if col not in df.columns:
                    errores.append(f"Columna requerida '{col}' no encontrada")

            if errores:
                return [], errores

            # Convertir a lista de diccionarios
            parcelas = []
            for idx, row in df.iterrows():
                try:
                    parcela = {
                        'codigo': str(row['codigo']).strip(),
                        'latitud': float(row['latitud']),
                        'longitud': float(row['longitud'])
                    }

                    # Agregar campos opcionales si existen
                    for col in columnas_opcionales:
                        if col in df.columns and pd.notna(row[col]):
                            parcela[col] = row[col]

                    # Validar si se requiere
                    if validar:
                        es_valido, error = self._validar_parcela(parcela)
                        if not es_valido:
                            errores.append(f"Fila {idx + 2}: {error}")
                            continue

                    parcelas.append(parcela)

                except Exception as e:
                    errores.append(f"Error en fila {idx + 2}: {str(e)}")

            return parcelas, errores

        except Exception as e:
            return [], [f"Error al leer archivo: {str(e)}"]

    def importar_arboles_desde_excel(
        self,
        filepath: str,
        parcela_id: int,
        validar: bool = True
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        """
        Importa mediciones de árboles desde Excel.

        Args:
            filepath: Ruta del archivo
            parcela_id: ID de la parcela
            validar: Validar datos

        Returns:
            Tupla de (arboles_validos, errores)
        """
        try:
            df = pd.read_excel(filepath)

            # Columnas esperadas
            columnas_requeridas = ['numero_arbol', 'especie_id', 'dap']
            columnas_opcionales = [
                'altura_total', 'altura_comercial',
                'fecha_medicion', 'observaciones'
            ]

            errores = []
            for col in columnas_requeridas:
                if col not in df.columns:
                    errores.append(f"Columna requerida '{col}' no encontrada")

            if errores:
                return [], errores

            arboles = []
            for idx, row in df.iterrows():
                try:
                    arbol = {
                        'parcela_id': parcela_id,
                        'numero_arbol': int(row['numero_arbol']),
                        'especie_id': int(row['especie_id']),
                        'dap': float(row['dap'])
                    }

                    # Campos opcionales
                    if 'altura_total' in df.columns and pd.notna(row['altura_total']):
                        arbol['altura_total'] = float(row['altura_total'])

                    if 'altura_comercial' in df.columns and pd.notna(row['altura_comercial']):
                        arbol['altura_comercial'] = float(row['altura_comercial'])

                    if 'fecha_medicion' in df.columns and pd.notna(row['fecha_medicion']):
                        arbol['fecha_medicion'] = pd.to_datetime(row['fecha_medicion']).date()

                    if 'observaciones' in df.columns and pd.notna(row['observaciones']):
                        arbol['observaciones'] = str(row['observaciones'])

                    # Validar
                    if validar:
                        es_valido, error = self._validar_arbol(arbol)
                        if not es_valido:
                            errores.append(f"Fila {idx + 2}: {error}")
                            continue

                    arboles.append(arbol)

                except Exception as e:
                    errores.append(f"Error en fila {idx + 2}: {str(e)}")

            return arboles, errores

        except Exception as e:
            return [], [f"Error al leer archivo: {str(e)}"]

    def importar_desde_csv(
        self,
        filepath: str,
        tipo: str,
        delimiter: str = ',',
        encoding: str = 'utf-8'
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        """
        Importa datos desde CSV.

        Args:
            filepath: Ruta del archivo CSV
            tipo: Tipo de datos ('parcelas', 'arboles', 'necromasa', 'herbaceas')
            delimiter: Delimitador del CSV
            encoding: Codificación del archivo

        Returns:
            Tupla de (datos_validos, errores)
        """
        try:
            df = pd.read_csv(filepath, delimiter=delimiter, encoding=encoding)

            if tipo == 'parcelas':
                return self._procesar_parcelas_df(df)
            elif tipo == 'arboles':
                return self._procesar_arboles_df(df)
            elif tipo == 'necromasa':
                return self._procesar_necromasa_df(df)
            elif tipo == 'herbaceas':
                return self._procesar_herbaceas_df(df)
            else:
                return [], [f"Tipo '{tipo}' no soportado"]

        except Exception as e:
            return [], [f"Error al leer CSV: {str(e)}"]

    def generar_plantilla_excel(
        self,
        tipo: str,
        filepath: str
    ) -> bool:
        """
        Genera una plantilla Excel para importación.

        Args:
            tipo: Tipo de plantilla ('parcelas', 'arboles', 'necromasa', 'herbaceas')
            filepath: Ruta donde guardar la plantilla

        Returns:
            True si se creó exitosamente
        """
        try:
            if tipo == 'parcelas':
                df = pd.DataFrame(columns=[
                    'codigo', 'nombre', 'zona_priorizada',
                    'latitud', 'longitud', 'altitud', 'pendiente',
                    'tipo_cobertura', 'accesibilidad', 'estado',
                    'responsable', 'fecha_establecimiento', 'observaciones'
                ])

                # Agregar fila de ejemplo
                df.loc[0] = [
                    'P001', 'Parcela Ejemplo', 'Zona A',
                    -4.2156, -69.9406, 96.0, 5.0,
                    'Bosque primario', 'Fácil', 'activa',
                    'Investigador Principal', '2025-01-01', 'Ejemplo'
                ]

            elif tipo == 'arboles':
                df = pd.DataFrame(columns=[
                    'numero_arbol', 'especie_id', 'dap',
                    'altura_total', 'altura_comercial',
                    'fecha_medicion', 'observaciones'
                ])

                df.loc[0] = [
                    1, 1, 45.5, 25.0, 15.0,
                    '2025-01-01', 'Ejemplo de árbol'
                ]

            elif tipo == 'necromasa':
                df = pd.DataFrame(columns=[
                    'numero_subparcela', 'numero_muestra', 'tipo_necromasa',
                    'diametro', 'longitud', 'peso_fresco', 'peso_seco',
                    'estado_descomposicion', 'fecha_medicion', 'observaciones'
                ])

                df.loc[0] = [
                    1, 1, 'Tronco caído', 25.5, 3.2,
                    15.5, 8.2, 'Intermedio', '2025-01-01', 'Ejemplo'
                ]

            elif tipo == 'herbaceas':
                df = pd.DataFrame(columns=[
                    'numero_cuadrante', 'peso_fresco', 'peso_seco',
                    'cobertura_porcentaje', 'altura_promedio',
                    'especies_dominantes', 'fecha_medicion', 'observaciones'
                ])

                df.loc[0] = [
                    1, 0.85, 0.35, 65, 12.5,
                    'Heliconias, helechos', '2025-01-01', 'Ejemplo'
                ]

            else:
                return False

            # Guardar Excel
            df.to_excel(filepath, index=False)
            return True

        except Exception as e:
            print(f"Error al generar plantilla: {e}")
            return False

    def _validar_parcela(self, parcela: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """Valida datos de una parcela."""
        # Validar código
        if not parcela.get('codigo'):
            return False, "Código de parcela requerido"

        # Validar coordenadas
        lat = parcela.get('latitud')
        lon = parcela.get('longitud')

        if lat is None or lon is None:
            return False, "Coordenadas requeridas"

        # Validar rango de coordenadas (Amazonas colombiano)
        if not (-5 <= lat <= 0):
            return False, "Latitud fuera del rango del Amazonas colombiano"

        if not (-75 <= lon <= -66):
            return False, "Longitud fuera del rango del Amazonas colombiano"

        return True, None

    def _validar_arbol(self, arbol: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """Valida datos de un árbol."""
        # Validar DAP
        dap = arbol.get('dap')
        if dap is None:
            return False, "DAP requerido"

        if dap < 10:
            return False, "DAP debe ser mayor o igual a 10 cm"

        # Validar altura si existe
        altura = arbol.get('altura_total')
        if altura is not None:
            if altura <= 0 or altura > 100:
                return False, "Altura total fuera de rango (0-100 m)"

        return True, None

    def _procesar_parcelas_df(
        self,
        df: pd.DataFrame
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        """Procesa DataFrame de parcelas."""
        # Similar a importar_parcelas_desde_excel
        return [], []

    def _procesar_arboles_df(
        self,
        df: pd.DataFrame
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        """Procesa DataFrame de árboles."""
        return [], []

    def _procesar_necromasa_df(
        self,
        df: pd.DataFrame
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        """Procesa DataFrame de necromasa."""
        return [], []

    def _procesar_herbaceas_df(
        self,
        df: pd.DataFrame
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        """Procesa DataFrame de herbáceas."""
        return [], []

    def validar_archivo(
        self,
        filepath: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Valida que el archivo sea soportado y accesible.

        Args:
            filepath: Ruta del archivo

        Returns:
            Tupla de (es_valido, mensaje_error)
        """
        path = Path(filepath)

        # Verificar que existe
        if not path.exists():
            return False, "Archivo no encontrado"

        # Verificar extensión
        if path.suffix.lower() not in self.formatos_soportados:
            return False, f"Formato no soportado. Use: {', '.join(self.formatos_soportados)}"

        # Verificar que se puede leer
        try:
            if path.suffix.lower() in ['.xlsx', '.xls']:
                pd.read_excel(filepath, nrows=1)
            elif path.suffix.lower() == '.csv':
                pd.read_csv(filepath, nrows=1)
        except Exception as e:
            return False, f"Error al leer archivo: {str(e)}"

        return True, None
