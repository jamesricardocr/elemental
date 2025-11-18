# Guía del Usuario - Sistema Elemental

## ¿Qué es Elemental?

**Elemental** es una plataforma digital diseñada para **medir, monitorear y cuantificar el carbono almacenado en los bosques amazónicos**. El sistema permite a investigadores, técnicos y comunidades locales realizar inventarios forestales científicos y estimar cuánto carbono están capturando sus bosques.

---

## ¿Para qué sirve?

### Objetivos principales:

1. **Cuantificar carbono almacenado** en áreas forestales específicas
2. **Documentar la biodiversidad** vegetal de la región amazónica
3. **Monitorear el estado de los bosques** mediante imágenes satelitales
4. **Generar evidencia científica** para proyectos de conservación y REDD+
5. **Fortalecer capacidades locales** en medición forestal

---

## ¿Cómo funciona el sistema?

### El proceso completo en 4 pasos:

```
1. ESTABLECER PARCELAS
   ↓
2. MEDIR EL BOSQUE
   ↓
3. CALCULAR BIOMASA Y CARBONO
   ↓
4. MONITOREAR CON SATÉLITES
```

---

## 1. Establecimiento de Parcelas

### ¿Qué es una parcela?

Una parcela es un **área rectangular de 0.1 hectáreas** (20 metros × 50 metros) que se delimita en el bosque para hacer mediciones científicas. Es como tomar una "muestra" representativa del bosque.

### ¿Cómo se establece una parcela?

**En campo:**
1. Seleccionar un sitio representativo del tipo de bosque
2. Marcar un rectángulo de 20m × 50m usando cinta métrica y brújula
3. Colocar estacas en los 4 vértices (esquinas)
4. Tomar coordenadas GPS de cada vértice y del centro
5. Registrar información del sitio: pendiente, tipo de vegetación, accesibilidad

**En el sistema:**
1. Ir a **"Mapa"** o **"Parcelas"**
2. Clic en **"Nueva Parcela"**
3. Completar información básica:
   - **Código único**: Identificador (ej: "P01-Patruyeros")
   - **Nombre**: Descriptivo (ej: "Bosque primario de terra firme")
   - **Zona**: Ubicación general (ej: "Patruyeros")
   - **Fecha de establecimiento**: Día en que se marcó
4. **Georreferenciación** (2 opciones):
   - **Opción A - Manual**: Escribir coordenadas del GPS
   - **Opción B - Mapa**: Hacer clic en el mapa donde está la parcela
5. Registrar las coordenadas de los 4 vértices
6. Agregar observaciones sobre el sitio

### ¿Qué información se registra?

- **Ubicación exacta**: Latitud, longitud, altitud
- **Coordenadas UTM**: Sistema métrico de coordenadas
- **Pendiente**: Inclinación del terreno en grados
- **Tipo de cobertura**: Bosque primario, secundario, etc.
- **Accesibilidad**: Fácil, moderada, difícil
- **Responsable**: Persona que estableció la parcela

---

## 2. Medición del Bosque

### A. Inventario de Árboles

**¿Qué se mide?**

Todos los árboles con **diámetro igual o mayor a 10 cm** medido a 1.3 metros de altura (altura del pecho de una persona adulta).

**Variables que se registran:**

1. **DAP (Diámetro a la Altura del Pecho)**
   - Se mide a 1.3 metros del suelo
   - Se usa cinta diamétrica o cinta métrica
   - Unidad: centímetros
   - ¿Por qué es importante? El diámetro está directamente relacionado con la cantidad de madera (y carbono) que tiene el árbol

2. **Altura Total**
   - Desde el suelo hasta la punta más alta
   - Se mide con hipsómetro o vara telescópica
   - Unidad: metros
   - ¿Por qué es importante? Los árboles más altos tienen más biomasa

3. **Especie**
   - Nombre común local (ej: "Cedro", "Caoba amazónica")
   - Nombre científico si se conoce (ej: "Cedrela odorata")
   - ¿Por qué es importante? Cada especie tiene diferente densidad de madera, lo que afecta el cálculo de carbono

4. **Estado Sanitario**
   - Sano, enfermo, muerto en pie, etc.
   - ¿Por qué es importante? Indica la salud del bosque

5. **Posición en la parcela**
   - Coordenadas X, Y dentro de la parcela (opcional)
   - Permite mapear la distribución de árboles

