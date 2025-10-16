import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren autenticación
 * Si el usuario no está autenticado, redirige al login
 * Si requiere un rol específico y el usuario no lo tiene, redirige al dashboard correspondiente
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  // Mostrar un loading mientras se carga la información del usuario
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especificaron roles permitidos, verificar que el usuario tenga uno de ellos
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user?.rol)) {
      // Redirigir al dashboard correspondiente según el rol del usuario
      switch (user?.rol) {
        case 'Administrador':
          return <Navigate to="/dashboard/admin" replace />;
        case 'Operador':
          return <Navigate to="/dashboard/operador" replace />;
        case 'Cliente':
        default:
          return <Navigate to="/dashboard/cliente" replace />;
      }
    }
  }

  // Si todo está bien, renderizar el componente hijo
  return children;
}
