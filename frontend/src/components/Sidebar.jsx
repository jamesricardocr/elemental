import { useState, useMemo, useEffect } from 'react'
import { getResumenGeneral, getZonasReferencia } from '../services/api'

function Sidebar({ parcelas, allParcelas, filters, setFilters, loading, onRefresh, onNuevaParcela, onVerTabla }) {
  const [resumen, setResumen] = useState(null)
  const [expandedParcela, setExpandedParcela] = useState(null)
  const [zonasReferencia, setZonasReferencia] = useState([])

  const zonas = useMemo(() => {
    const zonasSet = new Set()
    // Agregar zonas de parcelas
    allParcelas.forEach(p => {
      if (p.zona_priorizada) zonasSet.add(p.zona_priorizada)
    })
    // Agregar zonas de referencia del Excel
    zonasReferencia.forEach(z => zonasSet.add(z))
    return Array.from(zonasSet).sort()
  }, [allParcelas, zonasReferencia])

  useEffect(() => {
    loadResumen()
    loadZonasReferencia()
  }, [allParcelas])

  const loadResumen = async () => {
    const data = await getResumenGeneral()
    setResumen(data)
  }

  const loadZonasReferencia = async () => {
    const zonas = await getZonasReferencia()
    setZonasReferencia(zonas)
  }

  const stats = useMemo(() => {
    if (resumen) {
      return {
        total: resumen.total_parcelas,
        activas: resumen.parcelas_activas,
        completadas: resumen.parcelas_completadas,
        inactivas: resumen.parcelas_inactivas
      }
    }
    return {
      total: allParcelas.length,
      activas: allParcelas.filter(p => p.estado === 'activa').length,
      completadas: allParcelas.filter(p => p.estado === 'completada').length,
      inactivas: allParcelas.filter(p => p.estado === 'inactiva').length
    }
  }, [resumen, allParcelas])

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>🌳 Elemental</h1>
        <p>Sistema de Gestión de Biomasa</p>
        <p className="text-xs opacity-50">v1.0.0</p>
      </div>

      <div className="sidebar-section">
        <h3>🔍 Filtros</h3>

        <div className="filter-group">
          <label>Zona Priorizada</label>
          <select
            value={filters.zona}
            onChange={(e) => setFilters({...filters, zona: e.target.value})}
          >
            <option value="Todas">Todas</option>
            {zonas.map(zona => (
              <option key={zona} value={zona}>{zona}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Estado</label>
          <select
            value={filters.estado}
            onChange={(e) => setFilters({...filters, estado: e.target.value})}
          >
            <option value="Todos">Todos</option>
            <option value="activa">Activa</option>
            <option value="completada">Completada</option>
            <option value="inactiva">Inactiva</option>
            <option value="en_proceso">En Proceso</option>
          </select>
        </div>
      </div>

      <div className="sidebar-section">
        <h3>⚡ Acciones Rápidas</h3>
        <button className="action-button nueva-parcela" onClick={onNuevaParcela}>
          ➕ Nueva Parcela
        </button>
        <button className="action-button ver-tabla" onClick={onVerTabla}>
          📋 Ver Tabla
        </button>
      </div>

      <div className="sidebar-section">
        <h3>📊 Estadísticas Generales</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card stat-activa">
            <div className="stat-value">{stats.activas}</div>
            <div className="stat-label">Activas</div>
          </div>
          <div className="stat-card stat-completada">
            <div className="stat-value">{stats.completadas}</div>
            <div className="stat-label">Completadas</div>
          </div>
          <div className="stat-card stat-inactiva">
            <div className="stat-value">{stats.inactivas}</div>
            <div className="stat-label">Inactivas</div>
          </div>
        </div>
        <div className="area-info">
          <small>Área total monitoreada: {(stats.total * 0.1).toFixed(2)} ha</small>
        </div>
      </div>

      <div className="sidebar-section parcelas-list">
        <div className="section-header">
          <h3>📋 Parcelas</h3>
          {parcelas.length > 15 && (
            <span className="parcelas-count">
              Mostrando 15 de {parcelas.length}
            </span>
          )}
        </div>

        <div className="parcelas-scroll">
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : parcelas.length === 0 ? (
            <div className="empty-state">
              <p>No hay parcelas para mostrar</p>
              <small>Ajusta los filtros o crea una nueva parcela</small>
            </div>
          ) : (
            parcelas.slice(0, 15).map(parcela => (
              <div
                key={parcela.id}
                className={`parcela-card ${expandedParcela === parcela.id ? 'expanded' : ''}`}
                onClick={() => setExpandedParcela(
                  expandedParcela === parcela.id ? null : parcela.id
                )}
              >
                <div className="parcela-header">
                  <span className={`status-badge status-${parcela.estado}`}>
                    {parcela.estado}
                  </span>
                  <strong>{parcela.codigo}</strong>
                </div>

                {expandedParcela === parcela.id && (
                  <div className="parcela-details">
                    <p><strong>Nombre:</strong> {parcela.nombre || 'N/A'}</p>
                    <p><strong>Zona:</strong> {parcela.zona_priorizada || 'N/A'}</p>
                    {parcela.latitud && parcela.longitud && (
                      <p><strong>Coords:</strong> {parcela.latitud.toFixed(6)}, {parcela.longitud.toFixed(6)}</p>
                    )}
                    <p><strong>Árboles:</strong> {parcela.arboles?.length || 0}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <button className="refresh-button" onClick={onRefresh}>
        🔄 Recargar Datos
      </button>
    </div>
  )
}

export default Sidebar
