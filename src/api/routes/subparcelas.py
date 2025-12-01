"""
Endpoints API para Subparcelas (10m x 10m)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from config.database import get_db
from src.models.subparcela import Subparcela
from src.models.parcela import Parcela
import math
import random
import time

router = APIRouter()


def _generar_codigo_subparcela_unico(db: Session, prefijo: str = "S") -> str:
    """
    Genera un código único de 6 dígitos para una subparcela.

    Args:
        db: Sesión de base de datos
        prefijo: Prefijo opcional (por defecto "S" para Subparcela)

    Returns:
        Código único en formato S123456
    """
    max_intentos = 100
    for _ in range(max_intentos):
        # Generar 6 dígitos aleatorios
        numero = random.randint(100000, 999999)
        codigo = f"{prefijo}{numero}"

        # Verificar que no existe
        existente = db.query(Subparcela).filter(Subparcela.codigo == codigo).first()
        if not existente:
            return codigo

    # Si después de 100 intentos no encontró uno único, usar timestamp
    timestamp = str(int(time.time()))[-6:]
    return f"{prefijo}{timestamp}"


# Modelos Pydantic
class SubparcelaCreate(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    parcela_id: int
    vertice_origen: int  # 1, 2, 3, o 4
    proposito: Optional[str] = None
    observaciones: Optional[str] = None

    class Config:
        from_attributes = True


class SubparcelaUpdate(BaseModel):
    nombre: Optional[str] = None
    proposito: Optional[str] = None
    observaciones: Optional[str] = None
    estado: Optional[str] = None

    class Config:
        from_attributes = True


def calcular_vertices_subparcela(parcela: Parcela, vertice_origen: int):
    """
    Calcula los 4 vértices de una subparcela de 10m x 10m
    desde uno de los vértices de la parcela principal.
    La subparcela se coloca ALINEADA con los bordes de la parcela, hacia adentro.

    Args:
        parcela: Parcela principal
        vertice_origen: Número del vértice (1, 2, 3, o 4)

    Returns:
        dict con latitud, longitud y los 4 vértices de la subparcela
    """
    # Constantes para conversión
    METROS_POR_GRADO_LAT = 111320.0  # metros por grado de latitud

    # Obtener todos los vértices de la parcela
    vertices_parcela = {
        1: (parcela.vertice1_lat, parcela.vertice1_lon),
        2: (parcela.vertice2_lat, parcela.vertice2_lon),
        3: (parcela.vertice3_lat, parcela.vertice3_lon),
        4: (parcela.vertice4_lat, parcela.vertice4_lon),
    }

    if vertice_origen not in vertices_parcela:
        raise ValueError(f"Vértice de origen debe ser 1, 2, 3, o 4. Recibido: {vertice_origen}")

    lat_origen, lon_origen = vertices_parcela[vertice_origen]

    # Calcular metros por grado de longitud en esta latitud
    metros_por_grado_lon = METROS_POR_GRADO_LAT * math.cos(math.radians(lat_origen))

    # Determinar los vértices adyacentes según el vértice de origen
    # Esto garantiza que la subparcela esté alineada con los bordes de la parcela
    if vertice_origen == 1:
        # V1: Lados hacia V2 y hacia V4
        vertice_lado1 = vertices_parcela[2]  # V2
        vertice_lado2 = vertices_parcela[4]  # V4
    elif vertice_origen == 2:
        # V2: Lados hacia V3 y hacia V1
        vertice_lado1 = vertices_parcela[3]  # V3
        vertice_lado2 = vertices_parcela[1]  # V1
    elif vertice_origen == 3:
        # V3: Lados hacia V4 y hacia V2
        vertice_lado1 = vertices_parcela[4]  # V4
        vertice_lado2 = vertices_parcela[2]  # V2
    else:  # vertice_origen == 4
        # V4: Lados hacia V1 y hacia V3
        vertice_lado1 = vertices_parcela[1]  # V1
        vertice_lado2 = vertices_parcela[3]  # V3

    # Calcular vector del origen hacia el primer vértice adyacente
    delta_lat_1 = vertice_lado1[0] - lat_origen
    delta_lon_1 = vertice_lado1[1] - lon_origen
    magnitud_1 = math.sqrt(delta_lat_1**2 + delta_lon_1**2)
    dir1_lat = delta_lat_1 / magnitud_1
    dir1_lon = delta_lon_1 / magnitud_1

    # Calcular vector del origen hacia el segundo vértice adyacente
    delta_lat_2 = vertice_lado2[0] - lat_origen
    delta_lon_2 = vertice_lado2[1] - lon_origen
    magnitud_2 = math.sqrt(delta_lat_2**2 + delta_lon_2**2)
    dir2_lat = delta_lat_2 / magnitud_2
    dir2_lon = delta_lon_2 / magnitud_2

    # Convertir 10 metros a grados
    delta_lat_10m = 10.0 / METROS_POR_GRADO_LAT
    delta_lon_10m = 10.0 / metros_por_grado_lon

    # Crear la subparcela de 10m x 10m alineada con los bordes
    # v1 = vértice de origen
    # v2 = origen + 10m en dirección del primer lado
    # v3 = v2 + 10m en dirección del segundo lado
    # v4 = origen + 10m en dirección del segundo lado

    v1 = (lat_origen, lon_origen)
    v2 = (lat_origen + (dir1_lat * delta_lat_10m),
          lon_origen + (dir1_lon * delta_lon_10m))
    v3 = (v2[0] + (dir2_lat * delta_lat_10m),
          v2[1] + (dir2_lon * delta_lon_10m))
    v4 = (lat_origen + (dir2_lat * delta_lat_10m),
          lon_origen + (dir2_lon * delta_lon_10m))

    # Calcular centro
    centro_lat = (v1[0] + v2[0] + v3[0] + v4[0]) / 4
    centro_lon = (v1[1] + v2[1] + v3[1] + v4[1]) / 4

    return {
        "latitud": centro_lat,
        "longitud": centro_lon,
        "vertice1_lat": v1[0],
        "vertice1_lon": v1[1],
        "vertice2_lat": v2[0],
        "vertice2_lon": v2[1],
        "vertice3_lat": v3[0],
        "vertice3_lon": v3[1],
        "vertice4_lat": v4[0],
        "vertice4_lon": v4[1],
    }


@router.get("/parcela/{parcela_id}", summary="Listar subparcelas de una parcela")
def listar_subparcelas_parcela(
    parcela_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las subparcelas de una parcela específica.
    """
    # Verificar que la parcela existe
    parcela = db.query(Parcela).filter(Parcela.id == parcela_id).first()
    if not parcela:
        raise HTTPException(status_code=404, detail="Parcela no encontrada")

    subparcelas = db.query(Subparcela).filter(Subparcela.parcela_id == parcela_id).all()

    return [
        {
            "id": sp.id,
            "codigo": sp.codigo,
            "nombre": sp.nombre,
            "vertice_origen": sp.vertice_origen,
            "latitud": sp.latitud,
            "longitud": sp.longitud,
            "vertices": [
                [sp.vertice1_lat, sp.vertice1_lon],
                [sp.vertice2_lat, sp.vertice2_lon],
                [sp.vertice3_lat, sp.vertice3_lon],
                [sp.vertice4_lat, sp.vertice4_lon],
            ],
            "proposito": sp.proposito,
            "estado": sp.estado,
            "observaciones": sp.observaciones,
            "created_at": sp.created_at,
        }
        for sp in subparcelas
    ]


