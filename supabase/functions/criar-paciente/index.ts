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

// Senha padrao pro primeiro acesso de todo paciente novo - ela pede pra trocar
// depois, pela tela "Meus dados" (ver trocarSenha em authApi.js).
const SENHA_PADRAO = 'primeiroacesso'

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

  // Valida quem esta chamando
  const { data: userData, error: userError } = await adminClient.auth.getUser(jwt)
  if (userError || !userData?.user) {
    return json({ error: 'Token invalido' }, 401)
  }

  const { data: perfilChamador, error: perfilError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (perfilError || perfilChamador?.role !== 'admin') {
    return json({ error: 'Apenas administradores podem criar pacientes' }, 403)
  }

  const body = await req.json().catch(() => null)
  const nomeCompleto = body?.nomeCompleto?.trim()
  const email = body?.email?.trim().toLowerCase()
  const contato = body?.contato?.trim() || null
  const unidade = body?.unidade || null
  const servico = body?.servico || null
  const servicoOutro = body?.servicoOutro?.trim() || null

  if (!nomeCompleto || !email) {
    return json({ error: 'nomeCompleto e email sao obrigatorios' }, 400)
  }

  const { data: novoUsuario, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: SENHA_PADRAO,
    email_confirm: true,
  })

  if (createError || !novoUsuario?.user) {
    return json({ error: createError?.message ?? 'Falha ao criar usuario' }, 400)
  }

  const { error: profileError } = await adminClient.from('profiles').insert({
    id: novoUsuario.user.id,
    role: 'paciente',
    nome_completo: nomeCompleto,
    contato,
    unidade,
    servico,
    servico_outro: servico === 'outro' ? servicoOutro : null,
  })

  if (profileError) {
    // Reverte a criacao do usuario Auth se o profile falhar, para nao deixar login orfao
    await adminClient.auth.admin.deleteUser(novoUsuario.user.id)
    return json({ error: profileError.message }, 400)
  }

  return json({ email, senhaTemporaria: SENHA_PADRAO })
})
