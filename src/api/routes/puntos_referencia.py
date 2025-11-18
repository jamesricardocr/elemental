"""
Endpoints API para Puntos de Referencia
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from config.database import get_db
from load_puntos_referencia import PuntoReferencia

router = APIRouter()


# Modelos Pydantic para validación
class PuntoReferenciaCreate(BaseModel):
    zona: str
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    fuente: Optional[str] = None
    latitud: float
    longitud: float

    class Config:
        from_attributes = True


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


@router.post("/", summary="Crear nuevo punto de referencia")
def crear_punto_referencia(
    punto: PuntoReferenciaCreate,
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo punto de referencia en la base de datos.

    - **zona**: Nombre de la zona (puede ser existente o nueva)
    - **nombre**: Nombre descriptivo del punto (opcional)
    - **descripcion**: Descripción detallada (opcional)
    - **fuente**: Fuente de información (opcional)
    - **latitud**: Coordenada de latitud (-90 a 90)
    - **longitud**: Coordenada de longitud (-180 a 180)
    """
    # Validar coordenadas
    if not (-90 <= punto.latitud <= 90):
        raise HTTPException(status_code=400, detail="Latitud debe estar entre -90 y 90")

    if not (-180 <= punto.longitud <= 180):
        raise HTTPException(status_code=400, detail="Longitud debe estar entre -180 y 180")

    # Crear nuevo punto
    nuevo_punto = PuntoReferencia(
        zona=punto.zona,
        nombre=punto.nombre,
        descripcion=punto.descripcion,
        fuente=punto.fuente,
        latitud=punto.latitud,
        longitud=punto.longitud
    )

    db.add(nuevo_punto)
    db.commit()
    db.refresh(nuevo_punto)

    return {
        "id": nuevo_punto.id,
        "zona": nuevo_punto.zona,
        "nombre": nuevo_punto.nombre,
        "descripcion": nuevo_punto.descripcion,
        "fuente": nuevo_punto.fuente,
        "latitud": nuevo_punto.latitud,
        "longitud": nuevo_punto.longitud,
        "message": "Punto de referencia creado exitosamente"
    }


@router.delete("/{punto_id}", summary="Eliminar punto de referencia")
def eliminar_punto_referencia(
    punto_id: int,
    db: Session = Depends(get_db)
):
    """
    Elimina un punto de referencia por su ID.
    """
    punto = db.query(PuntoReferencia).filter(PuntoReferencia.id == punto_id).first()

    if not punto:
        raise HTTPException(status_code=404, detail="Punto de referencia no encontrado")

    db.delete(punto)
    db.commit()

    return {"message": "Punto de referencia eliminado exitosamente"}
