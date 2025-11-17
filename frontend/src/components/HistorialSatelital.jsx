import { useState, useEffect } from 'react'
import { getCalculosSatelitalesParcela, deleteCalculoSatelital, getSerieTemporalSatelital, subirCSVNasa } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Satellite,
  Plus,
  Download,
  Trash2,
  Upload,
  Loader2,
  Sprout,
  Leaf,
  TreeDeciduous,
  Gem,
  Info,
  ExternalLink,
  TrendingUp,
  Cloud
} from 'lucide-react'
import { toast } from 'sonner'

const HistorialSatelital = ({ parcelaId, onNuevoAnalisis }) => {
  const [calculos, setCalculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [calculoSeleccionado, setCalculoSeleccionado] = useState(null)
  const [serieTemporal, setSerieTemporal] = useState(null)
  const [loadingSerie, setLoadingSerie] = useState(false)
  const [archivoCSV, setArchivoCSV] = useState(null)
  const [subiendoCSV, setSubiendoCSV] = useState(false)

  useEffect(() => {
    cargarCalculos()
  }, [parcelaId])

  const cargarCalculos = async () => {
    try {
      setLoading(true)
      const data = await getCalculosSatelitalesParcela(parcelaId)
      setCalculos(data)
    } catch (error) {
      console.error('Error al cargar cálculos satelitales:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarSerieTemporal = async (calculoId) => {
    try {
      setLoadingSerie(true)
      const data = await getSerieTemporalSatelital(calculoId)
      setSerieTemporal(data)
    } catch (error) {
      console.error('Error al cargar serie temporal:', error)
      setSerieTemporal(null)
    } finally {
      setLoadingSerie(false)
    }
  }

  const handleSeleccionarCalculo = (calculo) => {
    setCalculoSeleccionado(calculo)
    if (calculo.estado_procesamiento === 'completado') {
      cargarSerieTemporal(calculo.id)
    } else {
      setSerieTemporal(null)
    }
  }

  const descargarCSV = () => {
    if (!serieTemporal || !serieTemporal.datos) return

    const headers = ['Fecha', 'NDVI', 'EVI', 'Biomasa (t)', 'Carbono (t)', 'Calidad']
    const rows = serieTemporal.datos.map(d => [
      d.fecha,
      d.ndvi,
      d.evi,
      d.biomasa || '',
      d.carbono || '',
      d.calidad
    ])

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analisis_satelital_${calculoSeleccionado.id}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleEliminar = async (calculoId) => {
    if (!confirm('¿Estás seguro de eliminar este análisis satelital?')) {
      return
    }

    try {
      await deleteCalculoSatelital(calculoId)
      await cargarCalculos()
      if (calculoSeleccionado?.id === calculoId) {
        setCalculoSeleccionado(null)
      }
      toast.success('Análisis satelital eliminado')
    } catch (error) {
      console.error('Error al eliminar cálculo:', error)
      toast.error('Error al eliminar el análisis satelital')
    }
  }

  const handleSubirCSV = async () => {
    if (!archivoCSV || !calculoSeleccionado) return

    try {
      setSubiendoCSV(true)
      await subirCSVNasa(calculoSeleccionado.id, archivoCSV)

      await cargarCalculos()
      const calculoActualizado = await fetch(`http://localhost:8000/api/v1/calculos-satelitales/${calculoSeleccionado.id}`).then(r => r.json())
      setCalculoSeleccionado(calculoActualizado)

      if (calculoActualizado.estado_procesamiento === 'completado') {
        await cargarSerieTemporal(calculoActualizado.id)
      }

      setArchivoCSV(null)
      toast.success('CSV procesado exitosamente')
    } catch (error) {
      console.error('Error al subir CSV:', error)
      toast.error('Error al procesar el archivo CSV: ' + error.message)
    } finally {
      setSubiendoCSV(false)
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      completado: { text: 'Completado', variant: 'default' },
      procesando: { text: 'Procesando', variant: 'secondary' },
      esperando_csv: { text: 'Esperando CSV', variant: 'outline' },
      error: { text: 'Error', variant: 'destructive' },
      pendiente: { text: 'Pendiente', variant: 'outline' }
    }
    return badges[estado] || { text: estado, variant: 'outline' }
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
    <TooltipProvider>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Análisis Satelitales ({calculos.length})</h3>
          <p className="text-sm text-muted-foreground">Estimaciones de carbono mediante teledetección</p>
        </div>
        <Button onClick={onNuevoAnalisis}>
          <Satellite className="mr-2 h-4 w-4" />
          Nuevo Análisis
        </Button>
      </div>

      {calculos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Satellite className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-center mb-2">
              No hay análisis satelitales realizados
            </p>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Realiza tu primer análisis satelital para estimar biomasa y carbono usando datos de NASA
            </p>
            <Button onClick={onNuevoAnalisis}>
              Realizar Primer Análisis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de cálculos */}
          <div className="lg:col-span-1 space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Historial ({calculos.length})</h4>
            <div className="space-y-2">
              {calculos.map(calculo => {
                const badge = getEstadoBadge(calculo.estado_procesamiento)
                return (
                  <Card
                    key={calculo.id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      calculoSeleccionado?.id === calculo.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleSeleccionarCalculo(calculo)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={badge.variant}>{badge.text}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(calculo.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {calculo.fecha_inicio} → {calculo.fecha_fin}
                      </div>
                      {calculo.estado_procesamiento === 'completado' && (
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">NDVI: {calculo.ndvi_promedio?.toFixed(3)}</Badge>
                          <Badge variant="outline" className="text-xs">C: {calculo.carbono_estimado?.toFixed(2)} t</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Detalle del cálculo */}
          {calculoSeleccionado && (
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Análisis #{calculoSeleccionado.id}</CardTitle>
                    <div className="flex gap-2">
                      {calculoSeleccionado.estado_procesamiento === 'completado' && serieTemporal && (
                        <Button variant="outline" size="sm" onClick={descargarCSV}>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar CSV
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEliminar(calculoSeleccionado.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {calculoSeleccionado.estado_procesamiento === 'completado' ? (
                    <>
                      {/* Info básica */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Periodo</p>
                          <p className="font-medium">{calculoSeleccionado.fecha_inicio} - {calculoSeleccionado.fecha_fin}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Modelo</p>
                          <p className="font-medium">{calculoSeleccionado.modelo_estimacion}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Fecha Análisis</p>
                          <p className="font-medium">{new Date(calculoSeleccionado.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Resultados principales */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Card className="border-primary/20 bg-primary/5">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium flex items-center gap-2">
                              <Sprout className="h-3 w-3 text-primary" />
                              NDVI
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                  <button type="button" className="inline-flex items-center">
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <div className="space-y-1">
                                    <p className="font-semibold">Índice de Vegetación Normalizado (NDVI)</p>
                                    <p className="text-xs">Mide la salud y vigor de la vegetación mediante reflectancia de luz.</p>
                                    <div className="text-xs mt-2 space-y-0.5">
                                      <p><strong>Rangos:</strong></p>
                                      <p>• 0.8 - 1.0: Vegetación muy densa y saludable</p>
                                      <p>• 0.6 - 0.8: Vegetación moderada a densa</p>
                                      <p>• 0.4 - 0.6: Vegetación dispersa</p>
                                      <p>• 0.2 - 0.4: Vegetación escasa</p>
                                      <p>• &lt; 0.2: Suelo desnudo o agua</p>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{calculoSeleccionado.ndvi_promedio?.toFixed(3) || 'N/A'}</div>
                            {calculoSeleccionado.ndvi_min && calculoSeleccionado.ndvi_max && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {calculoSeleccionado.ndvi_min.toFixed(3)} - {calculoSeleccionado.ndvi_max.toFixed(3)}
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        <Card className="border-teal-600/20 bg-teal-600/5">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium flex items-center gap-2">
                              <Leaf className="h-3 w-3 text-teal-600" />
                              EVI
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                  <button type="button" className="inline-flex items-center">
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <div className="space-y-1">
                                    <p className="font-semibold">Índice de Vegetación Mejorado (EVI)</p>
                                    <p className="text-xs">Optimizado para áreas de alta biomasa como bosques tropicales. Reduce efectos de saturación y ruido atmosférico.</p>
                                    <div className="text-xs mt-2 space-y-0.5">
                                      <p><strong>Rangos:</strong></p>
                                      <p>• 0.6 - 1.0: Bosque tropical denso y saludable</p>
                                      <p>• 0.4 - 0.6: Vegetación moderada</p>
                                      <p>• 0.2 - 0.4: Vegetación dispersa o degradada</p>
                                      <p>• &lt; 0.2: Poca o nula vegetación</p>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{calculoSeleccionado.evi_promedio?.toFixed(3) || 'N/A'}</div>
                            {calculoSeleccionado.evi_min && calculoSeleccionado.evi_max && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {calculoSeleccionado.evi_min.toFixed(3)} - {calculoSeleccionado.evi_max.toFixed(3)}
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium flex items-center gap-2">
                              <TreeDeciduous className="h-3 w-3 text-primary" />
                              Biomasa Aérea
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                  <button type="button" className="inline-flex items-center">
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <div className="space-y-1">
                                    <p className="font-semibold">Biomasa Aérea</p>
                                    <p className="text-xs">Masa total de materia vegetal viva sobre el suelo (troncos, ramas, hojas). Calculada mediante modelos alométricos basados en índices satelitales.</p>
                                    <div className="text-xs mt-2 space-y-0.5">
                                      <p><strong>Valores de referencia (t/ha):</strong></p>
                                      <p>• &gt; 300: Bosque primario tropical muy denso</p>
                                      <p>• 200 - 300: Bosque maduro bien conservado</p>
                                      <p>• 100 - 200: Bosque secundario o moderadamente alterado</p>
                                      <p>• 50 - 100: Vegetación secundaria joven</p>
                                      <p>• &lt; 50: Vegetación dispersa o áreas degradadas</p>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{calculoSeleccionado.biomasa_aerea_estimada?.toFixed(2) || 'N/A'}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                              toneladas
                              {calculoSeleccionado.biomasa_por_hectarea && ` • ${calculoSeleccionado.biomasa_por_hectarea.toFixed(2)} t/ha`}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-primary bg-primary/5">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium flex items-center gap-2">
                              <Gem className="h-3 w-3 text-primary" />
                              Carbono Almacenado
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                  <button type="button" className="inline-flex items-center">
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <div className="space-y-1">
                                    <p className="font-semibold">Carbono Almacenado</p>
                                    <p className="text-xs">Cantidad de carbono atmosférico capturado y fijado en la biomasa vegetal. Aproximadamente el 47% de la biomasa total.</p>
                                    <div className="text-xs mt-2 space-y-0.5">
                                      <p><strong>Importancia:</strong> Indicador clave para proyectos de mitigación del cambio climático y servicios ecosistémicos.</p>
                                      <p className="mt-1"><strong>Valores de referencia (t C/ha):</strong></p>
                                      <p>• &gt; 140: Bosque primario, alto potencial REDD+</p>
                                      <p>• 90 - 140: Bosque maduro conservado</p>
                                      <p>• 50 - 90: Bosque secundario</p>
                                      <p>• 25 - 50: Vegetación secundaria joven</p>
                                      <p>• &lt; 25: Bajo almacenamiento de carbono</p>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-primary">{calculoSeleccionado.carbono_estimado?.toFixed(2) || 'N/A'}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                              toneladas C
                              {calculoSeleccionado.carbono_por_hectarea && ` • ${calculoSeleccionado.carbono_por_hectarea.toFixed(2)} t C/ha`}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Info adicional */}
                      {calculoSeleccionado.lai_promedio && (
                        <Card className="bg-muted/20">
                          <CardContent className="pt-4">
                            <h5 className="font-semibold text-sm mb-3">Información Adicional</h5>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              {calculoSeleccionado.lai_promedio && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">LAI (Índice de Área Foliar)</span>
                                  <strong>{calculoSeleccionado.lai_promedio.toFixed(2)}</strong>
                                </div>
                              )}
                              {calculoSeleccionado.cobertura_nubosidad_pct !== null && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Cloud className="h-3 w-3" /> Cobertura de nubes
                                  </span>
                                  <strong>{calculoSeleccionado.cobertura_nubosidad_pct.toFixed(1)}%</strong>
                                </div>
                              )}
                              {calculoSeleccionado.num_imagenes_usadas && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Imágenes procesadas</span>
                                  <strong>{calculoSeleccionado.num_imagenes_usadas}</strong>
                                </div>
                              )}
                              {calculoSeleccionado.calidad_datos && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Calidad de datos</span>
                                  <strong>{calculoSeleccionado.calidad_datos}</strong>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {calculoSeleccionado.observaciones && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Observaciones:</strong> {calculoSeleccionado.observaciones}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Gráficas */}
                      {loadingSerie && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-muted-foreground">Cargando serie temporal...</span>
                        </div>
                      )}

                      {serieTemporal && serieTemporal.datos && (
                        <>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                Serie Temporal - NDVI y EVI
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={serieTemporal.datos}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                  <XAxis
                                    dataKey="fecha"
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                  />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="ndvi"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    name="NDVI"
                                    dot={{ r: 3 }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="evi"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    name="EVI"
                                    dot={{ r: 3 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Gem className="h-4 w-4 text-primary" />
                                Serie Temporal - Carbono Almacenado
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={serieTemporal.datos}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                  <XAxis
                                    dataKey="fecha"
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                  />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="carbono"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    name="Carbono (t)"
                                    dot={{ r: 3 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </>
                  ) : calculoSeleccionado.estado_procesamiento === 'esperando_csv' ? (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center text-center py-6">
                        <Satellite className="h-12 w-12 text-primary mb-4" />
                        <h5 className="font-semibold mb-2">Esperando Datos de NASA</h5>
                        <p className="text-sm text-muted-foreground mb-4">
                          La tarea fue creada en NASA AppEEARS. Sigue estos pasos:
                        </p>
                      </div>

                      <Card className="bg-muted/20">
                        <CardContent className="pt-4">
                          <ol className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-0.5">1</Badge>
                              <div>
                                Ve a{' '}
                                <a
                                  href={`https://appeears.earthdatacloud.nasa.gov/task/${calculoSeleccionado.nasa_task_id || ''}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  NASA AppEEARS <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </li>
                            <li className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-0.5">2</Badge>
                              <span>Espera a que la tarea se complete (10-30 minutos)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-0.5">3</Badge>
                              <span>Descarga el archivo <code className="bg-muted px-1 py-0.5 rounded text-xs">MOD13Q1-061-Statistics.csv</code></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-0.5">4</Badge>
                              <span>Sube el archivo aquí abajo</span>
                            </li>
                          </ol>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Subir Archivo CSV
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setArchivoCSV(e.target.files[0])}
                            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                          />
                          {archivoCSV && (
                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                Archivo seleccionado: <strong>{archivoCSV.name}</strong>
                              </AlertDescription>
                            </Alert>
                          )}
                          <Button
                            onClick={handleSubirCSV}
                            disabled={!archivoCSV || subiendoCSV}
                            className="w-full"
                          >
                            {subiendoCSV ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Procesando...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Procesar CSV
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ) : calculoSeleccionado.estado_procesamiento === 'error' ? (
                    <Alert variant="destructive">
                      <AlertDescription>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold mb-1">Error en el Procesamiento</h5>
                            <p className="text-sm">{calculoSeleccionado.error_mensaje || 'Error desconocido'}</p>
                          </div>
                          <Button onClick={onNuevoAnalisis} variant="outline">
                            Reintentar con Nuevo Análisis
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="flex flex-col items-center text-center py-8">
                      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                      <h5 className="font-semibold mb-2">Análisis en Proceso</h5>
                      <p className="text-sm text-muted-foreground">
                        Este análisis aún se está procesando. Vuelve más tarde para ver los resultados.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
      </div>
    </TooltipProvider>
  )
}

export default HistorialSatelital
