import { useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
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
  outrosSintomas: [],
}

export default function ObservacoesDiaPage() {
  const { perfil, cicloSelecionado } = useOutletContext()
  const { diaNumero } = useParams()
  const navigate = useNavigate()
  const [valor, setValor] = useState(VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    async function carregar() {
      const existente = cicloSelecionado
        ? await obterObservacaoDoDia(cicloSelecionado.id, Number(diaNumero))
        : null
      if (ativo) {
        // Sempre define os dois lados (existe ou nao) - sem isso, trocar de ciclo/dia pra um
        // que ainda nao tem observacao salva deixava os valores do dia anterior no formulario.
        setValor(existente ? {
          absorventeUso: existente.absorventeUso || false,
          absorventeTipo: existente.absorventeTipo || '',
          absorventeTipoOutro: existente.absorventeTipoOutro || '',
          absorventeQuantidade: existente.absorventeQuantidade ?? '',
          menstruacao: existente.menstruacao || false,
          menstruacaoInicio: existente.menstruacaoInicio || '',
          menstruacaoFim: existente.menstruacaoFim || '',
          medicamentosUso: existente.medicamentosUso || false,
          medicamentosQuais: existente.medicamentosQuais || '',
          outrosSintomas: existente.outrosSintomas || [],
        } : VAZIO)
        setCarregando(false)
      }
    }
    carregar()
    return () => { ativo = false }
  }, [cicloSelecionado, diaNumero])

  async function handleSalvar() {
    setSalvando(true)
    setErro('')
    try {
      await salvarObservacaoDoDia({
        cicloId: cicloSelecionado.id,
        pacienteId: perfil.id,
        diaNumero: Number(diaNumero),
        ...valor,
        absorventeQuantidade: valor.absorventeQuantidade === '' ? null : Number(valor.absorventeQuantidade),
      })
      navigate('/app/diario')
    } catch (err) {
      setErro(err.message || 'Não foi possível salvar. Tente novamente.')
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

      {erro && <p className="text-sm" style={{ color: colors.danger }}>{erro}</p>}

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
