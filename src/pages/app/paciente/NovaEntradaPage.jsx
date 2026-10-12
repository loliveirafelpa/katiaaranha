import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { calcularDiaNumeroPara } from '../../../lib/ciclosDiarioApi'
import { atualizarEntrada, buscarEntrada, buscarUltimoPesoFraldaInicial, criarEntrada, criarEntradas } from '../../../lib/entradasDiarioApi'
import ChipSeletorLiquido from '../../../components/ChipSeletorLiquido'
import AtalhosVolume from '../../../components/AtalhosVolume'
import SeletorSeveridade from '../../../components/SeletorSeveridade'
import SeletorAtividade from '../../../components/SeletorAtividade'
import SeletorNivelVolume from '../../../components/SeletorNivelVolume'
import SeletorEscalaFezes from '../../../components/SeletorEscalaFezes'
import SeletorSimNao from '../../../components/SeletorSimNao'
import { colors } from '../../../theme'

// "banheiro" nao e um tipo do banco: e o formulario unico de xixi + coco, que salva
// uma entrada 'urinario' e/ou uma 'intestinal' no mesmo horario.
const TIPOS_VALIDOS = ['liquido', 'urinario', 'perda', 'intestinal', 'banheiro']

const TITULO_POR_TIPO = {
  liquido: 'Novo registro de líquido',
  urinario: 'Registrar xixi',
  perda: 'Registrar perda de urina',
  intestinal: 'Registrar cocô',
  banheiro: 'Fui ao banheiro',
}

function agoraParaInputLocal() {
  const agora = new Date()
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset())
  return agora.toISOString().slice(0, 16)
}

// O ciclo nao tem mais data de encerramento: o unico limite e o inicio do ciclo
// (nao da pra registrar antes dele) e o momento atual (nao da pra registrar o futuro).
function limitesDoCiclo(ciclo) {
  return {
    min: `${ciclo.dataInicio}T00:00`,
    max: agoraParaInputLocal(),
  }
}

function mensagemForaDoCiclo(ciclo) {
  const inicioFormatado = new Date(`${ciclo.dataInicio}T00:00:00`).toLocaleDateString('pt-BR')
  return `Esse horário está fora do período do seu diário. Escolha uma data a partir do início (${inicioFormatado}) e não posterior a agora.`
}

