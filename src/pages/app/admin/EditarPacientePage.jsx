import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { atualizarPaciente, obterPacientePorId } from '../../../lib/perfisApi'
import { SERVICOS, SERVICOS_CADASTRO } from '../../../data/servicos'
import CampoProtocoloUrgencia from '../../../components/CampoProtocoloUrgencia'
import CabecalhoPagina from '../../../components/CabecalhoPagina'
import { colors } from '../../../theme'

const campoClasse = 'w-full px-3 py-2 rounded-lg border text-sm'

export default function EditarPacientePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [servicoLegado, setServicoLegado] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    obterPacientePorId(id).then((p) => {
      if (!ativo) return
      setForm({
        nomeCompleto: p.nomeCompleto || '',
        contato: p.contato || '',
        unidade: p.unidade || '',
        servico: p.servico || '',
        idade: p.idade ?? '',
        pesoKg: p.pesoKg ?? '',
        protocoloUrgencia: !!p.protocoloUrgencia,
      })
      // Paciente cadastrado num servico que saiu da lista continua com ele selecionado.
      const legado = SERVICOS.find((s) => s.valor === p.servico && s.legado)
      setServicoLegado(legado || null)
    })
    return () => { ativo = false }
  }, [id])

  if (!form) return <p style={{ color: colors.textSecondary }}>Carregando...</p>

  function alterar(campo) {
    return (valor) => setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await atualizarPaciente(id, form)
      navigate(`/app/admin/pacientes/${id}`)
    } catch (err) {
      setErro(err.message || 'Não foi possível salvar. Tente novamente.')
      setSalvando(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-5">
      <CabecalhoPagina voltar={{ to: `/app/admin/pacientes/${id}`, label: 'Ficha do paciente' }} titulo="Editar cadastro" />
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 space-y-4"
        style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
      >
        <div>
          <label className="block text-sm font-medium mb-1">Nome completo</label>
          <input type="text" required value={form.nomeCompleto} onChange={(e) => alterar('nomeCompleto')(e.target.value)} className={campoClasse} style={{ borderColor: colors.border }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contato (WhatsApp, opcional)</label>
          <input type="text" value={form.contato} onChange={(e) => alterar('contato')(e.target.value)} className={campoClasse} style={{ borderColor: colors.border }} />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Idade</label>
            <input type="number" min="1" max="129" value={form.idade} onChange={(e) => alterar('idade')(e.target.value)} className={campoClasse} style={{ borderColor: colors.border }} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Peso (kg)</label>
            <input type="number" min="1" max="399" step="0.1" value={form.pesoKg} onChange={(e) => alterar('pesoKg')(e.target.value)} className={campoClasse} style={{ borderColor: colors.border }} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Unidade</label>
          <select value={form.unidade} onChange={(e) => alterar('unidade')(e.target.value)} className={campoClasse} style={{ borderColor: colors.border }}>
            <option value="">Selecione</option>
            <option value="campinas">Campinas</option>
            <option value="jundiai">Jundiaí</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Serviço / tratamento</label>
          <select value={form.servico} onChange={(e) => alterar('servico')(e.target.value)} className={campoClasse} style={{ borderColor: colors.border }}>
            <option value="">Selecione</option>
            {SERVICOS_CADASTRO.map((s) => (
              <option key={s.valor} value={s.valor}>{s.label}</option>
            ))}
            {servicoLegado && <option value={servicoLegado.valor}>{servicoLegado.label} (antigo)</option>}
          </select>
        </div>

        <CampoProtocoloUrgencia value={form.protocoloUrgencia} onChange={alterar('protocoloUrgencia')} />

        {erro && <p className="text-sm" style={{ color: colors.danger }}>{erro}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="flex-1 py-2 rounded-lg font-medium text-white disabled:opacity-60"
            style={{ background: colors.primary }}
          >
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <Link to={`/app/admin/pacientes/${id}`} className="py-2 px-4 text-sm underline" style={{ color: colors.textSecondary }}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
