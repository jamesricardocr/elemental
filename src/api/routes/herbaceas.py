"""
Endpoints API para gestión de Herbáceas
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from pydantic import BaseModel, Field

from config.database import get_db
from src.models.herbaceas import Herbaceas

router = APIRouter()


class HerbaceasBase(BaseModel):
    cuadrante_numero: Optional[int] = None
    cuadrante_x: Optional[float] = None
    cuadrante_y: Optional[float] = None
    peso_fresco: Optional[float] = Field(None, ge=0)
    peso_seco: Optional[float] = Field(None, ge=0)
    especies_presentes: Optional[str] = None
    cobertura_visual: Optional[float] = Field(None, ge=0, le=100)
    fecha_medicion: Optional[date] = None
    fecha_secado: Optional[date] = None
    observaciones: Optional[str] = None


class HerbaceasCreate(HerbaceasBase):
    parcela_id: int


class HerbaceasResponse(HerbaceasBase):
    id: int
    parcela_id: int

    class Config:
        from_attributes = True


@router.get("/parcela/{parcela_id}", response_model=List[HerbaceasResponse])
def listar_herbaceas_parcela(parcela_id: int, db: Session = Depends(get_db)):
    return db.query(Herbaceas).filter(Herbaceas.parcela_id == parcela_id).all()


@router.post("/", response_model=HerbaceasResponse, status_code=201)
def crear_herbaceas(herbaceas: HerbaceasCreate, db: Session = Depends(get_db)):
    nueva = Herbaceas(**herbaceas.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.delete("/{herbaceas_id}", status_code=204)
def eliminar_herbaceas(herbaceas_id: int, db: Session = Depends(get_db)):
    herbaceas = db.query(Herbaceas).filter(Herbaceas.id == herbaceas_id).first()
    if not herbaceas:
        raise HTTPException(status_code=404, detail="Herbáceas no encontradas")
    db.delete(herbaceas)
    db.commit()
    return None
