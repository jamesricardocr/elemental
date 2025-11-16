#!/bin/bash

echo "🛑 Deteniendo servidores..."

# Matar procesos en puertos 8000 (backend) y 5173 (frontend)
lsof -ti:8000,5173 | xargs kill -9 2>/dev/null

echo "✅ Servidores detenidos"
