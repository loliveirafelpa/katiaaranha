import { useState } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import { registrarConsentimento } from '../../lib/consentimentosApi'
import { colors } from '../../theme'

export default function ConsentimentoPage() {
  const { perfil } = useOutletContext()
  const [marcado, setMarcado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const navigate = useNavigate()

  async function handleConfirmar() {
    setSalvando(true)
    try {
      await registrarConsentimento(perfil.id)
      navigate('/app/diario', { replace: true })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto rounded-2xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
      <h1 className="text-lg font-semibold mb-3" style={{ color: colors.secondary }}>
        Consentimento para tratamento de dados de saúde
      </h1>
      <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
        Antes de começar a preencher seu diário miccional, precisamos do seu consentimento
        específico para o tratamento dos seus dados de saúde (LGPD, art. 11), separado de
        qualquer termo geral de uso.
      </p>
      <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
        Leia a{' '}
        <Link to="/privacidade" target="_blank" className="underline" style={{ color: colors.primary }}>
          política de privacidade completa
        </Link>{' '}
        antes de continuar.
      </p>

      <label className="flex items-start gap-3 mb-6 text-sm">
        <input
          type="checkbox"
          checked={marcado}
          onChange={(e) => setMarcado(e.target.checked)}
          className="mt-1"
        />
        <span>
          Li e entendi a política de privacidade, e autorizo o tratamento dos meus dados de
          saúde exclusivamente para fins de avaliação e acompanhamento fisioterapêutico pela
          Dra. Kátia Aranha.
        </span>
      </label>

      <button
        onClick={handleConfirmar}
        disabled={!marcado || salvando}
        className="w-full py-2 rounded-lg font-medium text-white disabled:opacity-50"
        style={{ background: colors.primary }}
      >
        {salvando ? 'Salvando...' : 'Confirmar e continuar'}
      </button>
    </div>
  )
}
