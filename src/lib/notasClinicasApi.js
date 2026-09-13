import { supabase } from './supabaseClient'

function paraCamel(row) {
  return {
    id: row.id,
    pacienteId: row.paciente_id,
    cicloId: row.ciclo_id,
    diaNumero: row.dia_numero,
    autorId: row.autor_id,
    texto: row.texto,
    criadoEm: row.criado_em,
  }
}

export async function listarNotasPorPaciente(pacienteId) {
  const { data, error } = await supabase
    .from('notas_clinicas')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('criado_em', { ascending: false })

  if (error) throw error
  return data.map(paraCamel)
}

export async function criarNota({ pacienteId, cicloId, diaNumero, autorId, texto }) {
  const { data, error } = await supabase
    .from('notas_clinicas')
    .insert({
      paciente_id: pacienteId,
      ciclo_id: cicloId || null,
      dia_numero: diaNumero ?? null,
      autor_id: autorId,
      texto,
    })
    .select('*')
    .single()

  if (error) throw error
  return paraCamel(data)
}

export async function excluirNota(id) {
  const { error } = await supabase.from('notas_clinicas').delete().eq('id', id)
  if (error) throw error
}
