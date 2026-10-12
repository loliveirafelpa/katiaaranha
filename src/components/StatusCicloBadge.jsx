import { colors } from '../theme'

const CONFIG = {
  nao_iniciado: { label: 'Não iniciado', bg: colors.border, text: colors.textSecondary },
  aguardando_inicio: { label: 'Aguardando paciente iniciar', bg: colors.border, text: colors.secondary },
  em_andamento: { label: 'Em andamento', bg: colors.primaryLight, text: '#fff' },
}

// numeroCiclo (opcional, usado na lista de pacientes): mostra em qual ciclo o paciente
// esta em vez do dia do ciclo.
export default function StatusCicloBadge({ status, diaAtual, numeroCiclo }) {
  const cfg = CONFIG[status] || CONFIG.nao_iniciado
  let label = status === 'em_andamento' ? `Dia ${diaAtual}` : cfg.label
  if (numeroCiclo !== undefined) {
    if (!numeroCiclo) label = 'Sem ciclo'
    else if (status === 'aguardando_inicio') label = `Ciclo ${numeroCiclo} · aguardando início`
    else if (status === 'nao_iniciado') label = `Ciclo ${numeroCiclo} · ainda não começou`
    else label = `Ciclo ${numeroCiclo}`
  }
  return (
    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.text }}>
      {label}
    </span>
  )
}
