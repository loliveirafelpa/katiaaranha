import { ESCALA_FEZES } from '../data/escalaFezes'
import IlustracaoEscalaFezes from './IlustracaoEscalaFezes'
import { colors } from '../theme'

export default function SeletorEscalaFezes({ value, onChange }) {
  return (
    <div className="space-y-2">
      {ESCALA_FEZES.map((op) => {
        const selecionado = value === op.valor
        const corFundo = selecionado ? colors.accent : colors.surface
        return (
          <button
            key={op.valor}
            type="button"
            onClick={() => onChange(op.valor)}
            className="w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center gap-3"
            style={{ borderColor: selecionado ? colors.accent : colors.border, background: corFundo }}
          >
            <IlustracaoEscalaFezes tipo={op.valor} cor={selecionado ? '#fff' : colors.text} corFundo={corFundo} />
            <span>
              <span className="font-semibold block" style={{ color: selecionado ? '#fff' : colors.text }}>
                {op.label}
              </span>
              <span style={{ color: selecionado ? '#fff' : colors.textSecondary }}>{op.descricao}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
