import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl shadow p-6 bg-white">
        <h1 className="text-2xl font-bold text-center mb-3">React + Vite + Tailwind</h1>
        <p className="text-slate-600 text-center">
          ¡Todo listo! Tailwind está funcionando 🔥
        </p>
        <div className="mt-4 flex justify-center">
          <button className="px-4 py-2 rounded-lg bg-red-500 text-white hover:opacity-90">
            Probar
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
