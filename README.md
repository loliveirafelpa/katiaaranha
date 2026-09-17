# Diário Miccional Digital — CPA Fisioterapia

Sistema de diário miccional digital para acompanhamento fisioterapêutico do assoalho pélvico, feito para a Dra. Kátia Aranha (CPA Fisioterapia — Campinas/Jundiaí). Paciente registra hábitos urinários pelo celular; a profissional acompanha pelo painel de admin.

**Em produção:** https://katiaaranha-ghx5.vercel.app (deploy automático a cada push na branch `main`, via Vercel conectado ao GitHub).

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS 4
- **Roteamento:** react-router-dom
- **Backend:** Supabase (Postgres + Auth + Row Level Security + Edge Functions)
- **Ícones:** lucide-react

Ver `playbook-tecnico.md` para o racional completo por trás dessas escolhas.

## Rodando localmente

```bash
npm install
npm run dev
```

Precisa de um `.env.local` (veja `.env.example`) com:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Essas são a URL do projeto e a chave **anônima/publicável** do Supabase — não são segredo, dá pra expor no frontend com segurança (a proteção de verdade é o RLS no banco). Pegue os valores em `Project Settings > API` no painel do Supabase (projeto `katia-aranha-diario`, ref `gqthndonkbdrgwvzxoww`).

## Estrutura de pastas

```
src/
  components/       — peças reaproveitadas entre telas (formulários, tabelas, badges)
  components/brand/ — identidade visual (logo lótus+mandala, marca d'água decorativa)
  pages/            — telas públicas (landing, login, política de privacidade)
  pages/app/        — telas logadas
  pages/app/paciente/ — diário, nova entrada, histórico do dia, observações
  pages/app/admin/  — lista de pacientes, cadastro, ficha do paciente
  lib/              — um arquivo por assunto de dado, cada um conversando com o Supabase
  data/             — listas estáticas (atividades de perda, serviços oferecidos)
  theme.js          — cores e fontes do projeto (única fonte de verdade)
supabase/
  migrations/       — histórico de mudanças no banco, uma por arquivo
  functions/        — Edge Functions (ações que precisam de service role)
```

## Banco de dados

Tabelas principais (todas com RLS ativo):

- **`profiles`** — espelha `auth.users`; guarda `role` (`admin`/`paciente`), nome, contato, unidade, serviço contratado.
- **`consentimentos`** — registro append-only do aceite (ou revogação) do consentimento específico de dado de saúde, com data/hora.
- **`ciclos_diario`** — um paciente pode ter vários ciclos ao longo do tempo. Tem só `data_inicio` (sem data de término — o ciclo é livre, o paciente registra quantos dias quiser). Um gatilho no banco (`impedir_ciclo_conflitante`) impede criar um novo ciclo cuja data de início não seja estritamente posterior à do ciclo mais recente do mesmo paciente.
- **`entradas_diario`** — um registro por evento pontual, nunca uma combinação. `tipo_evento` é `liquido`, `urinario` ou `perda`, e um `check` garante que só os campos daquele tipo estejam preenchidos. Volume urinado (ml) é opcional — o paciente pode registrar só o nível qualitativo (baixo/médio/alto).
- **`observacoes_diarias`** — uma por dia do ciclo (absorvente, menstruação, medicamentos, outros sintomas).
- **`notas_clinicas`** — anotações internas da profissional; o paciente nunca tem acesso (sem policy de select para `paciente`).

Migrations, em ordem: schema inicial → correções de segurança (advisors do Supabase) → separação dos 3 tipos de evento → serviço do paciente no cadastro → nível qualitativo de volume urinado → atividades de perda por gatilho → ciclo sem duração fixa → volume urinado opcional → impedir ciclos com datas conflitantes.

## Edge Functions

- **`criar-paciente`** — só admin pode chamar; cria o usuário no Supabase Auth com senha temporária e o `profile` correspondente.
- **`excluir-paciente`** — só admin pode chamar; usada pelo fluxo de exclusão de conta.

Ambas rodam com a service role key (nunca exposta ao frontend) e conferem o token de quem chamou antes de agir.

## Regras de negócio já implementadas

- Paciente registra 3 tipos de evento a qualquer hora: líquido ingerido, foi ao banheiro (volume opcional + nível qualitativo + urgência), perda de urina (intensidade + atividade associada, incluindo texto livre para "outro").
- Paciente pode ter mais de um ciclo ao longo do tempo; um seletor no cabeçalho deixa trocar entre eles, e todas as telas do paciente (diário do dia, nova entrada, histórico, observações) respeitam o ciclo selecionado.
- Admin cria pacientes (com serviço/tratamento e unidade), gerencia ciclos, adiciona notas clínicas privadas, e vê o diário do paciente em duas visões: tabela por dia (ordenável por horário ou por tipo) com uma linha do tempo horizontal ao final de cada dia, e uma aba de Gráficos com: 3 destaques (líquido ingerido, registros de urina, episódios de perda), balanço hídrico por dia, urgência por dia (barra de severidade), balanço de perdas por dia, perdas por atividade, e uma matriz de calor cruzando intensidade da perda com a atividade associada.
- Consentimento específico de dado de saúde (checkbox separado dos termos gerais), guardado com data/hora; paciente pode revogar a qualquer momento pela tela "Meus dados", que também permite solicitar exclusão da conta.
- Identidade visual própria: paleta 100% em tons de laranja (referência: cpafisio.com.br), fontes Poppins/Cormorant Garamond/Inter, logo de lótus com mandala no centro, marca d'água decorativa na tela inicial.

## O que ainda falta

- **Bug de troca de conta na mesma aba:** sair (logout) e logar com outra conta sem recarregar a página pode deixar o cabeçalho preso mostrando o perfil da conta anterior. A causa provável está no carregamento do perfil em `src/AppShell.jsx` (efeito que recarrega `perfil` a cada mudança de rota, com uma possível corrida entre chamadas concorrentes). Contorno confirmado: abrir aba nova ou dar F5 entre logins. Ainda não corrigido.
- **Retenção de dado (LGPD):** existe a coluna `anonimizado_em` em `profiles`, mas nenhuma rotina automática aplica um prazo de retenção de verdade ainda — isso precisa ser definido com a Dra. Kátia e implementado.
- **Exportação de dados pelo paciente:** o paciente pode ver, corrigir contato e apagar a própria conta, mas ainda não existe um botão de "exportar meus dados".
- **Resumo por IA:** foi cogitado e descartado por enquanto (decisão da Dra. Kátia) — não está implementado.
- Sem testes automatizados (fora do padrão por default deste tipo de projeto, ver playbook).

## Como testar

Rode `npm run dev` e abra `http://localhost:5173`. Existem dois perfis de teste no banco: um admin (Dra. Kátia) e um paciente de teste — peça as credenciais para quem já usou o sistema antes, ou crie um paciente novo pela tela de admin (a senha temporária aparece na tela após a criação, uma única vez).
