import { useState } from 'react';
import { ArrowLeft, Home, Map, Calendar } from 'lucide-react';
import CabanasList from './cabanas/CabanasList';
import ZonasList from './zonas/ZonasList';
import CabanasReservadas from './cabanas/CabanasReservadas';

export default function CabanasZonasManagement({ onBack }) {
  const [activeTab, setActiveTab] = useState('cabanas'); // 'cabanas' | 'zonas' | 'reservadas'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top bar con botón volver */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition font-medium"
            >
              <ArrowLeft size={20} />
              Volver al Dashboard
            </button>
          </div>

          {/* Navbar de pestañas */}
          <div className="flex gap-1 pt-4">
            <button
              onClick={() => setActiveTab('cabanas')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition border-b-2 ${
                activeTab === 'cabanas'
                  ? 'text-orange-600 border-orange-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Home size={20} />
              Gestión de Cabañas
            </button>
            
            <button
              onClick={() => setActiveTab('zonas')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition border-b-2 ${
                activeTab === 'zonas'
                  ? 'text-orange-600 border-orange-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Map size={20} />
              Gestión de Zonas
            </button>

            <button
              onClick={() => setActiveTab('reservadas')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition border-b-2 ${
                activeTab === 'reservadas'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar size={20} />
              Cabañas Reservadas
            </button>
          </div>
        </div>
      </div>

      {/* Contenido dinámico según tab activo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'cabanas' && <CabanasList />}
        {activeTab === 'zonas' && <ZonasList />}
        {activeTab === 'reservadas' && <CabanasReservadas />}
      </div>
    </div>
  );
}
