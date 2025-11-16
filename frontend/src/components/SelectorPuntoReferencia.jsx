import './SelectorPuntoReferencia.css'

function SelectorPuntoReferencia({
  puntosReferencia,
  puntoSeleccionado,
  onPuntoSeleccionado,
  onCancelar,
  zona
}) {
  return (
    <div className="selector-punto-panel">
      <div className="selector-header">
        <h3>Selecciona un Punto de Referencia</h3>
        <p>Zona: <strong>{zona}</strong></p>
      </div>

      <div className="puntos-list">
        {puntosReferencia.length === 0 ? (
          <div className="empty-puntos">
            <p>No hay puntos de referencia para esta zona</p>
            <small>Por favor, selecciona otra zona o cancela</small>
          </div>
        ) : (
          puntosReferencia.map((punto) => (
            <div
              key={punto.id}
              className={`punto-card ${puntoSeleccionado?.id === punto.id ? 'selected' : ''}`}
              onClick={() => onPuntoSeleccionado(punto)}
            >
              <div className="punto-header">
                <span className="punto-icon">📍</span>
                <strong>{punto.nombre || `Punto ${punto.id}`}</strong>
              </div>

              {punto.descripcion && (
                <p className="punto-descripcion">{punto.descripcion}</p>
              )}

              <div className="punto-info">
                {punto.fuente && (
                  <small className="punto-fuente">
                    Fuente: {punto.fuente}
                  </small>
                )}
                <small className="punto-coords">
                  {punto.latitud.toFixed(6)}, {punto.longitud.toFixed(6)}
                </small>
              </div>

              {puntoSeleccionado?.id === punto.id && (
                <div className="selected-indicator">
                  ✓ Seleccionado
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="selector-footer">
        <button
          className="btn-cancelar-selector"
          onClick={onCancelar}
        >
          Cancelar
        </button>
        <button
          className="btn-continuar"
          onClick={() => puntoSeleccionado && onPuntoSeleccionado(puntoSeleccionado)}
          disabled={!puntoSeleccionado}
        >
          Continuar con este punto
        </button>
      </div>

      <div className="instrucciones">
        <p>
          💡 <strong>Instrucciones:</strong> Selecciona un punto de referencia.
          La parcela se posicionará cerca de este punto y podrás moverla dentro
          de un radio de 100 metros.
        </p>
      </div>
    </div>
  )
}

export default SelectorPuntoReferencia
