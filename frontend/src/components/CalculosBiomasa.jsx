import React, { useState, useEffect } from 'react';
import {
  ejecutarCalculoBiomasa,
  getCalculosParcela
} from '../services/api';

const CalculosBiomasa = ({ parcelaId }) => {
  const [calculos, setCalculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ejecutando, setEjecutando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [parametrosCalculo, setParametrosCalculo] = useState({
    modelo_alometrico: 'chave2014',
    factor_carbono: '0.47'
  });

  useEffect(() => {
    cargarCalculos();
  }, [parcelaId]);

  const cargarCalculos = async () => {
    try {
      setLoading(true);
      const data = await getCalculosParcela(parcelaId);
      setCalculos(data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar cálculos:', err);
      setError('Error al cargar los cálculos de biomasa');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParametrosCalculo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEjecutarCalculo = async (e) => {
    e.preventDefault();

    const factorCarbono = parseFloat(parametrosCalculo.factor_carbono);
    if (factorCarbono <= 0 || factorCarbono > 1) {
      alert('El factor de carbono debe estar entre 0 y 1 (típicamente 0.47)');
      return;
    }

    try {
      setEjecutando(true);
      await ejecutarCalculoBiomasa(
        parcelaId,
        parametrosCalculo.modelo_alometrico,
        factorCarbono
      );

      await cargarCalculos();
      setMostrarFormulario(false);
      alert('Cálculo ejecutado exitosamente');
    } catch (err) {
      console.error('Error al ejecutar cálculo:', err);
      alert('Error al ejecutar el cálculo: ' + (err.response?.data?.detail || err.message));
    } finally {
      setEjecutando(false);
    }
  };

  const calculoMasReciente = calculos.length > 0 ? calculos[0] : null;

  if (loading) {
    return <div className="loading">Cargando cálculos...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="calculos-biomasa">
      {/* Información de Modelos */}
      <div className="modelos-info">
        <h3>📐 Modelos Alométricos Disponibles</h3>
        <div className="modelos-grid">
          <div className="modelo-card">
            <div className="modelo-nombre">Chave 2014</div>
            <div className="modelo-descripcion">
              Modelo estándar para bosques húmedos tropicales.
              Utiliza DAP, altura y densidad de la madera.
            </div>
          </div>
          <div className="modelo-card">
            <div className="modelo-nombre">IPCC</div>
            <div className="modelo-descripcion">
              Guías del Panel Intergubernamental sobre Cambio Climático.
              Factores de conversión para biomasa subterránea.
            </div>
          </div>
          <div className="modelo-card">
            <div className="modelo-nombre">IDEAM</div>
            <div className="modelo-descripcion">
              Metodología del Instituto de Hidrología, Meteorología y
              Estudios Ambientales de Colombia.
            </div>
          </div>
        </div>
      </div>

      {/* Botón Ejecutar Cálculo */}
      <div className="acciones-header">
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="btn-calcular"
          disabled={ejecutando}
        >
          {mostrarFormulario ? '❌ Cancelar' : '🧮 Ejecutar Nuevo Cálculo'}
        </button>
      </div>

      {/* Formulario de Cálculo */}
      {mostrarFormulario && (
        <div className="formulario-panel">
          <h3>Ejecutar Cálculo de Biomasa y Carbono</h3>
          <form onSubmit={handleEjecutarCalculo} className="calculo-form">
            <div className="form-row">
              <div className="form-group">
                <label>Modelo Alométrico *</label>
                <select
                  name="modelo_alometrico"
                  value={parametrosCalculo.modelo_alometrico}
                  onChange={handleInputChange}
                  required
                >
                  <option value="chave2014">Chave 2014 (Bosques Húmedos Tropicales)</option>
                  <option value="ipcc">IPCC (Directrices Generales)</option>
                  <option value="ideam">IDEAM (Metodología Colombia)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Factor de Carbono *</label>
                <input
                  type="number"
                  step="0.01"
                  name="factor_carbono"
                  value={parametrosCalculo.factor_carbono}
                  onChange={handleInputChange}
                  placeholder="0.47"
                  min="0"
                  max="1"
                  required
                />
                <small className="form-help">Típicamente 0.47 (47% de la biomasa es carbono)</small>
              </div>
            </div>

            <div className="calculo-info">
              <h4>El cálculo incluirá:</h4>
              <ul>
                <li>✓ Biomasa aérea de árboles (usando modelo seleccionado)</li>
                <li>✓ Biomasa subterránea (raíces - factores IPCC)</li>
                <li>✓ Necromasa (gruesa y fina)</li>
                <li>✓ Biomasa herbácea</li>
                <li>✓ Conversión a carbono almacenado (t C/ha)</li>
              </ul>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-ejecutar" disabled={ejecutando}>
                {ejecutando ? '⏳ Calculando...' : '🚀 Ejecutar Cálculo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resultado Más Reciente */}
      {calculoMasReciente && (
        <div className="resultado-principal">
          <h3>🎯 Resultado Más Reciente</h3>
          <div className="resultado-meta">
            <div className="meta-item">
              <strong>Modelo:</strong> {calculoMasReciente.modelo_alometrico.toUpperCase()}
            </div>
            <div className="meta-item">
              <strong>Factor Carbono:</strong> {calculoMasReciente.factor_carbono}
            </div>
            <div className="meta-item">
              <strong>Fecha:</strong> {new Date(calculoMasReciente.created_at).toLocaleString('es-CO')}
            </div>
          </div>

          <div className="resultados-grid">
            <div className="resultado-card biomasa-aerea">
              <div className="resultado-icon">🌳</div>
              <div className="resultado-valor">{calculoMasReciente.biomasa_aerea.toFixed(2)} t</div>
              <div className="resultado-label">Biomasa Aérea</div>
              <div className="resultado-sublabel">(Árboles)</div>
            </div>

            <div className="resultado-card biomasa-subterranea">
              <div className="resultado-icon">🌱</div>
              <div className="resultado-valor">{calculoMasReciente.biomasa_subterranea.toFixed(2)} t</div>
              <div className="resultado-label">Biomasa Subterránea</div>
              <div className="resultado-sublabel">(Raíces)</div>
            </div>

            <div className="resultado-card necromasa">
              <div className="resultado-icon">🪵</div>
              <div className="resultado-valor">{calculoMasReciente.necromasa.toFixed(2)} t</div>
              <div className="resultado-label">Necromasa</div>
              <div className="resultado-sublabel">(Biomasa Muerta)</div>
            </div>

            <div className="resultado-card herbaceas">
              <div className="resultado-icon">🌿</div>
              <div className="resultado-valor">{calculoMasReciente.herbaceas.toFixed(2)} t</div>
              <div className="resultado-label">Herbáceas</div>
              <div className="resultado-sublabel">(Vegetación Herbácea)</div>
            </div>

            <div className="resultado-card biomasa-total">
              <div className="resultado-icon">📊</div>
              <div className="resultado-valor">{calculoMasReciente.biomasa_total.toFixed(2)} t</div>
              <div className="resultado-label">Biomasa Total</div>
              <div className="resultado-sublabel">(0.1 ha)</div>
            </div>

            <div className="resultado-card carbono-total destacado">
              <div className="resultado-icon">💎</div>
              <div className="resultado-valor">{calculoMasReciente.carbono_total.toFixed(2)} t C</div>
              <div className="resultado-label">Carbono Total</div>
              <div className="resultado-sublabel">{(calculoMasReciente.carbono_total * 10).toFixed(2)} t C/ha</div>
            </div>
          </div>
        </div>
      )}

      {/* Historial de Cálculos */}
      {calculos.length > 1 && (
        <div className="historial-container">
          <h3>📜 Historial de Cálculos ({calculos.length})</h3>
          <div className="tabla-scroll">
            <table className="tabla-historial">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Modelo</th>
                  <th>Factor C</th>
                  <th>Biomasa Aérea (t)</th>
                  <th>Biomasa Subterránea (t)</th>
                  <th>Necromasa (t)</th>
                  <th>Herbáceas (t)</th>
                  <th>Biomasa Total (t)</th>
                  <th>Carbono (t C)</th>
                  <th>t C/ha</th>
                </tr>
              </thead>
              <tbody>
                {calculos.map(calc => (
                  <tr key={calc.id}>
                    <td>{new Date(calc.created_at).toLocaleDateString('es-CO')}</td>
                    <td><span className="badge-modelo">{calc.modelo_alometrico}</span></td>
                    <td>{calc.factor_carbono}</td>
                    <td>{calc.biomasa_aerea.toFixed(2)}</td>
                    <td>{calc.biomasa_subterranea.toFixed(2)}</td>
                    <td>{calc.necromasa.toFixed(2)}</td>
                    <td>{calc.herbaceas.toFixed(2)}</td>
                    <td><strong>{calc.biomasa_total.toFixed(2)}</strong></td>
                    <td><strong>{calc.carbono_total.toFixed(2)}</strong></td>
                    <td className="destacado">{(calc.carbono_total * 10).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {calculos.length === 0 && (
        <div className="empty-state">
          No hay cálculos de biomasa ejecutados para esta parcela.
          <br />
          <br />
          Para ejecutar un cálculo, primero asegúrese de tener registrados:
          <ul>
            <li>Árboles con mediciones de DAP y altura</li>
            <li>Especies con densidad de madera</li>
            <li>Necromasa (opcional pero recomendado)</li>
            <li>Herbáceas (opcional pero recomendado)</li>
          </ul>
          Luego haga clic en "Ejecutar Nuevo Cálculo".
        </div>
      )}
    </div>
  );
};

export default CalculosBiomasa;
