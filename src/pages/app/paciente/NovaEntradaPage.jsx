import { useState } from 'react'
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { calcularDiaNumeroPara } from '../../../lib/ciclosDiarioApi'
import { criarEntrada } from '../../../lib/entradasDiarioApi'
import ChipSeletorLiquido from '../../../components/ChipSeletorLiquido'
import AtalhosVolume from '../../../components/AtalhosVolume'
import SeletorSeveridade from '../../../components/SeletorSeveridade'
import SeletorAtividade from '../../../components/SeletorAtividade'
import SeletorNivelVolume from '../../../components/SeletorNivelVolume'
import { colors } from '../../../theme'

const TIPOS_VALIDOS = ['liquido', 'urinario', 'perda']

const TITULO_POR_TIPO = {
  liquido: 'Novo registro de líquido',
  urinario: 'Registrar ida ao banheiro',
  perda: 'Registrar perda de urina',
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
  const { tipo } = useParams()
  const navigate = useNavigate()

  const [horario, setHorario] = useState(agoraParaInputLocal())

  // Campos especificos de "liquido"
  const [liquidoTipo, setLiquidoTipo] = useState('agua')
  const [liquidoTipoOutro, setLiquidoTipoOutro] = useState('')
  const [liquidoMl, setLiquidoMl] = useState(200)

  // Campos especificos de "urinario"
  const [volumeUrinadoMl, setVolumeUrinadoMl] = useState('')
  const [volumeUrinadoNivel, setVolumeUrinadoNivel] = useState('')
  const [urgencia, setUrgencia] = useState('')

  // Campos especificos de "perda"
  const [perda, setPerda] = useState('pequena')
  const [perdaCategoria, setPerdaCategoria] = useState('')
  const [perdaDetalhe, setPerdaDetalhe] = useState('')

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  if (!TIPOS_VALIDOS.includes(tipo) || !ciclo) {
    return <Navigate to="/app/diario" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (tipo === 'liquido' && !liquidoMl && liquidoMl !== 0) {
      setErro('Informe a quantidade de líquido ingerido.')
      return
    }

    const registradoEm = new Date(horario).toISOString()
    const diaNumero = calcularDiaNumeroPara(ciclo, registradoEm)

    if (diaNumero < 1 || new Date(registradoEm) > new Date()) {
      setErro(mensagemForaDoCiclo(ciclo))
      return
    }

    setSalvando(true)
    try {
      await criarEntrada({
        cicloId: ciclo.id,
        pacienteId: perfil.id,
        registradoEm,
        diaNumero,
        tipoEvento: tipo,
        liquidoTipo,
        liquidoTipoOutro,
        liquidoMl: liquidoMl === '' ? null : Number(liquidoMl),
        volumeUrinadoMl: volumeUrinadoMl === '' ? null : Number(volumeUrinadoMl),
        volumeUrinadoNivel,
        urgencia: urgencia || null,
        perda,
        perdaAtividadeCategoria: perdaCategoria,
        perdaAtividadeDetalhe: perdaDetalhe,
      })

      navigate('/app/diario', { replace: true })
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

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto rounded-2xl p-6 space-y-6"
      style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
    >
      <h1 className="text-lg font-semibold" style={{ color: colors.secondary }}>{TITULO_POR_TIPO[tipo]}</h1>

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

      {tipo === 'urinario' && (
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
            <label className="block text-sm font-medium mb-2">Necessidade urgente de urinar</label>
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
        </>
      )}

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

      {erro && <p className="text-sm" style={{ color: colors.danger }}>{erro}</p>}

      <button
        type="submit"
        disabled={salvando}
        className="w-full py-2 rounded-lg font-medium text-white disabled:opacity-60"
        style={{ background: colors.primary }}
      >
        {salvando ? 'Salvando...' : 'Salvar registro'}
      </button>
    </form>
  )
}
