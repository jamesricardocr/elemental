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
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

const GestionArboles = ({ parcelaId }) => {
  const [arboles, setArboles] = useState([])
  const [especies, setEspecies] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [nuevoArbol, setNuevoArbol] = useState({
    numero: '',
    dap: '',
    altura: '',
    especie_id: '',
    posicion_x: '',
    posicion_y: '',
    estado_sanitario: 'bueno',
    observaciones: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [parcelaId])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [arbolesData, especiesData, estadisticasData] = await Promise.all([
        fetchArbolesParcela(parcelaId),
        fetchEspecies(),
        getEstadisticasArboles(parcelaId)
      ])

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
    if (!nuevoArbol.numero || !nuevoArbol.dap || !nuevoArbol.altura || !nuevoArbol.especie_id) {
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
      const arbolData = {
        parcela_id: parcelaId,
        numero: parseInt(nuevoArbol.numero),
        dap: parseFloat(nuevoArbol.dap),
        altura: parseFloat(nuevoArbol.altura),
        especie_id: parseInt(nuevoArbol.especie_id),
        posicion_x: nuevoArbol.posicion_x ? parseFloat(nuevoArbol.posicion_x) : null,
        posicion_y: nuevoArbol.posicion_y ? parseFloat(nuevoArbol.posicion_y) : null,
        estado_sanitario: nuevoArbol.estado_sanitario,
        observaciones: nuevoArbol.observaciones || null
      }

      await createArbol(arbolData)

      setNuevoArbol({
        numero: '',
        dap: '',
        altura: '',
        especie_id: '',
        posicion_x: '',
        posicion_y: '',
        estado_sanitario: 'bueno',
        observaciones: ''
      })

      setMostrarFormulario(false)
      await cargarDatos()
      toast.success('Árbol registrado exitosamente')
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
          <p className="text-sm text-muted-foreground">Gestiona los árboles de la parcela</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">
                    Número de Árbol <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="numero"
                    type="number"
                    name="numero"
                    value={nuevoArbol.numero}
                    onChange={handleInputChange}
                    placeholder="Ej: 1"
                    required
                  />
                </div>

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
                  <Label htmlFor="posicion_x">Posición X (m)</Label>
                  <Input
                    id="posicion_x"
                    type="number"
                    step="0.1"
                    name="posicion_x"
                    value={nuevoArbol.posicion_x}
                    onChange={handleInputChange}
                    placeholder="Opcional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="posicion_y">Posición Y (m)</Label>
                  <Input
                    id="posicion_y"
                    type="number"
                    step="0.1"
                    name="posicion_y"
                    value={nuevoArbol.posicion_y}
                    onChange={handleInputChange}
                    placeholder="Opcional"
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
                      <SelectItem value="bueno">Bueno</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="malo">Malo</SelectItem>
                      <SelectItem value="muerto">Muerto</SelectItem>
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
                    <TableHead>Posición</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arboles.map(arbol => {
                    const especie = especies.find(e => e.id === arbol.especie_id)
                    return (
                      <TableRow key={arbol.id}>
                        <TableCell className="font-semibold">#{arbol.numero}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium italic">{especie?.nombre_cientifico || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{especie?.nombre_comun || ''}</div>
                          </div>
                        </TableCell>
                        <TableCell>{arbol.dap.toFixed(1)}</TableCell>
                        <TableCell>{arbol.altura.toFixed(1)}</TableCell>
                        <TableCell className="text-xs font-mono">
                          {arbol.posicion_x && arbol.posicion_y
                            ? `(${arbol.posicion_x.toFixed(1)}, ${arbol.posicion_y.toFixed(1)})`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              arbol.estado_sanitario === 'bueno' ? 'default' :
                              arbol.estado_sanitario === 'regular' ? 'secondary' :
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
