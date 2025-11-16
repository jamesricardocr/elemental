import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Home,
  Map,
  Layers,
  Satellite,
  History,
  Leaf,
  Settings
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Mapa', href: '/mapa', icon: Map },
  { name: 'Parcelas', href: '/parcelas', icon: Layers },
  { name: 'Análisis Satelital', href: '/analisis-satelital', icon: Satellite },
  { name: 'Historial Satelital', href: '/historial-satelital', icon: History },
  { name: 'Especies', href: '/especies', icon: Leaf },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <img
              src="/JC2R_LOGO.svg"
              alt="JC2R Logo"
              className="h-10 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">
                Elemental
              </span>
              <span className="text-xs text-muted-foreground">
                by JC2R
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        {children}
      </main>
    </div>
  )
}
