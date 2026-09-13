import { Droplet, Coffee, Leaf, CupSoda, Wine, MoreHorizontal } from 'lucide-react'
import { colors } from '../theme'

const OPCOES = [
  { valor: 'agua', label: 'Água', Icon: Droplet },
  { valor: 'cafe', label: 'Café', Icon: Coffee },
  { valor: 'cha', label: 'Chá', Icon: Leaf },
  { valor: 'suco', label: 'Suco', Icon: CupSoda },
  { valor: 'refrigerante', label: 'Refrigerante', Icon: CupSoda },
  { valor: 'alcool', label: 'Álcool', Icon: Wine },
  { valor: 'outro', label: 'Outro', Icon: MoreHorizontal },
]

export default function ChipSeletorLiquido({ tipo, tipoOutro, onChangeTipo, onChangeTipoOutro }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {OPCOES.map(({ valor, label, Icon }) => {
          const selecionado = tipo === valor
          return (
            <button
              key={valor}
              type="button"
              onClick={() => onChangeTipo(valor)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition"
              style={{
                borderColor: selecionado ? colors.primary : colors.border,
                background: selecionado ? colors.primary : colors.surface,
                color: selecionado ? '#fff' : colors.text,
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          )
        })}
      </div>
      {tipo === 'outro' && (
        <input
          type="text"
          placeholder="Qual líquido?"
          value={tipoOutro || ''}
          onChange={(e) => onChangeTipoOutro(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />
      )}
    </div>
  )
}
