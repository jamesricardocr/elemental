"""
Endpoints API para cálculos de biomasa y carbono
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from config.database import get_db
from src.services.biomasa_calculator import BiomasaCalculator
from src.models.calculo import CalculoBiomasa
from src.models.arbol import Arbol
from src.models.parcela import Parcela
from src.models.necromasa import Necromasa
from src.models.herbaceas import Herbaceas

router = APIRouter()


class CalculoRequest(BaseModel):
    parcela_id: int
    modelo_alometrico: str = "chave2014"
    factor_carbono: float = 0.47


class CalculoResponse(BaseModel):
    id: int
    parcela_id: int
    modelo_alometrico: str
    biomasa_aerea: float
    biomasa_subterranea: float
    biomasa_necromasa: Optional[float] = 0.0
    biomasa_herbaceas: Optional[float] = 0.0
    necromasa: Optional[float] = 0.0  # Alias para frontend
    herbaceas: Optional[float] = 0.0  # Alias para frontend
    biomasa_total: float
    carbono_total: float
    factor_carbono: float
    created_at: str

    class Config:
        from_attributes = True

    @staticmethod
    def from_orm(obj):
        """Crear response desde ORM object con alias"""
        data = {
            'id': obj.id,
            'parcela_id': obj.parcela_id,
            'modelo_alometrico': obj.modelo_alometrico,
            'biomasa_aerea': obj.biomasa_aerea or 0.0,
            'biomasa_subterranea': obj.biomasa_subterranea or 0.0,
            'biomasa_necromasa': obj.biomasa_necromasa or 0.0,
            'biomasa_herbaceas': obj.biomasa_herbaceas or 0.0,
            'necromasa': obj.biomasa_necromasa or 0.0,  # Alias
            'herbaceas': obj.biomasa_herbaceas or 0.0,  # Alias
            'biomasa_total': obj.biomasa_total or 0.0,
            'carbono_total': obj.carbono_total or 0.0,
            'factor_carbono': obj.factor_carbono or 0.47,
            'created_at': str(obj.created_at)
        }
        return CalculoResponse(**data)


@router.post("/ejecutar", response_model=CalculoResponse, status_code=201)
def ejecutar_calculo(
    request: CalculoRequest,
    db: Session = Depends(get_db)
):
    """
    Ejecuta el cálculo de biomasa y carbono para una parcela
    """
    try:
        # Verificar que la parcela existe
        parcela = db.query(Parcela).filter(Parcela.id == request.parcela_id).first()
        if not parcela:
            raise HTTPException(status_code=404, detail="Parcela no encontrada")

        # Obtener árboles de la parcela
        arboles = db.query(Arbol).filter(Arbol.parcela_id == request.parcela_id).all()

        # Crear calculadora
        calculator = BiomasaCalculator()
        calculator.factor_carbono = request.factor_carbono

        # Normalizar nombre del modelo
        modelo = request.modelo_alometrico.lower().replace(" ", "_")
        if modelo == "chave2014":
            modelo = "chave_2014"
        elif modelo == "ipcc":
            modelo = "ipcc_2006"

        # Calcular biomasa arbórea
        resultado_arboles = calculator.calcular_biomasa_parcela(arboles, modelo=modelo)
        biomasa_aerea = resultado_arboles.get("biomasa_total_mg", 0)  # en toneladas (Mg)

        # Calcular biomasa subterránea (raíces) - aproximadamente 20-30% de la aérea según IPCC
        factor_raices = 0.25  # 25% típico para bosques tropicales
        biomasa_subterranea = biomasa_aerea * factor_raices

        # Calcular necromasa
        necromasas = db.query(Necromasa).filter(Necromasa.parcela_id == request.parcela_id).all()
        biomasa_necromasa = 0.0
        if necromasas:
            # Sumar peso seco de todas las necromasas y extrapolar a hectárea
            peso_seco_total = sum(n.peso_seco for n in necromasas)
            # peso_seco está en kg, convertir a toneladas
            biomasa_necromasa = peso_seco_total / 1000.0

        # Calcular herbáceas
        herbaceas_list = db.query(Herbaceas).filter(Herbaceas.parcela_id == request.parcela_id).all()
        biomasa_herbaceas = 0.0
        if herbaceas_list:
            # Sumar peso seco de todas las herbáceas
            peso_seco_total = sum(h.peso_seco for h in herbaceas_list)
            # peso_seco está en kg, convertir a toneladas
            biomasa_herbaceas = peso_seco_total / 1000.0

        # Calcular totales
        biomasa_total = biomasa_aerea + biomasa_subterranea + biomasa_necromasa + biomasa_herbaceas
        carbono_total = biomasa_total * request.factor_carbono

        # Crear registro de cálculo
        calculo = CalculoBiomasa(
            parcela_id=request.parcela_id,
            modelo_alometrico=request.modelo_alometrico,
            biomasa_aerea=biomasa_aerea,
            biomasa_subterranea=biomasa_subterranea,
            biomasa_necromasa=biomasa_necromasa,
            biomasa_herbaceas=biomasa_herbaceas,
            biomasa_total=biomasa_total,
            carbono_total=carbono_total,
            factor_carbono=request.factor_carbono
        )

        db.add(calculo)
        db.commit()
        db.refresh(calculo)

        return CalculoResponse.from_orm(calculo)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error en cálculo: {str(e)}")


@router.get("/parcela/{parcela_id}", response_model=list[CalculoResponse])
def obtener_calculos_parcela(
    parcela_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene todos los cálculos de una parcela ordenados por fecha (más reciente primero)"""
    calculos = db.query(CalculoBiomasa).filter(
        CalculoBiomasa.parcela_id == parcela_id
    ).order_by(CalculoBiomasa.created_at.desc()).all()
    return [CalculoResponse.from_orm(c) for c in calculos]


@router.get("/{calculo_id}", response_model=CalculoResponse)
def obtener_calculo(
    calculo_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene un cálculo específico"""
    calculo = db.query(CalculoBiomasa).filter(CalculoBiomasa.id == calculo_id).first()
    if not calculo:
        raise HTTPException(status_code=404, detail="Cálculo no encontrado")
    return CalculoResponse.from_orm(calculo)