**En el sistema:**
1. Seleccionar la parcela
2. Ir a la pestaña **"Árboles"**
3. Clic en **"Agregar Árbol"**
4. Completar datos de cada árbol medido
5. Repetir para todos los árboles de la parcela

### B. Medición de Necromasa (Biomasa Muerta)

**¿Qué es la necromasa?**

Es toda la materia orgánica muerta en el bosque:
- Troncos caídos
- Ramas gruesas en el suelo
- Hojas secas
- Corteza desprendida

**¿Por qué es importante?**

La necromasa también almacena carbono y es parte importante del ciclo de nutrientes del bosque.

**¿Cómo se mide?**

1. **Delimitación de subparcelas**:
   - Se marcan cuadrantes de 5m × 5m dentro de la parcela principal
   - Generalmente 3-5 subparcelas distribuidas sistemáticamente

2. **Categorías**:
   - **Necromasa gruesa**: Troncos y ramas > 10 cm de diámetro
   - **Necromasa fina**: Hojarasca, ramitas, cortezas

3. **Procedimiento**:
   - Recolectar TODO el material muerto dentro de la subparcela
   - Pesar en fresco (en campo)
   - Llevar muestra al laboratorio
   - Secar en horno a 105°C hasta peso constante
   - Pesar en seco
   - Calcular relación peso seco / peso fresco

4. **Cálculo**:
   - Se extrapola el peso seco de la subparcela a toda la hectárea
   - Resultado: toneladas de necromasa por hectárea

**En el sistema:**
1. Seleccionar la parcela
2. Ir a pestaña **"Necromasa"**
3. Agregar cada subparcela medida
4. Registrar pesos frescos y secos
5. El sistema calcula automáticamente la extrapolación

### C. Censo de Vegetación Herbácea

**¿Qué se mide?**

Toda la vegetación baja del bosque:
- Hierbas
- Helechos
- Plántulas pequeñas
- Musgos

**¿Cómo se mide?**

1. **Delimitación de cuadrantes**:
   - Marcos de 1m × 1m
   - Generalmente 5-10 cuadrantes por parcela

2. **Procedimiento**:
   - Cortar TODA la vegetación dentro del cuadrante a ras del suelo
   - Pesar biomasa fresca
   - Llevar muestra al laboratorio
   - Secar y pesar
   - Calcular relación peso seco / peso fresco

3. **Cálculo**:
   - Extrapolar a hectárea
   - Resultado: toneladas de biomasa herbácea por hectárea

**En el sistema:**
1. Seleccionar la parcela
2. Ir a pestaña **"Herbáceas"**
3. Registrar cada cuadrante
4. Ingresar pesos frescos y secos

---

## 3. Cálculos de Biomasa y Carbono

### ¿Cómo se calcula el carbono almacenado?

El sistema usa **ecuaciones alométricas**, que son fórmulas matemáticas desarrolladas por científicos que relacionan las medidas de los árboles (diámetro y altura) con la cantidad de biomasa.

### Paso a paso del cálculo:

#### **Paso 1: Calcular Biomasa Aérea (lo que está sobre el suelo)**

Para cada árbol se usa la ecuación de Chave et al. (2014):

```
Biomasa del árbol = 0.0673 × (Densidad × Diámetro² × Altura)^0.976
```

**Ejemplo práctico:**
- Árbol de **cedro**
- Diámetro: 40 cm
- Altura: 25 metros
- Densidad de madera del cedro: 0.60 g/cm³

```
Biomasa = 0.0673 × (0.60 × 40² × 25)^0.976
Biomasa = 0.0673 × (24,000)^0.976
Biomasa ≈ 1,247 kg = 1.25 toneladas
```

Luego se suma la biomasa de TODOS los árboles de la parcela y se extrapola a hectárea (multiplicar × 10 porque la parcela es 0.1 ha).

#### **Paso 2: Calcular Biomasa Subterránea (raíces)**

Las raíces no se pueden medir directamente, entonces se estiman usando un factor del IPCC:

```
Biomasa de raíces = Biomasa aérea × 0.24
```

Es decir, las raíces representan aproximadamente el 24% de lo que vemos arriba.

**Ejemplo:**
- Biomasa aérea: 250 toneladas/ha
- Biomasa de raíces: 250 × 0.24 = 60 toneladas/ha

