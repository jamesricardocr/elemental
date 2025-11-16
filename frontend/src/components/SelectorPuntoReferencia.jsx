import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Info, CheckCircle2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

function SelectorPuntoReferencia({
  puntosReferencia,
  puntoSeleccionado,
  onPuntoSeleccionado,
  onCancelar,
  zona
}) {
  return (
    <div className="absolute top-4 right-4 w-96 z-10">
      <Card className="shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Selecciona un Punto de Referencia
          </CardTitle>
          <CardDescription>
            Zona: <span className="font-semibold text-foreground">{zona}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Lista de puntos con scroll */}
          <ScrollArea className="h-[400px] pr-4">
            {puntosReferencia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="font-medium text-muted-foreground">
                  No hay puntos de referencia para esta zona
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Por favor, selecciona otra zona o cancela
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {puntosReferencia.map((punto) => (
                  <Card
                    key={punto.id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      puntoSeleccionado?.id === punto.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : ''
                    }`}
                    onClick={() => onPuntoSeleccionado(punto)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="font-semibold text-sm">
                            {punto.nombre || `Punto ${punto.id}`}
                          </span>
                        </div>
                        {puntoSeleccionado?.id === punto.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>

                      {punto.descripcion && (
                        <p className="text-sm text-muted-foreground ml-6">
                          {punto.descripcion}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 ml-6">
                        {punto.fuente && (
                          <Badge variant="secondary" className="text-xs">
                            {punto.fuente}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs font-mono">
                          {punto.latitud.toFixed(6)}, {punto.longitud.toFixed(6)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Instrucciones */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Instrucciones:</strong> Selecciona un punto de referencia.
              La parcela se posicionará cerca de este punto y podrás moverla dentro
              de un radio de 100 metros.
            </AlertDescription>
          </Alert>

          {/* Botones */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancelar} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={() => puntoSeleccionado && onPuntoSeleccionado(puntoSeleccionado)}
              disabled={!puntoSeleccionado}
              className="flex-1"
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SelectorPuntoReferencia
