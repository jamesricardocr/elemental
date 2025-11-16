import './SeleccionModoCreacion.css'

function SeleccionModoCreacion({ onModoSeleccionado, onCancelar }) {
  return (
    <div className="modal-overlay">
      <div className="modo-creacion-dialog">
        <h2>Crear Nueva Parcela</h2>
        <p>Selecciona el modo de creación:</p>

        <div className="modos-container">
          <div className="modo-card" onClick={() => onModoSeleccionado('manual')}>
            <div className="modo-icon">📝</div>
            <h3>Modo Manual</h3>
            <p>Ingresa las coordenadas y datos manualmente mediante un formulario</p>
            <ul>
              <li>Coordenadas exactas</li>
              <li>Control total de datos</li>
              <li>Ideal para parcelas ya medidas</li>
            </ul>
          </div>

          <div className="modo-card" onClick={() => onModoSeleccionado('interactivo')}>
            <div className="modo-icon">🗺️</div>
            <h3>Modo Interactivo</h3>
            <p>Coloca la parcela visualmente en el mapa usando puntos de referencia</p>
            <ul>
              <li>Selección visual</li>
              <li>Polígono de 0.1 ha (20m × 50m)</li>
              <li>Posicionamiento alrededor de punto de referencia</li>
            </ul>
          </div>
        </div>

        <button className="btn-cancelar" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default SeleccionModoCreacion
