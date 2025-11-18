import { useEffect, useRef, useState } from 'react'
import { loadGoogleMapsScript } from '../utils/loadGoogleMaps'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Loader2 } from 'lucide-react'

const LETICIA_LAT = -4.2156
const LETICIA_LNG = -69.9406

function MapSelectorPunto({ onLocationSelected, initialLat, initialLng }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedCoords, setSelectedCoords] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  )

  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript()

        if (mapRef.current && !mapInstanceRef.current && window.google && window.google.maps) {
          const initialCenter = selectedCoords || { lat: LETICIA_LAT, lng: LETICIA_LNG }

          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: initialCenter,
            zoom: 13,
            mapTypeId: 'satellite',
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: window.google.maps.ControlPosition.TOP_RIGHT,
              mapTypeIds: ['satellite', 'hybrid', 'roadmap']
            },
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: false
          })

          // Listener para clics en el mapa
          mapInstanceRef.current.addListener('click', (event) => {
            const lat = event.latLng.lat()
            const lng = event.latLng.lng()

            setSelectedCoords({ lat, lng })

            // Crear o actualizar marcador
            if (markerRef.current) {
              markerRef.current.setPosition(event.latLng)
            } else {
              markerRef.current = new window.google.maps.Marker({
                position: event.latLng,
                map: mapInstanceRef.current,
                draggable: true,
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#1e7e34',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2
                }
              })

              // Listener para cuando se arrastra el marcador
              markerRef.current.addListener('dragend', (event) => {
                const newLat = event.latLng.lat()
                const newLng = event.latLng.lng()
                setSelectedCoords({ lat: newLat, lng: newLng })
                onLocationSelected(newLat, newLng)
              })
            }

            onLocationSelected(lat, lng)
          })

          // Si hay coordenadas iniciales, agregar marcador
          if (selectedCoords) {
            markerRef.current = new window.google.maps.Marker({
              position: selectedCoords,
              map: mapInstanceRef.current,
              draggable: true,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#1e7e34',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }
            })

            markerRef.current.addListener('dragend', (event) => {
              const newLat = event.latLng.lat()
              const newLng = event.latLng.lng()
              setSelectedCoords({ lat: newLat, lng: newLng })
              onLocationSelected(newLat, newLng)
            })
          }

          setMapLoaded(true)
        }
      } catch (error) {
        console.error('Error inicializando mapa:', error)
      }
    }

    initializeMap()

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }
    }
  }, [])

  return (
    <div className="space-y-3">
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          <strong>Haz clic en el mapa</strong> para seleccionar la ubicación del punto de referencia. También puedes arrastrar el marcador para ajustar la posición.
        </AlertDescription>
      </Alert>

      <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-primary/20">
        <div ref={mapRef} className="w-full h-full" />

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Cargando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {selectedCoords && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
          <p><strong>Ubicación seleccionada:</strong></p>
          <p className="font-mono">
            Lat: {selectedCoords.lat.toFixed(6)}, Lng: {selectedCoords.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  )
}

export default MapSelectorPunto
