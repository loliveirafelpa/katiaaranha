import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { obterPacientePorId } from '../../../lib/perfisApi'
import { solicitarExclusaoPaciente } from '../../../lib/pacientesApi'
import { listarCiclosPorPaciente, criarCiclo, calcularDiaAtual, cicloAguardandoInicio } from '../../../lib/ciclosDiarioApi'
import { listarEntradasPorCiclo } from '../../../lib/entradasDiarioApi'
import { listarObservacoesPorCiclo } from '../../../lib/observacoesApi'
import { listarNotasPorPaciente, criarNota, excluirNota } from '../../../lib/notasClinicasApi'
import {
  calcularResumoPorDia,
  calcularBalancoHidrico,
  calcularPerdasPorAtividade,
  calcularCorrelacaoPerdaAtividade,
  calcularNocturia,
  calcularFraldaPorDia,
} from '../../../lib/indicadoresCalculo'
import TabelaDiariaEstiloPapel from '../../../components/TabelaDiariaEstiloPapel'
import TabelaDiarioFolha from '../../../components/TabelaDiarioFolha'
import ComparativosCiclos from '../../../components/ComparativosCiclos'
import NotaClinicaForm from '../../../components/NotaClinicaForm'
import PrescricaoExercicios from '../../../components/PrescricaoExercicios'
import OrientacoesPaciente from '../../../components/OrientacoesPaciente'
import ModalConfirmacaoExclusao from '../../../components/ModalConfirmacaoExclusao'
import ComentariosGrafico, { ComentariosGraficosProvider } from '../../../components/ComentariosGrafico'
import { labelServico } from '../../../data/servicos'
import { ATIVIDADES_PERDA } from '../../../data/atividadesPerda'
import { calcularMetaLiquidoMl, formatarMetaLiquido } from '../../../lib/metaLiquido'
import CabecalhoPagina, { AvatarIniciais, BotaoAcao } from '../../../components/CabecalhoPagina'
import { Pencil, Trash2 } from 'lucide-react'
import { colors } from '../../../theme'

const LABEL_UNIDADE = { campinas: 'Campinas', jundiai: 'Jundiaí' }
const LABEL_ATIVIDADE = Object.fromEntries(ATIVIDADES_PERDA.map((a) => [a.valor, a.label]))

