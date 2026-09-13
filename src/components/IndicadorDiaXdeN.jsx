import { colors } from '../theme'

export default function IndicadorDiaXdeN({ diaAtual, duracaoDias }) {
  const percentual = Math.min(100, Math.max(0, (diaAtual / duracaoDias) * 100))
  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-sm" style={{ color: colors.textSecondary }}>
        <span>Dia {diaAtual} de {duracaoDias}</span>
        <span>{Math.round(percentual)}%</span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ background: colors.border }}>
        <div className="h-2 rounded-full" style={{ width: `${percentual}%`, background: colors.primary }} />
      </div>
    </div>
  )
}
