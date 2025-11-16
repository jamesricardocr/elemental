"""
Validadores de datos del sistema IAP
"""

from typing import Optional, Tuple
from .constants import DAP_MINIMO, AREA_PARCELA_M2


def validar_dap(dap: float) -> Tuple[bool, Optional[str]]:
    """
    Valida que el DAP sea mayor o igual al mínimo permitido.

    Args:
        dap: Diámetro a la altura del pecho en cm

    Returns:
        Tupla (es_valido, mensaje_error)
    """
    if dap is None:
        return False, "El DAP es obligatorio"

    if dap < DAP_MINIMO:
        return False, f"El DAP debe ser mayor o igual a {DAP_MINIMO} cm"

    if dap > 500:  # Límite superior razonable
        return False, "El DAP parece excesivamente grande (>500 cm). Verifica la medición"

    return True, None


def validar_altura(altura: Optional[float]) -> Tuple[bool, Optional[str]]:
    """
    Valida que la altura del árbol sea razonable.

    Args:
        altura: Altura total del árbol en metros

    Returns:
        Tupla (es_valido, mensaje_error)
    """
    if altura is None:
        return True, None  # La altura es opcional

    if altura <= 0:
        return False, "La altura debe ser mayor a 0"

    if altura > 100:  # Árboles emergentes rara vez superan 80m
        return False, "La altura parece excesivamente grande (>100 m). Verifica la medición"

    return True, None


def validar_coordenadas(lat: float, lon: float) -> Tuple[bool, Optional[str]]:
    """
    Valida que las coordenadas estén dentro de rangos válidos.

    Args:
        lat: Latitud en grados decimales
        lon: Longitud en grados decimales

    Returns:
        Tupla (es_valido, mensaje_error)
    """
    if lat is None or lon is None:
        return False, "Las coordenadas son obligatorias"

    # Validar rangos generales
    if not (-90 <= lat <= 90):
        return False, f"Latitud fuera de rango válido: {lat}"

    if not (-180 <= lon <= 180):
        return False, f"Longitud fuera de rango válido: {lon}"

    # Validar que estén en la región del Amazonas colombiano (aproximado)
    # Amazonas colombiano: aproximadamente entre -5° y 0° latitud, -75° y -66° longitud
    if not (-5 <= lat <= 0):
        return False, f"Latitud fuera del rango del Amazonas colombiano: {lat}. Verifica las coordenadas"

    if not (-75 <= lon <= -66):
        return False, f"Longitud fuera del rango del Amazonas colombiano: {lon}. Verifica las coordenadas"

    return True, None


def validar_coordenadas_utm(x: float, y: float, zona: str = "18M") -> Tuple[bool, Optional[str]]:
    """
    Valida coordenadas UTM.

    Args:
        x: Coordenada Este (Easting)
        y: Coordenada Norte (Northing)
        zona: Zona UTM

    Returns:
        Tupla (es_valido, mensaje_error)
    """
    if x is None or y is None:
        return False, "Las coordenadas UTM son obligatorias"

    # Validar rangos típicos para UTM
    if not (100000 <= x <= 900000):
        return False, f"Coordenada X (Easting) fuera de rango típico: {x}"

    # Para hemisferio sur
    if zona.endswith('M') or zona.endswith('L'):
        if not (1000000 <= y <= 10000000):
            return False, f"Coordenada Y (Northing) fuera de rango típico para hemisferio sur: {y}"

    return True, None


def validar_codigo_parcela(codigo: str) -> Tuple[bool, Optional[str]]:
    """
    Valida el código de una parcela.

    Args:
        codigo: Código único de la parcela

    Returns:
        Tupla (es_valido, mensaje_error)
    """
    if not codigo or len(codigo.strip()) == 0:
        return False, "El código de la parcela es obligatorio"

    if len(codigo) > 50:
        return False, "El código de la parcela es demasiado largo (máximo 50 caracteres)"

    return True, None


