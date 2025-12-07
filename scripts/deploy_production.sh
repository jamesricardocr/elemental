#!/bin/bash

# Script de deployment para producción
# Uso: ./scripts/deploy_production.sh

set -e  # Salir si cualquier comando falla

echo "=================================="
echo "🚀 Deployment de Producción - Elemental"
echo "=================================="

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorio del proyecto (asume que el script está en /scripts)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${YELLOW}📂 Directorio de proyecto: $PROJECT_DIR${NC}"

# Verificar que docker-compose.prod.yml existe
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.prod.yml no encontrado${NC}"
    exit 1
fi

# Backup de base de datos
echo -e "${YELLOW}💾 Creando backup de base de datos...${NC}"
if [ -f "iap_database.db" ]; then
    BACKUP_FILE="iap_database_backup_$(date +%Y%m%d_%H%M%S).db"
    cp iap_database.db "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup creado: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  Base de datos no encontrada, saltando backup${NC}"
fi

# Detener contenedores actuales (si existen)
echo -e "${YELLOW}🛑 Deteniendo contenedores actuales...${NC}"
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Limpiar imágenes antiguas (opcional)
read -p "¿Desea eliminar imágenes antiguas para build limpio? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Eliminando imágenes antiguas...${NC}"
    docker compose -f docker-compose.prod.yml down --rmi all 2>/dev/null || true
fi

# Build de imágenes
echo -e "${YELLOW}🔨 Construyendo imágenes de producción...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache

# Iniciar servicios
echo -e "${YELLOW}🚀 Iniciando servicios...${NC}"
docker compose -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén saludables
echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 10

# Verificar estado de contenedores
echo -e "${YELLOW}📊 Estado de contenedores:${NC}"
docker compose -f docker-compose.prod.yml ps

# Verificar logs
echo -e "${YELLOW}📋 Últimos logs del backend:${NC}"
docker compose -f docker-compose.prod.yml logs --tail=20 backend

echo -e "${YELLOW}📋 Últimos logs del frontend:${NC}"
docker compose -f docker-compose.prod.yml logs --tail=20 frontend

# Verificar health checks
echo -e "${YELLOW}🏥 Verificando health checks...${NC}"
sleep 5

BACKEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' elemental-backend 2>/dev/null || echo "no-healthcheck")
FRONTEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' elemental-frontend 2>/dev/null || echo "no-healthcheck")

echo -e "Backend health: ${BACKEND_HEALTH}"
echo -e "Frontend health: ${FRONTEND_HEALTH}"

# Resumen
echo ""
echo "=================================="
echo -e "${GREEN}✅ Deployment completado${NC}"
echo "=================================="
echo ""
echo "📱 Aplicación disponible en:"
echo "   - Frontend: http://localhost"
echo "   - Backend API: http://localhost:8001"
echo ""
echo "📊 Comandos útiles:"
echo "   - Ver logs: docker compose -f docker-compose.prod.yml logs -f"
echo "   - Ver estado: docker compose -f docker-compose.prod.yml ps"
echo "   - Detener: docker compose -f docker-compose.prod.yml down"
echo ""
