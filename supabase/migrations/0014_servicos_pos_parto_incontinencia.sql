-- O cadastro de paciente passa a oferecer so: Gestante, Pos parto, Incontinencia
-- Urinaria, Pos operatorio e Pilates. Gestante e Pos operatorio reaproveitam os
-- valores 'gestacional' e 'pos_cirurgico'; entram 'pos_parto' e
-- 'incontinencia_urinaria'. Os valores antigos continuam aceitos para nao
-- invalidar pacientes ja cadastrados (a tela so nao oferece mais).

alter table public.profiles drop constraint if exists profiles_servico_check;

alter table public.profiles
  add constraint profiles_servico_check check (servico in (
    'gestacional', 'pos_parto', 'incontinencia_urinaria', 'pos_cirurgico', 'pilates',
    'assoalho_pelvico', 'drenagem_linfatica', 'rpg', 'yoga', 'outro'
  ));
