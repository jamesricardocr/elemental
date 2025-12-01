"""
Schemas Pydantic para Parcelas
"""

from pydantic import BaseModel, Field, field_validator, model_serializer
from typing import Optional, List, Any
from datetime import date, datetime


class ParcelaBase(BaseModel):
    """Schema base para parcela"""
    codigo: Optional[str] = Field(None, min_length=1, max_length=50, description="Código único de la parcela (auto-generado si no se proporciona)")
    nombre: Optional[str] = Field(None, max_length=200, description="Nombre descriptivo")
    zona_priorizada: Optional[str] = Field(None, max_length=100, description="Zona geográfica priorizada")

    latitud: Optional[float] = Field(None, ge=-90, le=90, description="Latitud del centro (grados decimales)")
    longitud: Optional[float] = Field(None, ge=-180, le=180, description="Longitud del centro (grados decimales)")
    altitud: Optional[float] = Field(None, description="Altitud en metros")

    pendiente: Optional[float] = Field(None, ge=0, description="Pendiente del terreno")
    tipo_cobertura: Optional[str] = Field(None, max_length=100, description="Tipo de cobertura vegetal")
    accesibilidad: Optional[str] = Field(None, max_length=50, description="Nivel de accesibilidad")

    observaciones: Optional[str] = Field(None, description="Observaciones adicionales")
    responsable: Optional[str] = Field(None, max_length=100, description="Persona responsable")
    estado: Optional[str] = Field("activa", max_length=50, description="Estado de la parcela")

    @field_validator('latitud')
    @classmethod
    def validar_latitud_rango(cls, v):
        if v is not None and not (-5 <= v <= 0):
            raise ValueError('Latitud fuera del rango del Amazonas colombiano (-5° a 0°)')
        return v

    @field_validator('longitud')
    @classmethod
    def validar_longitud_rango(cls, v):
        if v is not None and not (-75 <= v <= -66):
            raise ValueError('Longitud fuera del rango del Amazonas colombiano (-75° a -66°)')
        return v


class ParcelaCreate(ParcelaBase):
    """Schema para crear una nueva parcela"""
    fecha_establecimiento: Optional[date] = Field(default_factory=date.today, description="Fecha de establecimiento")
    generar_vertices: bool = Field(True, description="Generar automáticamente los 4 vértices")

    # Vértices opcionales (si no se generan automáticamente)
    vertice1_lat: Optional[float] = None
    vertice1_lon: Optional[float] = None
    vertice2_lat: Optional[float] = None
    vertice2_lon: Optional[float] = None
    vertice3_lat: Optional[float] = None
    vertice3_lon: Optional[float] = None
    vertice4_lat: Optional[float] = None
    vertice4_lon: Optional[float] = None

    class Config:
        json_schema_extra = {
            "example": {
                "codigo": "P001",
                "nombre": "Parcela Experimental 1",
                "zona_priorizada": "Zona A - Leticia",
                "latitud": -4.2156,
                "longitud": -69.9406,
                "altitud": 96.0,
                "pendiente": 5.0,
                "tipo_cobertura": "Bosque primario",
                "accesibilidad": "fácil",
                "responsable": "Investigador Principal",
                "estado": "activa",
                "generar_vertices": True
            }
        }


class ParcelaUpdate(BaseModel):
    """Schema para actualizar una parcela existente"""
    nombre: Optional[str] = None
    zona_priorizada: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    altitud: Optional[float] = None
    pendiente: Optional[float] = None
    tipo_cobertura: Optional[str] = None
    accesibilidad: Optional[str] = None
    observaciones: Optional[str] = None
    responsable: Optional[str] = None
    estado: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "nombre": "Parcela Actualizada",
                "estado": "completada"
            }
        }


