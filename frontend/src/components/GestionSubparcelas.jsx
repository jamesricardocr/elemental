import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Square, Trash2, AlertCircle, MapPin } from 'lucide-react'
import { toast } from 'sonner'

function GestionSubparcelas({ parcelaId, parcela }) {
  const [subparcelas, setSubparcelas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    vertice_origen: 1,
    proposito: '',
    observaciones: ''
  })

  useEffect(() => {
    cargarSubparcelas()
  }, [parcelaId])

  const cargarSubparcelas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8000/api/v1/subparcelas/parcela/${parcelaId}`)

      if (!response.ok) {
        throw new Error('Error al cargar subparcelas')
      }

      const data = await response.json()
      setSubparcelas(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar subparcelas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.codigo.trim()) {
      toast.error('El código de la subparcela es obligatorio')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/subparcelas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          parcela_id: parcelaId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al crear subparcela')
      }

      toast.success('Subparcela creada exitosamente')
      setMostrarFormulario(false)
      setFormData({
        codigo: '',
        nombre: '',
        vertice_origen: 1,
        proposito: '',
        observaciones: ''
      })
      cargarSubparcelas()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message)
    }
  }

  const eliminarSubparcela = async (id, codigo) => {
    if (!confirm(`¿Estás seguro de eliminar la subparcela ${codigo}?`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/subparcelas/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar subparcela')
      }

      toast.success('Subparcela eliminada exitosamente')
      cargarSubparcelas()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar subparcela')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con botón crear */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subparcelas (10m x 10m)</h2>
          <p className="text-muted-foreground">
            Gestiona las subparcelas de 10m x 10m dentro de esta parcela
          </p>
        </div>
        <Button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Subparcela
        </Button>
      </div>

      {/* Información de vértices disponibles */}
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          Puedes crear subparcelas desde cualquiera de los 4 vértices de la parcela principal. Cada subparcela tendrá 10m x 10m (100 m²).
        </AlertDescription>
      </Alert>

      {/* Formulario de creación */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Subparcela</CardTitle>
            <CardDescription>
              Crea una subparcela de 10m x 10m desde uno de los vértices de la parcela
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ej: SUB-01"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Subparcela Necromasa 1"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Vértice de Origen <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.vertice_origen}
                  onChange={(e) => setFormData({ ...formData, vertice_origen: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value={1}>Vértice 1 (Superior Izquierdo)</option>
                  <option value={2}>Vértice 2 (Superior Derecho)</option>
                  <option value={3}>Vértice 3 (Inferior Derecho)</option>
                  <option value={4}>Vértice 4 (Inferior Izquierdo)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  La subparcela se generará desde este vértice hacia el interior de la parcela
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Propósito</label>
                <select
                  value={formData.proposito}
                  onChange={(e) => setFormData({ ...formData, proposito: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Seleccionar propósito...</option>
                  <option value="Necromasa">Necromasa</option>
                  <option value="Herbáceas">Herbáceas</option>
                  <option value="Muestreo específico">Muestreo específico</option>
                  <option value="Inventario forestal">Inventario forestal</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Observaciones</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Observaciones adicionales..."
                  className="w-full px-3 py-2 border rounded-md min-h-20"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMostrarFormulario(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Crear Subparcela
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de subparcelas */}
      {subparcelas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Square className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay subparcelas creadas</p>
            <p className="text-sm text-muted-foreground mt-2">
              Crea una subparcela para comenzar el muestreo
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subparcelas.map((subparcela) => (
            <Card key={subparcela.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-orange-600" />
                      {subparcela.codigo}
                    </CardTitle>
                    {subparcela.nombre && (
                      <CardDescription className="mt-1">
                        {subparcela.nombre}
                      </CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarSubparcela(subparcela.id, subparcela.codigo)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tamaño</p>
                    <p className="font-medium">10m x 10m (100 m²)</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vértice de Origen</p>
                    <p className="font-medium">Vértice {subparcela.vertice_origen}</p>
                  </div>
                  {subparcela.proposito && (
                    <div>
                      <p className="text-muted-foreground">Propósito</p>
                      <p className="font-medium">{subparcela.proposito}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Estado</p>
                    <Badge variant={subparcela.estado === 'activa' ? 'default' : 'secondary'}>
                      {subparcela.estado}
                    </Badge>
                  </div>
                </div>

                {subparcela.observaciones && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Observaciones:</p>
                    <p className="text-sm">{subparcela.observaciones}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Centro: {subparcela.latitud.toFixed(6)}, {subparcela.longitud.toFixed(6)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default GestionSubparcelas
