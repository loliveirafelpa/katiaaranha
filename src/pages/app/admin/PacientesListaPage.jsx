import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarPacientes } from '../../../lib/perfisApi'
import { obterCicloAtivo, calcularDiaAtual, calcularStatusCiclo } from '../../../lib/ciclosDiarioApi'
import StatusCicloBadge from '../../../components/StatusCicloBadge'
import { labelServico } from '../../../data/servicos'
import { colors } from '../../../theme'

const LABEL_UNIDADE = { campinas: 'Campinas', jundiai: 'Jundiaí' }

export default function PacientesListaPage() {
  const [carregando, setCarregando] = useState(true)
  const [pacientes, setPacientes] = useState([])
  const [filtroUnidade, setFiltroUnidade] = useState('todas')

  useEffect(() => {
    let ativo = true
    async function carregar() {
      const lista = await listarPacientes()
      const comStatus = await Promise.all(
        lista.map(async (p) => {
          const ciclo = await obterCicloAtivo(p.id)
          return {
            ...p,
            status: calcularStatusCiclo(ciclo),
            diaAtual: ciclo ? calcularDiaAtual(ciclo) : null,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold" style={{ color: colors.secondary }}>Pacientes</h1>
        <Link
          to="/app/admin/pacientes/novo"
          className="px-4 py-2 rounded-xl font-medium text-white text-sm"
          style={{ background: colors.primary }}
        >
          + Novo paciente
        </Link>
      </div>

      <div className="flex gap-2 text-sm">
        {['todas', 'campinas', 'jundiai'].map((u) => (
          <button
            key={u}
            onClick={() => setFiltroUnidade(u)}
            className="px-3 py-1.5 rounded-full border"
            style={{
              borderColor: filtroUnidade === u ? colors.primary : colors.border,
              background: filtroUnidade === u ? colors.primary : colors.surface,
              color: filtroUnidade === u ? '#fff' : colors.text,
            }}
          >
            {u === 'todas' ? 'Todas as unidades' : LABEL_UNIDADE[u]}
          </button>
        ))}
      </div>

      {carregando ? (
        <p style={{ color: colors.textSecondary }}>Carregando...</p>
      ) : pacientesFiltrados.length === 0 ? (
        <p style={{ color: colors.textSecondary }}>Nenhum paciente cadastrado ainda.</p>
      ) : (
        <ul className="space-y-2">
          {pacientesFiltrados.map((p) => (
            <li key={p.id}>
              <Link
                to={`/app/admin/pacientes/${p.id}`}
                className="flex items-center justify-between gap-3 rounded-xl p-4"
                style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <div>
                  <p className="font-medium">{p.nomeCompleto}</p>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    {p.unidade ? LABEL_UNIDADE[p.unidade] : 'Sem unidade'}
                    {labelServico(p) ? ` · ${labelServico(p)}` : ''}
                    {p.contato ? ` · ${p.contato}` : ''}
                  </p>
                </div>
                <StatusCicloBadge status={p.status} diaAtual={p.diaAtual} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
