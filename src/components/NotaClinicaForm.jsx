import { useState } from 'react'
import { colors } from '../theme'

export default function NotaClinicaForm({ onSalvar }) {
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!texto.trim()) return
    setSalvando(true)
    try {
      await onSalvar(texto.trim())
      setTexto('')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Adicionar nota clínica..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: colors.border }}
      />
      <button
        type="submit"
        disabled={salvando}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
        style={{ background: colors.secondary }}
      >
        {salvando ? 'Salvando...' : 'Adicionar'}
      </button>
    </form>
  )
}
