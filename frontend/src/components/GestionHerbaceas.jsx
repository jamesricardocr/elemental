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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  Sprout,
  Plus,
  Trash2,
  X,
  Scale,
  Percent,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

const GestionHerbaceas = ({ parcelaId }) => {
  const [herbaceas, setHerbaceas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [nuevaHerbacea, setNuevaHerbacea] = useState({
    cuadrante_numero: '',
    peso_fresco: '',
    peso_seco: '',
    cobertura_porcentaje: '',
    observaciones: ''
  })

  useEffect(() => {
    cargarHerbaceas()
  }, [parcelaId])

  const cargarHerbaceas = async () => {
    try {
      setLoading(true)
      const data = await fetchHerbaceasParcela(parcelaId)
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
    if (!nuevaHerbacea.cuadrante_numero || !nuevaHerbacea.peso_fresco || !nuevaHerbacea.peso_seco) {
      toast.error('Por favor complete todos los campos obligatorios')
      return false
    }

    const pesoFresco = parseFloat(nuevaHerbacea.peso_fresco)
    const pesoSeco = parseFloat(nuevaHerbacea.peso_seco)

    if (pesoFresco <= 0 || pesoSeco <= 0) {
      toast.error('Los pesos deben ser mayores a 0')
      return false
    }

    if (pesoSeco > pesoFresco) {
      toast.error('El peso seco no puede ser mayor al peso fresco')
      return false
    }

    if (nuevaHerbacea.cobertura_porcentaje) {
      const cobertura = parseFloat(nuevaHerbacea.cobertura_porcentaje)
      if (cobertura < 0 || cobertura > 100) {
        toast.error('La cobertura debe estar entre 0 y 100%')
        return false
      }
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
        cuadrante_numero: parseInt(nuevaHerbacea.cuadrante_numero),
        peso_fresco: parseFloat(nuevaHerbacea.peso_fresco),
        peso_seco: parseFloat(nuevaHerbacea.peso_seco),
        cobertura_porcentaje: nuevaHerbacea.cobertura_porcentaje
          ? parseFloat(nuevaHerbacea.cobertura_porcentaje)
          : null,
        observaciones: nuevaHerbacea.observaciones || null
      }

      await createHerbaceas(herbaceaData)

      setNuevaHerbacea({
        cuadrante_numero: '',
        peso_fresco: '',
        peso_seco: '',
        cobertura_porcentaje: '',
        observaciones: ''
      })

      setMostrarFormulario(false)
      await cargarHerbaceas()
      toast.success('Herbácea registrada exitosamente')
    } catch (err) {
      console.error('Error al crear herbácea:', err)
      toast.error('Error al registrar la herbácea: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleEliminar = async (herbaceaId, cuadrante) => {
    if (!confirm(`¿Está seguro de eliminar el registro del cuadrante #${cuadrante}?`)) {
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

  const calcularEstadisticas = () => {
    if (herbaceas.length === 0) return null

    const totalPesoFresco = herbaceas.reduce((sum, h) => sum + h.peso_fresco, 0)
    const totalPesoSeco = herbaceas.reduce((sum, h) => sum + h.peso_seco, 0)
    const herbaceasConCobertura = herbaceas.filter(h => h.cobertura_porcentaje !== null)
    const coberturaPromedio = herbaceasConCobertura.length > 0
      ? herbaceasConCobertura.reduce((sum, h) => sum + h.cobertura_porcentaje, 0) / herbaceasConCobertura.length
      : 0

    return {
      total: herbaceas.length,
      totalPesoFresco,
      totalPesoSeco,
      promedioPesoSeco: totalPesoSeco / herbaceas.length,
      coberturaPromedio
    }
  }

  const estadisticas = calcularEstadisticas()

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
      {/* Protocolo Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Protocolo de Vegetación Herbácea
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Tamaño de Cuadrante:</p>
              <p className="text-muted-foreground">1m × 1m (1 m²)</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Procedimiento:</p>
              <p className="text-muted-foreground">Cortar toda vegetación herbácea a ras del suelo</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Medición:</p>
              <p className="text-muted-foreground">Pesar biomasa fresca, tomar submuestra para secado</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Extrapolación:</p>
              <p className="text-muted-foreground">Calcular biomasa seca por unidad de área (kg/ha)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sprout className="h-4 w-4 text-primary" />
                Total Cuadrantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{estadisticas.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Peso Seco Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{estadisticas.totalPesoSeco.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">kg</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Promedio Peso Seco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{estadisticas.promedioPesoSeco.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">kg por cuadrante</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                Cobertura Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {estadisticas.coberturaPromedio > 0 ? estadisticas.coberturaPromedio.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">% de cobertura</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Herbáceas Registradas ({herbaceas.length})</h3>
          <p className="text-sm text-muted-foreground">Registros de vegetación herbácea por cuadrante</p>
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
              Agregar Herbácea
            </>
          )}
        </Button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Vegetación Herbácea en Cuadrante</CardTitle>
            <CardDescription>Complete la información del cuadrante de 1m × 1m</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cuadrante_numero">
                    Número de Cuadrante (1m × 1m) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cuadrante_numero"
                    type="number"
                    name="cuadrante_numero"
                    value={nuevaHerbacea.cuadrante_numero}
                    onChange={handleInputChange}
                    placeholder="Ej: 1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cobertura_porcentaje">Cobertura (%)</Label>
                  <Input
                    id="cobertura_porcentaje"
                    type="number"
                    step="0.1"
                    name="cobertura_porcentaje"
                    value={nuevaHerbacea.cobertura_porcentaje}
                    onChange={handleInputChange}
                    placeholder="Ej: 75.5"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">Estimación visual del área cubierta</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peso_fresco">
                    Peso Fresco (kg) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="peso_fresco"
                    type="number"
                    step="0.01"
                    name="peso_fresco"
                    value={nuevaHerbacea.peso_fresco}
                    onChange={handleInputChange}
                    placeholder="Ej: 2.50"
                    min="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peso_seco">
                    Peso Seco (kg) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="peso_seco"
                    type="number"
                    step="0.01"
                    name="peso_seco"
                    value={nuevaHerbacea.peso_seco}
                    onChange={handleInputChange}
                    placeholder="Ej: 1.20"
                    min="0.01"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Después del secado en laboratorio</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    name="observaciones"
                    value={nuevaHerbacea.observaciones}
                    onChange={handleInputChange}
                    placeholder="Observaciones adicionales..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-primary">
                  Guardar Herbácea
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Tabla de herbáceas */}
      {herbaceas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sprout className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground text-center">
              No hay herbáceas registradas.<br />
              Haga clic en "Agregar Herbácea" para comenzar.
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
                    <TableHead>Cuadrante</TableHead>
                    <TableHead>Peso Fresco (kg)</TableHead>
                    <TableHead>Peso Seco (kg)</TableHead>
                    <TableHead>Relación PS/PF</TableHead>
                    <TableHead>Cobertura (%)</TableHead>
                    <TableHead>Biomasa por Ha</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {herbaceas.map(herbacea => (
                    <TableRow key={herbacea.id}>
                      <TableCell>
                        <Badge variant="secondary">#{herbacea.cuadrante_numero}</Badge>
                      </TableCell>
                      <TableCell>{herbacea.peso_fresco.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">{herbacea.peso_seco.toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {(herbacea.peso_seco / herbacea.peso_fresco).toFixed(3)}
                      </TableCell>
                      <TableCell>
                        {herbacea.cobertura_porcentaje !== null
                          ? `${herbacea.cobertura_porcentaje.toFixed(1)}%`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {herbacea.biomasa_por_hectarea
                          ? `${herbacea.biomasa_por_hectarea.toFixed(2)} kg/ha`
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {herbacea.observaciones || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminar(herbacea.id, herbacea.cuadrante_numero)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
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