export default function NovaEntradaPage() {
  const { perfil, cicloSelecionado: ciclo } = useOutletContext()
  const { tipo: tipoDaRota, id } = useParams()
  const navigate = useNavigate()
  const modoEdicao = !!id

  const [tipo, setTipo] = useState(tipoDaRota || null)
  const [carregandoEntrada, setCarregandoEntrada] = useState(modoEdicao)
  const [entradaNaoEncontrada, setEntradaNaoEncontrada] = useState(false)

  const [horario, setHorario] = useState(agoraParaInputLocal())

  // Campos especificos de "liquido"
  const [liquidoTipo, setLiquidoTipo] = useState('agua')
  const [liquidoTipoOutro, setLiquidoTipoOutro] = useState('')
  const [liquidoMl, setLiquidoMl] = useState(200)

  // Campos especificos de "urinario"
  const [volumeUrinadoMl, setVolumeUrinadoMl] = useState('')
  const [volumeUrinadoNivel, setVolumeUrinadoNivel] = useState('')
  const [urgencia, setUrgencia] = useState('')
  const [esvaziamentoCompleto, setEsvaziamentoCompleto] = useState(null)
  const [gotejamentoPosMiccional, setGotejamentoPosMiccional] = useState(null)

  // Protocolo de urgencia (so aparece se a Dra. Katia ativou pra este paciente)
  const [pesoFraldaInicialG, setPesoFraldaInicialG] = useState('')
  const [pesoFraldaPosG, setPesoFraldaPosG] = useState('')
  const [trocouFralda, setTrocouFralda] = useState(false)
  const [protocoloNaEntrada, setProtocoloNaEntrada] = useState(false)
  const mostrarProtocolo = !!perfil?.protocoloUrgencia || protocoloNaEntrada

  // Campos especificos de "perda"
  const [perda, setPerda] = useState('pequena')
  const [perdaCategoria, setPerdaCategoria] = useState('')
  const [perdaDetalhe, setPerdaDetalhe] = useState('')

  // Campo especifico de "intestinal"
  const [fezesEscala, setFezesEscala] = useState(null)

  // So no "banheiro": o que o paciente marcou que fez
  const [fezXixi, setFezXixi] = useState(true)
  const [fezCoco, setFezCoco] = useState(false)

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // No modo edicao, o tipo do evento nao vem da rota - vem da propria entrada
  // carregada do banco, ja que aqui so se corrige um registro existente.
  useEffect(() => {
    if (!modoEdicao) return
    let ativo = true
    buscarEntrada(id)
      .then((entrada) => {
        if (!ativo) return
        setTipo(entrada.tipoEvento)
        const dataLocal = new Date(entrada.registradoEm)
        dataLocal.setMinutes(dataLocal.getMinutes() - dataLocal.getTimezoneOffset())
        setHorario(dataLocal.toISOString().slice(0, 16))
        if (entrada.tipoEvento === 'liquido') {
          setLiquidoTipo(entrada.liquidoTipo)
          setLiquidoTipoOutro(entrada.liquidoTipoOutro || '')
          setLiquidoMl(entrada.liquidoMl ?? '')
        } else if (entrada.tipoEvento === 'urinario') {
          setVolumeUrinadoMl(entrada.volumeUrinadoMl ?? '')
          setVolumeUrinadoNivel(entrada.volumeUrinadoNivel || '')
          setUrgencia(entrada.urgencia || '')
          setEsvaziamentoCompleto(entrada.esvaziamentoCompleto)
          setGotejamentoPosMiccional(entrada.gotejamentoPosMiccional)
          setPesoFraldaInicialG(entrada.pesoFraldaInicialG ?? '')
          setPesoFraldaPosG(entrada.pesoFraldaPosG ?? '')
          setTrocouFralda(!!entrada.trocouFralda)
          // Registro antigo feito com o protocolo ativo continua mostrando os campos na
          // edicao, mesmo que o protocolo tenha sido desligado depois.
          setProtocoloNaEntrada(entrada.pesoFraldaInicialG != null || entrada.pesoFraldaPosG != null || entrada.trocouFralda != null)
        } else if (entrada.tipoEvento === 'perda') {
          setPerda(entrada.perda)
          setPerdaCategoria(entrada.perdaAtividadeCategoria || '')
          setPerdaDetalhe(entrada.perdaAtividadeDetalhe || '')
        } else if (entrada.tipoEvento === 'intestinal') {
          setFezesEscala(entrada.fezesEscala)
        }
        setCarregandoEntrada(false)
      })
      .catch(() => {
        if (!ativo) return
        setEntradaNaoEncontrada(true)
        setCarregandoEntrada(false)
      })
    return () => { ativo = false }
  }, [id, modoEdicao])

  // O peso da fralda seca nao muda: num registro novo, ja vem com o ultimo valor informado.
  useEffect(() => {
    if (modoEdicao || !perfil?.protocoloUrgencia) return
    let ativo = true
    buscarUltimoPesoFraldaInicial(perfil.id)
      .then((peso) => { if (ativo && peso != null) setPesoFraldaInicialG((atual) => (atual === '' ? peso : atual)) })
      .catch(() => {})
    return () => { ativo = false }
  }, [modoEdicao, perfil?.id, perfil?.protocoloUrgencia])

  if (!modoEdicao && (!TIPOS_VALIDOS.includes(tipoDaRota) || !ciclo?.dataInicio)) {
    return <Navigate to="/app/diario" replace />
  }
  if (modoEdicao && entradaNaoEncontrada) {
    return <Navigate to="/app/diario" replace />
  }
  if (modoEdicao && (carregandoEntrada || !ciclo)) {
    return <p style={{ color: colors.textSecondary }}>Carregando...</p>
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (tipo === 'liquido' && !liquidoMl && liquidoMl !== 0) {
      setErro('Informe a quantidade de líquido ingerido.')
      return
    }
    if (tipo === 'banheiro' && !fezXixi && !fezCoco) {
      setErro('Marque se fez xixi, cocô ou os dois.')
      return
    }
    if ((tipo === 'intestinal' || (tipo === 'banheiro' && fezCoco)) && !fezesEscala) {
      setErro('Selecione a classificação das fezes.')
      return
    }

    const registradoEm = new Date(horario).toISOString()
    const diaNumero = calcularDiaNumeroPara(ciclo, registradoEm)

    if (diaNumero < 1 || new Date(registradoEm) > new Date()) {
      setErro(mensagemForaDoCiclo(ciclo))
      return
    }

    const dadosEntrada = {
      registradoEm,
      diaNumero,
      tipoEvento: tipo,
      liquidoTipo,
      liquidoTipoOutro,
      liquidoMl: liquidoMl === '' ? null : Number(liquidoMl),
      volumeUrinadoMl: volumeUrinadoMl === '' ? null : Number(volumeUrinadoMl),
      volumeUrinadoNivel,
      urgencia: urgencia || null,
      esvaziamentoCompleto,
      gotejamentoPosMiccional,
      // Pesos so contam quando houve troca; o total de trocas do dia e somado pelo sistema.
      trocouFralda: mostrarProtocolo ? trocouFralda : null,
      pesoFraldaInicialG: mostrarProtocolo && trocouFralda && pesoFraldaInicialG !== '' ? Number(pesoFraldaInicialG) : null,
      pesoFraldaPosG: mostrarProtocolo && trocouFralda && pesoFraldaPosG !== '' ? Number(pesoFraldaPosG) : null,
      perda,
      perdaAtividadeCategoria: perdaCategoria,
      perdaAtividadeDetalhe: perdaDetalhe,
      fezesEscala,
    }

    setSalvando(true)
    try {
      if (modoEdicao) {
        await atualizarEntrada(id, dadosEntrada)
        navigate(-1)
      } else if (tipo === 'banheiro') {
        const tipos = [fezXixi && 'urinario', fezCoco && 'intestinal'].filter(Boolean)
        await criarEntradas(tipos.map((t) => ({ cicloId: ciclo.id, pacienteId: perfil.id, ...dadosEntrada, tipoEvento: t })))
        navigate('/app/diario', { replace: true })
      } else {
        await criarEntrada({ cicloId: ciclo.id, pacienteId: perfil.id, ...dadosEntrada })
        navigate('/app/diario', { replace: true })
      }
    } catch (err) {
      if (err.message?.includes('entradas_diario_dia_numero_check')) {
        setErro(mensagemForaDoCiclo(ciclo))
      } else {
        setErro(err.message || 'Não foi possível salvar. Tente novamente.')
      }
    } finally {
      setSalvando(false)
    }
  }

  // Campos de xixi e de coco - usados tanto nos registros individuais (edicao de
  // entradas antigas) quanto juntos no formulario "Fui ao banheiro".
  const camposXixi = (
    <>
      <div>
        <label className="block text-sm font-medium mb-2">Volume urinado (ml) <span className="font-normal" style={{ color: colors.textSecondary }}>(opcional)</span></label>
        <input
          type="number"
          min="0"
          placeholder="ml"
          value={volumeUrinadoMl}
          onChange={(e) => setVolumeUrinadoMl(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Nível do volume</label>
        <SeletorNivelVolume value={volumeUrinadoNivel} onChange={setVolumeUrinadoNivel} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Necessidade de urinar</label>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => setUrgencia('')}
            className="px-3 py-1.5 rounded-full text-sm border font-medium"
            style={{
              borderColor: urgencia === '' ? colors.secondary : colors.border,
              background: urgencia === '' ? colors.secondary : colors.surface,
              color: urgencia === '' ? '#fff' : colors.text,
            }}
          >
            Nenhuma
          </button>
          <SeletorSeveridade value={urgencia} onChange={setUrgencia} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Sentiu que esvaziou a bexiga por completo?</label>
        <SeletorSimNao value={esvaziamentoCompleto} onChange={setEsvaziamentoCompleto} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Pingou xixi ao se levantar do vaso?</label>
        <SeletorSimNao value={gotejamentoPosMiccional} onChange={setGotejamentoPosMiccional} />
      </div>
      {mostrarProtocolo && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: colors.background }}>
          <p className="text-sm font-medium" style={{ color: colors.secondary }}>Protocolo de urgência</p>
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={trocouFralda}
              onChange={(e) => setTrocouFralda(e.target.checked)}
              className="w-5 h-5"
              style={{ accentColor: colors.primary }}
            />
            Troquei a fralda agora
          </label>
          {trocouFralda && (
            <>
              <CampoNumero
                label="Peso inicial da fralda (g)"
                dica="Fralda seca, antes de usar. Fica salvo para os próximos registros."
                value={pesoFraldaInicialG}
                onChange={setPesoFraldaInicialG}
              />
              <CampoNumero label="Peso da fralda após a troca (g)" value={pesoFraldaPosG} onChange={setPesoFraldaPosG} />
            </>
          )}
        </div>
      )}
    </>
  )

  const camposCoco = (
    <div>
      <label className="block text-sm font-medium mb-2">Como estava?</label>
      <SeletorEscalaFezes value={fezesEscala} onChange={setFezesEscala} />
    </div>
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto rounded-2xl p-6 space-y-6"
      style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
    >
      <h1 className="text-lg font-semibold" style={{ color: colors.secondary }}>
        {modoEdicao ? 'Editar registro' : TITULO_POR_TIPO[tipo]}
      </h1>

      <div>
        <label className="block text-sm font-medium mb-1">Horário</label>
        <input
          type="datetime-local"
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          min={limitesDoCiclo(ciclo).min}
          max={limitesDoCiclo(ciclo).max}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: colors.border }}
        />
      </div>

      {tipo === 'liquido' && (
        <div>
          <label className="block text-sm font-medium mb-2">Líquido ingerido</label>
          <ChipSeletorLiquido
            tipo={liquidoTipo}
            tipoOutro={liquidoTipoOutro}
            onChangeTipo={setLiquidoTipo}
            onChangeTipoOutro={setLiquidoTipoOutro}
          />
          <div className="mt-2">
            <AtalhosVolume value={liquidoMl} onChange={setLiquidoMl} placeholder="Quantidade em ml" />
          </div>
        </div>
      )}

      {tipo === 'urinario' && camposXixi}

      {tipo === 'perda' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Intensidade da perda</label>
            <SeletorSeveridade value={perda} onChange={setPerda} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Atividade na ocasião</label>
            <SeletorAtividade
              categoria={perdaCategoria}
              detalhe={perdaDetalhe}
              onChangeCategoria={setPerdaCategoria}
              onChangeDetalhe={setPerdaDetalhe}
            />
          </div>
        </>
      )}

      {tipo === 'intestinal' && camposCoco}

      {tipo === 'banheiro' && (
        <>
          <SecaoBanheiro titulo="Fiz xixi" marcado={fezXixi} onChange={setFezXixi}>
            {camposXixi}
          </SecaoBanheiro>
          <SecaoBanheiro titulo="Fiz cocô" marcado={fezCoco} onChange={setFezCoco}>
            {camposCoco}
          </SecaoBanheiro>
        </>
      )}

      {erro && <p className="text-sm" style={{ color: colors.danger }}>{erro}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="flex-1 py-2 rounded-lg font-medium text-white disabled:opacity-60"
          style={{ background: colors.primary }}
        >
          {salvando ? 'Salvando...' : 'Salvar registro'}
        </button>
        {modoEdicao && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="py-2 px-4 rounded-lg text-sm underline"
            style={{ color: colors.textSecondary }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

// Bloco do formulario "Fui ao banheiro": caixa de marcar no topo e, quando marcada,
// os mesmos campos do registro individual de xixi ou de coco logo abaixo.
function SecaoBanheiro({ titulo, marcado, onChange, children }) {
  return (
    <div
      className="rounded-xl p-4 space-y-4"
      style={{ border: `1px solid ${marcado ? colors.primary : colors.border}` }}
    >
      <label className="flex items-center gap-2 font-medium cursor-pointer" style={{ color: colors.secondary }}>
        <input
          type="checkbox"
          checked={marcado}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5"
          style={{ accentColor: colors.primary }}
        />
        {titulo}
      </label>
      {marcado && children}
    </div>
  )
}

function CampoNumero({ label, dica, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {dica && <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>{dica}</p>}
      <input
        type="number"
        min="0"
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: colors.border, background: colors.surface }}
      />
    </div>
  )
}
