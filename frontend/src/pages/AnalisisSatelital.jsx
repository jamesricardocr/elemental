import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getParcela, crearCalculoSatelital, getEstadoCalculoSatelital, subirCSVNasa } from '../services/api';

const AnalisisSatelital = () => {
  const { parcelaId } = useParams();
  const navigate = useNavigate();

  const [parcela, setParcela] = useState(null);
  const [loading, setLoading] = useState(true);

  const [configuracion, setConfiguracion] = useState({
    periodo: '90dias',
    fechaInicio: '',
    fechaFin: '',
    modeloEstimacion: 'NDVI_Foody2003',
    factorCarbono: 0.47
  });

  const [estado, setEstado] = useState('configuracion'); // 'configuracion', 'esperando_csv', 'procesando', 'completado', 'error'
  const [calculoId, setCalculoId] = useState(null);
  const [progreso, setProgreso] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [errorDetalle, setErrorDetalle] = useState('');
  const [resultados, setResultados] = useState(null);
  const [archivoCSV, setArchivoCSV] = useState(null);
  const [subiendoCSV, setSubiendoCSV] = useState(false);

  // Cargar datos de la parcela
  useEffect(() => {
    const cargarParcela = async () => {
      try {
        const data = await getParcela(parcelaId);
        setParcela(data);

        // Inicializar fechas al cargar
        const fechas = calcularFechas('90dias');
        setConfiguracion(prev => ({
          ...prev,
          fechaInicio: fechas.inicio,
          fechaFin: fechas.fin
        }));

        setLoading(false);
      } catch (error) {
        console.error('Error al cargar parcela:', error);
        setLoading(false);
      }
    };

    cargarParcela();
  }, [parcelaId]);

  // Calcular fechas automáticamente según el periodo seleccionado
  const calcularFechas = (periodo) => {
    const hoy = new Date();
    let fechaInicio = new Date();

    switch (periodo) {
      case '30dias':
        fechaInicio.setDate(hoy.getDate() - 30);
        break;
      case '90dias':
        fechaInicio.setDate(hoy.getDate() - 90);
        break;
      case '6meses':
        fechaInicio.setMonth(hoy.getMonth() - 6);
        break;
      case '1ano':
        fechaInicio.setFullYear(hoy.getFullYear() - 1);
        break;
      case 'personalizado':
        return { inicio: '', fin: '' };
      default:
        fechaInicio.setDate(hoy.getDate() - 90);
    }

    return {
      inicio: fechaInicio.toISOString().split('T')[0],
      fin: hoy.toISOString().split('T')[0]
    };
  };

  const handlePeriodoChange = (e) => {
    const periodo = e.target.value;
    const fechas = calcularFechas(periodo);

    setConfiguracion({
      ...configuracion,
      periodo,
      fechaInicio: fechas.inicio,
      fechaFin: fechas.fin
    });
  };

  const handleIniciarCalculo = async () => {
    try {
      setEstado('procesando');
      setMensaje('Creando solicitud en NASA AppEEARS...');
      setProgreso(10);

      // Crear el cálculo satelital (o obtener uno cacheado)
      const resultado = await crearCalculoSatelital(
        parcela.id,
        configuracion.fechaInicio,
        configuracion.fechaFin,
        configuracion.modeloEstimacion,
        parseFloat(configuracion.factorCarbono)
      );

      setCalculoId(resultado.id);

      // Si ya está completado (cache hit), mostrar resultados directamente
      if (resultado.estado_procesamiento === 'completado') {
        setEstado('completado');
        setProgreso(100);
        setMensaje('¡Análisis recuperado del caché!');
        setResultados(resultado);
      } else if (resultado.estado_procesamiento === 'esperando_csv') {
        // Nuevo flujo: Esperar que usuario suba CSV
        setEstado('esperando_csv');
        setProgreso(50);
        setMensaje('Tarea creada en NASA. Descarga el CSV y súbelo aquí.');
      } else {
        // Si está procesando, iniciar monitoreo
        setMensaje('Procesando...');
        setProgreso(30);
        iniciarMonitoreo(resultado.id);
      }

    } catch (error) {
      console.error('Error al iniciar cálculo:', error);
      setEstado('error');
      setErrorDetalle(error.message || 'Error al iniciar el cálculo satelital');
    }
  };

  const handleSubirCSV = async () => {
    if (!archivoCSV || !calculoId) return;

    try {
      setSubiendoCSV(true);
      setMensaje('Procesando archivo CSV...');

      const resultado = await subirCSVNasa(calculoId, archivoCSV);

      // Obtener datos completos del cálculo
      const calculoCompleto = await fetch(`http://localhost:8000/api/calculos-satelitales/${calculoId}`).then(r => r.json());

      setEstado('completado');
      setProgreso(100);
      setMensaje(`¡CSV procesado! ${resultado.puntos_procesados} observaciones satelitales cargadas.`);
      setResultados(calculoCompleto);

    } catch (error) {
      console.error('Error al subir CSV:', error);
      setEstado('error');
      setErrorDetalle(error.message || 'Error al procesar el archivo CSV');
    } finally {
      setSubiendoCSV(false);
    }
  };

  const iniciarMonitoreo = (id) => {
    const intervalo = setInterval(async () => {
      try {
        const estadoActual = await getEstadoCalculoSatelital(id);

        setProgreso(estadoActual.progreso_pct || 50);
        setMensaje(estadoActual.mensaje || 'Procesando...');

        if (estadoActual.estado_procesamiento === 'completado') {
          clearInterval(intervalo);
          // Obtener el cálculo completo con todos los datos
          const calculoCompleto = await fetch(`http://localhost:8000/api/calculos-satelitales/${id}`).then(r => r.json());
          setEstado('completado');
          setProgreso(100);
          setMensaje('¡Cálculo completado exitosamente!');
          setResultados(calculoCompleto);
        } else if (estadoActual.estado_procesamiento === 'error') {
          clearInterval(intervalo);
          setEstado('error');
          setErrorDetalle(estadoActual.error_mensaje || 'Error en el procesamiento');
        }
      } catch (error) {
        console.error('Error al verificar estado:', error);
        clearInterval(intervalo);
        setEstado('error');
        setErrorDetalle('Error al verificar el estado del cálculo');
      }
    }, 10000); // Verificar cada 10 segundos

    // Limpiar intervalo después de 30 minutos (timeout)
    setTimeout(() => {
      clearInterval(intervalo);
      if (estado === 'procesando') {
        setEstado('error');
        setErrorDetalle('Tiempo de espera agotado. El cálculo puede seguir procesándose en segundo plano.');
      }
    }, 30 * 60 * 1000);
  };

  if (loading) {
    return (
      <div className="analisis-satelital-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando información de la parcela...</p>
        </div>
      </div>
    );
  }

  if (!parcela) {
    return (
      <div className="analisis-satelital-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>No se pudo cargar la información de la parcela.</p>
          <button className="btn-primary" onClick={() => navigate('/parcelas')}>
            Volver a Parcelas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analisis-satelital-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/parcelas')}>
          ← Volver
        </button>
        <h1>🛰️ Análisis Satelital - {parcela.nombre}</h1>
      </div>

      <div className="page-content">
        <div className="main-section">
          {estado === 'configuracion' && (
            <div className="configuracion-form">
              <div className="info-box">
                <h4>ℹ️ Acerca de esta funcionalidad</h4>
                <p>
                  El análisis satelital utiliza imágenes de satélite (MODIS, Sentinel) de la NASA
                  para calcular índices de vegetación (NDVI, EVI) y estimar biomasa y carbono
                  sin necesidad de mediciones de campo.
                </p>
                <p>
                  <strong>Parcela:</strong> {parcela.codigo} - {parcela.nombre}<br/>
                  <strong>Área:</strong> 0.1 hectáreas (20m × 50m)<br/>
                  <strong>Coordenadas:</strong> {parcela.latitud?.toFixed(6)}°, {parcela.longitud?.toFixed(6)}°
                </p>
              </div>

              <div className="form-group">
                <label>Periodo de Análisis</label>
                <select
                  value={configuracion.periodo}
                  onChange={handlePeriodoChange}
                  className="form-control"
                >
                  <option value="30dias">Últimos 30 días</option>
                  <option value="90dias">Últimos 90 días (recomendado)</option>
                  <option value="6meses">Últimos 6 meses</option>
                  <option value="1ano">Último año</option>
                  <option value="personalizado">Periodo personalizado</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha Inicio</label>
                  <input
                    type="date"
                    value={configuracion.fechaInicio}
                    onChange={(e) => setConfiguracion({...configuracion, fechaInicio: e.target.value})}
                    className="form-control"
                    disabled={configuracion.periodo !== 'personalizado'}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Fin</label>
                  <input
                    type="date"
                    value={configuracion.fechaFin}
                    onChange={(e) => setConfiguracion({...configuracion, fechaFin: e.target.value})}
                    className="form-control"
                    disabled={configuracion.periodo !== 'personalizado'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Modelo de Estimación</label>
                <select
                  value={configuracion.modeloEstimacion}
                  onChange={(e) => setConfiguracion({...configuracion, modeloEstimacion: e.target.value})}
                  className="form-control"
                >
                  <option value="NDVI_Foody2003">NDVI → Biomasa (Foody et al. 2003)</option>
                  <option value="EVI_Modified">EVI Modificado (bosques densos)</option>
                  <option value="Combined_Indices">Índices Combinados (NDVI + EVI + LAI)</option>
                </select>
                <small className="form-text">
                  Foody 2003 es el modelo recomendado para bosques tropicales amazónicos
                </small>
              </div>

              <div className="form-group">
                <label>Factor de Carbono</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.3"
                  max="0.6"
                  value={configuracion.factorCarbono}
                  onChange={(e) => setConfiguracion({...configuracion, factorCarbono: e.target.value})}
                  className="form-control"
                />
                <small className="form-text">
                  Factor de conversión de biomasa a carbono (default: 0.47 según IPCC)
                </small>
              </div>

              <div className="warning-box">
                <strong>⏱️ Tiempo estimado:</strong> 10-30 minutos<br/>
                <strong>📡 Fuente de datos:</strong> NASA AppEEARS (MODIS Terra/Aqua)<br/>
                <strong>🌍 Resolución:</strong> 250m (adecuada para parcelas de 0.1 ha)
              </div>

              <div className="action-buttons">
                <button className="btn-secondary" onClick={() => navigate('/parcelas')}>
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  onClick={handleIniciarCalculo}
                  disabled={!configuracion.fechaInicio || !configuracion.fechaFin}
                >
                  🚀 Iniciar Análisis
                </button>
              </div>
            </div>
          )}

          {estado === 'esperando_csv' && (
            <div className="estado-esperando-csv">
              <div className="success-icon">📡</div>
              <h3>Tarea Creada en NASA AppEEARS</h3>
              <p>{mensaje}</p>

              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${progreso}%`}}>
                  {progreso}%
                </div>
              </div>

              <div className="info-box">
                <h4>📋 Instrucciones:</h4>
                <ol>
                  <li>Ve a <a href={`https://appeears.earthdatacloud.nasa.gov/task/${calculoId?.nasa_task_id || ''}`} target="_blank" rel="noopener noreferrer">NASA AppEEARS</a></li>
                  <li>Espera a que la tarea se complete (10-30 minutos)</li>
                  <li>Descarga el archivo <strong>MOD13Q1-061-Statistics.csv</strong></li>
                  <li>Sube el archivo aquí abajo</li>
                </ol>
              </div>

              <div className="subir-csv-container">
                <h4>Subir archivo CSV de NASA:</h4>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setArchivoCSV(e.target.files[0])}
                  className="file-input"
                />
                {archivoCSV && (
                  <p className="archivo-seleccionado">✓ Archivo: {archivoCSV.name}</p>
                )}
              </div>

              <div className="action-buttons">
                <button className="btn-secondary" onClick={() => navigate('/parcelas')}>
                  Volver a Parcelas
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSubirCSV}
                  disabled={!archivoCSV || subiendoCSV}
                >
                  {subiendoCSV ? 'Procesando...' : '📤 Procesar CSV'}
                </button>
              </div>
            </div>
          )}

          {estado === 'procesando' && (
            <div className="estado-procesamiento">
              <div className="loading-spinner"></div>
              <h3>Procesando</h3>
              <p>{mensaje}</p>

              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${progreso}%`}}>
                  {progreso}%
                </div>
              </div>

              <button className="btn-secondary" onClick={() => navigate('/parcelas')}>
                Volver a Parcelas
              </button>
            </div>
          )}

          {estado === 'completado' && resultados && (
            <div className="estado-completado">
              <div className="success-icon">✅</div>
              <h3>¡Análisis Completado!</h3>
              <p>{mensaje}</p>

              <div className="resultados-satelital">
                <h4>📊 Resultados del Análisis</h4>

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
                      {resultados.ndvi_promedio?.toFixed(3) || 'N/A'}
                    </div>
                    {resultados.ndvi_min && resultados.ndvi_max && (
                      <div className="resultado-rango">
                        Rango: {resultados.ndvi_min.toFixed(3)} - {resultados.ndvi_max.toFixed(3)}
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
                      {resultados.evi_promedio?.toFixed(3) || 'N/A'}
                    </div>
                    {resultados.evi_min && resultados.evi_max && (
                      <div className="resultado-rango">
                        Rango: {resultados.evi_min.toFixed(3)} - {resultados.evi_max.toFixed(3)}
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
                      {resultados.biomasa_aerea_estimada?.toFixed(2) || 'N/A'}
                    </div>
                    <div className="resultado-unidad">toneladas</div>
                    {resultados.biomasa_por_hectarea && (
                      <div className="resultado-rango">
                        {resultados.biomasa_por_hectarea.toFixed(2)} t/ha
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
                      {resultados.carbono_estimado?.toFixed(2) || 'N/A'}
                    </div>
                    <div className="resultado-unidad">toneladas C</div>
                    {resultados.carbono_por_hectarea && (
                      <div className="resultado-rango">
                        {resultados.carbono_por_hectarea.toFixed(2)} t C/ha
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-completado">
                  <p><strong>Periodo analizado:</strong> {configuracion.fechaInicio} al {configuracion.fechaFin}</p>
                  <p><strong>Modelo utilizado:</strong> {configuracion.modeloEstimacion}</p>
                  <p>Los resultados se han guardado en el historial de la parcela.</p>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn-secondary" onClick={() => navigate('/parcelas')}>
                  Volver a Parcelas
                </button>
                <button className="btn-primary" onClick={() => {
                  setEstado('configuracion');
                  setResultados(null);
                }}>
                  Realizar Nuevo Análisis
                </button>
              </div>
            </div>
          )}

          {estado === 'error' && (
            <div className="estado-error">
              <div className="error-icon">❌</div>
              <h3>Error en el Procesamiento</h3>
              <p className="error-mensaje">{errorDetalle}</p>

              <div className="info-error">
                <p><strong>Posibles causas:</strong></p>
                <ul>
                  <li>No hay imágenes satelitales disponibles para el periodo seleccionado</li>
                  <li>Exceso de cobertura de nubes (&gt;80%)</li>
                  <li>Error de conexión con NASA AppEEARS</li>
                  <li>Credenciales de NASA EarthData expiradas o inválidas</li>
                </ul>
                <p>Puedes intentar con un periodo diferente o contactar al administrador del sistema.</p>
              </div>

              <div className="action-buttons">
                <button className="btn-secondary" onClick={() => navigate('/parcelas')}>
                  Volver a Parcelas
                </button>
                <button className="btn-primary" onClick={() => setEstado('configuracion')}>
                  Reintentar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalisisSatelital;
