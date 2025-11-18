// Usar ruta relativa para que funcione con el proxy de Vite
const API_BASE_URL = '/api/v1'

export async function fetchParcelas(zona = null, estado = null) {
  try {
    let url = `${API_BASE_URL}/parcelas/?limit=1000`

    if (zona) url += `&zona=${zona}`
    if (estado) url += `&estado=${estado}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Error fetching parcelas')
    }

    const data = await response.json()
    console.log('API Response structure:', data)

    // La API retorna { total: number, parcelas: array }
    // Extraemos solo el array de parcelas
    return data.parcelas || []
  } catch (error) {
    console.error('API Error:', error)
    return []
  }
}

export async function getParcela(parcelaId) {
  try {
    const response = await fetch(`${API_BASE_URL}/parcelas/${parcelaId}`)
    if (!response.ok) {
      throw new Error('Error fetching parcela')
    }
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export async function fetchEspecies() {
  try {
    const response = await fetch(`${API_BASE_URL}/especies/?limit=1000`)
    if (!response.ok) throw new Error('Error fetching especies')
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    return []
  }
}

export async function createParcela(parcelaData) {
  try {
    const response = await fetch(`${API_BASE_URL}/parcelas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parcelaData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Error al crear parcela')
    }

    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export async function deleteParcela(parcelaId) {
  try {
    const response = await fetch(`${API_BASE_URL}/parcelas/${parcelaId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Error al eliminar parcela')
    }

    return true
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export async function getParcelaStats(parcelaId) {
  try {
    const response = await fetch(`${API_BASE_URL}/parcelas/${parcelaId}/estadisticas`)
    if (!response.ok) throw new Error('Error fetching stats')
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    return null
  }
}

export async function getResumenGeneral() {
  try {
    const response = await fetch(`${API_BASE_URL}/parcelas/stats/resumen`)
    if (!response.ok) throw new Error('Error fetching resumen')
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    return null
  }
}

export async function getZonasReferencia() {
  try {
    const response = await fetch(`${API_BASE_URL}/puntos-referencia/zonas`)
    if (!response.ok) throw new Error('Error fetching zonas')
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    return []
  }
}

export async function getPuntosReferencia(zona = null) {
  try {
    let url = `${API_BASE_URL}/puntos-referencia/`
    if (zona) url += `?zona=${encodeURIComponent(zona)}`

    const response = await fetch(url)
    if (!response.ok) throw new Error('Error fetching puntos')
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    return []
  }
}

export async function createPuntoReferencia(puntoData) {
  const response = await fetch(`${API_BASE_URL}/puntos-referencia/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(puntoData)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Error creating punto de referencia')
  }

  return await response.json()
}

export async function deletePuntoReferencia(puntoId) {
  const response = await fetch(`${API_BASE_URL}/puntos-referencia/${puntoId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Error deleting punto de referencia')
  }

  return await response.json()
}

// ============= ESPECIES =============
export async function createEspecie(especieData) {
  const response = await fetch(`${API_BASE_URL}/especies/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(especieData)
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Error al crear especie')
  }
  return await response.json()
}

export async function deleteEspecie(especieId) {
  const response = await fetch(`${API_BASE_URL}/especies/${especieId}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Error al eliminar especie')
  return true
}

// ============= ÁRBOLES =============
export async function fetchArbolesParcela(parcelaId) {
  const response = await fetch(`${API_BASE_URL}/arboles/parcela/${parcelaId}`)
  if (!response.ok) throw new Error('Error fetching arboles')
  return await response.json()
}

export async function createArbol(arbolData) {
  const response = await fetch(`${API_BASE_URL}/arboles/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arbolData)
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Error al crear árbol')
  }
  return await response.json()
}

export async function deleteArbol(arbolId) {
  const response = await fetch(`${API_BASE_URL}/arboles/${arbolId}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Error al eliminar árbol')
  return true
}

export async function getEstadisticasArboles(parcelaId) {
  const response = await fetch(`${API_BASE_URL}/arboles/parcela/${parcelaId}/estadisticas`)
  if (!response.ok) throw new Error('Error fetching estadisticas')
  return await response.json()
}

// ============= NECROMASA =============
export async function fetchNecromasaParcela(parcelaId) {
  const response = await fetch(`${API_BASE_URL}/necromasa/parcela/${parcelaId}`)
  if (!response.ok) throw new Error('Error fetching necromasa')
  return await response.json()
}

export async function createNecromasa(necromasaData) {
  const response = await fetch(`${API_BASE_URL}/necromasa/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(necromasaData)
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Error al crear necromasa')
  }
  return await response.json()
}

export async function deleteNecromasa(necromasaId) {
  const response = await fetch(`${API_BASE_URL}/necromasa/${necromasaId}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Error al eliminar necromasa')
  return true
}

// ============= HERBÁCEAS =============
export async function fetchHerbaceasParcela(parcelaId) {
  const response = await fetch(`${API_BASE_URL}/herbaceas/parcela/${parcelaId}`)
  if (!response.ok) throw new Error('Error fetching herbaceas')
  return await response.json()
}

export async function createHerbaceas(herbaceasData) {
  const response = await fetch(`${API_BASE_URL}/herbaceas/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(herbaceasData)
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Error al crear herbáceas')
  }
  return await response.json()
}

export async function deleteHerbaceas(herbaceasId) {
  const response = await fetch(`${API_BASE_URL}/herbaceas/${herbaceasId}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Error al eliminar herbáceas')
  return true
}

// ============= CÁLCULOS =============
export async function ejecutarCalculoBiomasa(parcelaId, modeloAlometrico = 'Chave2014', factorCarbono = 0.47) {
  const response = await fetch(`${API_BASE_URL}/calculos/ejecutar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parcela_id: parcelaId,
      modelo_alometrico: modeloAlometrico,
      factor_carbono: factorCarbono
    })
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Error al ejecutar cálculo')
  }
  return await response.json()
}

