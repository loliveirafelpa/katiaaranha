# CLAUDE.md — Diário Miccional Digital (CPA Fisioterapia)

Resumo rápido dos pontos inegociáveis deste projeto. Para decisões maiores, consulte o `playbook-tecnico.md` completo nesta pasta.

## Stack fixa
React 18 + Vite + Tailwind CSS · react-router-dom · Supabase (Postgres + Auth + RLS + Edge Functions) · lucide-react · deploy no Vercel conectado ao GitHub.

## Segurança — não negociável
- Um cliente Supabase só (`src/lib/supabaseClient.js`), sempre com a **anon key**. Nunca a service role key no frontend.
- **RLS ativo em toda tabela com dado de paciente**, com políticas `_select_own`/`_insert_own`/`_update_own`/`_delete_own` usando `(select auth.uid())`.
- A tela pode esconder um botão, mas quem decide de verdade quem pode ver/fazer o quê é sempre o banco (RLS) ou uma Edge Function — nunca confiar só na interface.
- Qualquer segredo de verdade (chave de API paga, ação só de admin) vai para uma Edge Function em `supabase/functions/`, nunca para variável de ambiente do frontend.
- Toda mudança de schema vira uma migration nova em `supabase/migrations/` (numeradas: `0001_...`, `0002_...`). Nunca alterar o banco direto pelo painel sem registrar depois.

## Dado sensível de saúde (LGPD)
- Consentimento específico para dado de saúde, separado dos termos gerais, guardado no banco com data/hora (`consentimentos`, ver `ConsentimentoPage.jsx`).
- Paciente tem página própria (`MeusDadosPage.jsx`) para ver seus dados, revogar consentimento e solicitar exclusão da conta.
- Pendente: exportação de dados pelo próprio paciente, e uma rotina automática de retenção/anonimização (hoje existe a coluna `anonimizado_em` no banco, mas nada preenche ela sozinha ainda).

## Design system
Cores e fontes só em `src/theme.js` — nunca hex direto num componente. Paleta é toda em laranja e subtons de laranja (identidade da CPA Fisioterapia), com uma exceção deliberada: verde/amarelo/vermelho continuam sendo usados para severidade clínica (leve/moderada/intensa) nos gráficos do admin, porque virar tudo laranja tornaria esses gráficos ilegíveis.

## Onde estamos
Ver `estado-do-projeto.md` para o resumo de negócio (o que já funciona, o que falta, decisões em aberto) — é o documento certo para colar no início de uma conversa nova e recuperar contexto rápido. Ver `README.md` para detalhes técnicos (estrutura de pastas, banco de dados, como rodar local).
