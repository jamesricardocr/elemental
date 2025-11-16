# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Descripción del Proyecto

**Nombre del Proyecto:** Ecoturismo Amazónico: Construcción participativa de una vitrina digital para la promoción del turismo de naturaleza y los saberes locales
**Código del Proyecto:** PAP_2025_36_18
**Institución:** SENA - Centro para la Biodiversidad y el Turismo del Amazonas, Regional Amazonas

Este es un proyecto de investigación enfocado en la cuantificación de biomasa y carbono almacenado en zonas priorizadas de la región amazónica. El proyecto involucra el establecimiento de parcelas temporales (0,1 hectáreas), georreferenciación, medición de especies arbóreas, recolección de datos de necromasa y vegetación herbácea, y aplicación de modelos alométricos para la estimación de carbono.

## Estructura del Repositorio

Este repositorio contiene documentación y datos del proyecto para actividades de investigación de campo:

- **Especificaciones Contractuales:**
  - [Especificaciones de contrato_investigadores.pdf](Especificaciones%20de%20contrato_investigadores.pdf) - Especificaciones del contrato de investigador experto en carbono con descripciones detalladas por fases
  - [Especificaciones de contrato_profesional_apoyo.pdf](Especificaciones%20de%20contrato_profesional_apoyo.pdf) - Especificaciones del contrato de profesional de apoyo

- **Documentación Metodológica:**
  - [Metodologia_Delimitacion_Poligonos_Comunitarios.docx](Metodologia_Delimitacion_Poligonos_Comunitarios.docx) - Metodología para la delimitación de polígonos comunitarios
  - [poligono_SENA.docx](poligono_SENA.docx) - Documentación de polígonos SENA

- **Datos de Campo:**
  - [Base de Datos puntos georeferenciados.xlsx](Base%20de%20Datos%20puntos%20georeferenciados.xlsx) - Base de datos de puntos georeferenciados (formato Excel)

## Actividades Principales de Investigación (9 Fases Mayores)

### 1. Establecimiento de Parcelas de 0,1 Hectáreas (20m × 50m)
- **Fase Preparatoria:** Planificación del muestreo, identificación de zonas prioritarias, selección de sitios según criterios de cobertura vegetal, accesibilidad y representatividad ecológica
- **Fase de Ejecución en Campo:** Delimitación de parcelas con cinta plástica, brújula y cinta métrica; marcación de vértices con estacas visibles; registro GPS del punto central y cada vértice
- **Fase de Análisis y Consolidación:** Digitalización de croquis y coordenadas en software SIG, generación de mapa preliminar con ubicación de parcelas

### 2. Georreferenciación de Parcelas Temporales
- **Sistema de Coordenadas:** Coordenadas UTM, datum WGS84
- **Ejecución en Campo:** Registro GPS del punto central y cuatro vértices (latitud, longitud, altitud, precisión); información complementaria como pendiente, tipo de cobertura, condiciones de visibilidad satelital
- **Integración SIG:** Creación de capas de puntos y polígonos que representan las parcelas, validación sobre mapas base o imágenes satelitales

### 3. Medición de Especies Arbóreas Perennes
- **Variables a Medir:** DAP (diámetro a la altura del pecho), altura total, especie, estado sanitario, posición en la parcela
- **Equipos:** Cinta diamétrica, hipsómetro, marcadores, GPS
- **Criterios:** Marcar y numerar todos los individuos arbóreos con DAP ≥ 10 cm; medir DAP a 1,3 m del suelo, evitando irregularidades o contrafuertes
- **Producto:** Base de datos estructurada por parcela, especie y variables dendrométricas

### 4. Censo de Necromasa
- **Muestreo:** Subparcelas (5m × 5m) dentro de cada unidad principal
- **Categorías:** Necromasa gruesa (troncos y ramas mayores de 10 cm) y fina (hojas, cortezas, ramas pequeñas)
- **Procesamiento en Laboratorio:** Secar material a 105°C hasta peso constante; calcular relación peso seco/peso fresco; extrapolar valores a toda la subparcela y estandarizar por hectárea

