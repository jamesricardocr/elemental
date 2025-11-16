"""
Endpoints API para gestión de Parcelas
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from config.database import get_db
from src.services.parcela_service import ParcelaService
from src.api.schemas.parcela_schema import (
    ParcelaCreate,
    ParcelaUpdate,
    ParcelaResponse,
    ParcelaListResponse,
    ParcelaEstadisticas,
    VerticesUpdate
)

router = APIRouter()


@router.post("/", response_model=ParcelaResponse, status_code=201, summary="Crear nueva parcela")
def crear_parcela(
    parcela: ParcelaCreate,
    db: Session = Depends(get_db)
):
    """
    Crea una nueva parcela con los datos proporcionados.

    - **codigo**: Código único de la parcela (requerido)
    - **nombre**: Nombre descriptivo
    - **latitud/longitud**: Coordenadas del centro
    - **generar_vertices**: Si True, genera automáticamente los 4 vértices
    """
    try:
        service = ParcelaService(db)
        parcela_data = parcela.model_dump(exclude={'generar_vertices'})
        nueva_parcela = service.crear_parcela(
            generar_vertices=parcela.generar_vertices,
            **parcela_data
        )
        return nueva_parcela
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear parcela: {str(e)}")


@router.get("/", response_model=ParcelaListResponse, summary="Listar parcelas")
def listar_parcelas(
    zona: Optional[str] = Query(None, description="Filtrar por zona priorizada"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros"),
    db: Session = Depends(get_db)
):
    """
    Lista todas las parcelas con filtros opcionales.

    - **zona**: Filtrar por zona priorizada
    - **estado**: Filtrar por estado (activa, completada, inactiva)
    - **skip/limit**: Paginación
    """
    service = ParcelaService(db)
    parcelas = service.listar_parcelas(zona=zona, estado=estado, skip=skip, limit=limit)
    total = service.contar_parcelas(zona=zona, estado=estado)

    return ParcelaListResponse(total=total, parcelas=parcelas)


@router.get("/buscar", response_model=List[ParcelaResponse], summary="Buscar parcelas")
def buscar_parcelas(
    q: str = Query(..., min_length=1, description="Término de búsqueda"),
    db: Session = Depends(get_db)
):
    """
    Busca parcelas por código, nombre o zona.

    - **q**: Término de búsqueda (mínimo 1 carácter)
    """
    service = ParcelaService(db)
    return service.buscar_parcelas(q)


@router.get("/{parcela_id}", response_model=ParcelaResponse, summary="Obtener parcela por ID")
def obtener_parcela(
    parcela_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene una parcela específica por su ID.

    - **parcela_id**: ID de la parcela
    """
    service = ParcelaService(db)
    parcela = service.obtener_parcela(parcela_id)

    if not parcela:
        raise HTTPException(status_code=404, detail=f"Parcela con ID {parcela_id} no encontrada")

    return parcela


@router.get("/codigo/{codigo}", response_model=ParcelaResponse, summary="Obtener parcela por código")
def obtener_parcela_por_codigo(
    codigo: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene una parcela específica por su código único.

    - **codigo**: Código de la parcela
    """
    service = ParcelaService(db)
    parcela = service.obtener_parcela_por_codigo(codigo)

    if not parcela:
        raise HTTPException(status_code=404, detail=f"Parcela con código '{codigo}' no encontrada")

    return parcela


@router.put("/{parcela_id}", response_model=ParcelaResponse, summary="Actualizar parcela")
def actualizar_parcela(
    parcela_id: int,
    parcela_update: ParcelaUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza los datos de una parcela existente.

    - **parcela_id**: ID de la parcela
    - Solo se actualizan los campos proporcionados
    """
    service = ParcelaService(db)
    parcela_data = parcela_update.model_dump(exclude_unset=True)

    parcela = service.actualizar_parcela(parcela_id, **parcela_data)

    if not parcela:
        raise HTTPException(status_code=404, detail=f"Parcela con ID {parcela_id} no encontrada")

    return parcela


@router.delete("/{parcela_id}", status_code=204, summary="Eliminar parcela")
def eliminar_parcela(
    parcela_id: int,
    db: Session = Depends(get_db)
):
    """
    Elimina una parcela y todos sus datos asociados.

    - **parcela_id**: ID de la parcela
    - ⚠️ Esta acción no se puede deshacer
    """
    service = ParcelaService(db)
    eliminada = service.eliminar_parcela(parcela_id)

    if not eliminada:
        raise HTTPException(status_code=404, detail=f"Parcela con ID {parcela_id} no encontrada")

    return None


@router.get("/{parcela_id}/estadisticas", response_model=ParcelaEstadisticas, summary="Estadísticas de parcela")
def obtener_estadisticas_parcela(
    parcela_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene estadísticas detalladas de una parcela.

    - **parcela_id**: ID de la parcela
    - Incluye: área, perímetro, número de árboles, etc.
    """
    service = ParcelaService(db)
    estadisticas = service.obtener_estadisticas_parcela(parcela_id)

    if not estadisticas:
        raise HTTPException(status_code=404, detail=f"Parcela con ID {parcela_id} no encontrada")

    return estadisticas


@router.put("/{parcela_id}/vertices", response_model=ParcelaResponse, summary="Actualizar vértices")
def actualizar_vertices(
    parcela_id: int,
    vertices_data: VerticesUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza los 4 vértices de una parcela manualmente.

    - **parcela_id**: ID de la parcela
    - **vertices**: Lista de 4 tuplas (latitud, longitud)
    """
    try:
        service = ParcelaService(db)
        parcela = service.establecer_vertices_manualmente(parcela_id, vertices_data.vertices)

        if not parcela:
            raise HTTPException(status_code=404, detail=f"Parcela con ID {parcela_id} no encontrada")

        return parcela
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/cercanas/punto", response_model=List[dict], summary="Buscar parcelas cercanas")
def obtener_parcelas_cercanas(
    latitud: float = Query(..., description="Latitud del punto de referencia"),
    longitud: float = Query(..., description="Longitud del punto de referencia"),
    radio_km: float = Query(5.0, ge=0.1, le=50, description="Radio de búsqueda en km"),
    db: Session = Depends(get_db)
):
    """
    Encuentra parcelas cercanas a un punto dado.

    - **latitud/longitud**: Coordenadas del punto de referencia
    - **radio_km**: Radio de búsqueda en kilómetros (máximo 50km)
    """
    service = ParcelaService(db)
    return service.obtener_parcelas_cercanas(latitud, longitud, radio_km)


@router.get("/stats/resumen", summary="Resumen general de parcelas")
def obtener_resumen_general(
    db: Session = Depends(get_db)
):
    """
    Obtiene un resumen general de todas las parcelas.

    Retorna estadísticas agregadas del sistema.
    """
    service = ParcelaService(db)

    total_parcelas = service.contar_parcelas()
    parcelas_activas = service.contar_parcelas(estado="activa")
    parcelas_completadas = service.contar_parcelas(estado="completada")

    return {
        "total_parcelas": total_parcelas,
        "parcelas_activas": parcelas_activas,
        "parcelas_completadas": parcelas_completadas,
        "parcelas_inactivas": total_parcelas - parcelas_activas - parcelas_completadas
    }
