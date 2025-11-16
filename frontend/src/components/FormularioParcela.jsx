import { useState } from 'react'
import { createParcela } from '../services/api'
import '../styles/FormularioParcela.css'

function FormularioParcela({ onParcelaCreada, onClose }) {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    zona_priorizada: '',
    latitud: -4.2156,
    longitud: -69.9406,
    altitud: 96.0,
    pendiente: 5.0,
    tipo_cobertura: '',
    accesibilidad: '',
    estado: 'activa',
    responsable: '',
    fecha_establecimiento: new Date().toISOString().split('T')[0],
    generar_vertices: true,
    observaciones: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const tiposCobertura = [
    'Bosque primario',
    'Bosque secundario',
    'Rastrojo alto',
    'Rastrojo bajo',
    'Pastizal',
    'Cultivo',
    'Zona ribereña',
    'Otro'
  ]

  const opcionesAccesibilidad = [
    'Fácil',
    'Moderada',
    'Difícil',
    'Muy difícil'
  ]

  const estados = [
    'activa',
    'completada',
    'inactiva'
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validaciones
    if (!formData.codigo.trim()) {
      setError('El código de parcela es requerido')
      return
    }

    if (formData.latitud < -5 || formData.latitud > 0) {
      setError('Latitud debe estar entre -5° y 0° (Amazonas colombiano)')
      return
    }

    if (formData.longitud < -75 || formData.longitud > -66) {
      setError('Longitud debe estar entre -75° y -66° (Amazonas colombiano)')
      return
    }

    try {
      setLoading(true)
      const nuevaParcela = await createParcela(formData)
      setSuccess(true)
      setError(null)

      // Notificar al componente padre
      if (onParcelaCreada) {
        onParcelaCreada(nuevaParcela)
      }

      // Resetear formulario después de 1 segundo
      setTimeout(() => {
        setFormData({
          codigo: '',
          nombre: '',
          zona_priorizada: '',
          latitud: -4.2156,
          longitud: -69.9406,
          altitud: 96.0,
          pendiente: 5.0,
          tipo_cobertura: '',
          accesibilidad: '',
          estado: 'activa',
          responsable: '',
          fecha_establecimiento: new Date().toISOString().split('T')[0],
          generar_vertices: true,
          observaciones: ''
        })
        setSuccess(false)
        if (onClose) onClose()
      }, 2000)
    } catch (err) {
      setError(err.message || 'Error al crear la parcela')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="formulario-parcela">
      <div className="formulario-header">
        <h2>Nueva Parcela</h2>
        {onClose && (
          <button className="btn-close" onClick={onClose}>×</button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          ✅ Parcela creada exitosamente
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>
              Código de Parcela <span className="required">*</span>
            </label>
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="P001"
              required
            />
            <small>Código único de identificación</small>
          </div>

          <div className="form-group">
            <label>Nombre de la Parcela</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Parcela Experimental 1"
            />
            <small>Nombre descriptivo (opcional)</small>
          </div>

          <div className="form-group">
            <label>Zona Priorizada</label>
            <input
              type="text"
              name="zona_priorizada"
              value={formData.zona_priorizada}
              onChange={handleChange}
              placeholder="Zona A - Leticia"
            />
            <small>Zona geográfica del proyecto</small>
          </div>

          <div className="form-group">
            <label>
              Latitud (centro) <span className="required">*</span>
            </label>
            <input
              type="number"
              name="latitud"
              value={formData.latitud}
              onChange={handleNumberChange}
              step="0.000001"
              min="-5"
              max="0"
              required
            />
            <small>Grados decimales (-5° a 0°)</small>
          </div>

          <div className="form-group">
            <label>
              Longitud (centro) <span className="required">*</span>
            </label>
            <input
              type="number"
              name="longitud"
              value={formData.longitud}
              onChange={handleNumberChange}
              step="0.000001"
              min="-75"
              max="-66"
              required
            />
            <small>Grados decimales (-75° a -66°)</small>
          </div>

          <div className="form-group">
            <label>Altitud (m.s.n.m.)</label>
            <input
              type="number"
              name="altitud"
              value={formData.altitud}
              onChange={handleNumberChange}
              step="0.1"
              min="0"
              max="5000"
            />
            <small>Metros sobre el nivel del mar</small>
          </div>

          <div className="form-group">
            <label>Pendiente (%)</label>
            <input
              type="number"
              name="pendiente"
              value={formData.pendiente}
              onChange={handleNumberChange}
              step="0.1"
              min="0"
              max="100"
            />
            <small>Pendiente del terreno</small>
          </div>

          <div className="form-group">
            <label>Tipo de Cobertura Vegetal</label>
            <select
              name="tipo_cobertura"
              value={formData.tipo_cobertura}
              onChange={handleChange}
            >
              <option value="">Seleccione...</option>
              {tiposCobertura.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            <small>Tipo de vegetación predominante</small>
          </div>

          <div className="form-group">
            <label>Accesibilidad</label>
            <select
              name="accesibilidad"
              value={formData.accesibilidad}
              onChange={handleChange}
            >
              <option value="">Seleccione...</option>
              {opcionesAccesibilidad.map(opcion => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
            <small>Nivel de accesibilidad al sitio</small>
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            >
              {estados.map(estado => (
                <option key={estado} value={estado}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </option>
              ))}
            </select>
            <small>Estado actual de la parcela</small>
          </div>

          <div className="form-group">
            <label>Responsable</label>
            <input
              type="text"
              name="responsable"
              value={formData.responsable}
              onChange={handleChange}
              placeholder="Nombre del investigador"
            />
            <small>Persona responsable de la parcela</small>
          </div>

          <div className="form-group">
            <label>Fecha de Establecimiento</label>
            <input
              type="date"
              name="fecha_establecimiento"
              value={formData.fecha_establecimiento}
              onChange={handleChange}
            />
            <small>Fecha en que se estableció la parcela</small>
          </div>
        </div>

        <div className="form-group-full">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="generar_vertices"
              checked={formData.generar_vertices}
              onChange={handleChange}
            />
            <span>Generar vértices automáticamente (20m × 50m)</span>
          </label>
          <small>Genera automáticamente los 4 vértices de la parcela rectangular</small>
        </div>

        <div className="form-group-full">
          <label>Observaciones</label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Notas adicionales sobre la parcela..."
            rows="3"
          />
          <small>Cualquier observación relevante</small>
        </div>

        <div className="form-actions">
          {onClose && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creando...' : '✅ Crear Parcela'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormularioParcela
