# Playbook técnico — como construir cada projeto

## 0. Como usar este documento

Este arquivo é o seu manual técnico padrão. Antes de começar um projeto novo, copie-o inteiro pra dentro da pasta daquele projeto (junto com suas anotações de discovery com o profissional).

Você não precisa entender tecnicamente nada do que está aqui — seu trabalho é apontar o Claude Code pra este arquivo e deixar que ele siga as decisões já tomadas. Pode colar algo assim na primeira mensagem de um projeto novo:

> "Leia o arquivo playbook-tecnico.md nesta pasta e siga essas práticas para todo o projeto. Antes de mais nada, crie um CLAUDE.md resumindo os pontos principais."

O que **não** está neste documento: um roteiro de perguntas pra conversa de discovery com o profissional. Isso é um documento à parte, que vamos montar em seguida.

---

## 1. Começando um projeto novo

Passo a passo mecânico, sempre igual:

1. **Crie uma pasta nova** na Área de Trabalho, com o nome do profissional ou da clínica (ex: `dra-fernanda-psicologia`).
2. **Copie pra dentro dela**: este playbook + as notas da conversa de discovery com o profissional + qualquer material que ele tenha mandado (logo, textos, referências visuais).
3. **Abra a pasta no VS Code** e abra o Claude Code dentro dela.
4. **Peça o pedido inicial padrão**: que ele leia o playbook, crie um `CLAUDE.md` resumido na raiz do projeto, e comece a estrutura do projeto já na stack fixa (seção 2).
5. Peça pra ele também **criar o repositório no GitHub** e **criar o projeto no Supabase** logo no início — não deixar pro final.

**Ordem recomendada de construção:** repositório Git → estrutura de pastas do projeto → schema mínimo no Supabase → primeira tela funcionando → deploy publicado → só depois ir iterando feature por feature, sempre testando cada uma antes de pedir a próxima.

---

## 2. A stack fixa

Não é uma escolha a se fazer a cada projeto — é o ponto de partida padrão, validado na prática:

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Roteamento:** react-router-dom (cada tela com sua própria URL de verdade)
- **Backend, banco de dados e login:** Supabase (Postgres + Auth + Row Level Security + Edge Functions)
- **Ícones:** lucide-react
- **Hospedagem:** Vercel, conectado ao GitHub (ver seção 7)
- **Controle de versão:** GitHub

**Fora do padrão por default:** TypeScript, testes automatizados, bibliotecas de gerenciamento de estado (Redux e afins). Só entram se um projeto específico realmente pedir — e nesse caso, o Claude Code deve justificar explicitamente por que aquele projeto precisa de algo diferente do padrão, antes de usar.

**Quando quebrar essa regra:** o mínimo possível. Se o Claude Code sugerir sair da stack fixa sem uma razão clara ligada às necessidades daquele profissional específico, questione.

---

## 3. Estrutura de pastas do projeto

Layout padrão, o mesmo em todo projeto:

- `src/components` — pedaços de interface reaproveitados entre telas (botões, cards, cabeçalhos)
- `src/pages` — telas públicas (landing page, login, cadastro)
- `src/pages/app` — telas da área logada (o portal do paciente/cliente)
- `src/lib` — um arquivo por "assunto" de dado (ex: `pacientesApi.js`, `agendamentosApi.js`), cada um cuidando de conversar com o Supabase sobre aquele assunto
- `src/data` — conteúdo estático e constantes (listas de opções, textos fixos) — não é dado que vem do banco
- `src/theme.js` — as cores e fontes do projeto, num lugar só (ver seção 6)
- `src/App.jsx`, `src/AppShell.jsx`, `src/main.jsx` — a "espinha dorsal" do projeto: área logada, roteamento geral e ponto de entrada
- `supabase/migrations/` — um arquivo por mudança feita no banco de dados, guardando o histórico
- `supabase/functions/` — uma pasta por função de servidor (ver seção 4)

---

## 4. Padrões do Supabase — o coração da segurança

Esta é a seção mais importante do documento. Ela existe pra garantir que o dado de cada paciente só seja visto por quem deveria.

