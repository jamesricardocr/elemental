import { useEffect, useRef, useState } from 'react'
import { calcularVerticesParcela, calcularDistancia, limitarAlRadio, calcularPuntoDestino } from '../utils/geometryUtils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Navigation, Compass, RotateCw, Info, ArrowLeft, CheckCircle2, MapPin, Move, Loader2 } from 'lucide-react'

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
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {!mapLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-foreground">Cargando mapa...</p>
        </div>
      )}

      {modo === 'posicionar' && posicionParcela && (
        <div className="absolute top-4 right-4 w-96 z-10 space-y-3">
          {/* Panel de información */}
          <Card className="shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Move className="h-4 w-4 text-primary" />
                Posición de la Parcela
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground mb-1">Distancia</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">{distanciaActual.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">m</span>
                  </div>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground mb-1">Dirección</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">{anguloActual.toFixed(0)}</span>
                    <span className="text-xs text-muted-foreground">°</span>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Control de Distancia */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Distancia desde punto de referencia</span>
                </div>
                <Slider
                  value={[distanciaActual]}
                  onValueChange={(value) => handleDistanciaChange(value[0])}
                  max={RADIO_MAXIMO}
                  step={1}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDistanciaChange(Math.max(0, distanciaActual - 5))}
                    className="flex-1"
                  >
                    -5m
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDistanciaChange(Math.min(RADIO_MAXIMO, distanciaActual + 5))}
                    className="flex-1"
                  >
                    +5m
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDistanciaChange(0)}
                    className="flex-1"
                  >
                    Centro
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Control de Dirección */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Dirección (desde Norte)</span>
                </div>
                <Slider
                  value={[anguloActual]}
                  onValueChange={(value) => handleAnguloChange(value[0])}
                  max={360}
                  step={1}
                  className="w-full"
                />
                <div className="grid grid-cols-4 gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleAnguloChange(0)} title="Norte">
                    ↑ N
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAnguloChange(45)} title="Noreste">
                    ↗ NE
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAnguloChange(90)} title="Este">
                    → E
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAnguloChange(135)} title="Sureste">
                    ↘ SE
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAnguloChange(180)} title="Sur">
                    ↓ S
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAnguloChange(225)} title="Suroeste">
                    ↙ SW
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAnguloChange(270)} title="Oeste">
                    ← O
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAnguloChange(315)} title="Noroeste">
                    ↖ NO
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Control de Rotación */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCw className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Rotación del polígono</span>
                  </div>
                  <Badge variant="secondary">{rotacion}°</Badge>
                </div>
                <Slider
                  value={[rotacion]}
                  onValueChange={(value) => onRotacionActualizada(value[0])}
                  max={360}
                  step={1}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRotacionActualizada((rotacion - 45 + 360) % 360)}
                    className="flex-1"
                  >
                    ↶ -45°
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRotacionActualizada((rotacion + 45) % 360)}
                    className="flex-1"
                  >
                    ↷ +45°
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRotacionActualizada(0)}
                    className="flex-1"
                  >
                    0°
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Botones de acción */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={onVolver} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <Button onClick={onConfirmar} className="flex-1">
                  Confirmar
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instrucciones */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Usa los controles deslizantes para posicionar la parcela con precisión.
              También puedes arrastrar el marcador naranja en el mapa.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}

export default MapViewInteractivo
