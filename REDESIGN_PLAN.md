# 🎨 Plan de Rediseño - Sistema IAP con shadcn/ui

## 📋 Información del Proyecto

**Proyecto:** Sistema de Gestión de Biomasa y Carbono - IAP
**Cliente:** SENA - Centro para la Biodiversidad y el Turismo del Amazonas
**Objetivo:** Rediseño completo del frontend con shadcn/ui y nueva arquitectura de rutas

---

## 🎨 Identidad Visual

### Paleta de Colores

```css
/* Colores Principales */
--primary: #603eff        /* Botones y títulos principales */
--primary-foreground: #ffffff

/* Fondos */
--background: #1d1d1d     /* Fondo principal oscuro */
--card: #212121           /* Fondos de tarjetas (más claro) */
--popover: #212121

/* Texto */
--foreground: #ffffff
--muted-foreground: #a1a1aa

/* Bordes */
--border: #2a2a2a
--input: #2a2a2a

/* Acentos */
--accent: #603eff
--accent-foreground: #ffffff

/* Estados */
--success: #22c55e
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

### Logo
- **Archivo:** `JC2R_LOGO.svg`
- **Ubicación:** `/public/assets/logo/`
- **Uso:** Header, Login, Splash screen

---

## 🗺️ Nueva Arquitectura de Rutas

### Rutas Públicas
```
/                         → Landing/Login Page
/auth/login              → Página de inicio de sesión
```

### Rutas Protegidas (Dashboard)

#### 1. Dashboard Principal
```
/dashboard               → Vista general con estadísticas
```

#### 2. Gestión de Parcelas
```
/parcelas                → Lista de todas las parcelas (tabla + filtros)
/parcelas/nueva          → Formulario crear parcela manual
/parcelas/nueva/mapa     → Crear parcela interactiva en mapa
/parcelas/:id            → Detalle de parcela específica
/parcelas/:id/editar     → Editar información de parcela
```

#### 3. Gestión de Datos de Campo
```
/parcelas/:id/arboles              → Gestión de árboles
/parcelas/:id/necromasa            → Gestión de necromasa
/parcelas/:id/herbaceas            → Gestión de herbáceas
/parcelas/:id/calculos             → Cálculos de biomasa
/parcelas/:id/analisis-satelital   → Análisis satelital
```

#### 4. Mapas
```
/mapa                    → Vista de mapa general con todas las parcelas
/mapa/:id                → Mapa centrado en parcela específica
```

#### 5. Análisis y Reportes
```
/analisis                → Dashboard de análisis generales
/analisis/biomasa        → Análisis comparativo de biomasa
/analisis/carbono        → Análisis comparativo de carbono
/analisis/satelital      → Resumen de análisis satelitales
```

#### 6. Catálogos
```
/especies                → Gestión de especies
/puntos-referencia       → Gestión de puntos de referencia
```

#### 7. Configuración
```
/configuracion           → Ajustes generales
/configuracion/perfil    → Perfil de usuario
```

---

## 🧩 Componentes shadcn/ui Requeridos

### Instalación Base
```bash
npx shadcn-ui@latest init
```

### Componentes a Instalar

#### Layout & Navigation
- [ ] `accordion` - Para secciones expandibles en detalle de parcela
- [ ] `breadcrumb` - Para navegación jerárquica
- [ ] `navigation-menu` - Para menú principal
- [ ] `sidebar` - Para navegación lateral
- [ ] `tabs` - Para pestañas en detalle de parcela

#### Data Display
- [ ] `table` - Para todas las tablas de datos
- [ ] `card` - Para tarjetas de estadísticas y resultados
- [ ] `badge` - Para estados de parcelas
- [ ] `avatar` - Para perfil de usuario
- [ ] `separator` - Para divisores visuales
- [ ] `progress` - Para barras de progreso (análisis satelital)
- [ ] `chart` - Para gráficas (NDVI, EVI, Carbono)

#### Forms & Inputs
- [ ] `form` - Para todos los formularios
- [ ] `input` - Para campos de texto
- [ ] `textarea` - Para observaciones
- [ ] `select` - Para dropdowns (zona, especie, etc.)
- [ ] `combobox` - Para búsqueda de especies
- [ ] `checkbox` - Para opciones múltiples
- [ ] `radio-group` - Para selección única
- [ ] `slider` - Para rotación de parcela
- [ ] `switch` - Para toggle de opciones
- [ ] `calendar` - Para selección de fechas
- [ ] `date-picker` - Para fechas de establecimiento

#### Feedback
- [ ] `alert` - Para mensajes importantes
- [ ] `alert-dialog` - Para confirmaciones (eliminar)
- [ ] `dialog` - Para modales
- [ ] `toast` - Para notificaciones
- [ ] `skeleton` - Para loading states
- [ ] `spinner` - Para procesos

#### Utility
- [ ] `button` - Para todos los botones
- [ ] `dropdown-menu` - Para menús contextuales
- [ ] `popover` - Para información adicional
- [ ] `tooltip` - Para ayuda contextual (reemplaza info tooltips actuales)
- [ ] `scroll-area` - Para áreas con scroll
- [ ] `sheet` - Para paneles laterales

---

## 📦 Estructura de Carpetas Propuesta

```
frontend/
├── src/
│   ├── app/                          # App Router (si usamos Next.js) o Router config
│   │   └── routes.tsx
│   ├── components/
│   │   ├── ui/                       # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── layout/                   # Componentes de layout
│   │   │   ├── AppLayout.tsx         # Layout principal con sidebar
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   └── Footer.tsx
│   │   ├── parcelas/                 # Componentes específicos de parcelas
│   │   │   ├── ParcelaCard.tsx
│   │   │   ├── ParcelaTable.tsx
│   │   │   ├── ParcelaForm.tsx
│   │   │   ├── ParcelaMap.tsx
│   │   │   └── ParcelaStats.tsx
│   │   ├── arboles/                  # Componentes de árboles
│   │   │   ├── ArbolForm.tsx
│   │   │   ├── ArbolTable.tsx
│   │   │   └── ArbolStats.tsx
│   │   ├── necromasa/                # Componentes de necromasa
│   │   ├── herbaceas/                # Componentes de herbáceas
│   │   ├── calculos/                 # Componentes de cálculos
│   │   ├── satelital/                # Componentes de análisis satelital
│   │   │   ├── ConfiguracionForm.tsx
│   │   │   ├── ResultadosCard.tsx
│   │   │   ├── SerieTemporalChart.tsx
│   │   │   └── UploadCSV.tsx
│   │   ├── maps/                     # Componentes de mapas
│   │   │   ├── GoogleMap.tsx
│   │   │   ├── ParcelaPolygon.tsx
│   │   │   └── MarkerPuntoReferencia.tsx
│   │   └── shared/                   # Componentes compartidos
│   │       ├── StatCard.tsx
│   │       ├── DataTable.tsx
│   │       ├── FilterBar.tsx
│   │       └── EmptyState.tsx
│   ├── pages/                        # Páginas principales
│   │   ├── Dashboard.tsx
│   │   ├── parcelas/
│   │   │   ├── ParcelasPage.tsx
│   │   │   ├── ParcelaDetallePage.tsx
│   │   │   ├── NuevaParcelaPage.tsx
│   │   │   ├── EditarParcelaPage.tsx
│   │   │   ├── ArbolesPage.tsx
│   │   │   ├── NecromasaPage.tsx
│   │   │   ├── HerbaceasPage.tsx
│   │   │   ├── CalculosPage.tsx
│   │   │   └── AnalisisSatelitalPage.tsx
│   │   ├── MapaPage.tsx
│   │   ├── analisis/
│   │   │   ├── AnalisisPage.tsx
│   │   │   ├── BiomasaPage.tsx
│   │   │   ├── CarbonoPage.tsx
│   │   │   └── SatelitalPage.tsx
│   │   ├── especies/
│   │   │   └── EspeciesPage.tsx
│   │   ├── puntos-referencia/
│   │   │   └── PuntosReferenciaPage.tsx
│   │   └── configuracion/
│   │       ├── ConfiguracionPage.tsx
│   │       └── PerfilPage.tsx
│   ├── lib/                          # Utilidades y helpers
│   │   ├── utils.ts                  # cn() y otras utilidades
│   │   ├── api.ts                    # Cliente API
│   │   ├── constants.ts              # Constantes
│   │   └── validators.ts             # Validaciones
│   ├── hooks/                        # Custom hooks
│   │   ├── useApi.ts
│   │   ├── useParcelas.ts
│   │   ├── useFilters.ts
│   │   └── useToast.ts
│   ├── types/                        # TypeScript types
│   │   ├── parcela.ts
│   │   ├── arbol.ts
│   │   ├── calculo.ts
│   │   └── index.ts
│   ├── styles/                       # Estilos globales
│   │   └── globals.css
│   └── main.tsx                      # Entry point
├── public/
│   └── assets/
│       └── logo/
│           └── JC2R_LOGO.svg
└── package.json
```

---

## 🚀 Plan de Acción por Fases

### **FASE 1: Configuración Inicial** (2-3 días)

#### Día 1: Setup del Proyecto
- [ ] Instalar shadcn/ui y configurar tema oscuro
- [ ] Configurar Tailwind con colores personalizados
- [ ] Instalar todos los componentes shadcn necesarios
- [ ] Configurar TypeScript (opcional pero recomendado)
- [ ] Configurar React Router v6 con nuevas rutas
- [ ] Agregar logo JC2R_LOGO.svg

#### Día 2: Componentes Base
- [ ] Crear AppLayout con Sidebar
- [ ] Crear Header con navegación
- [ ] Crear Breadcrumbs
- [ ] Configurar tema oscuro (#1d1d1d, #212121, #603eff)
- [ ] Crear componentes base (StatCard, DataTable, etc.)

#### Día 3: Sistema de Navegación
- [ ] Implementar todas las rutas definidas
- [ ] Crear layout protegido con autenticación (placeholder)
- [ ] Configurar navegación entre rutas
- [ ] Testing de navegación

---

### **FASE 2: Dashboard y Vistas Generales** (3-4 días)

#### Día 4-5: Dashboard Principal
- [ ] Página `/dashboard`
- [ ] Tarjetas de estadísticas generales
  - Total parcelas
  - Parcelas activas/completadas/inactivas
  - Área total monitoreada
  - Carbono total almacenado
- [ ] Gráficas de resumen
  - Parcelas por zona (pie chart)
  - Carbono por parcela (bar chart)
  - Tendencia temporal (line chart)
- [ ] Accesos rápidos a funciones principales

#### Día 6-7: Lista de Parcelas
- [ ] Página `/parcelas`
- [ ] Tabla con shadcn Table component
  - Código, Nombre, Zona, Coordenadas, Estado, Acciones
  - Paginación
  - Ordenamiento
  - Búsqueda en tiempo real
- [ ] Barra de filtros (zona, estado)
- [ ] Badges de estado con colores
- [ ] Botones de acción: Ver, Editar, Eliminar, Satelital
- [ ] Modal de confirmación para eliminar

---

### **FASE 3: Gestión de Parcelas** (5-6 días)

#### Día 8-9: Crear Parcela Manual
- [ ] Página `/parcelas/nueva`
- [ ] Formulario con shadcn Form
  - Todos los campos del formulario actual
  - Validación con zod o yup
  - Select para zona priorizada
  - Date picker para fecha
  - Radio group para tipo de cobertura
  - Switch para generar vértices automáticos
- [ ] Preview de coordenadas UTM calculadas
- [ ] Botón guardar con loading state
- [ ] Toast de confirmación

#### Día 10-11: Crear Parcela Interactiva
- [ ] Página `/parcelas/nueva/mapa`
- [ ] Stepper con 3 pasos (shadcn)
  1. Seleccionar punto de referencia
  2. Posicionar en mapa
  3. Confirmar
- [ ] Integración Google Maps
- [ ] Control de rotación con Slider
- [ ] Visualización en tiempo real del polígono
- [ ] Botones: Atrás, Siguiente, Guardar

#### Día 12-13: Detalle de Parcela
- [ ] Página `/parcelas/:id`
- [ ] Tabs con shadcn Tabs component
  - Información General
  - Árboles
  - Necromasa
  - Herbáceas
  - Cálculos
  - Análisis Satelital
- [ ] Tab Información General:
  - Card con datos básicos
  - Mapa pequeño con ubicación
  - Coordenadas de vértices
  - Botón editar
- [ ] Breadcrumbs: Dashboard > Parcelas > {código}

---

### **FASE 4: Gestión de Datos de Campo** (6-7 días)

#### Día 14-15: Gestión de Árboles
- [ ] Página `/parcelas/:id/arboles`
- [ ] Cards con estadísticas (total, DAP promedio, altura promedio, área basal)
- [ ] Formulario de creación
  - Input numérico para DAP
  - Input numérico para altura
  - Combobox para especie (con búsqueda)
  - Select para estado sanitario
- [ ] Tabla de árboles
  - Columnas: #, DAP, Altura, Especie, Estado, Área Basal, Acciones
  - Acción: Eliminar con confirmación
- [ ] Empty state si no hay árboles

#### Día 16-17: Gestión de Necromasa
- [ ] Página `/parcelas/:id/necromasa`
- [ ] Alert informativo con protocolo
- [ ] Cards con estadísticas
- [ ] Formulario de creación
  - Input para número de subparcela
  - Radio group para tipo (gruesa/fina)
  - Inputs para pesos
- [ ] Tabla de necromasa
- [ ] Cálculo automático de relación PS/PF

#### Día 18-19: Gestión de Herbáceas
- [ ] Página `/parcelas/:id/herbaceas`
- [ ] Alert informativo con protocolo
- [ ] Cards con estadísticas
- [ ] Formulario de creación
  - Input para número de cuadrante
  - Slider para cobertura (%)
  - Inputs para pesos
- [ ] Tabla de herbáceas

#### Día 20: Especies (Catálogo)
- [ ] Página `/especies`
- [ ] Tabla de especies
  - Nombre científico
  - Nombre común
  - Densidad de madera
  - Acciones
- [ ] Dialog para crear nueva especie
- [ ] Búsqueda y filtrado

---

### **FASE 5: Cálculos de Biomasa** (3-4 días)

#### Día 21-22: Página de Cálculos
- [ ] Página `/parcelas/:id/calculos`
- [ ] Card de configuración
  - Select para modelo alométrico
  - Slider para factor de carbono
  - Botón ejecutar cálculo con loading
- [ ] Card de resultado principal (último cálculo)
  - 6 tarjetas con resultados
  - Destacar Carbono Total
  - Botón descargar PDF/Excel
- [ ] Tabla de historial de cálculos
  - Fecha, Modelo, Resultados, Acciones
  - Ver detalle de cálculo anterior

#### Día 23-24: Análisis Comparativo
- [ ] Página `/analisis/biomasa`
- [ ] Comparación entre parcelas
  - Bar chart comparativo
  - Tabla de ranking
  - Filtros por zona
- [ ] Página `/analisis/carbono`
- [ ] Métricas agregadas

---

### **FASE 6: Análisis Satelital** (5-6 días)

#### Día 25-26: Configuración y Creación
- [ ] Página `/parcelas/:id/analisis-satelital`
- [ ] Card de configuración
  - Select para período predefinido
  - Date picker para período personalizado
  - Select para modelo de estimación
  - Input para factor de carbono
  - Alert con información de tiempo estimado
- [ ] Botón "Iniciar Análisis" con estados:
  - Normal
  - Loading (procesando)
  - Completado

#### Día 27-28: Flujo de Upload CSV
- [ ] Estado "Esperando CSV"
  - Card con instrucciones numeradas
  - Link a NASA AppEEARS
  - Upload área con drag & drop
  - Preview del archivo seleccionado
  - Botón "Procesar CSV"
- [ ] Progress bar durante procesamiento
- [ ] Toast de éxito/error

#### Día 29-30: Resultados y Visualización
- [ ] Estado "Completado"
  - 4 Cards con resultados (NDVI, EVI, Biomasa, Carbono)
  - Tooltips con información (mantener actuales)
  - Cards con hover effects
- [ ] Gráfica de serie temporal
  - Chart component (Recharts o Chart.js)
  - Toggle NDVI/EVI
  - Zoom y pan
  - Download como imagen
- [ ] Tabla de datos
  - Fecha, NDVI, EVI, Biomasa, Carbono
  - Export a CSV
- [ ] Botón "Nuevo Análisis"

#### Día 31: Historial de Análisis
- [ ] Lista lateral con análisis previos
  - Badge de estado
  - Fecha
  - Preview de resultados
- [ ] Click para ver detalle
- [ ] Dialog para eliminar análisis

---

### **FASE 7: Mapas** (3-4 días)

#### Día 32-33: Vista de Mapa General
- [ ] Página `/mapa`
- [ ] Google Maps integrado
- [ ] Panel lateral con lista de parcelas
  - Filtros (zona, estado)
  - Lista scrolleable
  - Click para centrar en mapa
- [ ] Polígonos de parcelas
  - Colores por estado
  - Click para ver info
  - Hover para resaltar
- [ ] Marcadores de puntos de referencia
- [ ] Controles de mapa
  - Zoom
  - Tipo de mapa (satelital, híbrido, roadmap)
  - Fullscreen

#### Día 34-35: Mapa de Parcela Individual
- [ ] Página `/mapa/:id`
- [ ] Mapa centrado en parcela
- [ ] Card flotante con información
- [ ] Botón "Ver Detalle"
- [ ] Vértices numerados
- [ ] Medidas (20m × 50m)

---

### **FASE 8: Puntos de Referencia** (2 días)

#### Día 36-37: Gestión de Puntos
- [ ] Página `/puntos-referencia`
- [ ] Tabla de puntos
  - Nombre, Zona, Coordenadas, Acciones
- [ ] Filtro por zona
- [ ] Dialog para crear/editar punto
- [ ] Visualización en mapa pequeño

---

### **FASE 9: Configuración y Perfil** (2 días)

#### Día 38: Configuración General
- [ ] Página `/configuracion`
- [ ] Cards con configuraciones
  - Factor de carbono por defecto
  - Modelo alométrico preferido
  - Zona por defecto
  - Unidades de medida
- [ ] Botón guardar

#### Día 39: Perfil de Usuario
- [ ] Página `/configuracion/perfil`
- [ ] Avatar upload
- [ ] Formulario de datos personales
- [ ] Cambio de contraseña

---

### **FASE 10: Pulido y Testing** (3-4 días)

#### Día 40-41: Responsive Design
- [ ] Revisar todas las páginas en mobile
- [ ] Ajustar sidebar para mobile (Sheet component)
- [ ] Ajustar tablas (scroll horizontal)
- [ ] Ajustar formularios
- [ ] Testing en tablets

#### Día 42: Accesibilidad
- [ ] Añadir aria-labels
- [ ] Navegación por teclado
- [ ] Focus visible
- [ ] Alt text en imágenes
- [ ] Contraste de colores (WCAG AA)

#### Día 43: Performance
- [ ] Lazy loading de rutas
- [ ] Optimización de imágenes
- [ ] Code splitting
- [ ] Memoización de componentes pesados
- [ ] Virtual scrolling en tablas grandes

---

### **FASE 11: Migración de Datos** (2 días)

#### Día 44-45: Migración
- [ ] Verificar compatibilidad API
- [ ] Testing de integración
- [ ] Migración de estilos restantes
- [ ] Verificar todos los endpoints
- [ ] Testing end-to-end de flujos completos

---

## 📊 Componentes Clave a Crear

### 1. StatCard Component
```tsx
// Tarjeta de estadística reutilizable
<StatCard
  title="Total Parcelas"
  value={125}
  change="+12%"
  trend="up"
  icon={<TreeIcon />}
