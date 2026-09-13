// Funcoes puras (sem chamada Supabase) que recebem arrays ja carregados e devolvem agregados
// para a visao de graficos/resumo do admin. Volume de dados por paciente e pequeno, entao
// calcular no frontend e mais simples do que manter views/RPC no Postgres nesta fase.

const CATEGORIAS_ATIVIDADE = [
  'trabalho', 'estudos', 'caminhada', 'academia', 'domesticas',
  'social', 'compras', 'lazer', 'descanso', 'outros',
]

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

export function calcularPerdasPorAtividade(entradas) {
  const contagem = Object.fromEntries(CATEGORIAS_ATIVIDADE.map((c) => [c, 0]))
  for (const e of entradas) {
    if (e.tipoEvento === 'perda' && e.perdaAtividadeCategoria) {
      contagem[e.perdaAtividadeCategoria] = (contagem[e.perdaAtividadeCategoria] || 0) + 1
    }
  }
  return contagem
}

// Conta idas ao banheiro (volume urinado > 0) cuja hora local cai numa janela noturna
// configuravel (padrao 23h-6h) - metrica clinica de noturia.
export function calcularNocturia(entradas, { inicioNoite = 23, fimNoite = 6 } = {}) {
  let total = 0
  const porDia = {}

  for (const e of entradas) {
    if (!e.volumeUrinadoMl || e.volumeUrinadoMl <= 0) continue
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

export { CATEGORIAS_ATIVIDADE }
