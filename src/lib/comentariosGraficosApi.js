import { supabase } from './supabaseClient'

function paraCamel(row) {
  return {
    id: row.id,
    pacienteId: row.paciente_id,
    cicloId: row.ciclo_id,
    grafico: row.grafico,
    autorId: row.autor_id,
    texto: row.texto,
    criadoEm: row.criado_em,
  }
}

// Todos os comentarios do paciente de uma vez (sao poucos) - cada grafico filtra os seus.
export async function listarComentariosGraficos(pacienteId) {
  const { data, error } = await supabase
    .from('comentarios_graficos')
    .select('*')
    .eq('paciente_id', pacienteId)
    .order('criado_em', { ascending: false })

  if (error) throw error
  return data.map(paraCamel)
}

export async function criarComentarioGrafico({ pacienteId, cicloId, grafico, autorId, texto }) {
  const { data, error } = await supabase
    .from('comentarios_graficos')
    .insert({
      paciente_id: pacienteId,
      ciclo_id: cicloId ?? null,
      grafico,
      autor_id: autorId,
      texto: texto.trim(),
    })
    .select('*')
    .single()

  if (error) throw error
  return paraCamel(data)
}

export async function excluirComentarioGrafico(id) {
  const { error } = await supabase.from('comentarios_graficos').delete().eq('id', id)
  if (error) throw error
}
