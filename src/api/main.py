"""
API Principal - FastAPI
Sistema de Gestión de Biomasa y Carbono - Proyecto Ecoturismo Amazónico
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings

# Crear aplicación FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API REST para gestión de datos de biomasa y carbono en el Amazonas",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS (permitir acceso desde Streamlit)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importar routers
from .routes import parcelas_router
from .routes.puntos_referencia import router as puntos_router
from .routes.especies import router as especies_router
from .routes.arboles import router as arboles_router
from .routes.necromasa import router as necromasa_router
from .routes.herbaceas import router as herbaceas_router
from .routes.calculos import router as calculos_router
from .routes.calculos_satelitales import router as calculos_satelitales_router

# Registrar routers
app.include_router(parcelas_router, prefix="/api/v1/parcelas", tags=["Parcelas"])
app.include_router(puntos_router, prefix="/api/v1/puntos-referencia", tags=["Puntos de Referencia"])
app.include_router(especies_router, prefix="/api/v1/especies", tags=["Especies"])
app.include_router(arboles_router, prefix="/api/v1/arboles", tags=["Árboles"])
app.include_router(necromasa_router, prefix="/api/v1/necromasa", tags=["Necromasa"])
app.include_router(herbaceas_router, prefix="/api/v1/herbaceas", tags=["Herbáceas"])
app.include_router(calculos_router, prefix="/api/v1/calculos", tags=["Cálculos de Biomasa"])
app.include_router(calculos_satelitales_router, prefix="/api/v1/calculos-satelitales", tags=["Cálculos Satelitales"])


@app.get("/")
async def root():
    """Endpoint raíz - Información de la API"""
    return {
        "nombre": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "estado": "activo",
        "documentacion": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check - Verifica que la API esté funcionando"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
