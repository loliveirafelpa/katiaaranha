import { useCallback, useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { obterPacientePorId } from '../../../lib/perfisApi'
import { listarCiclosPorPaciente, criarCiclo, calcularDiaAtual, calcularStatusCiclo } from '../../../lib/ciclosDiarioApi'
import { listarEntradasPorCiclo } from '../../../lib/entradasDiarioApi'
import { listarObservacoesPorCiclo } from '../../../lib/observacoesApi'
import { listarNotasPorPaciente, criarNota, excluirNota } from '../../../lib/notasClinicasApi'
import {
  calcularResumoPorDia,
  calcularBalancoHidrico,
  calcularPerdasPorAtividade,
  calcularNocturia,
} from '../../../lib/indicadoresCalculo'
import TabelaDiariaEstiloPapel from '../../../components/TabelaDiariaEstiloPapel'
import NotaClinicaForm from '../../../components/NotaClinicaForm'
import StatusCicloBadge from '../../../components/StatusCicloBadge'
import { labelServico } from '../../../data/servicos'
import { colors } from '../../../theme'

const LABEL_UNIDADE = { campinas: 'Campinas', jundiai: 'Jundiaí' }
const LABEL_ATIVIDADE = {
  trabalho: 'Trabalho', estudos: 'Estudos', caminhada: 'Caminhada', academia: 'Academia',
  domesticas: 'Domésticas', social: 'Social', compras: 'Compras', lazer: 'Lazer',
  descanso: 'Descanso', outros: 'Outros',
}

const ABAS = [
  { id: 'diario', label: 'Diário' },
  { id: 'graficos', label: 'Gráficos' },
  { id: 'observacoes', label: 'Observações' },
  { id: 'notas', label: 'Notas clínicas' },
  { id: 'ciclos', label: 'Ciclos' },
]

function Barra({ label, valor, maximo }) {
  const percentual = maximo > 0 ? (valor / maximo) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-sm mb-1.5">
      <span className="w-24 shrink-0" style={{ color: colors.textSecondary }}>{label}</span>
      <div className="flex-1 h-3 rounded-full" style={{ background: colors.border }}>
        <div className="h-3 rounded-full" style={{ width: `${percentual}%`, background: colors.primary }} />
      </div>
      <span className="w-6 text-right text-xs" style={{ color: colors.textSecondary }}>{valor}</span>
    </div>
  )
}

