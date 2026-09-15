import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../lib/authApi'
import LogoCpa from '../components/brand/LogoCpa'
import { colors } from '../theme'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await login(email, senha)
      // Sempre entra por /app: quem decide pra onde ir (admin ou diário do paciente) e o
      // papel de quem logou agora, nunca a pagina de onde uma sessao anterior veio -
      // senao um login troca de conta mas fica preso na tela da conta antiga.
      navigate('/app', { replace: true })
    } catch (err) {
      setErro('E-mail ou senha inválidos.')
    } finally {
      setCarregando(false)
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
        <h1 className="text-xl font-semibold mb-1" style={{ color: colors.secondary }}>Entrar</h1>
        <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
          Diário Miccional — CPA Fisioterapia
        </p>

        <label className="block text-sm mb-1">E-mail</label>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border outline-none"
          style={{ borderColor: colors.border }}
        />

        <label className="block text-sm mb-1">Senha</label>
        <input
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded-lg border outline-none"
          style={{ borderColor: colors.border }}
        />

        {erro && <p className="text-sm mb-4" style={{ color: colors.danger }}>{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full py-2 rounded-lg font-medium text-white disabled:opacity-60"
          style={{ background: colors.primary }}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-xs text-center mt-6" style={{ color: colors.textSecondary }}>
          <Link to="/" className="underline">Voltar</Link>
        </p>
      </form>
    </div>
  )
}
