import { supabase } from './supabaseClient'

async function chamarEdgeFunction(nome, body) {
  const { data: sessao } = await supabase.auth.getSession()
  const token = sessao?.session?.access_token
  if (!token) throw new Error('Sessão expirada, faça login novamente.')

  const { data, error } = await supabase.functions.invoke(nome, {
    body,
    headers: { Authorization: `Bearer ${token}` },
  })

  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data
}

export async function criarPaciente({ nomeCompleto, email, contato, unidade }) {
  return chamarEdgeFunction('criar-paciente', { nomeCompleto, email, contato, unidade })
}

export async function solicitarExclusaoPaciente(pacienteId) {
  return chamarEdgeFunction('excluir-paciente', { pacienteId })
}
