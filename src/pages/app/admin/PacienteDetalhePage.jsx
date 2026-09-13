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
  calcularCorrelacaoPerdaAtividade,
  calcularNocturia,
} from '../../../lib/indicadoresCalculo'
import TabelaDiariaEstiloPapel from '../../../components/TabelaDiariaEstiloPapel'
import NotaClinicaForm from '../../../components/NotaClinicaForm'
import StatusCicloBadge from '../../../components/StatusCicloBadge'
import { labelServico } from '../../../data/servicos'
import { ATIVIDADES_PERDA } from '../../../data/atividadesPerda'
import { colors } from '../../../theme'

const LABEL_UNIDADE = { campinas: 'Campinas', jundiai: 'Jundiaí' }
const LABEL_ATIVIDADE = Object.fromEntries(ATIVIDADES_PERDA.map((a) => [a.valor, a.label]))

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
      <span className="w-36 shrink-0" style={{ color: colors.textSecondary }}>{label}</span>
      <div className="flex-1 h-3 rounded-full" style={{ background: colors.border }}>
        <div className="h-3 rounded-full" style={{ width: `${percentual}%`, background: colors.primary }} />
      </div>
      <span className="w-6 text-right text-xs" style={{ color: colors.textSecondary }}>{valor}</span>
    </div>
  )
}

function CardDestaque({ valor, label }) {
  return (
    <div
      className="rounded-xl p-4 text-center border-t-4"
      style={{ background: colors.surface, borderColor: colors.border, borderTopColor: colors.primary }}
    >
      <p className="text-3xl font-semibold" style={{ color: colors.secondary }}>{valor}</p>
      <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{label}</p>
    </div>
  )
}

const SEVERIDADE_COR = { pequena: colors.success, moderada: colors.warning, intensa: colors.danger }
const SEVERIDADE_LABEL = { pequena: 'Leve', moderada: 'Moderada', intensa: 'Intensa' }

function LegendaSeveridade() {
  return (
    <div className="flex flex-wrap gap-4 mb-3 text-xs" style={{ color: colors.textSecondary }}>
      {Object.entries(SEVERIDADE_LABEL).map(([chave, label]) => (
        <span key={chave} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: SEVERIDADE_COR[chave] }} />
          {label}
        </span>
      ))}
    </div>
  )
}

function BarraSeveridadeDia({ diaNumero, contagem, maximo }) {
  const total = contagem.pequena + contagem.moderada + contagem.intensa
  return (
    <div className="flex items-center gap-3 text-sm mb-1.5">
      <span className="w-16 shrink-0" style={{ color: colors.textSecondary }}>Dia {diaNumero}</span>
      <div className="flex-1 h-5 rounded-full overflow-hidden flex" style={{ background: colors.border }}>
        {total > 0 && ['pequena', 'moderada', 'intensa'].map((chave) => (
          contagem[chave] > 0 && (
            <div
              key={chave}
              className="h-5 flex items-center justify-center text-[10px] font-semibold text-white"
              style={{ width: `${(contagem[chave] / maximo) * 100}%`, background: SEVERIDADE_COR[chave] }}
            >
              {contagem[chave]}
            </div>
          )
        ))}
      </div>
      <span className="w-6 text-right text-xs" style={{ color: colors.textSecondary }}>{total}</span>
    </div>
  )
}

