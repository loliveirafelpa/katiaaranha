-- Orientacoes em texto livre da Dra. Katia para o paciente (muitas vezes a prescricao
-- nao e um exercicio do catalogo, e so uma orientacao). Diferente das notas clinicas e
-- dos comentarios dos graficos, ESTAS o paciente ve, na tela "Exercícios e orientações".

create table public.orientacoes_paciente (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  autor_id uuid not null references public.profiles(id),
  texto text not null check (length(trim(texto)) > 0),
  criado_em timestamptz not null default now()
);

create index orientacoes_paciente_paciente_id_idx on public.orientacoes_paciente(paciente_id);

alter table public.orientacoes_paciente enable row level security;

-- Paciente so le as proprias; quem escreve e remove e a admin.
create policy orientacoes_paciente_select_own on public.orientacoes_paciente
  for select to authenticated
  using ((select auth.uid()) = paciente_id);

create policy orientacoes_paciente_admin_all on public.orientacoes_paciente
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.orientacoes_paciente to authenticated;
