import { colors } from '../theme'

const OPCOES = [
  { valor: true, label: 'Sim' },
  { valor: false, label: 'Não' },
]

// Sim/Não opcional: tocar de novo na opção marcada volta pra "não respondido" (null).
export default function SeletorSimNao({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPCOES.map((op) => {
        const selecionado = value === op.valor
        return (
          <button
            key={op.label}
            type="button"
            onClick={() => onChange(selecionado ? null : op.valor)}
            className="px-4 py-1.5 rounded-full text-sm border font-medium"
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
