import { useState } from 'react'
import { Link } from 'react-router-dom'
import { criarPaciente } from '../../../lib/pacientesApi'
import { colors } from '../../../theme'

export default function NovoPacientePage() {
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [contato, setContato] = useState('')
  const [unidade, setUnidade] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const res = await criarPaciente({ nomeCompleto, email, contato, unidade: unidade || null })
      setResultado(res)
    } catch (err) {
      setErro(err.message || 'Não foi possível criar o paciente.')
    } finally {
      setSalvando(false)
    }
  }

  if (resultado) {
    return (
      <div className="max-w-md mx-auto rounded-2xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
        <h1 className="text-lg font-semibold mb-3" style={{ color: colors.secondary }}>Paciente criado</h1>
        <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
          Repasse estas credenciais ao paciente. Elas não ficam salvas em nenhum lugar — anote
          agora.
        </p>
        <div className="rounded-lg p-4 mb-4 text-sm space-y-1" style={{ background: colors.background }}>
          <p><strong>E-mail:</strong> {resultado.email}</p>
          <p><strong>Senha temporária:</strong> {resultado.senhaTemporaria}</p>
        </div>
        <Link to="/app/admin/pacientes" className="underline text-sm" style={{ color: colors.primary }}>
          Voltar para a lista de pacientes
        </Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto rounded-2xl p-6 space-y-4"
      style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
    >
      <h1 className="text-lg font-semibold" style={{ color: colors.secondary }}>Novo paciente</h1>

      <div>
        <label className="block text-sm font-medium mb-1">Nome completo</label>
        <input
          type="text"
          required
          value={nomeCompleto}
          onChange={(e) => setNomeCompleto(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">E-mail de acesso</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contato (WhatsApp, opcional)</label>
        <input
          type="text"
          value={contato}
          onChange={(e) => setContato(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Unidade</label>
        <select
          value={unidade}
          onChange={(e) => setUnidade(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        >
          <option value="">Selecione</option>
          <option value="campinas">Campinas</option>
          <option value="jundiai">Jundiaí</option>
        </select>
      </div>

      {erro && <p className="text-sm" style={{ color: colors.danger }}>{erro}</p>}

      <button
        type="submit"
        disabled={salvando}
        className="w-full py-2 rounded-lg font-medium text-white disabled:opacity-60"
        style={{ background: colors.primary }}
      >
        {salvando ? 'Criando...' : 'Criar paciente'}
      </button>
    </form>
  )
}
