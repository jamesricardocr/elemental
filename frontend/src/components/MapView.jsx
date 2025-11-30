import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { loadGoogleMapsScript } from '../utils/loadGoogleMaps'
import './MapView.css'

const LETICIA_LAT = -4.2156
const LETICIA_LNG = -69.9406

const COLOR_MAP = {
  'activa': '#28a745',
  'completada': '#007bff',
  'inactiva': '#6c757d',
  'en_proceso': '#fd7e14'
}

const SUBPARCELA_COLOR = '#FF6F00'  // Naranja oscuro para subparcelas

function MapView({ parcelas, parcelaSeleccionada, puntosReferencia = [], subparcelas = [], zonaSeleccionada }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const polygonsRef = useRef([])
  const puntosMarkersRef = useRef([])
  const subparcelasPolygonsRef = useRef([])
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    console.log('Iniciando inicialización de Google Maps...')

    const initializeMap = async () => {
      try {
        // Cargar Google Maps
        await loadGoogleMapsScript()

        if (mapRef.current && !mapInstanceRef.current && window.google && window.google.maps) {
          console.log('Creando instancia del mapa...')

          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: LETICIA_LAT, lng: LETICIA_LNG },
            zoom: 12,
            mapTypeId: 'satellite',
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: window.google.maps.ControlPosition.TOP_RIGHT,
              mapTypeIds: ['satellite', 'hybrid', 'roadmap', 'terrain']
            },
            fullscreenControl: true,
            streetViewControl: false,
            zoomControl: true,
            zoomControlOptions: {
              position: window.google.maps.ControlPosition.RIGHT_CENTER
            },
            styles: []
          })

          console.log('Mapa creado exitosamente')
          setMapLoaded(true)
        }
      } catch (error) {
        console.error('Error inicializando Google Maps:', error)
      }
    }

    initializeMap()

    return () => {
      // Cleanup si es necesario
      const timeout = setTimeout(() => {
        if (!window.google || !window.google.maps) {
          console.error('Timeout: Google Maps no se cargó en 10 segundos')
        }
      }, 10000)

      return () => {
        clearInterval(checkInterval)
        clearTimeout(timeout)
      }
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google) return

    console.log('Actualizando marcadores, parcelas:', parcelas.length, 'puntos:', puntosReferencia.length, 'subparcelas:', subparcelas.length)

    // Limpiar marcadores y polígonos anteriores
    markersRef.current.forEach(marker => marker.setMap(null))
    polygonsRef.current.forEach(polygon => polygon.setMap(null))
    puntosMarkersRef.current.forEach(marker => marker.setMap(null))
    subparcelasPolygonsRef.current.forEach(polygon => polygon.setMap(null))
    markersRef.current = []
    polygonsRef.current = []
    puntosMarkersRef.current = []
    subparcelasPolygonsRef.current = []

    if (parcelas.length === 0 && puntosReferencia.length === 0 && subparcelas.length === 0) {
      // Volver a Leticia si no hay parcelas, puntos ni subparcelas
      mapInstanceRef.current.setCenter({ lat: LETICIA_LAT, lng: LETICIA_LNG })
      mapInstanceRef.current.setZoom(12)
      return
    }

    const bounds = new window.google.maps.LatLngBounds()

    parcelas.forEach(parcela => {
      if (!parcela.latitud || !parcela.longitud) return

      const position = { lat: parcela.latitud, lng: parcela.longitud }
      const color = COLOR_MAP[parcela.estado] || '#dc3545'

      // Crear marcador
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: parcela.codigo,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      })

      // Info window
      const infoContent = `
        <div style="font-family: Arial; padding: 12px; min-width: 220px;">
          <h3 style="color: ${color}; margin: 0 0 12px 0; font-size: 1.2rem;">${parcela.codigo}</h3>
          <p style="margin: 6px 0;"><strong>Nombre:</strong> ${parcela.nombre || 'N/A'}</p>
          <p style="margin: 6px 0;"><strong>Zona:</strong> ${parcela.zona_priorizada || 'N/A'}</p>
          <p style="margin: 6px 0;"><strong>Estado:</strong> ${parcela.estado}</p>
          <p style="margin: 6px 0;"><strong>Coordenadas:</strong> ${parcela.latitud.toFixed(6)}, ${parcela.longitud.toFixed(6)}</p>
          <p style="margin: 6px 0;"><strong>Árboles:</strong> ${parcela.arboles?.length || 0}</p>
        </div>
      `

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker)
      })

      markersRef.current.push(marker)
      bounds.extend(position)

      // Dibujar polígono si tiene vértices
      if (parcela.vertices && parcela.vertices.length === 4) {
        const vertices = parcela.vertices.map(v => ({ lat: v[0], lng: v[1] }))
        const validVertices = vertices.every(v => v.lat && v.lng)

        if (validVertices) {
          const polygon = new window.google.maps.Polygon({
            paths: vertices,
            strokeColor: color,
            strokeOpacity: 0.9,
            strokeWeight: 3,
            fillColor: color,
            fillOpacity: 0.2,
            map: mapInstanceRef.current
          })

          polygonsRef.current.push(polygon)
        }
      }
    })

    // Agregar puntos de referencia al mapa y bounds
    puntosReferencia.forEach(punto => {
      if (!punto.latitud || !punto.longitud) return

      const position = { lat: punto.latitud, lng: punto.longitud }

      // Crear marcador para punto de referencia (diferente color y forma)
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: punto.nombre || 'Punto de Referencia',
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 5,
          fillColor: '#FF6B6B',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      })

      // Info window para puntos de referencia
      const infoContent = `
        <div style="font-family: Arial; padding: 12px; min-width: 220px;">
          <h3 style="color: #FF6B6B; margin: 0 0 12px 0; font-size: 1.1rem;">📍 ${punto.nombre || 'Punto'}</h3>
          ${punto.descripcion ? `<p style="margin: 6px 0;"><strong>Descripción:</strong> ${punto.descripcion}</p>` : ''}
          ${punto.fuente ? `<p style="margin: 6px 0;"><strong>Fuente:</strong> ${punto.fuente}</p>` : ''}
          <p style="margin: 6px 0;"><strong>Zona:</strong> ${punto.zona}</p>
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
      bounds.extend(position)
    })

    // Agregar subparcelas al mapa
    subparcelas.forEach(subparcela => {
      if (!subparcela.vertices || subparcela.vertices.length !== 4) return

      const vertices = subparcela.vertices.map(v => ({ lat: v[0], lng: v[1] }))
      const validVertices = vertices.every(v => v.lat && v.lng)

      if (validVertices) {
        const polygon = new window.google.maps.Polygon({
          paths: vertices,
          strokeColor: SUBPARCELA_COLOR,
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: SUBPARCELA_COLOR,
          fillOpacity: 0.3,
          map: mapInstanceRef.current
        })

        // Info window para subparcela
        const center = { lat: subparcela.latitud, lng: subparcela.longitud }
        const infoContent = `
          <div style="font-family: Arial; padding: 12px; min-width: 220px;">
            <h3 style="color: ${SUBPARCELA_COLOR}; margin: 0 0 12px 0; font-size: 1.1rem;">📐 ${subparcela.codigo}</h3>
            <p style="margin: 6px 0;"><strong>Nombre:</strong> ${subparcela.nombre || 'N/A'}</p>
            <p style="margin: 6px 0;"><strong>Tamaño:</strong> 10m x 10m (100 m²)</p>
            <p style="margin: 6px 0;"><strong>Vértice origen:</strong> Vértice ${subparcela.vertice_origen}</p>
            ${subparcela.proposito ? `<p style="margin: 6px 0;"><strong>Propósito:</strong> ${subparcela.proposito}</p>` : ''}
            <p style="margin: 6px 0;"><strong>Estado:</strong> ${subparcela.estado}</p>
            <p style="margin: 6px 0; font-size: 0.85rem; color: #666;"><strong>Centro:</strong> ${subparcela.latitud.toFixed(6)}, ${subparcela.longitud.toFixed(6)}</p>
          </div>
        `

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent,
          position: center
        })

        polygon.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current)
        })

        subparcelasPolygonsRef.current.push(polygon)

        // Agregar centro al bounds
        bounds.extend(center)
      }
    })

    // Ajustar vista para mostrar todas las parcelas, puntos y subparcelas
    if (parcelas.length > 0 || puntosReferencia.length > 0 || subparcelas.length > 0) {
      mapInstanceRef.current.fitBounds(bounds)

      // Asegurar un nivel mínimo de zoom
      const listener = window.google.maps.event.addListenerOnce(mapInstanceRef.current, 'idle', () => {
        if (mapInstanceRef.current.getZoom() > 16) {
          mapInstanceRef.current.setZoom(16)
        }
      })
    }
  }, [parcelas, puntosReferencia, subparcelas, mapLoaded])

  // Efecto para centrar en parcela seleccionada
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !parcelaSeleccionada) return

    if (parcelaSeleccionada.latitud && parcelaSeleccionada.longitud) {
      console.log('Centrando en parcela:', parcelaSeleccionada.codigo)

      mapInstanceRef.current.panTo({
        lat: parcelaSeleccionada.latitud,
        lng: parcelaSeleccionada.longitud
      })

      mapInstanceRef.current.setZoom(17)

      // Resaltar el marcador de la parcela seleccionada
      const selectedMarker = markersRef.current.find(marker => {
        const pos = marker.getPosition()
        return pos.lat() === parcelaSeleccionada.latitud && pos.lng() === parcelaSeleccionada.longitud
      })

      if (selectedMarker) {
        // Animar el marcador
        selectedMarker.setAnimation(window.google.maps.Animation.BOUNCE)
        setTimeout(() => {
          selectedMarker.setAnimation(null)
        }, 2000)
      }
    }
  }, [parcelaSeleccionada, mapLoaded])


  return (
    <div className="map-container">
      <div ref={mapRef} className="map" />
      {!mapLoaded && (
        <div className="map-loading">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-foreground">Cargando mapa...</p>
        </div>
      )}
    </div>
  )
}

export default MapView
