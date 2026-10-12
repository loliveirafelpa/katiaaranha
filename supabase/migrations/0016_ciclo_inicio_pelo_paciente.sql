-- A admin passa a so "abrir" um novo ciclo, sem data: quem escolhe o dia de inicio e o
-- proprio paciente, pelo app. Ciclo com data_inicio null = aberto, aguardando o paciente.

alter table public.ciclos_diario
  alter column data_inicio drop not null;

-- Regras de conflito:
--   * so pode existir UM ciclo aguardando inicio por paciente;
--   * ao definir a data, ela precisa ser posterior ao inicio de todos os outros ciclos
--     do paciente (mesma regra da 0009, linhas do tempo nao se cruzam).
create or replace function public.impedir_ciclo_conflitante()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.data_inicio is null then
    if exists (
      select 1 from public.ciclos_diario
      where paciente_id = new.paciente_id
        and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
        and data_inicio is null
    ) then
      raise exception 'ciclo_pendente_existente: este paciente já tem um ciclo aguardando início'
        using errcode = 'P0001';
    end if;
    return new;
  end if;

  if exists (
    select 1 from public.ciclos_diario
    where paciente_id = new.paciente_id
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and data_inicio >= new.data_inicio
  ) then
    raise exception 'ciclo_data_inicio_conflitante: já existe um ciclo deste paciente começando em % ou depois', new.data_inicio
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- O paciente nao tem permissao de update em ciclos_diario (RLS so libera select pra ele).
-- Esta funcao e a unica porta: define a data de inicio de um ciclo DELE que ainda esteja
-- aguardando, e nada mais.
create or replace function public.iniciar_ciclo(p_ciclo_id uuid, p_data_inicio date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_data_inicio is null then
    raise exception 'data_inicio_obrigatoria' using errcode = 'P0001';
  end if;

  update public.ciclos_diario
     set data_inicio = p_data_inicio
   where id = p_ciclo_id
     and paciente_id = (select auth.uid())
     and data_inicio is null;

  if not found then
    raise exception 'ciclo_nao_disponivel: ciclo não encontrado ou já iniciado' using errcode = 'P0001';
  end if;
end;
$$;

revoke execute on function public.iniciar_ciclo(uuid, date) from public, anon;
grant execute on function public.iniciar_ciclo(uuid, date) to authenticated;