export async function getCalculosParcela(parcelaId) {
  const response = await fetch(`${API_BASE_URL}/calculos/parcela/${parcelaId}`)
  if (!response.ok) throw new Error('Error fetching calculos')
  return await response.json()
}

// ============= CÁLCULOS SATELITALES =============
export async function crearCalculoSatelital(parcelaId, fechaInicio, fechaFin, modeloEstimacion = 'NDVI_Foody2003', factorCarbono = 0.47) {
  const response = await fetch(`${API_BASE_URL}/calculos-satelitales/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parcela_id: parcelaId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      modelo_estimacion: modeloEstimacion,
      factor_carbono: factorCarbono
    })
  })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Error al crear cálculo satelital')
  }
  return await response.json()
}

export async function getCalculoSatelital(calculoId) {
  const response = await fetch(`${API_BASE_URL}/calculos-satelitales/${calculoId}`)
  if (!response.ok) throw new Error('Error fetching cálculo satelital')
  return await response.json()
}

export async function getEstadoCalculoSatelital(calculoId) {
  const response = await fetch(`${API_BASE_URL}/calculos-satelitales/${calculoId}/estado`)
  if (!response.ok) throw new Error('Error fetching estado')
  return await response.json()
}

export async function getCalculosSatelitalesParcela(parcelaId) {
  const response = await fetch(`${API_BASE_URL}/calculos-satelitales/parcela/${parcelaId}`)
  if (!response.ok) throw new Error('Error fetching cálculos satelitales')
  return await response.json()
}

export async function getUltimoCalculoSatelital(parcelaId) {
  const response = await fetch(`${API_BASE_URL}/calculos-satelitales/parcela/${parcelaId}/ultimo`)
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error('Error fetching último cálculo satelital')
  }
  return await response.json()
}

export async function deleteCalculoSatelital(calculoId) {
  const response = await fetch(`${API_BASE_URL}/calculos-satelitales/${calculoId}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Error al eliminar cálculo satelital')
  return true
}

export async function getSerieTemporalSatelital(calculoId) {
  const response = await fetch(`${API_BASE_URL}/calculos-satelitales/${calculoId}/serie-temporal`)
  if (!response.ok) throw new Error('Error obteniendo serie temporal')
  return await response.json()
}

export async function subirCSVNasa(calculoId, file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/calculos-satelitales/${calculoId}/subir-csv`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Error subiendo CSV')
  }

  return await response.json()
}

export async function crearAnalisisDesdeCSV(parcelaId, file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/calculos-satelitales/parcela/${parcelaId}/desde-csv`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Error al crear análisis desde CSV')
  }

  return await response.json()
}