- **Um cliente Supabase só**, num arquivo `src/lib/supabaseClient.js`, usando **só a chave anônima** (anon key) — nunca a chave de serviço (service role) no código que roda no navegador.
- Não tem problema a chave anônima aparecer no código do navegador — a segurança de verdade não vem de esconder essa chave. Ela vem do **Row Level Security (RLS)** configurado no banco de dados.
- **Toda tabela que guarda dado de paciente precisa ter RLS ativado**, com uma política pra cada operação: `_select_own` (ver o próprio dado), `_insert_own` (criar), `_update_own` (editar), `_delete_own` (apagar) — todas usando a condição `(select auth.uid()) = user_id`. Repare na forma com `select` por dentro — é a forma otimizada, mais rápida em tabelas grandes, e é a forma que deve ser usada sempre (a forma antiga, sem o `select`, funciona mas fica mais lenta conforme a tabela cresce).
- **Nunca confiar só na interface pra decidir quem pode ver o quê.** Se o app só "esconde" um botão mas a política do banco permite o acesso, o dado não está protegido de verdade. A checagem que importa é sempre a do banco (ou de uma Edge Function).
- Os arquivos de `src/lib` seguem sempre o mesmo formato: convertem entre o nome de coluna do banco (`snake_case`, tipo `data_nascimento`) e o nome usado no código (`camelCase`, tipo `dataNascimento`), e sempre verificam erro antes de devolver o resultado (`if (error) throw error`).
- **Qualquer coisa que precise de um segredo de verdade** — chamar uma API de IA paga, apagar uma conta, uma ação que só o profissional (não o paciente) pode fazer — vai pra uma **Edge Function**, que roda no servidor, confirma quem está pedindo (validando o token de login) e guarda o segredo lá dentro. Nunca no código que roda no navegador.
- **Toda regra de negócio que afeta custo ou justiça** (por exemplo, um limite de quantos agendamentos um paciente pode marcar por semana) precisa ser checada de novo no servidor — nunca confiar que checar só na tela é suficiente, porque alguém mal-intencionado pode contornar a tela.
- **Migrations:** cada mudança na estrutura do banco vira um arquivo novo em `supabase/migrations/`, com data no nome. Isso cria um histórico de tudo que já foi mudado — nunca alterar o banco direto pelo painel sem depois registrar essa mudança como uma migration.

---

## 5. LGPD e dado sensível de saúde — um padrão mais alto

Isso merece atenção redobrada: **dado de saúde é considerado "dado pessoal sensível" pela LGPD** (Art. 5º, inciso II) — uma categoria com exigências mais rígidas até do que dado de criança (que já é tratado com cuidado especial pelo Art. 14). Dado sensível exige consentimento **explícito, específico e destacado** (Art. 11) — não pode estar escondido dentro de um "aceito os termos de uso" genérico.

Além da LGPD, o profissional de saúde carrega o próprio **sigilo profissional** (sigilo médico, por exemplo) — uma obrigação legal e ética à parte, que existe independente da lei de proteção de dados. Isso deve aparecer no texto de privacidade do projeto como uma camada extra de cuidado, não como algo já coberto pela LGPD sozinha.

Na prática, todo projeto novo precisa ter:

- **Consentimento específico**, num checkbox separado do aceite geral dos termos de uso, falando claramente sobre o uso do dado de saúde — e esse consentimento precisa ficar **guardado no banco de dados com data e hora**, não só como uma marcação temporária na tela.
- **Política de privacidade em linguagem simples**, com uma parte específica dizendo exatamente pra que aquele dado sensível é usado — e o que nunca é feito com ele.
- **Prazo de retenção definido junto com o profissional** ("por quanto tempo guardamos o dado de um paciente depois que ele para de usar o sistema?") — e esse prazo precisa estar **aplicado de verdade no banco de dados** (por exemplo, com uma rotina automática que apaga ou anonimiza o dado depois do prazo), não só um filtro que esconde dado antigo na tela enquanto ele continua lá guardado.
- **Direitos do paciente sobre o próprio dado** — poder ver, corrigir, apagar e revogar o consentimento — precisam ser uma funcionalidade real dentro do portal, não só uma promessa escrita na política de privacidade.

**Checklist rápido pra aplicar em todo projeto novo:**
- [ ] Existe um checkbox de consentimento específico pra dado de saúde, separado dos termos gerais?
- [ ] Esse consentimento fica guardado no banco, com data e hora?
- [ ] Existe um prazo de retenção definido e aplicado de verdade no banco?
- [ ] O paciente tem uma forma real de apagar ou exportar o próprio dado?

---

## 6. Design system mínimo

Cada projeto tem um arquivo `theme.js` na raiz de `src`, guardando:
- as fontes do projeto (uma de destaque pra títulos, uma de leitura pro corpo do texto, uma pra elementos de interface como botões e menus)
- uma paleta de cores nomeada (8 a 10 tons em hexadecimal, cada um com um nome que diz pra que serve, tipo "destaque" ou "texto-secundário")

**Toda tela e todo componente deve importar essas cores e fontes do `theme.js`** — nunca escrever um código de cor hexadecimal direto no meio de um componente. Isso é importante: já aconteceu de um projeto anterior ficar inconsistente por causa disso (algumas telas usando o arquivo central, outras com cor escrita direto), o que dificulta trocar a identidade visual depois. Evitar desde o início.

A escolha de fontes e cores em si é definida durante o discovery com o profissional (a identidade visual dele) — o que é sempre igual é o mecanismo: um arquivo central, nunca cor solta pelo código.

---

## 7. Deploy — GitHub conectado ao Vercel desde o dia 1

- **Crie o repositório no GitHub antes de fazer qualquer deploy.**
- **Conecte o projeto do Vercel direto ao repositório do GitHub**, já na hora de criar o projeto no Vercel — não trate o deploy manual pela linha de comando como o jeito principal de publicar.

