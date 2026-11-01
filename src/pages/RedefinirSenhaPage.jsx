import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import LogoCpa from '../components/brand/LogoCpa'
import TrocarSenhaCard from '../components/TrocarSenhaCard'
import { colors } from '../theme'

// Destino do link do e-mail de "Esqueci minha senha". O supabase-js le o token do endereco
// sozinho e abre uma sessao temporaria de recuperacao; aqui so falta a pessoa escolher a
// senha nova. Link vencido ou ja usado nao abre sessao nenhuma.
export default function RedefinirSenhaPage() {
  const [estado, setEstado] = useState('carregando') // carregando | pronto | invalido

  useEffect(() => {
    let ativo = true
    // getSession espera o supabase-js terminar de ler o token do endereco.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (ativo) setEstado(session ? 'pronto' : 'invalido')
    })
    return () => { ativo = false }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: colors.background }}>
      <div className="w-full max-w-sm">
        <LogoCpa height={48} className="mb-4" />

        {estado === 'carregando' && <p style={{ color: colors.textSecondary }}>Carregando...</p>}

        {estado === 'invalido' && (
          <div className="rounded-2xl p-6" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
            <h1 className="font-semibold mb-2" style={{ color: colors.secondary }}>Link expirado</h1>
            <p className="text-sm mb-4" style={{ color: colors.text }}>
              Este link para criar uma senha nova já foi usado ou passou do prazo. Peça um novo link e use o mais recente
              que chegar no seu e-mail.
            </p>
            <Link to="/esqueci-senha" className="underline text-sm" style={{ color: colors.primary }}>Pedir um novo link</Link>
          </div>
        )}

        {estado === 'pronto' && (
          <TrocarSenhaCard
            titulo="Criar senha nova"
            dica="Escolha uma senha com pelo menos 6 caracteres. Depois de salvar, você já entra no diário."
            onSucesso={() => window.location.replace('/app')}
          />
        )}
      </div>
    </div>
  )
}
