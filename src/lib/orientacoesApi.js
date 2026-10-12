import { supabase } from './supabaseClient'

function paraCamel(row) {
  return {
    id: row.id,
    pacienteId: row.paciente_id,
    autorId: row.autor_id,
    texto: row.texto,
    criadoEm: row.criado_em,
  }
}

// Mais recente primeiro. RLS: o paciente so recebe as proprias; a admin, as de qualquer um.
export async function listarOrientacoes(pacienteId) {
  const { data, error } = await supabase
    .from('orientacoes_paciente')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('criado_em', { ascending: false })

  if (error) throw error
  return data.map(paraCamel)
}

export async function criarOrientacao({ pacienteId, autorId, texto }) {
  const { data, error } = await supabase
    .from('orientacoes_paciente')
    .insert({ paciente_id: pacienteId, autor_id: autorId, texto: texto.trim() })
    .select('*')
    .single()

  if (error) throw error
  return paraCamel(data)
}

export async function excluirOrientacao(id) {
  const { error } = await supabase.from('orientacoes_paciente').delete().eq('id', id)
  if (error) throw error
}

export function formatarDataOrientacao(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
