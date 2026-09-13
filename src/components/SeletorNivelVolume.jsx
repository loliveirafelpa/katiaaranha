import { colors } from '../theme'

const NIVEIS = [
  { valor: 'baixo', label: 'Baixo' },
  { valor: 'medio', label: 'Médio' },
  { valor: 'alto', label: 'Alto' },
]

export default function SeletorNivelVolume({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {NIVEIS.map((op) => {
        const selecionado = value === op.valor
        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onChange(selecionado ? '' : op.valor)}
            className="px-3 py-1.5 rounded-full text-sm border font-medium"
            style={{
              borderColor: selecionado ? colors.secondary : colors.border,
              background: selecionado ? colors.secondary : colors.surface,
              color: selecionado ? '#fff' : colors.text,
            }}
          >
            {op.label}
          </button>
        )
      })}
    </div>
  )
}
