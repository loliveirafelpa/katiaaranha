import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { calcularDiaAtual, cicloAguardandoInicio } from '../../../lib/ciclosDiarioApi'
import { listarEntradasPorDia } from '../../../lib/entradasDiarioApi'
import CabecalhoDiario from '../../../components/CabecalhoDiario'
import ListaEntradasComAcoes from '../../../components/ListaEntradasComAcoes'
import IniciarCicloCard from '../../../components/IniciarCicloCard'
import { GlassWater, Toilet, Droplet, Plus, NotebookPen, Dumbbell, ChevronRight } from 'lucide-react'
import ReguaDoDia from '../../../components/ReguaDoDia'
import MetaLiquidoDia from '../../../components/MetaLiquidoDia'
import { calcularMetaLiquidoMl } from '../../../lib/metaLiquido'
import { colors, fonts } from '../../../theme'

const ATALHOS = [
  { to: '/app/diario/nova-entrada/liquido', titulo: 'Bebi algo', dica: 'Água, café, chá, suco…', Icone: GlassWater, cor: colors.secondary },
  { to: '/app/diario/nova-entrada/banheiro', titulo: 'Fui ao banheiro', dica: 'Xixi, cocô ou os dois', Icone: Toilet, cor: colors.primary },
  { to: '/app/diario/nova-entrada/perda', titulo: 'Tive uma perda', dica: 'Escape de urina', Icone: Droplet, cor: colors.danger },
]

function formatarLitros(ml) {
  return ml >= 1000 ? `${(ml / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L` : `${ml} ml`
}

function LinkSecundario({ to, Icone, titulo, dica }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ background: colors.surface, border: `1px solid ${colors.border}`, outlineColor: colors.primary }}
    >
      <Icone size={20} color={colors.accent} aria-hidden="true" />
      <span className="flex-1">
        <span className="block text-sm font-semibold" style={{ color: colors.secondary }}>{titulo}</span>
        <span className="block text-xs" style={{ color: colors.textSecondary }}>{dica}</span>
      </span>
      <ChevronRight size={18} color={colors.textSecondary} aria-hidden="true" />
    </Link>
  )
}

