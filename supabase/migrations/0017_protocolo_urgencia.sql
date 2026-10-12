-- Protocolo de urgencia: casos especiais em que a Dra. Katia pede ao paciente que pese
-- a fralda. Ativado por paciente (so admin liga/desliga); quando ativo, o registro de
-- xixi ganha tres campos:
--   trocou_fralda:         o paciente marca que trocou a fralda naquele momento (o total
--                          de trocas do dia e somado pelo sistema, nao digitado)
--   peso_fralda_inicial_g: peso da fralda seca (o app repete o ultimo valor informado)
--   peso_fralda_pos_g:     peso da fralda retirada na troca

alter table public.profiles
  add column protocolo_urgencia boolean not null default false;

alter table public.entradas_diario
  add column peso_fralda_inicial_g numeric check (peso_fralda_inicial_g >= 0),
  add column peso_fralda_pos_g numeric check (peso_fralda_pos_g >= 0),
  add column trocou_fralda boolean;

alter table public.entradas_diario
  drop constraint entradas_diario_campos_xixi_check;

alter table public.entradas_diario
  add constraint entradas_diario_campos_xixi_check check (
    tipo_evento = 'urinario'
    or (
      esvaziamento_completo is null and gotejamento_pos_miccional is null
      and peso_fralda_inicial_g is null and peso_fralda_pos_g is null and trocou_fralda is null
    )
  );

-- Correcao de seguranca: a policy profiles_update_own deixava o paciente alterar
-- QUALQUER coluna do proprio perfil (inclusive role -> 'admin', e agora o protocolo).
-- O paciente so edita o proprio contato (tela "Meus dados"); o resto e da admin.
-- Chamadas sem usuario (service role das Edge Functions) passam direto.
create or replace function public.proteger_campos_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null or public.is_admin() then
    return new;
  end if;

  if (to_jsonb(new) - 'contato') is distinct from (to_jsonb(old) - 'contato') then
    raise exception 'campo_nao_editavel: paciente só pode alterar o próprio contato'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke execute on function public.proteger_campos_profile() from public, anon, authenticated;

create trigger profiles_proteger_campos
before update on public.profiles
for each row execute function public.proteger_campos_profile();
