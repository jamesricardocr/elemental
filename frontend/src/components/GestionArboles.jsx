import { useState, useEffect } from 'react'
import {
  fetchArbolesParcela,
  createArbol,
  deleteArbol,
  getEstadisticasArboles,
  fetchEspecies
} from '../services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  TreeDeciduous,
  Plus,
  Trash2,
  X,
  TrendingUp,
  Ruler,
  BarChart3,
  Square
} from 'lucide-react'
import { toast } from 'sonner'

const GestionArboles = ({ subparcelaId, subparcela, parcelaId }) => {
  const [arboles, setArboles] = useState([])
  const [especies, setEspecies] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [nuevoArbol, setNuevoArbol] = useState({
    dap: '',
    altura: '',
    especie_id: '',
    latitud: '',
    longitud: '',
    estado_sanitario: 'sano',
    observaciones: ''
  })

  useEffect(() => {
    if (parcelaId) {
      cargarDatos()
    }
  }, [subparcelaId, parcelaId])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Si hay subparcela, cargar árboles de la subparcela; sino, de la parcela
      const endpoint = subparcelaId
        ? `/api/v1/arboles/subparcela/${subparcelaId}`
        : `/api/v1/arboles/parcela/${parcelaId}`

      const [arbolesResponse, especiesData, estadisticasData] = await Promise.all([
        fetch(endpoint),
        fetchEspecies(),
        getEstadisticasArboles(parcelaId)
      ])

      if (!arbolesResponse.ok) {
        throw new Error('Error al cargar árboles')
      }

      const arbolesData = await arbolesResponse.json()
      setArboles(arbolesData)
      setEspecies(especiesData)
      setEstadisticas(estadisticasData)
      setError(null)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar la información de árboles')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNuevoArbol(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validarFormulario = () => {
    if (!nuevoArbol.dap || !nuevoArbol.altura || !nuevoArbol.especie_id) {
      toast.error('Por favor complete todos los campos obligatorios')
      return false
    }

    const dap = parseFloat(nuevoArbol.dap)
    if (dap < 10) {
      toast.error('El DAP debe ser mayor o igual a 10 cm (según protocolo)')
      return false
    }

    const altura = parseFloat(nuevoArbol.altura)
    if (altura <= 0) {
      toast.error('La altura debe ser mayor a 0')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      return
    }

    try {
      // Calcular el siguiente número automáticamente
      const maxNumero = arboles.length > 0
        ? Math.max(...arboles.map(a => a.numero_arbol || 0))
        : 0
      const siguienteNumero = maxNumero + 1

      const arbolData = {
        parcela_id: parcelaId,
        subparcela_id: subparcelaId || null,
        numero_arbol: siguienteNumero,
        dap: parseFloat(nuevoArbol.dap),
        altura: parseFloat(nuevoArbol.altura),
        especie_id: parseInt(nuevoArbol.especie_id),
        latitud: nuevoArbol.latitud ? parseFloat(nuevoArbol.latitud) : null,
        longitud: nuevoArbol.longitud ? parseFloat(nuevoArbol.longitud) : null,
        estado_sanitario: nuevoArbol.estado_sanitario,
        observaciones: nuevoArbol.observaciones || null
      }

      await createArbol(arbolData)

      setNuevoArbol({
        dap: '',
        altura: '',
        especie_id: '',
        latitud: '',
        longitud: '',
        estado_sanitario: 'sano',
        observaciones: ''
      })

      setMostrarFormulario(false)
      await cargarDatos()
      toast.success(`Árbol #${siguienteNumero} registrado exitosamente`)
    } catch (err) {
      console.error('Error al crear árbol:', err)
      toast.error('Error al registrar el árbol: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleEliminar = async (arbolId, numero) => {
    if (!confirm(`¿Está seguro de eliminar el árbol #${numero}?`)) {
      return
    }

    try {
      await deleteArbol(arbolId)
      await cargarDatos()
      toast.success('Árbol eliminado exitosamente')
    } catch (err) {
      console.error('Error al eliminar árbol:', err)
      toast.error('Error al eliminar el árbol')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Información de Subparcela */}
      {subparcela && (
        <Card className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500 text-white">
                  <Square className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Trabajando en Subparcela: {subparcela.codigo}
                  </CardTitle>
                  <CardDescription className="text-orange-700 dark:text-orange-300">
                    {subparcela.nombre || 'Sin nombre'} • Tamaño: 10m × 10m (100 m²)
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="border-orange-500 text-orange-700">
                Vértice {subparcela.vertice_origen}
              </Badge>
            </div>
          </CardHeader>
          {(subparcela.proposito || subparcela.observaciones) && (
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {subparcela.proposito && (
                  <div>
                    <span className="font-medium text-orange-700 dark:text-orange-300">Propósito:</span>{' '}
                    {subparcela.proposito}
                  </div>
                )}
                {subparcela.observaciones && (
                  <div>
                    <span className="font-medium text-orange-700 dark:text-orange-300">Observaciones:</span>{' '}
                    {subparcela.observaciones}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TreeDeciduous className="h-4 w-4 text-primary" />
                Total de Árboles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{estadisticas.total_arboles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                DAP Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{estadisticas.dap_promedio?.toFixed(2) || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">cm</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Altura Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{estadisticas.altura_promedio?.toFixed(2) || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">metros</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Área Basal Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{estadisticas.area_basal_total?.toFixed(4) || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">m²</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Árboles Registrados ({arboles.length})</h3>
          <p className="text-sm text-muted-foreground">
            {subparcela
              ? `Gestiona los árboles de la subparcela ${subparcela.codigo} (10m × 10m)`
              : 'Gestiona los árboles de la parcela completa'}
          </p>
        </div>
        <Button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className={mostrarFormulario ? 'bg-destructive hover:bg-destructive/90' : ''}
        >
          {mostrarFormulario ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Árbol
            </>
          )}
        </Button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Árbol</CardTitle>
            <CardDescription>Complete la información del árbol a registrar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Número automático:</strong> Este árbol será el #{arboles.length > 0 ? Math.max(...arboles.map(a => a.numero_arbol || 0)) + 1 : 1}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="especie_id">
                    Especie <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={nuevoArbol.especie_id}
                    onValueChange={(value) => setNuevoArbol(prev => ({ ...prev, especie_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione especie" />
                    </SelectTrigger>
                    <SelectContent>
                      {especies.map(especie => (
                        <SelectItem key={especie.id} value={especie.id.toString()}>
                          {especie.nombre_cientifico} ({especie.nombre_comun})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dap">
                    DAP (cm) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="dap"
                    type="number"
                    step="0.1"
                    name="dap"
                    value={nuevoArbol.dap}
                    onChange={handleInputChange}
                    placeholder="Ej: 25.5"
                    min="10"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Mínimo 10 cm según protocolo</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altura">
                    Altura (m) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="altura"
                    type="number"
                    step="0.1"
                    name="altura"
                    value={nuevoArbol.altura}
                    onChange={handleInputChange}
                    placeholder="Ej: 12.5"
                    min="0.1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latitud">Latitud (GPS)</Label>
                  <Input
                    id="latitud"
                    type="number"
                    step="0.0000001"
                    name="latitud"
                    value={nuevoArbol.latitud}
                    onChange={handleInputChange}
                    placeholder="Ej: -3.123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitud">Longitud (GPS)</Label>
                  <Input
                    id="longitud"
                    type="number"
                    step="0.0000001"
                    name="longitud"
                    value={nuevoArbol.longitud}
                    onChange={handleInputChange}
                    placeholder="Ej: -69.987654"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado_sanitario">Estado Sanitario</Label>
                  <Select
                    value={nuevoArbol.estado_sanitario}
                    onValueChange={(value) => setNuevoArbol(prev => ({ ...prev, estado_sanitario: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sano">Sano</SelectItem>
                      <SelectItem value="inclinado">Inclinado</SelectItem>
                      <SelectItem value="seco">Seco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Input
                    id="observaciones"
                    name="observaciones"
                    value={nuevoArbol.observaciones}
                    onChange={handleInputChange}
                    placeholder="Observaciones adicionales"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-primary">
                  Guardar Árbol
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Tabla de árboles */}
      {arboles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TreeDeciduous className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground text-center">
              No hay árboles registrados.<br />
              Haga clic en "Agregar Árbol" para comenzar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Especie</TableHead>
                    <TableHead>DAP (cm)</TableHead>
                    <TableHead>Altura (m)</TableHead>
                    <TableHead>Coordenadas GPS</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arboles.map(arbol => {
                    const especie = especies.find(e => e.id === arbol.especie_id)
                    return (
                      <TableRow key={arbol.id}>
                        <TableCell className="font-semibold">#{arbol.numero_arbol}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium italic">{especie?.nombre_cientifico || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{especie?.nombre_comun || ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>{arbol.dap.toFixed(1)}</TableCell>
                        <TableCell>{arbol.altura.toFixed(1)}</TableCell>
                        <TableCell className="text-xs font-mono">
                          {arbol.latitud && arbol.longitud
                            ? `${arbol.latitud.toFixed(6)}, ${arbol.longitud.toFixed(6)}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              arbol.estado_sanitario === 'sano' ? 'default' :
                              arbol.estado_sanitario === 'inclinado' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {arbol.estado_sanitario}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminar(arbol.id, arbol.numero)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default GestionArboles