#### **Paso 3: Sumar todos los componentes**

```
BIOMASA TOTAL = Biomasa Aérea + Biomasa Raíces + Necromasa + Herbáceas
```

**Ejemplo completo:**
- Biomasa aérea (árboles): 250 t/ha
- Biomasa subterránea (raíces): 60 t/ha
- Necromasa: 15 t/ha
- Herbáceas: 2 t/ha
- **TOTAL: 327 t/ha**

#### **Paso 4: Convertir Biomasa a Carbono**

Aproximadamente el **47% de la biomasa es carbono**, entonces:

```
CARBONO = Biomasa Total × 0.47
```

**Ejemplo:**
- Biomasa total: 327 t/ha
- Carbono almacenado: 327 × 0.47 = **153.7 toneladas de carbono por hectárea**

### ¿Qué significa este resultado?

**153.7 toneladas de carbono por hectárea** significa que:

1. Si ese bosque se deforesta, liberaría 153.7 toneladas de carbono a la atmósfera
2. Para convertir a CO₂ (el gas de efecto invernadero), se multiplica × 3.67:
   - 153.7 × 3.67 = **564 toneladas de CO₂ por hectárea**
3. Eso equivale aproximadamente a las emisiones de **122 vehículos** durante un año
4. Para proyectos REDD+, ese carbono puede tener un valor económico de conservación

### En el sistema:

1. Ir a pestaña **"Cálculos"**
2. Clic en **"Calcular Biomasa y Carbono"**
3. El sistema automáticamente:
   - Aplica ecuaciones alométricas a cada árbol
   - Suma biomasa de raíces
   - Integra necromasa y herbáceas
   - Calcula carbono total
   - Genera resumen consolidado

---

## 4. Monitoreo Satelital

### ¿Para qué sirve el monitoreo satelital?

Permite **vigilar la salud del bosque a lo largo del tiempo** sin necesidad de ir al campo constantemente. Los satélites captan imágenes que indican qué tan "verde" y saludable está la vegetación.

### Índices que se usan:

#### **NDVI (Índice de Vegetación de Diferencia Normalizada)**

**¿Qué mide?**
La "verdor" del bosque. Valores más altos = vegetación más densa y saludable.

**Interpretación:**
- **0.8 - 1.0**: Vegetación MUY densa (bosque primario maduro)
- **0.6 - 0.8**: Vegetación densa (bosque secundario avanzado)
- **0.4 - 0.6**: Vegetación moderada (cultivos, pastizales)
- **0.2 - 0.4**: Vegetación dispersa (áreas degradadas)
- **< 0.2**: Suelo desnudo o agua

**Ejemplo práctico:**
- NDVI de 0.85 en enero de 2023
- NDVI de 0.62 en enero de 2024
- **Interpretación**: El bosque perdió densidad, posible degradación o tala selectiva

#### **EVI (Índice de Vegetación Mejorado)**

**¿Qué mide?**
Similar al NDVI pero **optimizado para bosques tropicales muy densos**. Es más sensible a cambios sutiles en la vegetación.

**¿Por qué usar ambos?**
- NDVI puede "saturarse" en bosques muy densos
- EVI detecta mejor cambios en bosques amazónicos
- Usarlos juntos da mejor diagnóstico

### ¿Cómo se obtienen los datos satelitales?

#### **Opción 1: Solicitar a NASA**

El sistema se conecta automáticamente con la plataforma **NASA AppEEARS** que proporciona datos del satélite **MODIS**.

**Proceso:**
1. Seleccionar parcela
2. Ir a pestaña **"Satelital"**
3. Clic en **"Nuevo Análisis NASA"**
4. Configurar:
   - **Fecha inicio**: Ejemplo, 1 de enero de 2020
   - **Fecha fin**: Ejemplo, 31 de diciembre de 2024
   - **Productos**: MOD13Q1 (índices de vegetación cada 16 días)
   - **Índices**: NDVI y EVI
5. Enviar solicitud
6. Esperar 5-15 minutos mientras NASA procesa
7. El sistema descarga automáticamente los resultados
8. Se genera gráfico de serie temporal

**¿Qué se obtiene?**
Un gráfico que muestra cómo ha variado el NDVI y EVI de tu parcela durante el período seleccionado.

