import { colors } from '../theme'

const CONFIG = {
  nao_iniciado: { label: 'Não iniciado', bg: colors.border, text: colors.textSecondary },
  em_andamento: { label: 'Em andamento', bg: colors.primaryLight, text: '#fff' },
  concluido: { label: 'Concluído', bg: colors.success, text: '#fff' },
}

export default function StatusCicloBadge({ status, diaAtual, duracaoDias }) {
  const cfg = CONFIG[status] || CONFIG.nao_iniciado
  const label = status === 'em_andamento' ? `Dia ${diaAtual} de ${duracaoDias}` : cfg.label
  return (
    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.text }}>
      {label}
    </span>
  )
}
