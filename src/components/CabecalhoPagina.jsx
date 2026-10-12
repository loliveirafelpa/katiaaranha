import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { colors, fonts } from '../theme'

// Topo das paginas do admin, no mesmo tom do diario do paciente: link de volta (opcional),
// linha pequena em cima (eyebrow), titulo em Poppins e acoes a direita.
export default function CabecalhoPagina({ voltar, eyebrow, titulo, subtitulo, acoes, antesDoTitulo }) {
  return (
    <div className="space-y-3">
      {voltar && (
        <Link
          to={voltar.to}
          className="inline-flex items-center gap-1 text-sm font-medium rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ color: colors.accent, outlineColor: colors.primary }}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          {voltar.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {antesDoTitulo}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.accent }}>{eyebrow}</p>
            )}
            <h1
              className="mt-0.5 text-2xl sm:text-3xl leading-tight tracking-tight"
              style={{ fontFamily: fonts.heading, fontWeight: 600, color: colors.secondary }}
            >
              {titulo}
            </h1>
            {subtitulo && <div className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{subtitulo}</div>}
          </div>
        </div>
        {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
      </div>
    </div>
  )
}

// Circulo com as iniciais do paciente - ajuda a achar alguem na lista de relance.
export function AvatarIniciais({ nome, tamanho = 44 }) {
  const partes = (nome || '').trim().split(/\s+/).filter(Boolean)
  const iniciais = ((partes[0]?.[0] || '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
  return (
    <span
      aria-hidden="true"
      className="shrink-0 rounded-full flex items-center justify-center font-semibold"
      style={{
        width: tamanho,
        height: tamanho,
        fontSize: tamanho * 0.36,
        background: colors.background,
        color: colors.accent,
        border: `1px solid ${colors.border}`,
        fontFamily: fonts.heading,
      }}
    >
      {iniciais || '?'}
    </span>
  )
}

// Botao de acao secundaria do topo (Editar, Excluir...), com icone.
export function BotaoAcao({ as: Comp = 'button', Icone, perigo = false, children, ...props }) {
  const cor = perigo ? colors.danger : colors.secondary
  return (
    <Comp
      {...props}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ background: colors.surface, border: `1px solid ${colors.border}`, color: cor, outlineColor: colors.primary }}
    >
      {Icone && <Icone size={16} aria-hidden="true" />}
      {children}
    </Comp>
  )
}
