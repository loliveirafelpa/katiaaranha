import { GlassWater, Check } from 'lucide-react'
import { colors, fonts } from '../theme'

function litros(ml) {
  return ml >= 1000 ? `${(ml / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L` : `${Math.round(ml)} ml`
}

// Meta diaria de liquido do paciente (calcularMetaLiquidoMl) com o quanto ja bebeu hoje.
// Faixa (66+ anos): a barra enche ate o minimo, e o texto mostra a faixa inteira.
export default function MetaLiquidoDia({ meta, bebidoMl }) {
  const alvo = meta.min
  const pct = Math.min(100, (bebidoMl / alvo) * 100)
  const atingiu = bebidoMl >= alvo
  const textoMeta = meta.min === meta.max ? litros(meta.min) : `${litros(meta.min)} a ${litros(meta.max)}`
  const falta = Math.max(0, alvo - bebidoMl)

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="flex items-center gap-1.5 text-sm font-medium" style={{ color: colors.secondary }}>
          <GlassWater size={16} color={colors.secondary} aria-hidden="true" />
          Sua meta de líquido hoje: {textoMeta}
        </p>
        <p className="text-sm tabular-nums" style={{ color: colors.text, fontFamily: fonts.heading }}>
          <span className="font-semibold">{litros(bebidoMl)}</span>
          <span style={{ color: colors.textSecondary }}> de {litros(alvo)}</span>
        </p>
      </div>
      <div
        className="mt-2 h-2.5 rounded-full overflow-hidden"
        style={{ background: colors.background }}
        role="progressbar"
        aria-label="Líquido bebido hoje em relação à meta"
        aria-valuemin={0}
        aria-valuemax={Math.round(alvo)}
        aria-valuenow={Math.round(Math.min(bebidoMl, alvo))}
      >
        <div className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${pct}%`, background: colors.secondary }} />
      </div>
      <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: colors.textSecondary }}>
        {atingiu ? (
          <>
            <Check size={14} color={colors.secondary} aria-hidden="true" />
            Meta do dia alcançada.
          </>
        ) : (
          `Faltam ${litros(falta)} para chegar na meta.`
        )}
      </p>
    </div>
  )
}
