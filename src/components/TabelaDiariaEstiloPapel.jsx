import { colors } from '../theme'

const LABEL_LIQUIDO = {
  agua: 'Água', cafe: 'Café', cha: 'Chá', suco: 'Suco',
  refrigerante: 'Refrigerante', alcool: 'Álcool', outro: 'Outro',
}

const LABEL_TIPO = {
  liquido: 'Líquido ingerido',
  urinario: 'Foi ao banheiro',
  perda: 'Perda de urina',
}

const COR_TIPO = {
  liquido: colors.secondary,
  urinario: colors.primary,
  perda: colors.danger,
}

function formatarHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function descreverEntrada(e) {
  if (e.tipoEvento === 'liquido') {
    return `${e.liquidoMl} ml de ${e.liquidoTipo === 'outro' ? (e.liquidoTipoOutro || 'outro') : LABEL_LIQUIDO[e.liquidoTipo]}`
  }
  if (e.tipoEvento === 'urinario') {
    return `${e.volumeUrinadoMl} ml${e.urgencia ? ` · urgência ${e.urgencia}` : ''}`
  }
  if (e.tipoEvento === 'perda') {
    const atividade = [e.perdaAtividadeCategoria, e.perdaAtividadeDetalhe].filter(Boolean).join(' — ')
    return `Perda ${e.perda}${atividade ? ` · ${atividade}` : ''}`
  }
  return '—'
}

export default function TabelaDiariaEstiloPapel({ entradas }) {
  if (entradas.length === 0) {
    return <p style={{ color: colors.textSecondary }}>Nenhum registro ainda.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: colors.secondary, color: '#fff' }}>
            <th className="px-3 py-2 text-left">Horário</th>
            <th className="px-3 py-2 text-left">Tipo</th>
            <th className="px-3 py-2 text-left">Detalhe</th>
          </tr>
        </thead>
        <tbody>
          {entradas.map((e) => (
            <tr key={e.id} className="border-b" style={{ borderColor: colors.border }}>
              <td className="px-3 py-2 whitespace-nowrap">{formatarHora(e.registradoEm)}</td>
              <td className="px-3 py-2 whitespace-nowrap font-medium" style={{ color: COR_TIPO[e.tipoEvento] }}>
                {LABEL_TIPO[e.tipoEvento] || e.tipoEvento}
              </td>
              <td className="px-3 py-2">{descreverEntrada(e)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
