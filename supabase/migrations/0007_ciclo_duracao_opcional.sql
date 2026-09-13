-- O ciclo do diario deixa de ter uma duracao fixa obrigatoria: o paciente registra
-- quantos dias quiser, sem data de encerramento pre-definida.

alter table public.ciclos_diario
  alter column duracao_dias drop not null;

alter table public.ciclos_diario
  drop constraint if exists ciclos_diario_duracao_dias_check;

alter table public.ciclos_diario
  add constraint ciclos_diario_duracao_dias_check check (duracao_dias is null or duracao_dias > 0);
