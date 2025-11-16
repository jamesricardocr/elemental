import { useEffect, useRef, useState } from 'react'
import { calcularVerticesParcela, calcularDistancia, limitarAlRadio, calcularPuntoDestino } from '../utils/geometryUtils'
import './MapViewInteractivo.css'

const GOOGLE_MAPS_API_KEY = 'AIzaSyBs2LGBZyfVdHUuAZlNJpF-SydBHAwdb_k'
const RADIO_MAXIMO = 100 // metros

function MapViewInteractivo({
  puntosReferencia = [],
  puntoReferencia = null,
  posicionParcela = null,
  rotacion = 0,
  modo = 'seleccion', // 'seleccion' | 'posicionar' | 'confirmacion'
  onPosicionActualizada = () => {},
  onRotacionActualizada = () => {},
  onConfirmar = () => {},
  onVolver = () => {}
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const puntosMarkersRef = useRef([])
  const parcelaPolygonRef = useRef(null)
  const parcelaCenterMarkerRef = useRef(null)
  const radioCircleRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [distanciaActual, setDistanciaActual] = useState(0)
  const [anguloActual, setAnguloActual] = useState(0)

  // Inicializar mapa
  useEffect(() => {
    const initializeMap = () => {
      if (mapRef.current && !mapInstanceRef.current && window.google && window.google.maps) {
        try {
          const centerLat = puntoReferencia?.latitud || puntosReferencia[0]?.latitud || -4.2156
          const centerLng = puntoReferencia?.longitud || puntosReferencia[0]?.longitud || -69.9406

          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: centerLat, lng: centerLng },
            zoom: puntoReferencia ? 17 : 14,
            mapTypeId: 'satellite',
            mapTypeControl: true,
            fullscreenControl: true,
            streetViewControl: false,
            zoomControl: true,
            zoomControlOptions: {
              position: window.google.maps.ControlPosition.RIGHT_CENTER
            }
          })

          setMapLoaded(true)
        } catch (error) {
          console.error('Error creando mapa:', error)
        }
      }
    }

    if (window.google && window.google.maps) {
      initializeMap()
    } else {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval)
          initializeMap()
        }
      }, 100)

      const timeout = setTimeout(() => {
        clearInterval(checkInterval)
      }, 10000)

      return () => {
        clearInterval(checkInterval)
        clearTimeout(timeout)
      }
    }
  }, [])

  // Mostrar puntos de referencia
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google) return

    // Limpiar marcadores anteriores
    puntosMarkersRef.current.forEach(marker => marker.setMap(null))
    puntosMarkersRef.current = []

    puntosReferencia.forEach(punto => {
      if (!punto.latitud || !punto.longitud) return

      const position = { lat: punto.latitud, lng: punto.longitud }
      const isSelected = puntoReferencia && punto.id === puntoReferencia.id

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: punto.nombre || 'Punto de Referencia',
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: isSelected ? 7 : 5,
          fillColor: isSelected ? '#FF0000' : '#FF6B6B',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: isSelected ? 3 : 2
        },
        zIndex: isSelected ? 1000 : 100
      })

      const infoContent = `
        <div style="font-family: Arial; padding: 12px; min-width: 220px;">
          <h3 style="color: #FF6B6B; margin: 0 0 12px 0; font-size: 1.1rem;">📍 ${punto.nombre || 'Punto'}</h3>
          ${punto.descripcion ? `<p style="margin: 6px 0;"><strong>Descripción:</strong> ${punto.descripcion}</p>` : ''}
          ${punto.fuente ? `<p style="margin: 6px 0;"><strong>Fuente:</strong> ${punto.fuente}</p>` : ''}
          <p style="margin: 6px 0; font-size: 0.85rem; color: #666;"><strong>Coords:</strong> ${punto.latitud.toFixed(6)}, ${punto.longitud.toFixed(6)}</p>
        </div>
      `

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker)
      })

      puntosMarkersRef.current.push(marker)
    })
  }, [puntosReferencia, puntoReferencia, mapLoaded])

  // Dibujar círculo de radio máximo
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google || !puntoReferencia || modo === 'seleccion') return

    // Limpiar círculo anterior
    if (radioCircleRef.current) {
      radioCircleRef.current.setMap(null)
    }

    radioCircleRef.current = new window.google.maps.Circle({
      map: mapInstanceRef.current,
      center: { lat: puntoReferencia.latitud, lng: puntoReferencia.longitud },
      radius: RADIO_MAXIMO,
      strokeColor: '#2196F3',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#2196F3',
      fillOpacity: 0.1
    })

    // Centrar mapa en el punto de referencia
    mapInstanceRef.current.panTo({ lat: puntoReferencia.latitud, lng: puntoReferencia.longitud })
    mapInstanceRef.current.setZoom(18)

    return () => {
      if (radioCircleRef.current) {
        radioCircleRef.current.setMap(null)
      }
    }
  }, [puntoReferencia, mapLoaded, modo])

  // Dibujar polígono de parcela
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google || !posicionParcela || !puntoReferencia) return

    // Calcular vértices
    const vertices = calcularVerticesParcela(posicionParcela.lat, posicionParcela.lng, rotacion)
    const verticesGoogle = vertices.map(v => ({ lat: v.lat, lng: v.lng }))

    // Limpiar polígono anterior
    if (parcelaPolygonRef.current) {
      parcelaPolygonRef.current.setMap(null)
    }

    // Crear polígono
    parcelaPolygonRef.current = new window.google.maps.Polygon({
      paths: verticesGoogle,
      strokeColor: modo === 'confirmacion' ? '#28a745' : '#FFA500',
      strokeOpacity: 0.9,
      strokeWeight: 3,
      fillColor: modo === 'confirmacion' ? '#28a745' : '#FFA500',
      fillOpacity: 0.3,
      map: mapInstanceRef.current,
      editable: false,
      draggable: false
    })

    // Calcular y actualizar distancia y ángulo
    const distancia = calcularDistancia(
      puntoReferencia.latitud,
      puntoReferencia.longitud,
      posicionParcela.lat,
      posicionParcela.lng
    )
    setDistanciaActual(distancia)

    // Calcular ángulo desde el punto de referencia
    const dLat = posicionParcela.lat - puntoReferencia.latitud
    const dLng = posicionParcela.lng - puntoReferencia.longitud
    const angulo = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360
    setAnguloActual(angulo)

    return () => {
      if (parcelaPolygonRef.current) {
        parcelaPolygonRef.current.setMap(null)
      }
    }
  }, [posicionParcela, rotacion, mapLoaded, puntoReferencia, modo])

  // Funciones para controlar la posición
  const handleDistanciaChange = (nuevaDistancia) => {
    if (!puntoReferencia) return

    // Calcular nueva posición manteniendo el ángulo actual
    const nuevaPosicion = calcularPuntoDestino(
      puntoReferencia.latitud,
      puntoReferencia.longitud,
      nuevaDistancia,
      anguloActual
    )

    onPosicionActualizada(nuevaPosicion)
  }

  const handleAnguloChange = (nuevoAngulo) => {
    if (!puntoReferencia) return

    // Calcular nueva posición manteniendo la distancia actual
    const nuevaPosicion = calcularPuntoDestino(
      puntoReferencia.latitud,
      puntoReferencia.longitud,
      distanciaActual,
      nuevoAngulo
    )

    onPosicionActualizada(nuevaPosicion)
  }

  const moverEnDireccion = (direccion) => {
    if (!puntoReferencia) return

    const paso = 5 // metros
    let nuevoAngulo = anguloActual

    switch(direccion) {
      case 'norte': nuevoAngulo = 0; break
      case 'sur': nuevoAngulo = 180; break
      case 'este': nuevoAngulo = 90; break
      case 'oeste': nuevoAngulo = 270; break
      case 'noreste': nuevoAngulo = 45; break
      case 'noroeste': nuevoAngulo = 315; break
      case 'sureste': nuevoAngulo = 135; break
      case 'suroeste': nuevoAngulo = 225; break
    }

    const nuevaDistancia = Math.min(distanciaActual + paso, RADIO_MAXIMO)

    const nuevaPosicion = calcularPuntoDestino(
      puntoReferencia.latitud,
      puntoReferencia.longitud,
      nuevaDistancia,
      nuevoAngulo
    )

    onPosicionActualizada(nuevaPosicion)
  }

  // Marcador central draggable
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google || !posicionParcela || modo !== 'posicionar') return

    // Si el marcador ya existe, solo actualizar su posición
    if (parcelaCenterMarkerRef.current) {
      parcelaCenterMarkerRef.current.setPosition({ lat: posicionParcela.lat, lng: posicionParcela.lng })
      return
    }

    // Crear marcador draggable
    parcelaCenterMarkerRef.current = new window.google.maps.Marker({
      position: { lat: posicionParcela.lat, lng: posicionParcela.lng },
      map: mapInstanceRef.current,
      draggable: true,
      title: 'Arrastra para mover la parcela',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#FFA500',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      zIndex: 999
    })

    // Listener para arrastrar (con throttling)
    let lastUpdate = Date.now()
    const dragListener = window.google.maps.event.addListener(
      parcelaCenterMarkerRef.current,
      'drag',
      (event) => {
        const now = Date.now()
        if (now - lastUpdate < 50) return // Throttle a 50ms
        lastUpdate = now

        const nuevaPos = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }

        // Limitar al radio
        const posicionLimitada = limitarAlRadio(
          puntoReferencia.latitud,
          puntoReferencia.longitud,
          nuevaPos.lat,
          nuevaPos.lng,
          RADIO_MAXIMO
        )

        // Si está fuera del radio, ajustar
        if (posicionLimitada.lat !== nuevaPos.lat || posicionLimitada.lng !== nuevaPos.lng) {
          parcelaCenterMarkerRef.current.setPosition(posicionLimitada)
        }

        onPosicionActualizada(posicionLimitada)
      }
    )

    // Listener para soltar el marcador
    const dragEndListener = window.google.maps.event.addListener(
      parcelaCenterMarkerRef.current,
      'dragend',
      (event) => {
        const finalPos = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }

        const posicionLimitada = limitarAlRadio(
          puntoReferencia.latitud,
          puntoReferencia.longitud,
          finalPos.lat,
          finalPos.lng,
          RADIO_MAXIMO
        )

        parcelaCenterMarkerRef.current.setPosition(posicionLimitada)
        onPosicionActualizada(posicionLimitada)
      }
    )

    return () => {
      if (dragListener) {
        window.google.maps.event.removeListener(dragListener)
      }
      if (dragEndListener) {
        window.google.maps.event.removeListener(dragEndListener)
      }
      if (parcelaCenterMarkerRef.current) {
        parcelaCenterMarkerRef.current.setMap(null)
      }
    }
  }, [posicionParcela, mapLoaded, modo, puntoReferencia, onPosicionActualizada])

  return (
    <div className="map-interactivo-container">
      <div ref={mapRef} className="map" />

      {!mapLoaded && (
        <div className="map-loading">
          <div className="spinner"></div>
          <p>Cargando mapa...</p>
        </div>
      )}

      {modo === 'posicionar' && posicionParcela && (
        <div className="controles-posicionamiento">
          <div className="info-panel">
            <div className="info-item">
              <span className="info-label">Distancia:</span>
              <span className="info-value">{distanciaActual.toFixed(1)} m</span>
            </div>
            <div className="info-item">
              <span className="info-label">Dirección:</span>
              <span className="info-value">{anguloActual.toFixed(0)}°</span>
            </div>
          </div>

          <div className="posicion-controls">
            <label>Distancia desde punto de referencia (metros)</label>
            <input
              type="range"
              min="0"
              max={RADIO_MAXIMO}
              step="1"
              value={distanciaActual}
              onChange={(e) => handleDistanciaChange(Number(e.target.value))}
              className="distancia-slider"
            />
            <div className="distancia-buttons">
              <button onClick={() => handleDistanciaChange(Math.max(0, distanciaActual - 5))}>
                -5m
              </button>
              <button onClick={() => handleDistanciaChange(Math.min(RADIO_MAXIMO, distanciaActual + 5))}>
                +5m
              </button>
              <button onClick={() => handleDistanciaChange(0)}>
                Centro
              </button>
            </div>
          </div>

          <div className="direccion-controls">
            <label>Dirección (grados desde Norte)</label>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={anguloActual}
              onChange={(e) => handleAnguloChange(Number(e.target.value))}
              className="angulo-slider"
            />
            <div className="direccion-compass">
              <button className="compass-btn" onClick={() => handleAnguloChange(0)} title="Norte">↑ N</button>
              <button className="compass-btn" onClick={() => handleAnguloChange(45)} title="Noreste">↗ NE</button>
              <button className="compass-btn" onClick={() => handleAnguloChange(90)} title="Este">→ E</button>
              <button className="compass-btn" onClick={() => handleAnguloChange(135)} title="Sureste">↘ SE</button>
              <button className="compass-btn" onClick={() => handleAnguloChange(180)} title="Sur">↓ S</button>
              <button className="compass-btn" onClick={() => handleAnguloChange(225)} title="Suroeste">↙ SW</button>
              <button className="compass-btn" onClick={() => handleAnguloChange(270)} title="Oeste">← O</button>
              <button className="compass-btn" onClick={() => handleAnguloChange(315)} title="Noroeste">↖ NO</button>
            </div>
          </div>

          <div className="rotacion-controls">
            <label>Rotación del polígono: {rotacion}°</label>
            <input
              type="range"
              min="0"
              max="360"
              value={rotacion}
              onChange={(e) => onRotacionActualizada(Number(e.target.value))}
              className="rotacion-slider"
            />
            <div className="rotacion-buttons">
              <button onClick={() => onRotacionActualizada((rotacion - 45 + 360) % 360)}>
                ↶ -45°
              </button>
              <button onClick={() => onRotacionActualizada((rotacion + 45) % 360)}>
                ↷ +45°
              </button>
              <button onClick={() => onRotacionActualizada(0)}>
                0°
              </button>
            </div>
          </div>

          <div className="acciones-posicionamiento">
            <button className="btn-volver" onClick={onVolver}>
              ← Volver
            </button>
            <button className="btn-confirmar-pos" onClick={onConfirmar}>
              Confirmar Posición →
            </button>
          </div>

          <div className="instrucciones-posicionamiento">
            <p>
              💡 Usa los controles deslizantes para posicionar la parcela con precisión.
              También puedes arrastrar el marcador naranja en el mapa.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapViewInteractivo
