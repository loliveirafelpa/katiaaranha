import { supabase } from './supabaseClient'

function paraCamel(row) {
  return {
    id: row.id,
    pacienteId: row.paciente_id,
    criadoPor: row.criado_por,
    duracaoDias: row.duracao_dias,
    dataInicio: row.data_inicio,
    criadoEm: row.criado_em,
  }
}

export async function listarCiclosPorPaciente(pacienteId) {
  const { data, error } = await supabase
    .from('ciclos_diario')
    .select('id, paciente_id, criado_por, duracao_dias, data_inicio, criado_em')
    .eq('paciente_id', pacienteId)
    .order('data_inicio', { ascending: false })

  if (error) throw error
  return data.map(paraCamel)
}

export async function obterCicloAtivo(pacienteId) {
  const ciclos = await listarCiclosPorPaciente(pacienteId)
  return ciclos[0] ?? null
}

export async function criarCiclo({ pacienteId, duracaoDias, dataInicio, criadoPor }) {
  const { data, error } = await supabase
    .from('ciclos_diario')
    .insert({
      paciente_id: pacienteId,
      duracao_dias: duracaoDias,
      data_inicio: dataInicio,
      criado_por: criadoPor,
    })
    .select('id, paciente_id, criado_por, duracao_dias, data_inicio, criado_em')
    .single()

  if (error) throw error
  return paraCamel(data)
}

// Deriva o numero do dia (1-based) a partir da data de inicio do ciclo, em horario local,
// para uma data/hora qualquer (usado tanto para "hoje" quanto para o horario de uma entrada).
export function calcularDiaNumeroPara(ciclo, dataISO) {
  if (!ciclo) return null
  const data = new Date(dataISO)
  const inicio = new Date(`${ciclo.dataInicio}T00:00:00`)
  const dataZero = new Date(data.getFullYear(), data.getMonth(), data.getDate())
  const inicioZero = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())
  const diffDias = Math.floor((dataZero - inicioZero) / (1000 * 60 * 60 * 24))
  return diffDias + 1
}

export function calcularDiaAtual(ciclo) {
  return calcularDiaNumeroPara(ciclo, new Date().toISOString())
}

export function calcularStatusCiclo(ciclo) {
  if (!ciclo) return 'nao_iniciado'
  const diaAtual = calcularDiaAtual(ciclo)
  if (diaAtual < 1) return 'nao_iniciado'
  if (diaAtual > ciclo.duracaoDias) return 'concluido'
  return 'em_andamento'
}
