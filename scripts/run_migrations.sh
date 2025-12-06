#!/bin/bash
# Script de auto-migración para IAP
# Se ejecuta automáticamente al iniciar el contenedor Docker

set -e

echo "🔄 Verificando migraciones de base de datos..."

# Esperar a que la base de datos esté lista (si es necesario)
sleep 2

# Verificar si hay migraciones pendientes
PENDING=$(alembic current 2>&1 || echo "no_version")

if [[ "$PENDING" == *"no_version"* ]] || [[ "$PENDING" == *"Can't locate revision"* ]]; then
    echo "📋 No hay historial de migraciones. Ejecutando stamp head..."
    alembic stamp head || echo "⚠️  Stamp falló, probablemente es primera vez"
fi

# Aplicar migraciones pendientes
echo "⬆️  Aplicando migraciones..."
alembic upgrade head

if [ $? -eq 0 ]; then
    echo "✅ Migraciones aplicadas exitosamente"
else
    echo "❌ Error aplicando migraciones"
    exit 1
fi

# Mostrar versión actual
echo "📌 Versión actual de la base de datos:"
alembic current

echo "🚀 Base de datos lista. Iniciando aplicación..."
