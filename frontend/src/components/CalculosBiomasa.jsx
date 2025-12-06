import { useState, useEffect } from 'react'
import {
  ejecutarCalculoBiomasa,
  getCalculosParcela
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
  Calculator,
  Plus,
  X,
  TreeDeciduous,
  Sprout,
  Leaf,
  Weight,
  BarChart3,
  Gem,
  Info,
  Loader2,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'

const CalculosBiomasa = ({ parcelaId }) => {
  const [calculos, setCalculos] = useState([])
  const [calculoSeleccionado, setCalculoSeleccionado] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ejecutando, setEjecutando] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [parametrosCalculo, setParametrosCalculo] = useState({
    modelo_alometrico: 'chave2014',
    factor_carbono: '0.47'
  })

  useEffect(() => {
    cargarCalculos()
  }, [parcelaId])

  const cargarCalculos = async () => {
    try {
      setLoading(true)

      const endpoint = `/api/v1/calculos/parcela/${parcelaId}`

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Error al cargar cálculos')
      }

      const data = await response.json()
      setCalculos(data)

      // Seleccionar el más reciente por defecto
      if (data.length > 0 && !calculoSeleccionado) {
        setCalculoSeleccionado(data[0])
      }

      setError(null)
    } catch (err) {
      console.error('Error al cargar cálculos:', err)
      setError('Error al cargar los cálculos de biomasa')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarCalculo = async (calculoId) => {
    if (!confirm('¿Está seguro de eliminar este cálculo? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/v1/calculos/${calculoId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar cálculo')
      }

      // Si el cálculo eliminado era el seleccionado, seleccionar otro
      if (calculoSeleccionado?.id === calculoId) {
        const calculosRestantes = calculos.filter(c => c.id !== calculoId)
        setCalculoSeleccionado(calculosRestantes.length > 0 ? calculosRestantes[0] : null)
      }

      await cargarCalculos()
      toast.success('Cálculo eliminado exitosamente')
    } catch (err) {
      console.error('Error al eliminar cálculo:', err)
      toast.error('Error al eliminar el cálculo')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setParametrosCalculo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEjecutarCalculo = async (e) => {
    e.preventDefault()

    const factorCarbono = parseFloat(parametrosCalculo.factor_carbono)
    if (factorCarbono <= 0 || factorCarbono > 1) {
      toast.error('El factor de carbono debe estar entre 0 y 1 (típicamente 0.47)')
      return
    }

    try {
      setEjecutando(true)
      await ejecutarCalculoBiomasa(
        parcelaId,
        parametrosCalculo.modelo_alometrico,
        factorCarbono
      )

      const nuevosCalculos = await cargarCalculos()
      setMostrarFormulario(false)
      toast.success('Cálculo ejecutado exitosamente')
    } catch (err) {
      console.error('Error al ejecutar cálculo:', err)
      toast.error('Error al ejecutar el cálculo: ' + (err.response?.data?.detail || err.message))
    } finally {
      setEjecutando(false)
    }
  }

  const calculoMostrar = calculoSeleccionado || (calculos.length > 0 ? calculos[0] : null)

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
      {/* Información de Modelos */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Modelos Alométricos Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Chave 2014</h4>
              <p className="text-xs text-muted-foreground">
                Modelo estándar para bosques húmedos tropicales. Utiliza DAP, altura y densidad de la madera.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">IPCC</h4>
              <p className="text-xs text-muted-foreground">
                Guías del Panel Intergubernamental sobre Cambio Climático. Factores de conversión para biomasa subterránea.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">IDEAM</h4>
              <p className="text-xs text-muted-foreground">
                Metodología del Instituto de Hidrología, Meteorología y Estudios Ambientales de Colombia.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header con botón ejecutar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cálculos de Biomasa ({calculos.length})</h3>
          <p className="text-sm text-muted-foreground">Estimaciones de biomasa y carbono almacenado</p>
        </div>
        <Button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          disabled={ejecutando}
          className={mostrarFormulario ? 'bg-destructive hover:bg-destructive/90' : ''}
        >
          {mostrarFormulario ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Ejecutar Nuevo Cálculo
            </>
          )}
        </Button>
      </div>

      {/* Formulario de Cálculo */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Ejecutar Cálculo de Biomasa y Carbono</CardTitle>
            <CardDescription>Configure los parámetros del modelo alométrico</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEjecutarCalculo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelo_alometrico">
                    Modelo Alométrico <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={parametrosCalculo.modelo_alometrico}
                    onValueChange={(value) => setParametrosCalculo(prev => ({ ...prev, modelo_alometrico: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chave2014">Chave 2014 (Bosques Húmedos Tropicales)</SelectItem>
                      <SelectItem value="ipcc">IPCC (Directrices Generales)</SelectItem>
                      <SelectItem value="ideam">IDEAM (Metodología Colombia)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="factor_carbono">
                    Factor de Carbono <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="factor_carbono"
                    type="number"
                    step="0.01"
                    name="factor_carbono"
                    value={parametrosCalculo.factor_carbono}
                    onChange={handleInputChange}
                    placeholder="0.47"
                    min="0"
                    max="1"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Típicamente 0.47 (47% de la biomasa es carbono)</p>
                </div>
              </div>

              <Card className="border-muted bg-muted/20">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    El cálculo incluirá:
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <TreeDeciduous className="h-3 w-3 text-primary" />
                      Biomasa aérea de árboles (usando modelo seleccionado)
                    </li>
                    <li className="flex items-center gap-2">
                      <Sprout className="h-3 w-3 text-primary" />
                      Biomasa subterránea (raíces - factores IPCC)
                    </li>
                    <li className="flex items-center gap-2">
                      <Leaf className="h-3 w-3 text-accent-foreground" />
                      Necromasa (gruesa y fina)
                    </li>
                    <li className="flex items-center gap-2">
                      <Sprout className="h-3 w-3 text-primary" />
                      Biomasa herbácea
                    </li>
                    <li className="flex items-center gap-2">
                      <Gem className="h-3 w-3 text-primary" />
                      Conversión a carbono almacenado (t C/ha)
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={ejecutando} className="bg-primary">
                  {ejecutando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Ejecutar Cálculo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Resultado Seleccionado */}
      {calculoMostrar && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {calculoMostrar.id === calculos[0]?.id ? 'Resultado Más Reciente' : 'Resultado Seleccionado'}
            </h3>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">{calculoMostrar.modelo_alometrico.toUpperCase()}</Badge>
              <Badge variant="outline">Factor C: {calculoMostrar.factor_carbono}</Badge>
              <Badge variant="outline">{new Date(calculoMostrar.created_at).toLocaleDateString('es-CO')}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TreeDeciduous className="h-4 w-4 text-primary" />
                  Biomasa Aérea
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{calculoMostrar.biomasa_aerea.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">toneladas (Árboles)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-primary" />
                  Biomasa Subterránea
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{calculoMostrar.biomasa_subterranea.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">toneladas (Raíces)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-accent-foreground" />
                  Necromasa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{calculoMostrar.necromasa.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">toneladas (Biomasa Muerta)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-primary" />
                  Herbáceas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{calculoMostrar.herbaceas.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">toneladas (Vegetación Herbácea)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Biomasa Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{calculoMostrar.biomasa_total.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">toneladas (0.1 ha)</p>
              </CardContent>
            </Card>

            <Card className="border-primary bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gem className="h-4 w-4 text-primary" />
                  Carbono Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{calculoMostrar.carbono_total.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">t C • {(calculoMostrar.carbono_total * 10).toFixed(2)} t C/ha</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Separator />

      {/* Historial de Cálculos */}
      {calculos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Historial de Cálculos ({calculos.length})</h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Factor C</TableHead>
                      <TableHead>B. Aérea (t)</TableHead>
                      <TableHead>B. Subterránea (t)</TableHead>
                      <TableHead>Necromasa (t)</TableHead>
                      <TableHead>Herbáceas (t)</TableHead>
                      <TableHead>B. Total (t)</TableHead>
                      <TableHead>Carbono (t C)</TableHead>
                      <TableHead>t C/ha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculos.map(calc => (
                      <TableRow
                        key={calc.id}
                        onClick={() => setCalculoSeleccionado(calc)}
                        className={`cursor-pointer transition-colors ${
                          calculoMostrar?.id === calc.id
                            ? 'bg-primary/10 hover:bg-primary/15'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <TableCell className="text-xs">
                          {new Date(calc.created_at).toLocaleDateString('es-CO')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {calc.modelo_alometrico}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{calc.factor_carbono}</TableCell>
                        <TableCell>{calc.biomasa_aerea.toFixed(2)}</TableCell>
                        <TableCell>{calc.biomasa_subterranea.toFixed(2)}</TableCell>
                        <TableCell>{calc.necromasa.toFixed(2)}</TableCell>
                        <TableCell>{calc.herbaceas.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">{calc.biomasa_total.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">{calc.carbono_total.toFixed(2)}</TableCell>
                        <TableCell className="font-bold text-primary">
                          {(calc.carbono_total * 10).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEliminarCalculo(calc.id)}
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
        </div>
      )}

      {calculos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-center mb-2">
              No hay cálculos de biomasa ejecutados
            </p>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Para ejecutar un cálculo, primero asegúrese de tener registrados:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <TreeDeciduous className="h-4 w-4" />
                Árboles con mediciones de DAP y altura
              </li>
              <li className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Especies con densidad de madera
              </li>
              <li className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Necromasa (opcional pero recomendado)
              </li>
              <li className="flex items-center gap-2">
                <Sprout className="h-4 w-4" />
                Herbáceas (opcional pero recomendado)
              </li>
            </ul>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Luego haga clic en "Ejecutar Nuevo Cálculo"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CalculosBiomasa
