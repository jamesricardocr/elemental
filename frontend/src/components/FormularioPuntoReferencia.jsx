import { useState } from 'react'
import { createPuntoReferencia } from '../services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, X, Plus, Map, Edit3 } from 'lucide-react'
import { toast } from 'sonner'
import MapSelectorPunto from './MapSelectorPunto'

function FormularioPuntoReferencia({ zonas, zonaInicial, onPuntoCreado, onClose }) {
  const [formData, setFormData] = useState({
    zona: zonaInicial || '',
    nuevaZona: '',
    nombre: '',
    descripcion: '',
    fuente: '',
    latitud: '',
    longitud: ''
  })

  const [loading, setLoading] = useState(false)
  const [crearNuevaZona, setCrearNuevaZona] = useState(false)
  const [modoSeleccion, setModoSeleccion] = useState('manual') // 'manual' | 'mapa'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMapLocationSelected = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitud: lat.toFixed(6),
      longitud: lng.toFixed(6)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones
    if (!crearNuevaZona && !formData.zona) {
      toast.error('Por favor selecciona una zona')
      return
    }

    if (crearNuevaZona && !formData.nuevaZona.trim()) {
      toast.error('Por favor ingresa el nombre de la nueva zona')
      return
    }

    if (!formData.latitud || !formData.longitud) {
      toast.error('Las coordenadas son requeridas')
      return
    }

    const lat = parseFloat(formData.latitud)
    const lon = parseFloat(formData.longitud)

    if (isNaN(lat) || isNaN(lon)) {
      toast.error('Las coordenadas deben ser números válidos')
      return
    }

    if (lat < -90 || lat > 90) {
      toast.error('Latitud debe estar entre -90 y 90')
      return
    }

    if (lon < -180 || lon > 180) {
      toast.error('Longitud debe estar entre -180 y 180')
      return
    }

    try {
      setLoading(true)

      const puntoData = {
        zona: crearNuevaZona ? formData.nuevaZona.trim() : formData.zona,
        nombre: formData.nombre.trim() || null,
        descripcion: formData.descripcion.trim() || null,
        fuente: formData.fuente.trim() || null,
        latitud: lat,
        longitud: lon
      }

      const nuevoPunto = await createPuntoReferencia(puntoData)

      toast.success(crearNuevaZona
        ? `Zona "${puntoData.zona}" y punto creados exitosamente`
        : 'Punto de referencia creado exitosamente'
      )

      if (onPuntoCreado) {
        onPuntoCreado(nuevoPunto)
      }

      // Resetear formulario
      setFormData({
        zona: zonaInicial || '',
        nuevaZona: '',
        nombre: '',
        descripcion: '',
        fuente: '',
        latitud: '',
        longitud: ''
      })
      setCrearNuevaZona(false)

    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al crear punto de referencia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Agregar Punto de Referencia</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Agrega un nuevo punto de referencia geográfico a una zona existente o crea una nueva zona
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selector de zona o crear nueva */}
            <div className="space-y-2">
              <Label>Zona</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={!crearNuevaZona ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrearNuevaZona(false)}
                  className="flex-1"
                >
                  Zona Existente
                </Button>
                <Button
                  type="button"
                  variant={crearNuevaZona ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCrearNuevaZona(true)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva Zona
                </Button>
              </div>

              {!crearNuevaZona ? (
                <Select value={formData.zona} onValueChange={(value) => setFormData({...formData, zona: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una zona" />
                  </SelectTrigger>
                  <SelectContent>
                    {zonas.map(zona => (
                      <SelectItem key={zona} value={zona}>{zona}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  name="nuevaZona"
                  value={formData.nuevaZona}
                  onChange={handleChange}
                  placeholder="Nombre de la nueva zona"
                />
              )}
            </div>

            {/* Modo de selección de coordenadas */}
            <div className="space-y-2">
              <Label>Método de Selección de Coordenadas</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={modoSeleccion === 'manual' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setModoSeleccion('manual')}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Manual
                </Button>
                <Button
                  type="button"
                  variant={modoSeleccion === 'mapa' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setModoSeleccion('mapa')}
                  className="flex-1"
                >
                  <Map className="h-4 w-4 mr-1" />
                  Seleccionar en Mapa
                </Button>
              </div>
            </div>

            {/* Coordenadas - Manual */}
            {modoSeleccion === 'manual' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitud">Latitud *</Label>
                  <Input
                    id="latitud"
                    name="latitud"
                    type="number"
                    step="any"
                    value={formData.latitud}
                    onChange={handleChange}
                    placeholder="-4.2156"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Entre -90 y 90</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitud">Longitud *</Label>
                  <Input
                    id="longitud"
                    name="longitud"
                    type="number"
                    step="any"
                    value={formData.longitud}
                    onChange={handleChange}
                    placeholder="-69.9406"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Entre -180 y 180</p>
                </div>
              </div>
            )}

            {/* Coordenadas - Mapa Interactivo */}
            {modoSeleccion === 'mapa' && (
              <MapSelectorPunto
                onLocationSelected={handleMapLocationSelected}
                initialLat={formData.latitud ? parseFloat(formData.latitud) : null}
                initialLng={formData.longitud ? parseFloat(formData.longitud) : null}
              />
            )}

            {/* Información adicional */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Punto</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Punto de control principal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción detallada del punto de referencia"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuente">Fuente</Label>
              <Input
                id="fuente"
                name="fuente"
                value={formData.fuente}
                onChange={handleChange}
                placeholder="Ej: GPS, Google Maps, etc."
              />
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creando...' : 'Crear Punto'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default FormularioPuntoReferencia