#### **Opción 2: Cargar archivo CSV**

Si ya descargaste datos de NASA manualmente, puedes subirlos directamente.

**Proceso:**
1. Ir a pestaña **"Satelital"**
2. Clic en **"Cargar CSV"**
3. Seleccionar archivo CSV
4. El sistema detecta automáticamente el formato
5. Muestra resultados inmediatamente

**Formatos soportados:**

**Formato 1 - Statistics:**
```csv
File Name,Date,Mean
MOD13Q1.061_250m_aid0001.csv,2020-01-01,0.8743
MOD13Q1.061_250m_aid0001.csv,2020-01-17,0.8615
```

**Formato 2 - Results:**
```csv
Fecha,NDVI,EVI,Biomasa,Carbono
2020-01-01,0.8743,0.6592,245.3,115.3
2020-01-17,0.8615,0.6421,238.1,111.9
```

### ¿Cómo interpretar los resultados?

#### **Serie temporal estable:**
```
NDVI: 0.85 → 0.86 → 0.84 → 0.85 → 0.86
```
**Interpretación**: Bosque saludable y estable, sin cambios significativos.

#### **Tendencia decreciente:**
```
NDVI: 0.85 → 0.78 → 0.71 → 0.65 → 0.58
```
**Interpretación**: Degradación progresiva, posible tala selectiva o estrés hídrico. **Alerta temprana**.

#### **Caída abrupta:**
```
NDVI: 0.85 → 0.85 → 0.23 → 0.21 → 0.19
```
**Interpretación**: Deforestación, el bosque fue talado. **Pérdida total**.

#### **Recuperación:**
```
NDVI: 0.45 → 0.52 → 0.61 → 0.68 → 0.74
```
**Interpretación**: Regeneración natural o reforestación exitosa. **Tendencia positiva**.

### Relación entre índices satelitales y carbono

El sistema también **estima la biomasa y carbono** a partir de los índices satelitales usando modelos calibrados:

```
Biomasa estimada = 500 × NDVI² - 150 × NDVI + 50
```

**Ejemplo:**
- NDVI = 0.85
- Biomasa estimada = 500 × (0.85)² - 150 × 0.85 + 50
- Biomasa estimada ≈ **245 toneladas/ha**
- Carbono estimado ≈ 245 × 0.47 = **115 toneladas C/ha**

**⚠️ Importante:**
Estas estimaciones satelitales son **aproximadas**. Para valores precisos siempre se debe hacer medición en campo.

### ¿Con qué frecuencia llegan datos nuevos?

- **MODIS MOD13Q1**: Cada 16 días
- **Periodo cubierto**: Desde el año 2000 hasta la actualidad
- **Resolución espacial**: 250 metros × 250 metros

---

## 5. Gestión de Especies

### ¿Para qué sirve el catálogo de especies?

Permite mantener una **base de datos de todas las especies arbóreas** encontradas en las parcelas, con información ecológica y propiedades físicas esenciales para los cálculos.

### Información registrada por especie:

1. **Nombre común**: Nombre local (ej: "Cedro", "Caoba")
2. **Nombre científico**: Nombre botánico (ej: "Cedrela odorata")
3. **Familia**: Familia botánica (ej: "Meliaceae")
4. **Densidad de la madera**: Peso específico en g/cm³
   - Maderas pesadas: > 0.70 g/cm³ (ej: Tahuarí = 0.90)
   - Maderas medianas: 0.40 - 0.70 g/cm³ (ej: Cedro = 0.60)
   - Maderas livianas: < 0.40 g/cm³ (ej: Cetico = 0.35)
5. **Factor de carbono**: Proporción de carbono en la biomasa (generalmente 0.47)
6. **Distribución**: Dónde se encuentra en la Amazonía
7. **Usos**: Usos tradicionales o comerciales
8. **Observaciones**: Características especiales

### ¿Por qué es importante la densidad de madera?

**La densidad es CRÍTICA para calcular correctamente el carbono.**

Dos árboles del mismo tamaño pueden tener diferente cantidad de biomasa:

**Ejemplo:**
- **Árbol A - Tahuarí (densidad 0.90)**
  - DAP: 40 cm, Altura: 25 m
  - Biomasa: **1,687 kg**