/>
```

### 2. DataTable Component
```tsx
// Tabla de datos genérica con paginación, ordenamiento y filtros
<DataTable
  columns={columns}
  data={parcelas}
  searchable
  filterable
  sortable
  pagination
/>
```

### 3. FilterBar Component
```tsx
// Barra de filtros reutilizable
<FilterBar
  filters={[
    { type: 'select', name: 'zona', options: zonas },
    { type: 'select', name: 'estado', options: estados }
  ]}
  onFilterChange={handleFilterChange}
/>
```

### 4. SerieTemporalChart Component
```tsx
// Gráfica de serie temporal
<SerieTemporalChart
  data={serieTemporal}
  xKey="fecha"
  yKeys={['ndvi', 'evi']}
  colors={['#22c55e', '#3b82f6']}
/>
```

---

## 🎯 Criterios de Éxito

### Funcionalidad
- [ ] Todas las funcionalidades actuales migradas
- [ ] Todas las rutas funcionando correctamente
- [ ] Integración completa con API backend
- [ ] Formularios con validación robusta
- [ ] Manejo de errores apropiado

### UX/UI
- [ ] Interfaz consistente en todas las páginas
- [ ] Navegación intuitiva
- [ ] Feedback visual en todas las acciones
- [ ] Loading states apropiados
- [ ] Mensajes de error claros
- [ ] Responsive en mobile y tablet

### Performance
- [ ] Tiempo de carga inicial < 3s
- [ ] Interacciones fluidas (60 fps)
- [ ] Tablas con paginación eficiente
- [ ] Lazy loading implementado

### Código
- [ ] Componentes reutilizables
- [ ] Código limpio y documentado
- [ ] TypeScript sin errores (si se usa)
- [ ] Consistencia en estilos

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18+** - Framework UI
- **React Router v6** - Navegación
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilos
- **TypeScript** (opcional) - Type safety
- **Recharts** o **Chart.js** - Gráficas
- **Google Maps API** - Mapas
- **Zod** o **Yup** - Validación de formularios
- **React Hook Form** - Gestión de formularios
- **Tanstack Query** (React Query) - Gestión de estado servidor (opcional)

### Backend (sin cambios)
- **FastAPI** - Framework API
- **SQLAlchemy** - ORM
- **SQLite** - Base de datos
- **NASA AppEEARS API** - Datos satelitales

---

## 📝 Notas Importantes

### Compatibilidad
- Mantener 100% de compatibilidad con API actual
- No cambiar endpoints ni estructura de datos
- Solo cambiar frontend

### Datos Existentes
- Toda la información actual debe ser visible en nuevo diseño
- No perder funcionalidades existentes
- Mejorar experiencia de usuario

### Prioridades
1. **Funcionalidad:** Todas las características actuales
2. **Navegación:** Sistema de rutas claro
3. **Diseño:** Interfaz oscura con #603eff
4. **Performance:** Carga rápida y fluida
5. **Mobile:** Responsive design

---

## 🚦 Siguiente Paso

**Comenzar con FASE 1 - Configuración Inicial**

1. Instalar shadcn/ui
2. Configurar tema oscuro personalizado
3. Crear estructura de carpetas
4. Configurar rutas básicas

¿Listo para comenzar? 🚀
