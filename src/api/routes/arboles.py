"""
Endpoints API para gestión de Árboles
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from config.database import get_db
from src.services.arbol_service import ArbolService
from src.models.arbol import Arbol
from pydantic import BaseModel, Field

router = APIRouter()


# Schemas
class ArbolBase(BaseModel):
    especie_id: Optional[int] = None
    numero_arbol: int = Field(..., ge=1, description="Número del árbol en la parcela")
    codigo: Optional[str] = Field(None, max_length=50)
    dap: float = Field(..., ge=10.0, description="DAP en cm (≥ 10 cm)")
    altura: Optional[float] = Field(None, ge=0, description="Altura total en metros")
    posicion_x: Optional[float] = None
    posicion_y: Optional[float] = None
    forma_fuste: Optional[str] = Field(None, max_length=50)
    estado_sanitario: Optional[str] = Field(None, max_length=100)
    fecha_medicion: Optional[date] = None
    observaciones: Optional[str] = None


class ArbolCreate(ArbolBase):
    parcela_id: int


class ArbolUpdate(BaseModel):
    especie_id: Optional[int] = None
    numero_arbol: Optional[int] = None
    codigo: Optional[str] = None
    dap: Optional[float] = Field(None, ge=10.0)
    altura: Optional[float] = None
    posicion_x: Optional[float] = None
    posicion_y: Optional[float] = None
    forma_fuste: Optional[str] = None
    estado_sanitario: Optional[str] = None
    fecha_medicion: Optional[date] = None
    observaciones: Optional[str] = None


class ArbolResponse(ArbolBase):
    id: int
    parcela_id: int
    area_basal: Optional[float]

    class Config:
        from_attributes = True


@router.get("/parcela/{parcela_id}", response_model=List[ArbolResponse], summary="Listar árboles de una parcela")
def listar_arboles_parcela(
    parcela_id: int,
    db: Session = Depends(get_db)
):
    """Lista todos los árboles de una parcela específica"""
    arboles = db.query(Arbol).filter(Arbol.parcela_id == parcela_id).all()
    return arboles


@router.get("/{arbol_id}", response_model=ArbolResponse, summary="Obtener árbol por ID")
def obtener_arbol(
    arbol_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene un árbol específico por su ID"""
    arbol = db.query(Arbol).filter(Arbol.id == arbol_id).first()

    if not arbol:
        raise HTTPException(status_code=404, detail=f"Árbol con ID {arbol_id} no encontrado")

    return arbol


@router.post("/", response_model=ArbolResponse, status_code=201, summary="Registrar nuevo árbol")
def crear_arbol(
    arbol: ArbolCreate,
    db: Session = Depends(get_db)
):
    """Registra un nuevo árbol en una parcela"""
    try:
        service = ArbolService(db)

        # Verificar que no exista otro árbol con el mismo número en la parcela
        existe = db.query(Arbol).filter(
            Arbol.parcela_id == arbol.parcela_id,
            Arbol.numero_arbol == arbol.numero_arbol
        ).first()

        if existe:
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe un árbol número {arbol.numero_arbol} en esta parcela"
            )

        nuevo_arbol = Arbol(**arbol.model_dump())
        db.add(nuevo_arbol)
        db.commit()
        db.refresh(nuevo_arbol)

        return nuevo_arbol

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear árbol: {str(e)}")


@router.put("/{arbol_id}", response_model=ArbolResponse, summary="Actualizar árbol")
def actualizar_arbol(
    arbol_id: int,
    arbol_update: ArbolUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza los datos de un árbol"""
    arbol = db.query(Arbol).filter(Arbol.id == arbol_id).first()

    if not arbol:
        raise HTTPException(status_code=404, detail=f"Árbol con ID {arbol_id} no encontrado")

    update_data = arbol_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(arbol, key, value)

    db.commit()
    db.refresh(arbol)

    return arbol


@router.delete("/{arbol_id}", status_code=204, summary="Eliminar árbol")
def eliminar_arbol(
    arbol_id: int,
    db: Session = Depends(get_db)
):
    """Elimina un árbol"""
    arbol = db.query(Arbol).filter(Arbol.id == arbol_id).first()

    if not arbol:
        raise HTTPException(status_code=404, detail=f"Árbol con ID {arbol_id} no encontrado")

    db.delete(arbol)
    db.commit()

    return None


@router.get("/parcela/{parcela_id}/estadisticas", summary="Estadísticas de árboles por parcela")
def estadisticas_arboles(
    parcela_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene estadísticas de los árboles de una parcela"""
    from sqlalchemy import func

    arboles = db.query(Arbol).filter(Arbol.parcela_id == parcela_id).all()

    if not arboles:
        return {
            "total_arboles": 0,
            "dap_promedio": None,
            "dap_min": None,
            "dap_max": None,
            "altura_promedio": None,
            "area_basal_total": 0
        }

    stats = db.query(
        func.count(Arbol.id).label('total'),
        func.avg(Arbol.dap).label('dap_promedio'),
        func.min(Arbol.dap).label('dap_min'),
        func.max(Arbol.dap).label('dap_max'),
        func.avg(Arbol.altura).label('altura_promedio')
    ).filter(Arbol.parcela_id == parcela_id).first()

    area_basal_total = sum([arbol.area_basal or 0 for arbol in arboles])

    return {
        "total_arboles": stats.total,
        "dap_promedio": round(stats.dap_promedio, 2) if stats.dap_promedio else None,
        "dap_min": stats.dap_min,
        "dap_max": stats.dap_max,
        "altura_promedio": round(stats.altura_promedio, 2) if stats.altura_promedio else None,
        "area_basal_total": round(area_basal_total, 4)
    }
