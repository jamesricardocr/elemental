import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun, Settings, Palette, Monitor } from 'lucide-react'

function ConfiguracionPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Personaliza la apariencia de la aplicación</p>
        </div>
      </div>

      {/* Sección de Apariencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Apariencia
          </CardTitle>
          <CardDescription>
            Personaliza el tema visual de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de Tema */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Tema de Color</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tema Oscuro */}
              <Card
                className={`cursor-pointer transition-all hover:border-primary ${
                  theme === 'dark' ? 'border-primary bg-primary/5 shadow-md' : ''
                }`}
                onClick={() => setTheme('dark')}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/90 flex items-center justify-center">
                        <Moon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">Oscuro</p>
                        <p className="text-xs text-muted-foreground">Tema predeterminado</p>
                      </div>
                    </div>
                    {theme === 'dark' && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="h-16 rounded-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center">
                    <div className="space-y-2 w-full px-4">
                      <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-600 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tema Claro */}
              <Card
                className={`cursor-pointer transition-all hover:border-primary ${
                  theme === 'light' ? 'border-primary bg-primary/5 shadow-md' : ''
                }`}
                onClick={() => setTheme('light')}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Sun className="h-6 w-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-semibold">Claro</p>
                        <p className="text-xs text-muted-foreground">Ideal para día</p>
                      </div>
                    </div>
                    {theme === 'light' && (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="h-16 rounded-md bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-300 flex items-center justify-center">
                    <div className="space-y-2 w-full px-4">
                      <div className="h-2 bg-slate-300 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tema Sistema (futuro) */}
              <Card
                className="opacity-50 cursor-not-allowed"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-900 to-slate-100 flex items-center justify-center">
                        <Monitor className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Sistema</p>
                        <p className="text-xs text-muted-foreground">Próximamente</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-16 rounded-md bg-gradient-to-r from-slate-900 to-slate-100 border border-slate-400 flex items-center justify-center">
                    <div className="text-xs text-slate-500 font-semibold">Próximamente</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Toggle rápido */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label className="text-base">Modo Oscuro</Label>
              <p className="text-sm text-muted-foreground">
                Activa o desactiva el modo oscuro rápidamente
              </p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Información */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versión:</span>
            <span className="font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tema Actual:</span>
            <span className="font-mono capitalize">{theme}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Proyecto:</span>
            <span className="font-semibold">PAP_2025_36_18</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ConfiguracionPage
