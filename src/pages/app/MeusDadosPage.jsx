import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { atualizarMeuPerfil } from '../../lib/perfisApi'
import { revogarConsentimento } from '../../lib/consentimentosApi'
import { solicitarExclusaoPaciente } from '../../lib/pacientesApi'
import { logout } from '../../lib/authApi'
import ModalConfirmacaoExclusao from '../../components/ModalConfirmacaoExclusao'
import { colors } from '../../theme'

export default function MeusDadosPage() {
  const { perfil } = useOutletContext()
  const navigate = useNavigate()
  const [contato, setContato] = useState(perfil.contato || '')
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  async function handleSalvarContato() {
    setSalvando(true)
    setMensagem('')
    try {
      await atualizarMeuPerfil(perfil.id, { contato })
      setMensagem('Contato atualizado.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleRevogarConsentimento() {
    await revogarConsentimento(perfil.id)
    setMensagem('Consentimento revogado. Você precisará aceitar novamente para continuar usando o diário.')
  }

  async function handleExcluir() {
    setExcluindo(true)
    try {
      await solicitarExclusaoPaciente(perfil.id)
      await logout()
      navigate('/', { replace: true })
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="rounded-2xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
        <h1 className="text-lg font-semibold mb-4" style={{ color: colors.secondary }}>Meus dados</h1>

        <p className="text-sm mb-1"><strong>Nome:</strong> {perfil.nomeCompleto}</p>

        <label className="block text-sm font-medium mt-4 mb-1">Contato</label>
        <input
          type="text"
          value={contato}
          onChange={(e) => setContato(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />
        <button
          onClick={handleSalvarContato}
          disabled={salvando}
          className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
          style={{ background: colors.primary }}
        >
          {salvando ? 'Salvando...' : 'Salvar contato'}
        </button>

        {mensagem && <p className="text-sm mt-3" style={{ color: colors.success }}>{mensagem}</p>}
      </div>

      <div className="rounded-2xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
        <h2 className="font-semibold mb-2" style={{ color: colors.secondary }}>Seus direitos (LGPD)</h2>
        <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
          Você pode revogar seu consentimento de tratamento de dados de saúde a qualquer momento,
          ou solicitar a exclusão definitiva da sua conta e dados de identificação.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRevogarConsentimento}
            className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: colors.border, color: colors.text }}
          >
            Revogar consentimento
          </button>
          <button
            onClick={() => setModalExclusaoAberto(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: colors.danger, color: colors.danger }}
          >
            Excluir minha conta e dados
          </button>
        </div>
      </div>

      <ModalConfirmacaoExclusao
        aberto={modalExclusaoAberto}
        titulo="Excluir conta e dados"
        mensagem="Isso vai anonimizar seus dados de identificação e remover seu acesso ao sistema. Essa ação não pode ser desfeita. Deseja continuar?"
        onConfirmar={handleExcluir}
        onCancelar={() => setModalExclusaoAberto(false)}
        confirmando={excluindo}
      />
    </div>
  )
}
