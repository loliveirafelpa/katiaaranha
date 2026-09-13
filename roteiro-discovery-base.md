# Base pra gerar o roteiro de discovery

## 1. Como usar este documento

Este arquivo não é um roteiro de perguntas pronto — é a base pra gerar um roteiro sob medida pra cada profissional que você for conversar. A ideia é simples:

1. **Preencha a seção 2** ("Cenário do profissional") com o que você já souber sobre aquele profissional específico, mesmo que seja pouco.
2. **Peça pro Claude gerar o roteiro** a partir do que você preencheu, usando este documento inteiro como referência. Pode colar algo assim:

   > "Preenchi o cenário do profissional na seção 2 deste documento. Gere um roteiro de perguntas de discovery pra essa conversa, seguindo os critérios da seção 3 e o exemplo da seção 5 como calibração de tom e nível de detalhe."

3. **Leve o roteiro gerado pra conversa** com o profissional. As respostas dele viram suas notas de discovery — que depois entram na pasta do projeto, junto com o `playbook-tecnico.md` (ver a Seção 1 daquele documento).

Este documento é só sobre **descobrir o processo e o produto** — não tem nada aqui sobre orçamento, prazo de fechamento ou quem decide. Isso fica fora de propósito: o foco é entender o profissional e o que dá pra automatizar pra ele.

---

## 2. Cenário do profissional (preencher a cada novo contato)

Preencha o que souber. Não tem problema deixar campo em branco — quanto mais você souber antes, mais afiado sai o roteiro, mas mesmo pouca informação já ajuda o Claude a gerar algo melhor que um roteiro genérico.

**Nome do profissional (ou da clínica):**
___________________________________________

**Área de atuação:** (ex: medicina geral, psicologia, pediatria, nutrição, fisioterapia...)
___________________________________________

**Como veio esse contato / o que ele já mencionou:** (ex: "conheci numa indicação, ele comentou que perde muito tempo remarcando consulta por WhatsApp")
___________________________________________
___________________________________________

**Porte do atendimento:** (ex: atende sozinho, tem secretária, tem uma equipe pequena, quantos pacientes mais ou menos por semana)
___________________________________________

**Alguma ideia ou dor que ele já citou, mesmo vaga:** (ex: "queria que o paciente conseguisse ver os exames sem precisar ligar pro consultório")
___________________________________________
___________________________________________

**Material que ele já mandou** (site atual, redes sociais, planilha que usa, print de algum sistema): (ex: "manda o link do Instagram e diz se tem site hoje")
___________________________________________

---

## 3. O que o roteiro gerado deve cobrir

Isto não é uma lista de perguntas prontas — é o critério de qualidade pra o Claude gerar um roteiro adaptado à área daquele profissional específico (uma psicóloga e um pediatra não usam o mesmo vocabulário nem têm a mesma rotina, mesmo que a estrutura por trás seja parecida). Um bom roteiro, gerado a partir do cenário preenchido, precisa cobrir:

- **O processo real, do início ao fim** — como funciona hoje, na prática, não como o profissional gostaria que funcionasse. Do primeiro contato do paciente até o fim do acompanhamento.
- **Onde estão as dores e o retrabalho** — o que consome mais tempo, o que gera erro, o que ele (ou a equipe) faz de manual e repetitivo hoje.
- **A jornada de quem é atendido** — como o paciente marca, como acompanha entre uma consulta/sessão e outra, como recebe retorno ou orientação.
- **Que informação ele guarda sobre cada paciente hoje, e onde** — papel, planilha, outro sistema, WhatsApp. Isso já é um sinal de quão sensível é o dado envolvido, o que conecta direto com a seção de LGPD do `playbook-tecnico.md` — vale o roteiro puxar esse fio.
- **O que ele já imagina ou gostaria de ter** — mesmo que pareça complicado ou vago, vale perguntar e deixar ele sonhar um pouco antes de filtrar o que é viável.
- **O que é essencial versus o que seria só "bom ter"** — ajuda a priorizar o que construir primeiro.

**Fora do escopo do roteiro, sempre:** orçamento, prazo de fechamento, quem aprova o investimento. Isso é conversa comercial, não de descoberta de produto — fica de fora.

---

## 4. Boas práticas da conversa

Dicas pra conduzir bem, independente do roteiro gerado:

- **Deixe o profissional descrever livremente antes de ir pra pergunta fechada.** Comece largo ("me conta como é o seu dia a dia com os pacientes hoje") antes de entrar em detalhe.
- **Peça um exemplo de caso real, em vez de resposta abstrata.** "Me conta como foi a última vez que isso aconteceu" traz muito mais informação útil do que "isso costuma ser um problema?".
- **Pergunte como seria feito hoje sem nenhum sistema.** Isso revela o processo de verdade por trás da ferramenta que ele usa (ou não usa) hoje.
- **Anote as palavras exatas que ele usa pras coisas.** Se ele chama de "ficha" e não de "prontuário", isso importa — ajuda a manter a linguagem do produto parecida com a dele depois.
- **Não prometa prazo ou funcionalidade na hora.** Essa conversa é pra registrar e entender, não pra fechar escopo ali mesmo.

---

## 5. Exemplo ilustrativo

Pra calibrar o nível de detalhe e o tom esperado — não é pra reaproveitar literalmente, é só uma referência de como um roteiro gerado a partir da seção 2 deveria parecer.

**Cenário preenchido (fictício):** psicóloga clínica, atende sozinha, cerca de 25 pacientes fixos por semana, mencionou que "perde o fio" do que cada paciente trabalhou entre uma sessão e outra, hoje anota tudo à mão num caderno.

**Roteiro gerado pra essa conversa:**

1. Me conta como é o seu dia a dia de atendimento, do agendamento até o fim da sessão.
2. Quando você diz que "perde o fio" entre sessões, me dá um exemplo de uma vez recente que isso aconteceu.
3. Hoje, o que você anota durante ou depois de uma sessão? Onde isso fica guardado?
4. Antes da sessão seguinte, você costuma reler suas anotações? Como é esse momento?
5. Se pudesse ver, num painel simples, um resumo do que cada paciente trabalhou nas últimas sessões, o que mais te ajudaria a ver ali?
6. Seus pacientes hoje têm algum jeito de ver ou acompanhar algo entre uma sessão e outra, ou é só nas sessões mesmo?
7. Como funciona o agendamento hoje — é você que marca, o paciente pede por WhatsApp, outra forma?
8. Existe alguma informação sobre o paciente que você considera mais delicada e trata com cuidado redobrado hoje?
9. Se você pudesse mudar uma única coisa nesse processo hoje, sem se preocupar se é fácil ou difícil de fazer, o que seria?
10. Dessas coisas que conversamos, o que você diria que é essencial ter desde o início, e o que seria bom ter mas pode vir depois?
