"""
Constantes del proyecto IAP
"""

# Cálculos de Carbono
FACTOR_CARBONO = 0.47  # Factor estándar de conversión biomasa → carbono
FACTOR_CARBONO_MIN = 0.45
FACTOR_CARBONO_MAX = 0.50

# Parcelas
AREA_PARCELA_HA = 0.1  # Hectáreas
AREA_PARCELA_M2 = 1000  # Metros cuadrados
LARGO_PARCELA = 50  # Metros
ANCHO_PARCELA = 20  # Metros

# Subparcelas (Necromasa)
AREA_SUBPARCELA_M2 = 25  # 5m × 5m
LADO_SUBPARCELA = 5  # Metros

# Cuadrantes (Herbáceas)
AREA_CUADRANTE_M2 = 1  # 1m × 1m
LADO_CUADRANTE = 1  # Metro

# Mediciones de Árboles
DAP_MINIMO = 10.0  # cm - Diámetro mínimo para medición
ALTURA_MEDICION_DAP = 1.3  # m - Altura estándar para medir DAP

# Coordenadas
UTM_ZONE_AMAZONAS = "18M"  # Zona UTM para Leticia, Amazonas
DATUM = "WGS84"

# Coordenadas de referencia (Leticia, Amazonas)
LETICIA_LAT = -4.2156
LETICIA_LON = -69.9406
LETICIA_ZOOM = 10

# Factores de Conversión
M2_POR_HECTAREA = 10000
KG_POR_TONELADA = 1000

# Modelos Alométricos
MODELOS_ALOMETRICOS = [
    "Chave2014",
    "IPCC2006",
    "IDEAM",
    "Brown1997",
]

# Densidades de Madera Típicas (g/cm³)
DENSIDAD_MADERA_BAJA = 0.30
DENSIDAD_MADERA_MEDIA = 0.60
DENSIDAD_MADERA_ALTA = 0.80
DENSIDAD_MADERA_PROMEDIO = 0.60  # Valor por defecto para especies desconocidas

# Estados de Parcela
ESTADOS_PARCELA = ["activa", "completada", "inactiva", "en_proceso"]

# Tipos de Cobertura
TIPOS_COBERTURA = [
    "Bosque primario",
    "Bosque secundario",
    "Bosque de galería",
    "Bosque inundable",
    "Rastrojo alto",
    "Rastrojo bajo",
    "Pastizal",
    "Cultivo",
    "Otro"
]

# Niveles de Accesibilidad
NIVELES_ACCESIBILIDAD = ["fácil", "moderado", "difícil", "muy_difícil"]

# Tipos de Necromasa
TIPOS_NECROMASA = ["gruesa", "fina"]
DIAMETRO_NECROMASA_GRUESA = 10.0  # cm

# Formatos de Exportación
FORMATOS_EXPORTACION = ["csv", "xlsx", "shp", "geojson", "pdf"]
