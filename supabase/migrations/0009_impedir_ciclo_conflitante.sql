-- Impede que um paciente tenha dois ciclos com linhas do tempo se cruzando. Como o ciclo
-- nao tem mais data de termino, a regra e: um novo ciclo so pode comecar estritamente
-- depois do inicio do ciclo mais recente ja existente para aquele paciente.

create or replace function public.impedir_ciclo_conflitante()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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

create trigger ciclos_diario_impedir_conflito
before insert or update of data_inicio, paciente_id on public.ciclos_diario
for each row execute function public.impedir_ciclo_conflitante();
