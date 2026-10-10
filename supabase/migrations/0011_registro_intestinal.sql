-- Novo tipo de evento no diario: registro intestinal, classificado pela Escala de
-- Bristol (1 a 7), complementando os ja existentes (liquido ingerido, ida ao
-- banheiro pra urinar, perda de urina).

alter table public.entradas_diario
  add column fezes_escala int check (fezes_escala between 1 and 7);

alter table public.entradas_diario
  drop constraint entradas_diario_tipo_evento_check;

alter table public.entradas_diario
  add constraint entradas_diario_tipo_evento_check check (tipo_evento in ('liquido', 'urinario', 'perda', 'intestinal'));

alter table public.entradas_diario
  drop constraint entradas_diario_campos_por_tipo_check;

alter table public.entradas_diario
  add constraint entradas_diario_campos_por_tipo_check check (
    case tipo_evento
      when 'liquido' then
        liquido_tipo is not null and liquido_ml is not null
        and volume_urinado_ml is null and volume_urinado_nivel is null and urgencia is null
        and perda is null and perda_atividade_categoria is null and perda_atividade_detalhe is null
        and fezes_escala is null
      when 'urinario' then
        liquido_tipo is null and liquido_ml is null
        and perda is null and perda_atividade_categoria is null and perda_atividade_detalhe is null
        and fezes_escala is null
      when 'perda' then
        perda is not null and perda in ('pequena', 'moderada', 'intensa')
        and liquido_tipo is null and liquido_ml is null
        and volume_urinado_ml is null and volume_urinado_nivel is null and urgencia is null
        and fezes_escala is null
      when 'intestinal' then
        fezes_escala is not null
        and liquido_tipo is null and liquido_ml is null
        and volume_urinado_ml is null and volume_urinado_nivel is null and urgencia is null
        and perda is null and perda_atividade_categoria is null and perda_atividade_detalhe is null
      else false
    end
  );
