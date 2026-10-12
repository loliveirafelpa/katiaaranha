import { useState } from 'react'
import { trocarSenha } from '../lib/authApi'
import { colors } from '../theme'

// Cartao "Trocar senha" - usado em Meus dados (paciente) e Minha conta (admin).
export default function TrocarSenhaCard({ dica }) {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [trocandoSenha, setTrocandoSenha] = useState(false)
  const [erroSenha, setErroSenha] = useState('')
  const [mensagemSenha, setMensagemSenha] = useState('')

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

  return (
    <div className="rounded-2xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
      <h2 className="font-semibold mb-2" style={{ color: colors.secondary }}>Trocar senha</h2>
      {dica && <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>{dica}</p>}

      <label htmlFor="nova-senha" className="block text-sm font-medium mb-1">Nova senha</label>
      <input
        id="nova-senha"
        type="password"
        autoComplete="new-password"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: colors.border }}
      />

      <label htmlFor="confirmar-senha" className="block text-sm font-medium mt-3 mb-1">Confirmar nova senha</label>
      <input
        id="confirmar-senha"
        type="password"
        autoComplete="new-password"
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
  )
}
