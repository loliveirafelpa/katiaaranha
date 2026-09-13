-- Schema inicial do Diario Miccional Digital
-- Tabelas: profiles, consentimentos, ciclos_diario, entradas_diario, observacoes_diarias, notas_clinicas
-- RLS obrigatorio em todas as tabelas com dado de paciente.

-- =========================================================
-- profiles: espelha auth.users, base do controle de papel (admin/paciente)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','paciente')),
  nome_completo text not null,
  contato text,
  unidade text check (unidade in ('campinas','jundiai')),
  anonimizado_em timestamptz,
  criado_em timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Funcao auxiliar de checagem de admin (security definer evita recursao de RLS)
create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy profiles_admin_select_all on public.profiles
  for select to authenticated
  using (public.is_admin());

create policy profiles_admin_update_all on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Sem insert/delete via client: criacao/exclusao de perfil e feita por Edge Function com service role.

-- =========================================================
-- consentimentos: append-only, auditoria LGPD (art. 11)
-- =========================================================
create table public.consentimentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  aceito boolean not null,
  versao_termo text not null,
  criado_em timestamptz not null default now()
);

create index consentimentos_paciente_id_idx on public.consentimentos(paciente_id);

alter table public.consentimentos enable row level security;

create policy consentimentos_select_own on public.consentimentos
  for select to authenticated
  using (paciente_id = (select auth.uid()));

create policy consentimentos_insert_own on public.consentimentos
  for insert to authenticated
  with check (paciente_id = (select auth.uid()));

create policy consentimentos_admin_select_all on public.consentimentos
  for select to authenticated
  using (public.is_admin());

-- =========================================================
-- ciclos_diario: um paciente pode ter varios ciclos ao longo do tempo
-- =========================================================
create table public.ciclos_diario (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  criado_por uuid references public.profiles(id),
  duracao_dias int not null check (duracao_dias > 0),
  data_inicio date not null,
  criado_em timestamptz not null default now()
);

create index ciclos_diario_paciente_id_idx on public.ciclos_diario(paciente_id);

alter table public.ciclos_diario enable row level security;

create policy ciclos_diario_select_own on public.ciclos_diario
  for select to authenticated
  using (paciente_id = (select auth.uid()));

create policy ciclos_diario_admin_all on public.ciclos_diario
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- entradas_diario: um registro por evento pontual (horario livre)
-- =========================================================
create table public.entradas_diario (
  id uuid primary key default gen_random_uuid(),
  ciclo_id uuid not null references public.ciclos_diario(id) on delete cascade,
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  registrado_em timestamptz not null,
  dia_numero int not null check (dia_numero > 0),
  liquido_tipo text not null check (liquido_tipo in ('agua','cafe','cha','suco','refrigerante','alcool','outro')),
  liquido_tipo_outro text,
  liquido_ml numeric not null check (liquido_ml >= 0),
  volume_urinado_ml numeric check (volume_urinado_ml >= 0),
  urgencia text check (urgencia in ('pequena','moderada','intensa')),
  perda text not null default 'sem_perda' check (perda in ('sem_perda','pequena','moderada','intensa')),
  perda_atividade_categoria text check (perda_atividade_categoria in ('trabalho','estudos','caminhada','academia','domesticas','social','compras','lazer','descanso','outros')),
  perda_atividade_detalhe text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz
);

create index entradas_diario_ciclo_id_idx on public.entradas_diario(ciclo_id);
create index entradas_diario_paciente_id_idx on public.entradas_diario(paciente_id);
create index entradas_diario_dia_numero_idx on public.entradas_diario(ciclo_id, dia_numero);

alter table public.entradas_diario enable row level security;

create policy entradas_diario_select_own on public.entradas_diario
  for select to authenticated
  using (paciente_id = (select auth.uid()));

create policy entradas_diario_insert_own on public.entradas_diario
  for insert to authenticated
  with check (paciente_id = (select auth.uid()));

create policy entradas_diario_update_own on public.entradas_diario
  for update to authenticated
  using (paciente_id = (select auth.uid()))
  with check (paciente_id = (select auth.uid()));

create policy entradas_diario_delete_own on public.entradas_diario
  for delete to authenticated
  using (paciente_id = (select auth.uid()));

create policy entradas_diario_admin_select_all on public.entradas_diario
  for select to authenticated
  using (public.is_admin());

-- =========================================================
-- observacoes_diarias: 1x por dia (absorvente, menstruacao, medicamentos, sintomas)
-- =========================================================
create table public.observacoes_diarias (
  id uuid primary key default gen_random_uuid(),
  ciclo_id uuid not null references public.ciclos_diario(id) on delete cascade,
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  dia_numero int not null check (dia_numero > 0),
  absorvente_uso boolean,
  absorvente_tipo text check (absorvente_tipo in ('diario','noturno','outro')),
  absorvente_tipo_outro text,
  absorvente_quantidade int check (absorvente_quantidade >= 0),
  menstruacao boolean,
  menstruacao_inicio date,
  menstruacao_fim date,
  medicamentos_uso boolean,
  medicamentos_quais text,
  outros_sintomas text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz,
  unique (ciclo_id, dia_numero)
);

create index observacoes_diarias_paciente_id_idx on public.observacoes_diarias(paciente_id);

alter table public.observacoes_diarias enable row level security;

create policy observacoes_diarias_select_own on public.observacoes_diarias
  for select to authenticated
  using (paciente_id = (select auth.uid()));

create policy observacoes_diarias_insert_own on public.observacoes_diarias
  for insert to authenticated
  with check (paciente_id = (select auth.uid()));

create policy observacoes_diarias_update_own on public.observacoes_diarias
  for update to authenticated
  using (paciente_id = (select auth.uid()))
  with check (paciente_id = (select auth.uid()));

create policy observacoes_diarias_delete_own on public.observacoes_diarias
  for delete to authenticated
  using (paciente_id = (select auth.uid()));

create policy observacoes_diarias_admin_select_all on public.observacoes_diarias
  for select to authenticated
  using (public.is_admin());

-- =========================================================
-- notas_clinicas: anotacoes internas da profissional, paciente nao enxerga
-- =========================================================
create table public.notas_clinicas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  ciclo_id uuid references public.ciclos_diario(id) on delete cascade,
  dia_numero int,
  autor_id uuid not null references public.profiles(id),
  texto text not null,
  criado_em timestamptz not null default now()
);

create index notas_clinicas_paciente_id_idx on public.notas_clinicas(paciente_id);

alter table public.notas_clinicas enable row level security;

create policy notas_clinicas_admin_all on public.notas_clinicas
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Sem policy para paciente: RLS nega por padrao, paciente nunca ve notas clinicas.

-- =========================================================
-- Trigger generico para atualizado_em
-- =========================================================
create function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger entradas_diario_set_atualizado_em
  before update on public.entradas_diario
  for each row execute function public.set_atualizado_em();

create trigger observacoes_diarias_set_atualizado_em
  before update on public.observacoes_diarias
  for each row execute function public.set_atualizado_em();

-- =========================================================
-- Privilegios de tabela (RLS continua sendo quem decide o acesso por linha)
-- =========================================================
grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.profiles,
  public.consentimentos,
  public.ciclos_diario,
  public.entradas_diario,
  public.observacoes_diarias,
  public.notas_clinicas
to authenticated;
