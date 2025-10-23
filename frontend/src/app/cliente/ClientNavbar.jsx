import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ClientNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
      if (showMobileMenu && !event.target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, showMobileMenu]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setShowMobileMenu(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-transparent backdrop-blur-sm z-50 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo o título (opcional - puede estar vacío) */}
        <div className="text-xl font-bold text-gray-800">
          {/* Espacio para logo o título si lo necesitas */}
        </div>

        {/* Menú Desktop - Ambos iconos a la derecha */}
        <div className="hidden md:flex items-center gap-3">
          {/* Icono de Home */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:bg-orange-500 hover:text-white text-gray-800 p-2 rounded-lg transition"
            title="Ir al inicio"
          >
            <Home size={22} />
          </button>

          {/* Usuario + Dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:bg-orange-500 hover:text-white text-gray-800 px-4 py-2 rounded-lg transition"
            >
              <User size={20} />
              <span className="font-medium">{user?.nombre}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 text-gray-800 border border-gray-200">
                <button
                  onClick={() => {
                    navigate('/dashboard/cliente');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-orange-50 flex items-center gap-2"
                >
                  <User size={16} />
                  Mi Panel
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-orange-50 flex items-center gap-2 text-red-600"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menú Hamburguesa (Móvil) */}
        <div className="md:hidden mobile-menu-container">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-gray-800 hover:text-orange-500 p-2 transition"
          >
            {showMobileMenu ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg mobile-menu-container">
          <div className="px-4 py-3 space-y-2">
            {/* Usuario info */}
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <User size={24} className="text-orange-600" />
              <span className="font-medium text-gray-800">{user?.nombre}</span>
            </div>

            {/* Home */}
            <button
              onClick={() => {
                navigate('/');
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-orange-50 rounded-lg transition text-gray-800"
            >
              <Home size={20} />
              <span>Inicio</span>
            </button>

            {/* Mi Panel */}
            <button
              onClick={() => {
                navigate('/dashboard/cliente');
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-orange-50 rounded-lg transition text-gray-800"
            >
              <User size={20} />
              <span>Mi Panel</span>
            </button>

            {/* Cerrar Sesión */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-red-50 rounded-lg transition text-red-600"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
