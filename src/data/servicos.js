// Servicos oferecidos pela CPA Fisioterapia, usados no cadastro do paciente.
// So os itens sem `legado` aparecem no cadastro; os legados ficam aqui apenas
// para continuar exibindo o nome certo em pacientes cadastrados antes da mudanca.
export const SERVICOS = [
  { valor: 'gestacional', label: 'Gestante' },
  { valor: 'pos_parto', label: 'Pós parto' },
  { valor: 'incontinencia_urinaria', label: 'Incontinência Urinária' },
  { valor: 'pos_cirurgico', label: 'Pós operatório' },
  { valor: 'pilates', label: 'Pilates' },
  { valor: 'assoalho_pelvico', label: 'Assoalho pélvico', legado: true },
  { valor: 'drenagem_linfatica', label: 'Drenagem linfática', legado: true },
  { valor: 'rpg', label: 'RPG', legado: true },
  { valor: 'yoga', label: 'Yoga terapêutica', legado: true },
  { valor: 'outro', label: 'Outro', legado: true },
]

export const SERVICOS_CADASTRO = SERVICOS.filter((s) => !s.legado)

export function labelServico(perfil) {
  if (!perfil?.servico) return null
  if (perfil.servico === 'outro') return perfil.servicoOutro || 'Outro'
  return SERVICOS.find((s) => s.valor === perfil.servico)?.label || perfil.servico
}
