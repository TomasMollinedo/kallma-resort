import { Home, Info, MessageCircle } from "lucide-react"  

export default function Header() {
  return (
    <header className="absolute top-0 left-0 w-full flex justify-between items-center px-10 py-6 text-white z-50 font-lexend">
      {/* Bloque izquierdo con íconos y texto */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <button className="border border-white/40 p-2 rounded-full hover:bg-white/20 transition">
            <Home size={18} />
          </button>
          <button className="border border-white/40 p-2 rounded-full hover:bg-white/20 transition">
            <Info size={18} />
          </button>
          <button className="border border-white/40 p-2 rounded-full hover:bg-white/20 transition">
            <MessageCircle size={18} />
          </button>
        </div>
        <p className="text-sm leading-tight">
          <span className="font-semibold">¿Necesitás ayuda?</span><br />
          Chateá con nosotros
        </p>
      </div>

      {/* Menú principal */}
      <nav className="flex items-center space-x-8 text-sm">
        <a href="#cabanas" className="hover:text-gray-200">Cabañas</a>
        <a href="#servicios" className="hover:text-gray-200">Servicios</a>
        <a href="#actividades" className="hover:text-gray-200">Actividades</a>
        <button className="border border-white rounded-full px-6 py-2 hover:bg-white hover:text-black transition">
          Acceder
        </button>
      </nav>
    </header>
  )
}

