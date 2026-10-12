import { useEffect, useState } from 'react'
import { listarEntradasPorCiclo } from '../lib/entradasDiarioApi'
import { calcularIndicadoresCiclo, variacaoPercentual } from '../lib/comparativosCalculo'
import ComentariosGrafico from './ComentariosGrafico'
import { colors } from '../theme'

// melhor: 'menor' | 'maior' | null (null = sem direcao clinica, ex.: liquido ingerido)
const INDICADORES = [
  { chave: 'perdasDia', label: 'Perdas de urina por dia', melhor: 'menor' },
  { chave: 'urgenciasDia', label: 'Urgências por dia', melhor: 'menor' },
  { chave: 'miccoesDia', label: 'Idas ao banheiro (xixi) por dia', melhor: 'menor' },
  { chave: 'nocturiaNoite', label: 'Xixi à noite (23h–6h) por noite', melhor: 'menor' },
  { chave: 'volumeMedioMiccaoMl', label: 'Volume médio por xixi', unidade: ' ml', melhor: 'maior' },
  { chave: 'liquidoDiaMl', label: 'Líquido ingerido por dia', unidade: ' ml', melhor: null },
  { chave: 'esvaziamentoIncompletoPct', label: 'Xixis sem esvaziar a bexiga', unidade: '%', melhor: 'menor' },
  { chave: 'gotejamentoPct', label: 'Xixis com gotejamento ao levantar', unidade: '%', melhor: 'menor' },
  // Protocolo de urgencia: so aparecem quando algum ciclo comparado tem esses dados
  { chave: 'urinaFraldaDiaG', label: 'Urina na fralda por dia', unidade: ' g', melhor: 'menor', protocolo: true },
  { chave: 'trocasFraldaDia', label: 'Trocas de fralda por dia', melhor: 'menor', protocolo: true },
]
const INDICADORES_DESTAQUE = INDICADORES.slice(0, 4)

const SEVERIDADES = [
  { chave: 'pequena', label: 'Leve', cor: colors.success },
  { chave: 'moderada', label: 'Moderada', cor: colors.warning },
  { chave: 'intensa', label: 'Intensa', cor: colors.danger },
]

function formatar(valor, unidade = '') {
  if (valor == null) return '—'
  const casas = unidade === ' ml' || unidade === ' g' || unidade === '%' ? 0 : 1
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: casas, minimumFractionDigits: casas })}${unidade}`
}

function dataCurta(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// Avalia a variacao do primeiro pro ultimo ciclo: seta + texto (nunca so cor).
function avaliarVariacao(indicador, inicial, final) {
  if (inicial == null || final == null) return { texto: '—', cor: colors.textSecondary }
  const pct = variacaoPercentual(inicial, final)
  if (inicial === final || (pct != null && Math.abs(pct) < 0.5)) {
    return { texto: 'sem mudança', cor: colors.textSecondary }
  }
  // Partindo de zero nao existe percentual (ex.: 0 perdas -> 1 perda/dia).
  const texto = pct == null ? '▲ passou a ocorrer' : `${pct < 0 ? '▼' : '▲'} ${Math.abs(pct).toFixed(0)}%`
  if (!indicador.melhor) return { texto, cor: colors.textSecondary }
  const subiu = final > inicial
  const melhorou = indicador.melhor === 'menor' ? !subiu : subiu
  return { texto, cor: melhorou ? colors.success : colors.danger, rotulo: melhorou ? 'melhorou' : 'piorou' }
}

// comentario: chave do grafico pros comentarios internos da Dra. Katia (sem ciclo,
// porque a comparacao olha varios ciclos ao mesmo tempo).
function Secao({ titulo, subtitulo, comentario, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
      <h3 className="font-medium" style={{ color: colors.secondary }}>{titulo}</h3>
      {subtitulo && <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{subtitulo}</p>}
      <div className="mt-3">{children}</div>
      {comentario && <ComentariosGrafico grafico={`comparativos:${comentario}`} />}
    </div>
  )
}

function CardEvolucao({ indicador, inicial, final }) {
  const variacao = avaliarVariacao(indicador, inicial, final)
  return (
    <div
      className="rounded-xl p-4 border-t-4"
      style={{ background: colors.surface, borderColor: colors.border, borderTopColor: colors.primary }}
    >
      <p className="text-xs" style={{ color: colors.textSecondary }}>{indicador.label}</p>
      <p className="text-2xl font-semibold mt-1" style={{ color: colors.secondary }}>
        {formatar(inicial, indicador.unidade)} <span style={{ color: colors.textSecondary }}>→</span> {formatar(final, indicador.unidade)}
      </p>
      <p className="text-sm font-semibold mt-1" style={{ color: variacao.cor }}>
        {variacao.texto}{variacao.rotulo ? ` · ${variacao.rotulo}` : ''}
      </p>
    </div>
  )
}

// Linha simples (uma serie, um eixo) com um ponto por ciclo, com o valor escrito em
// cada ponto (a Dra. Katia le na consulta, sem precisar passar o mouse).
function MiniLinha({ indicador, pontos }) {
  const largura = 320
  const altura = 150
  const margem = { topo: 22, base: 26, esq: 14, dir: 14 }
  const valores = pontos.map((p) => p.valor ?? 0)
  const maximo = Math.max(...valores, 0) * 1.15 || 1
  const x = (i) => margem.esq + (pontos.length === 1 ? 0 : (i * (largura - margem.esq - margem.dir)) / (pontos.length - 1))
  const y = (v) => altura - margem.base - ((v ?? 0) / maximo) * (altura - margem.topo - margem.base)
  // Ciclo sem o dado (ex.: sem protocolo de urgencia) nao vira ponto no zero: fica sem
  // marcador e a linha recomeca no proximo ciclo que tem valor.
  const caminho = pontos
    .map((p, i) => (p.valor == null ? null : `${i === 0 || pontos[i - 1].valor == null ? 'M' : 'L'}${x(i)},${y(p.valor)}`))
    .filter(Boolean)
    .join(' ')

  return (
    <div>
      <p className="text-sm font-medium mb-1" style={{ color: colors.text }}>{indicador.label}</p>
      <svg viewBox={`0 0 ${largura} ${altura}`} className="w-full h-auto" role="img" aria-label={indicador.label}>
        <line x1={margem.esq} x2={largura - margem.dir} y1={altura - margem.base} y2={altura - margem.base} stroke={colors.border} strokeWidth="1" />
        <path d={caminho} fill="none" stroke={colors.primary} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pontos.map((p, i) => {
          const ancora = i === 0 ? 'start' : i === pontos.length - 1 ? 'end' : 'middle'
          return (
            <g key={p.id}>
              {p.valor != null && (
                <>
                  <circle cx={x(i)} cy={y(p.valor)} r="5" fill={colors.primary} stroke={colors.surface} strokeWidth="2" />
                  <text x={x(i)} y={y(p.valor) - 10} textAnchor={ancora} fontSize="12" fontWeight="600" fill={colors.text}>
                    {formatar(p.valor, indicador.unidade)}
                  </text>
                </>
              )}
              <text x={x(i)} y={altura - 8} textAnchor={ancora} fontSize="11" fill={colors.textSecondary}>
                {p.rotulo}
              </text>
              <circle cx={x(i)} cy={y(p.valor)} r="14" fill="transparent">
                <title>{`${p.rotuloCompleto}: ${formatar(p.valor, indicador.unidade)}`}</title>
              </circle>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function LegendaSeveridade() {
  return (
    <div className="flex flex-wrap gap-4 mb-3 text-xs" style={{ color: colors.textSecondary }}>
      {SEVERIDADES.map((s) => (
        <span key={s.chave} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: s.cor }} />
          {s.label}
        </span>
      ))}
    </div>
  )
}

// Barra empilhada leve/moderada/intensa por ciclo, em media por dia - mostra se a
// intensidade mudou, nao so a quantidade.
function BarrasSeveridade({ linhas }) {
  const maximo = Math.max(0.0001, ...linhas.map((l) => SEVERIDADES.reduce((s, sev) => s + l.contagem[sev.chave], 0)))
  return (
    <div>
      <LegendaSeveridade />
      {linhas.map((l) => {
        const total = SEVERIDADES.reduce((s, sev) => s + l.contagem[sev.chave], 0)
        return (
          <div key={l.id} className="flex items-center gap-3 text-sm mb-2">
            <span className="w-24 shrink-0 text-xs" style={{ color: colors.textSecondary }}>{l.rotuloCompleto}</span>
            <div className="flex-1 h-6 flex gap-[2px]">
              {SEVERIDADES.map((sev) => l.contagem[sev.chave] > 0 && (
                <div
                  key={sev.chave}
                  title={`${l.rotuloCompleto} · ${sev.label}: ${formatar(l.contagem[sev.chave])} por dia`}
                  className="h-6 rounded flex items-center justify-center text-[11px] font-semibold text-white"
                  style={{ width: `${(l.contagem[sev.chave] / maximo) * 100}%`, background: sev.cor }}
                >
                  {l.contagem[sev.chave] / maximo > 0.08 ? formatar(l.contagem[sev.chave]) : ''}
                </div>
              ))}
            </div>
            <span className="w-10 text-right text-xs font-medium" style={{ color: colors.text }}>{formatar(total)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function ComparativosCiclos({ ciclos }) {
  // Do mais antigo pro mais recente, numerados como o paciente os viveu.
  const ciclosCronologicos = [...ciclos]
    .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
    .map((c, i) => ({ ...c, numero: i + 1 }))

  const [indicadoresPorCiclo, setIndicadoresPorCiclo] = useState(null)
  const [selecionados, setSelecionados] = useState(() => ciclosCronologicos.map((c) => c.id))
  const [erro, setErro] = useState('')

  const idsCiclos = ciclos.map((c) => c.id).join(',')
  useEffect(() => {
    if (ciclos.length < 2) return
    let ativo = true
    Promise.all(ciclos.map((c) => listarEntradasPorCiclo(c.id).then((entradas) => [c.id, calcularIndicadoresCiclo(entradas)])))
      .then((pares) => { if (ativo) setIndicadoresPorCiclo(Object.fromEntries(pares)) })
      .catch(() => { if (ativo) setErro('Não foi possível carregar os ciclos para comparar.') })
    return () => { ativo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsCiclos])

  if (ciclos.length < 2) {
    return (
      <p style={{ color: colors.textSecondary }}>
        É preciso ao menos 2 ciclos de diário para comparar. Crie um novo ciclo na aba "Ciclos" quando for a hora da reavaliação.
      </p>
    )
  }
  if (erro) return <p style={{ color: colors.danger }}>{erro}</p>
  if (!indicadoresPorCiclo) return <p style={{ color: colors.textSecondary }}>Carregando comparativos...</p>

  function alternar(id) {
    setSelecionados((atual) => {
      if (atual.includes(id)) return atual.length > 2 ? atual.filter((x) => x !== id) : atual
      return [...atual, id]
    })
  }

  const comparados = ciclosCronologicos
    .filter((c) => selecionados.includes(c.id))
    .map((c) => ({
      ...c,
      rotulo: `C${c.numero}`,
      rotuloCompleto: `Ciclo ${c.numero} · ${dataCurta(c.dataInicio)}`,
      ind: indicadoresPorCiclo[c.id],
    }))
  const primeiro = comparados[0]
  const ultimo = comparados[comparados.length - 1]
  const semRegistros = comparados.filter((c) => c.ind.diasRegistrados === 0)
  const indicadoresVisiveis = INDICADORES.filter((ind) => !ind.protocolo || comparados.some((c) => c.ind[ind.chave] != null))
  const indicadoresProtocolo = indicadoresVisiveis.filter((ind) => ind.protocolo)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span style={{ color: colors.textSecondary }}>Comparar:</span>
        {ciclosCronologicos.map((c) => {
          const ativo = selecionados.includes(c.id)
          return (
            <button
              key={c.id}
              onClick={() => alternar(c.id)}
              className="px-3 py-1.5 rounded-full border font-medium"
              style={{
                borderColor: ativo ? colors.primary : colors.border,
                background: ativo ? colors.primary : colors.surface,
                color: ativo ? '#fff' : colors.text,
              }}
            >
              Ciclo {c.numero} · {dataCurta(c.dataInicio)}
            </button>
          )
        })}
      </div>

      <p className="text-sm" style={{ color: colors.textSecondary }}>
        Todos os números são <strong>média por dia registrado</strong>, para os ciclos poderem ser comparados mesmo tendo durações diferentes.
        {semRegistros.length > 0 && ` Atenção: ${semRegistros.map((c) => `Ciclo ${c.numero}`).join(', ')} ainda não tem registros.`}
      </p>

      <div>
        <p className="text-xs font-medium mb-2" style={{ color: colors.textSecondary }}>
          Evolução: {primeiro.rotuloCompleto} → {ultimo.rotuloCompleto}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {INDICADORES_DESTAQUE.map((ind) => (
            <CardEvolucao key={ind.chave} indicador={ind} inicial={primeiro.ind[ind.chave]} final={ultimo.ind[ind.chave]} />
          ))}
        </div>
      </div>

      <Secao comentario="evolucao" titulo="Evolução por ciclo" subtitulo="Média por dia em cada ciclo.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INDICADORES_DESTAQUE.map((ind) => (
            <MiniLinha
              key={ind.chave}
              indicador={ind}
              pontos={comparados.map((c) => ({ id: c.id, rotulo: c.rotulo, rotuloCompleto: c.rotuloCompleto, valor: c.ind[ind.chave] }))}
            />
          ))}
        </div>
      </Secao>

      {indicadoresProtocolo.length > 0 && (
        <Secao comentario="protocolo" titulo="Protocolo de urgência" subtitulo="Média por dia, só nos dias com registro de fralda.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {indicadoresProtocolo.map((ind) => (
              <MiniLinha
                key={ind.chave}
                indicador={ind}
                pontos={comparados.map((c) => ({ id: c.id, rotulo: c.rotulo, rotuloCompleto: c.rotuloCompleto, valor: c.ind[ind.chave] }))}
              />
            ))}
          </div>
        </Secao>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Secao comentario="intensidade-perdas" titulo="Intensidade das perdas" subtitulo="Perdas por dia em cada ciclo, separadas por intensidade.">
          <BarrasSeveridade linhas={comparados.map((c) => ({ id: c.id, rotuloCompleto: c.rotuloCompleto, contagem: c.ind.perdaPorSeveridadeDia }))} />
        </Secao>
        <Secao comentario="intensidade-urgencia" titulo="Intensidade da urgência" subtitulo="Urgências por dia em cada ciclo, separadas por intensidade.">
          <BarrasSeveridade linhas={comparados.map((c) => ({ id: c.id, rotuloCompleto: c.rotuloCompleto, contagem: c.ind.urgenciaPorSeveridadeDia }))} />
        </Secao>
      </div>

      <Secao comentario="resumo" titulo="Resumo dos ciclos">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: colors.secondary, color: '#fff' }}>
                <th className="px-3 py-2 text-left">Indicador</th>
                {comparados.map((c) => (
                  <th key={c.id} className="px-3 py-2 text-right whitespace-nowrap">
                    Ciclo {c.numero}
                    <span className="block text-[11px] font-normal opacity-80">{dataCurta(c.dataInicio)}</span>
                  </th>
                ))}
                <th className="px-3 py-2 text-right whitespace-nowrap">1º → último</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b" style={{ borderColor: colors.border }}>
                <td className="px-3 py-2" style={{ color: colors.textSecondary }}>Dias registrados</td>
                {comparados.map((c) => (
                  <td key={c.id} className="px-3 py-2 text-right" style={{ color: colors.textSecondary }}>{c.ind.diasRegistrados}</td>
                ))}
                <td />
              </tr>
              {indicadoresVisiveis.map((ind) => {
                const variacao = avaliarVariacao(ind, primeiro.ind[ind.chave], ultimo.ind[ind.chave])
                return (
                  <tr key={ind.chave} className="border-b" style={{ borderColor: colors.border }}>
                    <td className="px-3 py-2">{ind.label}</td>
                    {comparados.map((c) => (
                      <td key={c.id} className="px-3 py-2 text-right font-medium">{formatar(c.ind[ind.chave], ind.unidade)}</td>
                    ))}
                    <td className="px-3 py-2 text-right whitespace-nowrap font-semibold" style={{ color: variacao.cor }}>
                      {variacao.texto}{variacao.rotulo ? ` · ${variacao.rotulo}` : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Secao>
    </div>
  )
}
