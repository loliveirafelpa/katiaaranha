-- Adiciona o servico/tratamento aplicado ao paciente, para a admin (Dra. Katia)
-- saber a que tipo de acompanhamento cada paciente esta vinculado.

alter table public.profiles
  add column servico text check (servico in (
    'gestacional', 'assoalho_pelvico', 'pos_cirurgico', 'drenagem_linfatica',
    'rpg', 'pilates', 'yoga', 'outro'
  )),
  add column servico_outro text;
