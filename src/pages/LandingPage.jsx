import { Link } from 'react-router-dom'
import { colors } from '../theme'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: colors.background, color: colors.text }}>
      <h1 className="text-4xl font-semibold mb-3" style={{ color: colors.secondary, fontFamily: 'Georgia, serif' }}>
        Diário Miccional
      </h1>
      <p className="max-w-md mb-1" style={{ color: colors.textSecondary }}>
        Registro digital de hábitos urinários para avaliação fisioterapêutica do assoalho pélvico.
      </p>
      <p className="text-sm mb-8" style={{ color: colors.textSecondary }}>
        CPA Fisioterapia — Dra. Kátia Aranha (CREFITO 3:17176-F)
      </p>
      <Link
        to="/login"
        className="px-6 py-3 rounded-xl font-medium text-white"
        style={{ background: colors.primary }}
      >
        Entrar no sistema
      </Link>
    </div>
  )
}
