import { useState } from 'react'
import { Link } from 'react-router-dom'
import { excluirEntrada } from '../lib/entradasDiarioApi'
import ModalConfirmacaoExclusao from './ModalConfirmacaoExclusao'
import { labelAtividadePerda } from '../data/atividadesPerda'
import { colors } from '../theme'

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

// Lista de registros do paciente com "Editar" (leva ao formulario, reaproveitado
// de nova entrada) e "Excluir" por item - usada tanto no dia atual quanto no
// historico de dias anteriores, pra paciente poder corrigir algo que registrou errado.
export default function ListaEntradasComAcoes({ entradas, mensagemVazia, onAlterado }) {
  const [entradaParaExcluir, setEntradaParaExcluir] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  async function handleExcluir() {
    setExcluindo(true)
    try {
      await excluirEntrada(entradaParaExcluir.id)
      setEntradaParaExcluir(null)
      await onAlterado?.()
    } finally {
      setExcluindo(false)
    }
  }

  if (entradas.length === 0) {
    return (
      <p className="text-sm" style={{ color: colors.textSecondary }}>
        {mensagemVazia || 'Nenhum registro ainda.'}
      </p>
    )
  }

  return (
    <>
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
            <div className="flex flex-col items-end gap-1 text-xs shrink-0">
              <Link to={`/app/diario/entrada/${e.id}/editar`} className="underline" style={{ color: colors.secondary }}>
                Editar
              </Link>
              <button onClick={() => setEntradaParaExcluir(e)} className="underline" style={{ color: colors.danger }}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ModalConfirmacaoExclusao
        aberto={!!entradaParaExcluir}
        titulo="Excluir registro"
        mensagem="Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita."
        onConfirmar={handleExcluir}
        onCancelar={() => setEntradaParaExcluir(null)}
        confirmando={excluindo}
      />
    </>
  )
}
