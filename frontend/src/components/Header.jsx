import { Link, useNavigate } from "react-router-dom";
import { Home, Info, MessageCircle, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../app/context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isUsuarioAutenticado = isAuthenticated && user?.rol;
  const rolUsuario = user?.rol;

  const getDashboardRoute = () => {
    switch (rolUsuario) {
      case "Cliente":
        return "/dashboard/cliente";
      case "Operador":
        return "/dashboard/operador";
      case "Administrador":
        return "/dashboard/admin";
      default:
        return "/";
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navegarYCerrarMenu = (ruta) => {
    navigate(ruta);
    setMobileMenuOpen(false);
  };

  return (
    <header className="absolute top-0 left-0 w-full flex justify-between items-center px-6 md:px-10 py-6 text-white z-50 font-lexend text-md font-bold">
      {/* Logo y accesos rápidos - Solo visible en desktop */}
      <div className="hidden lg:flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="border border-white/40 p-2 rounded-full hover:bg-white/20 transition"
          >
            <Home size={18} />
          </Link>
          <Link
            to="/informacion"
            className="border border-white/40 p-2 rounded-full hover:bg-white/20 transition"
          >
            <Info size={18} />
          </Link>
          <Link
            to="/contacto"
            className="border border-white/40 p-2 rounded-full hover:bg-white/20 transition"
          >
            <MessageCircle size={18} />
          </Link>
        </div>
        <p className="text-md leading-tight font-bold">
          <span className="font-bold">¿Necesitás ayuda?</span>
          <br />
          Chateá con nosotros
        </p>
      </div>

      {/* Logo/Título para mobile */}
      <div className="lg:hidden">
        <Link to="/" className="text-xl font-bold">
          Kallma Resort
        </Link>
      </div>

      {/* Navegación Desktop */}
      <nav className="hidden lg:flex items-center space-x-8 text-md font-bold">
        <Link to="/cabanas" className="hover:text-gray-200 transition">
          Cabañas
        </Link>
        <Link to="/servicios" className="hover:text-gray-200 transition">
          Servicios
        </Link>
        <Link to="/actividades" className="hover:text-gray-200 transition">
          Actividades
        </Link>

        {isUsuarioAutenticado ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="border border-white rounded-full px-6 py-2 hover:bg-white hover:text-black transition flex items-center gap-2 text-md font-bold"
            >
              <User size={16} />
              {user.nombre}
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 text-gray-800 text-md font-bold">
                <button
                  onClick={() => {
                    navigate(getDashboardRoute());
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
            className="border border-white rounded-full px-6 py-2 hover:bg-white hover:text-black transition text-md font-bold"
          >
            Acceder
          </button>
        )}
      </nav>

      {/* Botón Hamburguesa */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden border border-white/40 p-2 rounded-full hover:bg-white/20 transition"
        aria-label="Menú"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Menú Mobile */}
      <div
        className={`fixed top-0 right-0 h-full w-80 backdrop-blur-md transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-8">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="self-end mb-8 p-2 border border-white/40 rounded-full hover:bg-white/20 transition"
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>

          <nav className="flex flex-col space-y-6 text-lg font-bold">
            {/* Nuevo botón Inicio */}
            <button
              onClick={() => navegarYCerrarMenu("/")}
              className="text-left hover:text-orange-400 transition flex items-center gap-2"
            >
              Inicio
            </button>

            <button
              onClick={() => navegarYCerrarMenu("/cabanas")}
              className="text-left hover:text-orange-400 transition"
            >
              Cabañas
            </button>
            <button
              onClick={() => navegarYCerrarMenu("/servicios")}
              className="text-left hover:text-orange-400 transition"
            >
              Servicios
            </button>
            <button
              onClick={() => navegarYCerrarMenu("/actividades")}
              className="text-left hover:text-orange-400 transition"
            >
              Actividades
            </button>
            <button
              onClick={() => navegarYCerrarMenu("/informacion")}
              className="text-left hover:text-orange-400 transition"
            >
              Información
            </button>
            <button
              onClick={() => navegarYCerrarMenu("/contacto")}
              className="text-left hover:text-orange-400 transition"
            >
              Contacto
            </button>

            <hr className="border-white/20 my-4" />

            {/* Usuario autenticado */}
            {isUsuarioAutenticado ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-2 text-orange-400">
                  <User size={20} />
                  <span>{user.nombre}</span>
                </div>
                <button
                  onClick={() => {
                    navigate(getDashboardRoute());
                    setMobileMenuOpen(false);
                  }}
                  className="border border-white rounded-full px-6 py-3 hover:bg-white hover:text-black transition text-center"
                >
                  Mi Panel
                </button>
                <button
                  onClick={handleLogout}
                  className="border border-red-500 text-red-500 rounded-full px-6 py-3 hover:bg-red-500 hover:text-white transition text-center"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="border border-white rounded-full px-6 py-3 hover:bg-white hover:text-black transition text-center"
              >
                Acceder
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Overlay oscuro */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-[-1] animate-fadeIn"
        />
      )}
    </header>
  );
}





