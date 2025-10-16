import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Componentes de la estructura (Header, Footer)
import Header from './components/Header';
import Footer from './components/Footer';

// Componentes de las páginas (Necesitas crear estos archivos)
// 'Hero' asume que es la página principal (Home)
import CabanasPage from './Cabañas/CabañasPage.jsx'; 
import ServiciosPage from './Servicios/ServiciosPage.jsx'; 
import ActividadesPage from './Actividades/ActividadesPage.jsx'; 
import InformacionPage from './InformacionPage.jsx'; 
import Home from './Hero.jsx';
import Login from './app/auth/Login.jsx';
import Register from './app/auth/Register.jsx';

function App() {
  return (
    // 1. Envolvemos todo en BrowserRouter para habilitar el enrutamiento
    <BrowserRouter>
      <div className="min-h-screen">
        
        {/* El Header se mantiene *fuera* de Routes para que esté visible en todas las páginas */}
        <Header /> 

        {/* 2. Definimos las rutas usando Routes y Route */}
        <main> 
          <Routes>
            {/* Ruta para la página de Inicio (tu componente Hero) */}
            <Route path="/" element={<Home />} /> 
            
            {/* Rutas de navegación principal */}
            <Route path="/cabanas" element={<CabanasPage />} />
            <Route path="/servicios" element={<ServiciosPage />} />
            <Route path="/actividades" element={<ActividadesPage />} />
            
            {/* Rutas adicionales (para los íconos de la izquierda del Header) */}
            <Route path="/informacion" element={<InformacionPage />} />
            
            {/* Rutas de autenticación */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Opcional: Ruta para manejar páginas no encontradas (404) */}
            <Route path="*" element={
                <div className="pt-32 text-center text-black">
                    <h1 className="text-4xl font-bold">404</h1>
                    <p className="text-xl">Página no encontrada</p>
                </div>
            } />
          </Routes>
        </main>

        {/* El Footer también se mantiene fuera de Routes si es común a todas las páginas */}
        <Footer /> 
        
      </div>
    </BrowserRouter>
  );
}

export default App;

