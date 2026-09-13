// Gatilhos comuns de perda involuntaria de urina, usados no registro do tipo "perda".
export const ATIVIDADES_PERDA = [
  { valor: 'tosse', label: 'Tosse' },
  { valor: 'espirro', label: 'Espirro' },
  { valor: 'ao_se_levantar', label: 'Ao se levantar' },
  { valor: 'ao_se_sentar', label: 'Ao se sentar' },
  { valor: 'andando', label: 'Andando' },
  { valor: 'outro', label: 'Outro' },
]

export function labelAtividadePerda(categoria, detalhe) {
  if (!categoria) return null
  if (categoria === 'outro') return detalhe || 'Outro'
  return ATIVIDADES_PERDA.find((a) => a.valor === categoria)?.label || categoria
}
