#!/bin/bash

# Script de deployment al servidor de producción
# Uso: ./scripts/deploy_to_server.sh
# IMPORTANTE: NO toca la base de datos de producción

set -e

echo "=================================="
echo "🚀 Deploy a Servidor de Producción - Elemental"
echo "=================================="

# Configuración del servidor
SERVER_USER="root"
SERVER_HOST="147.93.10.133"
SERVER_PATH="/srv/Elemental"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar conexión SSH
echo -e "${YELLOW}🔌 Verificando conexión al servidor...${NC}"
if ! ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo 'Conexión exitosa'" &>/dev/null; then
    echo -e "${RED}❌ Error: No se puede conectar al servidor${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Conexión al servidor exitosa${NC}"

# Confirmación
echo -e "${YELLOW}⚠️  IMPORTANTE: Este script NO modificará la base de datos de producción${NC}"
echo -e "${YELLOW}📍 Servidor: $SERVER_USER@$SERVER_HOST${NC}"
echo -e "${YELLOW}📂 Path: $SERVER_PATH${NC}"
read -p "¿Continuar con el deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deployment cancelado${NC}"
    exit 1
fi

# Backup de la DB en el servidor (solo backup, no se modifica)
echo -e "${YELLOW}💾 Creando backup de DB en servidor (seguridad)...${NC}"
ssh "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
cd /srv/Elemental
if [ -f "iap_database.db" ]; then
    BACKUP_FILE="backups/iap_database_backup_$(date +%Y%m%d_%H%M%S).db"
    mkdir -p backups
    cp iap_database.db "$BACKUP_FILE"
    echo "✅ Backup creado: $BACKUP_FILE"
    # Mantener solo los últimos 10 backups
    ls -t backups/iap_database_backup_*.db | tail -n +11 | xargs -r rm
else
    echo "⚠️  Base de datos no encontrada en servidor"
fi
ENDSSH

# Crear archivo temporal con archivos a excluir
echo -e "${YELLOW}📝 Preparando archivos a transferir...${NC}"
cat > /tmp/rsync_exclude.txt << 'EOF'
.git
.github
node_modules
frontend/node_modules
frontend/dist
__pycache__
*.pyc
venv
.env
.DS_Store
*.db
*.db-shm
*.db-wal
iap_database*.db
backups/
data/
migrations/
alembic/versions/*.py
EOF

# Sync código al servidor (EXCLUYENDO la base de datos)
echo -e "${YELLOW}📤 Sincronizando código al servidor...${NC}"
rsync -avz \
    --exclude-from=/tmp/rsync_exclude.txt \
    --delete \
    --progress \
    ./ "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"

# Limpiar archivo temporal
rm /tmp/rsync_exclude.txt

# Copiar archivo .env si no existe en servidor
echo -e "${YELLOW}🔑 Verificando .env en servidor...${NC}"
ssh "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
cd /srv/Elemental
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado en servidor"
    echo "📝 Crea el archivo .env con las variables necesarias"
    exit 1
fi
ENDSSH

# Deploy en el servidor
echo -e "${YELLOW}🚀 Ejecutando deployment en servidor...${NC}"
ssh "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
cd /srv/Elemental

echo "🛑 Deteniendo contenedores actuales..."
docker compose -f docker-compose.prod.yml down

echo "🔨 Construyendo nuevas imágenes..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Iniciando servicios..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Esperando que servicios estén listos..."
sleep 15

echo "📊 Estado de contenedores:"
docker compose -f docker-compose.prod.yml ps

echo "📋 Logs del backend:"
docker compose -f docker-compose.prod.yml logs --tail=30 backend

echo "📋 Logs del frontend:"
docker compose -f docker-compose.prod.yml logs --tail=30 frontend
ENDSSH

# Verificación final
echo ""
echo "=================================="
echo -e "${GREEN}✅ Deployment completado${NC}"
echo "=================================="
echo ""
echo "🌐 Aplicación disponible en:"
echo "   - https://elemental.jc2r.com"
echo "   - http://147.93.10.133"
echo ""
echo "📊 Comandos útiles para el servidor:"
echo "   - Conectar: ssh $SERVER_USER@$SERVER_HOST"
echo "   - Ver logs: cd $SERVER_PATH && docker compose -f docker-compose.prod.yml logs -f"
echo "   - Ver estado: cd $SERVER_PATH && docker compose -f docker-compose.prod.yml ps"
echo ""
echo -e "${GREEN}💾 Base de datos de producción NO fue modificada${NC}"
echo ""
