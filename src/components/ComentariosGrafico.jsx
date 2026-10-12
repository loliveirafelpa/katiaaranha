import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { criarComentarioGrafico, excluirComentarioGrafico, listarComentariosGraficos } from '../lib/comentariosGraficosApi'
import { colors } from '../theme'

// Comentarios internos da Dra. Katia embaixo de cada grafico (abas Graficos e
// Comparativos). So existem no admin - o banco (RLS) nega tudo pro paciente.
// O provider carrega os comentarios do paciente uma vez; cada grafico filtra os seus.

const ComentariosContext = createContext(null)

export function ComentariosGraficosProvider({ pacienteId, autorId, children }) {
  const [comentarios, setComentarios] = useState([])

  useEffect(() => {
    let ativo = true
    listarComentariosGraficos(pacienteId)
      .then((lista) => { if (ativo) setComentarios(lista) })
      .catch(() => {})
    return () => { ativo = false }
  }, [pacienteId])

  const adicionar = useCallback(async ({ cicloId, grafico, texto }) => {
    const novo = await criarComentarioGrafico({ pacienteId, cicloId, grafico, autorId, texto })
    setComentarios((atual) => [novo, ...atual])
  }, [pacienteId, autorId])

  const excluir = useCallback(async (id) => {
    await excluirComentarioGrafico(id)
    setComentarios((atual) => atual.filter((c) => c.id !== id))
  }, [])

  return (
    <ComentariosContext.Provider value={{ comentarios, adicionar, excluir }}>
      {children}
    </ComentariosContext.Provider>
  )
}

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// cicloId: comentario de um ciclo especifico (aba Graficos); null = aba Comparativos.
export default function ComentariosGrafico({ grafico, cicloId = null }) {
  const ctx = useContext(ComentariosContext)
  const [aberto, setAberto] = useState(false)
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  if (!ctx) return null
  const doGrafico = ctx.comentarios.filter((c) => c.grafico === grafico && (c.cicloId ?? null) === (cicloId ?? null))

  async function handleSalvar(e) {
    e.preventDefault()
    if (!texto.trim()) return
    setErro('')
    setSalvando(true)
    try {
      await ctx.adicionar({ cicloId, grafico, texto })
      setTexto('')
    } catch {
      setErro('Não foi possível salvar o comentário.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="mt-4 pt-3 border-t" style={{ borderColor: colors.border }}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium"
        style={{ color: doGrafico.length > 0 ? colors.primary : colors.textSecondary }}
      >
        <MessageSquare size={14} />
        {doGrafico.length > 0 ? `Comentários (${doGrafico.length})` : 'Adicionar comentário'}
        <span style={{ color: colors.textSecondary }}>· só você vê</span>
      </button>

      {aberto && (
        <div className="mt-3 space-y-3">
          {doGrafico.length > 0 && (
            <ul className="space-y-2">
              {doGrafico.map((c) => (
                <li key={c.id} className="rounded-lg p-3 text-sm" style={{ background: colors.background }}>
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-xs" style={{ color: colors.textSecondary }}>{formatarData(c.criadoEm)}</span>
                    <button
                      type="button"
                      onClick={() => ctx.excluir(c.id)}
                      className="text-xs underline"
                      style={{ color: colors.danger }}
                    >
                      Excluir
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap">{c.texto}</p>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleSalvar} className="space-y-2">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={2}
              placeholder="Seu comentário sobre este gráfico..."
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: colors.border }}
            />
            {erro && <p className="text-xs" style={{ color: colors.danger }}>{erro}</p>}
            <button
              type="submit"
              disabled={salvando || !texto.trim()}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: colors.primary }}
            >
              {salvando ? 'Salvando...' : 'Salvar comentário'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
