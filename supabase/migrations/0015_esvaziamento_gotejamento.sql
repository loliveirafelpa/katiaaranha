-- Duas perguntas novas no registro de xixi ("Fui ao banheiro"), ambas sim/nao e
-- opcionais (null = paciente nao respondeu):
--   esvaziamento_completo: sentiu que esvaziou a bexiga por completo
--   gotejamento_pos_miccional: pingou xixi ao se levantar do vaso
-- So fazem sentido em entradas 'urinario'; nos outros tipos ficam sempre null.

alter table public.entradas_diario
  add column esvaziamento_completo boolean,
  add column gotejamento_pos_miccional boolean;

alter table public.entradas_diario
  add constraint entradas_diario_campos_xixi_check check (
    tipo_evento = 'urinario'
    or (esvaziamento_completo is null and gotejamento_pos_miccional is null)
  );
