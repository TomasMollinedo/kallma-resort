import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, CreditCard, MessageSquare, Save, X, Edit, ArrowLeft } from 'lucide-react';
import ClientNavbar from './ClientNavbar';
import MisReservas from './components/MisReservas';
import PagosManagement from './PagosManagement';

export default function DashboardCliente() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showReservas, setShowReservas] = useState(false);
  const [showPagos, setShowPagos] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      nombre: user?.nombre || '',
      dni: user?.dni || '',
      telefono: user?.telefono || '',
      email: user?.email || '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      // Aquí puedes enviar los datos al backend
      const updatedUser = {
        ...user,
        nombre: data.nombre,
        dni: data.dni,
        telefono: data.telefono,
        email: data.email
      };

      login(updatedUser, localStorage.getItem('token'));

      setIsEditing(false);

      alert('Datos actualizados correctamente');
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      alert('Error al actualizar los datos');
    }
  };

  return (
    <div className={`min-h-screen ${showReservas ? 'bg-gradient-to-br from-blue-50 to-blue-100' : showPagos ? 'bg-gray-50' : 'bg-gradient-to-br from-orange-50 to-orange-100'}`}>
      {/* Navbar simplificado negro */}
      <ClientNavbar />

      {/* Espaciado para el navbar fijo */}
      <div className="h-16"></div>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {showPagos ? (
          <PagosManagement onBack={() => setShowPagos(false)} />
        ) : !showReservas && (
          <>
            {/* Mensaje de Bienvenida */}
            <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 sm:p-6 rounded-r-xl shadow-md">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Bienvenido a tu Panel</h3>
              <p className="text-sm sm:text-base text-gray-700">
                Desde aquí puedes gestionar tus reservas, revisar pagos y mantener actualizada tu información.
              </p>
            </div>

            {/* Tarjeta de Datos del Usuario */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-orange-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                <User size={28} className="text-orange-600 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                  {user?.nombre}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 truncate">{user?.email}</p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition w-full sm:w-auto"
              >
                <Edit size={18} />
                <span>Editar Datos</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    {...register('nombre', {
                      required: 'El nombre es obligatorio',
                      minLength: {
                        value: 2,
                        message: 'El nombre debe tener al menos 2 caracteres',
                      },
                      pattern: {
                        value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                        message: 'El nombre solo puede contener letras y espacios',
                      },
                    })}
                    className={`w-full px-4 py-2 border rounded-md ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Tu nombre completo"
                  />
                  {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">DNI</label>
                  <input
                    type="text"
                    {...register('dni', {
                      required: 'El DNI es obligatorio',
                      pattern: {
                        value: /^\d{7,8}$/,
                        message: 'El DNI debe tener entre 7 y 8 dígitos',
                      },
                    })}
                    className={`w-full px-4 py-2 border rounded-md ${errors.dni ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Tu DNI"
                  />
                  {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.dni.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Teléfono</label>
                  <input
                    type="text"
                    {...register('telefono', {
                      required: 'El teléfono es obligatorio',
                      pattern: {
                        value: /^\+?(54)?\d{8,}$/,
                        message: 'El teléfono debe ser válido y puede incluir el prefijo +54',
                      },
                    })}
                    className={`w-full px-4 py-2 border rounded-md ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Tu teléfono"
                  />
                  {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'El correo es obligatorio',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Ingresa un correo válido',
                      },
                    })}
                    className={`w-full px-4 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Tu email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nueva Contraseña (opcional)</label>
                  <input
                    type="password"
                    {...register('password')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Dejar vacío para no cambiar"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  <X size={18} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  <Save size={18} />
                  Guardar
                </button>
              </div>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">DNI:</p>
                <p className="font-semibold">{user?.dni || 'No registrado'}</p>
              </div>
              <div>
                <p className="text-gray-600">Teléfono:</p>
                <p className="font-semibold">{user?.telefono || 'No registrado'}</p>
              </div>
            </div>
          )}
        </div>
          </>
        )}

        {/* Sección de Reservas */}
        {!showPagos && showReservas ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowReservas(false)}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
            >
              <ArrowLeft size={18} className="mr-2" />
              Volver al panel
            </button>
            <MisReservas onClose={() => setShowReservas(false)} />
          </div>
        ) : !showPagos && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mis Reservas */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Calendar size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Mis Reservas</h3>
                <p className="text-gray-600 mb-4">
                  Consulta y gestiona tus reservas
                </p>
                <button 
                  onClick={() => setShowReservas(true)}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Ver Reservas
                </button>
              </div>

              {/* Mis Pagos */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <CreditCard size={24} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Mis Pagos</h3>
                <p className="text-gray-600 mb-4">
                  Revisa tu historial de pagos
                </p>
                <button 
                  onClick={() => setShowPagos(true)}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-medium"
                >
                  Ver Pagos
                </button>
              </div>

              {/* Contacto */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={24} className="text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Contacto</h3>
                <p className="text-gray-600 mb-4">
                  Envía consultas o solicitudes
                </p>
                <button 
                  onClick={() => navigate('/contacto')}
                  className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  Contactar
                </button>
              </div>
            </div>

            {/* Acceso Rápido al Catálogo */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Explora Nuestro Resort</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/cabanas')}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Ver Cabañas
                </button>
                <button
                  onClick={() => navigate('/servicios')}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Ver Servicios
                </button>
                <button
                  onClick={() => navigate('/actividades')}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Ver Actividades
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
