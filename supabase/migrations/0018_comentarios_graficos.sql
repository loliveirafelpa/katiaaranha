-- Comentarios da Dra. Katia em cada grafico (aba Graficos e aba Comparativos), pra ir
-- acompanhando a evolucao do paciente. Uso interno: paciente NUNCA ve.
--   grafico: chave do grafico (ex.: 'graficos:urgencia', 'comparativos:evolucao')
--   ciclo_id: ciclo a que o comentario se refere (aba Graficos); null na aba
--             Comparativos, que olha varios ciclos ao mesmo tempo.

create table public.comentarios_graficos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  ciclo_id uuid references public.ciclos_diario(id) on delete cascade,
  grafico text not null,
  autor_id uuid not null references public.profiles(id),
  texto text not null check (length(trim(texto)) > 0),
  criado_em timestamptz not null default now()
);

create index comentarios_graficos_paciente_id_idx on public.comentarios_graficos(paciente_id);

alter table public.comentarios_graficos enable row level security;

-- Mesmo modelo de notas_clinicas: so admin; sem policy pra paciente, RLS nega por padrao.
create policy comentarios_graficos_admin_all on public.comentarios_graficos
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.comentarios_graficos to authenticated;
