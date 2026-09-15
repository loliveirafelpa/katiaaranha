import { colors } from '../../theme'

// Padrao decorativo de mandala/lotus para usar como marca d'agua de fundo em telas com
// espaco livre (landing, login) - bem sutil, nunca sobre areas com dado clinico denso.
export default function MandalaWatermark({ size = 480, className = '', style }) {
  const petalas = 12
  const angulos = Array.from({ length: petalas }, (_, i) => (360 / petalas) * i)

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={className} style={style} aria-hidden="true">
      <circle cx="100" cy="100" r="98" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.35" />
      <circle cx="100" cy="100" r="70" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.35" />
      <circle cx="100" cy="100" r="40" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.35" />
      {angulos.map((angulo) => (
        <path
          key={angulo}
          d="M100,30 C92,50 92,70 100,84 C108,70 108,50 100,30 Z"
          fill={colors.primary}
          opacity="0.18"
          transform={`rotate(${angulo} 100 100)`}
        />
      ))}
    </svg>
  )
}
