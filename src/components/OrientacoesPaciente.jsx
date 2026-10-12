import { useEffect, useState } from 'react'
import { criarOrientacao, excluirOrientacao, formatarDataOrientacao, listarOrientacoes } from '../lib/orientacoesApi'
import { colors } from '../theme'

// Admin: orientacoes em texto livre para o paciente (aparecem pra ele na tela
// "Exercícios e orientações"). Fica acima da prescricao de exercicios.
export default function OrientacoesPaciente({ pacienteId, adminId }) {
  const [orientacoes, setOrientacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    listarOrientacoes(pacienteId)
      .then((lista) => { if (ativo) setOrientacoes(lista) })
      .catch(() => { if (ativo) setErro('Não foi possível carregar as orientações.') })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [pacienteId])

  async function handleEnviar(e) {
    e.preventDefault()
    if (!texto.trim()) return
    setErro('')
    setSalvando(true)
    try {
      const nova = await criarOrientacao({ pacienteId, autorId: adminId, texto })
      setOrientacoes((atual) => [nova, ...atual])
      setTexto('')
    } catch {
      setErro('Não foi possível salvar a orientação. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleRemover(id) {
    await excluirOrientacao(id)
    setOrientacoes((atual) => atual.filter((o) => o.id !== id))
  }

  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
      <div>
        <h3 className="font-medium" style={{ color: colors.secondary }}>Orientações</h3>
        <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
          Texto livre, para orientações que não são exercícios do catálogo. O paciente vê no app.
        </p>
      </div>

      <form onSubmit={handleEnviar} className="space-y-2">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder="Ex.: Evitar café depois das 16h. Ir ao banheiro a cada 3 horas, mesmo sem vontade."
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />
        {erro && <p className="text-sm" style={{ color: colors.danger }}>{erro}</p>}
        <button
          type="submit"
          disabled={salvando || !texto.trim()}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
          style={{ background: colors.primary }}
        >
          {salvando ? 'Enviando...' : 'Enviar orientação'}
        </button>
      </form>

      {carregando ? (
        <p className="text-sm" style={{ color: colors.textSecondary }}>Carregando...</p>
      ) : orientacoes.length > 0 && (
        <ul className="space-y-2">
          {orientacoes.map((o) => (
            <li key={o.id} className="rounded-lg p-3 text-sm" style={{ background: colors.background }}>
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-xs" style={{ color: colors.textSecondary }}>Enviada em {formatarDataOrientacao(o.criadoEm)}</span>
                <button type="button" onClick={() => handleRemover(o.id)} className="text-xs underline" style={{ color: colors.danger }}>
                  Remover
                </button>
              </div>
              <p className="whitespace-pre-wrap">{o.texto}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