- **Árbol B - Cetico (densidad 0.35)**
  - DAP: 40 cm, Altura: 25 m
  - Biomasa: **656 kg**

El Tahuarí tiene **2.5 veces más biomasa** que el Cetico aunque sean del mismo tamaño, porque su madera es mucho más densa.

### En el sistema:

1. Ir a **"Especies"**
2. Ver listado completo de especies registradas
3. **Agregar nueva especie**:
   - Clic en "Nueva Especie"
   - Completar información
   - **Importante**: Buscar la densidad de madera en bases de datos científicas (ej: Global Wood Density Database)
4. **Consultar especie**:
   - Buscar por nombre común o científico
   - Ver todas sus propiedades

---

## 6. Puntos de Referencia

### ¿Qué son los puntos de referencia?

Son **ubicaciones importantes** georeferenciadas en la región de estudio:
- Ecolodges y hospedajes
- Senderos interpretativos
- Puntos de observación de fauna
- Miradores
- Zonas de muestreo
- Comunidades
- Estaciones de monitoreo

### ¿Para qué sirven?

1. **Contextualizar las parcelas** dentro del paisaje
2. **Planificar trabajo de campo** (accesibilidad, distancias)
3. **Integrar con actividades de ecoturismo**
4. **Documentar saberes locales** asociados a sitios específicos
5. **Crear mapas temáticos** de la región

### Información de cada punto:

- **Zona**: Área general (ej: "Patruyeros", "Santa Sofía")
- **Nombre**: Identificador del punto
- **Descripción**: Qué hay en ese lugar
- **Coordenadas**: Latitud y longitud
- **Fuente**: Cómo se obtuvo (GPS manual, GPX, etc.)

### Formas de agregar puntos:

#### **Opción 1: Manual con mapa interactivo**

1. Ir a **"Mapa"**
2. Clic en **"Crear Punto de Referencia"**
3. Seleccionar zona
4. Ingresar nombre y descripción
5. **Ubicar en mapa**:
   - Hacer clic en el mapa donde está el punto
   - O arrastrar el marcador
   - Las coordenadas se llenan automáticamente
6. Guardar

#### **Opción 2: Manual con coordenadas GPS**

1. Mismo proceso pero en vez de usar el mapa
2. Cambiar a modo "Manual"
3. Escribir latitud y longitud directamente
4. Guardar

#### **Opción 3: Importación masiva desde GPX**

Si tienes archivos GPX de GPS de campo, puedes importar decenas de puntos de una vez.

**Proceso:**
1. Colocar archivos `.gpx` en la carpeta `data/raw/`
2. Ejecutar script de importación:
   ```bash
   python scripts/import_gpx.py
   ```
3. El script:
   - Lee todos los waypoints de los archivos GPX
   - Extrae coordenadas, nombres, descripciones
   - Detecta duplicados
   - Importa a la base de datos
   - Muestra resumen

**Ejemplo de salida:**
```
Importando desde Patruyeros_2024.gpx...
  → Importados 59 waypoints a zona 'Patruyeros'

Importando desde Santa_Sofia.gpx...
  → Importados 9 waypoints a zona 'Santa Sofía'

TOTAL: 68 puntos importados
```

### En el mapa:

- Los puntos se muestran como **marcadores** en el mapa
- Puedes **filtrar por zona** para ver solo puntos de un área
- Al hacer clic en un marcador se muestra su información
- Diferentes colores según la zona

---

## 7. Visualización de Datos

### Dashboard Principal

El dashboard muestra un **resumen consolidado** de todo el proyecto:

#### **Métricas clave:**
- 📊 **Total de parcelas**: Cuántas parcelas están registradas
- 🌳 **Total de árboles**: Cuántos individuos inventariados
- 🌿 **Biomasa total**: Suma de biomasa de todas las parcelas (toneladas)
- 🌍 **Carbono total**: Suma de carbono almacenado (toneladas de C)

#### **Gráficos:**
- **Distribución de biomasa por parcela**: Barras comparativas
- **Distribución de carbono por parcela**: Barras comparativas
- **Distribución por componentes**: Cuánto aporta cada componente (aéreo, raíces, necromasa, herbáceas)
- **Top 10 especies**: Especies más abundantes o con más biomasa

### Mapas Temáticos

#### **Mapa de ubicación de parcelas:**
- Muestra todas las parcelas en el mapa
- Color/tamaño según cantidad de carbono
- Clic para ver detalle de cada parcela

