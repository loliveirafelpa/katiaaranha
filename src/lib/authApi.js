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
    .select('id, role, nome_completo, contato, unidade, idade, peso_kg, protocolo_urgencia, anonimizado_em, criado_em')
    .eq('id', user.id)
    .single()

  if (error) throw error

  return {
    id: data.id,
    role: data.role,
    nomeCompleto: data.nome_completo,
    contato: data.contato,
    unidade: data.unidade,
    idade: data.idade,
    pesoKg: data.peso_kg,
    protocoloUrgencia: data.protocolo_urgencia,
    anonimizadoEm: data.anonimizado_em,
    criadoEm: data.criado_em,
  }
}

// Manda o e-mail com o link de "Esqueci minha senha". O link volta pra /redefinir-senha
// deste mesmo endereco (precisa estar liberado em Auth > URL Configuration no Supabase).
export async function enviarLinkRedefinicaoSenha(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  })
  if (error) throw error
}

export async function trocarSenha(novaSenha) {
  const { error } = await supabase.auth.updateUser({ password: novaSenha })
  if (error) throw error
}
