import { useState } from 'react'
import { Link } from 'react-router-dom'
import { criarPaciente } from '../../../lib/pacientesApi'
import { SERVICOS_CADASTRO } from '../../../data/servicos'
import CampoProtocoloUrgencia from '../../../components/CampoProtocoloUrgencia'
import CabecalhoPagina from '../../../components/CabecalhoPagina'
import { colors } from '../../../theme'

export default function NovoPacientePage() {
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [contato, setContato] = useState('')
  const [unidade, setUnidade] = useState('')
  const [servico, setServico] = useState('')
  const [idade, setIdade] = useState('')
  const [pesoKg, setPesoKg] = useState('')
  const [protocoloUrgencia, setProtocoloUrgencia] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      const res = await criarPaciente({
        nomeCompleto,
        email,
        contato,
        unidade: unidade || null,
        servico: servico || null,
        idade: idade === '' ? null : Number(idade),
        pesoKg: pesoKg === '' ? null : Number(pesoKg),
        protocoloUrgencia,
      })
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
          Repasse estas credenciais ao paciente. Peça pra ele trocar a senha assim que entrar
          pela primeira vez, na tela "Meus dados".
        </p>
        <div className="rounded-lg p-4 mb-4 text-sm space-y-1" style={{ background: colors.background }}>
          <p><strong>E-mail:</strong> {resultado.email}</p>
          <p><strong>Senha de primeiro acesso:</strong> {resultado.senhaTemporaria}</p>
        </div>
        <Link to="/app/admin/pacientes" className="underline text-sm" style={{ color: colors.primary }}>
          Voltar para a lista de pacientes
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-5">
      <CabecalhoPagina voltar={{ to: '/app/admin/pacientes', label: 'Pacientes' }} titulo="Novo paciente" subtitulo="O acesso do paciente é criado na hora; você recebe o e-mail e a senha para repassar." />
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 space-y-4"
        style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
      >
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

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Idade</label>
            <input
              type="number"
              min="1"
              max="129"
              required
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: colors.border }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Peso (kg)</label>
            <input
              type="number"
              min="1"
              max="399"
              step="0.1"
              required
              value={pesoKg}
              onChange={(e) => setPesoKg(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: colors.border }}
            />
          </div>
        </div>
        <p className="text-xs -mt-2" style={{ color: colors.textSecondary }}>
          Usados só para calcular a meta diária de líquido recomendada, mostrada na ficha do paciente.
        </p>

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

        <div>
          <label className="block text-sm font-medium mb-1">Serviço / tratamento</label>
          <select
            value={servico}
            onChange={(e) => setServico(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: colors.border }}
          >
            <option value="">Selecione</option>
            {SERVICOS_CADASTRO.map((s) => (
              <option key={s.valor} value={s.valor}>{s.label}</option>
            ))}
          </select>
        </div>

        <CampoProtocoloUrgencia value={protocoloUrgencia} onChange={setProtocoloUrgencia} />

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
    </div>
  )
}
