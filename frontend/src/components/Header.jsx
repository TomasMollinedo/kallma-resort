import { Link, useNavigate } from "react-router-dom"; 
import { Home, Info, MessageCircle, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../app/context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // Solo mostrar el menú de usuario si es un cliente autenticado
  const isCliente = isAuthenticated && user?.rol === 'Cliente';

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <header className="absolute top-0 left-0 w-full flex justify-between items-center px-10 py-6 text-white z-50 font-lexend">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <Link to="/" className="border border-white/40 p-2 rounded-full hover:bg-white/20 transition">
            <Home size={18} />
          </Link>
          <Link to="/informacion" className="border border-white/40 p-2 rounded-full hover:bg-white/20 transition">
            <Info size={18} />
          </Link>
          <button className="border border-white/40 p-2 rounded-full hover:bg-white/20 transition">
            <MessageCircle size={18} />
          </button>
        </div>
        <p className="text-sm leading-tight">
          <span className="font-semibold">¿Necesitás ayuda?</span><br />
          Chateá con nosotros
        </p>
      </div>

      <nav className="flex items-center space-x-8 text-sm">
        <Link to="/cabanas" className="hover:text-gray-200">Cabañas</Link>
        <Link to="/servicios" className="hover:text-gray-200">Servicios</Link>
        <Link to="/actividades" className="hover:text-gray-200">Actividades</Link>

        {isCliente ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="border border-white rounded-full px-6 py-2 hover:bg-white hover:text-black transition flex items-center gap-2"
            >
              <User size={16} />
              {user.nombre}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 text-gray-800">
                <button
                  onClick={() => {
                    navigate('/dashboard/cliente');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                >
                  <User size={16} />
                  Mi Panel
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="border border-white rounded-full px-6 py-2 hover:bg-white hover:text-black transition"
          >
            Acceder
          </button>
        )}
      </nav>
    </header>
  );
}



