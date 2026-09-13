import { colors } from '../../theme'

// Petala apontando para cima, com a base no eixo (0,0) - fica facil de girar em torno
// do centro da flor so trocando o angulo no transform do <path>.
function petalPath(largura, comprimento) {
  return `M0,0 C -${largura},-${comprimento * 0.25} -${largura * 0.8},-${comprimento * 0.75} 0,-${comprimento} ` +
    `C ${largura * 0.8},-${comprimento * 0.75} ${largura},-${comprimento * 0.25} 0,0 Z`
}

const PETALAS_TRAS = [-70, -35, 0, 35, 70]
const PETALAS_FRENTE = [-38, 0, 38]
const PONTOS_MANDALA = [0, 60, 120, 180, 240, 300]

// Marca da plataforma: lotus em degrade de laranja com um pequeno padrao de mandala no
// centro - mesma referencia visual do logo da CPA Fisioterapia (lotus + mandala), redesenhada
// para o Diario Miccional.
export default function LogoLotus({ size = 40, className = '', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id="lotusOuter" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="100%" stopColor={colors.primary} />
        </linearGradient>
        <linearGradient id="lotusInner" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.primaryLight} />
        </linearGradient>
      </defs>

      {PETALAS_TRAS.map((angulo) => (
        <path
          key={`tras-${angulo}`}
          d={petalPath(7, 38)}
          fill="url(#lotusOuter)"
          transform={`translate(50,92) rotate(${angulo})`}
        />
      ))}
      {PETALAS_FRENTE.map((angulo) => (
        <path
          key={`frente-${angulo}`}
          d={petalPath(5, 27)}
          fill="url(#lotusInner)"
          transform={`translate(50,92) rotate(${angulo})`}
        />
      ))}

      <circle cx="50" cy="72" r="7" fill={colors.secondary} />
      {PONTOS_MANDALA.map((angulo) => {
        const rad = (angulo * Math.PI) / 180
        return (
          <circle
            key={angulo}
            cx={50 + 4 * Math.sin(rad)}
            cy={72 - 4 * Math.cos(rad)}
            r="1.1"
            fill={colors.primaryLight}
          />
        )
      })}
      <circle cx="50" cy="72" r="1.4" fill={colors.primaryLight} />
    </svg>
  )
}

// Padrao decorativo de mandala/lotus para usar como marca d'agua de fundo em telas com
// espaco livre (landing, login) - bem sutil, nunca sobre areas com dado clinico denso.
export function MandalaWatermark({ size = 480, className = '', style }) {
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
