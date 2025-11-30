import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Map, X } from 'lucide-react'
import { toast } from 'sonner'

function FormularioNuevaZona({ onZonaCreada, onClose }) {
  const [nombreZona, setNombreZona] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nombreZona.trim()) {
      toast.error('Por favor ingresa el nombre de la zona')
      return
    }

    try {
      setLoading(true)

      // Crear la zona en la base de datos
      const response = await fetch('http://localhost:8000/api/v1/puntos-referencia/zonas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombreZona.trim(),
          descripcion: null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al crear la zona')
      }

      const zonaCreada = await response.json()

      toast.success(`Zona "${zonaCreada.nombre}" creada exitosamente`)
      toast.info('Ahora puedes agregar parcelas y puntos de referencia a esta zona', { duration: 5000 })

      if (onZonaCreada) {
        onZonaCreada(zonaCreada)
      }

      setNombreZona('')

      if (onClose) {
        onClose()
      }

    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al crear la zona')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              <CardTitle>Nueva Zona</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Crea una nueva zona geográfica para organizar tus parcelas y puntos de referencia
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombreZona">
                Nombre de la Zona <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombreZona"
                value={nombreZona}
                onChange={(e) => setNombreZona(e.target.value)}
                placeholder="Ej: Zona A, Patruyeros, MARCELA, etc."
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Este nombre se usará para agrupar parcelas y puntos de referencia
              </p>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                ℹ️ <strong>Nota:</strong> Las zonas son agrupaciones lógicas para organizar tus parcelas y puntos de referencia. Una vez creada, la zona estará disponible en los filtros y podrás asignarle parcelas y puntos.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creando...' : 'Crear Zona'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default FormularioNuevaZona
