import { colors } from '../theme'

export default function IndicadorDiaXdeN({ diaAtual }) {
  return (
    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
      Dia {diaAtual} do seu diário
    </p>
  )
}
