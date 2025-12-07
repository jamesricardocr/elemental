#!/bin/bash

# Script de verificación de deployment
# Uso: ./scripts/verify_deployment.sh [local|remote]

MODE=${1:-local}

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=================================="
echo "🔍 Verificación de Deployment - Elemental"
echo "=================================="
echo ""

if [ "$MODE" = "remote" ]; then
    SERVER_USER="root"
    SERVER_HOST="147.93.10.133"

    echo -e "${YELLOW}📍 Modo: Servidor Remoto ($SERVER_HOST)${NC}"
    echo ""

    # Ejecutar verificaciones en servidor remoto
    ssh "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd /srv/Elemental

echo "1️⃣ Estado de Contenedores:"
echo "----------------------------"
docker compose -f docker-compose.prod.yml ps
echo ""

echo "2️⃣ Health Checks:"
echo "----------------------------"
BACKEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' elemental-backend 2>/dev/null || echo "no-healthcheck")
FRONTEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' elemental-frontend 2>/dev/null || echo "no-healthcheck")

if [ "$BACKEND_HEALTH" = "healthy" ]; then
    echo -e "${GREEN}✅ Backend: $BACKEND_HEALTH${NC}"
else
    echo -e "${RED}❌ Backend: $BACKEND_HEALTH${NC}"
fi

if [ "$FRONTEND_HEALTH" = "healthy" ]; then
    echo -e "${GREEN}✅ Frontend: $FRONTEND_HEALTH${NC}"
else
    echo -e "${RED}❌ Frontend: $FRONTEND_HEALTH${NC}"
fi
echo ""

echo "3️⃣ Uso de Recursos:"
echo "----------------------------"
echo "CPU y Memoria:"
docker stats --no-stream elemental-backend elemental-frontend --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
echo ""

echo "4️⃣ Verificación de Endpoints:"
echo "----------------------------"

# Test backend health
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Backend health endpoint: HTTP $BACKEND_STATUS${NC}"
    curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || echo "(JSON response)"
else
    echo -e "${RED}❌ Backend health endpoint: HTTP $BACKEND_STATUS${NC}"
fi
echo ""

# Test frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend: HTTP $FRONTEND_STATUS${NC}"
else
    echo -e "${RED}❌ Frontend: HTTP $FRONTEND_STATUS${NC}"
fi
echo ""

echo "5️⃣ Últimos Logs (10 líneas):"
echo "----------------------------"
echo "Backend:"
docker compose -f docker-compose.prod.yml logs --tail=10 backend
echo ""
echo "Frontend:"
docker compose -f docker-compose.prod.yml logs --tail=10 frontend
echo ""

echo "6️⃣ Información de Imágenes:"
echo "----------------------------"
docker images | grep elemental
echo ""

echo "7️⃣ Uso de Disco:"
echo "----------------------------"
docker system df
echo ""

ENDSSH

    # Verificaciones externas
    echo "8️⃣ Verificación Externa:"
    echo "----------------------------"

    EXTERNAL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m 10 http://147.93.10.133/ 2>/dev/null)
    if [ "$EXTERNAL_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Sitio accesible externamente: HTTP $EXTERNAL_STATUS${NC}"
    else
        echo -e "${RED}❌ Sitio NO accesible externamente: HTTP $EXTERNAL_STATUS${NC}"
    fi

    # Test con dominio si existe
    DOMAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m 10 https://elemental.jc2r.com/ 2>/dev/null)
    if [ "$DOMAIN_STATUS" = "200" ] || [ "$DOMAIN_STATUS" = "301" ] || [ "$DOMAIN_STATUS" = "302" ]; then
        echo -e "${GREEN}✅ Dominio accesible: HTTP $DOMAIN_STATUS${NC}"
    else
        echo -e "${YELLOW}⚠️  Dominio: HTTP $DOMAIN_STATUS (verificar DNS/SSL)${NC}"
    fi

else
    echo -e "${YELLOW}📍 Modo: Local${NC}"
    echo ""

    # Verificaciones locales
    cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

    echo "1️⃣ Estado de Contenedores:"
    echo "----------------------------"
    docker compose -f docker-compose.prod.yml ps
    echo ""

    echo "2️⃣ Health Checks:"
    echo "----------------------------"
    BACKEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' elemental-backend 2>/dev/null || echo "no-healthcheck")
    FRONTEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' elemental-frontend 2>/dev/null || echo "no-healthcheck")

    if [ "$BACKEND_HEALTH" = "healthy" ]; then
        echo -e "${GREEN}✅ Backend: $BACKEND_HEALTH${NC}"
    else
        echo -e "${RED}❌ Backend: $BACKEND_HEALTH${NC}"
    fi

    if [ "$FRONTEND_HEALTH" = "healthy" ]; then
        echo -e "${GREEN}✅ Frontend: $FRONTEND_HEALTH${NC}"
    else
        echo -e "${RED}❌ Frontend: $FRONTEND_HEALTH${NC}"
    fi
    echo ""

    echo "3️⃣ Uso de Recursos:"
    echo "----------------------------"
    docker stats --no-stream elemental-backend elemental-frontend --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    echo ""

    echo "4️⃣ Verificación de Endpoints:"
    echo "----------------------------"

    # Test backend
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health)
    if [ "$BACKEND_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Backend health endpoint: HTTP $BACKEND_STATUS${NC}"
        curl -s http://localhost:8001/health | python3 -m json.tool 2>/dev/null || echo "(JSON response)"
    else
        echo -e "${RED}❌ Backend health endpoint: HTTP $BACKEND_STATUS${NC}"
    fi
    echo ""

    # Test frontend
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
    if [ "$FRONTEND_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Frontend: HTTP $FRONTEND_STATUS${NC}"
    else
        echo -e "${RED}❌ Frontend: HTTP $FRONTEND_STATUS${NC}"
    fi
    echo ""

    echo "5️⃣ Últimos Logs (10 líneas):"
    echo "----------------------------"
    echo "Backend:"
    docker compose -f docker-compose.prod.yml logs --tail=10 backend
    echo ""
    echo "Frontend:"
    docker compose -f docker-compose.prod.yml logs --tail=10 frontend
    echo ""
fi

echo "=================================="
echo -e "${GREEN}✅ Verificación Completada${NC}"
echo "=================================="
echo ""
echo "💡 Comandos útiles:"
echo "   - Ver logs en vivo: docker compose -f docker-compose.prod.yml logs -f"
echo "   - Reiniciar servicio: docker compose -f docker-compose.prod.yml restart <servicio>"
echo "   - Ver métricas: docker stats"
echo ""
