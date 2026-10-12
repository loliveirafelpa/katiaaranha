import { useState } from 'react'
import { iniciarCiclo } from '../lib/ciclosDiarioApi'
import { colors } from '../theme'

function isoLocal(data) {
  const copia = new Date(data)
  copia.setMinutes(copia.getMinutes() - copia.getTimezoneOffset())
  return copia.toISOString().slice(0, 10)
}

// Aparece pro paciente quando a Dra. Katia abre um novo ciclo: e o paciente quem escolhe
// o dia em que vai comecar. O novo inicio precisa ser depois do inicio do ciclo anterior.
export default function IniciarCicloCard({ ciclo, ciclos, onIniciado }) {
  const anterior = ciclos.filter((c) => c.id !== ciclo.id && c.dataInicio).map((c) => c.dataInicio).sort().pop()
  const minimo = anterior ? isoLocal(new Date(new Date(`${anterior}T00:00:00`).getTime() + 86400000)) : undefined
  const hoje = isoLocal(new Date())

  const [dataInicio, setDataInicio] = useState(minimo && minimo > hoje ? minimo : hoje)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!dataInicio) {
      setErro('Escolha o dia de início.')
      return
    }
    setSalvando(true)
    try {
      await iniciarCiclo(ciclo.id, dataInicio)
      onIniciado()
    } catch (err) {
      if (err.message?.includes('ciclo_data_inicio_conflitante')) {
        setErro('Esse dia é anterior ao seu diário anterior. Escolha uma data mais recente.')
      } else {
        setErro('Não foi possível iniciar o diário. Tente novamente.')
      }
      setSalvando(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 space-y-4"
      style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
    >
      <h1 className="text-lg font-semibold" style={{ color: colors.secondary }}>Seu novo diário está pronto</h1>
      <p className="text-sm" style={{ color: colors.textSecondary }}>
        A Dra. Kátia abriu um novo diário miccional para você. Escolha o dia em que vai começar a
        registrar. Você registra pelos dias que conseguir.
      </p>
      <div>
        <label className="block text-sm font-medium mb-1">Dia de início</label>
        <input
          type="date"
          value={dataInicio}
          min={minimo}
          onChange={(e) => setDataInicio(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />
      </div>
      {erro && <p className="text-sm" style={{ color: colors.danger }}>{erro}</p>}
      <button
        type="submit"
        disabled={salvando}
        className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-60"
        style={{ background: colors.primary }}
      >
        {salvando ? 'Iniciando...' : 'Começar meu diário'}
      </button>
    </form>
  )
}