@router.post("/", summary="Crear subparcela")
def crear_subparcela(
    subparcela: SubparcelaCreate,
    db: Session = Depends(get_db)
):
    """
    Crea una nueva subparcela de 10m x 10m desde uno de los vértices de la parcela.

    - **codigo**: Código único de la subparcela
    - **parcela_id**: ID de la parcela principal
    - **vertice_origen**: Vértice desde el cual se genera la subparcela (1, 2, 3, o 4)
    - **proposito**: Propósito de la subparcela (opcional)
    """
    # Verificar que la parcela existe
    parcela = db.query(Parcela).filter(Parcela.id == subparcela.parcela_id).first()
    if not parcela:
        raise HTTPException(status_code=404, detail="Parcela no encontrada")

    # Generar código automáticamente si no se proporciona
    codigo = subparcela.codigo
    if not codigo or codigo.strip() == "":
        codigo = _generar_codigo_subparcela_unico(db)
    else:
        # Verificar que el código no existe
        codigo_existe = db.query(Subparcela).filter(Subparcela.codigo == codigo).first()
        if codigo_existe:
            raise HTTPException(status_code=400, detail=f"Ya existe una subparcela con el código '{codigo}'")

    # Validar vértice de origen
    if subparcela.vertice_origen not in [1, 2, 3, 4]:
        raise HTTPException(status_code=400, detail="El vértice de origen debe ser 1, 2, 3, o 4")

    # Calcular vértices de la subparcela
    try:
        vertices_data = calcular_vertices_subparcela(parcela, subparcela.vertice_origen)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Crear subparcela
    nueva_subparcela = Subparcela(
        codigo=codigo,
        nombre=subparcela.nombre,
        parcela_id=subparcela.parcela_id,
        vertice_origen=subparcela.vertice_origen,
        latitud=vertices_data["latitud"],
        longitud=vertices_data["longitud"],
        vertice1_lat=vertices_data["vertice1_lat"],
        vertice1_lon=vertices_data["vertice1_lon"],
        vertice2_lat=vertices_data["vertice2_lat"],
        vertice2_lon=vertices_data["vertice2_lon"],
        vertice3_lat=vertices_data["vertice3_lat"],
        vertice3_lon=vertices_data["vertice3_lon"],
        vertice4_lat=vertices_data["vertice4_lat"],
        vertice4_lon=vertices_data["vertice4_lon"],
        proposito=subparcela.proposito,
        observaciones=subparcela.observaciones,
        estado="activa"
    )

    db.add(nueva_subparcela)
    db.commit()
    db.refresh(nueva_subparcela)

    return {
        "id": nueva_subparcela.id,
        "codigo": nueva_subparcela.codigo,
        "nombre": nueva_subparcela.nombre,
        "parcela_id": nueva_subparcela.parcela_id,
        "vertice_origen": nueva_subparcela.vertice_origen,
        "latitud": nueva_subparcela.latitud,
        "longitud": nueva_subparcela.longitud,
        "vertices": [
            [nueva_subparcela.vertice1_lat, nueva_subparcela.vertice1_lon],
            [nueva_subparcela.vertice2_lat, nueva_subparcela.vertice2_lon],
            [nueva_subparcela.vertice3_lat, nueva_subparcela.vertice3_lon],
            [nueva_subparcela.vertice4_lat, nueva_subparcela.vertice4_lon],
        ],
        "proposito": nueva_subparcela.proposito,
        "estado": nueva_subparcela.estado,
        "message": "Subparcela creada exitosamente"
    }


