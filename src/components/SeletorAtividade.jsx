import { colors } from '../theme'
import { ATIVIDADES_PERDA } from '../data/atividadesPerda'

export default function SeletorAtividade({ categoria, detalhe, onChangeCategoria, onChangeDetalhe }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {ATIVIDADES_PERDA.map(({ valor, label }) => {
          const selecionado = categoria === valor
          return (
            <button
              key={valor}
              type="button"
              onClick={() => onChangeCategoria(valor)}
              className="px-3 py-1.5 rounded-full text-sm border"
              style={{
                borderColor: selecionado ? colors.primary : colors.border,
                background: selecionado ? colors.primary : colors.surface,
                color: selecionado ? '#fff' : colors.text,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
      {categoria === 'outro' && (
        <input
          type="text"
          placeholder="Qual atividade?"
          value={detalhe || ''}
          onChange={(e) => onChangeDetalhe(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />
      )}
    </div>
  )
}
