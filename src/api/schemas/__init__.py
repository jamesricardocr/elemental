"""
Schemas Pydantic para validación de datos en la API
"""

from .parcela_schema import (
    ParcelaBase,
    ParcelaCreate,
    ParcelaUpdate,
    ParcelaResponse,
    ParcelaListResponse,
    ParcelaEstadisticas
)

__all__ = [
    "ParcelaBase",
    "ParcelaCreate",
    "ParcelaUpdate",
    "ParcelaResponse",
    "ParcelaListResponse",
    "ParcelaEstadisticas",
]
