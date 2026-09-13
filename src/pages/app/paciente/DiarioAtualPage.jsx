import { useEffect, useState, useCallback } from 'react'
import { Link, Navigate, useOutletContext } from 'react-router-dom'
import { obterCicloAtivo, calcularDiaAtual, calcularStatusCiclo } from '../../../lib/ciclosDiarioApi'
import { listarEntradasPorDia, excluirEntrada } from '../../../lib/entradasDiarioApi'
import IndicadorDiaXdeN from '../../../components/IndicadorDiaXdeN'
import ModalConfirmacaoExclusao from '../../../components/ModalConfirmacaoExclusao'
import { colors } from '../../../theme'

const LABEL_LIQUIDO = {
  agua: 'Água', cafe: 'Café', cha: 'Chá', suco: 'Suco',
  refrigerante: 'Refrigerante', alcool: 'Álcool', outro: 'Outro',
}

function formatarHora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function DiarioAtualPage() {
  const { perfil } = useOutletContext()
  const [carregando, setCarregando] = useState(true)
  const [ciclo, setCiclo] = useState(null)
  const [entradas, setEntradas] = useState([])
  const [entradaParaExcluir, setEntradaParaExcluir] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    const cicloAtivo = await obterCicloAtivo(perfil.id)
    setCiclo(cicloAtivo)
    if (cicloAtivo) {
      const diaAtual = calcularDiaAtual(cicloAtivo)
      if (diaAtual >= 1 && diaAtual <= cicloAtivo.duracaoDias) {
        setEntradas(await listarEntradasPorDia(cicloAtivo.id, diaAtual))
      }
    }
    setCarregando(false)
  }, [perfil.id])

  useEffect(() => { carregar() }, [carregar])

  if (carregando) {
    return <p style={{ color: colors.textSecondary }}>Carregando...</p>
  }

  if (!ciclo) {
    return (
      <div className="rounded-2xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
        <p style={{ color: colors.textSecondary }}>
          Você ainda não tem um diário miccional atribuído. Aguarde a Dra. Kátia iniciar seu
          acompanhamento.
        </p>
      </div>
    )
  }

  const status = calcularStatusCiclo(ciclo)
  const diaAtual = calcularDiaAtual(ciclo)

  if (status === 'concluido') {
    return <Navigate to="/app/diario/concluido" replace />
  }

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
        <IndicadorDiaXdeN diaAtual={diaAtual} duracaoDias={ciclo.duracaoDias} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/app/diario/nova-entrada"
          className="px-4 py-2 rounded-xl font-medium text-white text-sm"
          style={{ background: colors.primary }}
        >
          + Nova entrada
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
            Nenhum registro ainda hoje. Toque em "Nova entrada" sempre que beber algo ou for ao
            banheiro.
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
                  <p style={{ color: colors.textSecondary }}>
                    {e.liquidoMl} ml de {e.liquidoTipo === 'outro' ? (e.liquidoTipoOutro || 'outro') : LABEL_LIQUIDO[e.liquidoTipo]}
                    {e.volumeUrinadoMl != null && ` · urinou ${e.volumeUrinadoMl} ml`}
                    {e.perda !== 'sem_perda' && ` · perda ${e.perda}`}
                  </p>
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
