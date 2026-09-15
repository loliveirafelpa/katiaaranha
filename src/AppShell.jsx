import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import { getPerfilAtual, logout } from './lib/authApi'
import { obterConsentimentoAtual } from './lib/consentimentosApi'
import { listarCiclosPorPaciente } from './lib/ciclosDiarioApi'
import LogoCpa from './components/brand/LogoCpa'
import { colors } from './theme'

export default function AppShell() {
  const [carregando, setCarregando] = useState(true)
  const [perfil, setPerfil] = useState(null)
  const [consentimentoOk, setConsentimentoOk] = useState(true)
  const [ciclosPaciente, setCiclosPaciente] = useState([])
  const [cicloSelecionadoId, setCicloSelecionadoId] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    let ativo = true

    async function carregar() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (ativo) {
          setPerfil(null)
          setCarregando(false)
        }
        return
      }

      const perfilAtual = await getPerfilAtual()
      if (!ativo) return

      let consentimentoValido = true
      if (perfilAtual?.role === 'paciente') {
        const consentimento = await obterConsentimentoAtual(perfilAtual.id)
        consentimentoValido = !!consentimento?.aceito
      }

      if (!ativo) return
      setPerfil(perfilAtual)
      setConsentimentoOk(consentimentoValido)
      setCarregando(false)
    }

    carregar()

    const { data: listener } = supabase.auth.onAuthStateChange(() => carregar())
    return () => {
      ativo = false
      listener.subscription.unsubscribe()
    }
  }, [location.pathname])

  // Carrega a lista de ciclos do paciente uma unica vez por login (nao a cada troca de
  // rota) para alimentar o seletor de ciclo no cabecalho. Continua mesmo apos criar novos
  // ciclos - se o admin criar mais um, ele so aparece aqui no proximo login/refresh.
  useEffect(() => {
    if (perfil?.role !== 'paciente') {
      setCiclosPaciente([])
      setCicloSelecionadoId(null)
      return
    }
    let ativo = true
    listarCiclosPorPaciente(perfil.id).then((lista) => {
      if (!ativo) return
      setCiclosPaciente(lista)
      setCicloSelecionadoId((atual) => atual && lista.some((c) => c.id === atual) ? atual : (lista[0]?.id ?? null))
    })
    return () => { ativo = false }
  }, [perfil?.id, perfil?.role])

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.background, color: colors.textSecondary }}>
        Carregando...
      </div>
    )
  }

  if (!perfil) {
    return <Navigate to="/login" replace />
  }

  if (perfil.role === 'paciente' && !consentimentoOk && location.pathname !== '/app/consentimento') {
    return <Navigate to="/app/consentimento" replace />
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const cicloSelecionado = ciclosPaciente.find((c) => c.id === cicloSelecionadoId) || null

  return (
    <div className="min-h-screen" style={{ background: colors.background, color: colors.text }}>
      <header
        className="flex items-center justify-between px-6 py-4 border-b flex-wrap gap-2"
        style={{ borderColor: colors.border, background: colors.surface }}
      >
        <Link to="/app" className="flex items-center gap-2 font-semibold" style={{ color: colors.secondary }}>
          <LogoCpa height={36} />
          Diário Miccional
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {perfil.role === 'paciente' && ciclosPaciente.length > 1 && (
            <select
              value={cicloSelecionadoId || ''}
              onChange={(e) => setCicloSelecionadoId(e.target.value)}
              className="px-2 py-1.5 rounded-lg border text-sm"
              style={{ borderColor: colors.border }}
            >
              {ciclosPaciente.map((c) => (
                <option key={c.id} value={c.id}>
                  Ciclo de {new Date(`${c.dataInicio}T00:00:00`).toLocaleDateString('pt-BR')}
                </option>
              ))}
            </select>
          )}
          <span style={{ color: colors.textSecondary }}>
            {perfil.nomeCompleto} · {perfil.role === 'admin' ? 'Admin' : 'Paciente'}
          </span>
          {perfil.role === 'paciente' && (
            <Link to="/app/meus-dados" className="underline" style={{ color: colors.textSecondary }}>
              Meus dados
            </Link>
          )}
          <button onClick={handleLogout} className="underline" style={{ color: colors.primary }}>
            Sair
          </button>
        </div>
      </header>
      <main className="p-6 max-w-4xl mx-auto">
        <Outlet context={{ perfil, cicloSelecionado }} />
      </main>
    </div>
  )
}
