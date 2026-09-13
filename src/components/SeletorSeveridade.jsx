import { colors } from '../theme'

const NIVEIS = [
  { valor: 'pequena', label: 'Pequena', cor: colors.success },
  { valor: 'moderada', label: 'Moderada', cor: colors.warning },
  { valor: 'intensa', label: 'Intensa', cor: colors.danger },
]

export default function SeletorSeveridade({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {NIVEIS.map((op) => {
        const selecionado = value === op.valor
        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onChange(op.valor)}
            className="px-3 py-1.5 rounded-full text-sm border font-medium"
            style={{
              borderColor: selecionado ? op.cor : colors.border,
              background: selecionado ? op.cor : colors.surface,
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
