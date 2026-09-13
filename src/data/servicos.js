// Servicos oferecidos pela CPA Fisioterapia, usados no cadastro do paciente.
export const SERVICOS = [
  { valor: 'gestacional', label: 'Fisioterapia gestacional' },
  { valor: 'assoalho_pelvico', label: 'Assoalho pélvico' },
  { valor: 'pos_cirurgico', label: 'Pós-cirúrgico' },
  { valor: 'drenagem_linfatica', label: 'Drenagem linfática' },
  { valor: 'rpg', label: 'RPG' },
  { valor: 'pilates', label: 'Pilates clínico/terapêutico' },
  { valor: 'yoga', label: 'Yoga terapêutica' },
  { valor: 'outro', label: 'Outro' },
]

export function labelServico(perfil) {
  if (!perfil?.servico) return null
  if (perfil.servico === 'outro') return perfil.servicoOutro || 'Outro'
  return SERVICOS.find((s) => s.valor === perfil.servico)?.label || perfil.servico
}
