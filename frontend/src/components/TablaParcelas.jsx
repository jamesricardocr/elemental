import { useState, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteParcela, getParcelaStats } from '../services/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChevronDown,
  ChevronRight,
  BarChart3,
  Satellite,
  MapPin,
  Trash2
} from 'lucide-react'

function TablaParcelas({ parcelas, onParcelaDeleted, onParcelaSelected, onVerDetalles }) {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState(null)
  const [stats, setStats] = useState({})
  const [loadingStats, setLoadingStats] = useState({})

  const toggleExpand = async (parcelaId) => {
    if (expandedId === parcelaId) {
      setExpandedId(null)
    } else {
      setExpandedId(parcelaId)

      if (!stats[parcelaId] && !loadingStats[parcelaId]) {
        setLoadingStats(prev => ({ ...prev, [parcelaId]: true }))
        try {
          const parcelaStats = await getParcelaStats(parcelaId)
          setStats(prev => ({ ...prev, [parcelaId]: parcelaStats }))
        } catch (error) {
          console.error('Error loading stats:', error)
        } finally {
          setLoadingStats(prev => ({ ...prev, [parcelaId]: false }))
        }
      }
    }
  }

  const handleDelete = async (parcelaId, codigo) => {
    if (!confirm(`¿Estás seguro de eliminar la parcela ${codigo}? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      await deleteParcela(parcelaId)
      if (onParcelaDeleted) {
        onParcelaDeleted(parcelaId)
      }
    } catch (error) {
      alert('Error al eliminar la parcela: ' + error.message)
    }
  }

  const getEstadoBadge = (estado) => {
    const variants = {
      'activa': { variant: 'default', className: '' },
      'completada': { variant: 'secondary', className: '' },
      'inactiva': { variant: 'outline', className: '' },
      'en_proceso': { variant: 'default', className: 'bg-accent text-accent-foreground' }
    }
    const config = variants[estado] || variants['inactiva']
    return (
      <Badge variant={config.variant} className={config.className}>
        {estado}
      </Badge>
    )
  }

  if (!parcelas || parcelas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground mb-2">No hay parcelas para mostrar</p>
        <small className="text-sm text-muted-foreground">Crea una nueva parcela para comenzar</small>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Zona</TableHead>
            <TableHead>Coordenadas</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parcelas.map(parcela => (
            <Fragment key={parcela.id}>
              <TableRow className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(parcela.id)}
                    className="h-8 w-8 p-0"
                  >
                    {expandedId === parcela.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-mono font-semibold text-primary">
                  {parcela.codigo}
                </TableCell>
                <TableCell>{parcela.nombre || '-'}</TableCell>
                <TableCell>{parcela.zona_priorizada || '-'}</TableCell>
                <TableCell className="text-sm font-mono">
                  <div>{parcela.latitud?.toFixed(6)}°</div>
                  <div className="text-muted-foreground">{parcela.longitud?.toFixed(6)}°</div>
                </TableCell>
                <TableCell>{getEstadoBadge(parcela.estado)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/parcelas/${parcela.codigo}`)}
                      title="Gestionar parcela"
                      className="h-8 w-8 p-0"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/parcelas/${parcela.codigo}?tab=satelital`)}
                      title="Análisis Satelital"
                      className="h-8 w-8 p-0"
                    >
                      <Satellite className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onParcelaSelected && onParcelaSelected(parcela)}
                      title="Ver en mapa"
                      className="h-8 w-8 p-0"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(parcela.id, parcela.codigo)}
                      title="Eliminar"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {expandedId === parcela.id && (
                <TableRow key={`${parcela.id}-expanded`}>
                  <TableCell colSpan={7} className="bg-muted/30 p-0">
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Información General */}
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-3 text-sm">Información General</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Responsable:</span>
                                <span className="font-medium">{parcela.responsable || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Fecha:</span>
                                <span className="font-medium">{parcela.fecha_establecimiento || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cobertura:</span>
                                <span className="font-medium">{parcela.tipo_cobertura || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Accesibilidad:</span>
                                <span className="font-medium">{parcela.accesibilidad || 'N/A'}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Coordenadas */}
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-3 text-sm">Coordenadas</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Latitud:</span>
                                <span className="font-mono font-medium">{parcela.latitud?.toFixed(6)}°</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Longitud:</span>
                                <span className="font-mono font-medium">{parcela.longitud?.toFixed(6)}°</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Altitud:</span>
                                <span className="font-medium">{parcela.altitud?.toFixed(1)} m.s.n.m.</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Pendiente:</span>
                                <span className="font-medium">{parcela.pendiente?.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">UTM:</span>
                                <span className="font-mono text-xs">
                                  {parcela.utm_x?.toFixed(2)}, {parcela.utm_y?.toFixed(2)} ({parcela.utm_zone})
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Estadísticas */}
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-3 text-sm">Estadísticas</h4>
                            {loadingStats[parcela.id] ? (
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                              </div>
                            ) : stats[parcela.id] ? (
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Área:</span>
                                  <span className="font-medium">{stats[parcela.id].area_ha} ha</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Árboles:</span>
                                  <span className="font-medium">{stats[parcela.id].num_arboles}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Necromasa:</span>
                                  <span className="font-medium">{stats[parcela.id].num_necromasa}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Herbáceas:</span>
                                  <span className="font-medium">{stats[parcela.id].num_herbaceas}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Cálculos:</span>
                                  <Badge variant={stats[parcela.id].tiene_calculos ? 'default' : 'outline'} className="h-5">
                                    {stats[parcela.id].tiene_calculos ? 'Sí' : 'No'}
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-destructive">Error al cargar</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Observaciones */}
                      {parcela.observaciones && (
                        <Card className="mt-4">
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2 text-sm">Observaciones</h4>
                            <p className="text-sm text-muted-foreground">{parcela.observaciones}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default TablaParcelas
