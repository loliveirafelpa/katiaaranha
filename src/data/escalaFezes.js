// Escala de Bristol - classificacao clinica padrao (1 a 7) da consistencia das fezes,
// tambem usada na avaliacao fisioterapeutica do assoalho pelvico.
export const ESCALA_FEZES = [
  { valor: 1, label: 'Tipo 1', descricao: 'Bolinhas duras e separadas, como nozes' },
  { valor: 2, label: 'Tipo 2', descricao: 'Em formato de salsicha, mas granulada' },
  { valor: 3, label: 'Tipo 3', descricao: 'Como salsicha, mas com rachaduras na superfície' },
  { valor: 4, label: 'Tipo 4', descricao: 'Como salsicha, lisa e macia' },
  { valor: 5, label: 'Tipo 5', descricao: 'Pedaços macios e com bordas bem definidas, porém separados' },
  { valor: 6, label: 'Tipo 6', descricao: 'Pedaços fofos com bordas irregulares, pastosa' },
  { valor: 7, label: 'Tipo 7', descricao: 'Aquosa, sem pedaços sólidos, totalmente líquida' },
]

export function labelEscalaFezes(valor) {
  const item = ESCALA_FEZES.find((e) => e.valor === valor)
  return item ? `${item.label} · ${item.descricao}` : null
}
