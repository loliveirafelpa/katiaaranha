// Meta diaria de liquido recomendada, a partir da idade e peso do paciente - regra
// passada pela Dra. Katia (ml de agua por kg de peso, variando pela faixa etaria):
// ate 17 anos: 40 ml/kg · 18-55 anos: 35 ml/kg · 56-65 anos: 30 ml/kg · 66+: 25 a 30 ml/kg.
export function calcularMetaLiquidoMl(idade, pesoKg) {
  if (!idade || !pesoKg) return null
  if (idade <= 17) return { min: pesoKg * 40, max: pesoKg * 40 }
  if (idade <= 55) return { min: pesoKg * 35, max: pesoKg * 35 }
  if (idade <= 65) return { min: pesoKg * 30, max: pesoKg * 30 }
  return { min: pesoKg * 25, max: pesoKg * 30 }
}

export function formatarMetaLiquido(meta) {
  if (!meta) return null
  const min = Math.round(meta.min)
  const max = Math.round(meta.max)
  return min === max ? `${min} ml` : `${min}–${max} ml`
}
