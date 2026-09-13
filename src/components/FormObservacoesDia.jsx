import { colors } from '../theme'

export default function FormObservacoesDia({ valor, onChange }) {
  function set(campo, v) {
    onChange({ ...valor, [campo]: v })
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
        <textarea
          rows={3}
          value={valor.outrosSintomas || ''}
          onChange={(e) => set('outrosSintomas', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />
      </fieldset>
    </div>
  )
}
