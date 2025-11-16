#!/bin/bash

# Script para levantar API Backend (FastAPI) + Frontend (React)

echo "🚀 Iniciando Sistema de Gestión de Biomasa y Carbono - IAP"
echo "=================================================="
echo ""

# Activar entorno virtual de Python
echo "🐍 Activando entorno virtual Python..."
source venv/bin/activate

# Ejecutar migraciones pendientes (si las hay)
echo "📊 Verificando migraciones de base de datos..."
if [ -f "migrations/add_calculos_satelitales.py" ]; then
    python3 migrations/add_calculos_satelitales.py 2>/dev/null || echo "   Migración ya ejecutada o no necesaria"
fi
echo ""

# Levantar API Backend en segundo plano
echo "📡 Iniciando API Backend (FastAPI) en http://localhost:8000..."
uvicorn src.api.main:app --reload &
API_PID=$!

# Esperar a que la API inicie
echo "⏳ Esperando a que la API inicie..."
sleep 3

# Levantar Frontend React
echo ""
echo "⚛️  Iniciando Frontend React en http://localhost:3000..."
echo "=================================================="
echo ""
cd frontend
npm run dev

# Si se detiene el Frontend (Ctrl+C), matar también la API
echo ""
echo "🛑 Deteniendo servicios..."
kill $API_PID
echo "✅ Servicios detenidos"
