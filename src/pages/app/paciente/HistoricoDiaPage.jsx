import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { listarEntradasPorDia } from '../../../lib/entradasDiarioApi'
import { ChevronLeft } from 'lucide-react'
import ListaEntradasComAcoes from '../../../components/ListaEntradasComAcoes'
import ReguaDoDia from '../../../components/ReguaDoDia'
import { colors, fonts } from '../../../theme'

function dataPorExtenso(ciclo, diaNumero) {
  const data = new Date(`${ciclo.dataInicio}T00:00:00`)
  data.setDate(data.getDate() + diaNumero - 1)
  return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function HistoricoDiaPage() {
  const { cicloSelecionado } = useOutletContext()
  const { diaNumero } = useParams()
  const [carregando, setCarregando] = useState(true)
  const [entradas, setEntradas] = useState([])

  const carregar = useCallback(async () => {
    setCarregando(true)
    if (!cicloSelecionado) {
      setEntradas([])
      setCarregando(false)
      return
    }
    setEntradas(await listarEntradasPorDia(cicloSelecionado.id, Number(diaNumero)))
    setCarregando(false)
  }, [cicloSelecionado, diaNumero])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          {cicloSelecionado?.dataInicio && (
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.accent }}>
              {dataPorExtenso(cicloSelecionado, Number(diaNumero))}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl leading-tight tracking-tight" style={{ fontFamily: fonts.heading, fontWeight: 600, color: colors.secondary }}>
            Dia {diaNumero}
          </h1>
        </div>
        <Link to="/app/diario" className="flex items-center gap-1 text-sm font-medium pb-1" style={{ color: colors.primary }}>
          <ChevronLeft size={16} aria-hidden="true" />
          Voltar para hoje
        </Link>
      </div>
      {carregando ? (
        <p style={{ color: colors.textSecondary }}>Carregando...</p>
      ) : (
        <div className="rounded-2xl p-5 space-y-5" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          {entradas.length > 0 && (
            <div className="pb-5 border-b" style={{ borderColor: colors.border }}>
              <ReguaDoDia entradas={entradas} />
            </div>
          )}
          <ListaEntradasComAcoes
            entradas={entradas}
            mensagemVazia="Nenhum registro nesse dia."
            onAlterado={carregar}
          />
        </div>
      )}
    </div>
  )
}
