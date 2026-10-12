-- Categoria "outro" no catalogo de exercicios: a Dra. Katia digita a origem do
-- exercicio (ex.: "Hipopressivos") em categoria_outro. Cada texto vira um grupo proprio
-- no catalogo e na prescricao.

alter table public.exercicios
  drop constraint exercicios_categoria_check;

alter table public.exercicios
  add constraint exercicios_categoria_check check (categoria in ('pilates', 'assoalho_pelvico', 'outro'));

alter table public.exercicios
  add column categoria_outro text;

alter table public.exercicios
  add constraint exercicios_categoria_outro_check check (
    (categoria = 'outro' and length(trim(coalesce(categoria_outro, ''))) > 0)
    or (categoria <> 'outro' and categoria_outro is null)
  );