// Data (dd/mm) do dia N do ciclo - o dia 1 e a data de inicio.
function dataDoDia(ciclo, n) {
  const data = new Date(`${ciclo.dataInicio}T00:00:00`)
  data.setDate(data.getDate() + n - 1)
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function DiarioAtualPage() {
  const { perfil, cicloSelecionado, ciclosPaciente, recarregarCiclos } = useOutletContext()
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(true)
  const [entradas, setEntradas] = useState([])

  const carregar = useCallback(async () => {
    setCarregando(true)
    if (cicloSelecionado && calcularDiaAtual(cicloSelecionado) >= 1) {
      setEntradas(await listarEntradasPorDia(cicloSelecionado.id, calcularDiaAtual(cicloSelecionado)))
    } else {
      // Limpa os registros do ciclo anterior - sem isso, trocar pra um ciclo sem dados
      // ainda validos (ex.: comeca no futuro) deixava a lista antiga na tela por engano.
      setEntradas([])
    }
    setCarregando(false)
  }, [cicloSelecionado])

  useEffect(() => { carregar() }, [carregar])

  if (carregando) {
    return <p style={{ color: colors.textSecondary }}>Carregando...</p>
  }

  if (!cicloSelecionado) {
    return (
      <div className="rounded-2xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
        <p style={{ color: colors.textSecondary }}>
          Você ainda não tem um diário miccional atribuído. Aguarde a Dra. Kátia iniciar seu
          acompanhamento.
        </p>
      </div>
    )
  }

  if (cicloAguardandoInicio(cicloSelecionado)) {
    return <IniciarCicloCard ciclo={cicloSelecionado} ciclos={ciclosPaciente} onIniciado={recarregarCiclos} />
  }

  if (calcularDiaAtual(cicloSelecionado) < 1) {
    const inicioFormatado = new Date(`${cicloSelecionado.dataInicio}T00:00:00`).toLocaleDateString('pt-BR')
    return (
      <div className="rounded-2xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
        <p style={{ color: colors.textSecondary }}>
          Este ciclo ainda não começou. Ele passa a valer a partir de {inicioFormatado}.
        </p>
      </div>
    )
  }

  const diaAtual = calcularDiaAtual(cicloSelecionado)
  const agora = new Date()
  const totalLiquidoMl = entradas.reduce((soma, e) => soma + (e.tipoEvento === 'liquido' ? (e.liquidoMl || 0) : 0), 0)
  const totalXixi = entradas.filter((e) => e.tipoEvento === 'urinario').length
  const totalPerdas = entradas.filter((e) => e.tipoEvento === 'perda').length
  const metaLiquido = calcularMetaLiquidoMl(perfil?.idade, perfil?.pesoKg)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <CabecalhoDiario
        nomeCompleto={perfil?.nomeCompleto}
        // ciclosPaciente vem do mais recente pro mais antigo: o numero conta de tras pra frente
        numeroCiclo={ciclosPaciente.length - ciclosPaciente.findIndex((c) => c.id === cicloSelecionado.id)}
        diaAtual={diaAtual}
      />

      <section aria-labelledby="titulo-registrar">
        <h2 id="titulo-registrar" className="sr-only">Registrar agora</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ATALHOS.map(({ to, titulo, dica, Icone, cor }) => (
            <Link
              key={to}
              to={to}
              className="group flex sm:flex-col items-center sm:items-start gap-3 rounded-2xl p-4 transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              style={{ background: colors.surface, border: `1px solid ${colors.border}`, outlineColor: colors.primary }}
            >
              <span className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center" style={{ background: cor }}>
                <Icone size={22} color="#fff" strokeWidth={2} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold" style={{ color: colors.text, fontFamily: fonts.heading }}>{titulo}</span>
                <span className="block text-xs mt-0.5" style={{ color: colors.textSecondary }}>{dica}</span>
              </span>
              <Plus size={18} className="ml-auto sm:hidden" color={colors.textSecondary} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl p-5 space-y-5" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold" style={{ color: colors.secondary }}>Seu dia até agora</h2>
          <p className="text-xs tabular-nums" style={{ color: colors.textSecondary }}>
            {formatarLitros(totalLiquidoMl)} de líquido · {totalXixi} {totalXixi === 1 ? 'xixi' : 'xixis'} · {totalPerdas} {totalPerdas === 1 ? 'perda' : 'perdas'}
          </p>
        </div>
        {metaLiquido && <MetaLiquidoDia meta={metaLiquido} bebidoMl={totalLiquidoMl} />}
        <ReguaDoDia entradas={entradas} agoraMin={agora.getHours() * 60 + agora.getMinutes()} />
        <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
          <ListaEntradasComAcoes
            entradas={entradas}
            mensagemVazia="Nada registrado hoje ainda. Use os botões acima sempre que beber algo, for ao banheiro ou tiver uma perda."
            onAlterado={carregar}
          />
        </div>
      </section>

      <nav aria-label="Mais do seu diário" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <LinkSecundario to={`/app/diario/dia/${diaAtual}/observacoes`} Icone={NotebookPen} titulo="Observações do dia" dica="Absorvente, menstruação, medicamentos" />
        <LinkSecundario to="/app/exercicios" Icone={Dumbbell} titulo="Exercícios e orientações" dica="O que a Dra. Kátia passou para você" />
      </nav>

      {diaAtual > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{ border: `1px dashed ${colors.border}` }}>
          <label htmlFor="dia-anterior" className="text-sm font-medium" style={{ color: colors.secondary }}>
            Rever ou corrigir um dia anterior
          </label>
          {/* Seletor fechado em vez de um botao por dia: com o ciclo avancando, a lista
              de botoes crescia e ocupava a tela inteira. */}
          <select
            id="dia-anterior"
            value=""
            onChange={(e) => e.target.value && navigate(`/app/diario/dia/${e.target.value}`)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: colors.border, color: colors.secondary, background: colors.surface }}
          >
            <option value="">Escolha um dia...</option>
            {Array.from({ length: diaAtual - 1 }, (_, i) => diaAtual - 1 - i).map((n) => (
              <option key={n} value={n}>
                Dia {n} — {dataDoDia(cicloSelecionado, n)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
