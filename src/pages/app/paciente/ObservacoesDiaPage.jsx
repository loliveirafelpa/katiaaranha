import { useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { obterCicloAtivo } from '../../../lib/ciclosDiarioApi'
import { obterObservacaoDoDia, salvarObservacaoDoDia } from '../../../lib/observacoesApi'
import FormObservacoesDia from '../../../components/FormObservacoesDia'
import { colors } from '../../../theme'

const VAZIO = {
  absorventeUso: false,
  absorventeTipo: '',
  absorventeTipoOutro: '',
  absorventeQuantidade: '',
  menstruacao: false,
  menstruacaoInicio: '',
  menstruacaoFim: '',
  medicamentosUso: false,
  medicamentosQuais: '',
  outrosSintomas: '',
}

export default function ObservacoesDiaPage() {
  const { perfil } = useOutletContext()
  const { diaNumero } = useParams()
  const navigate = useNavigate()
  const [ciclo, setCiclo] = useState(null)
  const [valor, setValor] = useState(VAZIO)
  const [existenteId, setExistenteId] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      const cicloAtivo = await obterCicloAtivo(perfil.id)
      if (!ativo) return
      setCiclo(cicloAtivo)
      if (cicloAtivo) {
        const existente = await obterObservacaoDoDia(cicloAtivo.id, Number(diaNumero))
        if (ativo && existente) {
          setExistenteId(existente.id)
          setValor({
            absorventeUso: existente.absorventeUso || false,
            absorventeTipo: existente.absorventeTipo || '',
            absorventeTipoOutro: existente.absorventeTipoOutro || '',
            absorventeQuantidade: existente.absorventeQuantidade ?? '',
            menstruacao: existente.menstruacao || false,
            menstruacaoInicio: existente.menstruacaoInicio || '',
            menstruacaoFim: existente.menstruacaoFim || '',
            medicamentosUso: existente.medicamentosUso || false,
            medicamentosQuais: existente.medicamentosQuais || '',
            outrosSintomas: existente.outrosSintomas || '',
          })
        }
      }
      if (ativo) setCarregando(false)
    }
    carregar()
    return () => { ativo = false }
  }, [perfil.id, diaNumero])

  async function handleSalvar() {
    setSalvando(true)
    try {
      await salvarObservacaoDoDia({
        id: existenteId,
        cicloId: ciclo.id,
        pacienteId: perfil.id,
        diaNumero: Number(diaNumero),
        ...valor,
        absorventeQuantidade: valor.absorventeQuantidade === '' ? null : Number(valor.absorventeQuantidade),
      })
      navigate('/app/diario')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return <p style={{ color: colors.textSecondary }}>Carregando...</p>
  }

  return (
    <div className="max-w-lg mx-auto rounded-2xl p-6 space-y-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold" style={{ color: colors.secondary }}>
          Observações — Dia {diaNumero}
        </h1>
        <Link to="/app/diario" className="text-sm underline" style={{ color: colors.primary }}>
          Voltar
        </Link>
      </div>

      <FormObservacoesDia valor={valor} onChange={setValor} />

      <button
        onClick={handleSalvar}
        disabled={salvando}
        className="w-full py-2 rounded-lg font-medium text-white disabled:opacity-60"
        style={{ background: colors.primary }}
      >
        {salvando ? 'Salvando...' : 'Salvar observações'}
      </button>
    </div>
  )
}
