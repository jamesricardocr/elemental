# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY src ./src
COPY config ./config
COPY migrations ./migrations
COPY init_db.py .
COPY load_puntos_referencia.py .

# Copiar configuración de Alembic
COPY alembic.ini .
COPY alembic ./alembic
COPY scripts ./scripts

# Dar permisos de ejecución al script de migraciones
RUN chmod +x /app/scripts/run_migrations.sh

# Exponer puerto
EXPOSE 8000

# Crear script de entrypoint que ejecute migraciones antes de iniciar
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Ejecutar migraciones\n\
/app/scripts/run_migrations.sh\n\
\n\
# Iniciar aplicación\n\
exec uvicorn src.api.main:app --host 0.0.0.0 --port 8000\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Comando de inicio
CMD ["/app/entrypoint.sh"]
