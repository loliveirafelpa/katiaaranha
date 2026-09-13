import { colors } from '../theme'

const ATALHOS = [
  { label: 'Copo (200ml)', ml: 200 },
  { label: 'Garrafa (500ml)', ml: 500 },
  { label: 'Litro (1000ml)', ml: 1000 },
]

export default function AtalhosVolume({ value, onChange, placeholder = 'ml' }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {ATALHOS.map((a) => (
          <button
            key={a.ml}
            type="button"
            onClick={() => onChange(a.ml)}
            className="px-3 py-1.5 rounded-full text-xs border"
            style={{ borderColor: colors.border, color: colors.textSecondary }}
          >
            {a.label}
          </button>
        ))}
      </div>
      <input
        type="number"
        min="0"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: colors.border }}
      />
    </div>
  )
}
