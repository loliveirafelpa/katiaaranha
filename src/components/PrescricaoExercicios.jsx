import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  criarPrescricoes,
  excluirPrescricao,
  hojeIso,
  listarExercicios,
  listarPrescricoesPorPaciente,
} from '../lib/exerciciosApi'
import { agruparExerciciosPorCategoria, formatarDose, formatarPeriodo, labelCategoriaExercicio } from '../data/categoriasExercicio'
import { colors } from '../theme'

function somarDias(dataIso, dias) {
  const data = new Date(`${dataIso}T00:00:00`)
  data.setDate(data.getDate() + dias)
  data.setMinutes(data.getMinutes() - data.getTimezoneOffset())
  return data.toISOString().slice(0, 10)
}

// Agrupa as prescricoes por periodo (cada "receita" da semana) e separa em
// vigentes, futuras e anteriores em relacao a hoje.
function agruparPorPeriodo(prescricoes) {
  const hoje = hojeIso()
  const grupos = new Map()
  for (const p of prescricoes) {
    const chave = `${p.dataInicio}|${p.dataFim}`
    if (!grupos.has(chave)) grupos.set(chave, { dataInicio: p.dataInicio, dataFim: p.dataFim, itens: [] })
    grupos.get(chave).itens.push(p)
  }
  const lista = [...grupos.values()].map((g) => ({
    ...g,
    situacao: g.dataFim < hoje ? 'anterior' : g.dataInicio > hoje ? 'futura' : 'vigente',
  }))
  const ordem = { vigente: 0, futura: 1, anterior: 2 }
  return lista.sort((a, b) => ordem[a.situacao] - ordem[b.situacao] || b.dataInicio.localeCompare(a.dataInicio))
}

const LABEL_SITUACAO = { vigente: 'Em andamento', futura: 'Programada', anterior: 'Encerrada' }

