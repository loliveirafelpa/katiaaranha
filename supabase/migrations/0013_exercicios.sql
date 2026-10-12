-- Modulo de exercicios: catalogo de exercicios (pilates e assoalho pelvico) mantido
-- pela profissional, e prescricoes semanais desse catalogo para cada paciente.

-- =========================================================
-- exercicios: catalogo, sem dado de paciente
-- =========================================================
create table public.exercicios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null check (categoria in ('pilates', 'assoalho_pelvico')),
  descricao text,
  instrucoes text,
  series_padrao int check (series_padrao > 0),
  repeticoes_padrao text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table public.exercicios enable row level security;

-- Qualquer usuario logado le o catalogo (paciente precisa ver nome/instrucoes do que
-- foi prescrito); so admin cria, edita ou desativa.
create policy exercicios_select_authenticated on public.exercicios
  for select to authenticated
  using (true);

create policy exercicios_admin_all on public.exercicios
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- prescricoes_exercicio: dado de paciente
-- =========================================================
create table public.prescricoes_exercicio (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles(id) on delete cascade,
  exercicio_id uuid not null references public.exercicios(id),
  prescrito_por uuid not null references public.profiles(id),
  vezes_por_semana int not null check (vezes_por_semana between 1 and 14),
  series int check (series > 0),
  repeticoes text,
  observacao text,
  data_inicio date not null,
  data_fim date not null,
  criado_em timestamptz not null default now(),
  check (data_fim >= data_inicio)
);

create index prescricoes_exercicio_paciente_id_idx on public.prescricoes_exercicio(paciente_id);

alter table public.prescricoes_exercicio enable row level security;

-- Paciente so le as proprias prescricoes; quem prescreve, edita e remove e o admin.
create policy prescricoes_exercicio_select_own on public.prescricoes_exercicio
  for select to authenticated
  using ((select auth.uid()) = paciente_id);

create policy prescricoes_exercicio_admin_all on public.prescricoes_exercicio
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on
  public.exercicios,
  public.prescricoes_exercicio
to authenticated;

-- =========================================================
-- Catalogo inicial (revisar textos com a Dra. Katia)
-- =========================================================
insert into public.exercicios (nome, categoria, descricao, instrucoes, series_padrao, repeticoes_padrao) values
  ('Contração sustentada do assoalho pélvico', 'assoalho_pelvico',
   'Fortalece a resistência dos músculos do assoalho pélvico.',
   'Deitada de barriga para cima, joelhos dobrados. Contraia os músculos como se fosse segurar o xixi e o pum, puxando para dentro e para cima. Segure, mantendo a respiração solta, e depois relaxe completamente pelo mesmo tempo.',
   3, '10 repetições, segurando 5 segundos'),
  ('Contrações rápidas do assoalho pélvico', 'assoalho_pelvico',
   'Treina a resposta rápida dos músculos, importante para segurar a urina em esforços.',
   'Na posição indicada, contraia o assoalho pélvico com força e solte logo em seguida, de forma rápida. Relaxe completamente entre uma contração e outra.',
   3, '10 repetições'),
  ('Contração do assoalho pélvico com respiração', 'assoalho_pelvico',
   'Coordena a contração do assoalho pélvico com a respiração.',
   'Inspire pelo nariz deixando a barriga expandir e o assoalho pélvico relaxar. Ao soltar o ar pela boca, contraia suavemente o assoalho pélvico e a parte baixa da barriga. Relaxe na próxima inspiração.',
   2, '10 respirações'),
  ('Contração antes do esforço (tosse/espirro)', 'assoalho_pelvico',
   'Ensina a proteger a bexiga contraindo o assoalho pélvico antes de esforços.',
   'Sentada ou em pé, contraia o assoalho pélvico e, mantendo a contração, tussa de leve. Solte só depois da tosse. Leve esse hábito para o dia a dia: antes de tossir, espirrar, rir ou pegar peso.',
   2, '5 repetições'),
  ('Contração do assoalho pélvico em pé', 'assoalho_pelvico',
   'Treina a contração em uma posição mais funcional, do dia a dia.',
   'Em pé, pés afastados na largura do quadril e joelhos levemente soltos. Contraia o assoalho pélvico, segure e relaxe completamente. Evite prender a respiração ou contrair o bumbum.',
   3, '10 repetições, segurando 5 segundos'),
  ('Respiração diafragmática', 'pilates',
   'Base do pilates: organiza a respiração e a relação entre diafragma, abdômen e assoalho pélvico.',
   'Deitada de barriga para cima, joelhos dobrados, uma mão no peito e outra na barriga. Inspire pelo nariz enchendo a barriga e as costelas, sem elevar os ombros. Solte o ar devagar pela boca.',
   1, '10 respirações'),
  ('Báscula pélvica', 'pilates',
   'Mobiliza a pelve e a coluna lombar, ativando abdômen profundo.',
   'Deitada de barriga para cima, joelhos dobrados e pés apoiados. Ao soltar o ar, encaixe o quadril aproximando a lombar do chão. Ao inspirar, volte à posição neutra. Movimento lento e controlado.',
   2, '10 repetições'),
  ('Ponte (elevação pélvica)', 'pilates',
   'Fortalece glúteos, posteriores de coxa e assoalho pélvico.',
   'Deitada de barriga para cima, joelhos dobrados e pés apoiados na largura do quadril. Ao soltar o ar, contraia o assoalho pélvico e eleve o quadril, vértebra por vértebra. Inspire no alto e desça devagar ao soltar o ar.',
   3, '10 repetições'),
  ('Adução com bola entre os joelhos', 'pilates',
   'Ativa a musculatura interna das coxas junto com o assoalho pélvico.',
   'Deitada de barriga para cima, joelhos dobrados e uma bola pequena ou almofada entre os joelhos. Ao soltar o ar, aperte a bola e contraia o assoalho pélvico. Relaxe ao inspirar.',
   3, '10 repetições, segurando 3 segundos'),
  ('Concha (clam)', 'pilates',
   'Fortalece os músculos laterais do quadril, que ajudam na estabilidade da pelve.',
   'Deitada de lado, joelhos dobrados e pés juntos. Mantendo os pés unidos, abra o joelho de cima sem girar o quadril para trás. Volte devagar. Faça dos dois lados.',
   2, '10 repetições de cada lado'),
  ('Marcha deitada (toe tap)', 'pilates',
   'Treina o controle do abdômen profundo e da pelve.',
   'Deitada de barriga para cima, eleve uma perna de cada vez com o joelho dobrado a 90 graus. Mantendo a lombar estável, desça um pé até tocar o chão e volte, alternando as pernas. Solte o ar ao descer.',
   2, '10 repetições de cada lado'),
  ('Gato e vaca', 'pilates',
   'Mobiliza toda a coluna e coordena movimento com respiração.',
   'De quatro apoios, mãos abaixo dos ombros e joelhos abaixo do quadril. Ao soltar o ar, arredonde as costas olhando para o umbigo. Ao inspirar, estenda a coluna olhando levemente para frente.',
   2, '8 repetições');
