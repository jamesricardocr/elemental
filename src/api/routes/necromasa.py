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
    # Identificación de cuadrante
    subparcela_numero: Optional[int] = None
    subparcela_x: Optional[float] = None
    subparcela_y: Optional[float] = None

    # Tipo según protocolo
    tipo_necromasa: Optional[str] = Field(None, description="'hojarasca', 'fragmentos_finos', 'ramas_medianas', 'ramas_gruesas', 'troncos_caidos'")
    tamano_cuadro: Optional[str] = Field(None, description="'25x25cm' o '2x2m'")

    # Pesos de campo (en gramos)
    pf_total: Optional[float] = Field(None, ge=0, description="Peso fresco total (gramos)")
    pf_submuestra: Optional[float] = Field(None, ge=0, description="Peso fresco submuestra (gramos)")
    ps_submuestra: Optional[float] = Field(None, ge=0, description="Peso seco submuestra (gramos)")

    # Mediciones para ramas
    n_ramas: Optional[int] = Field(None, ge=0)
    circunferencia: Optional[float] = Field(None, ge=0, description="C1 - Primera circunferencia (cm)")
    circunferencia_2: Optional[float] = Field(None, ge=0, description="C2 - Segunda circunferencia para troncos caídos (cm)")
    longitud: Optional[float] = Field(None, ge=0)
    escala_descomposicion: Optional[str] = None
    densidad_madera: Optional[float] = Field(None, ge=0)

    # Fechas
    fecha_medicion: Optional[date] = None
    fecha_secado: Optional[date] = None
    observaciones: Optional[str] = None

    # DEPRECADOS - mantener compatibilidad
    tipo: Optional[str] = None
    peso_fresco: Optional[float] = None
    peso_seco: Optional[float] = None
    diametro: Optional[float] = None


class NecromasaCreate(NecromasaBase):
    parcela_id: int
    subparcela_id: Optional[int] = None


class NecromasaResponse(NecromasaBase):
    id: int
    parcela_id: int
    subparcela_id: Optional[int] = None

    # Cálculos automáticos
    fraccion_seca: Optional[float] = None
    area_transversal: Optional[float] = None
    volumen: Optional[float] = None
    biomasa_seca: Optional[float] = None
    biomasa_01ha: Optional[float] = None
    carbono: Optional[float] = None
    factor_extrapolacion: Optional[int] = None

    class Config:
        from_attributes = True


@router.get("/parcela/{parcela_id}", response_model=List[NecromasaResponse])
def listar_necromasa_parcela(parcela_id: int, db: Session = Depends(get_db)):
    registros = db.query(Necromasa).filter(Necromasa.parcela_id == parcela_id).all()
    # Recalcular si es necesario
    for registro in registros:
        if registro.biomasa_seca is None or registro.carbono is None:
            registro.calcular_todos()
    db.commit()
    return registros


@router.get("/subparcela/{subparcela_id}", response_model=List[NecromasaResponse])
def listar_necromasa_subparcela(subparcela_id: int, db: Session = Depends(get_db)):
    """Lista toda la necromasa de una subparcela específica"""
    registros = db.query(Necromasa).filter(Necromasa.subparcela_id == subparcela_id).all()
    # Recalcular si es necesario
    for registro in registros:
        if registro.biomasa_seca is None or registro.carbono is None:
            registro.calcular_todos()
    db.commit()
    return registros


@router.post("/", response_model=NecromasaResponse, status_code=201)
def crear_necromasa(necromasa: NecromasaCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo registro de necromasa.
    Todos los campos son opcionales excepto parcela_id.
    Los cálculos se ejecutan automáticamente con los datos disponibles.
    """
    nueva = Necromasa(**necromasa.model_dump(exclude_none=False))

    # Ejecutar cálculos automáticos con datos disponibles
    nueva.calcular_todos()

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
