-- Adiciona uma classificacao qualitativa (baixo/medio/alto) para o volume urinado,
-- complementando o campo numerico em ml no registro do tipo "urinario".

alter table public.entradas_diario
  add column volume_urinado_nivel text check (volume_urinado_nivel in ('baixo', 'medio', 'alto'));

alter table public.entradas_diario
  drop constraint entradas_diario_campos_por_tipo_check;

alter table public.entradas_diario
  add constraint entradas_diario_campos_por_tipo_check check (
    case tipo_evento
      when 'liquido' then
        liquido_tipo is not null and liquido_ml is not null
        and volume_urinado_ml is null and volume_urinado_nivel is null and urgencia is null
        and perda is null and perda_atividade_categoria is null and perda_atividade_detalhe is null
      when 'urinario' then
        volume_urinado_ml is not null
        and liquido_tipo is null and liquido_ml is null
        and perda is null and perda_atividade_categoria is null and perda_atividade_detalhe is null
      when 'perda' then
        perda is not null and perda in ('pequena', 'moderada', 'intensa')
        and liquido_tipo is null and liquido_ml is null
        and volume_urinado_ml is null and volume_urinado_nivel is null and urgencia is null
      else false
    end
  );