def validar_parcela(
    codigo: str,
    latitud: Optional[float] = None,
    longitud: Optional[float] = None,
    vertices: Optional[list] = None
) -> Tuple[bool, Optional[str]]:
    """
    Valida los datos básicos de una parcela.

    Args:
        codigo: Código único de la parcela
        latitud: Latitud del centro
        longitud: Longitud del centro
        vertices: Lista de vértices [(lat, lon), ...]

    Returns:
        Tupla (es_valido, mensaje_error)
    """
    # Validar código
    es_valido, mensaje = validar_codigo_parcela(codigo)
    if not es_valido:
        return False, mensaje

    # Validar coordenadas del centro
    if latitud is not None and longitud is not None:
        es_valido, mensaje = validar_coordenadas(latitud, longitud)
        if not es_valido:
            return False, f"Centro de parcela: {mensaje}"

    # Validar vértices si están presentes
    if vertices:
        if len(vertices) != 4:
            return False, "La parcela debe tener exactamente 4 vértices"

        for i, vertice in enumerate(vertices, 1):
            if len(vertice) != 2:
                return False, f"Vértice {i} inválido: debe ser una tupla (lat, lon)"

            lat, lon = vertice
            es_valido, mensaje = validar_coordenadas(lat, lon)
            if not es_valido:
                return False, f"Vértice {i}: {mensaje}"

    return True, None


def validar_peso(peso: float, tipo: str = "peso") -> Tuple[bool, Optional[str]]:
    """
    Valida mediciones de peso (necromasa, herbáceas).

    Args:
        peso: Peso en kg
        tipo: Tipo de peso ("fresco" o "seco")

    Returns:
        Tupla (es_valido, mensaje_error)
    """
    if peso is None:
        return False, f"El {tipo} es obligatorio"

    if peso < 0:
        return False, f"El {tipo} no puede ser negativo"

    if peso > 10000:  # 10 toneladas parece excesivo para mediciones individuales
        return False, f"El {tipo} parece excesivamente grande (>{10000} kg). Verifica la medición"

    return True, None


def validar_relacion_peso_seco_fresco(peso_seco: float, peso_fresco: float) -> Tuple[bool, Optional[str]]:
    """
    Valida que la relación peso seco/fresco sea lógica.

    Args:
        peso_seco: Peso seco en kg
        peso_fresco: Peso fresco en kg

    Returns:
        Tupla (es_valido, mensaje_error)
    """
    if peso_seco is None or peso_fresco is None:
        return True, None  # Si alguno falta, validar individual

    if peso_fresco == 0:
        return False, "El peso fresco no puede ser cero"

    relacion = peso_seco / peso_fresco

    if relacion > 1.0:
        return False, f"El peso seco ({peso_seco} kg) no puede ser mayor que el peso fresco ({peso_fresco} kg)"

    if relacion < 0.1:
        return False, f"La relación peso seco/fresco ({relacion:.3f}) parece muy baja. Verifica las mediciones"

    if relacion > 0.9:
        return False, f"La relación peso seco/fresco ({relacion:.3f}) parece muy alta. Verifica que el material esté completamente seco"

    return True, None


def validar_densidad_madera(densidad: float) -> Tuple[bool, Optional[str]]:
    """
    Valida que la densidad de la madera sea razonable.

    Args:
        densidad: Densidad en g/cm³

    Returns:
        Tupla (es_valido, mensaje_error)
    """
    if densidad is None:
        return True, None  # Opcional, se puede usar valor por defecto

    if densidad <= 0:
        return False, "La densidad debe ser mayor a 0"

    if densidad < 0.15:
        return False, f"La densidad ({densidad} g/cm³) parece muy baja. Las maderas más ligeras rondan 0.2 g/cm³"

    if densidad > 1.3:
        return False, f"La densidad ({densidad} g/cm³) parece muy alta. Las maderas más densas rondan 1.2 g/cm³"

    return True, None


def validar_factor_carbono(factor: float) -> Tuple[bool, Optional[str]]:
    """
    Valida el factor de conversión biomasa → carbono.

    Args:
        factor: Factor de carbono (típicamente 0.47)

    Returns:
        Tupla (es_valido, mensaje_error)
    """
    if factor is None:
        return False, "El factor de carbono es obligatorio"

    if not (0.40 <= factor <= 0.55):
        return False, f"El factor de carbono ({factor}) está fuera del rango típico (0.40 - 0.55)"

    return True, None


def validar_pendiente(pendiente: float) -> Tuple[bool, Optional[str]]:
    """
    Valida la pendiente del terreno.

    Args:
        pendiente: Pendiente en grados o porcentaje

    Returns:
        Tupla (es_valido, mensaje_error)
    """
    if pendiente is None:
        return True, None  # Opcional

    if pendiente < 0:
        return False, "La pendiente no puede ser negativa"

    # Asumir que si es mayor a 100, está en porcentaje, sino en grados
    if pendiente > 100:
        if pendiente > 300:  # 300% = ~72 grados
            return False, f"La pendiente ({pendiente}%) parece excesiva. Verifica la medición"
    else:
        if pendiente > 80:  # 80 grados es casi vertical
            return False, f"La pendiente ({pendiente}°) parece excesiva. Verifica la medición"

    return True, None
