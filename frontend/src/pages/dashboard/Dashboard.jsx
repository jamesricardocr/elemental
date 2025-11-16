import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchParcelas } from '@/services/api'
import { Layers, TreeDeciduous, Satellite, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [parcelas, setParcelas] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    activas: 0,
    completadas: 0,
    enProceso: 0,
    areaTotal: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await fetchParcelas()
      setParcelas(data)

      // Calculate stats
      const stats = {
        total: data.length,
        activas: data.filter(p => p.estado === 'activa').length,
        completadas: data.filter(p => p.estado === 'completada').length,
        enProceso: data.filter(p => p.estado === 'en_proceso').length,
        areaTotal: data.reduce((sum, p) => sum + (p.area_ha || 0), 0)
      }
      setStats(stats)
    } catch (error) {
      console.error('Error loading parcelas:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatsCard = ({ title, value, description, icon: Icon, href }) => (
    <Link to={href}>
      <Card className="transition-all hover:scale-105 hover:border-primary cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Sistema de Gestión de Parcelas y Análisis de Carbono
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Parcelas"
          value={stats.total}
          description="Parcelas registradas"
          icon={Layers}
          href="/parcelas"
        />
        <StatsCard
          title="Parcelas Activas"
          value={stats.activas}
          description="En monitoreo actual"
          icon={TreeDeciduous}
          href="/parcelas"
        />
        <StatsCard
          title="Área Total"
          value={`${stats.areaTotal.toFixed(2)} ha`}
          description="Hectáreas monitoreadas"
          icon={MapPin}
          href="/mapa"
        />
        <StatsCard
          title="Análisis Satelital"
          value={stats.completadas}
          description="Parcelas con análisis"
          icon={Satellite}
          href="/historial-satelital"
        />
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones principales del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link to="/parcelas">
            <Button className="bg-primary hover:bg-primary/90">
              <Layers className="mr-2 h-4 w-4" />
              Ver Parcelas
            </Button>
          </Link>
          <Link to="/mapa">
            <Button variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              Abrir Mapa
            </Button>
          </Link>
          <Link to="/analisis-satelital">
            <Button variant="outline">
              <Satellite className="mr-2 h-4 w-4" />
              Nuevo Análisis
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Parcelas */}
      <Card>
        <CardHeader>
          <CardTitle>Parcelas Recientes</CardTitle>
          <CardDescription>
            Últimas parcelas registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {parcelas.slice(0, 5).map(parcela => (
              <Link
                key={parcela.id}
                to={`/parcelas/${parcela.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div>
                  <h4 className="font-semibold">{parcela.nombre}</h4>
                  <p className="text-sm text-muted-foreground">
                    {parcela.zona_priorizada} • {parcela.area_ha} ha
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    parcela.estado === 'activa'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {parcela.estado}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
