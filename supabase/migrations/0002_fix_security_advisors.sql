-- Corrige avisos do linter de seguranca do Supabase apos a migration 0001

-- search_path mutavel na funcao de trigger
alter function public.set_atualizado_em() set search_path = public;

-- is_admin() e SECURITY DEFINER e nao precisa ser exposta via RPC publico (/rest/v1/rpc/is_admin).
-- Mantem EXECUTE para 'authenticated' (necessario para as policies de RLS que a chamam),
-- remove de 'public'/'anon' para reduzir superficie de API exposta.
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;
