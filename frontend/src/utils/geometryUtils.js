/**
 * Utilidades para cálculos geométricos y de parcelas
 */

/**
 * Calcula la distancia entre dos puntos en metros usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lng1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lng2 - Longitud del segundo punto
 * @returns {number} Distancia en metros
 */
export function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371000 // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Calcula un punto destino dados origen, distancia y ángulo
 * @param {number} lat - Latitud origen
 * @param {number} lng - Longitud origen
 * @param {number} distancia - Distancia en metros
 * @param {number} angulo - Ángulo en grados (0 = Norte, 90 = Este)
 * @returns {{lat: number, lng: number}} Punto destino
 */
export function calcularPuntoDestino(lat, lng, distancia, angulo) {
  const R = 6371000 // Radio de la Tierra en metros
  const δ = distancia / R // Distancia angular
  const θ = (angulo * Math.PI) / 180 // Ángulo en radianes

  const φ1 = (lat * Math.PI) / 180
  const λ1 = (lng * Math.PI) / 180

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) +
    Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  )

  const λ2 = λ1 + Math.atan2(
    Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
    Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
  )

  return {
    lat: (φ2 * 180) / Math.PI,
    lng: (λ2 * 180) / Math.PI
  }
}

/**
 * Calcula los vértices de un rectángulo de 0.1 hectáreas (20m × 50m)
 * @param {number} centroLat - Latitud del centro
 * @param {number} centroLng - Longitud del centro
 * @param {number} rotacion - Ángulo de rotación en grados (0 = Norte)
 * @returns {Array<{lat: number, lng: number}>} Array de 4 vértices [NW, NE, SE, SW]
 */
export function calcularVerticesParcela(centroLat, centroLng, rotacion = 0) {
  const ANCHO = 20 // metros
  const LARGO = 50 // metros

  // Distancia del centro a las esquinas
  const mitadAncho = ANCHO / 2
  const mitadLargo = LARGO / 2

  // Calcular las 4 esquinas relativas al centro
  // Esquina Noroeste (NW)
  const nw = calcularPuntoDestino(
    centroLat,
    centroLng,
    Math.sqrt(mitadAncho ** 2 + mitadLargo ** 2),
    rotacion + Math.atan2(mitadAncho, mitadLargo) * (180 / Math.PI)
  )

  // Esquina Noreste (NE)
  const ne = calcularPuntoDestino(
    centroLat,
    centroLng,
    Math.sqrt(mitadAncho ** 2 + mitadLargo ** 2),
    rotacion + Math.atan2(-mitadAncho, mitadLargo) * (180 / Math.PI)
  )

  // Esquina Sureste (SE)
  const se = calcularPuntoDestino(
    centroLat,
    centroLng,
    Math.sqrt(mitadAncho ** 2 + mitadLargo ** 2),
    rotacion + Math.atan2(-mitadAncho, -mitadLargo) * (180 / Math.PI)
  )

  // Esquina Suroeste (SW)
  const sw = calcularPuntoDestino(
    centroLat,
    centroLng,
    Math.sqrt(mitadAncho ** 2 + mitadLargo ** 2),
    rotacion + Math.atan2(mitadAncho, -mitadLargo) * (180 / Math.PI)
  )

  return [nw, ne, se, sw]
}

/**
 * Valida si un punto está dentro de un radio determinado desde el origen
 * @param {number} origenLat - Latitud del origen
 * @param {number} origenLng - Longitud del origen
 * @param {number} puntoLat - Latitud del punto a validar
 * @param {number} puntoLng - Longitud del punto a validar
 * @param {number} radioMaximo - Radio máximo en metros
 * @returns {boolean} True si está dentro del radio
 */
export function estaDentroDelRadio(origenLat, origenLng, puntoLat, puntoLng, radioMaximo) {
  const distancia = calcularDistancia(origenLat, origenLng, puntoLat, puntoLng)
  return distancia <= radioMaximo
}

/**
 * Limita un punto para que esté dentro de un radio desde el origen
 * @param {number} origenLat - Latitud del origen
 * @param {number} origenLng - Longitud del origen
 * @param {number} puntoLat - Latitud del punto
 * @param {number} puntoLng - Longitud del punto
 * @param {number} radioMaximo - Radio máximo en metros
 * @returns {{lat: number, lng: number}} Punto ajustado
 */
export function limitarAlRadio(origenLat, origenLng, puntoLat, puntoLng, radioMaximo) {
  const distancia = calcularDistancia(origenLat, origenLng, puntoLat, puntoLng)

  if (distancia <= radioMaximo) {
    return { lat: puntoLat, lng: puntoLng }
  }

  // Calcular el ángulo desde el origen al punto
  const dLat = puntoLat - origenLat
  const dLng = puntoLng - origenLng
  const angulo = Math.atan2(dLng, dLat) * (180 / Math.PI)

  // Calcular nuevo punto en el borde del radio
  return calcularPuntoDestino(origenLat, origenLng, radioMaximo, angulo)
}

/**
 * Formatea coordenadas para mostrar
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {string} Coordenadas formateadas
 */
export function formatearCoordenadas(lat, lng) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

/**
 * Calcula el área de un polígono en hectáreas
 * @param {Array<{lat: number, lng: number}>} vertices - Vértices del polígono
 * @returns {number} Área en hectáreas
 */
export function calcularAreaPoligono(vertices) {
  if (vertices.length < 3) return 0

  // Usar la fórmula de área de polígono en coordenadas esféricas
  const R = 6371000 // Radio de la Tierra en metros
  let area = 0

  for (let i = 0; i < vertices.length; i++) {
    const p1 = vertices[i]
    const p2 = vertices[(i + 1) % vertices.length]

    const lat1 = p1.lat * Math.PI / 180
    const lat2 = p2.lat * Math.PI / 180
    const lng1 = p1.lng * Math.PI / 180
    const lng2 = p2.lng * Math.PI / 180

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2))
  }

  area = Math.abs(area * R * R / 2)

  // Convertir de m² a hectáreas
  return area / 10000
}
