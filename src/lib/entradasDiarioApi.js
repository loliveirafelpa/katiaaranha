import { supabase } from './supabaseClient'

function paraCamel(row) {
  return {
    id: row.id,
    cicloId: row.ciclo_id,
    pacienteId: row.paciente_id,
    registradoEm: row.registrado_em,
    diaNumero: row.dia_numero,
    tipoEvento: row.tipo_evento,
    liquidoTipo: row.liquido_tipo,
    liquidoTipoOutro: row.liquido_tipo_outro,
    liquidoMl: row.liquido_ml,
    volumeUrinadoMl: row.volume_urinado_ml,
    volumeUrinadoNivel: row.volume_urinado_nivel,
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

// Cada entrada representa UM evento pontual de um unico tipo - liquido ingerido,
// ida ao banheiro (volume urinado) ou perda involuntaria - nunca uma combinacao,
// porque na vida real esses eventos nao acontecem todos no mesmo instante.
export async function criarEntrada({
  cicloId,
  pacienteId,
  registradoEm,
  diaNumero,
  tipoEvento,
  liquidoTipo,
  liquidoTipoOutro,
  liquidoMl,
  volumeUrinadoMl,
  volumeUrinadoNivel,
  urgencia,
  perda,
  perdaAtividadeCategoria,
  perdaAtividadeDetalhe,
}) {
  const base = {
    ciclo_id: cicloId,
    paciente_id: pacienteId,
    registrado_em: registradoEm,
    dia_numero: diaNumero,
    tipo_evento: tipoEvento,
    liquido_tipo: null,
    liquido_tipo_outro: null,
    liquido_ml: null,
    volume_urinado_ml: null,
    volume_urinado_nivel: null,
    urgencia: null,
    perda: null,
    perda_atividade_categoria: null,
    perda_atividade_detalhe: null,
  }

  let payload = base
  if (tipoEvento === 'liquido') {
    payload = {
      ...base,
      liquido_tipo: liquidoTipo,
      liquido_tipo_outro: liquidoTipoOutro || null,
      liquido_ml: liquidoMl,
    }
  } else if (tipoEvento === 'urinario') {
    payload = {
      ...base,
      volume_urinado_ml: volumeUrinadoMl,
      volume_urinado_nivel: volumeUrinadoNivel || null,
      urgencia: urgencia || null,
    }
  } else if (tipoEvento === 'perda') {
    payload = {
      ...base,
      perda,
      perda_atividade_categoria: perdaAtividadeCategoria || null,
      perda_atividade_detalhe: perdaAtividadeDetalhe || null,
    }
  }

  const { data, error } = await supabase.from('entradas_diario').insert(payload).select('*').single()

  if (error) throw error
  return paraCamel(data)
}

export async function excluirEntrada(id) {
  const { error } = await supabase.from('entradas_diario').delete().eq('id', id)
  if (error) throw error
}
