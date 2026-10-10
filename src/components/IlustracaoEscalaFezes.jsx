// Ilustracoes simples (SVG) representando a forma/textura de cada tipo da Escala de
// Bristol - nao sao fotos, sao formas abstratas desenhadas pra dar uma pista visual
// rapida ao lado da descricao em texto, no mesmo espirito minimalista dos outros icones.
export default function IlustracaoEscalaFezes({ tipo, cor, corFundo }) {
  const conteudo = {
    1: (
      <>
        <circle cx="8" cy="22" r="5" fill={cor} />
        <circle cx="20" cy="16" r="5" fill={cor} />
        <circle cx="32" cy="24" r="5" fill={cor} />
        <circle cx="44" cy="15" r="5" fill={cor} />
        <circle cx="56" cy="22" r="5" fill={cor} />
      </>
    ),
    2: (
      <>
        <ellipse cx="14" cy="20" rx="9" ry="8" fill={cor} />
        <ellipse cx="28" cy="17" rx="9" ry="8" fill={cor} />
        <ellipse cx="42" cy="21" rx="9" ry="8" fill={cor} />
        <ellipse cx="54" cy="18" rx="7" ry="7" fill={cor} />
      </>
    ),
    3: (
      <>
        <rect x="4" y="12" width="56" height="16" rx="8" fill={cor} />
        <line x1="16" y1="13" x2="14" y2="27" stroke={corFundo} strokeWidth="2" opacity="0.7" />
        <line x1="30" y1="13" x2="28" y2="27" stroke={corFundo} strokeWidth="2" opacity="0.7" />
        <line x1="44" y1="13" x2="42" y2="27" stroke={corFundo} strokeWidth="2" opacity="0.7" />
      </>
    ),
    4: <path d="M4 24 Q16 8 30 18 T58 14" stroke={cor} strokeWidth="9" strokeLinecap="round" fill="none" />,
    5: (
      <>
        <ellipse cx="11" cy="20" rx="9" ry="8" fill={cor} />
        <ellipse cx="32" cy="20" rx="9" ry="8" fill={cor} />
        <ellipse cx="53" cy="20" rx="9" ry="8" fill={cor} />
      </>
    ),
    6: (
      <path
        d="M6 22 Q10 10 18 16 Q24 6 30 16 Q38 8 44 18 Q52 10 58 20 Q56 30 46 26 Q40 34 30 28 Q22 34 14 28 Q6 30 6 22 Z"
        fill={cor}
      />
    ),
    7: (
      <>
        <path d="M4 14 Q9 9 14 14 T24 14 T34 14 T44 14 T54 14 T60 14" stroke={cor} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M4 22 Q9 17 14 22 T24 22 T34 22 T44 22 T54 22 T60 22" stroke={cor} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M4 30 Q9 25 14 30 T24 30 T34 30 T44 30 T54 30 T60 30" stroke={cor} strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 64 40" width="56" height="36" className="shrink-0">
      {conteudo[tipo]}
    </svg>
  )
}
