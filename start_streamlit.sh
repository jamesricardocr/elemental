#!/bin/bash

# Script LEGACY para levantar Backend API + Frontend Streamlit (Deprecated)
# NOTA: Usa ./start.sh para el frontend React moderno

echo "⚠️  ADVERTENCIA: Este es el frontend antiguo (Streamlit)"
echo "    Para el frontend moderno React, usa: ./start.sh"
echo ""
echo "🚀 Iniciando Sistema IAP - Streamlit + FastAPI..."
echo ""

# Activar entorno virtual
source venv/bin/activate

# Levantar API en segundo plano
echo "📡 Iniciando API Backend en http://localhost:8000..."
uvicorn src.api.main:app --reload &
API_PID=$!

# Esperar a que la API inicie
sleep 3

# Levantar Frontend Streamlit
echo "🎨 Iniciando Frontend Streamlit en http://localhost:8501..."
streamlit run src/ui/app.py

# Si se detiene el frontend, matar también la API
kill $API_PID
