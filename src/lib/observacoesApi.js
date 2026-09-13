import { supabase } from './supabaseClient'

function paraCamel(row) {
  if (!row) return null
  return {
    id: row.id,
    cicloId: row.ciclo_id,
    pacienteId: row.paciente_id,
    diaNumero: row.dia_numero,
    absorventeUso: row.absorvente_uso,
    absorventeTipo: row.absorvente_tipo,
    absorventeTipoOutro: row.absorvente_tipo_outro,
    absorventeQuantidade: row.absorvente_quantidade,
    menstruacao: row.menstruacao,
    menstruacaoInicio: row.menstruacao_inicio,
    menstruacaoFim: row.menstruacao_fim,
    medicamentosUso: row.medicamentos_uso,
    medicamentosQuais: row.medicamentos_quais,
    outrosSintomas: row.outros_sintomas,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  }
}

export async function obterObservacaoDoDia(cicloId, diaNumero) {
  const { data, error } = await supabase
    .from('observacoes_diarias')
    .select('*')
    .eq('ciclo_id', cicloId)
    .eq('dia_numero', diaNumero)
    .maybeSingle()

  if (error) throw error
  return paraCamel(data)
}

export async function listarObservacoesPorCiclo(cicloId) {
  const { data, error } = await supabase
    .from('observacoes_diarias')
    .select('*')
    .eq('ciclo_id', cicloId)
    .order('dia_numero', { ascending: true })

  if (error) throw error
  return data.map(paraCamel)
}

export async function salvarObservacaoDoDia({
  id,
  cicloId,
  pacienteId,
  diaNumero,
  absorventeUso,
  absorventeTipo,
  absorventeTipoOutro,
  absorventeQuantidade,
  menstruacao,
  menstruacaoInicio,
  menstruacaoFim,
  medicamentosUso,
  medicamentosQuais,
  outrosSintomas,
}) {
  const payload = {
    ciclo_id: cicloId,
    paciente_id: pacienteId,
    dia_numero: diaNumero,
    absorvente_uso: absorventeUso ?? null,
    absorvente_tipo: absorventeTipo || null,
    absorvente_tipo_outro: absorventeTipoOutro || null,
    absorvente_quantidade: absorventeQuantidade ?? null,
    menstruacao: menstruacao ?? null,
    menstruacao_inicio: menstruacaoInicio || null,
    menstruacao_fim: menstruacaoFim || null,
    medicamentos_uso: medicamentosUso ?? null,
    medicamentos_quais: medicamentosQuais || null,
    outros_sintomas: outrosSintomas || null,
  }

  const { data, error } = await supabase
    .from('observacoes_diarias')
    .upsert(id ? { id, ...payload } : payload, { onConflict: 'ciclo_id,dia_numero' })
    .select('*')
    .single()

  if (error) throw error
  return paraCamel(data)
}
