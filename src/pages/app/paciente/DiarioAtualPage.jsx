import { useEffect, useState, useCallback } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { calcularDiaAtual } from '../../../lib/ciclosDiarioApi'
import { listarEntradasPorDia, excluirEntrada } from '../../../lib/entradasDiarioApi'
import IndicadorDiaXdeN from '../../../components/IndicadorDiaXdeN'
import ModalConfirmacaoExclusao from '../../../components/ModalConfirmacaoExclusao'
import { labelAtividadePerda } from '../../../data/atividadesPerda'
import { colors } from '../../../theme'

const LABEL_LIQUIDO = {
  agua: 'Água', cafe: 'Café', cha: 'Chá', suco: 'Suco',
  refrigerante: 'Refrigerante', alcool: 'Álcool', outro: 'Outro',
}

const LABEL_NIVEL = { baixo: 'baixo', medio: 'médio', alto: 'alto' }

function formatarHora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function descreverEntrada(e) {
  if (e.tipoEvento === 'liquido') {
    return `${e.liquidoMl} ml de ${e.liquidoTipo === 'outro' ? (e.liquidoTipoOutro || 'outro') : LABEL_LIQUIDO[e.liquidoTipo]}`
  }
  if (e.tipoEvento === 'urinario') {
    const volume = e.volumeUrinadoMl != null ? `${e.volumeUrinadoMl} ml` : 'Volume não informado'
    return `Urinou · ${volume}${e.volumeUrinadoNivel ? ` (${LABEL_NIVEL[e.volumeUrinadoNivel]})` : ''}${e.urgencia ? ` · urgência ${e.urgencia}` : ''}`
  }
  if (e.tipoEvento === 'perda') {
    const atividade = labelAtividadePerda(e.perdaAtividadeCategoria, e.perdaAtividadeDetalhe)
    return `Perda ${e.perda}${atividade ? ` · ${atividade}` : ''}`
  }
  return ''
}

export default function DiarioAtualPage() {
  const { cicloSelecionado } = useOutletContext()
  const [carregando, setCarregando] = useState(true)
  const [entradas, setEntradas] = useState([])
  const [entradaParaExcluir, setEntradaParaExcluir] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

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

  async function handleExcluir() {
    setExcluindo(true)
    try {
      await excluirEntrada(entradaParaExcluir.id)
      setEntradaParaExcluir(null)
      await carregar()
    } finally {
      setExcluindo(false)
    }
  }

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
        {entradas.length === 0 ? (
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Nenhum registro ainda hoje. Toque em um dos botões acima sempre que beber algo, for
            ao banheiro ou tiver uma perda.
          </p>
        ) : (
          <ul className="space-y-2">
            {entradas.map((e) => (
              <li
                key={e.id}
                className="rounded-xl p-3 flex items-start justify-between gap-3 text-sm"
                style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <div>
                  <p className="font-medium">{formatarHora(e.registradoEm)}</p>
                  <p style={{ color: colors.textSecondary }}>{descreverEntrada(e)}</p>
                </div>
                <button
                  onClick={() => setEntradaParaExcluir(e)}
                  className="text-xs underline"
                  style={{ color: colors.danger }}
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ModalConfirmacaoExclusao
        aberto={!!entradaParaExcluir}
        titulo="Excluir registro"
        mensagem="Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita."
        onConfirmar={handleExcluir}
        onCancelar={() => setEntradaParaExcluir(null)}
        confirmando={excluindo}
      />
    </div>
  )
}
