import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { hojeIso, listarPrescricoesPorPaciente } from '../../../lib/exerciciosApi'
import { formatarDataOrientacao, listarOrientacoes } from '../../../lib/orientacoesApi'
import { formatarDose, formatarPeriodo, labelCategoriaExercicio } from '../../../data/categoriasExercicio'
import { colors } from '../../../theme'

export default function MeusExerciciosPage() {
  const { perfil } = useOutletContext()
  const [prescricoes, setPrescricoes] = useState([])
  const [orientacoes, setOrientacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [aberto, setAberto] = useState(null)
  const [erroCarregar, setErroCarregar] = useState(false)

  useEffect(() => {
    let ativo = true
    Promise.all([listarPrescricoesPorPaciente(perfil.id), listarOrientacoes(perfil.id)])
      .then(([listaPrescricoes, listaOrientacoes]) => {
        if (!ativo) return
        setPrescricoes(listaPrescricoes)
        setOrientacoes(listaOrientacoes)
      })
      .catch(() => {
        if (ativo) setErroCarregar(true)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => { ativo = false }
  }, [perfil.id])

  if (carregando) {
    return <p style={{ color: colors.textSecondary }}>Carregando...</p>
  }
  if (erroCarregar) {
    return <p style={{ color: colors.danger }}>Não foi possível carregar seus exercícios e orientações. Tente novamente em instantes.</p>
  }

  // So o que vale hoje; prescricoes encerradas ou ainda nao iniciadas ficam de fora.
  const hoje = hojeIso()
  const vigentes = prescricoes.filter((p) => p.dataInicio <= hoje && p.dataFim >= hoje)
  const proximas = prescricoes.filter((p) => p.dataInicio > hoje)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold" style={{ color: colors.secondary }}>Exercícios e orientações</h1>
        <Link to="/app/diario" className="text-sm underline" style={{ color: colors.textSecondary }}>
          Voltar ao diário
        </Link>
      </div>

      {orientacoes.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold" style={{ color: colors.secondary }}>Orientações da Dra. Kátia</h2>
          <ul className="space-y-3">
            {orientacoes.map((o) => (
              <li key={o.id} className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>{formatarDataOrientacao(o.criadoEm)}</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: colors.text }}>{o.texto}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {orientacoes.length > 0 && vigentes.length > 0 && (
        <h2 className="font-semibold" style={{ color: colors.secondary }}>Exercícios desta semana</h2>
      )}

      {vigentes.length === 0 ? (
        orientacoes.length === 0 && (
          <div className="rounded-2xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <p style={{ color: colors.textSecondary }}>
              Você ainda não tem exercícios ou orientações. Quando a Dra. Kátia enviar, eles aparecem aqui.
            </p>
          </div>
        )
      ) : (
        <ul className="space-y-3">
          {vigentes.map((p) => (
            <li key={p.id} className="rounded-2xl p-4 space-y-2" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>
                    {labelCategoriaExercicio(p.exercicio)}
                  </p>
                  <p className="font-semibold" style={{ color: colors.secondary }}>{p.exercicio?.nome}</p>
                </div>
                <span className="text-xs shrink-0" style={{ color: colors.textSecondary }}>
                  até {formatarPeriodo(p.dataInicio, p.dataFim).split(' a ')[1]}
                </span>
              </div>
              <p className="text-sm font-medium px-3 py-2 rounded-lg" style={{ background: colors.background, color: colors.secondary }}>
                {formatarDose(p)}
              </p>
              {p.observacao && (
                <p className="text-sm" style={{ color: colors.text }}>
                  <span className="font-medium">Recado da Dra. Kátia:</span> {p.observacao}
                </p>
              )}
              {p.exercicio?.instrucoes && (
                <>
                  <button
                    onClick={() => setAberto(aberto === p.id ? null : p.id)}
                    className="text-sm underline"
                    style={{ color: colors.primary }}
                  >
                    {aberto === p.id ? 'Esconder como fazer' : 'Como fazer'}
                  </button>
                  {aberto === p.id && (
                    <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>{p.exercicio.instrucoes}</p>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {proximas.length > 0 && (
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Você também tem {proximas.length} {proximas.length === 1 ? 'exercício programado' : 'exercícios programados'} a
          partir de {new Date(`${proximas.map((p) => p.dataInicio).sort()[0]}T00:00:00`).toLocaleDateString('pt-BR')}.
        </p>
      )}
    </div>
  )
}
