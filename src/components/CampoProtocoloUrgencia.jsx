import { colors } from '../theme'

// Usado no cadastro e na edicao do paciente (admin).
export default function CampoProtocoloUrgencia({ value, onChange }) {
  return (
    <label
      className="flex items-start gap-3 rounded-xl p-3 cursor-pointer"
      style={{ border: `1px solid ${value ? colors.primary : colors.border}` }}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 mt-0.5"
        style={{ accentColor: colors.primary }}
      />
      <span>
        <span className="block text-sm font-medium">Ativar protocolo de urgência</span>
        <span className="block text-xs mt-0.5" style={{ color: colors.textSecondary }}>
          No registro de xixi, o paciente passa a informar o peso inicial da fralda, o peso após a
          troca, e marca cada troca de fralda (o total do dia é somado automaticamente).
        </span>
      </span>
    </label>
  )
}
