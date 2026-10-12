import { supabase } from './supabaseClient'

function exercicioParaCamel(row) {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria,
    categoriaOutro: row.categoria_outro,
    descricao: row.descricao,
    instrucoes: row.instrucoes,
    seriesPadrao: row.series_padrao,
    repeticoesPadrao: row.repeticoes_padrao,
    ativo: row.ativo,
  }
}

function prescricaoParaCamel(row) {
  return {
    id: row.id,
    pacienteId: row.paciente_id,
    exercicioId: row.exercicio_id,
    vezesPorSemana: row.vezes_por_semana,
    series: row.series,
    repeticoes: row.repeticoes,
    observacao: row.observacao,
    dataInicio: row.data_inicio,
    dataFim: row.data_fim,
    criadoEm: row.criado_em,
    exercicio: row.exercicios ? exercicioParaCamel(row.exercicios) : null,
  }
}

// Data de hoje no fuso local, no formato do banco (yyyy-mm-dd)
export function hojeIso() {
  const agora = new Date()
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset())
  return agora.toISOString().slice(0, 10)
}

export async function listarExercicios({ incluirInativos = false } = {}) {
  let query = supabase.from('exercicios').select('*').order('categoria').order('nome')
  if (!incluirInativos) query = query.eq('ativo', true)
  const { data, error } = await query
  if (error) throw error
  return data.map(exercicioParaCamel)
}

export async function criarExercicio(exercicio) {
  const { data, error } = await supabase
    .from('exercicios')
    .insert(exercicioParaBanco(exercicio))
    .select('*')
    .single()
  if (error) throw error
  return exercicioParaCamel(data)
}

function exercicioParaBanco({ nome, categoria, categoriaOutro, descricao, instrucoes, seriesPadrao, repeticoesPadrao }) {
  return {
    nome,
    categoria,
    categoria_outro: categoria === 'outro' ? categoriaOutro?.trim() || null : null,
    descricao: descricao || null,
    instrucoes: instrucoes || null,
    series_padrao: seriesPadrao || null,
    repeticoes_padrao: repeticoesPadrao || null,
  }
}

// Editar muda tambem o que aparece para quem ja recebeu o exercicio (nome, instrucoes):
// a prescricao aponta pro exercicio do catalogo, nao guarda uma copia.
export async function atualizarExercicio(id, exercicio) {
  const { data, error } = await supabase
    .from('exercicios')
    .update(exercicioParaBanco(exercicio))
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return exercicioParaCamel(data)
}

// Exercicio nao e apagado (prescricoes antigas apontam pra ele) - so sai do catalogo.
export async function definirExercicioAtivo(id, ativo) {
  const { error } = await supabase.from('exercicios').update({ ativo }).eq('id', id)
  if (error) throw error
}

export async function listarPrescricoesPorPaciente(pacienteId) {
  const { data, error } = await supabase
    .from('prescricoes_exercicio')
    .select('*, exercicios(*)')
    .eq('paciente_id', pacienteId)
    .order('data_inicio', { ascending: false })
    .order('criado_em', { ascending: true })
  if (error) throw error
  return data.map(prescricaoParaCamel)
}

export async function criarPrescricoes(prescricoes) {
  const { error } = await supabase.from('prescricoes_exercicio').insert(
    prescricoes.map((p) => ({
      paciente_id: p.pacienteId,
      exercicio_id: p.exercicioId,
      prescrito_por: p.prescritoPor,
      vezes_por_semana: p.vezesPorSemana,
      series: p.series || null,
      repeticoes: p.repeticoes || null,
      observacao: p.observacao || null,
      data_inicio: p.dataInicio,
      data_fim: p.dataFim,
    }))
  )
  if (error) throw error
}

export async function excluirPrescricao(id) {
  const { error } = await supabase.from('prescricoes_exercicio').delete().eq('id', id)
  if (error) throw error
}
