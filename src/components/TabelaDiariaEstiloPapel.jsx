import { colors } from '../theme'
import { labelAtividadePerda } from '../data/atividadesPerda'

const LABEL_LIQUIDO = {
  agua: 'Água', cafe: 'Café', cha: 'Chá', suco: 'Suco',
  refrigerante: 'Refrigerante', alcool: 'Álcool', outro: 'Outro',
}

const LABEL_NIVEL = { baixo: 'baixo', medio: 'médio', alto: 'alto' }

const LABEL_TIPO = {
  liquido: 'Líquido ingerido',
  urinario: 'Foi ao banheiro',
  perda: 'Perda de urina',
}

const ORDEM_TIPO = { liquido: 0, urinario: 1, perda: 2 }

const COR_TIPO = {
  liquido: colors.secondary,
  urinario: colors.primary,
  perda: colors.danger,
}

function formatarHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function formatarSoHora(iso) {
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
  return '—'
}

function porHorario(a, b) {
  return new Date(a.registradoEm) - new Date(b.registradoEm)
}

function porTipo(a, b) {
  return ORDEM_TIPO[a.tipoEvento] - ORDEM_TIPO[b.tipoEvento] || porHorario(a, b)
}

function agruparPorDia(entradas) {
  const grupos = new Map()
  for (const e of entradas) {
    if (!grupos.has(e.diaNumero)) grupos.set(e.diaNumero, [])
    grupos.get(e.diaNumero).push(e)
  }
  return [...grupos.entries()].sort(([a], [b]) => a - b)
}

function LinhaDoTempo({ entradas }) {
  const ordenado = [...entradas].sort(porHorario)
  return (
    <div className="px-4 py-3 border-t" style={{ borderColor: colors.border }}>
      <p className="text-xs font-medium mb-3" style={{ color: colors.textSecondary }}>Linha do tempo</p>
      <div className="overflow-x-auto">
        <div className="relative flex" style={{ minWidth: `${ordenado.length * 84}px` }}>
          <div className="absolute left-0 right-0 top-[7px] h-px" style={{ background: colors.border }} />
          {ordenado.map((e) => (
            <div key={e.id} className="flex-1 flex flex-col items-center text-center px-1">
              <span
                className="w-3.5 h-3.5 rounded-full border-2 relative"
                style={{ background: colors.surface, borderColor: COR_TIPO[e.tipoEvento] }}
              />
              <span className="text-xs font-medium mt-1.5 whitespace-nowrap" style={{ color: COR_TIPO[e.tipoEvento] }}>
                {formatarSoHora(e.registradoEm)}
              </span>
              <span className="text-[11px] whitespace-nowrap" style={{ color: colors.textSecondary }}>
                {LABEL_TIPO[e.tipoEvento] || e.tipoEvento}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ordenacao: 'horario' (cronologico, padrao) ou 'tipo' (agrupa liquido/banheiro/perda).
// A linha do tempo ao final de cada dia e sempre cronologica, independente da ordenacao
// escolhida pra tabela - ela existe justamente pra dar uma visao de sequencia dos fatos.
export default function TabelaDiariaEstiloPapel({ entradas, ordenacao = 'horario' }) {
  if (entradas.length === 0) {
    return <p style={{ color: colors.textSecondary }}>Nenhum registro ainda.</p>
  }

  const grupos = agruparPorDia(entradas)
  const comparador = ordenacao === 'tipo' ? porTipo : porHorario

  return (
    <div className="space-y-4">
      {grupos.map(([diaNumero, doDia]) => (
        <div key={diaNumero} className="rounded-xl overflow-hidden border" style={{ borderColor: colors.border, background: colors.surface }}>
          <div className="px-3 py-2 text-sm font-medium" style={{ background: colors.background, color: colors.secondary }}>
            Dia {diaNumero}
          </div>
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
                {[...doDia].sort(comparador).map((e) => (
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
          <LinhaDoTempo entradas={doDia} />
        </div>
      ))}
    </div>
  )
}
