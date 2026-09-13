import { colors } from '../theme'
import { CATEGORIAS_ATIVIDADE } from '../lib/indicadoresCalculo'

const LABELS = {
  trabalho: 'Trabalho',
  estudos: 'Estudos',
  caminhada: 'Caminhada',
  academia: 'Academia',
  domesticas: 'Domésticas',
  social: 'Social',
  compras: 'Compras',
  lazer: 'Lazer',
  descanso: 'Descanso',
  outros: 'Outros',
}

export default function SeletorAtividade({ categoria, detalhe, onChangeCategoria, onChangeDetalhe }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {CATEGORIAS_ATIVIDADE.map((valor) => {
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
              {LABELS[valor]}
            </button>
          )
        })}
      </div>
      <input
        type="text"
        placeholder="Detalhe (ex: tosse, espirro)... opcional"
        value={detalhe || ''}
        onChange={(e) => onChangeDetalhe(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: colors.border }}
      />
    </div>
  )
}
