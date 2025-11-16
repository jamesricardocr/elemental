import { useState, useEffect } from 'react'
import {
  fetchEspecies,
  createEspecie,
  deleteEspecie
} from '../services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Leaf,
  Plus,
  Search,
  Trash2,
  X
} from 'lucide-react'
import { toast } from 'sonner'

const GestionEspecies = () => {
  const [especies, setEspecies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const [nuevaEspecie, setNuevaEspecie] = useState({
    nombre_cientifico: '',
    nombre_comun: '',
    familia: '',
    densidad_madera: ''
  })

  useEffect(() => {
    cargarEspecies()
  }, [])

  const cargarEspecies = async () => {
    try {
      setLoading(true)
      const data = await fetchEspecies()
      setEspecies(data)
      setError(null)
    } catch (err) {
      console.error('Error al cargar especies:', err)
      setError('Error al cargar las especies')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNuevaEspecie(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validarFormulario = () => {
    if (!nuevaEspecie.nombre_cientifico || !nuevaEspecie.nombre_comun) {
      toast.error('Por favor complete los campos obligatorios (nombres científico y común)')
      return false
    }

    if (nuevaEspecie.densidad_madera) {
      const densidad = parseFloat(nuevaEspecie.densidad_madera)
      if (densidad <= 0 || densidad > 2) {
        toast.error('La densidad de madera debe estar entre 0 y 2 g/cm³')
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
      const especieData = {
        nombre_cientifico: nuevaEspecie.nombre_cientifico.trim(),
        nombre_comun: nuevaEspecie.nombre_comun.trim(),
        familia: nuevaEspecie.familia.trim() || null,
        densidad_madera: nuevaEspecie.densidad_madera
          ? parseFloat(nuevaEspecie.densidad_madera)
          : null
      }

      await createEspecie(especieData)

      setNuevaEspecie({
        nombre_cientifico: '',
        nombre_comun: '',
        familia: '',
        densidad_madera: ''
      })

      setMostrarFormulario(false)
      await cargarEspecies()
      toast.success('Especie registrada exitosamente')
    } catch (err) {
      console.error('Error al crear especie:', err)
      toast.error('Error al registrar la especie: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleEliminar = async (especieId, nombreCientifico) => {
    if (!confirm(`¿Está seguro de eliminar la especie ${nombreCientifico}?`)) {
      return
    }

    try {
      await deleteEspecie(especieId)
      await cargarEspecies()
      toast.success('Especie eliminada exitosamente')
    } catch (err) {
      console.error('Error al eliminar especie:', err)
      toast.error('Error al eliminar la especie. Puede estar asociada a árboles registrados.')
    }
  }

  const especiesFiltradas = especies.filter(especie =>
    especie.nombre_cientifico.toLowerCase().includes(busqueda.toLowerCase()) ||
    especie.nombre_comun.toLowerCase().includes(busqueda.toLowerCase()) ||
    (especie.familia && especie.familia.toLowerCase().includes(busqueda.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Catálogo de Especies</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {especies.length} especies registradas
          </p>
        </div>
      </div>

      {/* Barra de búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre científico, común o familia..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className={mostrarFormulario ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary'}
        >
          {mostrarFormulario ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Especie
            </>
          )}
        </Button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nueva Especie</CardTitle>
            <CardDescription>
              Complete la información de la nueva especie forestal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre_cientifico">
                    Nombre Científico <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nombre_cientifico"
                    name="nombre_cientifico"
                    value={nuevaEspecie.nombre_cientifico}
                    onChange={handleInputChange}
                    placeholder="Ej: Swietenia macrophylla"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Formato: Género especie</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre_comun">
                    Nombre Común <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nombre_comun"
                    name="nombre_comun"
                    value={nuevaEspecie.nombre_comun}
                    onChange={handleInputChange}
                    placeholder="Ej: Caoba"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="familia">Familia</Label>
                  <Input
                    id="familia"
                    name="familia"
                    value={nuevaEspecie.familia}
                    onChange={handleInputChange}
                    placeholder="Ej: Meliaceae"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="densidad_madera">Densidad de Madera (g/cm³)</Label>
                  <Input
                    id="densidad_madera"
                    type="number"
                    step="0.01"
                    name="densidad_madera"
                    value={nuevaEspecie.densidad_madera}
                    onChange={handleInputChange}
                    placeholder="Ej: 0.65"
                    min="0"
                    max="2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Importante para cálculos de biomasa
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-primary">
                  Guardar Especie
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Lista de Especies */}
      {especiesFiltradas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground text-center">
              {busqueda ? (
                <>No se encontraron especies con el término "{busqueda}"</>
              ) : (
                <>
                  No hay especies registradas.
                  <br />
                  Haga clic en "Agregar Especie" para comenzar.
                </>
              )}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {especiesFiltradas.map(especie => (
            <Card key={especie.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg italic text-primary">
                      {especie.nombre_cientifico}
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-foreground mt-1">
                      {especie.nombre_comun}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEliminar(especie.id, especie.nombre_cientifico)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {especie.familia && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Familia:</span>
                    <Badge variant="outline">{especie.familia}</Badge>
                  </div>
                )}

                {especie.densidad_madera !== null && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Densidad:</span>
                    <Badge className="bg-primary">
                      {especie.densidad_madera.toFixed(2)} g/cm³
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default GestionEspecies
