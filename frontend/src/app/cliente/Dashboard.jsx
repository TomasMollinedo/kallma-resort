import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, CreditCard, MessageSquare, Save, X, Edit, ArrowLeft } from 'lucide-react';
import ClientNavbar from './ClientNavbar';
import MisReservas from './components/MisReservas';

export default function DashboardCliente() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showReservas, setShowReservas] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    dni: user?.dni || '',
    telefono: user?.telefono || '',
    email: user?.email || '',
    password: ''
  });

  const handleEditClick = () => {
    setIsEditing(true);
    setFormData({
      nombre: user?.nombre || '',
      dni: user?.dni || '',
      telefono: user?.telefono || '',
      email: user?.email || '',
      password: ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      nombre: user?.nombre || '',
      dni: user?.dni || '',
      telefono: user?.telefono || '',
      email: user?.email || '',
      password: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones según el campo
    if (name === 'dni') {
      // Solo números, máximo 8 dígitos
      const onlyNumbers = value.replace(/\D/g, '');
      if (onlyNumbers.length <= 8) {
        setFormData(prev => ({ ...prev, [name]: onlyNumbers }));
      }
    } else if (name === 'telefono') {
      // Solo números
      const onlyNumbers = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: onlyNumbers }));
    } else if (name === 'nombre') {
      // Solo letras y espacios
      const onlyLetters = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: onlyLetters }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveData = async () => {
    try {
      // Validaciones antes de guardar
      if (formData.dni && formData.dni.length !== 8) {
        alert('El DNI debe tener exactamente 8 dígitos');
        return;
      }
      
      if (!formData.nombre || formData.nombre.trim() === '') {
        alert('El nombre es obligatorio');
        return;
      }
      
      if (!formData.email || formData.email.trim() === '') {
        alert('El email es obligatorio');
        return;
      }

      const updatedUser = {
        ...user,
        nombre: formData.nombre,
        dni: formData.dni,
        telefono: formData.telefono,
        email: formData.email
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
    <div className={`min-h-screen ${showReservas ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-gradient-to-br from-orange-50 to-orange-100'}`}>
      {/* Navbar simplificado negro */}
      <ClientNavbar />

      {/* Espaciado para el navbar fijo */}
      <div className="h-16"></div>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!showReservas && (
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
                onClick={handleEditClick}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition w-full sm:w-auto"
              >
                <Edit size={18} />
                <span>Editar Datos</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">DNI</label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Tu DNI"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Tu teléfono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Tu email"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nueva Contraseña (opcional)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Dejar vacío para no cambiar"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  <X size={18} />
                  Cancelar
                </button>
                <button
                  onClick={handleSaveData}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  <Save size={18} />
                  Guardar
                </button>
              </div>
            </div>
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

        {/* Sección de Reservas o Acciones Rápidas */}
        {showReservas ? (
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
        ) : (
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
                <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-medium">
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
