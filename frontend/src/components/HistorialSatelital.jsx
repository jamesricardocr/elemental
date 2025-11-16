import React, { useState, useEffect } from 'react';
import { getCalculosSatelitalesParcela, deleteCalculoSatelital, getSerieTemporalSatelital, subirCSVNasa } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HistorialSatelital = ({ parcelaId, onNuevoAnalisis }) => {
  const [calculos, setCalculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculoSeleccionado, setCalculoSeleccionado] = useState(null);
  const [serieTemporal, setSerieTemporal] = useState(null);
  const [loadingSerie, setLoadingSerie] = useState(false);
  const [archivoCSV, setArchivoCSV] = useState(null);
  const [subiendoCSV, setSubiendoCSV] = useState(false);

  useEffect(() => {
    cargarCalculos();
  }, [parcelaId]);

  const cargarCalculos = async () => {
    try {
      setLoading(true);
      const data = await getCalculosSatelitalesParcela(parcelaId);
      setCalculos(data);
    } catch (error) {
      console.error('Error al cargar cálculos satelitales:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarSerieTemporal = async (calculoId) => {
    try {
      setLoadingSerie(true);
      const data = await getSerieTemporalSatelital(calculoId);
      setSerieTemporal(data);
    } catch (error) {
      console.error('Error al cargar serie temporal:', error);
      setSerieTemporal(null);
    } finally {
      setLoadingSerie(false);
    }
  };

  const handleSeleccionarCalculo = (calculo) => {
    setCalculoSeleccionado(calculo);
    if (calculo.estado_procesamiento === 'completado') {
      cargarSerieTemporal(calculo.id);
    } else {
      setSerieTemporal(null);
    }
  };

  const descargarCSV = () => {
    if (!serieTemporal || !serieTemporal.datos) return;

    const headers = ['Fecha', 'NDVI', 'EVI', 'Biomasa (t)', 'Carbono (t)', 'Calidad'];
    const rows = serieTemporal.datos.map(d => [
      d.fecha,
      d.ndvi,
      d.evi,
      d.biomasa || '',
      d.carbono || '',
      d.calidad
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis_satelital_${calculoSeleccionado.id}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEliminar = async (calculoId) => {
    if (!window.confirm('¿Estás seguro de eliminar este análisis satelital?')) {
      return;
    }

    try {
      await deleteCalculoSatelital(calculoId);
      await cargarCalculos();
      if (calculoSeleccionado?.id === calculoId) {
        setCalculoSeleccionado(null);
      }
    } catch (error) {
      console.error('Error al eliminar cálculo:', error);
      alert('Error al eliminar el análisis satelital');
    }
  };

  const handleSubirCSV = async () => {
    if (!archivoCSV || !calculoSeleccionado) return;

    try {
      setSubiendoCSV(true);
      await subirCSVNasa(calculoSeleccionado.id, archivoCSV);

      // Recargar el cálculo actualizado
      await cargarCalculos();
      const calculoActualizado = await fetch(`http://localhost:8000/api/v1/calculos-satelitales/${calculoSeleccionado.id}`).then(r => r.json());
      setCalculoSeleccionado(calculoActualizado);

      // Cargar serie temporal si está completado
      if (calculoActualizado.estado_procesamiento === 'completado') {
        await cargarSerieTemporal(calculoActualizado.id);
      }

      setArchivoCSV(null);
      alert('CSV procesado exitosamente');
    } catch (error) {
      console.error('Error al subir CSV:', error);
      alert('Error al procesar el archivo CSV: ' + error.message);
    } finally {
      setSubiendoCSV(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      completado: { text: 'Completado', class: 'badge-completado' },
      procesando: { text: 'Procesando', class: 'badge-procesando' },
      esperando_csv: { text: 'Esperando CSV', class: 'badge-esperando' },
      error: { text: 'Error', class: 'badge-error' },
      pendiente: { text: 'Pendiente', class: 'badge-pendiente' }
    };
    return badges[estado] || { text: estado, class: 'badge-default' };
  };

  if (loading) {
    return <div className="loading">Cargando análisis satelitales...</div>;
  }

  return (
    <div className="historial-satelital">
      <div className="historial-header">
        <h3>📡 Análisis Satelitales</h3>
        <button className="btn-nuevo-analisis" onClick={onNuevoAnalisis}>
          🛰️ Nuevo Análisis
        </button>
      </div>

      {calculos.length === 0 ? (
        <div className="empty-state">
          <p>No hay análisis satelitales realizados para esta parcela</p>
          <button className="btn-primary" onClick={onNuevoAnalisis}>
            Realizar Primer Análisis
          </button>
        </div>
      ) : (
        <div className="historial-content">
          <div className="calculos-list">
            <h4>Historial ({calculos.length})</h4>
            {calculos.map(calculo => {
              const badge = getEstadoBadge(calculo.estado_procesamiento);
              return (
                <div
                  key={calculo.id}
                  className={`calculo-item ${calculoSeleccionado?.id === calculo.id ? 'selected' : ''}`}
                  onClick={() => handleSeleccionarCalculo(calculo)}
                >
                  <div className="calculo-header">
                    <span className={`estado-badge ${badge.class}`}>{badge.text}</span>
                    <span className="calculo-fecha">
                      {new Date(calculo.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="calculo-periodo">
                    {calculo.fecha_inicio} → {calculo.fecha_fin}
                  </div>
                  {calculo.estado_procesamiento === 'completado' && (
                    <div className="calculo-preview">
                      <span>NDVI: {calculo.ndvi_promedio?.toFixed(3)}</span>
                      <span>Carbono: {calculo.carbono_estimado?.toFixed(2)} t</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {calculoSeleccionado && (
            <div className="calculo-detalle">
              <div className="detalle-header">
                <h4>Detalles del Análisis #{calculoSeleccionado.id}</h4>
                <div className="header-actions">
                  {calculoSeleccionado.estado_procesamiento === 'completado' && serieTemporal && (
                    <button className="btn-descargar" onClick={descargarCSV}>
                      📥 Descargar CSV
                    </button>
                  )}
                  <button
                    className="btn-eliminar"
                    onClick={() => handleEliminar(calculoSeleccionado.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>

              {calculoSeleccionado.estado_procesamiento === 'completado' ? (
                <>
                  <div className="detalle-info">
                    <div className="info-row">
                      <span className="info-label">Periodo:</span>
                      <span className="info-value">
                        {calculoSeleccionado.fecha_inicio} al {calculoSeleccionado.fecha_fin}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Modelo:</span>
                      <span className="info-value">{calculoSeleccionado.modelo_estimacion}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Fecha Análisis:</span>
                      <span className="info-value">
                        {new Date(calculoSeleccionado.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="resultados-grid">
                    <div className="resultado-card">
                      <div className="resultado-header-row">
                        <div className="resultado-icon">🌱</div>
                        <div className="resultado-label">NDVI</div>
                        <div className="info-tooltip">
                          ℹ️
                          <span className="tooltip-text">
                            <strong>NDVI (Índice de Vegetación Normalizado)</strong><br/>
                            Mide la salud de la vegetación usando luz visible e infrarroja.<br/>
                            • Rango: 0 (sin vegetación) a 1 (vegetación muy densa)<br/>
                            • &gt; 0.6: Vegetación saludable<br/>
                            • 0.2-0.6: Vegetación moderada<br/>
                            • &lt; 0.2: Suelo desnudo o vegetación escasa
                          </span>
                        </div>
                      </div>
                      <div className="resultado-valor">
                        {calculoSeleccionado.ndvi_promedio?.toFixed(3) || 'N/A'}
                      </div>
                      {calculoSeleccionado.ndvi_min && calculoSeleccionado.ndvi_max && (
                        <div className="resultado-rango">
                          Rango: {calculoSeleccionado.ndvi_min.toFixed(3)} - {calculoSeleccionado.ndvi_max.toFixed(3)}
                        </div>
                      )}
                    </div>

                    <div className="resultado-card">
                      <div className="resultado-header-row">
                        <div className="resultado-icon">🌿</div>
                        <div className="resultado-label">EVI</div>
                        <div className="info-tooltip">
                          ℹ️
                          <span className="tooltip-text">
                            <strong>EVI (Índice de Vegetación Mejorado)</strong><br/>
                            Similar al NDVI pero optimizado para áreas con vegetación densa.<br/>
                            • Reduce saturación en bosques tropicales<br/>
                            • Minimiza influencia de la atmósfera<br/>
                            • Más preciso en Amazonía que NDVI
                          </span>
                        </div>
                      </div>
                      <div className="resultado-valor">
                        {calculoSeleccionado.evi_promedio?.toFixed(3) || 'N/A'}
                      </div>
                      {calculoSeleccionado.evi_min && calculoSeleccionado.evi_max && (
                        <div className="resultado-rango">
                          Rango: {calculoSeleccionado.evi_min.toFixed(3)} - {calculoSeleccionado.evi_max.toFixed(3)}
                        </div>
                      )}
                    </div>

                    <div className="resultado-card">
                      <div className="resultado-header-row">
                        <div className="resultado-icon">🌳</div>
                        <div className="resultado-label">Biomasa Aérea</div>
                        <div className="info-tooltip">
                          ℹ️
                          <span className="tooltip-text">
                            <strong>Biomasa Aérea</strong><br/>
                            Peso seco de toda la vegetación sobre el suelo:<br/>
                            • Troncos, ramas, hojas, flores y frutos<br/>
                            • Calculada usando modelo Foody 2003<br/>
                            • Fórmula: Biomasa = -156.03 + 625.41×NDVI - 415.87×NDVI²<br/>
                            • Indicador de la cantidad de materia vegetal
                          </span>
                        </div>
                      </div>
                      <div className="resultado-valor">
                        {calculoSeleccionado.biomasa_aerea_estimada?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="resultado-unidad">toneladas</div>
                      {calculoSeleccionado.biomasa_por_hectarea && (
                        <div className="resultado-rango">
                          {calculoSeleccionado.biomasa_por_hectarea.toFixed(2)} t/ha
                        </div>
                      )}
                    </div>

                    <div className="resultado-card destacado">
                      <div className="resultado-header-row">
                        <div className="resultado-icon">💚</div>
                        <div className="resultado-label">Carbono Almacenado</div>
                        <div className="info-tooltip">
                          ℹ️
                          <span className="tooltip-text">
                            <strong>Carbono Almacenado</strong><br/>
                            Cantidad de carbono capturado del CO₂ atmosférico:<br/>
                            • Carbono = Biomasa × 0.47 (factor IPCC)<br/>
                            • Representa carbono secuestrado de la atmósfera<br/>
                            • Fundamental para mitigación del cambio climático<br/>
                            • Mayor valor = mayor servicio ecosistémico
                          </span>
                        </div>
                      </div>
                      <div className="resultado-valor">
                        {calculoSeleccionado.carbono_estimado?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="resultado-unidad">toneladas C</div>
                      {calculoSeleccionado.carbono_por_hectarea && (
                        <div className="resultado-rango">
                          {calculoSeleccionado.carbono_por_hectarea.toFixed(2)} t C/ha
                        </div>
                      )}
                    </div>
                  </div>

                  {calculoSeleccionado.lai_promedio && (
                    <div className="info-adicional">
                      <h5>Información Adicional</h5>
                      <div className="info-grid">
                        {calculoSeleccionado.lai_promedio && (
                          <div className="info-item">
                            <span>LAI (Índice de Área Foliar):</span>
                            <strong>{calculoSeleccionado.lai_promedio.toFixed(2)}</strong>
                          </div>
                        )}
                        {calculoSeleccionado.cobertura_nubosidad_pct !== null && (
                          <div className="info-item">
                            <span>Cobertura de nubes:</span>
                            <strong>{calculoSeleccionado.cobertura_nubosidad_pct.toFixed(1)}%</strong>
                          </div>
                        )}
                        {calculoSeleccionado.num_imagenes_usadas && (
                          <div className="info-item">
                            <span>Imágenes procesadas:</span>
                            <strong>{calculoSeleccionado.num_imagenes_usadas}</strong>
                          </div>
                        )}
                        {calculoSeleccionado.calidad_datos && (
                          <div className="info-item">
                            <span>Calidad de datos:</span>
                            <strong>{calculoSeleccionado.calidad_datos}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {calculoSeleccionado.observaciones && (
                    <div className="observaciones">
                      <h5>Observaciones</h5>
                      <p>{calculoSeleccionado.observaciones}</p>
                    </div>
                  )}

                  {/* Gráfica de Serie Temporal */}
                  {loadingSerie && (
                    <div className="loading-serie">Cargando serie temporal...</div>
                  )}

                  {serieTemporal && serieTemporal.datos && (
                    <>
                      <div className="serie-temporal-grafica">
                        <h5>📈 Serie Temporal - NDVI y EVI</h5>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={serieTemporal.datos}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="fecha"
                              tick={{fontSize: 12}}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis domain={[0, 1]} />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="ndvi"
                              stroke="#28a745"
                              strokeWidth={2}
                              name="NDVI"
                              dot={{r: 4}}
                            />
                            <Line
                              type="monotone"
                              dataKey="evi"
                              stroke="#17a2b8"
                              strokeWidth={2}
                              name="EVI"
                              dot={{r: 4}}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="serie-temporal-grafica">
                        <h5>💚 Serie Temporal - Carbono Almacenado</h5>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={serieTemporal.datos}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="fecha"
                              tick={{fontSize: 12}}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="carbono"
                              stroke="#28a745"
                              strokeWidth={2}
                              name="Carbono (t)"
                              dot={{r: 4}}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )}
                </>
              ) : calculoSeleccionado.estado_procesamiento === 'esperando_csv' ? (
                <div className="esperando-csv-detalle">
                  <p className="csv-icon">📡</p>
                  <h5>Esperando Datos de NASA</h5>
                  <p>La tarea fue creada en NASA AppEEARS. Sigue estos pasos:</p>

                  <div className="instrucciones-csv">
                    <ol>
                      <li>
                        Ve a {' '}
                        <a
                          href={`https://appeears.earthdatacloud.nasa.gov/task/${calculoSeleccionado.nasa_task_id || ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          NASA AppEEARS
                        </a>
                      </li>
                      <li>Espera a que la tarea se complete (10-30 minutos)</li>
                      <li>Descarga el archivo <strong>MOD13Q1-061-Statistics.csv</strong></li>
                      <li>Sube el archivo aquí abajo</li>
                    </ol>
                  </div>

                  <div className="subir-csv-container">
                    <h5>📤 Subir Archivo CSV</h5>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setArchivoCSV(e.target.files[0])}
                      className="file-input"
                    />
                    {archivoCSV && (
                      <p className="archivo-seleccionado">✓ Archivo seleccionado: {archivoCSV.name}</p>
                    )}
                    <button
                      className="btn-primary"
                      onClick={handleSubirCSV}
                      disabled={!archivoCSV || subiendoCSV}
                    >
                      {subiendoCSV ? 'Procesando...' : '🚀 Procesar CSV'}
                    </button>
                  </div>
                </div>
              ) : calculoSeleccionado.estado_procesamiento === 'error' ? (
                <div className="error-detalle">
                  <p className="error-icon">❌</p>
                  <h5>Error en el Procesamiento</h5>
                  <p>{calculoSeleccionado.error_mensaje || 'Error desconocido'}</p>
                  <button className="btn-primary" onClick={onNuevoAnalisis}>
                    Reintentar con Nuevo Análisis
                  </button>
                </div>
              ) : (
                <div className="procesando-detalle">
                  <p className="procesando-icon">⏳</p>
                  <h5>Análisis en Proceso</h5>
                  <p>Este análisis aún se está procesando. Vuelve más tarde para ver los resultados.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistorialSatelital;
