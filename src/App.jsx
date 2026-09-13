import { Routes, Route } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F2EA] text-[#2B2A38]">
      <div className="text-center px-6">
        <h1 className="text-3xl font-semibold mb-2">Diário Miccional</h1>
        <p className="text-[#6B6878]">CPA Fisioterapia — Dra. Kátia Aranha</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
  )
}