class ParcelaResponse(ParcelaBase):
    """Schema para respuesta de parcela"""
    id: int
    fecha_establecimiento: Optional[date]

    # Coordenadas UTM
    utm_x: Optional[float]
    utm_y: Optional[float]
    utm_zone: Optional[str]

    # Vértices
    vertice1_lat: Optional[float]
    vertice1_lon: Optional[float]
    vertice2_lat: Optional[float]
    vertice2_lon: Optional[float]
    vertice3_lat: Optional[float]
    vertice3_lon: Optional[float]
    vertice4_lat: Optional[float]
    vertice4_lon: Optional[float]

    # Metadatos
    croquis_url: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    @model_serializer
    def serialize_model(self) -> dict[str, Any]:
        """Serializa el modelo agregando el campo vertices"""
        data = {
            'id': self.id,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'zona_priorizada': self.zona_priorizada,
            'latitud': self.latitud,
            'longitud': self.longitud,
            'altitud': self.altitud,
            'utm_x': self.utm_x,
            'utm_y': self.utm_y,
            'utm_zone': self.utm_zone,
            'pendiente': self.pendiente,
            'tipo_cobertura': self.tipo_cobertura,
            'accesibilidad': self.accesibilidad,
            'observaciones': self.observaciones,
            'responsable': self.responsable,
            'estado': self.estado,
            'fecha_establecimiento': self.fecha_establecimiento.isoformat() if self.fecha_establecimiento else None,
            'croquis_url': self.croquis_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'vertice1_lat': self.vertice1_lat,
            'vertice1_lon': self.vertice1_lon,
            'vertice2_lat': self.vertice2_lat,
            'vertice2_lon': self.vertice2_lon,
            'vertice3_lat': self.vertice3_lat,
            'vertice3_lon': self.vertice3_lon,
            'vertice4_lat': self.vertice4_lat,
            'vertice4_lon': self.vertice4_lon,
        }

        # Agregar array de vértices si todos están presentes
        if all([
            self.vertice1_lat is not None, self.vertice1_lon is not None,
            self.vertice2_lat is not None, self.vertice2_lon is not None,
            self.vertice3_lat is not None, self.vertice3_lon is not None,
            self.vertice4_lat is not None, self.vertice4_lon is not None
        ]):
            data['vertices'] = [
                [self.vertice1_lat, self.vertice1_lon],
                [self.vertice2_lat, self.vertice2_lon],
                [self.vertice3_lat, self.vertice3_lon],
                [self.vertice4_lat, self.vertice4_lon]
            ]
        else:
            data['vertices'] = None

        return data

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "codigo": "P001",
                "nombre": "Parcela Experimental 1",
                "zona_priorizada": "Zona A - Leticia",
                "latitud": -4.2156,
                "longitud": -69.9406,
                "altitud": 96.0,
                "utm_x": 679834.0,
                "utm_y": 9532650.0,
                "utm_zone": "18M",
                "pendiente": 5.0,
                "tipo_cobertura": "Bosque primario",
                "accesibilidad": "fácil",
                "estado": "activa",
                "fecha_establecimiento": "2025-01-08",
                "responsable": "Investigador Principal"
            }
        }


class ParcelaListResponse(BaseModel):
    """Schema para lista de parcelas"""
    total: int = Field(..., description="Total de parcelas")
    parcelas: List[ParcelaResponse] = Field(..., description="Lista de parcelas")

    class Config:
        json_schema_extra = {
            "example": {
                "total": 2,
                "parcelas": [
                    {
                        "id": 1,
                        "codigo": "P001",
                        "nombre": "Parcela 1",
                        "zona_priorizada": "Zona A",
                        "latitud": -4.2156,
                        "longitud": -69.9406,
                        "estado": "activa"
                    }
                ]
            }
        }


class ParcelaEstadisticas(BaseModel):
    """Schema para estadísticas de una parcela"""
    codigo: str
    nombre: Optional[str]
    area_m2: Optional[float] = Field(None, description="Área en metros cuadrados")
    area_ha: float = Field(..., description="Área en hectáreas")
    perimetro_m: Optional[float] = Field(None, description="Perímetro en metros")
    num_arboles: int = Field(0, description="Número de árboles medidos")
    num_necromasa: int = Field(0, description="Número de mediciones de necromasa")
    num_herbaceas: int = Field(0, description="Número de cuadrantes de herbáceas")
    tiene_calculos: bool = Field(False, description="¿Tiene cálculos de biomasa?")
    estado: str
    fecha_establecimiento: Optional[date]

    class Config:
        json_schema_extra = {
            "example": {
                "codigo": "P001",
                "nombre": "Parcela Experimental 1",
                "area_m2": 1000.0,
                "area_ha": 0.1,
                "perimetro_m": 140.0,
                "num_arboles": 45,
                "num_necromasa": 8,
                "num_herbaceas": 12,
                "tiene_calculos": True,
                "estado": "activa",
                "fecha_establecimiento": "2025-01-08"
            }
        }


class VerticesUpdate(BaseModel):
    """Schema para actualizar vértices de una parcela"""
    vertices: List[tuple[float, float]] = Field(..., min_length=4, max_length=4, description="4 vértices (lat, lon)")

    @field_validator('vertices')
    @classmethod
    def validar_vertices(cls, v):
        if len(v) != 4:
            raise ValueError('Se requieren exactamente 4 vértices')
        for i, vertice in enumerate(v, 1):
            if len(vertice) != 2:
                raise ValueError(f'Vértice {i} debe ser una tupla (latitud, longitud)')
            lat, lon = vertice
            if not (-90 <= lat <= 90):
                raise ValueError(f'Vértice {i}: Latitud fuera de rango')
            if not (-180 <= lon <= 180):
                raise ValueError(f'Vértice {i}: Longitud fuera de rango')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "vertices": [
                    [-4.2157, -69.9407],
                    [-4.2157, -69.9405],
                    [-4.2155, -69.9405],
                    [-4.2155, -69.9407]
                ]
            }
        }
