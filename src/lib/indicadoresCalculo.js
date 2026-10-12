// Funcoes puras (sem chamada Supabase) que recebem arrays ja carregados e devolvem agregados
// para a visao de graficos/resumo do admin. Volume de dados por paciente e pequeno, entao
// calcular no frontend e mais simples do que manter views/RPC no Postgres nesta fase.

import { ATIVIDADES_PERDA } from '../data/atividadesPerda'

function agruparPorDia(entradas) {
  const grupos = new Map()
  for (const entrada of entradas) {
    if (!grupos.has(entrada.diaNumero)) grupos.set(entrada.diaNumero, [])
    grupos.get(entrada.diaNumero).push(entrada)
  }
  return grupos
}

export function calcularResumoPorDia(entradas) {
  const grupos = agruparPorDia(entradas)
  const dias = [...grupos.keys()].sort((a, b) => a - b)

  return dias.map((diaNumero) => {
    const doDia = grupos.get(diaNumero)
    const totalLiquidoMl = doDia.reduce((soma, e) => soma + (e.liquidoMl || 0), 0)
    const totalVolumeUrinadoMl = doDia.reduce((soma, e) => soma + (e.volumeUrinadoMl || 0), 0)

    const contagemUrgencia = { pequena: 0, moderada: 0, intensa: 0 }
    const contagemPerda = { pequena: 0, moderada: 0, intensa: 0 }

    for (const e of doDia) {
      if (e.urgencia) contagemUrgencia[e.urgencia] += 1
      if (e.tipoEvento === 'perda' && e.perda) contagemPerda[e.perda] += 1
    }

    return {
      diaNumero,
      totalEntradas: doDia.length,
      totalLiquidoMl,
      totalVolumeUrinadoMl,
      contagemUrgencia,
      contagemPerda,
    }
  })
}

export function calcularBalancoHidrico(entradas) {
  return calcularResumoPorDia(entradas).map((resumo) => ({
    diaNumero: resumo.diaNumero,
    ingeridoMl: resumo.totalLiquidoMl,
    urinadoMl: resumo.totalVolumeUrinadoMl,
    saldoMl: resumo.totalLiquidoMl - resumo.totalVolumeUrinadoMl,
  }))
}

// Para categorias fixas devolve a contagem simples. Para "outro", em vez de somar tudo
// num unico total generico, agrupa por texto que o paciente escreveu - e isso que da
// informacao clinica de verdade (ex.: "ao rir" x2 e diferente de "carregando peso" x1).
export function calcularPerdasPorAtividade(entradas) {
  const contagem = Object.fromEntries(
    ATIVIDADES_PERDA.filter((a) => a.valor !== 'outro').map((a) => [a.valor, 0])
  )
  const outrosPorTexto = new Map()

  for (const e of entradas) {
    if (e.tipoEvento !== 'perda' || !e.perdaAtividadeCategoria) continue

    if (e.perdaAtividadeCategoria === 'outro') {
      const texto = e.perdaAtividadeDetalhe?.trim() || 'Outro (sem detalhe)'
      outrosPorTexto.set(texto, (outrosPorTexto.get(texto) || 0) + 1)
    } else {
      contagem[e.perdaAtividadeCategoria] = (contagem[e.perdaAtividadeCategoria] || 0) + 1
    }
  }

  const outros = [...outrosPorTexto.entries()]
    .map(([texto, quantidade]) => ({ texto, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)

  return { contagem, outros }
}

// Cruza intensidade da perda (leve/moderada/intensa) com a atividade associada -
// e essa combinacao que mostra, por exemplo, se perda leve puxa mais para "ao se sentar"
// e perda moderada puxa mais para "tosse". Mesma regra do "outro" de calcularPerdasPorAtividade:
// agrupa pelo texto que o paciente escreveu, em vez de um bucket generico.
export function calcularCorrelacaoPerdaAtividade(entradas) {
  const porAtividade = new Map()

  for (const e of entradas) {
    if (e.tipoEvento !== 'perda' || !e.perda || !e.perdaAtividadeCategoria) continue

    const chave = e.perdaAtividadeCategoria === 'outro'
      ? (e.perdaAtividadeDetalhe?.trim() || 'Outro (sem detalhe)')
      : e.perdaAtividadeCategoria

    if (!porAtividade.has(chave)) {
      porAtividade.set(chave, { pequena: 0, moderada: 0, intensa: 0 })
    }
    porAtividade.get(chave)[e.perda] += 1
  }

  return [...porAtividade.entries()]
    .map(([atividade, contagem]) => ({
      atividade,
      contagem,
      total: contagem.pequena + contagem.moderada + contagem.intensa,
    }))
    .sort((a, b) => b.total - a.total)
}

// Protocolo de urgencia: urina retida na fralda = peso apos a troca - peso da fralda seca.
// null quando falta um dos pesos (nao da pra afirmar que foi zero).
export function urinaNaFraldaG(e) {
  if (e.pesoFraldaInicialG == null || e.pesoFraldaPosG == null) return null
  return Math.max(0, e.pesoFraldaPosG - e.pesoFraldaInicialG)
}

// Por dia: soma da urina na fralda e quantidade de trocas. O paciente so marca "troquei a
// fralda" em cada registro; o total do dia e a contagem dessas marcacoes.
// Devolve [] quando o ciclo nao tem nenhum dado do protocolo.
export function calcularFraldaPorDia(entradas) {
  const porDia = new Map()
  for (const e of entradas) {
    if (e.tipoEvento !== 'urinario') continue
    const urina = urinaNaFraldaG(e)
    if (urina == null && !e.trocouFralda) continue
    const atual = porDia.get(e.diaNumero) || { diaNumero: e.diaNumero, urinaFraldaG: 0, comPeso: false, trocas: 0 }
    if (urina != null) {
      atual.urinaFraldaG += urina
      atual.comPeso = true
    }
    if (e.trocouFralda) atual.trocas += 1
    porDia.set(e.diaNumero, atual)
  }
  return [...porDia.values()]
    .map((d) => ({ diaNumero: d.diaNumero, urinaFraldaG: d.comPeso ? d.urinaFraldaG : null, trocas: d.trocas }))
    .sort((a, b) => a.diaNumero - b.diaNumero)
}

// Conta idas ao banheiro pra urinar cuja hora local cai numa janela noturna configuravel
// (padrao 23h-6h) - metrica clinica de noturia. Conta todo registro de xixi, mesmo sem
// volume informado (o volume e opcional desde a 0008).
export function calcularNocturia(entradas, { inicioNoite = 23, fimNoite = 6 } = {}) {
  let total = 0
  const porDia = {}

  for (const e of entradas) {
    if (e.tipoEvento !== 'urinario') continue
    const hora = new Date(e.registradoEm).getHours()
    const eNoite = inicioNoite > fimNoite
      ? hora >= inicioNoite || hora < fimNoite
      : hora >= inicioNoite && hora < fimNoite

    if (eNoite) {
      total += 1
      porDia[e.diaNumero] = (porDia[e.diaNumero] || 0) + 1
    }
  }

  return { total, porDia }
}
