import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import MapView from '../../components/MapView'
import FormularioParcela from '../../components/FormularioParcela'
import SeleccionModoCreacion from '../../components/SeleccionModoCreacion'
import ParcelaInteractiva from '../../components/ParcelaInteractiva'
import { fetchParcelas, getPuntosReferencia, getZonasReferencia } from '../../services/api'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Plus, MapPin } from 'lucide-react'

function MapaPage() {
  const location = useLocation()
  const [parcelas, setParcelas] = useState([])
  const [filteredParcelas, setFilteredParcelas] = useState([])
  const [zonas, setZonas] = useState([])
  const [filters, setFilters] = useState({
    zona: 'Todas',
    estado: 'Todos'
  })
  const [loading, setLoading] = useState(true)
  const [vistaActual, setVistaActual] = useState('mapa') // 'mapa', 'formulario', 'interactivo'
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState(location.state?.parcelaSeleccionada || null)
  const [puntosReferencia, setPuntosReferencia] = useState([])
  const [modoCreacion, setModoCreacion] = useState(null) // 'manual' | 'interactivo' | null

  useEffect(() => {
    loadZonas()
    loadParcelas()
  }, [])

  useEffect(() => {
    // Si hay una parcela seleccionada del state, actualizar
    if (location.state?.parcelaSeleccionada) {
      setParcelaSeleccionada(location.state.parcelaSeleccionada)
    }
  }, [location.state])

  useEffect(() => {
    applyFilters()
    loadPuntosReferencia()
  }, [parcelas, filters])

  const loadZonas = async () => {
    try {
      const zonasData = await getZonasReferencia()
      setZonas(zonasData)
    } catch (error) {
      console.error('Error cargando zonas:', error)
    }
  }

  const loadPuntosReferencia = async () => {
    if (filters.zona !== 'Todas') {
      const puntos = await getPuntosReferencia(filters.zona)
      setPuntosReferencia(puntos)
    } else {
      setPuntosReferencia([])
    }
  }

  const loadParcelas = async () => {
    try {
      setLoading(true)
      const data = await fetchParcelas()
      setParcelas(data)
    } catch (error) {
      console.error('Error cargando parcelas:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...parcelas]

    if (filters.zona !== 'Todas') {
      filtered = filtered.filter(p => p.zona_priorizada === filters.zona)
    }

    if (filters.estado !== 'Todos') {
      filtered = filtered.filter(p => p.estado === filters.estado)
    }

    setFilteredParcelas(filtered)
  }

  const handleParcelaCreada = (nuevaParcela) => {
    loadParcelas()
    setVistaActual('mapa')
  }

  const handleParcelaDeleted = (parcelaId) => {
    loadParcelas()
  }

  const handleParcelaSelected = (parcela) => {
    setParcelaSeleccionada(parcela)
    setVistaActual('mapa')
  }

  const handleNuevaParcelaClick = () => {
    if (filters.zona === 'Todas') {
      alert('Por favor, selecciona una zona priorizada antes de crear una parcela')
      return
    }
    setModoCreacion('seleccion')
  }

  const handleModoSeleccionado = (modo) => {
    if (modo === 'manual') {
      setModoCreacion(null)
      setVistaActual('formulario')
    } else if (modo === 'interactivo') {
      setModoCreacion('interactivo')
      setVistaActual('interactivo')
    }
  }

  const handleCancelarCreacion = () => {
    setModoCreacion(null)
    setVistaActual('mapa')
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header con filtros */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 flex-wrap">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Mapa de Parcelas</h1>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">Zona:</label>
              <Select value={filters.zona} onValueChange={(value) => setFilters({...filters, zona: value})}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas las zonas</SelectItem>
                  {zonas.map(zona => (
                    <SelectItem key={zona} value={zona}>{zona}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">Estado:</label>
              <Select value={filters.estado} onValueChange={(value) => setFilters({...filters, estado: value})}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="en_proceso">En Proceso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Badge variant="secondary" className="ml-2">
              {filteredParcelas.length} parcela{filteredParcelas.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadParcelas}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={handleNuevaParcelaClick} className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Parcela
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden">
        {vistaActual === 'mapa' && (
          <MapView
            parcelas={filteredParcelas}
            parcelaSeleccionada={parcelaSeleccionada}
            puntosReferencia={puntosReferencia}
            zonaSeleccionada={filters.zona}
          />
        )}

        {vistaActual === 'formulario' && (
          <div className="h-full overflow-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container max-w-4xl mx-auto py-8">
              <FormularioParcela
                onParcelaCreada={handleParcelaCreada}
                onClose={() => setVistaActual('mapa')}
              />
            </div>
          </div>
        )}

        {vistaActual === 'interactivo' && (
          <ParcelaInteractiva
            zona={filters.zona}
            puntosReferencia={puntosReferencia}
            onParcelaCreada={handleParcelaCreada}
            onCancelar={handleCancelarCreacion}
          />
        )}
      </div>

      {modoCreacion === 'seleccion' && (
        <SeleccionModoCreacion
          onModoSeleccionado={handleModoSeleccionado}
          onCancelar={handleCancelarCreacion}
        />
      )}
    </div>
  )
}

export default MapaPage
