"""
Configuración general de la aplicación usando Pydantic Settings
"""

from __future__ import annotations
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Configuración de la aplicación"""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"  # Ignorar campos extra en .env
    )

    # App
    APP_NAME: str = "Sistema de Gestión de Biomasa y Carbono - IAP"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./iap_database.db"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-min-32-chars"

    # Google Maps
    GOOGLE_MAPS_API_KEY: Optional[str] = None

    # Cálculos
    CARBON_FACTOR: float = 0.47
    PARCEL_AREA_HA: float = 0.1

    # APIs Externas (opcionales)
    GBIF_API_KEY: Optional[str] = None
    TROPICOS_API_KEY: Optional[str] = None
    OPENWEATHER_API_KEY: Optional[str] = None

    # NASA EarthData (para cálculos satelitales)
    NASA_EARTHDATA_USERNAME: Optional[str] = None
    NASA_EARTHDATA_PASSWORD: Optional[str] = None
    NASA_EARTHDATA_TOKEN: Optional[str] = None

    # Coordenadas
    DEFAULT_UTM_ZONE: str = "18M"  # Zona UTM para Amazonas, Colombia


@lru_cache
def get_settings() -> Settings:
    """Obtiene la configuración de la aplicación (cached)"""
    return Settings()


# Instancia global de settings
settings = get_settings()