### 5. Censo de Vegetación Herbácea
- **Subparcelas:** Cuadrantes de 1m × 1m dentro de cada parcela principal
- **Procedimiento:** Cortar toda la vegetación herbácea dentro del cuadrante a ras del suelo; pesar biomasa fresca; tomar submuestra para secado
- **Integración:** Calcular biomasa seca por unidad de área, extrapolar a hectárea; incorporar al balance general de biomasa y carbono

### 6. Selección de Modelos Alométricos
- **Referencias:** Chave et al., IPCC, IDEAM para bosques húmedos tropicales o según tipo de vegetación
- **Variables de Entrada:** DAP, altura, densidad de la madera
- **Aplicación:** Calcular biomasa aérea y subterránea; para raíces, utilizar factores de conversión recomendados por IPCC
- **Pruebas de Validación:** Aplicar pruebas de consistencia y validación cruzada para elegir el modelo con mayor ajuste a condiciones locales
- **Factor de Carbono:** 0,47 (o según especie)

### 7. Socialización de Resultados
- **Materiales:** Mapas, gráficos, resúmenes interpretativos de resultados
- **Actividades:** Talleres participativos presentando métodos, valores de biomasa y carbono, importancia de la conservación
- **Producto:** Sistematización de observaciones y comentarios de participantes, conclusiones ajustadas según retroalimentación

### 8. Capacitación en Métodos y Técnicas de Campo
- **Contenidos:** Teóricos y prácticos sobre biomasa, carbono y metodologías de campo
- **Ejecución:** Sesiones presenciales en aula y campo sobre uso de equipos, toma de medidas, identificación de especies, registro de datos
- **Entregables:** Informe de capacitación con resultados, fotografías, lista de asistentes; material complementario (manuales, hojas de cálculo)

### 9. Descripción y Cuantificación Final
- **Integración:** Bases de datos de campo (árboles, necromasa, herbáceas)
- **Cálculos:** Valores de biomasa por componente y por parcela aplicando modelos alométricos seleccionados; conversión a carbono utilizando factores establecidos
- **Informe Final:** Documento técnico describiendo proceso metodológico, resultados y conclusiones; mapas temáticos, análisis comparativo, recomendaciones para manejo forestal sostenible

## Metodología de Cálculo de Biomasa y Carbono

### Componentes de Biomasa a Cuantificar

El proyecto calcula la biomasa total dividida en los siguientes componentes:

1. **Biomasa Aérea (Arbórea)**
   - Individuos con DAP ≥ 10 cm
   - Medición de DAP a 1,3 m del suelo
   - Medición de altura total
   - Identificación de especie para densidad de madera
   - Aplicación de ecuaciones alométricas específicas para bosques húmedos tropicales

2. **Biomasa Subterránea (Raíces)**
   - Calculada usando factores de conversión del IPCC
   - Estimada a partir de biomasa aérea
   - Factores diferenciados según tipo de vegetación

3. **Necromasa (Biomasa Muerta)**
   - **Necromasa gruesa:** Troncos y ramas > 10 cm de diámetro
   - **Necromasa fina:** Hojas, cortezas, ramas pequeñas
   - Medición en subparcelas de 5m × 5m
   - Pesaje en fresco y secado en laboratorio a 105°C hasta peso constante
   - Cálculo de relación peso seco/peso fresco
   - Extrapolación por hectárea

4. **Biomasa Herbácea**
   - Medición en cuadrantes de 1m × 1m
   - Corte a ras del suelo de toda vegetación herbácea
   - Pesaje de biomasa fresca
   - Secado en laboratorio para obtener peso seco
   - Extrapolación por hectárea

### Proceso de Cálculo

**Paso 1: Recopilación de Datos de Campo**
- Registro de variables dendrométricas (DAP, altura)
- Pesaje de biomasa fresca (necromasa, herbáceas)
- Recolección de submuestras para laboratorio

