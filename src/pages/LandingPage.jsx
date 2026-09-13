import { Link } from 'react-router-dom'
import LogoLotus, { MandalaWatermark } from '../components/brand/LogoLotus'
import { colors, fonts } from '../theme'

export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden"
      style={{ background: colors.background, color: colors.text }}
    >
      <MandalaWatermark
        size={560}
        className="absolute pointer-events-none"
        style={{ top: '-120px', right: '-160px' }}
      />
      <MandalaWatermark
        size={420}
        className="absolute pointer-events-none"
        style={{ bottom: '-140px', left: '-140px' }}
      />

      <LogoLotus size={72} className="relative mb-4" />

      <h1 className="text-4xl font-semibold mb-3 relative" style={{ color: colors.secondary, fontFamily: fonts.display }}>
        Diário Miccional
      </h1>
      <p className="max-w-md mb-1 relative" style={{ color: colors.textSecondary }}>
        Registro digital de hábitos urinários para avaliação fisioterapêutica do assoalho pélvico.
      </p>
      <p className="text-sm mb-8 relative" style={{ color: colors.textSecondary }}>
        CPA Fisioterapia — Dra. Kátia Aranha (CREFITO 3:17176-F)
      </p>
      <Link
        to="/login"
        className="relative px-6 py-3 rounded-xl font-medium text-white"
        style={{ background: colors.primary }}
      >
        Entrar no sistema
      </Link>
    </div>
  )
}
