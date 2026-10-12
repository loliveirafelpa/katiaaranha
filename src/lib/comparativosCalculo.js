// Indicadores por ciclo para a aba "Comparativos" do admin. Ciclos nao tem duracao fixa
// (um pode ter 3 dias registrados e outro 7), entao tudo aqui e MEDIA POR DIA REGISTRADO -
// comparar totais faria o ciclo mais longo sempre parecer "pior".

import { calcularFraldaPorDia } from './indicadoresCalculo'

const INICIO_NOITE = 23
const FIM_NOITE = 6

function ehNoite(iso) {
  const hora = new Date(iso).getHours()
  return hora >= INICIO_NOITE || hora < FIM_NOITE
}

function porDia(valor, dias) {
  return dias > 0 ? valor / dias : 0
}

function percentual(sim, respondidas) {
  return respondidas > 0 ? (sim / respondidas) * 100 : null
}

export function calcularIndicadoresCiclo(entradas) {
  const dias = new Set(entradas.map((e) => e.diaNumero)).size
  const xixis = entradas.filter((e) => e.tipoEvento === 'urinario')
  const perdas = entradas.filter((e) => e.tipoEvento === 'perda')
  const comVolume = xixis.filter((e) => e.volumeUrinadoMl > 0)
  const liquidoMl = entradas.reduce((soma, e) => soma + (e.tipoEvento === 'liquido' ? (e.liquidoMl || 0) : 0), 0)

  const perdaPorSeveridade = { pequena: 0, moderada: 0, intensa: 0 }
  for (const e of perdas) if (e.perda) perdaPorSeveridade[e.perda] += 1
  const urgenciaPorSeveridade = { pequena: 0, moderada: 0, intensa: 0 }
  for (const e of xixis) if (e.urgencia) urgenciaPorSeveridade[e.urgencia] += 1

  const respostasEsvaziamento = xixis.filter((e) => e.esvaziamentoCompleto != null)
  const respostasGotejamento = xixis.filter((e) => e.gotejamentoPosMiccional != null)

  // Protocolo de urgencia: media so dos dias com dado do protocolo - em ciclo sem o
  // protocolo, fica null (aparece "—").
  const fralda = calcularFraldaPorDia(entradas)
  const diasComPeso = fralda.filter((d) => d.urinaFraldaG != null)

  return {
    diasRegistrados: dias,
    urinaFraldaDiaG: diasComPeso.length > 0 ? diasComPeso.reduce((s, d) => s + d.urinaFraldaG, 0) / diasComPeso.length : null,
    trocasFraldaDia: fralda.length > 0 ? fralda.reduce((s, d) => s + d.trocas, 0) / fralda.length : null,
    perdasDia: porDia(perdas.length, dias),
    urgenciasDia: porDia(xixis.filter((e) => e.urgencia).length, dias),
    miccoesDia: porDia(xixis.length, dias),
    nocturiaNoite: porDia(xixis.filter((e) => ehNoite(e.registradoEm)).length, dias),
    volumeMedioMiccaoMl: comVolume.length > 0
      ? comVolume.reduce((soma, e) => soma + e.volumeUrinadoMl, 0) / comVolume.length
      : null,
    liquidoDiaMl: porDia(liquidoMl, dias),
    perdaPorSeveridadeDia: Object.fromEntries(Object.entries(perdaPorSeveridade).map(([k, v]) => [k, porDia(v, dias)])),
    urgenciaPorSeveridadeDia: Object.fromEntries(Object.entries(urgenciaPorSeveridade).map(([k, v]) => [k, porDia(v, dias)])),
    esvaziamentoIncompletoPct: percentual(respostasEsvaziamento.filter((e) => !e.esvaziamentoCompleto).length, respostasEsvaziamento.length),
    gotejamentoPct: percentual(respostasGotejamento.filter((e) => e.gotejamentoPosMiccional).length, respostasGotejamento.length),
  }
}

// Variacao percentual do primeiro pro ultimo ciclo comparado. null quando nao da pra
// calcular (sem dado num dos lados, ou partindo de zero).
export function variacaoPercentual(inicial, final) {
  if (inicial == null || final == null || inicial === 0) return null
  return ((final - inicial) / inicial) * 100
}
