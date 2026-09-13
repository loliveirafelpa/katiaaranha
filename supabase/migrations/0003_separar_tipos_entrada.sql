-- Separa o registro do diario em 3 tipos de evento independentes, em vez de uma
-- unica entrada combinando liquido ingerido + volume urinado + perda de urina.
-- Motivo: na vida real esses eventos nao acontecem no mesmo instante.

alter table public.entradas_diario
  add column tipo_evento text;

update public.entradas_diario set tipo_evento = 'liquido' where tipo_evento is null;

alter table public.entradas_diario
  alter column tipo_evento set not null,
  add constraint entradas_diario_tipo_evento_check check (tipo_evento in ('liquido', 'urinario', 'perda'));

-- Esses campos agora sao obrigatorios so dentro do tipo de evento correspondente
alter table public.entradas_diario
  alter column liquido_tipo drop not null,
  alter column liquido_ml drop not null,
  alter column perda drop not null,
  alter column perda drop default;

alter table public.entradas_diario
  add constraint entradas_diario_campos_por_tipo_check check (
    case tipo_evento
      when 'liquido' then
        liquido_tipo is not null and liquido_ml is not null
        and volume_urinado_ml is null and urgencia is null
        and perda is null and perda_atividade_categoria is null and perda_atividade_detalhe is null
      when 'urinario' then
        volume_urinado_ml is not null
        and liquido_tipo is null and liquido_ml is null
        and perda is null and perda_atividade_categoria is null and perda_atividade_detalhe is null
      when 'perda' then
        perda is not null and perda in ('pequena', 'moderada', 'intensa')
        and liquido_tipo is null and liquido_ml is null
        and volume_urinado_ml is null and urgencia is null
      else false
    end
  );
