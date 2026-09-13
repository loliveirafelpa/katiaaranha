-- Substitui a lista generica de atividades (trabalho/estudos/...) por uma lista
-- especifica de gatilhos de perda involuntaria de urina.

alter table public.entradas_diario
  drop constraint entradas_diario_perda_atividade_categoria_check;

alter table public.entradas_diario
  add constraint entradas_diario_perda_atividade_categoria_check check (
    perda_atividade_categoria in ('tosse', 'espirro', 'ao_se_levantar', 'ao_se_sentar', 'andando', 'outro')
  );
