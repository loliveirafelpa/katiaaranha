import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Sem isso, o navegador bloqueia a chamada no preflight (OPTIONS) antes mesmo de
// chegar aqui, e o supabase-js reporta isso como "Failed to send a request to the
// Edge Function" - parece que a funcao caiu, mas na verdade ela nunca foi chamada.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Metodo nao permitido' }, 405)
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace('Bearer ', '')
  if (!jwt) {
    return json({ error: 'Nao autenticado' }, 401)
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  const { data: userData, error: userError } = await adminClient.auth.getUser(jwt)
  if (userError || !userData?.user) {
    return json({ error: 'Token invalido' }, 401)
  }

  const body = await req.json().catch(() => null)
  const pacienteId = body?.pacienteId
  if (!pacienteId) {
    return json({ error: 'pacienteId e obrigatorio' }, 400)
  }

  const { data: perfilChamador } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  const ehAdmin = perfilChamador?.role === 'admin'
  const ehOProprioPaciente = userData.user.id === pacienteId

  if (!ehAdmin && !ehOProprioPaciente) {
    return json({ error: 'Sem permissao para excluir este paciente' }, 403)
  }

  // Anonimiza o perfil (retencao dos registros clinicos brutos e definida com a profissional,
  // por ora entradas_diario/observacoes_diarias nao sao apagadas automaticamente)
  const { error: anonimizarError } = await adminClient
    .from('profiles')
    .update({
      nome_completo: 'Paciente removido',
      contato: null,
      anonimizado_em: new Date().toISOString(),
    })
    .eq('id', pacienteId)

  if (anonimizarError) {
    return json({ error: anonimizarError.message }, 400)
  }

  const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(pacienteId)
  if (deleteAuthError) {
    return json({ error: deleteAuthError.message }, 400)
  }

  return json({ ok: true })
})
