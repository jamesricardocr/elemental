import { useState, useEffect } from 'react'
import {
  fetchNecromasaParcela,
  createNecromasa,
  deleteNecromasa
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
  Leaf,
  Plus,
  Trash2,
  X,
  Weight
} from 'lucide-react'
import { toast } from 'sonner'

const GestionNecromasa = ({ parcelaId }) => {
  const [necromasas, setNecromasas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [nuevaNecromasa, setNuevaNecromasa] = useState({
    subparcela_numero: '',
    tipo: 'gruesa',
    peso_fresco: '',
    peso_seco: '',
    observaciones: ''
  })

  useEffect(() => {
    cargarNecromasa()
  }, [parcelaId])

  const cargarNecromasa = async () => {
    try {
      setLoading(true)
      const data = await fetchNecromasaParcela(parcelaId)
      setNecromasas(data)
      setError(null)
    } catch (err) {
      console.error('Error al cargar necromasa:', err)
      setError('Error al cargar la información de necromasa')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNuevaNecromasa(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validarFormulario = () => {
    if (!nuevaNecromasa.subparcela_numero || !nuevaNecromasa.peso_fresco || !nuevaNecromasa.peso_seco) {
      toast.error('Por favor complete todos los campos obligatorios')
      return false
    }

    const pesoFresco = parseFloat(nuevaNecromasa.peso_fresco)
    const pesoSeco = parseFloat(nuevaNecromasa.peso_seco)

    if (pesoFresco <= 0 || pesoSeco <= 0) {
      toast.error('Los pesos deben ser mayores a 0')
      return false
    }

    if (pesoSeco > pesoFresco) {
      toast.error('El peso seco no puede ser mayor al peso fresco')
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
      const necromasaData = {
        parcela_id: parcelaId,
        subparcela_numero: parseInt(nuevaNecromasa.subparcela_numero),
        tipo: nuevaNecromasa.tipo,
        peso_fresco: parseFloat(nuevaNecromasa.peso_fresco),
        peso_seco: parseFloat(nuevaNecromasa.peso_seco),
        observaciones: nuevaNecromasa.observaciones || null
      }

      await createNecromasa(necromasaData)

      setNuevaNecromasa({
        subparcela_numero: '',
        tipo: 'gruesa',
        peso_fresco: '',
        peso_seco: '',
        observaciones: ''
      })

      setMostrarFormulario(false)
      await cargarNecromasa()
      toast.success('Necromasa registrada exitosamente')
    } catch (err) {
      console.error('Error al crear necromasa:', err)
      toast.error('Error al registrar necromasa: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleEliminar = async (necromasaId, subparcela) => {
    if (!confirm(`¿Está seguro de eliminar la necromasa de la subparcela #${subparcela}?`)) {
      return
    }

    try {
      await deleteNecromasa(necromasaId)
      await cargarNecromasa()
      toast.success('Necromasa eliminada exitosamente')
    } catch (err) {
      console.error('Error al eliminar necromasa:', err)
      toast.error('Error al eliminar la necromasa')
    }
  }

  const calcularBiomasaSeca = (necromasa) => {
    return necromasa.peso_seco
  }

  const calcularRelacionSF = (necromasa) => {
    if (necromasa.peso_fresco === 0) return 0
    return (necromasa.peso_seco / necromasa.peso_fresco).toFixed(3)
  }

  const totalBiomasaSeca = necromasas.reduce((sum, n) => sum + n.peso_seco, 0)

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
      {/* Estadística total */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Weight className="h-4 w-4 text-primary" />
            Biomasa Total (Necromasa Seca)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalBiomasaSeca.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">kg</p>
        </CardContent>
      </Card>

      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Necromasa Registrada ({necromasas.length})</h3>
          <p className="text-sm text-muted-foreground">Registros de necromasa gruesa y fina</p>
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
              Agregar Necromasa
            </>
          )}
        </Button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nueva Necromasa</CardTitle>
            <CardDescription>Complete la información de la subparcela de necromasa (5m × 5m)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subparcela_numero">
                    Número de Subparcela <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="subparcela_numero"
                    type="number"
                    name="subparcela_numero"
                    value={nuevaNecromasa.subparcela_numero}
                    onChange={handleInputChange}
                    placeholder="Ej: 1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">
                    Tipo de Necromasa <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={nuevaNecromasa.tipo}
                    onValueChange={(value) => setNuevaNecromasa(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gruesa">Gruesa (&gt; 10 cm)</SelectItem>
                      <SelectItem value="fina">Fina (&lt; 10 cm)</SelectItem>
                    </SelectContent>
                  </Select>
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
                    value={nuevaNecromasa.peso_fresco}
                    onChange={handleInputChange}
                    placeholder="Ej: 5.5"
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
                    value={nuevaNecromasa.peso_seco}
                    onChange={handleInputChange}
                    placeholder="Ej: 3.2"
                    min="0.01"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Después del secado a 105°C</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Input
                    id="observaciones"
                    name="observaciones"
                    value={nuevaNecromasa.observaciones}
                    onChange={handleInputChange}
                    placeholder="Observaciones adicionales"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-primary">
                  Guardar Necromasa
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Tabla de necromasa */}
      {necromasas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground text-center">
              No hay necromasa registrada.<br />
              Haga clic en "Agregar Necromasa" para comenzar.
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
                    <TableHead>Subparcela</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Peso Fresco (kg)</TableHead>
                    <TableHead>Peso Seco (kg)</TableHead>
                    <TableHead>Relación S/F</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {necromasas.map(necromasa => (
                    <TableRow key={necromasa.id}>
                      <TableCell className="font-semibold">#{necromasa.subparcela_numero}</TableCell>
                      <TableCell>
                        <Badge variant={necromasa.tipo === 'gruesa' ? 'default' : 'secondary'}>
                          {necromasa.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{necromasa.peso_fresco.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">{necromasa.peso_seco.toFixed(2)}</TableCell>
                      <TableCell className="font-mono text-sm">{calcularRelacionSF(necromasa)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminar(necromasa.id, necromasa.subparcela_numero)}
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

export default GestionNecromasa
