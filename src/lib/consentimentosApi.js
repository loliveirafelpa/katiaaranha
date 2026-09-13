import { supabase } from './supabaseClient'

export const VERSAO_TERMO_ATUAL = '2026-09-13'

export async function obterConsentimentoAtual(pacienteId) {
  const { data, error } = await supabase
    .from('consentimentos')
    .select('id, aceito, versao_termo, criado_em')
    .eq('paciente_id', pacienteId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: data.id,
    aceito: data.aceito,
    versaoTermo: data.versao_termo,
    criadoEm: data.criado_em,
  }
}

export async function registrarConsentimento(pacienteId) {
  const { error } = await supabase.from('consentimentos').insert({
    paciente_id: pacienteId,
    aceito: true,
    versao_termo: VERSAO_TERMO_ATUAL,
  })
  if (error) throw error
}

export async function revogarConsentimento(pacienteId) {
  const { error } = await supabase.from('consentimentos').insert({
    paciente_id: pacienteId,
    aceito: false,
    versao_termo: VERSAO_TERMO_ATUAL,
  })
  if (error) throw error
}
