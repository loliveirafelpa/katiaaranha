import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Metodo nao permitido' }), { status: 405 })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace('Bearer ', '')
  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Nao autenticado' }), { status: 401 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  const { data: userData, error: userError } = await adminClient.auth.getUser(jwt)
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Token invalido' }), { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const pacienteId = body?.pacienteId
  if (!pacienteId) {
    return new Response(JSON.stringify({ error: 'pacienteId e obrigatorio' }), { status: 400 })
  }

  const { data: perfilChamador } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  const ehAdmin = perfilChamador?.role === 'admin'
  const ehOProprioPaciente = userData.user.id === pacienteId

  if (!ehAdmin && !ehOProprioPaciente) {
    return new Response(JSON.stringify({ error: 'Sem permissao para excluir este paciente' }), { status: 403 })
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
    return new Response(JSON.stringify({ error: anonimizarError.message }), { status: 400 })
  }

  const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(pacienteId)
  if (deleteAuthError) {
    return new Response(JSON.stringify({ error: deleteAuthError.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
