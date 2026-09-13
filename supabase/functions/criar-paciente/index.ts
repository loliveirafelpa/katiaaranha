import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

function gerarSenhaTemporaria() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let senha = ''
  for (let i = 0; i < 12; i++) {
    senha += alfabeto[Math.floor(Math.random() * alfabeto.length)]
  }
  return senha
}

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

  // Valida quem esta chamando
  const { data: userData, error: userError } = await adminClient.auth.getUser(jwt)
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Token invalido' }), { status: 401 })
  }

  const { data: perfilChamador, error: perfilError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (perfilError || perfilChamador?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Apenas administradores podem criar pacientes' }), { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const nomeCompleto = body?.nomeCompleto?.trim()
  const email = body?.email?.trim().toLowerCase()
  const contato = body?.contato?.trim() || null
  const unidade = body?.unidade || null
  const servico = body?.servico || null
  const servicoOutro = body?.servicoOutro?.trim() || null

  if (!nomeCompleto || !email) {
    return new Response(JSON.stringify({ error: 'nomeCompleto e email sao obrigatorios' }), { status: 400 })
  }

  const senhaTemporaria = gerarSenhaTemporaria()

  const { data: novoUsuario, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: senhaTemporaria,
    email_confirm: true,
  })

  if (createError || !novoUsuario?.user) {
    return new Response(JSON.stringify({ error: createError?.message ?? 'Falha ao criar usuario' }), { status: 400 })
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
    return new Response(JSON.stringify({ error: profileError.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ email, senhaTemporaria }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
