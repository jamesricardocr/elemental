import { useState } from 'react'
import { calcularVerticesParcela, formatearCoordenadas, calcularDistancia } from '../utils/geometryUtils'
import { createParcela, createPuntoReferencia } from '../services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { MapPin, Ruler, Navigation, RotateCw, FileEdit, AlertCircle, Loader2, Save, ArrowLeft, X } from 'lucide-react'

function ConfirmacionParcela({
  zona,
  puntoReferencia,
  posicionParcela,
  rotacion,
  onParcelaCreada,
  onVolver,
  onCancelar
}) {
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const vertices = calcularVerticesParcela(posicionParcela.lat, posicionParcela.lng, rotacion)
  const distancia = calcularDistancia(
    puntoReferencia.latitud,
    puntoReferencia.longitud,
    posicionParcela.lat,
    posicionParcela.lng
  )

  const handleGuardar = async () => {
    setGuardando(true)
    setError(null)

    try {
      // Convertir vértices al formato esperado por el backend
      const verticesArray = vertices.map(v => [v.lat, v.lng])

      const parcelaData = {
        codigo: codigo.trim(),
        nombre: nombre.trim() || null,
        zona_priorizada: zona,
        latitud: posicionParcela.lat,
        longitud: posicionParcela.lng,
        estado: 'activa',
        observaciones: observaciones.trim() || null,
        generar_vertices: false,
        // Pasar vértices individuales
        vertice1_lat: verticesArray[0][0],
        vertice1_lon: verticesArray[0][1],
        vertice2_lat: verticesArray[1][0],
        vertice2_lon: verticesArray[1][1],
        vertice3_lat: verticesArray[2][0],
        vertice3_lon: verticesArray[2][1],
        vertice4_lat: verticesArray[3][0],
        vertice4_lon: verticesArray[3][1]
      }

      console.log('Creando parcela con datos:', parcelaData)
      const nuevaParcela = await createParcela(parcelaData)
      console.log('Parcela creada exitosamente:', nuevaParcela)

      // Crear punto de referencia automáticamente en el centro de la parcela
      if (zona) {
        try {
          await createPuntoReferencia({
            zona: zona,
            nombre: nombre.trim() || codigo.trim(),
            descripcion: `Centro de la parcela ${codigo.trim()}`,
            fuente: 'Calculado automáticamente al crear la parcela',
            latitud: posicionParcela.lat,
            longitud: posicionParcela.lng
          })
          console.log('Punto de referencia creado automáticamente')
        } catch (puntoError) {
          console.error('Error al crear punto de referencia:', puntoError)
          // No bloquear la creación de la parcela si falla el punto
        }
      }

      onParcelaCreada(nuevaParcela)
    } catch (err) {
      console.error('Error guardando parcela:', err)
      setError(err.message || 'Error al guardar la parcela')
      setGuardando(false)
    }
  }

  return (
    <div className="absolute top-4 right-4 w-96 z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <Card className="shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-primary" />
            Confirmar Nueva Parcela
          </CardTitle>
          <CardDescription>
            Revisa los datos y completa la información
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Ubicación */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Ubicación</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zona:</span>
                <Badge variant="secondary">{zona}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Punto Referencia:</span>
                <span className="font-medium">{puntoReferencia.nombre || `ID: ${puntoReferencia.id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distancia:</span>
                <span className="font-medium">{distancia.toFixed(1)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Centro:</span>
                <span className="font-mono text-xs">{formatearCoordenadas(posicionParcela.lat, posicionParcela.lng)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rotación:</span>
                <Badge variant="outline">{rotacion}°</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Vértices */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Vértices (20m × 50m = 0.1 ha)</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {vertices.map((v, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                  <Badge variant="outline" className="text-xs">V{i + 1}</Badge>
                  <span className="font-mono text-xs">{formatearCoordenadas(v.lat, v.lng)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Formulario */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileEdit className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Información de la Parcela</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo">
                Código
              </Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Dejar vacío para generar automáticamente (P123456)"
              />
              <p className="text-xs text-muted-foreground">
                Código único (auto-generado si se deja vacío)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre (opcional)</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre descriptivo de la parcela"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales sobre la parcela..."
                rows={3}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Botones */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleGuardar}
              disabled={guardando}
              className="w-full"
            >
              {guardando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Parcela
                </>
              )}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onVolver}
                disabled={guardando}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ajustar
              </Button>
              <Button
                variant="ghost"
                onClick={onCancelar}
                disabled={guardando}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ConfirmacionParcela
