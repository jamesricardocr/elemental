"""
Modelos de base de datos del sistema IAP
"""

from .parcela import Parcela
from .especie import Especie
from .arbol import Arbol
from .necromasa import Necromasa
from .herbaceas import Herbaceas
from .calculo import CalculoBiomasa

__all__ = [
    "Parcela",
    "Especie",
    "Arbol",
    "Necromasa",
    "Herbaceas",
    "CalculoBiomasa",
]