function hexParaRgba(hex, alpha) {
  const valor = hex.replace('#', '')
  const r = parseInt(valor.substring(0, 2), 16)
  const g = parseInt(valor.substring(2, 4), 16)
  const b = parseInt(valor.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function CelulaCalor({ valor, maximo, cor }) {
  const alpha = valor > 0 ? 0.15 + 0.55 * (valor / maximo) : 0
  return (
    <td className="py-1.5 px-2 text-center font-medium" style={{ background: hexParaRgba(cor, alpha), color: colors.text }}>
      {valor > 0 ? valor : '—'}
    </td>
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
  const [ordenacaoDiario, setOrdenacaoDiario] = useState('horario')
  const [carregando, setCarregando] = useState(true)

  const [novaDataInicio, setNovaDataInicio] = useState(() => new Date().toISOString().slice(0, 10))
  const [criandoCiclo, setCriandoCiclo] = useState(false)
  const [erroCiclo, setErroCiclo] = useState('')

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
    setErroCiclo('')

    // Ciclos ja vem ordenados por data_inicio desc, entao ciclos[0] e o mais recente.
    const maisRecente = ciclos[0]
    if (maisRecente && novaDataInicio <= maisRecente.dataInicio) {
      const dataFormatada = new Date(`${maisRecente.dataInicio}T00:00:00`).toLocaleDateString('pt-BR')
      setErroCiclo(`Já existe um ciclo deste paciente começando em ${dataFormatada}. O novo ciclo precisa começar depois dessa data.`)
      return
    }

    setCriandoCiclo(true)
    try {
      await criarCiclo({
        pacienteId: id,
        dataInicio: novaDataInicio,
        criadoPor: perfil.id,
      })
      await carregarBase()
    } catch (err) {
      if (err.message?.includes('ciclo_data_inicio_conflitante')) {
        setErroCiclo('Já existe um ciclo deste paciente começando nessa data ou depois dela. O novo ciclo precisa começar depois do ciclo mais recente.')
      } else {
        setErroCiclo(err.message || 'Não foi possível criar o ciclo. Tente novamente.')
      }
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
  const { contagem: perdasContagem, outros: perdasOutros } = calcularPerdasPorAtividade(entradas)
  const nocturia = calcularNocturia(entradas)
  const maxPerdas = Math.max(1, ...Object.values(perdasContagem), ...perdasOutros.map((o) => o.quantidade))
  const totalPerdasPorAtividade = Object.values(perdasContagem).reduce((a, b) => a + b, 0) + perdasOutros.reduce((a, o) => a + o.quantidade, 0)

  const totalLiquidoIngeridoMl = entradas.reduce((soma, e) => soma + (e.tipoEvento === 'liquido' ? (e.liquidoMl || 0) : 0), 0)
  const totalRegistrosUrina = entradas.filter((e) => e.tipoEvento === 'urinario').length
  const totalEpisodiosPerda = entradas.filter((e) => e.tipoEvento === 'perda').length
  const maxUrgenciaPorDia = Math.max(
    1,
    ...resumoPorDia.map((r) => r.contagemUrgencia.pequena + r.contagemUrgencia.moderada + r.contagemUrgencia.intensa)
  )

  const correlacaoPerdaAtividade = calcularCorrelacaoPerdaAtividade(entradas)
  const maxCorrelacao = Math.max(
    1,
    ...correlacaoPerdaAtividade.flatMap((l) => [l.contagem.pequena, l.contagem.moderada, l.contagem.intensa])
  )

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
        {cicloSelecionado && <StatusCicloBadge status={status} diaAtual={diaAtual} />}
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
              Ciclo iniciado em {new Date(`${c.dataInicio}T00:00:00`).toLocaleDateString('pt-BR')}
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
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm justify-end">
                <span style={{ color: colors.textSecondary }}>Ordenar por:</span>
                {[
                  { valor: 'horario', label: 'Horário' },
                  { valor: 'tipo', label: 'Tipo' },
                ].map((opcao) => (
                  <button
                    key={opcao.valor}
                    onClick={() => setOrdenacaoDiario(opcao.valor)}
                    className="px-3 py-1.5 rounded-full border font-medium"
                    style={{
                      borderColor: ordenacaoDiario === opcao.valor ? colors.primary : colors.border,
                      background: ordenacaoDiario === opcao.valor ? colors.primary : colors.surface,
                      color: ordenacaoDiario === opcao.valor ? '#fff' : colors.text,
                    }}
                  >
                    {opcao.label}
                  </button>
                ))}
              </div>
              <TabelaDiariaEstiloPapel entradas={entradas} ordenacao={ordenacaoDiario} />
            </div>
          )}

          {aba === 'graficos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <CardDestaque valor={`${totalLiquidoIngeridoMl} ml`} label="Total de líquido ingerido" />
                <CardDestaque valor={totalRegistrosUrina} label="Total de registros de urina" />
                <CardDestaque valor={totalEpisodiosPerda} label="Episódios de perda" />
              </div>
              <p className="text-xs -mt-3" style={{ color: colors.textSecondary }}>
                Noctúria: {nocturia.total} {nocturia.total === 1 ? 'ida noturna registrada' : 'idas noturnas registradas'}
              </p>

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
                <h3 className="font-medium mb-1" style={{ color: colors.secondary }}>Urgência por dia</h3>
                <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>
                  Intensidade das urgências relatadas em cada dia, por gravidade
                </p>
                {resumoPorDia.length === 0 ? (
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Sem dados ainda.</p>
                ) : (
                  <>
                    <LegendaSeveridade />
                    {resumoPorDia.map((r) => (
                      <BarraSeveridadeDia
                        key={r.diaNumero}
                        diaNumero={r.diaNumero}
                        contagem={r.contagemUrgencia}
                        maximo={maxUrgenciaPorDia}
                      />
                    ))}
                  </>
                )}
              </div>

              <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 className="font-medium mb-3" style={{ color: colors.secondary }}>Balanço de perdas por dia</h3>
                {resumoPorDia.length === 0 ? (
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Sem dados ainda.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ color: colors.textSecondary }}>
                        <th className="text-left font-normal py-1">Dia</th>
                        <th className="text-left font-normal py-1">Leve</th>
                        <th className="text-left font-normal py-1">Moderada</th>
                        <th className="text-left font-normal py-1">Intensa</th>
                        <th className="text-left font-normal py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumoPorDia.map((r) => (
                        <tr key={r.diaNumero} className="border-t" style={{ borderColor: colors.border }}>
                          <td className="py-1">Dia {r.diaNumero}</td>
                          <td className="py-1">{r.contagemPerda.pequena}</td>
                          <td className="py-1">{r.contagemPerda.moderada}</td>
                          <td className="py-1">{r.contagemPerda.intensa}</td>
                          <td className="py-1 font-medium">
                            {r.contagemPerda.pequena + r.contagemPerda.moderada + r.contagemPerda.intensa}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 className="font-medium mb-3" style={{ color: colors.secondary }}>Perdas por atividade</h3>
                {totalPerdasPorAtividade === 0 ? (
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Nenhum episódio de perda registrado.</p>
                ) : (
                  <>
                    {Object.entries(perdasContagem)
                      .filter(([, valor]) => valor > 0)
                      .map(([categoria, valor]) => (
                        <Barra key={categoria} label={LABEL_ATIVIDADE[categoria]} valor={valor} maximo={maxPerdas} />
                      ))}
                    {perdasOutros.map((o) => (
                      <Barra key={o.texto} label={o.texto} valor={o.quantidade} maximo={maxPerdas} />
                    ))}
                  </>
                )}
              </div>

              <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 className="font-medium mb-1" style={{ color: colors.secondary }}>Perda x atividade, por intensidade</h3>
                <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>
                  Cor mais forte = mais episódios naquela combinação. Ajuda a ver se uma atividade específica
                  puxa mais para perda leve, moderada ou intensa.
                </p>
                {correlacaoPerdaAtividade.length === 0 ? (
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    Nenhum episódio de perda com atividade registrada ainda.
                  </p>
                ) : (
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr style={{ color: colors.textSecondary }}>
                        <th className="text-left font-normal py-1">Atividade</th>
                        <th className="text-center font-normal py-1">Leve</th>
                        <th className="text-center font-normal py-1">Moderada</th>
                        <th className="text-center font-normal py-1">Intensa</th>
                        <th className="text-center font-normal py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {correlacaoPerdaAtividade.map((linha) => (
                        <tr key={linha.atividade} className="border-t" style={{ borderColor: colors.border }}>
                          <td className="py-1.5 pr-2">{LABEL_ATIVIDADE[linha.atividade] || linha.atividade}</td>
                          <CelulaCalor valor={linha.contagem.pequena} maximo={maxCorrelacao} cor={colors.success} />
                          <CelulaCalor valor={linha.contagem.moderada} maximo={maxCorrelacao} cor={colors.warning} />
                          <CelulaCalor valor={linha.contagem.intensa} maximo={maxCorrelacao} cor={colors.danger} />
                          <td className="py-1.5 text-center font-medium">{linha.total}</td>
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
                    Início em {new Date(`${c.dataInicio}T00:00:00`).toLocaleDateString('pt-BR')}
                  </li>
                ))}
              </ul>

              <form
                onSubmit={handleCriarCiclo}
                className="rounded-xl p-4 space-y-3"
                style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <h3 className="font-medium" style={{ color: colors.secondary }}>Iniciar novo ciclo</h3>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  O paciente registra livremente, sem uma quantidade fixa de dias.
                </p>
                <div>
                  <label className="block text-xs mb-1" style={{ color: colors.textSecondary }}>Data de início</label>
                  <input
                    type="date"
                    value={novaDataInicio}
                    onChange={(e) => setNovaDataInicio(e.target.value)}
                    min={ciclos[0] ? new Date(new Date(`${ciclos[0].dataInicio}T00:00:00`).getTime() + 86400000).toISOString().slice(0, 10) : undefined}
                    className="px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: colors.border }}
                  />
                </div>
                {erroCiclo && <p className="text-sm" style={{ color: colors.danger }}>{erroCiclo}</p>}
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
