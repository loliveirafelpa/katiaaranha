import { colors } from '../theme'

const LABEL_LIQUIDO = {
  agua: 'Água', cafe: 'Café', cha: 'Chá', suco: 'Suco',
  refrigerante: 'Refrigerante', alcool: 'Álcool', outro: 'Outro',
}

function formatarHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
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
            <th className="px-3 py-2 text-left">Líquido</th>
            <th className="px-3 py-2 text-left">Volume urinado</th>
            <th className="px-3 py-2 text-left">Urgência</th>
            <th className="px-3 py-2 text-left">Perda</th>
            <th className="px-3 py-2 text-left">Atividade</th>
          </tr>
        </thead>
        <tbody>
          {entradas.map((e) => (
            <tr key={e.id} className="border-b" style={{ borderColor: colors.border }}>
              <td className="px-3 py-2 whitespace-nowrap">{formatarHora(e.registradoEm)}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                {e.liquidoMl} ml de {e.liquidoTipo === 'outro' ? (e.liquidoTipoOutro || 'outro') : LABEL_LIQUIDO[e.liquidoTipo]}
              </td>
              <td className="px-3 py-2">{e.volumeUrinadoMl != null ? `${e.volumeUrinadoMl} ml` : '—'}</td>
              <td className="px-3 py-2 capitalize">{e.urgencia || '—'}</td>
              <td className="px-3 py-2 capitalize">{e.perda === 'sem_perda' ? 'Sem perda' : e.perda}</td>
              <td className="px-3 py-2">
                {e.perda !== 'sem_perda'
                  ? [e.perdaAtividadeCategoria, e.perdaAtividadeDetalhe].filter(Boolean).join(' — ') || '—'
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