const ABAS = [
  { id: 'diario', label: 'Diário' },
  { id: 'graficos', label: 'Gráficos' },
  { id: 'comparativos', label: 'Comparativos' },
  { id: 'observacoes', label: 'Observações' },
  { id: 'exercicios', label: 'Exercícios/Orientações' },
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

// Barra de um valor so, sem trilho de fundo (area vazia colorida era lida como dado).
function BarraValor({ label, valor, maximo, unidade = '' }) {
  return (
    <div className="flex items-center gap-3 text-sm mb-1.5">
      <span className="w-16 shrink-0" style={{ color: colors.textSecondary }}>{label}</span>
      <div className="flex-1 h-5">
        {valor > 0 && <div className="h-5 rounded" style={{ width: `${(valor / maximo) * 100}%`, background: colors.primary }} />}
      </div>
      <span className="w-14 text-right text-xs font-medium" style={{ color: colors.text }}>
        {valor == null ? '—' : `${valor.toLocaleString('pt-BR')}${unidade}`}
      </span>
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

function BarraSeveridadeDia({ label, contagem, maximo }) {
  const total = contagem.pequena + contagem.moderada + contagem.intensa
  return (
    <div className="flex items-center gap-3 text-sm mb-1.5">
      <span className="w-16 shrink-0" style={{ color: colors.textSecondary }}>{label}</span>
      {/* Sem fundo: a barra termina onde terminam os registros, pra area vazia nao
          parecer mais uma categoria da legenda. */}
      <div className="flex-1 h-5 flex gap-[2px]">
        {total > 0 && ['pequena', 'moderada', 'intensa'].map((chave) => (
          contagem[chave] > 0 && (
            <div
              key={chave}
              className="h-5 rounded flex items-center justify-center text-[10px] font-semibold text-white"
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

// Converte o numero do dia do ciclo pra data de calendario de verdade (ex.: "15/09/26"),
// pra facilitar a leitura pra profissional em vez de um numero abstrato tipo "Dia 3".
function formatarDataDoDia(cicloSelecionado, diaNumero) {
  if (!cicloSelecionado?.dataInicio) return `Dia ${diaNumero}`
  const data = new Date(`${cicloSelecionado.dataInicio}T00:00:00`)
  data.setDate(data.getDate() + diaNumero - 1)
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default function PacienteDetalhePage() {
  const { perfil } = useOutletContext()
  const { id } = useParams()
  const navigate = useNavigate()

  const [paciente, setPaciente] = useState(null)
  const [ciclos, setCiclos] = useState([])
  const [cicloSelecionadoId, setCicloSelecionadoId] = useState(null)
  const [entradas, setEntradas] = useState([])
  const [observacoes, setObservacoes] = useState([])
  const [notas, setNotas] = useState([])
  const [aba, setAba] = useState('diario')
  const [ordenacaoDiario, setOrdenacaoDiario] = useState('horario')
  const [carregando, setCarregando] = useState(true)

  const [criandoCiclo, setCriandoCiclo] = useState(false)
  const [erroCiclo, setErroCiclo] = useState('')
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false)
  const [excluindoPaciente, setExcluindoPaciente] = useState(false)

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
    // Abre no ciclo mais recente que ja comecou - um ciclo recem-aberto, ainda sem data,
    // nao tem nada pra mostrar.
    setCicloSelecionadoId((ciclosData.find((c) => c.dataInicio) || ciclosData[0])?.id ?? null)
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

  // A admin so abre o ciclo; o dia de inicio quem escolhe e o paciente, pelo app.
  async function handleCriarCiclo() {
    setErroCiclo('')
    setCriandoCiclo(true)
    try {
      await criarCiclo({ pacienteId: id, criadoPor: perfil.id })
      await carregarBase()
    } catch (err) {
      if (err.message?.includes('ciclo_pendente_existente')) {
        setErroCiclo('Este paciente já tem um ciclo aberto aguardando início.')
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

  async function handleExcluirPaciente() {
    setExcluindoPaciente(true)
    try {
      await solicitarExclusaoPaciente(id)
      navigate('/app/admin/pacientes', { replace: true })
    } finally {
      setExcluindoPaciente(false)
    }
  }

  if (carregando || !paciente) {
    return <p style={{ color: colors.textSecondary }}>Carregando...</p>
  }

  const cicloSelecionado = ciclos.find((c) => c.id === cicloSelecionadoId) || null

  const resumoPorDia = calcularResumoPorDia(entradas)
  const balanco = calcularBalancoHidrico(entradas)
  const { contagem: perdasContagem, outros: perdasOutros } = calcularPerdasPorAtividade(entradas)
  const nocturia = calcularNocturia(entradas)
  const maxNocturiaPorDia = Math.max(1, ...Object.values(nocturia.porDia))
  const maxPerdas = Math.max(1, ...Object.values(perdasContagem), ...perdasOutros.map((o) => o.quantidade))
  const totalPerdasPorAtividade = Object.values(perdasContagem).reduce((a, b) => a + b, 0) + perdasOutros.reduce((a, o) => a + o.quantidade, 0)

  const totalLiquidoIngeridoMl = entradas.reduce((soma, e) => soma + (e.tipoEvento === 'liquido' ? (e.liquidoMl || 0) : 0), 0)
  const totalRegistrosUrina = entradas.filter((e) => e.tipoEvento === 'urinario').length
  const totalEpisodiosPerda = entradas.filter((e) => e.tipoEvento === 'perda').length
  const metaLiquidoDiaria = formatarMetaLiquido(calcularMetaLiquidoMl(paciente.idade, paciente.pesoKg))
  const maxUrgenciaPorDia = Math.max(
    1,
    ...resumoPorDia.map((r) => r.contagemUrgencia.pequena + r.contagemUrgencia.moderada + r.contagemUrgencia.intensa)
  )
  const maxPerdaPorDia = Math.max(
    1,
    ...resumoPorDia.map((r) => r.contagemPerda.pequena + r.contagemPerda.moderada + r.contagemPerda.intensa)
  )

  const correlacaoPerdaAtividade = calcularCorrelacaoPerdaAtividade(entradas)
  const fraldaPorDia = calcularFraldaPorDia(entradas)
  const maxUrinaFralda = Math.max(1, ...fraldaPorDia.map((d) => d.urinaFraldaG ?? 0))
  const maxTrocas = Math.max(1, ...fraldaPorDia.map((d) => d.trocas ?? 0))
  const maxCorrelacao = Math.max(
    1,
    ...correlacaoPerdaAtividade.flatMap((l) => [l.contagem.pequena, l.contagem.moderada, l.contagem.intensa])
  )

  return (
    <ComentariosGraficosProvider pacienteId={id} autorId={perfil.id}>
    <div className="space-y-5">
      <CabecalhoPagina
        voltar={{ to: '/app/admin/pacientes', label: 'Pacientes' }}
        antesDoTitulo={<AvatarIniciais nome={paciente.nomeCompleto} tamanho={56} />}
        titulo={paciente.nomeCompleto}
        subtitulo={
          <>
            <span className="flex flex-wrap items-center gap-2 mt-1.5">
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={
                  labelServico(paciente)
                    ? { backgroundColor: colors.primary, color: colors.surface }
                    : { border: `1px dashed ${colors.border}`, color: colors.textSecondary }
                }
              >
                {labelServico(paciente) || 'Sem serviço definido'}
              </span>
              {paciente.protocoloUrgencia && (
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ border: `1px solid ${colors.primary}`, color: colors.primary }}
                >
                  Protocolo de urgência
                </span>
              )}
            </span>
            <span className="block mt-1.5 text-xs">
              {paciente.unidade ? LABEL_UNIDADE[paciente.unidade] : 'Sem unidade'}
              {paciente.contato ? ` · ${paciente.contato}` : ''}
              {paciente.idade ? ` · ${paciente.idade} anos` : ''}
              {paciente.pesoKg ? ` · ${paciente.pesoKg} kg` : ''}
            </span>
          </>
        }
        acoes={
          <>
            <BotaoAcao as={Link} to={`/app/admin/pacientes/${id}/editar`} Icone={Pencil}>Editar cadastro</BotaoAcao>
            <BotaoAcao onClick={() => setModalExclusaoAberto(true)} Icone={Trash2} perigo>Excluir</BotaoAcao>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Seções do paciente"
          className="flex gap-1 p-1 rounded-2xl overflow-x-auto max-w-full"
          style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
        >
          {ABAS.map((a) => (
            <button
              key={a.id}
              role="tab"
              aria-selected={aba === a.id}
              onClick={() => setAba(a.id)}
              className="px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap focus-visible:outline-2"
              style={{
                background: aba === a.id ? colors.background : 'transparent',
                color: aba === a.id ? colors.secondary : colors.textSecondary,
                fontWeight: aba === a.id ? 600 : 500,
                outlineColor: colors.primary,
              }}
            >
              {a.label}
            </button>
          ))}
        </div>

        {ciclos.length > 1 && aba !== 'comparativos' && (
          <label className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
            Ver
            <select
              value={cicloSelecionadoId || ''}
              onChange={(e) => setCicloSelecionadoId(e.target.value)}
              className="px-3 py-2 rounded-full border text-sm font-medium"
              style={{ borderColor: colors.border, background: colors.surface, color: colors.secondary }}
            >
              {/* ciclos vem do mais recente pro mais antigo, entao o numero e contado de tras pra frente */}
              {ciclos.map((c, i) => (
                <option key={c.id} value={c.id}>
                  Ciclo {ciclos.length - i}{c.dataInicio ? '' : ' (aguardando paciente iniciar)'}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {!cicloSelecionado && aba !== 'ciclos' && aba !== 'notas' && aba !== 'exercicios' ? (
        <p style={{ color: colors.textSecondary }}>Nenhum ciclo de diário criado ainda para este paciente.</p>
      ) : cicloAguardandoInicio(cicloSelecionado) && ['diario', 'graficos', 'observacoes'].includes(aba) ? (
        <p style={{ color: colors.textSecondary }}>
          Este ciclo foi aberto e está aguardando o paciente escolher o dia de início no app.
        </p>
      ) : (
        <>
          {aba === 'diario' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm justify-end">
                <span style={{ color: colors.textSecondary }}>Visualizar por:</span>
                {[
                  { valor: 'horario', label: 'Horário' },
                  { valor: 'tipo', label: 'Tipo' },
                  { valor: 'tabela', label: 'Tabela' },
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
              {ordenacaoDiario === 'tabela' ? (
                <TabelaDiarioFolha ciclo={cicloSelecionado} entradas={entradas} />
              ) : (
                <TabelaDiariaEstiloPapel entradas={entradas} ordenacao={ordenacaoDiario} />
              )}
            </div>
          )}

          {aba === 'graficos' && (
            <div className="space-y-6">
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Os números abaixo somam o ciclo inteiro selecionado, do início até hoje — não são o total de um dia isolado.
              </p>
              <div className={`grid grid-cols-2 gap-3 ${metaLiquidoDiaria ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
                <CardDestaque valor={resumoPorDia.length} label={resumoPorDia.length === 1 ? 'Dia com registro' : 'Dias com registro'} />
                <CardDestaque valor={`${totalLiquidoIngeridoMl} ml`} label="Total de líquido ingerido" />
                <CardDestaque valor={totalRegistrosUrina} label="Total de registros de urina" />
                <CardDestaque valor={totalEpisodiosPerda} label="Episódios de perda" />
                {metaLiquidoDiaria && (
                  <CardDestaque valor={metaLiquidoDiaria} label="Meta diária de líquido recomendada" />
                )}
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
                          <td className="py-1">{formatarDataDoDia(cicloSelecionado, b.diaNumero)}</td>
                          <td className="py-1">{b.ingeridoMl} ml</td>
                          <td className="py-1">{b.urinadoMl} ml</td>
                          <td className="py-1">{b.saldoMl} ml</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <ComentariosGrafico grafico="graficos:balanco-hidrico" cicloId={cicloSelecionadoId} />
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
                        label={formatarDataDoDia(cicloSelecionado, r.diaNumero)}
                        contagem={r.contagemUrgencia}
                        maximo={maxUrgenciaPorDia}
                      />
                    ))}
                  </>
                )}
                <ComentariosGrafico grafico="graficos:urgencia" cicloId={cicloSelecionadoId} />
              </div>

              <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 className="font-medium mb-1" style={{ color: colors.secondary }}>Idas noturnas ao banheiro</h3>
                <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>
                  Xixis registrados entre 23h e 6h em cada dia (noctúria)
                </p>
                {resumoPorDia.length === 0 ? (
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Sem dados ainda.</p>
                ) : (
                  resumoPorDia.map((r) => (
                    <BarraValor
                      key={r.diaNumero}
                      label={formatarDataDoDia(cicloSelecionado, r.diaNumero)}
                      valor={nocturia.porDia[r.diaNumero] || 0}
                      maximo={maxNocturiaPorDia}
                    />
                  ))
                )}
                <ComentariosGrafico grafico="graficos:noturnas" cicloId={cicloSelecionadoId} />
              </div>

              <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 className="font-medium mb-1" style={{ color: colors.secondary }}>Balanço de perdas por dia</h3>
                <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>
                  Perdas de urina em cada dia, por intensidade
                </p>
                {resumoPorDia.length === 0 ? (
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Sem dados ainda.</p>
                ) : (
                  <>
                    <LegendaSeveridade />
                    {resumoPorDia.map((r) => (
                      <BarraSeveridadeDia
                        key={r.diaNumero}
                        label={formatarDataDoDia(cicloSelecionado, r.diaNumero)}
                        contagem={r.contagemPerda}
                        maximo={maxPerdaPorDia}
                      />
                    ))}
                  </>
                )}
                <ComentariosGrafico grafico="graficos:perdas-por-dia" cicloId={cicloSelecionadoId} />
              </div>

              {fraldaPorDia.length > 0 && (
                <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                  <h3 className="font-medium mb-1" style={{ color: colors.secondary }}>Protocolo de urgência — fralda</h3>
                  <p className="text-xs mb-3" style={{ color: colors.textSecondary }}>
                    Urina na fralda = peso após a troca − peso inicial da fralda (1 g ≈ 1 ml).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium mb-2">Urina na fralda por dia (g)</p>
                      {fraldaPorDia.map((d) => (
                        <BarraValor key={d.diaNumero} label={formatarDataDoDia(cicloSelecionado, d.diaNumero)} valor={d.urinaFraldaG} maximo={maxUrinaFralda} unidade=" g" />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Trocas de fralda por dia</p>
                      {fraldaPorDia.map((d) => (
                        <BarraValor key={d.diaNumero} label={formatarDataDoDia(cicloSelecionado, d.diaNumero)} valor={d.trocas} maximo={maxTrocas} />
                      ))}
                    </div>
                  </div>
                  <ComentariosGrafico grafico="graficos:fralda" cicloId={cicloSelecionadoId} />
                </div>
              )}

              <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 className="font-medium mb-3" style={{ color: colors.secondary }}>Perdas por atividade</h3>
                {totalPerdasPorAtividade === 0 ? (
                  <p className="text-sm" style={{ color: colors.textSecondary }}>Nenhum episódio de perda registrado.</p>
                ) : (
                  <>
                    {/* Regra: sempre da atividade mais frequente pra menos frequente,
                        misturando as categorias fixas com os "outro" escritos pelo paciente. */}
                    {[
                      ...Object.entries(perdasContagem).map(([categoria, valor]) => ({ chave: categoria, label: LABEL_ATIVIDADE[categoria], valor })),
                      ...perdasOutros.map((o) => ({ chave: `outro:${o.texto}`, label: o.texto, valor: o.quantidade })),
                    ]
                      .filter((item) => item.valor > 0)
                      .sort((a, b) => b.valor - a.valor)
                      .map((item) => (
                        <Barra key={item.chave} label={item.label} valor={item.valor} maximo={maxPerdas} />
                      ))}
                  </>
                )}
                <ComentariosGrafico grafico="graficos:perdas-por-atividade" cicloId={cicloSelecionadoId} />
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
                <ComentariosGrafico grafico="graficos:perda-x-atividade" cicloId={cicloSelecionadoId} />
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
                    {o.outrosSintomas?.length > 0 && (
                      <div style={{ color: colors.textSecondary }}>
                        <p>Sintomas/observações:</p>
                        <ul className="list-disc pl-5">
                          {o.outrosSintomas.map((item, indice) => (
                            <li key={indice}>
                              {new Date(item.horario).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — {item.texto}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {aba === 'exercicios' && (
            <div className="space-y-6">
              <OrientacoesPaciente pacienteId={id} adminId={perfil.id} />
              <PrescricaoExercicios pacienteId={id} adminId={perfil.id} />
            </div>
          )}

          {aba === 'comparativos' && <ComparativosCiclos ciclos={ciclos.filter((c) => c.dataInicio)} />}

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
              <div className="rounded-xl p-4 space-y-3" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Ao cadastrar um novo ciclo, ele fica disponível automaticamente para o paciente, que escolhe a data de início.
                </p>
                {cicloAguardandoInicio(ciclos[0]) ? (
                  <p className="text-sm font-medium" style={{ color: colors.secondary }}>
                    Novo ciclo aberto, aguardando o paciente.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleCriarCiclo}
                    disabled={criandoCiclo}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
                    style={{ background: colors.primary }}
                  >
                    {criandoCiclo ? 'Abrindo...' : '+ Acrescentar novo ciclo'}
                  </button>
                )}
                {erroCiclo && <p className="text-sm" style={{ color: colors.danger }}>{erroCiclo}</p>}
              </div>

              {ciclos.length > 0 && (
                <ul className="space-y-2">
                  {ciclos.map((c, i) => (
                    <li key={c.id} className="rounded-xl p-3 text-sm flex items-center justify-between gap-3" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
                      <span className="font-medium">Ciclo {ciclos.length - i}</span>
                      <span style={{ color: colors.textSecondary }}>
                        {c.dataInicio
                          ? `Iniciado pelo paciente em ${new Date(`${c.dataInicio}T00:00:00`).toLocaleDateString('pt-BR')}`
                          : 'Aguardando paciente iniciar'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      <ModalConfirmacaoExclusao
        aberto={modalExclusaoAberto}
        titulo="Excluir paciente"
        mensagem={`Isso vai anonimizar os dados de identificação de ${paciente.nomeCompleto} e remover o acesso dela ao sistema. Os registros do diário e as notas clínicas continuam guardados. Essa ação não pode ser desfeita. Deseja continuar?`}
        onConfirmar={handleExcluirPaciente}
        onCancelar={() => setModalExclusaoAberto(false)}
        confirmando={excluindoPaciente}
      />
    </div>
    </ComentariosGraficosProvider>
  )
}
