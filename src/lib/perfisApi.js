import { supabase } from './supabaseClient'

const CAMPOS = 'id, role, nome_completo, contato, unidade, servico, servico_outro, idade, peso_kg, protocolo_urgencia, anonimizado_em, criado_em'

function paraCamel(row) {
  if (!row) return null
  return {
    id: row.id,
    role: row.role,
    nomeCompleto: row.nome_completo,
    contato: row.contato,
    unidade: row.unidade,
    servico: row.servico,
    servicoOutro: row.servico_outro,
    idade: row.idade,
    pesoKg: row.peso_kg,
    protocoloUrgencia: row.protocolo_urgencia,
    anonimizadoEm: row.anonimizado_em,
    criadoEm: row.criado_em,
  }
}

export async function listarPacientes() {
  const { data, error } = await supabase
    .from('profiles')
    .select(CAMPOS)
    .eq('role', 'paciente')
    .order('criado_em', { ascending: false })

  if (error) throw error
  return data.map(paraCamel)
}

export async function obterPacientePorId(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select(CAMPOS)
    .eq('id', id)
    .single()

  if (error) throw error
  return paraCamel(data)
}

// Feito pela admin (RLS: profiles_admin_update_all). E-mail nao entra: e do login
// (Supabase Auth), nao do perfil.
export async function atualizarPaciente(id, { nomeCompleto, contato, unidade, servico, idade, pesoKg, protocoloUrgencia }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      nome_completo: nomeCompleto,
      contato: contato || null,
      unidade: unidade || null,
      servico: servico || null,
      idade: idade === '' || idade == null ? null : Number(idade),
      peso_kg: pesoKg === '' || pesoKg == null ? null : Number(pesoKg),
      protocolo_urgencia: !!protocoloUrgencia,
    })
    .eq('id', id)
    .select(CAMPOS)
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
