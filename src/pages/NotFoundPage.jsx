import { Link } from 'react-router-dom'
import { colors } from '../theme'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: colors.background, color: colors.text }}>
      <p className="text-lg mb-4">Página não encontrada.</p>
      <Link to="/" className="underline" style={{ color: colors.primary }}>Voltar ao início</Link>
    </div>
  )
}
