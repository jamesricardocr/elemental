import React, { useState } from 'react';
import { crearCalculoSatelital, getEstadoCalculoSatelital } from '../services/api';

const CalculoSatelitalModal = ({ parcela, onClose, onCalculoCompletado }) => {
  const [configuracion, setConfiguracion] = useState({
    periodo: '90dias',
    fechaInicio: '',
    fechaFin: '',
    modeloEstimacion: 'NDVI_Foody2003',
    factorCarbono: 0.47
  });

  const [estado, setEstado] = useState('configuracion'); // 'configuracion', 'procesando', 'completado', 'error'
  const [calculoId, setCalculoId] = useState(null);
  const [progreso, setProgreso] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [errorDetalle, setErrorDetalle] = useState('');

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
      setMensaje('Enviando solicitud a NASA AppEEARS...');
      setProgreso(10);

      // Crear el cálculo satelital
      const resultado = await crearCalculoSatelital(
        parcela.id,
        configuracion.fechaInicio,
        configuracion.fechaFin,
        configuracion.modeloEstimacion,
        parseFloat(configuracion.factorCarbono)
      );

      setCalculoId(resultado.id);
      setMensaje('Procesando imágenes satelitales. Esto puede tomar 10-30 minutos...');
      setProgreso(30);

      // Iniciar polling para verificar el estado
      iniciarMonitoreo(resultado.id);

    } catch (error) {
      console.error('Error al iniciar cálculo:', error);
      setEstado('error');
      setErrorDetalle(error.message || 'Error al iniciar el cálculo satelital');
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
          setEstado('completado');
          setProgreso(100);
          setMensaje('¡Cálculo completado exitosamente!');

          // Notificar al componente padre
          if (onCalculoCompletado) {
            onCalculoCompletado(id);
          }
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content calculo-satelital-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🛰️ Análisis Satelital - {parcela.nombre}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
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
            </div>
          )}

          {estado === 'procesando' && (
            <div className="estado-procesamiento">
              <div className="loading-spinner"></div>
              <h3>Procesando Análisis Satelital</h3>
              <p>{mensaje}</p>

              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${progreso}%`}}>
                  {progreso}%
                </div>
              </div>

              <div className="info-procesamiento">
                <p><strong>ID del Cálculo:</strong> {calculoId}</p>
                <p><strong>Estado:</strong> Procesando imágenes satelitales de NASA</p>
                <p>
                  Este proceso puede tomar varios minutos. La ventana puede cerrarse sin interrumpir
                  el procesamiento. Podrás ver los resultados en la pestaña "Análisis Satelital"
                  una vez completado.
                </p>
              </div>
            </div>
          )}

          {estado === 'completado' && (
            <div className="estado-completado">
              <div className="success-icon">✅</div>
              <h3>¡Análisis Completado!</h3>
              <p>{mensaje}</p>

              <div className="info-completado">
                <p>El análisis satelital se ha completado exitosamente.</p>
                <p>Puedes ver los resultados detallados en la pestaña <strong>"🛰️ Análisis Satelital"</strong> del detalle de la parcela.</p>
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
                  <li>Exceso de cobertura de nubes (>80%)</li>
                  <li>Error de conexión con NASA AppEEARS</li>
                  <li>Credenciales de NASA EarthData expiradas o inválidas</li>
                </ul>
                <p>Puedes intentar con un periodo diferente o contactar al administrador del sistema.</p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {estado === 'configuracion' && (
            <>
              <button className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleIniciarCalculo}
                disabled={!configuracion.fechaInicio || !configuracion.fechaFin}
              >
                🚀 Iniciar Análisis
              </button>
            </>
          )}

          {estado === 'procesando' && (
            <button className="btn-secondary" onClick={onClose}>
              Cerrar (continúa en segundo plano)
            </button>
          )}

          {(estado === 'completado' || estado === 'error') && (
            <button className="btn-primary" onClick={onClose}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculoSatelitalModal;
