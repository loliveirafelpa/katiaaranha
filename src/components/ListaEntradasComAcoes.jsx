import { useState } from 'react'
import { Link } from 'react-router-dom'
import { excluirEntrada } from '../lib/entradasDiarioApi'
import ModalConfirmacaoExclusao from './ModalConfirmacaoExclusao'
import { labelAtividadePerda } from '../data/atividadesPerda'
import { labelEscalaFezes } from '../data/escalaFezes'
import { GlassWater, Toilet, Droplet, CircleDot, Pencil, Trash2 } from 'lucide-react'
import { colors } from '../theme'

// Mesmos icones e cores da regua do dia e da tabela do admin.
const VISUAL_TIPO = {
  liquido: { Icone: GlassWater, cor: colors.secondary, titulo: 'Líquido' },
  urinario: { Icone: Toilet, cor: colors.primary, titulo: 'Xixi' },
  intestinal: { Icone: CircleDot, cor: colors.accent, titulo: 'Cocô' },
  perda: { Icone: Droplet, cor: colors.danger, titulo: 'Perda de urina' },
}

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
    return `${volume}${e.volumeUrinadoNivel ? ` (${LABEL_NIVEL[e.volumeUrinadoNivel]})` : ''}${e.urgencia ? ` · urgência ${e.urgencia}` : ''}`
  }
  if (e.tipoEvento === 'perda') {
    const atividade = labelAtividadePerda(e.perdaAtividadeCategoria, e.perdaAtividadeDetalhe)
    return `Perda ${e.perda}${atividade ? ` · ${atividade}` : ''}`
  }
  if (e.tipoEvento === 'intestinal') {
    return labelEscalaFezes(e.fezesEscala)
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
      <p className="text-sm text-center py-4" style={{ color: colors.textSecondary }}>
        {mensagemVazia || 'Nenhum registro ainda.'}
      </p>
    )
  }

  return (
    <>
      <ol className="relative">
        {entradas.map((e, i) => {
          const { Icone, cor, titulo } = VISUAL_TIPO[e.tipoEvento] || VISUAL_TIPO.liquido
          return (
            <li key={e.id} className="relative flex items-start gap-3 pb-4 last:pb-0">
              {/* fio da linha do tempo ligando um registro ao proximo */}
              {i < entradas.length - 1 && (
                <span aria-hidden="true" className="absolute left-[4.75rem] top-8 bottom-0 w-px" style={{ background: colors.border }} />
              )}
              <time className="w-12 pt-1.5 text-sm font-semibold tabular-nums text-right shrink-0" style={{ color: colors.secondary }}>
                {formatarHora(e.registradoEm)}
              </time>
              <span className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center" style={{ background: cor }}>
                <Icone size={16} color="#fff" strokeWidth={2.25} aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-medium" style={{ color: colors.text }}>{titulo}</p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>{descreverEntrada(e)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to={`/app/diario/entrada/${e.id}/editar`}
                  aria-label={`Editar registro das ${formatarHora(e.registradoEm)}`}
                  title="Editar"
                  className="w-9 h-9 rounded-full flex items-center justify-center focus-visible:outline-2"
                  style={{ color: colors.secondary, outlineColor: colors.primary }}
                >
                  <Pencil size={16} aria-hidden="true" />
                </Link>
                <button
                  onClick={() => setEntradaParaExcluir(e)}
                  aria-label={`Excluir registro das ${formatarHora(e.registradoEm)}`}
                  title="Excluir"
                  className="w-9 h-9 rounded-full flex items-center justify-center focus-visible:outline-2"
                  style={{ color: colors.danger, outlineColor: colors.primary }}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </li>
          )
        })}
      </ol>

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
