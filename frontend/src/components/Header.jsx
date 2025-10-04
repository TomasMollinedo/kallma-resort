export default function Header() {
  return (
    <Header className="absolute top-0 left-0 w-full flex justify-between items-center p-6 text-white">
      <h2 className="text-2xl font-semibold">Kallma</h2>
      <nav className="space-x-6">
        <a href="#rooms" className="hover:text-gray-300">Habitaciones</a>
        <a href="#services" className="hover:text-gray-300">Servicios</a>
        <a href="#contact" className="hover:text-gray-300">Contacto</a>
      </nav>
    </Header>
  )
}
