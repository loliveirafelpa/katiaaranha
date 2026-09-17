import { useEffect, useState, useCallback } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { calcularDiaAtual } from '../../../lib/ciclosDiarioApi'
import { listarEntradasPorDia } from '../../../lib/entradasDiarioApi'
import IndicadorDiaXdeN from '../../../components/IndicadorDiaXdeN'
import ListaEntradasComAcoes from '../../../components/ListaEntradasComAcoes'
import { colors } from '../../../theme'

export default function DiarioAtualPage() {
  const { cicloSelecionado } = useOutletContext()
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
          to="/app/diario/nova-entrada/urinario"
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
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: diaAtual - 1 }, (_, i) => diaAtual - 1 - i).map((n) => (
              <Link
                key={n}
                to={`/app/diario/dia/${n}`}
                className="px-3 py-1.5 rounded-full text-sm border font-medium"
                style={{ borderColor: colors.border, color: colors.secondary }}
              >
                Dia {n}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
