import { supabase } from './supabaseClient'

function paraCamel(row) {
  if (!row) return null
  return {
    id: row.id,
    role: row.role,
    nomeCompleto: row.nome_completo,
    contato: row.contato,
    unidade: row.unidade,
    anonimizadoEm: row.anonimizado_em,
    criadoEm: row.criado_em,
  }
}

export async function listarPacientes() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, nome_completo, contato, unidade, anonimizado_em, criado_em')
    .eq('role', 'paciente')
    .order('criado_em', { ascending: false })

  if (error) throw error
  return data.map(paraCamel)
}

export async function obterPacientePorId(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, nome_completo, contato, unidade, anonimizado_em, criado_em')
    .eq('id', id)
    .single()

  if (error) throw error
  return paraCamel(data)
}

export async function atualizarMeuPerfil(pacienteId, { contato }) {
  const { error } = await supabase
    .from('profiles')
    .update({ contato })
    .eq('id', pacienteId)

  if (error) throw error
}
