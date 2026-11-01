import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { colors } from '../theme'

// Campo de senha com botao "Mostrar"/"Ocultar" escrito por extenso (nao so icone): boa
// parte das pacientes e mais velha e erra a senha sem conseguir ver o que digitou.
// Comeca sempre oculta.
export default function CampoSenha({ id, value, onChange, autoComplete = 'current-password', required, className = '' }) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type={visivel ? 'text' : 'password'}
        required={required}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={onChange}
        className="w-full pl-3 pr-28 py-2 rounded-lg border outline-none"
        style={{ borderColor: colors.border }}
      />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-pressed={visivel}
        aria-controls={id}
        className="absolute inset-y-0 right-0 flex items-center gap-1.5 px-3 text-sm font-medium rounded-r-lg focus-visible:outline-2"
        style={{ color: colors.primary, outlineColor: colors.primary }}
      >
        {visivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        {visivel ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  )
}
