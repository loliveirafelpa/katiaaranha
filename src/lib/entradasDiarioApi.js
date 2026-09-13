import { supabase } from './supabaseClient'

function paraCamel(row) {
  return {
    id: row.id,
    cicloId: row.ciclo_id,
    pacienteId: row.paciente_id,
    registradoEm: row.registrado_em,
    diaNumero: row.dia_numero,
    liquidoTipo: row.liquido_tipo,
    liquidoTipoOutro: row.liquido_tipo_outro,
    liquidoMl: row.liquido_ml,
    volumeUrinadoMl: row.volume_urinado_ml,
    urgencia: row.urgencia,
    perda: row.perda,
    perdaAtividadeCategoria: row.perda_atividade_categoria,
    perdaAtividadeDetalhe: row.perda_atividade_detalhe,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  }
}

export async function listarEntradasPorCiclo(cicloId) {
  const { data, error } = await supabase
    .from('entradas_diario')
    .select('*')
    .eq('ciclo_id', cicloId)
    .order('registrado_em', { ascending: true })

  if (error) throw error
  return data.map(paraCamel)
}

export async function listarEntradasPorDia(cicloId, diaNumero) {
  const { data, error } = await supabase
    .from('entradas_diario')
    .select('*')
    .eq('ciclo_id', cicloId)
    .eq('dia_numero', diaNumero)
    .order('registrado_em', { ascending: true })

  if (error) throw error
  return data.map(paraCamel)
}

export async function criarEntrada({
  cicloId,
  pacienteId,
  registradoEm,
  diaNumero,
  liquidoTipo,
  liquidoTipoOutro,
  liquidoMl,
  volumeUrinadoMl,
  urgencia,
  perda,
  perdaAtividadeCategoria,
  perdaAtividadeDetalhe,
}) {
  const { data, error } = await supabase
    .from('entradas_diario')
    .insert({
      ciclo_id: cicloId,
      paciente_id: pacienteId,
      registrado_em: registradoEm,
      dia_numero: diaNumero,
      liquido_tipo: liquidoTipo,
      liquido_tipo_outro: liquidoTipoOutro || null,
      liquido_ml: liquidoMl,
      volume_urinado_ml: volumeUrinadoMl ?? null,
      urgencia: urgencia || null,
      perda,
      perda_atividade_categoria: perda !== 'sem_perda' ? perdaAtividadeCategoria || null : null,
      perda_atividade_detalhe: perda !== 'sem_perda' ? perdaAtividadeDetalhe || null : null,
    })
    .select('*')
    .single()

  if (error) throw error
  return paraCamel(data)
}

export async function atualizarEntrada(id, campos) {
  const payload = {}
  if ('registradoEm' in campos) payload.registrado_em = campos.registradoEm
  if ('liquidoTipo' in campos) payload.liquido_tipo = campos.liquidoTipo
  if ('liquidoTipoOutro' in campos) payload.liquido_tipo_outro = campos.liquidoTipoOutro || null
  if ('liquidoMl' in campos) payload.liquido_ml = campos.liquidoMl
  if ('volumeUrinadoMl' in campos) payload.volume_urinado_ml = campos.volumeUrinadoMl ?? null
  if ('urgencia' in campos) payload.urgencia = campos.urgencia || null
  if ('perda' in campos) payload.perda = campos.perda
  if ('perdaAtividadeCategoria' in campos) payload.perda_atividade_categoria = campos.perdaAtividadeCategoria || null
  if ('perdaAtividadeDetalhe' in campos) payload.perda_atividade_detalhe = campos.perdaAtividadeDetalhe || null

  const { error } = await supabase.from('entradas_diario').update(payload).eq('id', id)
  if (error) throw error
}

export async function excluirEntrada(id) {
  const { error } = await supabase.from('entradas_diario').delete().eq('id', id)
  if (error) throw error
}
