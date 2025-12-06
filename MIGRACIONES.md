# Sistema de Migraciones Automáticas

Este proyecto usa **Alembic** para gestionar las migraciones de base de datos de forma automática.

## 🚀 Cómo Funciona en Producción

Cuando haces `git push` a la rama `main`:

1. **GitHub Actions** se activa automáticamente
2. Se construye la imagen Docker con los archivos de migración
3. Al iniciar el contenedor, se ejecuta `/app/scripts/run_migrations.sh`
4. El script aplica **automáticamente** todas las migraciones pendientes
5. Luego inicia la aplicación FastAPI

**✅ No necesitas hacer nada manualmente** - las migraciones se aplican solas.

## 📝 Crear una Nueva Migración

Cuando modificas un modelo en `src/models/`:

### Opción 1: Migración Automática (Recomendado)

```bash
# Genera automáticamente la migración detectando cambios
alembic revision --autogenerate -m "Descripción del cambio"
```

### Opción 2: Migración Manual

```bash
# Crea un archivo de migración vacío para editar manualmente
alembic revision -m "Descripción del cambio"
```

Luego edita el archivo generado en `alembic/versions/` y define las funciones `upgrade()` y `downgrade()`.

## 🔄 Comandos Útiles

```bash
# Ver historial de migraciones
alembic history

# Ver versión actual de la DB
alembic current

# Aplicar migraciones pendientes
alembic upgrade head

# Revertir última migración
alembic downgrade -1

# Ir a una versión específica
alembic upgrade <revision_id>
```

## 📁 Estructura de Archivos

```
IAP/
├── alembic/                  # Configuración de Alembic
│   ├── env.py               # Configuración del entorno
│   ├── script.py.mako       # Plantilla para migraciones
│   └── versions/            # Archivos de migración
│       └── 20251206_0230_initial_migration.py
├── alembic.ini              # Configuración principal
├── scripts/
│   └── run_migrations.sh    # Script de auto-migración
└── Dockerfile               # Ejecuta migraciones al inicio
```

## 🔧 Flujo de Desarrollo

### 1. Modificar un Modelo

```python
# src/models/arbol.py
class Arbol(Base):
    __tablename__ = "arboles"

    # Agregar nueva columna
    biomasa_calculada = Column(Float)  # NUEVA COLUMNA
```

### 2. Generar Migración

```bash
alembic revision --autogenerate -m "Add biomasa_calculada to arboles"
```

### 3. Revisar y Editar

Alembic genera un archivo en `alembic/versions/`. **Revísalo** para asegurar que detectó correctamente los cambios:

```python
def upgrade() -> None:
    op.add_column('arboles', sa.Column('biomasa_calculada', sa.Float(), nullable=True))

def downgrade() -> None:
    op.drop_column('arboles', 'biomasa_calculada')
```

### 4. Probar Localmente

```bash
alembic upgrade head
```

### 5. Commit y Push

```bash
git add alembic/versions/
git commit -m "feat: add biomasa_calculada column to arboles"
git push
```

**🎉 La migración se aplicará automáticamente en producción!**

## ⚠️ Advertencias Importantes

### NO Borrar la DB en Producción

El sistema de migraciones **mantiene los datos** mientras actualiza el schema.
**Nunca** ejecutes:

```bash
# ❌ NO HACER ESTO
ssh root@servidor "rm -rf /srv/Elemental/iap_database.db"
```

### Migraciones Irreversibles

Algunas operaciones no se pueden revertir fácilmente:

- Eliminar columnas con datos
- Cambiar tipos de datos incompatibles
- Renombrar tablas sin migración de datos

**Siempre prueba localmente primero.**

## 🐛 Solución de Problemas

### Error: "Can't locate revision identifier"

```bash
# Marca la DB con la versión actual (solo primera vez)
alembic stamp head
```

### Error: "Target database is not up to date"

```bash
# Aplica todas las migraciones pendientes
alembic upgrade head
```

### Ver Logs del Contenedor

```bash
ssh root@servidor
cd /srv/Elemental
docker compose logs -f backend
```

## 📚 Referencias

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [FastAPI + Alembic Tutorial](https://fastapi.tiangolo.com/tutorial/sql-databases/#alembic-note)

## 🎯 Resumen

✅ Las migraciones se ejecutan **automáticamente** en cada deployment
✅ Solo necesitas crear el archivo de migración y hacer `git push`
✅ Los datos se **preservan** durante las migraciones
✅ Sistema versionado y reversible
