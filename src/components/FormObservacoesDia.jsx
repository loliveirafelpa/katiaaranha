import { useState } from 'react'
import { colors } from '../theme'

function formatarHorario(iso) {
  return new Date(iso).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function FormObservacoesDia({ valor, onChange }) {
  const [textoNovo, setTextoNovo] = useState('')

  function set(campo, v) {
    onChange({ ...valor, [campo]: v })
  }

  function adicionarSintoma() {
    const texto = textoNovo.trim()
    if (!texto) return
    const lista = valor.outrosSintomas || []
    set('outrosSintomas', [...lista, { texto, horario: new Date().toISOString() }])
    setTextoNovo('')
  }

  function removerSintoma(indice) {
    set('outrosSintomas', (valor.outrosSintomas || []).filter((_, i) => i !== indice))
  }

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="font-medium mb-2">Uso de absorvente</legend>
        <label className="flex items-center gap-2 text-sm mb-2">
          <input type="checkbox" checked={!!valor.absorventeUso} onChange={(e) => set('absorventeUso', e.target.checked)} />
          Usei absorvente hoje
        </label>
        {valor.absorventeUso && (
          <div className="pl-6 space-y-2">
            <div className="flex gap-4 text-sm">
              {['diario', 'noturno', 'outro'].map((tipo) => (
                <label key={tipo} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="absorventeTipo"
                    checked={valor.absorventeTipo === tipo}
                    onChange={() => set('absorventeTipo', tipo)}
                  />
                  {tipo === 'diario' ? 'Diário' : tipo === 'noturno' ? 'Noturno' : 'Outro'}
                </label>
              ))}
            </div>
            {valor.absorventeTipo === 'outro' && (
              <input
                type="text"
                placeholder="Qual tipo?"
                value={valor.absorventeTipoOutro || ''}
                onChange={(e) => set('absorventeTipoOutro', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: colors.border }}
              />
            )}
            <input
              type="number"
              min="0"
              placeholder="Quantidade utilizada no dia"
              value={valor.absorventeQuantidade ?? ''}
              onChange={(e) => set('absorventeQuantidade', e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: colors.border }}
            />
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className="font-medium mb-2">Menstruação</legend>
        <div className="flex gap-4 text-sm mb-2">
          <label className="flex items-center gap-1">
            <input type="radio" name="menstruacao" checked={valor.menstruacao === false} onChange={() => set('menstruacao', false)} />
            Não
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" name="menstruacao" checked={valor.menstruacao === true} onChange={() => set('menstruacao', true)} />
            Sim
          </label>
        </div>
        {valor.menstruacao && (
          <div className="flex gap-2 text-sm">
            <input type="date" value={valor.menstruacaoInicio || ''} onChange={(e) => set('menstruacaoInicio', e.target.value)}
              className="px-3 py-2 rounded-lg border" style={{ borderColor: colors.border }} />
            <input type="date" value={valor.menstruacaoFim || ''} onChange={(e) => set('menstruacaoFim', e.target.value)}
              className="px-3 py-2 rounded-lg border" style={{ borderColor: colors.border }} />
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className="font-medium mb-2">Medicamentos</legend>
        <div className="flex gap-4 text-sm mb-2">
          <label className="flex items-center gap-1">
            <input type="radio" name="medicamentos" checked={valor.medicamentosUso === false} onChange={() => set('medicamentosUso', false)} />
            Não
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" name="medicamentos" checked={valor.medicamentosUso === true} onChange={() => set('medicamentosUso', true)} />
            Sim
          </label>
        </div>
        {valor.medicamentosUso && (
          <input
            type="text"
            placeholder="Quais?"
            value={valor.medicamentosQuais || ''}
            onChange={(e) => set('medicamentosQuais', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: colors.border }}
          />
        )}
      </fieldset>

      <fieldset>
        <legend className="font-medium mb-2">Outros sintomas / observações</legend>
        <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>
          Pode adicionar quantas observações quiser ao longo do dia.
        </p>

        {(valor.outrosSintomas || []).length > 0 && (
          <ul className="space-y-2 mb-3">
            {valor.outrosSintomas.map((item, indice) => (
              <li
                key={`${item.horario}-${indice}`}
                className="flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: colors.border }}
              >
                <div>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>{formatarHorario(item.horario)}</p>
                  <p>{item.texto}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removerSintoma(indice)}
                  className="text-xs underline shrink-0"
                  style={{ color: colors.danger }}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Descreva uma observação"
            value={textoNovo}
            onChange={(e) => setTextoNovo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                adicionarSintoma()
              }
            }}
            className="flex-1 px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: colors.border }}
          />
          <button
            type="button"
            onClick={adicionarSintoma}
            className="px-3 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: colors.primary }}
          >
            Adicionar
          </button>
        </div>
      </fieldset>
    </div>
  )
}