@router.put("/{subparcela_id}", summary="Actualizar subparcela")
def actualizar_subparcela(
    subparcela_id: int,
    subparcela_update: SubparcelaUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualiza los datos de una subparcela existente.

    - **nombre**: Nuevo nombre (opcional)
    - **proposito**: Nuevo propósito (opcional)
    - **observaciones**: Nuevas observaciones (opcional)
    - **estado**: Nuevo estado (opcional)
    """
    subparcela = db.query(Subparcela).filter(Subparcela.id == subparcela_id).first()

    if not subparcela:
        raise HTTPException(status_code=404, detail="Subparcela no encontrada")

    # Actualizar solo los campos proporcionados
    update_data = subparcela_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subparcela, field, value)

    db.commit()
    db.refresh(subparcela)

    return {
        "id": subparcela.id,
        "codigo": subparcela.codigo,
        "nombre": subparcela.nombre,
        "parcela_id": subparcela.parcela_id,
        "vertice_origen": subparcela.vertice_origen,
        "latitud": subparcela.latitud,
        "longitud": subparcela.longitud,
        "vertices": [
            [subparcela.vertice1_lat, subparcela.vertice1_lon],
            [subparcela.vertice2_lat, subparcela.vertice2_lon],
            [subparcela.vertice3_lat, subparcela.vertice3_lon],
            [subparcela.vertice4_lat, subparcela.vertice4_lon],
        ],
        "proposito": subparcela.proposito,
        "estado": subparcela.estado,
        "observaciones": subparcela.observaciones,
        "message": "Subparcela actualizada exitosamente"
    }


@router.delete("/{subparcela_id}", summary="Eliminar subparcela")
def eliminar_subparcela(
    subparcela_id: int,
    db: Session = Depends(get_db)
):
    """
    Elimina una subparcela por su ID.
    """
    subparcela = db.query(Subparcela).filter(Subparcela.id == subparcela_id).first()

    if not subparcela:
        raise HTTPException(status_code=404, detail="Subparcela no encontrada")

    db.delete(subparcela)
    db.commit()

    return {"message": "Subparcela eliminada exitosamente"}
