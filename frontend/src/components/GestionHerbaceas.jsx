import { useState, useEffect } from 'react'
import {
  fetchHerbaceasParcela,
  createHerbaceas,
  deleteHerbaceas
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
  Sprout,
  Plus,
  Trash2,
  X,
  Scale,
  Square,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'

const GestionHerbaceas = ({ subparcelaId, subparcela, parcelaId, onVolver }) => {
  const [herbaceas, setHerbaceas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const getFormularioInicial = () => ({
    tipo_agrupacion: 'gramineas',
    n_individuos: '',
    altura_maxima: '',
    altura_minima: '',
    altura_promedio: '',
    pf_total: '',
    pf_submuestra: '',
    ps_submuestra: '',
    observaciones: ''
  })

  const [nuevaHerbacea, setNuevaHerbacea] = useState(getFormularioInicial())

  useEffect(() => {
    cargarHerbaceas()
  }, [subparcelaId, parcelaId])

  const cargarHerbaceas = async () => {
    try {
      setLoading(true)

      const endpoint = subparcelaId
        ? `/api/v1/herbaceas/subparcela/${subparcelaId}`
        : `/api/v1/herbaceas/parcela/${parcelaId}`

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Error al cargar herbáceas')
      }

      const data = await response.json()
      setHerbaceas(data)
      setError(null)
    } catch (err) {
      console.error('Error al cargar herbáceas:', err)
      setError('Error al cargar la información de herbáceas')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNuevaHerbacea(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validarFormulario = () => {
    if (!nuevaHerbacea.pf_total || !nuevaHerbacea.pf_submuestra || !nuevaHerbacea.ps_submuestra) {
      toast.error('Complete PFtotal, PFsub y PSsub')
      return false
    }

    const pfTotal = parseFloat(nuevaHerbacea.pf_total)
    const pfSub = parseFloat(nuevaHerbacea.pf_submuestra)
    const psSub = parseFloat(nuevaHerbacea.ps_submuestra)

    if (pfTotal <= 0 || pfSub <= 0 || psSub <= 0) {
      toast.error('Los pesos deben ser mayores a 0')
      return false
    }

    if (psSub > pfSub) {
      toast.error('El peso seco no puede ser mayor al peso fresco de la submuestra')
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
      const herbaceaData = {
        parcela_id: parcelaId,
        subparcela_id: subparcelaId || null,
        tipo_agrupacion: nuevaHerbacea.tipo_agrupacion,
        n_individuos: nuevaHerbacea.n_individuos ? parseInt(nuevaHerbacea.n_individuos) : null,
        altura_maxima: nuevaHerbacea.altura_maxima ? parseFloat(nuevaHerbacea.altura_maxima) : null,
        altura_minima: nuevaHerbacea.altura_minima ? parseFloat(nuevaHerbacea.altura_minima) : null,
        altura_promedio: nuevaHerbacea.altura_promedio ? parseFloat(nuevaHerbacea.altura_promedio) : null,
        pf_total: parseFloat(nuevaHerbacea.pf_total),
        pf_submuestra: parseFloat(nuevaHerbacea.pf_submuestra),
        ps_submuestra: parseFloat(nuevaHerbacea.ps_submuestra),
        observaciones: nuevaHerbacea.observaciones || null
      }

      await createHerbaceas(herbaceaData)

      setNuevaHerbacea(getFormularioInicial())
      setMostrarFormulario(false)
      await cargarHerbaceas()
      toast.success('Herbácea registrada exitosamente')
    } catch (err) {
      console.error('Error al crear herbácea:', err)
      toast.error('Error al registrar herbácea: ' + (err.message || 'Error desconocido'))
    }
  }

  const handleEliminar = async (herbaceaId, tipo) => {
    if (!confirm(`¿Está seguro de eliminar este registro de ${tipo}?`)) {
      return
    }

    try {
      await deleteHerbaceas(herbaceaId)
      await cargarHerbaceas()
      toast.success('Herbácea eliminada exitosamente')
    } catch (err) {
      console.error('Error al eliminar herbácea:', err)
      toast.error('Error al eliminar la herbácea')
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

  return (
    <div className="space-y-6">
      {/* Indicador de subparcela */}
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
                  <CardDescription className="text-orange-700">
                    {subparcela.nombre || 'Sin nombre'} • Tamaño: 10m × 10m (100 m²)
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-orange-500 text-orange-700">
                  Vértice {subparcela.vertice_origen}
                </Badge>
                {onVolver && (
                  <Button variant="outline" size="sm" onClick={onVolver}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Subparcelas
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Header con botón */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sprout className="h-6 w-6 text-green-600" />
            Medición de Vegetación Herbácea
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Cuadro de 2×2 m (4m²) - Factor de extrapolación: 250
          </p>
        </div>
        <Button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          {mostrarFormulario ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Registro
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Registro de Vegetación Herbácea</CardTitle>
            <CardDescription>
              Complete los campos según el protocolo de medición en cuadro de 2×2 m
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Alerta con fórmulas */}
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>CUADRO:</strong> 2×2 m (4m²)
                  <br />
                  <strong>Agrupación:</strong> gramíneas, helechos, plántulas, hojas anchas, etc.
                  <br />
                  <strong>Fórmulas:</strong> Fs = PSsub / PFsub → Biomasa = PFtotal × Fs → B₀.₁ha = Biomasa × 250 → C = B₀.₁ha × 0,47
                </AlertDescription>
              </Alert>

              {/* Tipo de agrupación */}
              <div className="space-y-2">
                <Label>Tipo de Agrupación <span className="text-red-500">*</span></Label>
                <Select
                  value={nuevaHerbacea.tipo_agrupacion}
                  onValueChange={(value) => setNuevaHerbacea(prev => ({ ...prev, tipo_agrupacion: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gramineas">Gramíneas</SelectItem>
                    <SelectItem value="helechos">Helechos</SelectItem>
                    <SelectItem value="plantulas">Plántulas</SelectItem>
                    <SelectItem value="hojas_anchas">Hojas Anchas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Conteo y alturas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Conteo de Individuos y Alturas</h3>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="n_individuos">N° de individuos</Label>
                    <Input
                      id="n_individuos"
                      name="n_individuos"
                      type="number"
                      value={nuevaHerbacea.n_individuos}
                      onChange={handleInputChange}
                      placeholder="Contar individuos"
                    />
                    <p className="text-xs text-muted-foreground">Tipo agrupado en cuadro 2×2m</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="altura_maxima">h max (m)</Label>
                    <Input
                      id="altura_maxima"
                      name="altura_maxima"
                      type="number"
                      step="0.01"
                      value={nuevaHerbacea.altura_maxima}
                      onChange={handleInputChange}
                      placeholder="Altura máxima"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="altura_minima">h min (m)</Label>
                    <Input
                      id="altura_minima"
                      name="altura_minima"
                      type="number"
                      step="0.01"
                      value={nuevaHerbacea.altura_minima}
                      onChange={handleInputChange}
                      placeholder="Altura mínima"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="altura_promedio">h prom (m)</Label>
                    <Input
                      id="altura_promedio"
                      name="altura_promedio"
                      type="number"
                      step="0.01"
                      value={nuevaHerbacea.altura_promedio}
                      onChange={handleInputChange}
                      placeholder="Altura promedio"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Pesos de campo */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Pesos de Campo</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pf_total">PFtotal (kg) <span className="text-red-500">*</span></Label>
                    <Input
                      id="pf_total"
                      name="pf_total"
                      type="number"
                      step="0.001"
                      value={nuevaHerbacea.pf_total}
                      onChange={handleInputChange}
                      placeholder="Peso fresco total"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Cortar y registrar peso fresco total del cuadrante 2×2m</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pf_submuestra">PFsub (kg) <span className="text-red-500">*</span></Label>
                    <Input
                      id="pf_submuestra"
                      name="pf_submuestra"
                      type="number"
                      step="0.001"
                      value={nuevaHerbacea.pf_submuestra}
                      onChange={handleInputChange}
                      placeholder="Peso fresco submuestra"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Pesar submuestra entre 200-300 g</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ps_submuestra">PSsub (kg) <span className="text-red-500">*</span></Label>
                    <Input
                      id="ps_submuestra"
                      name="ps_submuestra"
                      type="number"
                      step="0.001"
                      value={nuevaHerbacea.ps_submuestra}
                      onChange={handleInputChange}
                      placeholder="Peso seco submuestra"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Registrar peso seco de la submuestra</p>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Input
                  id="observaciones"
                  name="observaciones"
                  value={nuevaHerbacea.observaciones}
                  onChange={handleInputChange}
                  placeholder="Notas adicionales"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setMostrarFormulario(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de registros */}
      {herbaceas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sprout className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay registros de herbáceas</p>
            <p className="text-sm text-muted-foreground">
              {subparcela
                ? `Agregue el primer registro para la subparcela ${subparcela.codigo}`
                : 'Agregue el primer registro'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Registros de Herbáceas ({herbaceas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>N° Ind.</TableHead>
                    <TableHead>h prom (m)</TableHead>
                    <TableHead>Biomasa Seca (kg)</TableHead>
                    <TableHead>B 0.1ha (kg)</TableHead>
                    <TableHead>Carbono (kg)</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {herbaceas.map(herbacea => (
                    <TableRow key={herbacea.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {herbacea.tipo_agrupacion === 'gramineas' && 'Gramíneas'}
                          {herbacea.tipo_agrupacion === 'helechos' && 'Helechos'}
                          {herbacea.tipo_agrupacion === 'plantulas' && 'Plántulas'}
                          {herbacea.tipo_agrupacion === 'hojas_anchas' && 'Hojas Anchas'}
                        </Badge>
                      </TableCell>
                      <TableCell>{herbacea.n_individuos || 'N/A'}</TableCell>
                      <TableCell>{herbacea.altura_promedio?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>{herbacea.biomasa_seca?.toFixed(3) || 'N/A'}</TableCell>
                      <TableCell>{herbacea.biomasa_01ha?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell className="font-semibold">{herbacea.carbono?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminar(herbacea.id, herbacea.tipo_agrupacion)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default GestionHerbaceas
