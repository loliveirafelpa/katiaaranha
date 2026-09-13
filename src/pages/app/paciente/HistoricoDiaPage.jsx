import { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { obterCicloAtivo } from '../../../lib/ciclosDiarioApi'
import { listarEntradasPorDia } from '../../../lib/entradasDiarioApi'
import TabelaDiariaEstiloPapel from '../../../components/TabelaDiariaEstiloPapel'
import { colors } from '../../../theme'

export default function HistoricoDiaPage() {
  const { perfil } = useOutletContext()
  const { diaNumero } = useParams()
  const [carregando, setCarregando] = useState(true)
  const [entradas, setEntradas] = useState([])

  useEffect(() => {
    let ativo = true
    async function carregar() {
      setCarregando(true)
      const ciclo = await obterCicloAtivo(perfil.id)
      if (!ciclo || !ativo) return
      const lista = await listarEntradasPorDia(ciclo.id, Number(diaNumero))
      if (ativo) {
        setEntradas(lista)
        setCarregando(false)
      }
    }
    carregar()
    return () => { ativo = false }
  }, [perfil.id, diaNumero])

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
          <TabelaDiariaEstiloPapel entradas={entradas} />
        </div>
      )}
    </div>
  )
}