export default function PrescricaoExercicios({ pacienteId, adminId }) {
  const [catalogo, setCatalogo] = useState([])
  const [prescricoes, setPrescricoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [dataInicio, setDataInicio] = useState(hojeIso)
  const [dataFim, setDataFim] = useState(() => somarDias(hojeIso(), 6))
  // exercicioId -> { vezesPorSemana, series, repeticoes, observacao }
  const [selecionados, setSelecionados] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const [erroCarregar, setErroCarregar] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const [catalogoData, prescricoesData] = await Promise.all([
        listarExercicios(),
        listarPrescricoesPorPaciente(pacienteId),
      ])
      setCatalogo(catalogoData)
      setPrescricoes(prescricoesData)
      setErroCarregar(false)
    } catch {
      setErroCarregar(true)
    } finally {
      setCarregando(false)
    }
  }, [pacienteId])

  useEffect(() => { carregar() }, [carregar])

  function alternarExercicio(ex) {
    setSelecionados((atual) => {
      if (atual[ex.id]) {
        const { [ex.id]: _removido, ...resto } = atual
        return resto
      }
      return {
        ...atual,
        [ex.id]: { vezesPorSemana: 3, series: ex.seriesPadrao ?? '', repeticoes: ex.repeticoesPadrao ?? '', observacao: '' },
      }
    })
  }

  function alterarCampo(exercicioId, campo, valor) {
    setSelecionados((atual) => ({ ...atual, [exercicioId]: { ...atual[exercicioId], [campo]: valor } }))
  }

  function alterarDataInicio(valor) {
    setDataInicio(valor)
    if (valor) setDataFim(somarDias(valor, 6))
  }

  async function handlePrescrever(e) {
    e.preventDefault()
    setErro('')
    const ids = Object.keys(selecionados)
    if (ids.length === 0) {
      setErro('Selecione pelo menos um exercício.')
      return
    }
    if (!dataInicio || !dataFim || dataFim < dataInicio) {
      setErro('Confira o período: a data final precisa ser igual ou depois da inicial.')
      return
    }
    const invalido = ids.find((id) => !(Number(selecionados[id].vezesPorSemana) >= 1 && Number(selecionados[id].vezesPorSemana) <= 14))
    if (invalido) {
      setErro('A frequência precisa ser entre 1 e 14 vezes por semana.')
      return
    }

    setSalvando(true)
    try {
      await criarPrescricoes(ids.map((exercicioId) => ({
        pacienteId,
        exercicioId,
        prescritoPor: adminId,
        vezesPorSemana: Number(selecionados[exercicioId].vezesPorSemana),
        series: selecionados[exercicioId].series === '' ? null : Number(selecionados[exercicioId].series),
        repeticoes: selecionados[exercicioId].repeticoes.trim(),
        observacao: selecionados[exercicioId].observacao.trim(),
        dataInicio,
        dataFim,
      })))
      setSelecionados({})
      await carregar()
    } catch (err) {
      setErro(err.message || 'Não foi possível salvar a prescrição. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleRemover(id) {
    await excluirPrescricao(id)
    setPrescricoes((atual) => atual.filter((p) => p.id !== id))
  }

  if (carregando) {
    return <p style={{ color: colors.textSecondary }}>Carregando...</p>
  }
  if (erroCarregar) {
    return <p style={{ color: colors.danger }}>Não foi possível carregar os exercícios. Tente novamente em instantes.</p>
  }

  const grupos = agruparPorPeriodo(prescricoes)
  const campoClasse = 'px-2 py-1.5 rounded-lg border text-sm'

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: colors.secondary }}>Exercícios prescritos</h2>
        {grupos.length === 0 ? (
          <p className="text-sm" style={{ color: colors.textSecondary }}>Nenhum exercício prescrito ainda.</p>
        ) : (
          grupos.map((g) => (
            <div
              key={`${g.dataInicio}|${g.dataFim}`}
              className="rounded-2xl p-4 space-y-2"
              style={{
                background: colors.surface,
                border: `1px solid ${g.situacao === 'vigente' ? colors.primary : colors.border}`,
                opacity: g.situacao === 'anterior' ? 0.7 : 1,
              }}
            >
              <p className="text-sm font-medium" style={{ color: colors.secondary }}>
                {formatarPeriodo(g.dataInicio, g.dataFim)}
                <span className="ml-2 text-xs font-normal" style={{ color: colors.textSecondary }}>
                  {LABEL_SITUACAO[g.situacao]}
                </span>
              </p>
              <ul className="divide-y" style={{ borderColor: colors.border }}>
                {g.itens.map((p) => (
                  <li key={p.id} className="py-2 flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium">{p.exercicio?.nome}</p>
                      <p className="text-xs" style={{ color: colors.textSecondary }}>
                        {labelCategoriaExercicio(p.exercicio)} · {formatarDose(p)}
                      </p>
                      {p.observacao && <p className="text-xs mt-0.5 italic" style={{ color: colors.textSecondary }}>{p.observacao}</p>}
                    </div>
                    <button onClick={() => handleRemover(p.id)} className="text-xs underline shrink-0" style={{ color: colors.danger }}>
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <form
        onSubmit={handlePrescrever}
        className="rounded-2xl p-4 space-y-4"
        style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold" style={{ color: colors.secondary }}>Prescrever exercícios</h2>
          <Link to="/app/admin/exercicios" className="text-xs underline" style={{ color: colors.textSecondary }}>
            Gerenciar catálogo de exercícios
          </Link>
        </div>

        <div className="flex flex-wrap items-end gap-3 text-sm">
          <label className="space-y-1">
            <span className="block font-medium">De</span>
            <input type="date" value={dataInicio} onChange={(e) => alterarDataInicio(e.target.value)} className={campoClasse} style={{ borderColor: colors.border }} />
          </label>
          <label className="space-y-1">
            <span className="block font-medium">Até</span>
            <input type="date" value={dataFim} min={dataInicio} onChange={(e) => setDataFim(e.target.value)} className={campoClasse} style={{ borderColor: colors.border }} />
          </label>
        </div>

        {agruparExerciciosPorCategoria(catalogo).map((grupo) => {
          return (
            <div key={grupo.chave} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>{grupo.label}</p>
              {grupo.itens.map((ex) => {
                const sel = selecionados[ex.id]
                return (
                  <div
                    key={ex.id}
                    className="rounded-xl p-3 space-y-2"
                    style={{ border: `1px solid ${sel ? colors.primary : colors.border}` }}
                  >
                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!sel}
                        onChange={() => alternarExercicio(ex)}
                        className="w-4 h-4 mt-0.5"
                        style={{ accentColor: colors.primary }}
                      />
                      <span>
                        <span className="font-medium">{ex.nome}</span>
                        {ex.descricao && <span className="block text-xs" style={{ color: colors.textSecondary }}>{ex.descricao}</span>}
                      </span>
                    </label>
                    {sel && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pl-6">
                        <label className="space-y-1">
                          <span className="block">Vezes/semana</span>
                          <input type="number" min="1" max="14" value={sel.vezesPorSemana} onChange={(e) => alterarCampo(ex.id, 'vezesPorSemana', e.target.value)} className={`w-full ${campoClasse}`} style={{ borderColor: colors.border }} />
                        </label>
                        <label className="space-y-1">
                          <span className="block">Séries</span>
                          <input type="number" min="1" value={sel.series} onChange={(e) => alterarCampo(ex.id, 'series', e.target.value)} className={`w-full ${campoClasse}`} style={{ borderColor: colors.border }} />
                        </label>
                        <label className="space-y-1 col-span-2">
                          <span className="block">Repetições</span>
                          <input type="text" value={sel.repeticoes} onChange={(e) => alterarCampo(ex.id, 'repeticoes', e.target.value)} placeholder="ex.: 10 repetições" className={`w-full ${campoClasse}`} style={{ borderColor: colors.border }} />
                        </label>
                        <label className="space-y-1 col-span-2 sm:col-span-4">
                          <span className="block">Observação para a paciente (opcional)</span>
                          <input type="text" value={sel.observacao} onChange={(e) => alterarCampo(ex.id, 'observacao', e.target.value)} className={`w-full ${campoClasse}`} style={{ borderColor: colors.border }} />
                        </label>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}

        {erro && <p className="text-sm" style={{ color: colors.danger }}>{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="w-full py-2 rounded-lg font-medium text-white disabled:opacity-60"
          style={{ background: colors.primary }}
        >
          {salvando
            ? 'Salvando...'
            : `Prescrever ${Object.keys(selecionados).length || ''} ${Object.keys(selecionados).length === 1 ? 'exercício' : 'exercícios'}`.replace('  ', ' ')}
        </button>
      </form>
    </div>
  )
}
