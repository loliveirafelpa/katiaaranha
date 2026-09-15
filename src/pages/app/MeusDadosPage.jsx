import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { atualizarMeuPerfil } from '../../lib/perfisApi'
import { revogarConsentimento } from '../../lib/consentimentosApi'
import { solicitarExclusaoPaciente } from '../../lib/pacientesApi'
import { logout, trocarSenha } from '../../lib/authApi'
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

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [trocandoSenha, setTrocandoSenha] = useState(false)
  const [erroSenha, setErroSenha] = useState('')
  const [mensagemSenha, setMensagemSenha] = useState('')

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

  async function handleTrocarSenha() {
    setErroSenha('')
    setMensagemSenha('')

    if (novaSenha.length < 6) {
      setErroSenha('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha('As senhas não coincidem.')
      return
    }

    setTrocandoSenha(true)
    try {
      await trocarSenha(novaSenha)
      setNovaSenha('')
      setConfirmarSenha('')
      setMensagemSenha('Senha atualizada com sucesso.')
    } catch (err) {
      setErroSenha(err.message || 'Não foi possível trocar a senha. Tente novamente.')
    } finally {
      setTrocandoSenha(false)
    }
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
        <h2 className="font-semibold mb-2" style={{ color: colors.secondary }}>Trocar senha</h2>
        <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
          Se você ainda está usando a senha de primeiro acesso, aproveite pra trocar por uma só sua.
        </p>

        <label className="block text-sm font-medium mb-1">Nova senha</label>
        <input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />

        <label className="block text-sm font-medium mt-3 mb-1">Confirmar nova senha</label>
        <input
          type="password"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />

        <button
          onClick={handleTrocarSenha}
          disabled={trocandoSenha}
          className="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
          style={{ background: colors.primary }}
        >
          {trocandoSenha ? 'Salvando...' : 'Trocar senha'}
        </button>

        {erroSenha && <p className="text-sm mt-3" style={{ color: colors.danger }}>{erroSenha}</p>}
        {mensagemSenha && <p className="text-sm mt-3" style={{ color: colors.success }}>{mensagemSenha}</p>}
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