export default function PacienteDetalhePage() {
  const { perfil } = useOutletContext()
  const { id } = useParams()

  const [paciente, setPaciente] = useState(null)
  const [ciclos, setCiclos] = useState([])
  const [cicloSelecionadoId, setCicloSelecionadoId] = useState(null)
  const [entradas, setEntradas] = useState([])
  const [observacoes, setObservacoes] = useState([])
  const [notas, setNotas] = useState([])
  const [aba, setAba] = useState('diario')
  const [carregando, setCarregando] = useState(true)

  const [novaDuracao, setNovaDuracao] = useState(5)
  const [novaDataInicio, setNovaDataInicio] = useState(() => new Date().toISOString().slice(0, 10))
  const [criandoCiclo, setCriandoCiclo] = useState(false)

  const carregarBase = useCallback(async () => {
    setCarregando(true)
    const [pacienteData, ciclosData, notasData] = await Promise.all([
      obterPacientePorId(id),
      listarCiclosPorPaciente(id),
      listarNotasPorPaciente(id),
    ])
    setPaciente(pacienteData)
    setCiclos(ciclosData)
    setNotas(notasData)
    setCicloSelecionadoId(ciclosData[0]?.id ?? null)
    setCarregando(false)
  }, [id])

  useEffect(() => { carregarBase() }, [carregarBase])

  useEffect(() => {
    let ativo = true
    async function carregarCiclo() {
      if (!cicloSelecionadoId) {
        setEntradas([])
        setObservacoes([])
        return
      }
      const [entradasData, observacoesData] = await Promise.all([
        listarEntradasPorCiclo(cicloSelecionadoId),
        listarObservacoesPorCiclo(cicloSelecionadoId),
      ])
      if (ativo) {
        setEntradas(entradasData)
        setObservacoes(observacoesData)
      }
    }
    carregarCiclo()
    return () => { ativo = false }
  }, [cicloSelecionadoId])

  async function handleCriarCiclo(e) {
    e.preventDefault()
    setCriandoCiclo(true)
    try {
      await criarCiclo({
        pacienteId: id,
        duracaoDias: Number(novaDuracao),
        dataInicio: novaDataInicio,
        criadoPor: perfil.id,
      })
      await carregarBase()
    } finally {
      setCriandoCiclo(false)
    }
  }

  async function handleAdicionarNota(texto) {
    const cicloAtivo = ciclos.find((c) => c.id === cicloSelecionadoId)
    const nota = await criarNota({
      pacienteId: id,
      cicloId: cicloAtivo?.id,
      diaNumero: cicloAtivo ? calcularDiaAtual(cicloAtivo) : null,
      autorId: perfil.id,
      texto,
    })
    setNotas((atual) => [nota, ...atual])
  }

  async function handleExcluirNota(notaId) {
    await excluirNota(notaId)
    setNotas((atual) => atual.filter((n) => n.id !== notaId))
  }

  if (carregando || !paciente) {
    return <p style={{ color: colors.textSecondary }}>Carregando...</p>
  }

  const cicloSelecionado = ciclos.find((c) => c.id === cicloSelecionadoId) || null
  const status = calcularStatusCiclo(cicloSelecionado)
  const diaAtual = cicloSelecionado ? calcularDiaAtual(cicloSelecionado) : null

  const resumoPorDia = calcularResumoPorDia(entradas)
  const balanco = calcularBalancoHidrico(entradas)
  const perdasPorAtividade = calcularPerdasPorAtividade(entradas)
  const nocturia = calcularNocturia(entradas)
  const maxPerdas = Math.max(1, ...Object.values(perdasPorAtividade))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: colors.secondary }}>{paciente.nomeCompleto}</h1>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            {paciente.unidade ? LABEL_UNIDADE[paciente.unidade] : 'Sem unidade'}
            {labelServico(paciente) ? ` · ${labelServico(paciente)}` : ''}
            {paciente.contato ? ` · ${paciente.contato}` : ''}
          </p>
        </div>
        {cicloSelecionado && <StatusCicloBadge status={status} diaAtual={diaAtual} duracaoDias={cicloSelecionado.duracaoDias} />}
      </div>

      {ciclos.length > 1 && (
        <select
          value={cicloSelecionadoId || ''}
          onChange={(e) => setCicloSelecionadoId(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        >
          {ciclos.map((c) => (
            <option key={c.id} value={c.id}>
              Ciclo iniciado em {new Date(`${c.dataInicio}T00:00:00`).toLocaleDateString('pt-BR')} ({c.duracaoDias} dias)
            </option>
          ))}
        </select>
      )}

      <div className="flex gap-2 border-b overflow-x-auto" style={{ borderColor: colors.border }}>
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className="px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2"
            style={{
              borderColor: aba === a.id ? colors.primary : 'transparent',
              color: aba === a.id ? colors.primary : colors.textSecondary,
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {!cicloSelecionado && aba !== 'ciclos' && aba !== 'notas' ? (
        <p style={{ color: colors.textSecondary }}>Nenhum ciclo de diário criado ainda para este paciente.</p>
      ) : (
        <>
          {aba === 'diario' && (
            <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
              <TabelaDiariaEstiloPapel entradas={entradas} />
            </div>
          )}

          {aba === 'graficos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl p-4 text-center" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                  <p className="text-2xl font-semibold" style={{ color: colors.secondary }}>{nocturia.total}</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Idas noturnas (noctúria)</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                  <p className="text-2xl font-semibold" style={{ color: colors.secondary }}>{entradas.length}</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Registros totais</p>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                  <p className="text-2xl font-semibold" style={{ color: colors.secondary }}>
                    {entradas.filter((e) => e.tipoEvento === 'perda').length}
                  </p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>Episódios de perda</p>
                </div>
              </div>

              <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 className="font-medium mb-3" style={{ color: colors.secondary }}>Balanço hídrico por dia (ml)</h3>
                {balanco.length === 0 ? (
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Sem dados ainda.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ color: colors.textSecondary }}>
                        <th className="text-left font-normal py-1">Dia</th>
                        <th className="text-left font-normal py-1">Ingerido</th>
                        <th className="text-left font-normal py-1">Urinado</th>
                        <th className="text-left font-normal py-1">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balanco.map((b) => (
                        <tr key={b.diaNumero} className="border-t" style={{ borderColor: colors.border }}>
                          <td className="py-1">Dia {b.diaNumero}</td>
                          <td className="py-1">{b.ingeridoMl} ml</td>
                          <td className="py-1">{b.urinadoMl} ml</td>
                          <td className="py-1">{b.saldoMl} ml</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 className="font-medium mb-3" style={{ color: colors.secondary }}>Perdas por atividade</h3>
                {Object.values(perdasPorAtividade).every((v) => v === 0) ? (
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Nenhum episódio de perda registrado.</p>
                ) : (
                  Object.entries(perdasPorAtividade)
                    .filter(([, valor]) => valor > 0)
                    .map(([categoria, valor]) => (
                      <Barra key={categoria} label={LABEL_ATIVIDADE[categoria]} valor={valor} maximo={maxPerdas} />
                    ))
                )}
              </div>

              <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 className="font-medium mb-3" style={{ color: colors.secondary }}>Urgência e perda por dia</h3>
                {resumoPorDia.length === 0 ? (
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Sem dados ainda.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ color: colors.textSecondary }}>
                        <th className="text-left font-normal py-1">Dia</th>
                        <th className="text-left font-normal py-1">Urgência (P/M/I)</th>
                        <th className="text-left font-normal py-1">Perda (P/M/I)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumoPorDia.map((r) => (
                        <tr key={r.diaNumero} className="border-t" style={{ borderColor: colors.border }}>
                          <td className="py-1">Dia {r.diaNumero}</td>
                          <td className="py-1">
                            {r.contagemUrgencia.pequena}/{r.contagemUrgencia.moderada}/{r.contagemUrgencia.intensa}
                          </td>
                          <td className="py-1">
                            {r.contagemPerda.pequena}/{r.contagemPerda.moderada}/{r.contagemPerda.intensa}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {aba === 'observacoes' && (
            <div className="space-y-3">
              {observacoes.length === 0 ? (
                <p style={{ color: colors.textSecondary }}>Nenhuma observação registrada ainda.</p>
              ) : (
                observacoes.map((o) => (
                  <div key={o.id} className="rounded-xl p-4 text-sm" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                    <p className="font-medium mb-1">Dia {o.diaNumero}</p>
                    <p style={{ color: colors.textSecondary }}>
                      Absorvente: {o.absorventeUso ? `sim (${o.absorventeTipo || 'outro'}${o.absorventeQuantidade ? `, ${o.absorventeQuantidade}x` : ''})` : 'não'}
                    </p>
                    <p style={{ color: colors.textSecondary }}>
                      Menstruação: {o.menstruacao ? `sim (${o.menstruacaoInicio || '?'} a ${o.menstruacaoFim || '?'})` : 'não'}
                    </p>
                    <p style={{ color: colors.textSecondary }}>
                      Medicamentos: {o.medicamentosUso ? o.medicamentosQuais || 'sim' : 'não'}
                    </p>
                    {o.outrosSintomas && <p style={{ color: colors.textSecondary }}>Sintomas: {o.outrosSintomas}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {aba === 'notas' && (
            <div className="space-y-4">
              <NotaClinicaForm onSalvar={handleAdicionarNota} />
              <ul className="space-y-2">
                {notas.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-xl p-3 flex items-start justify-between gap-3 text-sm"
                    style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
                  >
                    <div>
                      <p>{n.texto}</p>
                      <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                        {new Date(n.criadoEm).toLocaleString('pt-BR')}
                        {n.diaNumero ? ` · Dia ${n.diaNumero}` : ''}
                      </p>
                    </div>
                    <button onClick={() => handleExcluirNota(n.id)} className="text-xs underline" style={{ color: colors.danger }}>
                      Excluir
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aba === 'ciclos' && (
            <div className="space-y-4">
              <ul className="space-y-2">
                {ciclos.map((c) => (
                  <li key={c.id} className="rounded-xl p-3 text-sm" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                    Início em {new Date(`${c.dataInicio}T00:00:00`).toLocaleDateString('pt-BR')} · {c.duracaoDias} dias
                  </li>
                ))}
              </ul>

              <form
                onSubmit={handleCriarCiclo}
                className="rounded-xl p-4 space-y-3"
                style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <h3 className="font-medium" style={{ color: colors.secondary }}>Iniciar novo ciclo</h3>
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.textSecondary }}>Duração (dias)</label>
                    <input
                      type="number"
                      min="1"
                      value={novaDuracao}
                      onChange={(e) => setNovaDuracao(e.target.value)}
                      className="px-3 py-2 rounded-lg border text-sm w-28"
                      style={{ borderColor: colors.border }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: colors.textSecondary }}>Data de início</label>
                    <input
                      type="date"
                      value={novaDataInicio}
                      onChange={(e) => setNovaDataInicio(e.target.value)}
                      className="px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: colors.border }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={criandoCiclo}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
                  style={{ background: colors.primary }}
                >
                  {criandoCiclo ? 'Criando...' : 'Criar ciclo'}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  )
}