**Paso 2: Procesamiento en Laboratorio**
- Secado de muestras a 105°C hasta peso constante
- Determinación de relaciones peso seco/peso fresco
- Calibración de factores de conversión

**Paso 3: Aplicación de Modelos Alométricos**
- Selección de ecuaciones apropiadas (Chave et al., IPCC, IDEAM)
- Ingreso de variables: DAP, altura, densidad de madera
- Cálculo de biomasa aérea por individuo
- Estimación de biomasa subterránea usando factores IPCC
- Validación cruzada de resultados

**Paso 4: Cálculo de Área Basal**
- Cálculo del área basal por parcela
- Preparación de datos para modelos alométricos

**Paso 5: Conversión de Biomasa a Carbono**
- Aplicación del factor de carbono: **0,47** (o específico por especie)
- Fórmula: Carbono (toneladas) = Biomasa (toneladas) × 0,47
- Integración de todos los componentes (aéreo + subterráneo + necromasa + herbáceo)

**Paso 6: Estandarización por Hectárea**
- Extrapolación de valores de parcelas (0,1 ha) a hectárea
- Expresión de resultados en toneladas de carbono por hectárea (t C/ha)

**Paso 7: Análisis y Representación Espacial**
- Generación de tablas resumen por parcela
- Creación de mapas temáticos de distribución de carbono
- Análisis comparativo con estudios de referencia
- Gráficos de distribución por componentes

### Productos Esperados

- **Base de datos integrada** con todas las mediciones y cálculos
- **Mapas de distribución de carbono** por zona priorizada
- **Tablas de resultados** por parcela y por componente
- **Análisis estadístico** de biomasa y carbono almacenado
- **Informe técnico final** con metodología, resultados y recomendaciones

## Requisitos de Gestión de Datos

### Datos Georeferenciados
- Las coordenadas GPS deben usar proyección UTM con datum WGS84
- Registrar latitud, longitud, altitud y precisión para todos los puntos
- Documentar pendiente, tipo de cobertura y condiciones de campo

### Variables Medidas
- Mediciones de DAP a 1,3m de altura (evitando irregularidades)
- Altura total del árbol (usando hipsómetro o vara telescópica)
- Identificación de especie (nombres común y científico cuando sea posible)
- Estado sanitario y observaciones

### Control de Calidad
- Verificar consistencia de datos antes del procesamiento
- Revisar valores anómalos en planillas de campo
- Validar cruzadamente las posiciones GPS contra mapas base/imágenes satelitales

### Integración SIG
- Todos los datos espaciales deben ser compatibles con software SIG estándar
- Generar productos cartográficos con etiquetas, coordenadas y metadatos
- Mantener reproducibilidad para monitoreos futuros

## Requisitos de Confidencialidad

Según las obligaciones contractuales, toda la información generada durante el proyecto está sujeta a estricta confidencialidad:

- **Prohibido divulgar, reproducir o utilizar** información del proyecto sin autorización previa y escrita de SENA
- Aplica a resultados de investigación, bases de datos, creaciones, invenciones e información de terceros vinculada al Ecosistema de Innovación
- **Duración:** Durante la ejecución del contrato y por 2 años posteriores a su terminación
- **Excepciones:** Información de dominio público o cuando su revelación sea exigida por autoridad competente

## Coordinación y Colaboración

Este proyecto requiere coordinación entre equipos profesionales, técnicos, investigativos y comunitarios:

- Participar en jornadas colectivas y procesos de socialización
- Contribuir a la producción de herramientas y materiales orientados a la promoción del turismo de naturaleza y saberes locales
- Integrar hallazgos en la plataforma de vitrina digital
- Apoyar la supervisión de contratos cuando se delegue
- Coordinar tareas con los demás miembros del equipo

## Requisitos Administrativos

- Cumplir mensualmente con pagos de seguridad social en salud
- Pagar estampilla PROUNIVERSIDAD (1,5% del valor total del contrato)
- Entregar informes y soportes requeridos por SENA
- Realizar desplazamientos necesarios según plan de trabajo del proyecto
