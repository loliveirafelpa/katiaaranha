-- Idade e peso do paciente, coletados no cadastro (admin), usados para calcular a
-- meta diaria de liquido recomendada (ml/kg varia pela faixa etaria).

alter table public.profiles
  add column idade int check (idade > 0 and idade < 130),
  add column peso_kg numeric check (peso_kg > 0 and peso_kg < 400);
