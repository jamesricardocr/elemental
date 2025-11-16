import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import MapaPage from './pages/mapa/MapaPage'
import ParcelasPage from './pages/parcelas/ParcelasPage'
import EspeciesPage from './pages/especies/EspeciesPage'
import ConfiguracionPage from './pages/configuracion/ConfiguracionPage'
import { Toaster } from './components/ui/sonner'
import { ThemeProvider } from './contexts/ThemeContext'

// Import existing pages
import AnalisisSatelital from './pages/AnalisisSatelital'
import DetalleParcela from './components/DetalleParcela'

// Wrapper component for DetalleParcela route
import { useParams, useNavigate } from 'react-router-dom'

const DetalleParcelaPage = () => {
  const { codigo } = useParams()
  const navigate = useNavigate()

  return (
    <DetalleParcela
      codigo={codigo}
      onVolver={() => navigate('/parcelas')}
    />
  )
}

// Temporary placeholder components for pages not yet migrated
const PlaceholderPage = ({ title }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">{title}</h1>
    <p className="text-muted-foreground">Esta página está en construcción.</p>
  </div>
)

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta sin Layout - Solo análisis satelital usa la vista completa antigua */}
          <Route path="/analisis-satelital/:codigo" element={<AnalisisSatelital />} />

          {/* Todas las demás rutas usan el nuevo Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/mapa" element={<MapaPage />} />
                <Route path="/parcelas" element={<ParcelasPage />} />
                <Route path="/parcelas/:codigo" element={<DetalleParcelaPage />} />
                <Route path="/especies" element={<EspeciesPage />} />
                <Route path="/configuracion" element={<ConfiguracionPage />} />
                <Route path="*" element={<PlaceholderPage title="Página No Encontrada" />} />
              </Routes>
            </Layout>
          } />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
