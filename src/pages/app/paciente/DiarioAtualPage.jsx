import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { calcularDiaAtual } from '../../../lib/ciclosDiarioApi'
import { listarEntradasPorDia } from '../../../lib/entradasDiarioApi'
import IndicadorDiaXdeN from '../../../components/IndicadorDiaXdeN'
import ListaEntradasComAcoes from '../../../components/ListaEntradasComAcoes'
import { colors } from '../../../theme'

// Data (dd/mm) do dia N do ciclo - o dia 1 e a data de inicio.
function dataDoDia(ciclo, n) {
  const data = new Date(`${ciclo.dataInicio}T00:00:00`)
  data.setDate(data.getDate() + n - 1)
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function DiarioAtualPage() {
  const { cicloSelecionado } = useOutletContext()
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-5" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
        <IndicadorDiaXdeN diaAtual={diaAtual} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/app/diario/nova-entrada/liquido"
          className="px-4 py-2 rounded-xl font-medium text-white text-sm"
          style={{ background: colors.secondary }}
        >
          + Líquido
        </Link>
        <Link
          to="/app/diario/nova-entrada/banheiro"
          className="px-4 py-2 rounded-xl font-medium text-white text-sm"
          style={{ background: colors.primary }}
        >
          + Fui ao banheiro
        </Link>
        <Link
          to="/app/diario/nova-entrada/perda"
          className="px-4 py-2 rounded-xl font-medium text-white text-sm"
          style={{ background: colors.danger }}
        >
          + Perda de urina
        </Link>
        <Link
          to={`/app/diario/dia/${diaAtual}/observacoes`}
          className="px-4 py-2 rounded-xl font-medium text-sm border"
          style={{ borderColor: colors.border, color: colors.secondary }}
        >
          Observações do dia
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>
          Registros de hoje
        </h2>
        <ListaEntradasComAcoes
          entradas={entradas}
          mensagemVazia="Nenhum registro ainda hoje. Toque em um dos botões acima sempre que beber algo, for ao banheiro ou tiver uma perda."
          onAlterado={carregar}
        />
      </div>

      {diaAtual > 1 && (
        <div>
          <h2 className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>
            Dias anteriores
          </h2>
          {/* Seletor fechado em vez de um botao por dia: com o ciclo avancando, a lista
              de botoes crescia e ocupava a tela inteira. */}
          <select
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
