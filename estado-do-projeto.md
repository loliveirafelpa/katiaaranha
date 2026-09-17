# Estado do projeto — Diário Miccional Digital (CPA Fisioterapia)

> Cole este arquivo no início de uma conversa nova com o Claude Code pra retomar o contexto rápido, sem precisar reler o código.

## O que é

Um diário miccional digital para a **Dra. Kátia Aranha** (CPA Fisioterapia — Campinas e Jundiaí), usado no acompanhamento fisioterapêutico do assoalho pélvico. Substitui o diário miccional em papel: a paciente registra pelo celular quando bebe líquido, vai ao banheiro ou tem uma perda involuntária de urina, e a Dra. Kátia acompanha tudo isso num painel, com gráficos, pra usar na avaliação e nas consultas.

## Para quem

Dois tipos de acesso:
- **Paciente** — só vê e edita os próprios dados; registra os eventos do dia a dia.
- **Admin (Dra. Kátia)** — cadastra pacientes, cria os ciclos de acompanhamento, vê o diário e os gráficos de cada paciente, escreve notas clínicas privadas (a paciente nunca vê essas notas).

## Estado atual — o que já funciona

**Paciente:**
- Registra 3 tipos de evento a qualquer hora do dia: líquido ingerido, foi ao banheiro (volume em ml é opcional — dá pra registrar só "baixo/médio/alto"), e perda de urina (com intensidade e o que estava fazendo na hora, inclusive texto livre).
- Pode ter mais de um ciclo de acompanhamento ao longo do tempo (por exemplo, um ciclo agora e outro daqui a um mês) e troca entre eles por um menu no topo da tela.
- Preenche um formulário rápido de observações do dia (absorvente, menstruação, medicamentos, outros sintomas).
- Vê os dias anteriores do diário (não só o dia atual) e pode editar ou excluir qualquer registro já feito, não só o de hoje.
- Tela "Meus dados": revoga o consentimento de uso de dado de saúde ou pede exclusão da própria conta.

**Admin (Dra. Kátia):**
- Cadastra paciente (nome, contato, unidade, serviço/tratamento) e recebe uma senha temporária pra repassar.
- Cria ciclos de acompanhamento pra cada paciente — sem uma quantidade fixa de dias, é livre. Não dá mais pra criar dois ciclos com datas que se cruzam pro mesmo paciente (o sistema bloqueia e explica o motivo).
- Vê o diário do paciente separado por dia, com opção de ordenar cada dia por horário ou por tipo de evento, e uma linha do tempo visual ao final de cada dia.
- Aba de Gráficos com: três números em destaque (total de líquido ingerido, total de idas ao banheiro, episódios de perda), balanço hídrico por dia, gráfico de urgência por dia, balanço de perdas por dia, perdas por atividade, e uma tabela colorida que cruza intensidade da perda com a atividade (pra responder "perda leve está mais ligada a quê?").
- Escreve e apaga notas clínicas internas por paciente/dia.

**Identidade visual:** paleta própria só em tons de laranja (baseada no site real da CPA Fisioterapia), com um logo de lótus com mandala no centro, criado pra este sistema.

**Segurança e privacidade:** cada paciente só vê o próprio dado (regra aplicada no banco, não só escondida na tela); consentimento específico pra dado de saúde é obrigatório antes de começar a usar o diário, e fica guardado com data e hora.

## O que falta / decisões em aberto

- **Bug de troca de conta na mesma aba.** Se alguém sai (logout) e loga com outra conta sem recarregar a página, o cabeçalho às vezes fica preso mostrando o nome/perfil da conta anterior (ex.: continua mostrando "Dra. Kátia Aranha · Admin" mesmo já logado como paciente). Confirmado em produção em 17/09/2026. Abrir uma aba nova (ou dar F5) entre um login e outro evita o problema — é o que orientamos pra demonstração pra Dra. Kátia. A causa provável está no carregamento do perfil em `src/AppShell.jsx`. Ainda não investigado/corrigido a fundo.
- **Prazo de retenção do dado.** Precisa decidir com a Dra. Kátia: depois que uma paciente para de usar o sistema, por quanto tempo o dado dela fica guardado? Isso ainda não está definido nem aplicado.
- **Exportar dados.** A paciente ainda não tem um botão pra baixar/exportar os próprios dados (só ver, corrigir contato e apagar a conta).
- **Resumo automático por IA** foi cogitado (a Dra. Kátia teria um resumo gerado automaticamente sobre cada paciente) — decidimos **não fazer isso por enquanto**.
- Ainda não tem domínio próprio configurado (algo como `diario.cpafisio.com.br`) — hoje usa o domínio padrão do Vercel.

## Trabalho recente (mais a mais recente)

- **Deploy publicado no Vercel**, conectado ao GitHub (repositório `loliveirafelpa/katiaaranha`): https://katiaaranha-ghx5.vercel.app — testado em produção com login de admin e de paciente reais em 17/09/2026.
- Paciente agora vê dias anteriores do diário (não só o de hoje) e pode editar ou excluir qualquer registro já feito.
- Regra impedindo dois ciclos com datas conflitantes pro mesmo paciente.
- Linha do tempo horizontal (só horário + tipo, sem detalhe) ao final de cada dia no diário do admin, mais o menu de ordenar por horário ou por tipo.
- Correção de um bug real: trocar de ciclo no menu do paciente não atualizava os dados quando o ciclo escolhido ainda não tinha começado (ficava mostrando dado do ciclo anterior).
- Seletor de ciclo no menu superior da paciente (antes, só dava pra ver o ciclo mais recente).
- Correção de um bug de login: trocar de conta às vezes abria a tela de admin pro paciente errado (o motivo era o sistema tentando voltar pra última página visitada, sem checar se combinava com quem estava logando).
- Redesenho visual completo: paleta 100% laranja, fontes (Poppins/Cormorant Garamond/Inter) e logo de lótus com mandala, inspirados no site real da CPA Fisioterapia.
- Ciclos deixaram de ter uma duração fixa em dias — viraram livres, sem data de encerramento.
- Volume urinado (ml) deixou de ser obrigatório no registro.
- Melhorias nos gráficos do admin: três destaques numéricos, gráfico de urgência com os números nas cores, balanço de perdas por dia, e a tabela cruzando perda com atividade.

## Onde ver mais detalhe técnico

- `README.md` — estrutura do projeto, banco de dados, como rodar local.
- `CLAUDE.md` — resumo dos pontos de segurança e padrão que não podem ser pulados.
- `playbook-tecnico.md` — o manual completo por trás das decisões técnicas.
