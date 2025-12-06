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
    # Identificación de cuadrante (2m × 2m)
    cuadrante_numero: Optional[int] = None
    cuadrante_x: Optional[float] = None
    cuadrante_y: Optional[float] = None

    # Tipo de agrupación según protocolo
    tipo_agrupacion: Optional[str] = Field(None, description="'gramineas', 'helechos', 'plantulas', 'hojas_anchas'")

    # Conteo y alturas
    n_individuos: Optional[int] = Field(None, ge=0)
    altura_maxima: Optional[float] = Field(None, ge=0)
    altura_minima: Optional[float] = Field(None, ge=0)
    altura_promedio: Optional[float] = Field(None, ge=0)

    # Pesos de campo
    pf_total: Optional[float] = Field(None, ge=0)
    pf_submuestra: Optional[float] = Field(None, ge=0)
    ps_submuestra: Optional[float] = Field(None, ge=0)

    # Especies y cobertura
    especies_presentes: Optional[str] = None
    cobertura_visual: Optional[float] = Field(None, ge=0, le=100)

    # Fechas
    fecha_medicion: Optional[date] = None
    fecha_secado: Optional[date] = None
    observaciones: Optional[str] = None

    # DEPRECADOS - mantener compatibilidad
    peso_fresco: Optional[float] = None
    peso_seco: Optional[float] = None


class HerbaceasCreate(HerbaceasBase):
    parcela_id: int
    subparcela_id: Optional[int] = None


class HerbaceasResponse(HerbaceasBase):
    id: int
    parcela_id: int
    subparcela_id: Optional[int] = None

    # Cálculos automáticos
    fraccion_seca: Optional[float] = None
    biomasa_seca: Optional[float] = None
    biomasa_01ha: Optional[float] = None
    carbono: Optional[float] = None

    class Config:
        from_attributes = True


@router.get("/parcela/{parcela_id}", response_model=List[HerbaceasResponse])
def listar_herbaceas_parcela(parcela_id: int, db: Session = Depends(get_db)):
    registros = db.query(Herbaceas).filter(Herbaceas.parcela_id == parcela_id).all()
    # Recalcular si es necesario
    for registro in registros:
        if registro.biomasa_seca is None or registro.carbono is None:
            registro.calcular_todos()
    db.commit()
    return registros


@router.get("/subparcela/{subparcela_id}", response_model=List[HerbaceasResponse])
def listar_herbaceas_subparcela(subparcela_id: int, db: Session = Depends(get_db)):
    """Lista todas las herbáceas de una subparcela específica"""
    registros = db.query(Herbaceas).filter(Herbaceas.subparcela_id == subparcela_id).all()
    # Recalcular si es necesario
    for registro in registros:
        if registro.biomasa_seca is None or registro.carbono is None:
            registro.calcular_todos()
    db.commit()
    return registros


@router.post("/", response_model=HerbaceasResponse, status_code=201)
def crear_herbaceas(herbaceas: HerbaceasCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo registro de herbáceas.
    Todos los campos son opcionales excepto parcela_id.
    Los cálculos se ejecutan automáticamente con los datos disponibles.
    """
    nueva = Herbaceas(**herbaceas.model_dump(exclude_none=False))

    # Ejecutar cálculos automáticos con datos disponibles
    nueva.calcular_todos()

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
