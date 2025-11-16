# CI/CD Setup con GitHub Actions

## Configuración del Servidor (solo una vez)

### 1. Conectarse al servidor y configurar

```bash
ssh root@147.93.10.133

# Instalar dependencias
apt update && apt upgrade -y
apt install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx

# Crear directorio
mkdir -p /srv/Elemental
cd /srv/Elemental

# Configurar .env
nano .env
```

Contenido del `.env`:
```
DATABASE_URL=sqlite:///./iap_database.db
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=tu-clave-secreta-de-32-caracteres-minimo
GOOGLE_MAPS_API_KEY=tu_api_key_google_maps
```

### 2. Configurar systemd service

```bash
nano /etc/systemd/system/iap-backend.service
```

```ini
[Unit]
Description=IAP Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/srv/Elemental
Environment="PATH=/srv/Elemental/venv/bin"
ExecStart=/srv/Elemental/venv/bin/uvicorn src.api.main:app --host 0.0.0.0 --port 8000
Restart=always
StandardOutput=append:/var/log/iap-backend.log
StandardError=append:/var/log/iap-backend-error.log

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable iap-backend
```

### 3. Configurar nginx

```bash
nano /etc/nginx/sites-available/iap
```

```nginx
server {
    listen 80;
    server_name TU_DOMINIO.com;

    client_max_body_size 50M;

    location / {
        root /srv/Elemental/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/iap /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# SSL (opcional pero recomendado)
certbot --nginx -d TU_DOMINIO.com
```

## Configuración de GitHub

### 1. Generar clave SSH

```bash
# En tu máquina local
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Copiar clave pública al servidor
ssh-copy-id -i ~/.ssh/github_actions.pub root@147.93.10.133

# Ver clave privada (para GitHub Secrets)
cat ~/.ssh/github_actions
```

### 2. Agregar Secrets en GitHub

Ve a tu repositorio → Settings → Secrets and variables → Actions → New repository secret

Crea estos 3 secrets:

- `SERVER_HOST`: `147.93.10.133`
- `SERVER_USER`: `root`
- `SSH_PRIVATE_KEY`: (pega el contenido de `~/.ssh/github_actions`)

## Deployment Automático

Ahora cada vez que hagas push a `main`:

```bash
git add .
git commit -m "feat: tu cambio"
git push origin main
```

GitHub Actions automáticamente:
1. ✅ Construye el frontend
2. ✅ Sube archivos al servidor
3. ✅ Instala dependencias Python
4. ✅ Ejecuta migraciones
5. ✅ Reinicia servicios

## Ver logs del deployment

Ve a tu repo en GitHub → Actions → verás el progreso del deployment

## Comandos útiles en el servidor

```bash
# Ver logs backend
tail -f /var/log/iap-backend.log

# Ver estado servicios
systemctl status iap-backend nginx

# Reiniciar manualmente
systemctl restart iap-backend
systemctl reload nginx
```
