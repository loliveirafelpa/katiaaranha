import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import { getPerfilAtual, logout } from './lib/authApi'
import { obterConsentimentoAtual } from './lib/consentimentosApi'
import { listarCiclosPorPaciente } from './lib/ciclosDiarioApi'
import { BookOpen, Dumbbell, UserRound, Users, LogOut } from 'lucide-react'
import LogoCpa from './components/brand/LogoCpa'
import { colors } from './theme'

// Menu do topo (paciente e admin): icone sempre, texto so a partir do tablet (no celular
// o topo fica enxuto). A pagina atual ganha fundo laranja claro.
function LinkMenu({ to, ativo, Icone, children }) {
  return (
    <Link
      to={to}
      aria-current={ativo ? 'page' : undefined}
      title={children}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium focus-visible:outline-2"
      style={{ background: ativo ? colors.background : 'transparent', color: ativo ? colors.secondary : colors.textSecondary, outlineColor: colors.primary }}
    >
      <Icone size={18} aria-hidden="true" />
      <span className="hidden md:inline">{children}</span>
    </Link>
  )
}

export default function AppShell() {
  const [carregando, setCarregando] = useState(true)
  const [perfil, setPerfil] = useState(null)
  const [consentimentoOk, setConsentimentoOk] = useState(true)
  const [ciclosPaciente, setCiclosPaciente] = useState([])
  const [cicloSelecionadoId, setCicloSelecionadoId] = useState(null)
  const [versaoCiclos, setVersaoCiclos] = useState(0)
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
  // rota) para alimentar o seletor de ciclo no cabecalho. Se o admin criar mais um, ele so
  // aparece aqui no proximo login/refresh. recarregarCiclos (via Outlet) forca a releitura,
  // usado quando o paciente escolhe o dia de inicio de um ciclo novo.
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
  }, [perfil?.id, perfil?.role, versaoCiclos])

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
              {/* do mais recente pro mais antigo: o numero conta de tras pra frente */}
              {ciclosPaciente.map((c, i) => (
                <option key={c.id} value={c.id}>
                  Ciclo {ciclosPaciente.length - i}{c.dataInicio ? '' : ' (novo)'}
                </option>
              ))}
            </select>
          )}
          {perfil.role === 'paciente' && (
            <nav aria-label="Menu do paciente" className="flex items-center gap-1">
              <LinkMenu to="/app/diario" ativo={location.pathname.startsWith('/app/diario')} Icone={BookOpen}>Diário</LinkMenu>
              <LinkMenu to="/app/exercicios" ativo={location.pathname.startsWith('/app/exercicios')} Icone={Dumbbell}>Exercícios/Orientações</LinkMenu>
              <LinkMenu to="/app/meus-dados" ativo={location.pathname.startsWith('/app/meus-dados')} Icone={UserRound}>Meus dados</LinkMenu>
            </nav>
          )}
          {perfil.role === 'admin' && (
            <nav aria-label="Menu da clínica" className="flex items-center gap-1">
              <LinkMenu to="/app/admin/pacientes" ativo={location.pathname.startsWith('/app/admin/pacientes')} Icone={Users}>Pacientes</LinkMenu>
              <LinkMenu to="/app/admin/exercicios" ativo={location.pathname.startsWith('/app/admin/exercicios')} Icone={Dumbbell}>Exercícios</LinkMenu>
              <LinkMenu to="/app/admin/minha-conta" ativo={location.pathname.startsWith('/app/admin/minha-conta')} Icone={UserRound}>Minha conta</LinkMenu>
            </nav>
          )}
          <button
            onClick={handleLogout}
            aria-label="Sair"
            title="Sair"
            className="w-9 h-9 rounded-full flex items-center justify-center focus-visible:outline-2"
            style={{ color: colors.primary, outlineColor: colors.primary }}
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>
      <main className="p-6 max-w-4xl mx-auto">
        <Outlet context={{ perfil, cicloSelecionado, ciclosPaciente, recarregarCiclos: () => setVersaoCiclos((v) => v + 1) }} />
      </main>
    </div>
  )
}
