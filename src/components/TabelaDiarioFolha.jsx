import { labelAtividadePerda } from '../data/atividadesPerda'
import { LABEL_LIQUIDO } from './TabelaDiariaEstiloPapel'
import LogoCpa from './brand/LogoCpa'
import { colors } from '../theme'

// Reproducao da folha impressa do Diario Miccional da CPA (uma folha por dia), pra Dra.
// Katia ler os registros no mesmo formato que ja usa no consultorio. Diferente do papel
// (que comeca as 06h00), aqui o dia vai de 00h00 a 23h59 - o mesmo dia de calendario
// em que o registro foi feito, igual ao resto do app.

const FAIXAS = Array.from({ length: 24 }, (_, i) => i)
const SEVERIDADES = [
  { valor: 'pequena', sigla: 'P', label: 'pequena' },
  { valor: 'moderada', sigla: 'M', label: 'moderada' },
  { valor: 'intensa', sigla: 'I', label: 'intensa' },
]

function hh(h) {
  return `${String(h).padStart(2, '0')}h00`
}

function dataDoDia(ciclo, diaNumero) {
  const data = new Date(`${ciclo.dataInicio}T00:00:00`)
  data.setDate(data.getDate() + diaNumero - 1)
  return data.toLocaleDateString('pt-BR')
}

function descreverLiquido(e) {
  const tipo = e.liquidoTipo === 'outro' ? (e.liquidoTipoOutro || 'outro') : LABEL_LIQUIDO[e.liquidoTipo]
  return `${e.liquidoMl} ml de ${tipo?.toLowerCase()}`
}

function descreverVolume(e) {
  return e.volumeUrinadoMl != null ? `${e.volumeUrinadoMl} ml` : 'xixi'
}

// Quantas vezes cada severidade apareceu na faixa: 1 vira "X", mais de uma vira "2X" etc.
function marcacao(entradas, campo, valor) {
  const n = entradas.filter((e) => e[campo] === valor).length
  if (n === 0) return ''
  return n === 1 ? 'X' : `${n}X`
}

// Coco nao tem coluna na folha impressa, entao fica de fora desta visualizacao.
function montarFolhas(entradas) {
  const folhas = new Map()
  for (const e of entradas) {
    if (e.tipoEvento === 'intestinal') continue
    const dia = e.diaNumero
    if (!folhas.has(dia)) folhas.set(dia, new Map())
    const hora = new Date(e.registradoEm).getHours()
    const faixas = folhas.get(dia)
    if (!faixas.has(hora)) faixas.set(hora, [])
    faixas.get(hora).push(e)
  }
  return [...folhas.entries()].sort(([a], [b]) => a - b)
}

const bordaLaranja = `1px solid ${colors.primaryLight}`

// separador: linha a esquerda, entre os grupos "necessidade de urinar" e "perda".
function CaixaMarcacao({ valor, separador = false }) {
  return (
    <td className="px-1 py-1 text-center" style={{ borderBottom: bordaLaranja, borderLeft: separador ? bordaLaranja : undefined }}>
      <span
        className="inline-flex items-center justify-center w-7 h-5 rounded text-xs font-bold"
        style={{ border: `1px solid ${colors.border}`, color: colors.primary }}
      >
        {valor}
      </span>
    </td>
  )
}

