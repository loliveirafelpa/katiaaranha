import { useState } from 'react'
import { Link } from 'react-router-dom'
import { enviarLinkRedefinicaoSenha } from '../lib/authApi'
import LogoCpa from '../components/brand/LogoCpa'
import { colors } from '../theme'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await enviarLinkRedefinicaoSenha(email.trim().toLowerCase())
      setEnviado(true)
    } catch (err) {
      // O Supabase limita quantos e-mails saem por hora; o resto e falha de conexao.
      setErro(err.status === 429
        ? 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.'
        : 'Não foi possível enviar agora. Tente novamente em instantes.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: colors.background }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
      >
        <LogoCpa height={48} className="mb-3" />
        <h1 className="text-xl font-semibold mb-1" style={{ color: colors.secondary }}>Esqueci minha senha</h1>

        {enviado ? (
          // Mesma mensagem exista ou nao a conta: a tela nao pode servir pra descobrir quem
          // e paciente da clinica.
          <p className="text-sm mt-4" style={{ color: colors.text }}>
            Se o e-mail <strong>{email}</strong> estiver cadastrado, você vai receber em alguns minutos uma mensagem
            com um link para criar uma senha nova. Confira também a caixa de spam.
          </p>
        ) : (
          <>
            <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
              Digite o e-mail que você usa para entrar. Vamos enviar um link para você criar uma senha nova.
            </p>

            <label htmlFor="email" className="block text-sm mb-1">E-mail</label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded-lg border outline-none"
              style={{ borderColor: colors.border }}
            />

            {erro && <p className="text-sm mb-4" style={{ color: colors.danger }}>{erro}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="w-full py-2 rounded-lg font-medium text-white disabled:opacity-60"
              style={{ background: colors.primary }}
            >
              {enviando ? 'Enviando...' : 'Enviar link'}
            </button>
          </>
        )}

        <p className="text-xs text-center mt-6" style={{ color: colors.textSecondary }}>
          <Link to="/login" className="underline">Voltar para o login</Link>
        </p>
      </form>
    </div>
  )
}
