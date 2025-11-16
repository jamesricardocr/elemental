import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchParcelas, crearCalculoSatelital, getEstadoCalculoSatelital, subirCSVNasa } from '../services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ArrowLeft,
  Satellite,
  Loader2,
  Upload,
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
  Sprout,
  Leaf,
  TreeDeciduous,
  Gem
} from 'lucide-react'
import { toast } from 'sonner'

const AnalisisSatelital = () => {
  const { codigo } = useParams()
  const navigate = useNavigate()

  const [parcela, setParcela] = useState(null)
  const [loading, setLoading] = useState(true)

  const [configuracion, setConfiguracion] = useState({
    periodo: '90dias',
    fechaInicio: '',
    fechaFin: '',
    modeloEstimacion: 'NDVI_Foody2003',
    factorCarbono: 0.47
  })

  const [estado, setEstado] = useState('configuracion') // 'configuracion', 'esperando_csv', 'procesando', 'completado', 'error'
  const [calculoId, setCalculoId] = useState(null)
  const [progreso, setProgreso] = useState(0)
  const [mensaje, setMensaje] = useState('')
  const [errorDetalle, setErrorDetalle] = useState('')
  const [resultados, setResultados] = useState(null)
  const [archivoCSV, setArchivoCSV] = useState(null)
  const [subiendoCSV, setSubiendoCSV] = useState(false)

  useEffect(() => {
    const cargarParcela = async () => {
      try {
        const parcelas = await fetchParcelas()
        const parcelaEncontrada = parcelas.find(p => p.codigo === codigo)

        if (!parcelaEncontrada) {
          setLoading(false)
          return
        }

        setParcela(parcelaEncontrada)

        const fechas = calcularFechas('90dias')
        setConfiguracion(prev => ({
          ...prev,
          fechaInicio: fechas.inicio,
          fechaFin: fechas.fin
        }))

        setLoading(false)
      } catch (error) {
        console.error('Error al cargar parcela:', error)
        setLoading(false)
      }
    }

    cargarParcela()
  }, [codigo])

  const calcularFechas = (periodo) => {
    const hoy = new Date()
    let fechaInicio = new Date()

    switch (periodo) {
      case '30dias':
        fechaInicio.setDate(hoy.getDate() - 30)
        break
      case '90dias':
        fechaInicio.setDate(hoy.getDate() - 90)
        break
      case '6meses':
        fechaInicio.setMonth(hoy.getMonth() - 6)
        break
      case '1ano':
        fechaInicio.setFullYear(hoy.getFullYear() - 1)
        break
      case 'personalizado':
        return { inicio: '', fin: '' }
      default:
        fechaInicio.setDate(hoy.getDate() - 90)
    }

    return {
      inicio: fechaInicio.toISOString().split('T')[0],
      fin: hoy.toISOString().split('T')[0]
    }
  }

  const handlePeriodoChange = (value) => {
    const fechas = calcularFechas(value)

    setConfiguracion({
      ...configuracion,
      periodo: value,
      fechaInicio: fechas.inicio,
      fechaFin: fechas.fin
    })
  }

  const handleIniciarCalculo = async () => {
    try {
      setEstado('procesando')
      setMensaje('Creando solicitud en NASA AppEEARS...')
      setProgreso(10)

      const resultado = await crearCalculoSatelital(
        parcela.id,
        configuracion.fechaInicio,
        configuracion.fechaFin,
        configuracion.modeloEstimacion,
        parseFloat(configuracion.factorCarbono)
      )

      setCalculoId(resultado.id)

      if (resultado.estado_procesamiento === 'completado') {
        setEstado('completado')
        setProgreso(100)
        setMensaje('¡Análisis recuperado del caché!')
        setResultados(resultado)
      } else if (resultado.estado_procesamiento === 'esperando_csv') {
        setEstado('esperando_csv')
        setProgreso(50)
        setMensaje('Tarea creada en NASA. Descarga el CSV y súbelo aquí.')
      } else {
        setMensaje('Procesando...')
        setProgreso(30)
        iniciarMonitoreo(resultado.id)
      }

    } catch (error) {
      console.error('Error al iniciar cálculo:', error)
      setEstado('error')
      setErrorDetalle(error.message || 'Error al iniciar el cálculo satelital')
    }
  }

  const handleSubirCSV = async () => {
    if (!archivoCSV || !calculoId) return

    try {
      setSubiendoCSV(true)
      setMensaje('Procesando archivo CSV...')

      const resultado = await subirCSVNasa(calculoId, archivoCSV)

      const calculoCompleto = await fetch(`http://localhost:8000/api/calculos-satelitales/${calculoId}`).then(r => r.json())

      setEstado('completado')
      setProgreso(100)
      setMensaje(`¡CSV procesado! ${resultado.puntos_procesados} observaciones satelitales cargadas.`)
      setResultados(calculoCompleto)

    } catch (error) {
      console.error('Error al subir CSV:', error)
      setEstado('error')
      setErrorDetalle(error.message || 'Error al procesar el archivo CSV')
    } finally {
      setSubiendoCSV(false)
    }
  }

  const iniciarMonitoreo = (id) => {
    const intervalo = setInterval(async () => {
      try {
        const estadoActual = await getEstadoCalculoSatelital(id)

        setProgreso(estadoActual.progreso_pct || 50)
        setMensaje(estadoActual.mensaje || 'Procesando...')

        if (estadoActual.estado_procesamiento === 'completado') {
          clearInterval(intervalo)
          const calculoCompleto = await fetch(`http://localhost:8000/api/calculos-satelitales/${id}`).then(r => r.json())
          setEstado('completado')
          setProgreso(100)
          setMensaje('¡Cálculo completado exitosamente!')
          setResultados(calculoCompleto)
        } else if (estadoActual.estado_procesamiento === 'error') {
          clearInterval(intervalo)
          setEstado('error')
          setErrorDetalle(estadoActual.error_mensaje || 'Error en el procesamiento')
        }
      } catch (error) {
        console.error('Error al verificar estado:', error)
        clearInterval(intervalo)
        setEstado('error')
        setErrorDetalle('Error al verificar el estado del cálculo')
      }
    }, 10000)

    setTimeout(() => {
      clearInterval(intervalo)
      if (estado === 'procesando') {
        setEstado('error')
        setErrorDetalle('Tiempo de espera agotado. El cálculo puede seguir procesándose en segundo plano.')
      }
    }, 30 * 60 * 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!parcela) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              No se pudo cargar la información de la parcela.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/parcelas')} className="mt-4" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Parcelas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Button onClick={() => navigate('/parcelas')} variant="outline" size="sm" className="mb-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div className="flex items-center gap-3">
            <Satellite className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Análisis Satelital</h1>
              <p className="text-sm text-muted-foreground">{parcela.nombre} ({parcela.codigo})</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {estado === 'configuracion' && (
            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Acerca de esta funcionalidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    El análisis satelital utiliza imágenes de satélite (MODIS, Sentinel) de la NASA
                    para calcular índices de vegetación (NDVI, EVI) y estimar biomasa y carbono
                    sin necesidad de mediciones de campo.
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Parcela</p>
                      <p className="font-medium">{parcela.codigo} - {parcela.nombre}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Área</p>
                      <p className="font-medium">0.1 hectáreas (20m × 50m)</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Coordenadas</p>
                      <p className="font-medium">{parcela.latitud?.toFixed(6)}°, {parcela.longitud?.toFixed(6)}°</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Análisis</CardTitle>
                  <CardDescription>Configure los parámetros para el análisis satelital</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodo">Periodo de Análisis</Label>
                    <Select value={configuracion.periodo} onValueChange={handlePeriodoChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30dias">Últimos 30 días</SelectItem>
                        <SelectItem value="90dias">Últimos 90 días (recomendado)</SelectItem>
                        <SelectItem value="6meses">Últimos 6 meses</SelectItem>
                        <SelectItem value="1ano">Último año</SelectItem>
                        <SelectItem value="personalizado">Periodo personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                      <Input
                        id="fechaInicio"
                        type="date"
                        value={configuracion.fechaInicio}
                        onChange={(e) => setConfiguracion({...configuracion, fechaInicio: e.target.value})}
                        disabled={configuracion.periodo !== 'personalizado'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fechaFin">Fecha Fin</Label>
                      <Input
                        id="fechaFin"
                        type="date"
                        value={configuracion.fechaFin}
                        onChange={(e) => setConfiguracion({...configuracion, fechaFin: e.target.value})}
                        disabled={configuracion.periodo !== 'personalizado'}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo de Estimación</Label>
                    <Select
                      value={configuracion.modeloEstimacion}
                      onValueChange={(value) => setConfiguracion({...configuracion, modeloEstimacion: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NDVI_Foody2003">NDVI → Biomasa (Foody et al. 2003)</SelectItem>
                        <SelectItem value="EVI_Modified">EVI Modificado (bosques densos)</SelectItem>
                        <SelectItem value="Combined_Indices">Índices Combinados (NDVI + EVI + LAI)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Foody 2003 es el modelo recomendado para bosques tropicales amazónicos
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="factorCarbono">Factor de Carbono</Label>
                    <Input
                      id="factorCarbono"
                      type="number"
                      step="0.01"
                      min="0.3"
                      max="0.6"
                      value={configuracion.factorCarbono}
                      onChange={(e) => setConfiguracion({...configuracion, factorCarbono: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Factor de conversión de biomasa a carbono (default: 0.47 según IPCC)
                    </p>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1 text-xs">
                        <p><strong>⏱️ Tiempo estimado:</strong> 10-30 minutos</p>
                        <p><strong>📡 Fuente de datos:</strong> NASA AppEEARS (MODIS Terra/Aqua)</p>
                        <p><strong>🌍 Resolución:</strong> 250m (adecuada para parcelas de 0.1 ha)</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate('/parcelas')}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleIniciarCalculo}
                  disabled={!configuracion.fechaInicio || !configuracion.fechaFin}
                >
                  <Satellite className="mr-2 h-4 w-4" />
                  Iniciar Análisis
                </Button>
              </div>
            </div>
          )}

          {estado === 'esperando_csv' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="flex flex-col items-center text-center py-12">
                  <Satellite className="h-16 w-16 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Tarea Creada en NASA AppEEARS</h3>
                  <p className="text-muted-foreground mb-6">{mensaje}</p>

                  <Progress value={progreso} className="w-full max-w-md mb-6" />

                  <Card className="w-full max-w-2xl bg-muted/20">
                    <CardHeader>
                      <CardTitle className="text-base">Instrucciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2 text-sm text-left">
                        <li className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-0.5">1</Badge>
                          <div>
                            Ve a{' '}
                            <a
                              href={`https://appeears.earthdatacloud.nasa.gov/task/${calculoId?.nasa_task_id || ''}`}
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

                  <Card className="w-full max-w-2xl mt-6">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Subir archivo CSV de NASA
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
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <AlertDescription>
                            Archivo seleccionado: <strong>{archivoCSV.name}</strong>
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => navigate('/parcelas')} className="flex-1">
                          Volver a Parcelas
                        </Button>
                        <Button
                          onClick={handleSubirCSV}
                          disabled={!archivoCSV || subiendoCSV}
                          className="flex-1"
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
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          )}

          {estado === 'procesando' && (
            <Card>
              <CardContent className="flex flex-col items-center text-center py-12">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                <h3 className="text-xl font-semibold mb-2">Procesando</h3>
                <p className="text-muted-foreground mb-6">{mensaje}</p>

                <Progress value={progreso} className="w-full max-w-md mb-6" />

                <Button variant="outline" onClick={() => navigate('/parcelas')}>
                  Volver a Parcelas
                </Button>
              </CardContent>
            </Card>
          )}

          {estado === 'completado' && resultados && (
            <div className="space-y-6">
              <Card>
                <CardContent className="flex flex-col items-center text-center py-8">
                  <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">¡Análisis Completado!</h3>
                  <p className="text-muted-foreground">{mensaje}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resultados del Análisis</CardTitle>
                  <CardDescription>
                    Periodo: {configuracion.fechaInicio} al {configuracion.fechaFin} • Modelo: {configuracion.modeloEstimacion}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Sprout className="h-4 w-4 text-primary" />
                          NDVI
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{resultados.ndvi_promedio?.toFixed(3) || 'N/A'}</div>
                        {resultados.ndvi_min && resultados.ndvi_max && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Rango: {resultados.ndvi_min.toFixed(3)} - {resultados.ndvi_max.toFixed(3)}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-teal-600/20 bg-teal-600/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-teal-600" />
                          EVI
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{resultados.evi_promedio?.toFixed(3) || 'N/A'}</div>
                        {resultados.evi_min && resultados.evi_max && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Rango: {resultados.evi_min.toFixed(3)} - {resultados.evi_max.toFixed(3)}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TreeDeciduous className="h-4 w-4 text-primary" />
                          Biomasa Aérea
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{resultados.biomasa_aerea_estimada?.toFixed(2) || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          toneladas
                          {resultados.biomasa_por_hectarea && ` • ${resultados.biomasa_por_hectarea.toFixed(2)} t/ha`}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-primary bg-primary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Gem className="h-4 w-4 text-primary" />
                          Carbono Almacenado
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">{resultados.carbono_estimado?.toFixed(2) || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          toneladas C
                          {resultados.carbono_por_hectarea && ` • ${resultados.carbono_por_hectarea.toFixed(2)} t C/ha`}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert className="mt-6">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Los resultados se han guardado en el historial de la parcela.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate('/parcelas')}>
                  Volver a Parcelas
                </Button>
                <Button
                  onClick={() => {
                    setEstado('configuracion')
                    setResultados(null)
                  }}
                >
                  Realizar Nuevo Análisis
                </Button>
              </div>
            </div>
          )}

          {estado === 'error' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="flex flex-col items-center text-center py-12">
                  <XCircle className="h-16 w-16 text-destructive mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Error en el Procesamiento</h3>
                  <p className="text-muted-foreground mb-6">{errorDetalle}</p>
                </CardContent>
              </Card>

              <Card className="bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-base">Posibles causas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• No hay imágenes satelitales disponibles para el periodo seleccionado</li>
                    <li>• Exceso de cobertura de nubes (&gt;80%)</li>
                    <li>• Error de conexión con NASA AppEEARS</li>
                    <li>• Credenciales de NASA EarthData expiradas o inválidas</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    Puedes intentar con un periodo diferente o contactar al administrador del sistema.
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate('/parcelas')}>
                  Volver a Parcelas
                </Button>
                <Button onClick={() => setEstado('configuracion')}>
                  Reintentar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalisisSatelital
