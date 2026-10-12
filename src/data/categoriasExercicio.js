// "outro": a Dra. Katia digita a origem do exercicio (categoriaOutro).
export const CATEGORIAS_EXERCICIO = [
  { valor: 'assoalho_pelvico', label: 'Assoalho pélvico' },
  { valor: 'pilates', label: 'Pilates' },
  { valor: 'outro', label: 'Outro' },
]

export const LABEL_CATEGORIA_EXERCICIO = Object.fromEntries(CATEGORIAS_EXERCICIO.map((c) => [c.valor, c.label]))

export function labelCategoriaExercicio(ex) {
  if (!ex) return ''
  if (ex.categoria === 'outro') return ex.categoriaOutro || 'Outro'
  return LABEL_CATEGORIA_EXERCICIO[ex.categoria] || ex.categoria
}

// Agrupa exercicios por categoria pra exibir em secoes: as fixas primeiro, depois uma
// secao para cada origem digitada em "outro" (em ordem alfabetica).
export function agruparExerciciosPorCategoria(exercicios) {
  const grupos = new Map()
  for (const c of CATEGORIAS_EXERCICIO) if (c.valor !== 'outro') grupos.set(c.valor, { chave: c.valor, label: c.label, itens: [] })
  const outros = new Map()
  for (const ex of exercicios) {
    if (ex.categoria === 'outro') {
      const label = (ex.categoriaOutro || 'Outro').trim()
      const chave = `outro:${label.toLowerCase()}`
      if (!outros.has(chave)) outros.set(chave, { chave, label, itens: [] })
      outros.get(chave).itens.push(ex)
    } else {
      grupos.get(ex.categoria)?.itens.push(ex)
    }
  }
  const outrosOrdenados = [...outros.values()].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
  return [...grupos.values(), ...outrosOrdenados].filter((g) => g.itens.length > 0)
}

// Texto da dose prescrita, ex.: "3x por semana · 3 séries de 10 repetições"
export function formatarDose({ vezesPorSemana, series, repeticoes }) {
  const partes = [`${vezesPorSemana}x por semana`]
  if (series && repeticoes) partes.push(`${series} ${series === 1 ? 'série' : 'séries'} de ${repeticoes}`)
  else if (series) partes.push(`${series} ${series === 1 ? 'série' : 'séries'}`)
  else if (repeticoes) partes.push(repeticoes)
  return partes.join(' · ')
}

export function formatarPeriodo(dataInicio, dataFim) {
  const f = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${f(dataInicio)} a ${f(dataFim)}`
}
