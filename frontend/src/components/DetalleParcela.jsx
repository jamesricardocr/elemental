import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchParcelas } from '../services/api'
import GestionArboles from './GestionArboles'
import GestionNecromasa from './GestionNecromasa'
import GestionHerbaceas from './GestionHerbaceas'
import CalculosBiomasa from './CalculosBiomasa'
import HistorialSatelital from './HistorialSatelital'
import GestionSubparcelas from './GestionSubparcelas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Info,
  TreeDeciduous,
  Leaf,
  Sprout,
  Calculator,
  Satellite,
  MapPin,
  Calendar,
  Square
} from 'lucide-react'

const DetalleParcela = ({ codigo, parcelaId, onVolver }) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [parcela, setParcela] = useState(null)
  const [tabActiva, setTabActiva] = useState(searchParams.get('tab') || 'info')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [subparcelaSeleccionada, setSubparcelaSeleccionada] = useState(null)
  const [tipoGestionSubparcela, setTipoGestionSubparcela] = useState(null)
  const [loadingSubparcela, setLoadingSubparcela] = useState(false)

  useEffect(() => {
    inicializarPagina()
  }, [codigo, parcelaId])

  // Sincronizar tab activa con los parámetros de la URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl && tabFromUrl !== tabActiva) {
      setTabActiva(tabFromUrl)
    }
  }, [searchParams])

  const inicializarPagina = async () => {
    try {
      setLoading(true)

      // Cargar parcela
      const parcelas = await fetchParcelas()
      let parcelaEncontrada
      if (codigo) {
        parcelaEncontrada = parcelas.find(p => p.codigo === codigo)
      } else if (parcelaId) {
        parcelaEncontrada = parcelas.find(p => p.id === parcelaId)
      }

      if (!parcelaEncontrada) {
        setError('Parcela no encontrada')
        return
      }

      setParcela(parcelaEncontrada)
      setError(null)

      // Si hay subparcela en URL, cargarla
      const subparcelaIdFromUrl = searchParams.get('subparcela')
      if (subparcelaIdFromUrl) {
        await cargarSubparcelaDesdeUrl(parseInt(subparcelaIdFromUrl))
      }
    } catch (err) {
      console.error('Error al cargar parcela:', err)
      setError('Error al cargar la información de la parcela')
    } finally {
      setLoading(false)
    }
  }

  const cargarSubparcelaDesdeUrl = async (subparcelaId) => {
    try {
      setLoadingSubparcela(true)
      const response = await fetch(`/api/v1/subparcelas/${subparcelaId}`)
      if (!response.ok) {
        console.error('Error al cargar subparcela desde URL')
        return
      }
      const subparcela = await response.json()
      setSubparcelaSeleccionada(subparcela)
    } catch (err) {
      console.error('Error al cargar subparcela:', err)
    } finally {
      setLoadingSubparcela(false)
    }
  }

  const handleGestionarDatosSubparcela = (subparcela, tipo) => {
    setSubparcelaSeleccionada(subparcela)
    setTipoGestionSubparcela(tipo)

    // Cambiar a la tab correspondiente e incluir subparcela en URL
    if (tipo === 'arboles') {
      setTabActiva('arboles')
      setSearchParams({ tab: 'arboles', subparcela: subparcela.id })
    } else if (tipo === 'necromasa') {
      setTabActiva('necromasa')
      setSearchParams({ tab: 'necromasa', subparcela: subparcela.id })
    } else if (tipo === 'herbaceas') {
      setTabActiva('herbaceas')
      setSearchParams({ tab: 'herbaceas', subparcela: subparcela.id })
    }
  }

  const volverASubparcelas = () => {
    setSubparcelaSeleccionada(null)
    setTipoGestionSubparcela(null)
    setTabActiva('subparcelas')
    setSearchParams({ tab: 'subparcelas' })
  }

  // Tabs base de la parcela
  const tabsBase = [
    { id: 'info', label: 'Información General', icon: Info },
    { id: 'subparcelas', label: 'Subparcelas', icon: Square },
    { id: 'calculos', label: 'Cálculos de Biomasa', icon: Calculator },
    { id: 'satelital', label: 'Análisis Satelital', icon: Satellite }
  ]

  // Tabs adicionales cuando hay una subparcela seleccionada
  const tabsSubparcela = subparcelaSeleccionada ? [
    { id: 'arboles', label: `Árboles (${subparcelaSeleccionada.codigo})`, icon: TreeDeciduous },
    { id: 'necromasa', label: `Necromasa (${subparcelaSeleccionada.codigo})`, icon: Leaf },
    { id: 'herbaceas', label: `Herbáceas (${subparcelaSeleccionada.codigo})`, icon: Sprout }
  ] : []

  const tabs = [...tabsBase, ...tabsSubparcela]

  if (loading) {
    return (
      <div className="h-full p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !parcela) {
    return (
      <div className="h-full p-6">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Parcela no encontrada'}</AlertDescription>
        </Alert>
        <Button onClick={onVolver} className="mt-4" variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Parcelas
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={onVolver} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{parcela.nombre || parcela.codigo}</h2>
                <Badge variant="secondary" className="text-xs">
                  {parcela.codigo}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {parcela.zona_priorizada} • {parcela.tipo_cobertura || 'Sin cobertura especificada'}
              </p>
            </div>
          </div>
          <Badge
            variant={parcela.estado === 'activa' ? 'default' : 'secondary'}
          >
            {parcela.estado}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-background">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setTabActiva(tab.id)
                  // Si es un tab de subparcela, incluir el ID en la URL
                  if (['arboles', 'necromasa', 'herbaceas'].includes(tab.id) && subparcelaSeleccionada) {
                    setSearchParams({ tab: tab.id, subparcela: subparcelaSeleccionada.id })
                  } else {
                    setSearchParams({ tab: tab.id })
                  }
                }}
                className={`
                  flex items-center gap-2 px-4 py-3 min-w-fit whitespace-nowrap
                  border-b-2 transition-all font-medium text-sm
                  ${tabActiva === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto bg-background p-6">
        {tabActiva === 'info' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Información General */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Información General</CardTitle>
                <CardDescription>Datos principales de la parcela</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Código</p>
                    <p className="font-mono text-base font-semibold text-primary">{parcela.codigo}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Nombre</p>
                    <p className="text-base">{parcela.nombre || 'Sin nombre'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Zona Priorizada</p>
                    <p className="text-base">{parcela.zona_priorizada || 'No especificada'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Punto de Referencia</p>
                    <p className="text-base">{parcela.punto_referencia_nombre || 'No especificado'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Área</p>
                    <p className="text-base">0.1 hectáreas (20m × 50m)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Fecha de Creación
                    </p>
                    <p className="text-base">{new Date(parcela.created_at).toLocaleDateString('es-CO')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coordenadas */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Coordenadas Geográficas
                </CardTitle>
                <CardDescription>Ubicación y características topográficas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Latitud Centro</p>
                    <p className="font-mono text-base text-primary">{parcela.latitud?.toFixed(6)}°</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Longitud Centro</p>
                    <p className="font-mono text-base text-primary">{parcela.longitud?.toFixed(6)}°</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Altitud</p>
                    <p className="text-base">{parcela.altitud?.toFixed(1)} m.s.n.m.</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Pendiente</p>
                    <p className="text-base">{parcela.pendiente?.toFixed(1)}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Rotación</p>
                    <p className="text-base">{parcela.rotacion}°</p>
                  </div>
                  {parcela.utm_x && parcela.utm_y && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Coordenadas UTM</p>
                      <p className="font-mono text-xs">{parcela.utm_x?.toFixed(2)}, {parcela.utm_y?.toFixed(2)} ({parcela.utm_zone})</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vértices */}
            {parcela.vertices && parcela.vertices.length === 4 && (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Coordenadas de los Vértices</CardTitle>
                  <CardDescription>Delimitación exacta de la parcela</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {parcela.vertices.map((vertice, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Vértice {idx + 1}</p>
                            <p className="font-mono text-sm">
                              {vertice[0].toFixed(6)}°, {vertice[1].toFixed(6)}°
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observaciones */}
            {parcela.observaciones && (
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Observaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed">{parcela.observaciones}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {tabActiva === 'subparcelas' && (
          <GestionSubparcelas
            parcelaId={parcela.id}
            parcela={parcela}
            onGestionarDatos={handleGestionarDatosSubparcela}
          />
        )}

        {tabActiva === 'arboles' && (
          <div className="space-y-4">
            {subparcelaSeleccionada && (
              <Alert>
                <Square className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Gestionando árboles de la subparcela: <strong>{subparcelaSeleccionada.codigo}</strong>
                  </span>
                  <Button variant="outline" size="sm" onClick={volverASubparcelas}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Subparcelas
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <GestionArboles
              parcelaId={parcela.id}
              subparcelaId={subparcelaSeleccionada?.id}
              subparcela={subparcelaSeleccionada}
            />
          </div>
        )}

        {tabActiva === 'necromasa' && (
          <div className="space-y-4">
            {subparcelaSeleccionada && (
              <Alert>
                <Square className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Gestionando necromasa de la subparcela: <strong>{subparcelaSeleccionada.codigo}</strong>
                  </span>
                  <Button variant="outline" size="sm" onClick={volverASubparcelas}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Subparcelas
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <GestionNecromasa
              parcelaId={parcela.id}
              subparcelaId={subparcelaSeleccionada?.id}
              subparcela={subparcelaSeleccionada}
            />
          </div>
        )}

        {tabActiva === 'herbaceas' && (
          <div className="space-y-4">
            {subparcelaSeleccionada && (
              <Alert>
                <Square className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Gestionando herbáceas de la subparcela: <strong>{subparcelaSeleccionada.codigo}</strong>
                  </span>
                  <Button variant="outline" size="sm" onClick={volverASubparcelas}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Subparcelas
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <GestionHerbaceas
              parcelaId={parcela.id}
              subparcelaId={subparcelaSeleccionada?.id}
              subparcela={subparcelaSeleccionada}
            />
          </div>
        )}

        {tabActiva === 'calculos' && (
          <div className="space-y-4">
            <Alert>
              <Calculator className="h-4 w-4" />
              <AlertDescription>
                Los cálculos de biomasa y carbono se realizan para toda la parcela (0.1 hectáreas = 1000 m²)
              </AlertDescription>
            </Alert>
            <CalculosBiomasa
              parcelaId={parcela.id}
            />
          </div>
        )}

        {tabActiva === 'satelital' && (
          <HistorialSatelital
            parcelaId={parcela.id}
            onNuevoAnalisis={() => navigate(`/analisis-satelital/${parcela.codigo}`)}
          />
        )}
      </div>
    </div>
  )
}

export default DetalleParcela
