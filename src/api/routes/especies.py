"""
Endpoints API para gestión de Especies
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from config.database import get_db
from src.models.especie import Especie
from pydantic import BaseModel, Field

router = APIRouter()


# Schemas
class EspecieBase(BaseModel):
    nombre_comun: str = Field(..., min_length=1, max_length=200)
    nombre_cientifico: Optional[str] = Field(None, max_length=200)
    familia: Optional[str] = Field(None, max_length=100)
    densidad_madera: Optional[float] = Field(None, ge=0, description="Densidad de la madera (g/cm³)")
    observaciones: Optional[str] = None


class EspecieCreate(EspecieBase):
    pass


class EspecieUpdate(BaseModel):
    nombre_comun: Optional[str] = None
    nombre_cientifico: Optional[str] = None
    familia: Optional[str] = None
    densidad_madera: Optional[float] = None
    observaciones: Optional[str] = None


class EspecieResponse(EspecieBase):
    id: int

    class Config:
        from_attributes = True


@router.get("/", response_model=List[EspecieResponse], summary="Listar especies")
def listar_especies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    buscar: Optional[str] = Query(None, description="Buscar por nombre común o científico"),
    db: Session = Depends(get_db)
):
    """Lista todas las especies con búsqueda opcional"""
    query = db.query(Especie)

    if buscar:
        search_filter = f"%{buscar}%"
        query = query.filter(
            (Especie.nombre_comun.ilike(search_filter)) |
            (Especie.nombre_cientifico.ilike(search_filter))
        )

    especies = query.offset(skip).limit(limit).all()
    return especies


@router.get("/{especie_id}", response_model=EspecieResponse, summary="Obtener especie por ID")
def obtener_especie(
    especie_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene una especie específica por su ID"""
    especie = db.query(Especie).filter(Especie.id == especie_id).first()

    if not especie:
        raise HTTPException(status_code=404, detail=f"Especie con ID {especie_id} no encontrada")

    return especie


@router.post("/", response_model=EspecieResponse, status_code=201, summary="Crear especie")
def crear_especie(
    especie: EspecieCreate,
    db: Session = Depends(get_db)
):
    """Crea una nueva especie"""
    # Verificar si ya existe
    existe = db.query(Especie).filter(
        Especie.nombre_cientifico == especie.nombre_cientifico
    ).first()

    if existe:
        raise HTTPException(
            status_code=400,
            detail=f"Ya existe una especie con el nombre científico '{especie.nombre_cientifico}'"
        )

    nueva_especie = Especie(**especie.model_dump())
    db.add(nueva_especie)
    db.commit()
    db.refresh(nueva_especie)

    return nueva_especie


@router.put("/{especie_id}", response_model=EspecieResponse, summary="Actualizar especie")
def actualizar_especie(
    especie_id: int,
    especie_update: EspecieUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza una especie existente"""
    especie = db.query(Especie).filter(Especie.id == especie_id).first()

    if not especie:
        raise HTTPException(status_code=404, detail=f"Especie con ID {especie_id} no encontrada")

    update_data = especie_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(especie, key, value)

    db.commit()
    db.refresh(especie)

    return especie


@router.delete("/{especie_id}", status_code=204, summary="Eliminar especie")
def eliminar_especie(
    especie_id: int,
    db: Session = Depends(get_db)
):
    """Elimina una especie"""
    especie = db.query(Especie).filter(Especie.id == especie_id).first()

    if not especie:
        raise HTTPException(status_code=404, detail=f"Especie con ID {especie_id} no encontrada")

    # Verificar si tiene árboles asociados
    if especie.arboles:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar la especie porque tiene {len(especie.arboles)} árboles registrados"
        )

    db.delete(especie)
    db.commit()

    return None
