import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Plus, ChevronRight } from 'lucide-react'
import { listarPacientes } from '../../../lib/perfisApi'
import { listarCiclosPorPaciente, calcularStatusCiclo } from '../../../lib/ciclosDiarioApi'
import StatusCicloBadge from '../../../components/StatusCicloBadge'
import CabecalhoPagina, { AvatarIniciais } from '../../../components/CabecalhoPagina'
import { labelServico } from '../../../data/servicos'
import { colors, fonts } from '../../../theme'

const LABEL_UNIDADE = { campinas: 'Campinas', jundiai: 'Jundiaí' }

// "Dra. Katia Aranha" -> "Dra. Katia"; "Katia Aranha" -> "Katia".
function nomeSaudacao(nomeCompleto) {
  const partes = (nomeCompleto || '').trim().split(/\s+/).filter(Boolean)
  if (/^dr[a]?\.?$/i.test(partes[0] || '')) return partes.slice(0, 2).join(' ')
  return partes[0] || ''
}

export default function PacientesListaPage() {
  const { perfil } = useOutletContext()
  const [carregando, setCarregando] = useState(true)
  const [pacientes, setPacientes] = useState([])
  const [filtroUnidade, setFiltroUnidade] = useState('todas')

  useEffect(() => {
    let ativo = true
    async function carregar() {
      const lista = await listarPacientes()
      const comStatus = await Promise.all(
        lista.map(async (p) => {
          // Vem do mais recente pro mais antigo: o atual e o [0], e o numero dele e o total.
          const ciclos = await listarCiclosPorPaciente(p.id)
          return {
            ...p,
            status: calcularStatusCiclo(ciclos[0] ?? null),
            numeroCiclo: ciclos.length,
          }
        })
      )
      if (ativo) {
        setPacientes(comStatus)
        setCarregando(false)
      }
    }
    carregar()
    return () => { ativo = false }
  }, [])

  const pacientesFiltrados = pacientes.filter((p) => filtroUnidade === 'todas' || p.unidade === filtroUnidade)
  const emAndamento = pacientes.filter((p) => p.status === 'em_andamento').length
  const nome = nomeSaudacao(perfil?.nomeCompleto)
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        eyebrow={hoje}
        titulo={nome ? `Olá, ${nome}` : 'Pacientes'}
        subtitulo={
          carregando ? null : (
            <>
              {pacientes.length} {pacientes.length === 1 ? 'paciente' : 'pacientes'}
              {' · '}
              {emAndamento} com diário em andamento
            </>
          )
        }
        acoes={
          <Link
            to="/app/admin/pacientes/novo"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full font-medium text-white text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ background: colors.primary, outlineColor: colors.primary }}
          >
            <Plus size={16} aria-hidden="true" />
            Novo paciente
          </Link>
        }
      />

      <section className="space-y-3" aria-labelledby="titulo-pacientes">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titulo-pacientes" className="font-semibold" style={{ color: colors.secondary }}>Pacientes</h2>
          <div className="flex flex-wrap gap-1 p-1 rounded-full text-sm" style={{ background: colors.surface, border: `1px solid ${colors.border}` }} role="group" aria-label="Filtrar por unidade">
            {['todas', 'campinas', 'jundiai'].map((u) => (
              <button
                key={u}
                onClick={() => setFiltroUnidade(u)}
                aria-pressed={filtroUnidade === u}
                className="px-3 py-1.5 rounded-full font-medium focus-visible:outline-2"
                style={{
                  background: filtroUnidade === u ? colors.primary : 'transparent',
                  color: filtroUnidade === u ? '#fff' : colors.textSecondary,
                  outlineColor: colors.primary,
                }}
              >
                {u === 'todas' ? 'Todas as unidades' : LABEL_UNIDADE[u]}
              </button>
            ))}
          </div>
        </div>

        {carregando ? (
          <p style={{ color: colors.textSecondary }}>Carregando...</p>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="rounded-2xl p-6 text-sm" style={{ background: colors.surface, border: `1px dashed ${colors.border}`, color: colors.textSecondary }}>
            {pacientes.length === 0
              ? 'Nenhum paciente cadastrado ainda. Use "Novo paciente" para cadastrar o primeiro.'
              : 'Nenhum paciente nesta unidade.'}
          </div>
        ) : (
          <ul className="rounded-2xl overflow-hidden" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            {pacientesFiltrados.map((p, i) => (
              <li key={p.id} style={i > 0 ? { borderTop: `1px solid ${colors.border}` } : undefined}>
                <Link
                  to={`/app/admin/pacientes/${p.id}`}
                  className="group flex items-center gap-3 sm:gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--hover)] focus-visible:outline-2 focus-visible:-outline-offset-2"
                  style={{ '--hover': colors.background, outlineColor: colors.primary }}
                >
                  <AvatarIniciais nome={p.nomeCompleto} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: colors.text, fontFamily: fonts.heading }}>{p.nomeCompleto}</p>
                    <p className="text-xs truncate" style={{ color: colors.textSecondary }}>
                      {p.unidade ? LABEL_UNIDADE[p.unidade] : 'Sem unidade'}
                      {labelServico(p) ? ` · ${labelServico(p)}` : ''}
                      {p.contato ? ` · ${p.contato}` : ''}
                    </p>
                    <div className="sm:hidden mt-1.5"><StatusCicloBadge status={p.status} numeroCiclo={p.numeroCiclo} /></div>
                  </div>
                  <span className="hidden sm:inline"><StatusCicloBadge status={p.status} numeroCiclo={p.numeroCiclo} /></span>
                  <ChevronRight size={18} color={colors.textSecondary} className="shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
