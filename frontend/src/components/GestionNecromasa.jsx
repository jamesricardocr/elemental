import { useState, useEffect } from 'react'
import {
  fetchNecromasaParcela,
  createNecromasa,
  deleteNecromasa
} from '../services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Leaf,
  Plus,
  Trash2,
  X,
  Weight,
  Square,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'

const GestionNecromasa = ({ subparcelaId, subparcela, parcelaId, onVolver }) => {
  const [necromasas, setNecromasas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  // Estado inicial del formulario
  const getFormularioInicial = () => ({
    // Tipo de necromasa
    tipo_necromasa: 'hojarasca',
    tamano_cuadro: '25x25cm',

    // Campos para HOJARASCA y FRAGMENTOS FINOS
    pf_total: '',
    pf_submuestra: '',
    ps_submuestra: '',

    // Campos para RAMAS MEDIANAS
    n_ramas: '',
    circunferencia: '',
    circunferencia_2: '',  // C2 para troncos caídos
    longitud: '',
    escala_descomposicion: '',
    densidad_madera: '',

    // Observaciones
    observaciones: ''
  })

  const [nuevaNecromasa, setNuevaNecromasa] = useState(getFormularioInicial())

  useEffect(() => {
    cargarNecromasa()
  }, [subparcelaId, parcelaId])

  const cargarNecromasa = async () => {
    try {
      setLoading(true)

      const endpoint = subparcelaId
        ? `/api/v1/necromasa/subparcela/${subparcelaId}`
        : `/api/v1/necromasa/parcela/${parcelaId}`

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Error al cargar necromasa')
      }

      const data = await response.json()
      setNecromasas(data)
      setError(null)
    } catch (err) {
      console.error('Error al cargar necromasa:', err)
      setError('Error al cargar la información de necromasa')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNuevaNecromasa(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTipoChange = (tipo) => {
    // Resetear formulario al cambiar tipo
    const nuevoForm = getFormularioInicial()
    nuevoForm.tipo_necromasa = tipo

    // Asignar tamaño de cuadro según tipo
    if (tipo === 'hojarasca') {
      nuevoForm.tamano_cuadro = '25x25cm'
    } else {
      nuevoForm.tamano_cuadro = '2x2m'
    }

    setNuevaNecromasa(nuevoForm)
  }

  const validarFormulario = () => {
    const tipo = nuevaNecromasa.tipo_necromasa

    // Validación para hojarasca y fragmentos finos
    if (tipo === 'hojarasca' || tipo === 'fragmentos_finos') {
      if (!nuevaNecromasa.pf_total || !nuevaNecromasa.pf_submuestra || !nuevaNecromasa.ps_submuestra) {
        toast.error('Complete PFtotal, PFsub y PSsub')
        return false
      }
    }

    // Validación para ramas medianas
    if (tipo === 'ramas_medianas') {
      if (!nuevaNecromasa.n_ramas || !nuevaNecromasa.circunferencia || !nuevaNecromasa.longitud || !nuevaNecromasa.escala_descomposicion) {
        toast.error('Complete N° ramas, circunferencia, longitud y escala de descomposición')
        return false
      }
    }

    // Validación para ramas gruesas
    if (tipo === 'ramas_gruesas') {
      if (!nuevaNecromasa.circunferencia || !nuevaNecromasa.longitud || !nuevaNecromasa.escala_descomposicion) {
        toast.error('Complete circunferencia, longitud y escala de descomposición')
        return false
      }
    }

    // Validación para troncos caídos
    if (tipo === 'troncos_caidos') {
      if (!nuevaNecromasa.circunferencia || !nuevaNecromasa.circunferencia_2 || !nuevaNecromasa.longitud || !nuevaNecromasa.escala_descomposicion) {
        toast.error('Complete C1, C2, longitud y escala de descomposición para troncos caídos')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      return
    }

    try {
      const necromasaData = {
        parcela_id: parcelaId,
        subparcela_id: subparcelaId || null,
        tipo_necromasa: nuevaNecromasa.tipo_necromasa,
        tamano_cuadro: nuevaNecromasa.tamano_cuadro,

        // Pesos
        pf_total: nuevaNecromasa.pf_total ? parseFloat(nuevaNecromasa.pf_total) : null,
        pf_submuestra: nuevaNecromasa.pf_submuestra ? parseFloat(nuevaNecromasa.pf_submuestra) : null,
        ps_submuestra: nuevaNecromasa.ps_submuestra ? parseFloat(nuevaNecromasa.ps_submuestra) : null,

        // Ramas
        n_ramas: nuevaNecromasa.n_ramas ? parseInt(nuevaNecromasa.n_ramas) : null,
        circunferencia: nuevaNecromasa.circunferencia ? parseFloat(nuevaNecromasa.circunferencia) : null,
        circunferencia_2: nuevaNecromasa.circunferencia_2 ? parseFloat(nuevaNecromasa.circunferencia_2) : null,
        longitud: nuevaNecromasa.longitud ? parseFloat(nuevaNecromasa.longitud) : null,
        escala_descomposicion: nuevaNecromasa.escala_descomposicion || null,
        densidad_madera: nuevaNecromasa.densidad_madera ? parseFloat(nuevaNecromasa.densidad_madera) : null,

        // Observaciones
        observaciones: nuevaNecromasa.observaciones || null
      }

      await createNecromasa(necromasaData)

      setNuevaNecromasa(getFormularioInicial())
      setMostrarFormulario(false)
      await cargarNecromasa()
      toast.success('Necromasa registrada exitosamente')
    } catch (err) {
      console.error('Error al crear necromasa:', err)
      toast.error('Error al registrar necromasa: ' + (err.message || 'Error desconocido'))
    }
  }

  const handleEliminar = async (necromasaId, tipo) => {
    if (!confirm(`¿Está seguro de eliminar este registro de ${tipo}?`)) {
      return
    }

    try {
      await deleteNecromasa(necromasaId)
      await cargarNecromasa()
      toast.success('Necromasa eliminada exitosamente')
    } catch (err) {
      console.error('Error al eliminar necromasa:', err)
      toast.error('Error al eliminar la necromasa')
    }
  }

  const renderFormularioPorTipo = () => {
    const tipo = nuevaNecromasa.tipo_necromasa

    // HOJARASCA
    if (tipo === 'hojarasca') {
      return (
        <>
          <Alert className="mb-4">
            <AlertDescription className="text-sm">
              <strong>HOJARASCA:</strong> hojas secas, ramas finas &lt;2cm, flores, frutos secos, restos de corteza.
              <br />
              <strong>Cuadro:</strong> 25×25 cm
              <br />
              <strong>Factor extrapolación:</strong> 16000 (para llevar a 0,1 ha)
              <br />
              <strong>Fórmulas:</strong> Fs = PSsub / PFsub → Biomasa = PFtotal × Fs → B0.1ha = Biomasa × 16000 → C = B0.1ha × 0,47
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pf_total">PFtotal (g) <span className="text-red-500">*</span></Label>
              <Input
                id="pf_total"
                name="pf_total"
                type="number"
                step="0.01"
                value={nuevaNecromasa.pf_total}
                onChange={handleInputChange}
                placeholder="Peso fresco total en gramos"
                required
              />
              <p className="text-xs text-muted-foreground">Peso de todo el cuadrante 25×25cm (gramos)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf_submuestra">PFsub (g) <span className="text-red-500">*</span></Label>
              <Input
                id="pf_submuestra"
                name="pf_submuestra"
                type="number"
                step="0.01"
                value={nuevaNecromasa.pf_submuestra}
                onChange={handleInputChange}
                placeholder="Peso fresco submuestra en gramos"
                required
              />
              <p className="text-xs text-muted-foreground">Peso fresco de submuestra (gramos)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ps_submuestra">PSsub (g) <span className="text-red-500">*</span></Label>
              <Input
                id="ps_submuestra"
                name="ps_submuestra"
                type="number"
                step="0.01"
                value={nuevaNecromasa.ps_submuestra}
                onChange={handleInputChange}
                placeholder="Peso seco submuestra en gramos"
                required
              />
              <p className="text-xs text-muted-foreground">Peso seco tras secar submuestra (gramos)</p>
            </div>
          </div>
        </>
      )
    }

    // FRAGMENTOS FINOS
    if (tipo === 'fragmentos_finos') {
      return (
        <>
          <Alert className="mb-4">
            <AlertDescription className="text-sm">
              <strong>FRAGMENTOS FINOS:</strong> 1 cm ≤ D
              <br />
              <strong>Cuadro:</strong> 2×2 m
              <br />
              <strong>Factor extrapolación:</strong> 250 (para llevar a 0,1 ha)
              <br />
              <strong>Fórmulas:</strong> Fs = PSsub / PFsub → Biomasa = PFtotal × Fs → B0.1ha = Biomasa × 250 → C = B0.1ha × 0,47
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pf_total">PFtotal (g) <span className="text-red-500">*</span></Label>
              <Input
                id="pf_total"
                name="pf_total"
                type="number"
                step="0.01"
                value={nuevaNecromasa.pf_total}
                onChange={handleInputChange}
                placeholder="Peso fresco total en gramos"
                required
              />
              <p className="text-xs text-muted-foreground">Peso de todo el cuadrante 2×2m (gramos)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf_submuestra">PFsub (g) <span className="text-red-500">*</span></Label>
              <Input
                id="pf_submuestra"
                name="pf_submuestra"
                type="number"
                step="0.01"
                value={nuevaNecromasa.pf_submuestra}
                onChange={handleInputChange}
                placeholder="Peso fresco submuestra en gramos"
                required
              />
              <p className="text-xs text-muted-foreground">Peso fresco de submuestra (gramos)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ps_submuestra">PSsub (g) <span className="text-red-500">*</span></Label>
              <Input
                id="ps_submuestra"
                name="ps_submuestra"
                type="number"
                step="0.01"
                value={nuevaNecromasa.ps_submuestra}
                onChange={handleInputChange}
                placeholder="Peso seco submuestra en gramos"
                required
              />
              <p className="text-xs text-muted-foreground">Peso seco tras secar submuestra (gramos)</p>
            </div>
          </div>
        </>
      )
    }

    // RAMAS MEDIANAS
    if (tipo === 'ramas_medianas') {
      return (
        <>
          <Alert className="mb-4">
            <AlertDescription className="text-sm">
              <strong>RAMAS MEDIANAS:</strong> 2 cm ≤ D
              <br />
              <strong>Cuadro:</strong> 2×2 m
              <br />
              <strong>Factor extrapolación:</strong> 250
              <br />
              <strong>Fórmulas:</strong> D = C/π → A = π(D/2)² → V = A × L → Biomasa = V × ρ × N° → B0.1ha = Biomasa × 250 → C = B0.1ha × 0,47
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="n_ramas">N° total de ramas <span className="text-red-500">*</span></Label>
              <Input
                id="n_ramas"
                name="n_ramas"
                type="number"
                value={nuevaNecromasa.n_ramas}
                onChange={handleInputChange}
                placeholder="Número de ramas medianas"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitud">Longitud (m) <span className="text-red-500">*</span></Label>
              <Input
                id="longitud"
                name="longitud"
                type="number"
                step="0.01"
                value={nuevaNecromasa.longitud}
                onChange={handleInputChange}
                placeholder="Longitud de la rama"
                required
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="circunferencia">Circunferencia C (cm) <span className="text-red-500">*</span></Label>
            <Input
              id="circunferencia"
              name="circunferencia"
              type="number"
              step="0.1"
              value={nuevaNecromasa.circunferencia}
              onChange={handleInputChange}
              placeholder="Ej: 31.4 cm medidos en campo"
              required
            />
            <p className="text-xs text-muted-foreground">El sistema calcula D = C/π automáticamente</p>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="escala_descomposicion">Escala de descomposición IPCC <span className="text-red-500">*</span></Label>
            <Select
              value={nuevaNecromasa.escala_descomposicion}
              onValueChange={(value) => setNuevaNecromasa(prev => ({ ...prev, escala_descomposicion: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar clase de descomposición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fresco">Clase 1 - Fresco (ρ = 0.70 g/cm³)</SelectItem>
                <SelectItem value="poco_desc">Clase 2 - Poco descompuesto (ρ = 0.525 g/cm³)</SelectItem>
                <SelectItem value="moderado">Clase 3 - Moderado (ρ = 0.375 g/cm³)</SelectItem>
                <SelectItem value="muy_desc">Clase 4 - Muy descompuesto (ρ = 0.225 g/cm³)</SelectItem>
                <SelectItem value="desint">Clase 5 - Desintegrado (ρ = 0.115 g/cm³)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              La densidad (ρ) se calcula automáticamente según la clase IPCC seleccionada.
            </p>
          </div>
        </>
      )
    }

    // RAMAS GRUESAS
    if (tipo === 'ramas_gruesas') {
      return (
        <>
          <Alert className="mb-4">
            <AlertDescription className="text-sm">
              <strong>RAMAS GRUESAS:</strong> 5 cm ≤ D &lt; 10cm
              <br />
              <strong>Cuadro:</strong> 2×2 m
              <br />
              <strong>Factor extrapolación:</strong> 250
              <br />
              <strong>Fórmulas:</strong> D = C/π → A = π(D/2)² → V = A × L → Biomasa = V × ρ → B0.1ha = Biomasa × 250 → C = B0.1ha × 0,47
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="circunferencia">Circunferencia C (cm) <span className="text-red-500">*</span></Label>
              <Input
                id="circunferencia"
                name="circunferencia"
                type="number"
                step="0.1"
                value={nuevaNecromasa.circunferencia}
                onChange={handleInputChange}
                placeholder="Ej: 31.4 cm medidos en campo"
                required
              />
              <p className="text-xs text-muted-foreground">El sistema calcula D = C/π automáticamente</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitud">Longitud (m) <span className="text-red-500">*</span></Label>
              <Input
                id="longitud"
                name="longitud"
                type="number"
                step="0.01"
                value={nuevaNecromasa.longitud}
                onChange={handleInputChange}
                placeholder="Longitud de la rama"
                required
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="escala_descomposicion">Escala de descomposición IPCC <span className="text-red-500">*</span></Label>
            <Select
              value={nuevaNecromasa.escala_descomposicion}
              onValueChange={(value) => setNuevaNecromasa(prev => ({ ...prev, escala_descomposicion: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar clase de descomposición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fresco">Clase 1 - Fresco (ρ = 0.70 g/cm³)</SelectItem>
                <SelectItem value="poco_desc">Clase 2 - Poco descompuesto (ρ = 0.525 g/cm³)</SelectItem>
                <SelectItem value="moderado">Clase 3 - Moderado (ρ = 0.375 g/cm³)</SelectItem>
                <SelectItem value="muy_desc">Clase 4 - Muy descompuesto (ρ = 0.225 g/cm³)</SelectItem>
                <SelectItem value="desint">Clase 5 - Desintegrado (ρ = 0.115 g/cm³)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              La densidad (ρ) se calcula automáticamente según la clase IPCC seleccionada.
            </p>
          </div>
        </>
      )
    }

    // TRONCOS CAÍDOS
    if (tipo === 'troncos_caidos') {
      return (
        <>
          <Alert className="mb-4">
            <AlertDescription className="text-sm">
              <strong>TRONCOS CAÍDOS:</strong> D ≥ 10cm (árboles muertos caídos)
              <br />
              <strong>Cuadro:</strong> 2×2 m
              <br />
              <strong>Factor extrapolación:</strong> 250
              <br />
              <strong>Fórmula CONO TRUNCADO:</strong> D1 = C1/π, D2 = C2/π → A1 = π(D1/2)², A2 = π(D2/2)² → V = (A1 + A2)/2 × L → Biomasa = V × ρ → B0.1ha = Biomasa × 250 → C = B0.1ha × 0,47
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="circunferencia">C1 - Primera circunferencia (cm) <span className="text-red-500">*</span></Label>
              <Input
                id="circunferencia"
                name="circunferencia"
                type="number"
                step="0.1"
                value={nuevaNecromasa.circunferencia}
                onChange={handleInputChange}
                placeholder="Circunferencia en un extremo"
                required
              />
              <p className="text-xs text-muted-foreground">D1 = C1/π</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="circunferencia_2">C2 - Segunda circunferencia (cm) <span className="text-red-500">*</span></Label>
              <Input
                id="circunferencia_2"
                name="circunferencia_2"
                type="number"
                step="0.1"
                value={nuevaNecromasa.circunferencia_2}
                onChange={handleInputChange}
                placeholder="Circunferencia en otro extremo"
                required
              />
              <p className="text-xs text-muted-foreground">D2 = C2/π</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitud">Longitud (m) <span className="text-red-500">*</span></Label>
              <Input
                id="longitud"
                name="longitud"
                type="number"
                step="0.01"
                value={nuevaNecromasa.longitud}
                onChange={handleInputChange}
                placeholder="Longitud del tronco"
                required
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="escala_descomposicion">Escala de descomposición IPCC <span className="text-red-500">*</span></Label>
            <Select
              value={nuevaNecromasa.escala_descomposicion}
              onValueChange={(value) => setNuevaNecromasa(prev => ({ ...prev, escala_descomposicion: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar clase de descomposición" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fresco">Clase 1 - Fresco (ρ = 0.70 g/cm³)</SelectItem>
                <SelectItem value="poco_desc">Clase 2 - Poco descompuesto (ρ = 0.525 g/cm³)</SelectItem>
                <SelectItem value="moderado">Clase 3 - Moderado (ρ = 0.375 g/cm³)</SelectItem>
                <SelectItem value="muy_desc">Clase 4 - Muy descompuesto (ρ = 0.225 g/cm³)</SelectItem>
                <SelectItem value="desint">Clase 5 - Desintegrado (ρ = 0.115 g/cm³)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              La densidad (ρ) se calcula automáticamente según la clase IPCC seleccionada. El volumen del tronco se calcula con la fórmula de cono truncado.
            </p>
          </div>
        </>
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Indicador de subparcela */}
      {subparcela && (
        <Card className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500 text-white">
                  <Square className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Trabajando en Subparcela: {subparcela.codigo}
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    {subparcela.nombre || 'Sin nombre'} • Tamaño: 10m × 10m (100 m²)
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-orange-500 text-orange-700">
                  Vértice {subparcela.vertice_origen}
                </Badge>
                {onVolver && (
                  <Button variant="outline" size="sm" onClick={onVolver}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Subparcelas
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Header con botón */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            Medición de Necromasa
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Registre las mediciones de biomasa muerta según el protocolo de campo
          </p>
        </div>
        <Button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          {mostrarFormulario ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Registro
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Registro de Necromasa</CardTitle>
            <CardDescription>
              Complete los campos según el tipo de necromasa y el protocolo de medición
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selector de tipo */}
              <div className="space-y-2">
                <Label>Tipo de Necromasa <span className="text-red-500">*</span></Label>
                <Select
                  value={nuevaNecromasa.tipo_necromasa}
                  onValueChange={handleTipoChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hojarasca">Hojarasca (25×25cm)</SelectItem>
                    <SelectItem value="fragmentos_finos">Fragmentos Finos 1cm≤D (2×2m)</SelectItem>
                    <SelectItem value="ramas_medianas">Ramas Medianas 2cm≤D (2×2m)</SelectItem>
                    <SelectItem value="ramas_gruesas">Ramas Gruesas 5cm≤D&lt;10cm (2×2m)</SelectItem>
                    <SelectItem value="troncos_caidos">Troncos Caídos D≥10cm (2×2m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Campos específicos por tipo */}
              {renderFormularioPorTipo()}

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Input
                  id="observaciones"
                  name="observaciones"
                  value={nuevaNecromasa.observaciones}
                  onChange={handleInputChange}
                  placeholder="Notas adicionales"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setMostrarFormulario(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de registros */}
      {necromasas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Leaf className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay registros de necromasa</p>
            <p className="text-sm text-muted-foreground">
              {subparcela
                ? `Agregue el primer registro para la subparcela ${subparcela.codigo}`
                : 'Agregue el primer registro'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Weight className="h-5 w-5" />
              Registros de Necromasa ({necromasas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cuadro</TableHead>
                    <TableHead>Biomasa Seca (kg)</TableHead>
                    <TableHead>B 0.1ha (kg)</TableHead>
                    <TableHead>Carbono (kg)</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {necromasas.map(necromasa => (
                    <TableRow key={necromasa.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {necromasa.tipo_necromasa === 'hojarasca' && 'Hojarasca'}
                          {necromasa.tipo_necromasa === 'fragmentos_finos' && 'Fragmentos Finos'}
                          {necromasa.tipo_necromasa === 'ramas_medianas' && 'Ramas Medianas'}
                          {necromasa.tipo_necromasa === 'ramas_gruesas' && 'Ramas Gruesas'}
                          {necromasa.tipo_necromasa === 'troncos_caidos' && 'Troncos Caídos'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{necromasa.tamano_cuadro}</TableCell>
                      <TableCell>{necromasa.biomasa_seca?.toFixed(3) || 'N/A'}</TableCell>
                      <TableCell>{necromasa.biomasa_01ha?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell className="font-semibold">{necromasa.carbono?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminar(necromasa.id, necromasa.tipo_necromasa)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default GestionNecromasa
