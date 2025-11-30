"""
Endpoints API para Puntos de Referencia
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from config.database import get_db
from load_puntos_referencia import PuntoReferencia
from src.models.parcela import Parcela
from src.models.zona import Zona

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


class ZonaCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/zonas", summary="Listar zonas disponibles")
def listar_zonas(db: Session = Depends(get_db)):
    """
    Obtiene la lista de todas las zonas desde la tabla de zonas.

    Las zonas son agrupaciones lógicas que se crean independientemente
    y pueden existir sin puntos de referencia o parcelas asociadas.

    Retorna un array de nombres de zonas únicas ordenadas alfabéticamente.
    """
    # Obtener todas las zonas desde la tabla zonas
    zonas = db.query(Zona.nombre).order_by(Zona.nombre).all()

    # Extraer solo los nombres
    nombres_zonas = [z[0] for z in zonas]

    return nombres_zonas


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


# ==================== ENDPOINTS DE ZONAS ====================

@router.post("/zonas", summary="Crear nueva zona")
def crear_zona(
    zona: ZonaCreate,
    db: Session = Depends(get_db)
):
    """
    Crea una nueva zona en la base de datos.

    Las zonas son agrupaciones lógicas que existen independientemente
    de puntos de referencia o parcelas. Se crean primero y luego
    se les asignan puntos o parcelas.

    - **nombre**: Nombre único de la zona (requerido)
    - **descripcion**: Descripción opcional de la zona
    """
    # Validar que el nombre no esté vacío
    if not zona.nombre or not zona.nombre.strip():
        raise HTTPException(status_code=400, detail="El nombre de la zona no puede estar vacío")

    # Verificar si ya existe una zona con ese nombre
    zona_existente = db.query(Zona).filter(Zona.nombre == zona.nombre.strip()).first()
    if zona_existente:
        raise HTTPException(status_code=400, detail=f"Ya existe una zona con el nombre '{zona.nombre.strip()}'")

    # Crear nueva zona
    nueva_zona = Zona(
        nombre=zona.nombre.strip(),
        descripcion=zona.descripcion.strip() if zona.descripcion else None
    )

    db.add(nueva_zona)
    db.commit()
    db.refresh(nueva_zona)

    return {
        "id": nueva_zona.id,
        "nombre": nueva_zona.nombre,
        "descripcion": nueva_zona.descripcion,
        "created_at": nueva_zona.created_at,
        "message": "Zona creada exitosamente"
    }


@router.delete("/zonas/{zona_id}", summary="Eliminar zona")
def eliminar_zona(
    zona_id: int,
    db: Session = Depends(get_db)
):
    """
    Elimina una zona por su ID.

    ADVERTENCIA: Esto no elimina las parcelas o puntos asociados,
    solo elimina la zona de la lista de zonas disponibles.
    """
    zona = db.query(Zona).filter(Zona.id == zona_id).first()

    if not zona:
        raise HTTPException(status_code=404, detail="Zona no encontrada")

    db.delete(zona)
    db.commit()

    return {"message": f"Zona '{zona.nombre}' eliminada exitosamente"}
