"""
Componentes reutilizables de UI
"""

from .map_viewer import (
    crear_mapa_base,
    agregar_marcador_parcela,
    agregar_poligono_parcela,
    agregar_circulo_radio
)

from .data_forms import (
    formulario_nueva_parcela,
    formulario_medicion_arbol,
    formulario_medicion_necromasa,
    formulario_medicion_herbaceas
)

from .tables import (
    tabla_parcelas,
    tabla_arboles,
    tabla_necromasa,
    tabla_herbaceas,
    tabla_calculos_biomasa,
    tabla_resumen_especies
)

__all__ = [
    # Mapas
    "crear_mapa_base",
    "agregar_marcador_parcela",
    "agregar_poligono_parcela",
    "agregar_circulo_radio",
    # Formularios
    "formulario_nueva_parcela",
    "formulario_medicion_arbol",
    "formulario_medicion_necromasa",
    "formulario_medicion_herbaceas",
    # Tablas
    "tabla_parcelas",
    "tabla_arboles",
    "tabla_necromasa",
    "tabla_herbaceas",
    "tabla_calculos_biomasa",
    "tabla_resumen_especies"
]
