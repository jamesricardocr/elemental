import { useState } from 'react'
import { calcularVerticesParcela, formatearCoordenadas, calcularDistancia } from '../utils/geometryUtils'
import { createParcela } from '../services/api'
import './ConfirmacionParcela.css'

function ConfirmacionParcela({
  zona,
  puntoReferencia,
  posicionParcela,
  rotacion,
  onParcelaCreada,
  onVolver,
  onCancelar
}) {
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const vertices = calcularVerticesParcela(posicionParcela.lat, posicionParcela.lng, rotacion)
  const distancia = calcularDistancia(
    puntoReferencia.latitud,
    puntoReferencia.longitud,
    posicionParcela.lat,
    posicionParcela.lng
  )

  const handleGuardar = async () => {
    if (!codigo.trim()) {
      setError('El código de la parcela es obligatorio')
      return
    }

    setGuardando(true)
    setError(null)

    try {
      // Convertir vértices al formato esperado por el backend
      const verticesArray = vertices.map(v => [v.lat, v.lng])

      const parcelaData = {
        codigo: codigo.trim(),
        nombre: nombre.trim() || null,
        zona_priorizada: zona,
        latitud: posicionParcela.lat,
        longitud: posicionParcela.lng,
        estado: 'activa',
        observaciones: observaciones.trim() || null,
        generar_vertices: false,
        // Pasar vértices individuales
        vertice1_lat: verticesArray[0][0],
        vertice1_lon: verticesArray[0][1],
        vertice2_lat: verticesArray[1][0],
        vertice2_lon: verticesArray[1][1],
        vertice3_lat: verticesArray[2][0],
        vertice3_lon: verticesArray[2][1],
        vertice4_lat: verticesArray[3][0],
        vertice4_lon: verticesArray[3][1]
      }

      console.log('Creando parcela con datos:', parcelaData)
      const nuevaParcela = await createParcela(parcelaData)
      console.log('Parcela creada exitosamente:', nuevaParcela)

      onParcelaCreada(nuevaParcela)
    } catch (err) {
      console.error('Error guardando parcela:', err)
      setError(err.message || 'Error al guardar la parcela')
      setGuardando(false)
    }
  }

  return (
    <div className="confirmacion-panel">
      <div className="confirmacion-header">
        <h2>Confirmar Nueva Parcela</h2>
        <p>Revisa los datos y completa la información</p>
      </div>

      <div className="confirmacion-content">
        <div className="datos-ubicacion">
          <h3>📍 Ubicación</h3>
          <div className="dato-item">
            <span className="dato-label">Zona Priorizada:</span>
            <span className="dato-valor">{zona}</span>
          </div>
          <div className="dato-item">
            <span className="dato-label">Punto de Referencia:</span>
            <span className="dato-valor">{puntoReferencia.nombre || `ID: ${puntoReferencia.id}`}</span>
          </div>
          <div className="dato-item">
            <span className="dato-label">Distancia del Punto:</span>
            <span className="dato-valor">{distancia.toFixed(1)} m</span>
          </div>
          <div className="dato-item">
            <span className="dato-label">Centro de Parcela:</span>
            <span className="dato-valor coords">{formatearCoordenadas(posicionParcela.lat, posicionParcela.lng)}</span>
          </div>
          <div className="dato-item">
            <span className="dato-label">Rotación:</span>
            <span className="dato-valor">{rotacion}°</span>
          </div>
        </div>

        <div className="datos-vertices">
          <h3>📐 Vértices (20m × 50m = 0.1 ha)</h3>
          <div className="vertices-grid">
            {vertices.map((v, i) => (
              <div key={i} className="vertice-item">
                <span className="vertice-label">V{i + 1}:</span>
                <span className="vertice-coords">{formatearCoordenadas(v.lat, v.lng)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="datos-formulario">
          <h3>✏️ Información de la Parcela</h3>

          <div className="form-group">
            <label htmlFor="codigo">
              Código <span className="required">*</span>
            </label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: P-001, ZONA1-A, etc."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre (opcional)</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre descriptivo de la parcela"
            />
          </div>

          <div className="form-group">
            <label htmlFor="observaciones">Observaciones (opcional)</label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas adicionales sobre la parcela..."
              rows="3"
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
      </div>

      <div className="confirmacion-footer">
        <button
          className="btn-cancelar-conf"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </button>
        <button
          className="btn-volver-conf"
          onClick={onVolver}
          disabled={guardando}
        >
          ← Ajustar Posición
        </button>
        <button
          className="btn-guardar"
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : '✓ Guardar Parcela'}
        </button>
      </div>
    </div>
  )
}

export default ConfirmacionParcela
