"""
Endpoints API para gestión de Necromasa
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from pydantic import BaseModel, Field

from config.database import get_db
from src.models.necromasa import Necromasa

router = APIRouter()


class NecromasaBase(BaseModel):
    subparcela_numero: Optional[int] = None
    subparcela_x: Optional[float] = None
    subparcela_y: Optional[float] = None
    tipo: str = Field(..., description="'gruesa' o 'fina'")
    peso_fresco: Optional[float] = Field(None, ge=0)
    peso_seco: Optional[float] = Field(None, ge=0)
    diametro: Optional[float] = None
    longitud: Optional[float] = None
    fecha_medicion: Optional[date] = None
    fecha_secado: Optional[date] = None
    observaciones: Optional[str] = None


class NecromasaCreate(NecromasaBase):
    parcela_id: int


class NecromasaResponse(NecromasaBase):
    id: int
    parcela_id: int

    class Config:
        from_attributes = True


@router.get("/parcela/{parcela_id}", response_model=List[NecromasaResponse])
def listar_necromasa_parcela(parcela_id: int, db: Session = Depends(get_db)):
    return db.query(Necromasa).filter(Necromasa.parcela_id == parcela_id).all()


@router.post("/", response_model=NecromasaResponse, status_code=201)
def crear_necromasa(necromasa: NecromasaCreate, db: Session = Depends(get_db)):
    nueva = Necromasa(**necromasa.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.delete("/{necromasa_id}", status_code=204)
def eliminar_necromasa(necromasa_id: int, db: Session = Depends(get_db)):
    necromasa = db.query(Necromasa).filter(Necromasa.id == necromasa_id).first()
    if not necromasa:
        raise HTTPException(status_code=404, detail="Necromasa no encontrada")
    db.delete(necromasa)
    db.commit()
    return None
