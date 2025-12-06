import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Map, X, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { getZonasDetalladas, deleteZona } from '../services/api'

function GestionZonas({ onClose, onZonaEliminada }) {
  const [zonas, setZonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [eliminando, setEliminando] = useState(null)

  useEffect(() => {
    cargarZonas()
  }, [])

  const cargarZonas = async () => {
    try {
      setLoading(true)
      const data = await getZonasDetalladas()
      setZonas(data)
    } catch (error) {
      console.error('Error cargando zonas:', error)
      toast.error('Error al cargar las zonas')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarZona = async (zona) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la zona "${zona.nombre}"?\n\nADVERTENCIA: Esta acción no puede deshacerse.`)) {
      return
    }

    try {
      setEliminando(zona.id)
      await deleteZona(zona.id)
      toast.success(`Zona "${zona.nombre}" eliminada exitosamente`)

      // Actualizar lista
      setZonas(zonas.filter(z => z.id !== zona.id))

      if (onZonaEliminada) {
        onZonaEliminada(zona)
      }
    } catch (error) {
      console.error('Error eliminando zona:', error)
      toast.error(error.message || 'Error al eliminar la zona')
    } finally {
      setEliminando(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              <CardTitle>Gestión de Zonas</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Administra las zonas geográficas del sistema
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto">
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Importante:</strong> Eliminar una zona no elimina las parcelas ni puntos de referencia asociados. Solo elimina la zona de la lista de zonas disponibles.
            </AlertDescription>
          </Alert>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Cargando zonas...</p>
            </div>
          ) : zonas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Map className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No hay zonas creadas</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crea una nueva zona para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {zonas.map((zona) => (
                <Card key={zona.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{zona.nombre}</h3>
                          <Badge variant="outline">ID: {zona.id}</Badge>
                        </div>
                        {zona.descripcion && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {zona.descripcion}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Creada: {new Date(zona.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleEliminarZona(zona)}
                        disabled={eliminando === zona.id}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {eliminando === zona.id ? 'Eliminando...' : 'Eliminar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Total de zonas: <strong>{zonas.length}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GestionZonas
