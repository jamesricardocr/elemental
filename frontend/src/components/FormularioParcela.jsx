import { useState } from 'react'
import { createParcela } from '../services/api'
import '../styles/FormularioParcela.css'

function FormularioParcela({ onParcelaCreada, onClose }) {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    zona_priorizada: '',
    // Los 4 vértices son ahora el input primario
    vertice1_lat: null,
    vertice1_lon: null,
    vertice2_lat: null,
    vertice2_lon: null,
    vertice3_lat: null,
    vertice3_lon: null,
    vertice4_lat: null,
    vertice4_lon: null,
    tipo_cobertura: '',
    accesibilidad: '',
    estado: 'activa',
    responsable: '',
    fecha_establecimiento: new Date().toISOString().split('T')[0],
    observaciones: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [centroCalculado, setCentroCalculado] = useState(null)

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

  // Función para calcular el centro geométrico de los 4 vértices
  const calcularCentro = (vertices) => {
    if (!vertices || vertices.length !== 4) return null

    const latitudes = vertices.map(v => v[0])
    const longitudes = vertices.map(v => v[1])

    const latPromedio = latitudes.reduce((a, b) => a + b, 0) / 4
    const lonPromedio = longitudes.reduce((a, b) => a + b, 0) / 4

    return { lat: latPromedio, lon: lonPromedio }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: value ? parseFloat(value) : null
    }
    setFormData(newFormData)

    // Si cambió algún vértice, recalcular el centro
    if (name.startsWith('vertice')) {
      const vertices = [
        [newFormData.vertice1_lat, newFormData.vertice1_lon],
        [newFormData.vertice2_lat, newFormData.vertice2_lon],
        [newFormData.vertice3_lat, newFormData.vertice3_lon],
        [newFormData.vertice4_lat, newFormData.vertice4_lon]
      ]

      // Solo calcular si todos los vértices tienen valores
      if (vertices.every(v => v[0] !== null && v[1] !== null)) {
        const centro = calcularCentro(vertices)
        setCentroCalculado(centro)
      } else {
        setCentroCalculado(null)
      }
    }
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

    // Validar que todos los vértices estén completos
    const vertices = [
      [formData.vertice1_lat, formData.vertice1_lon],
      [formData.vertice2_lat, formData.vertice2_lon],
      [formData.vertice3_lat, formData.vertice3_lon],
      [formData.vertice4_lat, formData.vertice4_lon]
    ]

    if (!vertices.every(v => v[0] !== null && v[1] !== null)) {
      setError('Todos los 4 vértices son requeridos (latitud y longitud)')
      return
    }

    // Validar rangos de coordenadas
    for (let i = 0; i < vertices.length; i++) {
      const [lat, lon] = vertices[i]
      if (lat < -5 || lat > 0) {
        setError(`Vértice ${i + 1}: Latitud debe estar entre -5° y 0° (Amazonas colombiano)`)
        return
      }
      if (lon < -75 || lon > -66) {
        setError(`Vértice ${i + 1}: Longitud debe estar entre -75° y -66° (Amazonas colombiano)`)
        return
      }
    }

    // Calcular centro geométrico
    const centro = calcularCentro(vertices)

    try {
      setLoading(true)

      // Enviar datos con los vértices y el centro calculado
      const parcelaData = {
        codigo: formData.codigo,
        nombre: formData.nombre || null,
        zona_priorizada: formData.zona_priorizada || null,
        latitud: centro.lat,
        longitud: centro.lon,
        vertice1_lat: formData.vertice1_lat,
        vertice1_lon: formData.vertice1_lon,
        vertice2_lat: formData.vertice2_lat,
        vertice2_lon: formData.vertice2_lon,
        vertice3_lat: formData.vertice3_lat,
        vertice3_lon: formData.vertice3_lon,
        vertice4_lat: formData.vertice4_lat,
        vertice4_lon: formData.vertice4_lon,
        tipo_cobertura: formData.tipo_cobertura || null,
        accesibilidad: formData.accesibilidad || null,
        estado: formData.estado,
        responsable: formData.responsable || null,
        fecha_establecimiento: formData.fecha_establecimiento,
        observaciones: formData.observaciones || null,
        generar_vertices: false // No generar automáticamente, usar los proporcionados
      }

      const nuevaParcela = await createParcela(parcelaData)
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
          vertice1_lat: null,
          vertice1_lon: null,
          vertice2_lat: null,
          vertice2_lon: null,
          vertice3_lat: null,
          vertice3_lon: null,
          vertice4_lat: null,
          vertice4_lon: null,
          tipo_cobertura: '',
          accesibilidad: '',
          estado: 'activa',
          responsable: '',
          fecha_establecimiento: new Date().toISOString().split('T')[0],
          observaciones: ''
        })
        setCentroCalculado(null)
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
        </div>

        {/* Sección de Vértices */}
        <div className="form-section">
          <h3>Vértices de la Parcela <span className="required">*</span></h3>
          <p className="section-description">
            Ingrese las coordenadas de los 4 vértices de la parcela. El centro geométrico se calculará automáticamente.
          </p>

          {/* Vértice 1 */}
          <div className="vertex-group">
            <h4>Vértice 1</h4>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Latitud <span className="required">*</span></label>
                <input
                  type="number"
                  name="vertice1_lat"
                  value={formData.vertice1_lat || ''}
                  onChange={handleNumberChange}
                  step="0.000001"
                  min="-5"
                  max="0"
                  placeholder="-4.215700"
                  required
                />
                <small>-5° a 0°</small>
              </div>
              <div className="form-group">
                <label>Longitud <span className="required">*</span></label>
                <input
                  type="number"
                  name="vertice1_lon"
                  value={formData.vertice1_lon || ''}
                  onChange={handleNumberChange}
                  step="0.000001"
                  min="-75"
                  max="-66"
                  placeholder="-69.940700"
                  required
                />
                <small>-75° a -66°</small>
              </div>
            </div>
          </div>

          {/* Vértice 2 */}
          <div className="vertex-group">
            <h4>Vértice 2</h4>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Latitud <span className="required">*</span></label>
                <input
                  type="number"
                  name="vertice2_lat"
                  value={formData.vertice2_lat || ''}
                  onChange={handleNumberChange}
                  step="0.000001"
                  min="-5"
                  max="0"
                  placeholder="-4.215700"
                  required
                />
                <small>-5° a 0°</small>
              </div>
              <div className="form-group">
                <label>Longitud <span className="required">*</span></label>
                <input
                  type="number"
                  name="vertice2_lon"
                  value={formData.vertice2_lon || ''}
                  onChange={handleNumberChange}
                  step="0.000001"
                  min="-75"
                  max="-66"
                  placeholder="-69.940500"
                  required
                />
                <small>-75° a -66°</small>
              </div>
            </div>
          </div>

          {/* Vértice 3 */}
          <div className="vertex-group">
            <h4>Vértice 3</h4>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Latitud <span className="required">*</span></label>
                <input
                  type="number"
                  name="vertice3_lat"
                  value={formData.vertice3_lat || ''}
                  onChange={handleNumberChange}
                  step="0.000001"
                  min="-5"
                  max="0"
                  placeholder="-4.215500"
                  required
                />
                <small>-5° a 0°</small>
              </div>
              <div className="form-group">
                <label>Longitud <span className="required">*</span></label>
                <input
                  type="number"
                  name="vertice3_lon"
                  value={formData.vertice3_lon || ''}
                  onChange={handleNumberChange}
                  step="0.000001"
                  min="-75"
                  max="-66"
                  placeholder="-69.940500"
                  required
                />
                <small>-75° a -66°</small>
              </div>
            </div>
          </div>

          {/* Vértice 4 */}
          <div className="vertex-group">
            <h4>Vértice 4</h4>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Latitud <span className="required">*</span></label>
                <input
                  type="number"
                  name="vertice4_lat"
                  value={formData.vertice4_lat || ''}
                  onChange={handleNumberChange}
                  step="0.000001"
                  min="-5"
                  max="0"
                  placeholder="-4.215500"
                  required
                />
                <small>-5° a 0°</small>
              </div>
              <div className="form-group">
                <label>Longitud <span className="required">*</span></label>
                <input
                  type="number"
                  name="vertice4_lon"
                  value={formData.vertice4_lon || ''}
                  onChange={handleNumberChange}
                  step="0.000001"
                  min="-75"
                  max="-66"
                  placeholder="-69.940700"
                  required
                />
                <small>-75° a -66°</small>
              </div>
            </div>
          </div>

          {/* Mostrar centro calculado */}
          {centroCalculado && (
            <div className="centro-calculado">
              <h4>Centro Geométrico (Calculado)</h4>
              <p>
                📍 Latitud: <strong>{centroCalculado.lat.toFixed(6)}°</strong> |
                Longitud: <strong>{centroCalculado.lon.toFixed(6)}°</strong>
              </p>
            </div>
          )}
        </div>

        {/* Información Adicional */}
        <div className="form-section">
          <h3>Información Adicional</h3>

          <div className="form-grid">
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
