import { supabase } from './supabaseClient'

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSessaoAtual() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getPerfilAtual() {
  const { data: sessao } = await supabase.auth.getSession()
  const user = sessao?.session?.user
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, nome_completo, contato, unidade, anonimizado_em, criado_em')
    .eq('id', user.id)
    .single()

  if (error) throw error

  return {
    id: data.id,
    role: data.role,
    nomeCompleto: data.nome_completo,
    contato: data.contato,
    unidade: data.unidade,
    anonimizadoEm: data.anonimizado_em,
    criadoEm: data.criado_em,
  }
}

export async function trocarSenha(novaSenha) {
  const { error } = await supabase.auth.updateUser({ password: novaSenha })
  if (error) throw error
}