function Folha({ ciclo, diaNumero, faixas }) {
  const th = 'px-2 py-2 text-xs font-medium text-center leading-tight'
  const celula = 'px-2 py-1 align-middle'
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: colors.border, background: colors.surface }}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <LogoCpa height={32} />
        <div className="text-center">
          <p className="text-lg font-semibold" style={{ color: colors.secondary }}>Dia {diaNumero}</p>
          <div className="mx-auto mt-0.5 h-px w-16" style={{ background: colors.primary }} />
        </div>
        <p className="text-sm" style={{ color: colors.text }}>
          Data: <span className="font-medium">{dataDoDia(ciclo, diaNumero)}</span>
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse" style={{ minWidth: 760 }}>
          <thead>
            <tr style={{ color: '#fff' }}>
              <th rowSpan={2} className={`${th} rounded-tl-lg`} style={{ background: colors.secondary }}>Horário</th>
              <th rowSpan={2} className={th} style={{ background: colors.secondary }}>Quantidade e tipo<br />de líquido ingerido</th>
              <th rowSpan={2} className={th} style={{ background: colors.primary }}>Volume<br />urinado (ml)</th>
              <th colSpan={3} className={th} style={{ background: colors.surface, color: colors.secondary }}>Necessidade<br />de urinar</th>
              <th colSpan={3} className={th} style={{ background: colors.surface, color: colors.secondary, borderLeft: bordaLaranja }}>Perda involuntária<br />de urina</th>
              <th rowSpan={2} className={`${th} rounded-tr-lg`} style={{ background: colors.primary }}>
                Atividade na ocasião<br />
                <span className="font-normal">(exemplo: tosse, espirro,<br />exercícios físicos)</span>
              </th>
            </tr>
            <tr>
              {[0, 1].flatMap((grupo) =>
                SEVERIDADES.map((s, i) => (
                  <th key={`${grupo}-${s.valor}`} className="px-1 pb-1 text-center" style={{ background: colors.surface, borderLeft: grupo === 1 && i === 0 ? bordaLaranja : undefined }}>
                    <span className="inline-block w-6 rounded text-xs font-bold" style={{ border: `1px solid ${colors.secondary}`, color: colors.secondary }}>
                      {s.sigla}
                    </span>
                    <span className="block text-[10px] font-normal" style={{ color: colors.textSecondary }}>{s.label}</span>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {FAIXAS.map((hora) => {
              const doHorario = faixas.get(hora) || []
              const liquidos = doHorario.filter((e) => e.tipoEvento === 'liquido')
              const xixis = doHorario.filter((e) => e.tipoEvento === 'urinario')
              const perdas = doHorario.filter((e) => e.tipoEvento === 'perda')
              const atividades = perdas
                .map((e) => labelAtividadePerda(e.perdaAtividadeCategoria, e.perdaAtividadeDetalhe))
                .filter(Boolean)
              return (
                <tr key={hora}>
                  <td className={`${celula} whitespace-nowrap text-xs font-medium`} style={{ borderBottom: bordaLaranja, color: colors.secondary }}>
                    {hh(hora)} - {hh((hora + 1) % 24)}
                  </td>
                  <td className={celula} style={{ borderBottom: bordaLaranja, borderLeft: bordaLaranja }}>
                    {liquidos.map(descreverLiquido).join('; ')}
                  </td>
                  <td className={`${celula} font-medium`} style={{ borderBottom: bordaLaranja, borderLeft: bordaLaranja, borderRight: bordaLaranja }}>
                    {xixis.map(descreverVolume).join(' + ')}
                  </td>
                  {SEVERIDADES.map((s) => <CaixaMarcacao key={`u-${s.valor}`} valor={marcacao(xixis, 'urgencia', s.valor)} />)}
                  {SEVERIDADES.map((s, i) => <CaixaMarcacao key={`p-${s.valor}`} valor={marcacao(perdas, 'perda', s.valor)} separador={i === 0} />)}
                  <td className={celula} style={{ borderBottom: bordaLaranja, borderLeft: bordaLaranja }}>
                    {atividades.join('; ')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function TabelaDiarioFolha({ ciclo, entradas }) {
  const folhas = montarFolhas(entradas)
  if (folhas.length === 0) {
    return <p style={{ color: colors.textSecondary }}>Nenhum registro ainda.</p>
  }
  return (
    <div className="space-y-6">
      {folhas.map(([diaNumero, faixas]) => (
        <Folha key={diaNumero} ciclo={ciclo} diaNumero={diaNumero} faixas={faixas} />
      ))}
    </div>
  )
}
