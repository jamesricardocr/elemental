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

# Exponer puerto
EXPOSE 8000

# Comando de inicio
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
