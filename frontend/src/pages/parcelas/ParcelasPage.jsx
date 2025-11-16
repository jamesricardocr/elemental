import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchParcelas, getZonasReferencia } from '../../services/api'
import TablaParcelas from '../../components/TablaParcelas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Plus, Table as TableIcon } from 'lucide-react'

function ParcelasPage() {
  const navigate = useNavigate()
  const [parcelas, setParcelas] = useState([])
  const [filteredParcelas, setFilteredParcelas] = useState([])
  const [zonas, setZonas] = useState([])
  const [filters, setFilters] = useState({
    zona: 'Todas',
    estado: 'Todos'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadZonas()
    loadParcelas()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [parcelas, filters])

  const loadZonas = async () => {
    try {
      const zonasData = await getZonasReferencia()
      setZonas(zonasData)
    } catch (error) {
      console.error('Error cargando zonas:', error)
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

  const handleParcelaDeleted = (parcelaId) => {
    loadParcelas()
  }

  const handleParcelaSelected = (parcela) => {
    // Navegar al mapa con la parcela seleccionada
    navigate('/mapa', { state: { parcelaSeleccionada: parcela } })
  }

  const handleNuevaParcelaClick = () => {
    navigate('/mapa')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-muted-foreground">Cargando parcelas...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden p-6 space-y-6">
      {/* Header con filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl mb-2">
                <TableIcon className="inline h-6 w-6 text-primary mr-2" />
                Gestión de Parcelas
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Administra y consulta todas las parcelas del proyecto
              </p>
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
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm text-muted-foreground whitespace-nowrap">Zona:</label>
              <Select value={filters.zona} onValueChange={(value) => setFilters({...filters, zona: value})}>
                <SelectTrigger className="w-full sm:w-[200px]">
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

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm text-muted-foreground whitespace-nowrap">Estado:</label>
              <Select value={filters.estado} onValueChange={(value) => setFilters({...filters, estado: value})}>
                <SelectTrigger className="w-full sm:w-[150px]">
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

            <Badge variant="secondary" className="ml-auto">
              {filteredParcelas.length} parcela{filteredParcelas.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Parcelas */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-auto p-0">
          <TablaParcelas
            parcelas={filteredParcelas}
            onParcelaDeleted={handleParcelaDeleted}
            onParcelaSelected={handleParcelaSelected}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default ParcelasPage
