import { MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white/30 backdrop-blur-md text-gray-800 text-sm flex justify-between items-center px-10 py-4 z-50 shadow-sm">
      <p className="font-medium">Conocé nuestras cabañas</p>

      <div className="flex items-center space-x-2">
        <span className="text-gray-700">Ushuaia, Argentina</span>
        <MapPin size={16} className="text-gray-700" />
      </div>
    </footer>
  )
}


