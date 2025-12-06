import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Square, Trash2, AlertCircle, MapPin, Edit, TreeDeciduous, Leaf, Sprout, Calculator } from 'lucide-react'
import { toast } from 'sonner'

function GestionSubparcelas({ parcelaId, parcela, onGestionarDatos }) {
  const [subparcelas, setSubparcelas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    vertice_origen: 1,
    proposito: '',
    observaciones: ''
  })

  const abrirGestionDatos = (subparcela, tipo) => {
    if (onGestionarDatos) {
      onGestionarDatos(subparcela, tipo)
    }
  }

  useEffect(() => {
    cargarSubparcelas()
  }, [parcelaId])

  const cargarSubparcelas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/subparcelas/parcela/${parcelaId}`)

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

    try {
      if (editando) {
        // Actualizar subparcela existente
        const response = await fetch(`/api/v1/subparcelas/${editando.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            proposito: formData.proposito,
            observaciones: formData.observaciones
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Error al actualizar subparcela')
        }

        toast.success('Subparcela actualizada exitosamente')
      } else {
        // Crear nueva subparcela
        const response = await fetch('/api/v1/subparcelas/', {
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
      }

      setMostrarFormulario(false)
      setEditando(null)
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

  const iniciarEdicion = (subparcela) => {
    setEditando(subparcela)
    setFormData({
      codigo: subparcela.codigo,
      nombre: subparcela.nombre || '',
      vertice_origen: subparcela.vertice_origen,
      proposito: subparcela.proposito || '',
      observaciones: subparcela.observaciones || ''
    })
    setMostrarFormulario(true)
  }

  const cancelarEdicion = () => {
    setEditando(null)
    setMostrarFormulario(false)
    setFormData({
      codigo: '',
      nombre: '',
      vertice_origen: 1,
      proposito: '',
      observaciones: ''
    })
  }

  const eliminarSubparcela = async (id, codigo) => {
    if (!confirm(`¿Estás seguro de eliminar la subparcela ${codigo}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/v1/subparcelas/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al eliminar subparcela')
      }

      toast.success('Subparcela eliminada exitosamente')
      cargarSubparcelas()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al eliminar subparcela')
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

      {/* Formulario de creación/edición */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>{editando ? 'Editar Subparcela' : 'Nueva Subparcela'}</CardTitle>
            <CardDescription>
              {editando
                ? `Editando subparcela ${editando.codigo}`
                : 'Crea una subparcela de 10m x 10m desde uno de los vértices de la parcela'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {!editando && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Código
                    </label>
                    <input
                      type="text"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      placeholder="Dejar vacío para generar automáticamente (S123456)"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <p className="text-xs text-muted-foreground">
                      Código único (auto-generado si se deja vacío)
                    </p>
                  </div>
                )}

                {editando && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Código
                    </label>
                    <input
                      type="text"
                      value={formData.codigo}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                    />
                    <p className="text-xs text-muted-foreground">
                      El código no se puede modificar
                    </p>
                  </div>
                )}

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

              {!editando && (
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
              )}

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
                  onClick={cancelarEdicion}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editando ? 'Actualizar Subparcela' : 'Crear Subparcela'}
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
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => iniciarEdicion(subparcela)}
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarSubparcela(subparcela.id, subparcela.codigo)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
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
                  <p className="text-xs text-muted-foreground mb-3">
                    Centro: {subparcela.latitud.toFixed(6)}, {subparcela.longitud.toFixed(6)}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirGestionDatos(subparcela, 'arboles')}
                    >
                      <TreeDeciduous className="h-4 w-4 mr-2" />
                      Árboles
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirGestionDatos(subparcela, 'necromasa')}
                    >
                      <Leaf className="h-4 w-4 mr-2" />
                      Necromasa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirGestionDatos(subparcela, 'herbaceas')}
                    >
                      <Sprout className="h-4 w-4 mr-2" />
                      Herbáceas
                    </Button>
                  </div>
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
