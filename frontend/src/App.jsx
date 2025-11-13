import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Sistema interno - Contexto de autenticación
import { AuthProvider } from './app/context/AuthContext';

// Componentes públicos del catálogo
import Header from './components/Header';
import Footer from './components/Footer';
import CabanasPage from './Cabanas/CabanasPage.jsx'; 
import ServiciosPage from './Servicios/ServiciosPage.jsx'; 
import ActividadesPage from './Actividades/ActividadesPage.jsx'; 
import InformacionPage from './InformacionPage.jsx'; 
import ContactoPage from './ContactoPage.jsx';
import Home from './Hero.jsx';

// Sistema interno - Autenticación y componentes
import ProtectedRoute from './app/components/ProtectedRoute';
import Login from './app/auth/login.jsx';
import Register from './app/auth/register.jsx';

// Sistema interno - Dashboards por rol
import DashboardCliente from './app/cliente/Dashboard';
import DashboardAdministrador from './app/admin/Dashboard';
import DashboardOperador from './app/operador/Dashboard';

// Módulo de Reservas
import ReservaInicio from './Reserva/ReservaInicio';
import ReservaServicios from './Reserva/ReservaServicios';
import ReservaPago from './Reserva/ReservaPago';

// Componente para controlar cuándo mostrar Header y Footer
function Layout({ children }) {
  const location = useLocation();
  
  // Rutas donde NO se debe mostrar Header y Footer
  const hideHeaderFooterRoutes = ['/login', '/register', '/dashboard/admin', '/dashboard/operador', '/dashboard/cliente'];
  const shouldHideHeaderFooter = hideHeaderFooterRoutes.includes(location.pathname);
  const animatedPublicRoutes = ['/', '/servicios', '/actividades', '/cabanas', '/contacto', '/informacion'];
  const shouldAnimatePage = animatedPublicRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen">
      {!shouldHideHeaderFooter && <Header />}
      <main className="relative overflow-hidden">
        <div
          key={location.pathname}
          className={`page-transition-wrapper ${shouldAnimatePage ? 'page-transition' : ''}`}
        >
          {children}
        </div>
      </main>
      {!shouldHideHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} /> 
            <Route path="/cabanas" element={<CabanasPage />} />
            <Route path="/servicios" element={<ServiciosPage />} />
            <Route path="/actividades" element={<ActividadesPage />} />
            <Route path="/informacion" element={<InformacionPage />} />
            <Route path="/contacto" element={<ContactoPage />} />
            
            {/* Rutas de autenticación */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rutas de Reservas */}
            <Route path="/reserva" element={<ReservaInicio />} />
            <Route path="/reservar" element={<ReservaInicio />} />
            <Route path="/reserva/servicios" element={<ReservaServicios />} />
            <Route path="/reserva/pago" element={<ReservaPago />} />

            {/* Rutas protegidas - Dashboards por rol */}
            <Route 
              path="/dashboard/cliente" 
              element={
                <ProtectedRoute allowedRoles={['Cliente']}>
                  <DashboardCliente />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute allowedRoles={['Administrador']}>
                  <DashboardAdministrador />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/operador" 
              element={
                <ProtectedRoute allowedRoles={['Operador']}>
                  <DashboardOperador />
                </ProtectedRoute>
              } 
            />

            {/* Ruta 404 */}
            <Route path="*" element={
                <div className="pt-32 text-center text-black">
                    <h1 className="text-4xl font-bold">404</h1>
                    <p className="text-xl">Página no encontrada</p>
                </div>
            } />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

