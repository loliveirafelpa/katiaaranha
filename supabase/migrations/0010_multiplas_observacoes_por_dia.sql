-- "Outros sintomas / observacoes" deixa de ser um texto unico (que era sobrescrito a cada
-- salvamento) e vira uma lista de anotacoes, cada uma com seu proprio horario - assim a
-- paciente pode incluir mais de uma observacao no mesmo dia, em vez de perder a anterior.

alter table public.observacoes_diarias
  alter column outros_sintomas type jsonb using (
    case
      when outros_sintomas is null or outros_sintomas = '' then '[]'::jsonb
      else jsonb_build_array(jsonb_build_object('texto', outros_sintomas, 'horario', coalesce(atualizado_em, criado_em)))
    end
  );

alter table public.observacoes_diarias
  alter column outros_sintomas set default '[]'::jsonb;
