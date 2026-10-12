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
    // Ciclo aguardando inicio (data null) vem primeiro - e sempre o mais recente.
    .order('data_inicio', { ascending: false, nullsFirst: true })

  if (error) throw error
  return data.map(paraCamel)
}

export async function obterCicloAtivo(pacienteId) {
  const ciclos = await listarCiclosPorPaciente(pacienteId)
  return ciclos[0] ?? null
}

// A admin so abre o ciclo; a data de inicio quem escolhe e o paciente (iniciarCiclo).
export async function criarCiclo({ pacienteId, criadoPor }) {
  const { data, error } = await supabase
    .from('ciclos_diario')
    .insert({
      paciente_id: pacienteId,
      criado_por: criadoPor,
    })
    .select('id, paciente_id, criado_por, duracao_dias, data_inicio, criado_em')
    .single()

  if (error) throw error
  return paraCamel(data)
}

// Feito pelo paciente: define o dia de inicio de um ciclo aberto pela admin. Passa por
// uma funcao do banco porque o paciente nao tem permissao de update direto no ciclo.
export async function iniciarCiclo(cicloId, dataInicio) {
  const { error } = await supabase.rpc('iniciar_ciclo', { p_ciclo_id: cicloId, p_data_inicio: dataInicio })
  if (error) throw error
}

export function cicloAguardandoInicio(ciclo) {
  return !!ciclo && !ciclo.dataInicio
}

// Deriva o numero do dia (1-based) a partir da data de inicio do ciclo, em horario local,
// para uma data/hora qualquer (usado tanto para "hoje" quanto para o horario de uma entrada).
export function calcularDiaNumeroPara(ciclo, dataISO) {
  if (!ciclo?.dataInicio) return null
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

// O ciclo nao tem mais data de encerramento: uma vez iniciado, fica "em andamento"
// indefinidamente, ate o paciente parar de registrar por conta propria.
export function calcularStatusCiclo(ciclo) {
  if (!ciclo) return 'nao_iniciado'
  if (!ciclo.dataInicio) return 'aguardando_inicio'
  const diaAtual = calcularDiaAtual(ciclo)
  if (diaAtual < 1) return 'nao_iniciado'
  return 'em_andamento'
}
