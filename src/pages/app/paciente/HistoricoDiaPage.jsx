import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { listarEntradasPorDia } from '../../../lib/entradasDiarioApi'
import ListaEntradasComAcoes from '../../../components/ListaEntradasComAcoes'
import { colors } from '../../../theme'

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold" style={{ color: colors.secondary }}>Dia {diaNumero}</h1>
        <Link to="/app/diario" className="text-sm underline" style={{ color: colors.primary }}>
          Voltar ao diário
        </Link>
      </div>
      {carregando ? (
        <p style={{ color: colors.textSecondary }}>Carregando...</p>
      ) : (
        <div className="rounded-2xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
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