#### **Mapa de puntos de referencia:**
- Muestra zonas y puntos importantes
- Diferentes íconos según tipo de punto
- Filtros por zona

#### **Mapa de cobertura:**
- Distribución espacial de tipos de bosque
- Áreas prioritarias para conservación

### Gráficos de Serie Temporal

**Para cada análisis satelital:**
- **Gráfico de líneas** mostrando evolución de NDVI/EVI
- **Período completo** seleccionado
- **Puntos de datos** cada 16 días
- **Tooltips informativos**: Al pasar el mouse se muestra fecha y valor exacto
- **Leyenda clara** con rangos de interpretación

**Ejemplo de visualización:**
```
NDVI a lo largo del tiempo
1.0 ┤
    ┤        ●●●●●●●
0.8 ┤    ●●●        ●●●
    ┤  ●●              ●●
0.6 ┤●●                  ●●
    └────────────────────────
    2020  2021  2022  2023
```

### Tablas de Datos

**Tablas detalladas para:**
- Listado de árboles por parcela
- Mediciones de necromasa
- Mediciones de herbáceas
- Historial de análisis satelitales
- Catálogo de especies

**Funciones:**
- Ordenar por cualquier columna
- Buscar/filtrar datos
- Exportar a CSV
- Ver detalles de cada registro

---

## 8. Casos de Uso Prácticos

### Caso 1: Proyecto REDD+ (Reducción de Emisiones por Deforestación y Degradación)

**Objetivo**: Demostrar cuánto carbono se conserva al proteger un área de bosque.

**Proceso:**
1. Establecer 10-20 parcelas distribuidas en el área del proyecto
2. Realizar inventario completo en cada parcela
3. Calcular carbono almacenado por parcela
4. Extrapolar al área total del proyecto
5. Monitorear con satélites mensualmente
6. Generar reportes anuales de carbono conservado

**Resultado esperado**:
"El proyecto conserva 50,000 hectáreas de bosque con un promedio de 150 tC/ha, equivalente a 7,500,000 toneladas de carbono (27,525,000 toneladas de CO₂)."

### Caso 2: Evaluación de Impacto de Tala Selectiva

**Objetivo**: Cuantificar cuánto carbono se pierde con tala selectiva.

**Proceso:**
1. Establecer parcelas ANTES de la tala
2. Medir biomasa inicial
3. Realizar tala selectiva (ej: solo árboles > 60 cm DAP de especies comerciales)
4. Medir biomasa DESPUÉS de la tala
5. Comparar resultados
6. Monitorear recuperación con satélites

**Resultado esperado**:
"La tala selectiva de cedro y caoba redujo el carbono almacenado de 160 tC/ha a 125 tC/ha (pérdida de 22%). Los datos satelitales muestran que el NDVI cayó de 0.85 a 0.68."

### Caso 3: Monitoreo de Regeneración Natural

**Objetivo**: Documentar la recuperación de un área degradada.

**Proceso:**
1. Establecer parcelas en área degradada
2. Medir biomasa inicial (generalmente baja)
3. Dejar regenerar naturalmente
4. Medir cada 1-2 años
5. Monitorear con satélites continuamente
6. Cuantificar tasa de captura de carbono

**Resultado esperado**:
"El bosque secundario está capturando 5 toneladas de carbono por hectárea al año. En 10 años pasó de 30 tC/ha a 80 tC/ha."

### Caso 4: Valoración de Servicios Ecosistémicos para Ecoturismo

**Objetivo**: Demostrar el valor del bosque para actividades de ecoturismo.

**Proceso:**
1. Establecer parcelas en senderos turísticos
2. Documentar especies carismáticas (árboles gigantes, especies raras)
3. Calcular carbono almacenado
4. Crear mapas temáticos para visitantes
5. Integrar puntos de referencia de ecolodges y miradores
6. Generar material interpretativo

**Resultado esperado**:
"El sendero 'Gigantes del Bosque' conserva 200 tC/ha y protege 5 especies de árboles maderables en peligro. El valor de conservación es superior al valor de extracción."

### Caso 5: Fortalecimiento de Capacidades Comunitarias

**Objetivo**: Capacitar a comunidades locales en monitoreo forestal.