Isso evita um problema real que já aconteceu num projeto anterior sem essa conexão: sem repositório remoto, publicar uma mudança exige lembrar de rodar um comando manual toda vez — e isso já causou confusão, com uma mudança salva localmente sendo tratada como "já publicada" quando na verdade não estava. Com o GitHub conectado, todo `git push` na branch principal já publica sozinho, sem depender de lembrar de nenhum passo extra.

- **Sempre configure um `vercel.json`** com redirecionamento de rota única (pra funcionar como SPA) e cabeçalhos básicos de segurança. Modelo de partida:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), geolocation=(), microphone=(self)" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

- **Variáveis de ambiente do frontend** (endereço e chave anônima do Supabase) ficam configuradas no painel do Vercel. **Segredo de verdade** (chave de API de IA, por exemplo) nunca vira variável de ambiente do frontend — só existe dentro de uma Edge Function.
- **Como conferir se uma mudança está mesmo no ar:** como o site é renderizado pelo navegador (SPA), só olhar o "código-fonte" da página não mostra o conteúdo de verdade. O jeito confiável é abrir o site publicado e testar a funcionalidade na prática.

---

## 8. Domínio próprio e e-mail

- Pra usar um domínio próprio (ex: `dra-fernanda.com.br`), aponte-o pro Vercel através dos registros A/CNAME no painel do registrador (onde o domínio foi comprado). Depois disso, o Vercel cuida sozinho de manter o site publicado nesse endereço.
- Pra **receber e-mail** nesse domínio (ex: `contato@dra-fernanda.com.br`) sem contratar uma caixa de e-mail completa: um serviço de encaminhamento gratuito (como o ImprovMX) resolve — ele pede pra adicionar registros MX e um TXT de SPF no mesmo painel do registrador, e qualquer e-mail que chegar naquele endereço é encaminhado pra uma caixa de e-mail já existente (a sua, ou a do profissional).
- Confirme com o profissional logo no início se ele já tem um domínio próprio ou se precisa comprar um — isso muda o cronograma do projeto.

---

## 9. Como trabalhar com o Claude Code (pra quem não programa)

- **Você dirige, o Claude Code executa.** Seu trabalho é descrever o que o paciente ou o profissional precisa ver e conseguir fazer — não é escrever código nem entender como ele funciona por dentro.
- **Peça uma coisa de cada vez**, e veja funcionando antes de pedir a próxima. Isso evita acumular vários problemas difíceis de rastrear ao mesmo tempo.
- Sempre que uma tela for criada ou mudar, **peça pro Claude Code te mostrar (com print ou explicação) ou te dizer exatamente como testar você mesma**.
- Frases prontas que ajudam:
  - "Antes de começar, crie o CLAUDE.md resumido com os pontos principais deste playbook."
  - "Revise a segurança disso antes de considerarmos pronto pra lançar."
  - "Explica em português simples o que essa mudança faz, sem termo técnico."
- Quando alguma coisa parecer estranha (um prazo muito curto, um comportamento inesperado, uma sugestão que foge do padrão), **peça pro Claude Code explicar o raciocínio antes de aceitar**.
- **Os pontos da stack fixa, da segurança via RLS e do consentimento de dado sensível não são negociáveis por padrão.** Se o Claude Code sugerir pular algum desses pontos "pra simplificar" ou "pra ir mais rápido", confira contra este documento antes de aceitar.

---

## 10. Convenções do repositório

- **Mensagens de commit em português**, começando com verbo no imperativo ("Adicionar", "Corrigir", "Reforçar"), descrevendo o que muda pra quem usa o produto — não o detalhe técnico de implementação. Sem prefixos tipo `feat:` ou `fix:`.
- **Todo projeto tem um `README.md` técnico**, pensado pra quem for mexer no código depois: como o projeto é organizado, como rodar ele localmente, um resumo do banco de dados, os passos de deploy, as regras de negócio já implementadas, e uma lista do que ainda falta.
- **Todo projeto tem também um documento de negócio separado, não-técnico**, explicando o que o produto faz, pra quem, o estado atual e as perguntas em aberto — pensado pra ser colado no início de uma conversa nova com o Claude Code, pra recuperar o contexto rapidamente sem precisar reler código.
- **O `CLAUDE.md` de cada projeto** traz um resumo curto dos pontos inegociáveis (a stack fixa, segurança via RLS, segredo sempre em Edge Function, consentimento de dado sensível, deploy conectado ao GitHub) e uma linha lembrando de consultar este playbook completo pra decisões maiores.

---

## 11. Checklist final antes de entregar ao cliente

- [ ] RLS ativo e testado em toda tabela que guarda dado de paciente
- [ ] Nenhum segredo (chave de IA, chave de serviço) presente no código do frontend
- [ ] Checkbox de consentimento de dado sensível, separado dos termos gerais, guardado com data e hora
- [ ] Prazo de retenção de dado definido e aplicado de verdade no banco
- [ ] Deploy conectado ao GitHub, testado com um `git push` real gerando publicação automática
- [ ] `vercel.json` com redirecionamento de rota e cabeçalhos de segurança
- [ ] Domínio (se houver) apontado e e-mail de contato funcionando
- [ ] README técnico e documento de negócio atualizados
