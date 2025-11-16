import { useState, useEffect } from 'react'
import SelectorPuntoReferencia from './SelectorPuntoReferencia'
import ConfirmacionParcela from './ConfirmacionParcela'
import MapViewInteractivo from './MapViewInteractivo'

function ParcelaInteractiva({
  zona,
  puntosReferencia,
  onParcelaCreada,
  onCancelar
}) {
  const [paso, setPaso] = useState(1) // 1: seleccionar punto, 2: posicionar parcela, 3: confirmar
  const [puntoReferencia, setPuntoReferencia] = useState(null)
  const [posicionParcela, setPosicionParcela] = useState(null)
  const [rotacion, setRotacion] = useState(0)

  const handlePuntoSeleccionado = (punto) => {
    console.log('Punto de referencia seleccionado:', punto)
    setPuntoReferencia(punto)
    // Inicializar posición de la parcela en el punto de referencia
    setPosicionParcela({
      lat: punto.latitud,
      lng: punto.longitud
    })
    setPaso(2)
  }

  const handlePosicionActualizada = (nuevaPosicion) => {
    setPosicionParcela(nuevaPosicion)
  }

  const handleRotacionActualizada = (nuevaRotacion) => {
    setRotacion(nuevaRotacion)
  }

  const handleConfirmar = () => {
    setPaso(3)
  }

  const handleVolver = () => {
    if (paso === 3) {
      setPaso(2)
    } else if (paso === 2) {
      setPaso(1)
      setPuntoReferencia(null)
      setPosicionParcela(null)
      setRotacion(0)
    }
  }

  return (
    <div className="w-full h-full relative">
      {paso === 1 && (
        <div className="w-full h-full relative">
          <MapViewInteractivo
            puntosReferencia={puntosReferencia}
            puntoReferencia={null}
            posicionParcela={null}
            rotacion={0}
            modo="seleccion"
          />
          <SelectorPuntoReferencia
            puntosReferencia={puntosReferencia}
            puntoSeleccionado={puntoReferencia}
            onPuntoSeleccionado={handlePuntoSeleccionado}
            onCancelar={onCancelar}
            zona={zona}
          />
        </div>
      )}

      {paso === 2 && (
        <MapViewInteractivo
          puntosReferencia={puntosReferencia}
          puntoReferencia={puntoReferencia}
          posicionParcela={posicionParcela}
          rotacion={rotacion}
          modo="posicionar"
          onPosicionActualizada={handlePosicionActualizada}
          onRotacionActualizada={handleRotacionActualizada}
          onConfirmar={handleConfirmar}
          onVolver={handleVolver}
        />
      )}

      {paso === 3 && (
        <div className="w-full h-full relative">
          <MapViewInteractivo
            puntosReferencia={puntosReferencia}
            puntoReferencia={puntoReferencia}
            posicionParcela={posicionParcela}
            rotacion={rotacion}
            modo="confirmacion"
          />
          <ConfirmacionParcela
            zona={zona}
            puntoReferencia={puntoReferencia}
            posicionParcela={posicionParcela}
            rotacion={rotacion}
            onParcelaCreada={onParcelaCreada}
            onVolver={handleVolver}
            onCancelar={onCancelar}
          />
        </div>
      )}
    </div>
  )
}

export default ParcelaInteractiva
