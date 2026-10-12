import { GlassWater, Toilet, Droplet } from 'lucide-react'
import { colors } from '../theme'

// "Regua do dia": a folha impressa do diario (horas x colunas) deitada e resumida.
// Tres trilhas - liquido, banheiro, perda - de 0h a 24h, com um ponto por registro no
// horario em que aconteceu. Da pra paciente ver o proprio dia de relance.

const TRILHAS = [
  { chave: 'liquido', label: 'Líquido', Icone: GlassWater, cor: colors.secondary, tipos: ['liquido'] },
  { chave: 'banheiro', label: 'Banheiro', Icone: Toilet, cor: colors.primary, tipos: ['urinario', 'intestinal'] },
  { chave: 'perda', label: 'Perda', Icone: Droplet, cor: colors.danger, tipos: ['perda'] },
]
const MARCAS_HORA = [0, 6, 12, 18, 24]

function minutosDoDia(iso) {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

function hora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// agoraMin: posicao da linha "agora" (so no dia de hoje); null esconde.
export default function ReguaDoDia({ entradas, agoraMin = null }) {
  const pct = (min) => `${(min / 1440) * 100}%`
  return (
    <div aria-label="Resumo do dia por horário" role="img">
      <div className="space-y-2">
        {TRILHAS.map(({ chave, label, Icone, cor, tipos }) => {
          const daTrilha = entradas.filter((e) => tipos.includes(e.tipoEvento))
          return (
            <div key={chave} className="flex items-center gap-3">
              <span className="w-20 shrink-0 flex items-center gap-1.5 text-xs" style={{ color: colors.textSecondary }}>
                <Icone size={14} strokeWidth={2.25} color={cor} aria-hidden="true" />
                {label}
              </span>
              <div className="relative flex-1 h-5">
                <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: colors.border }} />
                {MARCAS_HORA.slice(1, -1).map((h) => (
                  <div key={h} className="absolute top-1 bottom-1 w-px" style={{ left: pct(h * 60), background: colors.border }} />
                ))}
                {agoraMin != null && (
                  <div className="absolute -top-0.5 -bottom-0.5 w-0.5 rounded-full" style={{ left: pct(agoraMin), background: colors.primaryLight }} />
                )}
                {daTrilha.map((e) => (
                  <span
                    key={e.id}
                    title={`${label} às ${hora(e.registradoEm)}`}
                    className="absolute top-1/2 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full"
                    style={{ left: pct(minutosDoDia(e.registradoEm)), background: cor, boxShadow: `0 0 0 2px ${colors.surface}` }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3 mt-1">
        <span className="w-20 shrink-0" />
        <div className="relative flex-1 h-4 text-[10px] tabular-nums" style={{ color: colors.textSecondary }}>
          {MARCAS_HORA.map((h, i) => (
            <span
              key={h}
              className="absolute"
              style={{ left: pct(h * 60), transform: i === 0 ? 'none' : i === MARCAS_HORA.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)' }}
            >
              {h}h
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