**Proceso:**
1. Capacitación en establecimiento de parcelas
2. Capacitación en medición de DAP y altura
3. Uso del sistema para registrar datos
4. Interpretación de resultados satelitales
5. Generación de reportes para autoridades
6. Toma de decisiones sobre manejo

**Resultado esperado**:
"La comunidad de Patruyeros ahora monitorea 15 parcelas permanentes y genera reportes trimestrales de salud del bosque usando datos satelitales."

---

## 9. Interpretación de Resultados

### ¿Qué es un "buen" valor de carbono?

**Contexto amazónico:**

- **Bosque primario maduro**: 120-200 tC/ha
- **Bosque secundario avanzado (30-50 años)**: 80-120 tC/ha
- **Bosque secundario joven (10-20 años)**: 30-80 tC/ha
- **Vegetación pionera (< 10 años)**: 10-30 tC/ha
- **Área degradada**: < 10 tC/ha

**Tu parcela tiene 153 tC/ha:**
✅ Es un bosque primario maduro en excelente estado de conservación.

**Tu parcela tiene 45 tC/ha:**
⚠️ Es un bosque secundario en recuperación o ha sufrido degradación.

**Tu parcela tiene 8 tC/ha:**
❌ Área muy degradada, casi sin cobertura forestal.

### ¿Cómo saber si mi bosque está sano?

**Indicadores de bosque saludable:**

1. **NDVI > 0.75** (vegetación muy densa)
2. **NDVI estable** en el tiempo (sin tendencia decreciente)
3. **Carbono > 120 tC/ha** (alta biomasa)
4. **Alta diversidad de especies** (muchas especies diferentes)
5. **Árboles grandes** (DAP > 50 cm) presentes
6. **Baja mortalidad** (pocos árboles muertos en pie)

**Señales de alerta:**

1. **NDVI decreciente** en serie temporal
2. **Caída de biomasa** entre mediciones
3. **Aumento de necromasa** sin caída de árboles naturales (evidencia de tala)
4. **Disminución de especies** (pérdida de biodiversidad)
5. **EVI/NDVI muy diferentes** (posible estrés hídrico)

### Conversión a equivalentes comprensibles

**¿Cómo explicar 150 toneladas de carbono?**

**En términos de CO₂:**
- 150 tC/ha × 3.67 = **550 toneladas de CO₂**

**Equivalente a:**
- Emisiones de **119 autos** durante un año
- **454,545 km** recorridos en auto
- Consumo eléctrico de **77 hogares** durante un año
- **1,375 vuelos** ida y vuelta Leticia-Bogotá

**En términos forestales:**
- Necesitarías plantar **3,000 árboles** para capturar eso en 10 años

**En términos económicos:**
- A USD $10 por tonelada de CO₂ (precio REDD+), esa hectárea vale **$5,500 USD** en carbono conservado

---

## 10. Recomendaciones de Uso

### Para obtener mejores resultados:

1. **Establecer suficientes parcelas**:
   - Mínimo 10 parcelas para representar variabilidad del bosque
   - Distribuir en diferentes tipos de cobertura
   - Incluir gradiente de altitud si aplica

2. **Medir con precisión**:
   - Calibrar equipos regularmente
   - Medir DAP siempre a 1.3m (usar cinta marcada)
   - Evitar medir sobre raíces tablares o irregularidades
   - Tomar altura en árboles representativos (al menos 30%)

3. **Identificar especies correctamente**:
   - Trabajar con botánico local cuando sea posible
   - Tomar fotos de corteza, hojas, flores, frutos
   - Recolectar muestras para herbario
   - Buscar densidades de madera en bases de datos científicas

4. **Monitorear regularmente**:
   - Revisar datos satelitales mensualmente
   - Remediciones en campo cada 1-2 años
   - Documentar cualquier evento (tala, incendio, etc.)

5. **Documentar todo**:
   - Tomar fotos de las parcelas
   - Registrar observaciones cualitativas
   - Marcar parcelas permanentemente para poder regresar
   - Hacer croquis de ubicación de árboles grandes

### Errores comunes a evitar:

❌ **Medir árboles < 10 cm DAP**: Genera sobrecarga de trabajo sin aportar mucho al cálculo de carbono

❌ **No registrar especie**: Sin especie no hay densidad de madera, el cálculo será impreciso

