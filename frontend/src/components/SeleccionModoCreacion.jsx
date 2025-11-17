import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Map, Check } from 'lucide-react'

function SeleccionModoCreacion({ onModoSeleccionado, onCancelar }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Crear Nueva Parcela</CardTitle>
          <CardDescription className="text-sm sm:text-base">Selecciona el modo de creación que prefieras:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Modo Manual */}
            <Card
              className="cursor-pointer transition-all hover:border-primary hover:shadow-lg group"
              onClick={() => onModoSeleccionado('manual')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Modo Manual</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Ingresa las coordenadas y datos manualmente mediante un formulario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Coordenadas exactas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Control total de datos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Ideal para parcelas ya medidas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Modo Interactivo */}
            <Card
              className="cursor-pointer transition-all hover:border-primary hover:shadow-lg group"
              onClick={() => onModoSeleccionado('interactivo')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Map className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Modo Interactivo</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Coloca la parcela visualmente en el mapa usando puntos de referencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Selección visual</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Polígono de 0.1 ha (20m × 50m)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Posicionamiento alrededor de punto de referencia</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onCancelar}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SeleccionModoCreacion
