import React, { useState, useEffect } from 'react';
import {
  fetchHerbaceasParcela,
  createHerbaceas,
  deleteHerbaceas
} from '../services/api';

const GestionHerbaceas = ({ parcelaId }) => {
  const [herbaceas, setHerbaceas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nuevaHerbacea, setNuevaHerbacea] = useState({
    cuadrante_numero: '',
    peso_fresco: '',
    peso_seco: '',
    cobertura_porcentaje: '',
    observaciones: ''
  });

  useEffect(() => {
    cargarHerbaceas();
  }, [parcelaId]);

  const cargarHerbaceas = async () => {
    try {
      setLoading(true);
      const data = await fetchHerbaceasParcela(parcelaId);
      setHerbaceas(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar herbáceas:', err);
      setError('Error al cargar la información de herbáceas');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaHerbacea(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!nuevaHerbacea.cuadrante_numero || !nuevaHerbacea.peso_fresco || !nuevaHerbacea.peso_seco) {
      alert('Por favor complete todos los campos obligatorios');
      return false;
    }

    const pesoFresco = parseFloat(nuevaHerbacea.peso_fresco);
    const pesoSeco = parseFloat(nuevaHerbacea.peso_seco);

    if (pesoFresco <= 0 || pesoSeco <= 0) {
      alert('Los pesos deben ser mayores a 0');
      return false;
    }

    if (pesoSeco > pesoFresco) {
      alert('El peso seco no puede ser mayor al peso fresco');
      return false;
    }

    if (nuevaHerbacea.cobertura_porcentaje) {
      const cobertura = parseFloat(nuevaHerbacea.cobertura_porcentaje);
      if (cobertura < 0 || cobertura > 100) {
        alert('La cobertura debe estar entre 0 y 100%');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      const herbaceaData = {
        parcela_id: parcelaId,
        cuadrante_numero: parseInt(nuevaHerbacea.cuadrante_numero),
        peso_fresco: parseFloat(nuevaHerbacea.peso_fresco),
        peso_seco: parseFloat(nuevaHerbacea.peso_seco),
        cobertura_porcentaje: nuevaHerbacea.cobertura_porcentaje
          ? parseFloat(nuevaHerbacea.cobertura_porcentaje)
          : null,
        observaciones: nuevaHerbacea.observaciones || null
      };

      await createHerbaceas(herbaceaData);

      // Resetear formulario
      setNuevaHerbacea({
        cuadrante_numero: '',
        peso_fresco: '',
        peso_seco: '',
        cobertura_porcentaje: '',
        observaciones: ''
      });

      setMostrarFormulario(false);
      await cargarHerbaceas();
      alert('Herbácea registrada exitosamente');
    } catch (err) {
      console.error('Error al crear herbácea:', err);
      alert('Error al registrar la herbácea: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEliminar = async (herbaceaId) => {
    if (!confirm('¿Está seguro de eliminar este registro de herbácea?')) {
      return;
    }

    try {
      await deleteHerbaceas(herbaceaId);
      await cargarHerbaceas();
      alert('Herbácea eliminada exitosamente');
    } catch (err) {
      console.error('Error al eliminar herbácea:', err);
      alert('Error al eliminar la herbácea');
    }
  };

  const calcularEstadisticas = () => {
    if (herbaceas.length === 0) return null;

    const totalPesoFresco = herbaceas.reduce((sum, h) => sum + h.peso_fresco, 0);
    const totalPesoSeco = herbaceas.reduce((sum, h) => sum + h.peso_seco, 0);
    const coberturaPromedio = herbaceas
      .filter(h => h.cobertura_porcentaje !== null)
      .reduce((sum, h) => sum + h.cobertura_porcentaje, 0) /
      herbaceas.filter(h => h.cobertura_porcentaje !== null).length;

    return {
      total: herbaceas.length,
      totalPesoFresco: totalPesoFresco.toFixed(2),
      totalPesoSeco: totalPesoSeco.toFixed(2),
      promedioPesoFresco: (totalPesoFresco / herbaceas.length).toFixed(2),
      promedioPesoSeco: (totalPesoSeco / herbaceas.length).toFixed(2),
      coberturaPromedio: coberturaPromedio ? coberturaPromedio.toFixed(1) : 'N/A'
    };
  };

  const estadisticas = calcularEstadisticas();

  if (loading) {
    return <div className="loading">Cargando herbáceas...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="gestion-herbaceas">
      {/* Información del Protocolo */}
      <div className="protocolo-info">
        <h3>📋 Protocolo de Vegetación Herbácea</h3>
        <div className="protocolo-grid">
          <div className="protocolo-item">
            <strong>Tamaño de Cuadrante:</strong> 1m × 1m (1 m²)
          </div>
          <div className="protocolo-item">
            <strong>Procedimiento:</strong> Cortar toda vegetación herbácea a ras del suelo
          </div>
          <div className="protocolo-item">
            <strong>Medición:</strong> Pesar biomasa fresca, tomar submuestra para secado
          </div>
          <div className="protocolo-item">
            <strong>Extrapolación:</strong> Calcular biomasa seca por unidad de área (kg/ha)
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="estadisticas-panel">
          <h3>Estadísticas de Herbáceas</h3>
          <div className="estadisticas-grid">
            <div className="estadistica-card">
              <div className="estadistica-valor">{estadisticas.total}</div>
              <div className="estadistica-label">Total Cuadrantes</div>
            </div>
            <div className="estadistica-card">
              <div className="estadistica-valor">{estadisticas.totalPesoSeco} kg</div>
              <div className="estadistica-label">Peso Seco Total</div>
            </div>
            <div className="estadistica-card">
              <div className="estadistica-valor">{estadisticas.promedioPesoSeco} kg</div>
              <div className="estadistica-label">Promedio Peso Seco</div>
            </div>
            <div className="estadistica-card">
              <div className="estadistica-valor">{estadisticas.coberturaPromedio}%</div>
              <div className="estadistica-label">Cobertura Promedio</div>
            </div>
          </div>
        </div>
      )}

      {/* Botón Agregar */}
      <div className="acciones-header">
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="btn-agregar"
        >
          {mostrarFormulario ? '❌ Cancelar' : '➕ Agregar Herbácea'}
        </button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="formulario-panel">
          <h3>Registrar Vegetación Herbácea en Cuadrante</h3>
          <form onSubmit={handleSubmit} className="herbacea-form">
            <div className="form-row">
              <div className="form-group">
                <label>Número de Cuadrante (1m × 1m) *</label>
                <input
                  type="number"
                  name="cuadrante_numero"
                  value={nuevaHerbacea.cuadrante_numero}
                  onChange={handleInputChange}
                  placeholder="Ej: 1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Cobertura (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="cobertura_porcentaje"
                  value={nuevaHerbacea.cobertura_porcentaje}
                  onChange={handleInputChange}
                  placeholder="Ej: 75.5"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Peso Fresco (kg) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="peso_fresco"
                  value={nuevaHerbacea.peso_fresco}
                  onChange={handleInputChange}
                  placeholder="Ej: 2.50"
                  required
                />
              </div>

              <div className="form-group">
                <label>Peso Seco (kg) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="peso_seco"
                  value={nuevaHerbacea.peso_seco}
                  onChange={handleInputChange}
                  placeholder="Ej: 1.20"
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Observaciones</label>
              <textarea
                name="observaciones"
                value={nuevaHerbacea.observaciones}
                onChange={handleInputChange}
                rows="3"
                placeholder="Observaciones adicionales..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-guardar">
                💾 Guardar Herbácea
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Herbáceas */}
      <div className="tabla-container">
        <h3>Herbáceas Registradas ({herbaceas.length})</h3>

        {herbaceas.length === 0 ? (
          <div className="empty-state">
            No hay herbáceas registradas en esta parcela.
            <br />
            Haga clic en "Agregar Herbácea" para comenzar.
          </div>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla-herbaceas">
              <thead>
                <tr>
                  <th>Cuadrante</th>
                  <th>Peso Fresco (kg)</th>
                  <th>Peso Seco (kg)</th>
                  <th>Relación PS/PF</th>
                  <th>Cobertura (%)</th>
                  <th>Biomasa por Ha</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {herbaceas.map(herbacea => (
                  <tr key={herbacea.id}>
                    <td>
                      <span className="badge-cuadrante">
                        {herbacea.cuadrante_numero}
                      </span>
                    </td>
                    <td>{herbacea.peso_fresco.toFixed(2)}</td>
                    <td>{herbacea.peso_seco.toFixed(2)}</td>
                    <td>{(herbacea.peso_seco / herbacea.peso_fresco).toFixed(3)}</td>
                    <td>
                      {herbacea.cobertura_porcentaje !== null
                        ? `${herbacea.cobertura_porcentaje.toFixed(1)}%`
                        : 'N/A'}
                    </td>
                    <td>
                      {herbacea.biomasa_por_hectarea
                        ? `${herbacea.biomasa_por_hectarea.toFixed(2)} kg/ha`
                        : 'N/A'}
                    </td>
                    <td>{herbacea.observaciones || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleEliminar(herbacea.id)}
                        className="btn-eliminar"
                        title="Eliminar herbácea"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionHerbaceas;