❌ **Parcelas en sitios no representativos**: Evitar poner todas las parcelas cerca del camino o en un solo tipo de bosque

❌ **No verificar coordenadas GPS**: Siempre verificar que las coordenadas tengan buena precisión (< 5 metros de error)

❌ **Confundir peso fresco con peso seco**: La necromasa y herbáceas DEBEN pesarse en seco para ser precisas

❌ **No monitorear después de la línea base**: El monitoreo continuo es lo que da valor al proyecto

---

## 11. Preguntas Frecuentes

### ¿Cuántas parcelas necesito?

Depende del área total y la variabilidad del bosque:
- **Área pequeña (< 100 ha)**: 5-10 parcelas
- **Área mediana (100-1000 ha)**: 10-20 parcelas
- **Área grande (> 1000 ha)**: 20-50 parcelas

### ¿Cada cuánto debo medir?

- **Línea base**: Medición inicial completa
- **Monitoreo satelital**: Continuo (automático cada 16 días)
- **Remediciones en campo**: Cada 1-2 años para bosques estables, cada 6 meses para bosques en regeneración

### ¿Qué hago si no conozco la especie del árbol?

1. Tomar foto detallada de corteza y hojas
2. Asignar código temporal (ej: "Desconocida-01")
3. Usar densidad promedio para bosques amazónicos (0.60 g/cm³)
4. Identificar posteriormente con ayuda de experto
5. Actualizar la información en el sistema

### ¿Los datos satelitales reemplazan las mediciones de campo?

**NO**. Los satélites son complementarios:
- **Mediciones de campo**: Precisas pero costosas y limitadas en área
- **Datos satelitales**: Aproximados pero continuos y cubren toda el área

Lo ideal es combinar ambos.

### ¿Puedo usar este sistema para otros tipos de vegetación?

Sí, con ajustes:
- **Manglares**: Usar ecuaciones alométricas específicas
- **Páramos**: Adaptar tamaño de cuadrantes para herbáceas
- **Bosques andinos**: Usar densidades de madera de bases de datos andinas
- **Sabanas**: Enfoque en herbáceas más que en árboles

### ¿Cómo exporto los datos?

Desde cada tabla puedes exportar a CSV (Excel) para análisis externos.

### ¿Se pueden comparar parcelas de diferentes proyectos?

Sí, siempre que se hayan usado las mismas metodologías. Los protocolos están estandarizados según IPCC.

---

## Glosario de Términos

**Biomasa**: Cantidad total de materia orgánica viva o muerta en un área. Se mide en toneladas por hectárea (t/ha).

**Carbono almacenado**: Cantidad de carbono contenido en la biomasa. Aproximadamente el 47% de la biomasa.

**DAP**: Diámetro a la Altura del Pecho. Se mide a 1.3 metros del suelo.

**Ecuación alométrica**: Fórmula matemática que relaciona dimensiones del árbol (DAP, altura) con su biomasa.

**EVI**: Enhanced Vegetation Index (Índice de Vegetación Mejorado). Optimizado para áreas de alta biomasa.

**Hectárea**: Unidad de superficie = 10,000 m². Un campo de fútbol son aproximadamente 0.7 hectáreas.

**IPCC**: Panel Intergubernamental de Cambio Climático. Desarrolla protocolos estandarizados.

**MODIS**: Sensor satelital de NASA que captura imágenes de la Tierra cada 1-2 días.

**NDVI**: Normalized Difference Vegetation Index (Índice de Vegetación de Diferencia Normalizada).

**Necromasa**: Biomasa muerta (troncos caídos, hojarasca, etc.).

**Parcela**: Área delimitada para realizar mediciones científicas. En este proyecto: 20m × 50m = 0.1 ha.

**REDD+**: Reducción de Emisiones por Deforestación y Degradación. Mecanismo para valorar económicamente la conservación de bosques.

**Serie temporal**: Secuencia de datos tomados a lo largo del tiempo.

**Tonelada de carbono (tC)**: Unidad de medida. 1 tC = 3.67 toneladas de CO₂.

**UTM**: Universal Transverse Mercator. Sistema de coordenadas en metros.

---

**¿Necesitas más ayuda?**

Esta guía cubre los aspectos fundamentales del sistema. Para dudas específicas consulta con el equipo técnico del proyecto o revisa la documentación técnica en `README.md`.
