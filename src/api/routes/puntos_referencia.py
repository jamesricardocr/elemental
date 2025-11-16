"""
Endpoints API para Puntos de Referencia
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from config.database import get_db
from load_puntos_referencia import PuntoReferencia

router = APIRouter()


@router.get("/zonas", summary="Listar zonas disponibles")
def listar_zonas(db: Session = Depends(get_db)):
    """
    Obtiene la lista de todas las zonas priorizadas con puntos de referencia.

    Retorna un array de nombres de zonas únicas.
    """
    zonas = db.query(PuntoReferencia.zona).distinct().all()
    return [z[0] for z in zonas]


@router.get("/", summary="Obtener puntos de referencia")
def obtener_puntos_referencia(
    zona: Optional[str] = Query(None, description="Filtrar por zona específica"),
    db: Session = Depends(get_db)
):
    """
    Obtiene puntos de referencia, opcionalmente filtrados por zona.

    - **zona**: Nombre de la zona priorizada (opcional)

    Retorna una lista de puntos con sus coordenadas y detalles.
    """
    query = db.query(PuntoReferencia)

    if zona:
        query = query.filter(PuntoReferencia.zona == zona)

    puntos = query.all()

    return [
        {
            "id": p.id,
            "zona": p.zona,
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "fuente": p.fuente,
            "latitud": p.latitud,
            "longitud": p.longitud
        }
        for p in puntos
    ]


@router.get("/zona/{zona_nombre}", summary="Obtener puntos de una zona específica")
def obtener_puntos_por_zona(
    zona_nombre: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los puntos de referencia de una zona específica.

    - **zona_nombre**: Nombre exacto de la zona
    """
    puntos = db.query(PuntoReferencia).filter(
        PuntoReferencia.zona == zona_nombre
    ).all()

    return {
        "zona": zona_nombre,
        "total_puntos": len(puntos),
        "puntos": [
            {
                "id": p.id,
                "nombre": p.nombre,
                "descripcion": p.descripcion,
                "fuente": p.fuente,
                "latitud": p.latitud,
                "longitud": p.longitud
            }
            for p in puntos
        ]
    }
