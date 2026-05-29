/** Pesos colombianos (COP), sin decimales. Ej: $ 4.500 */
export function formatCop(amount: number): string {
  const value = Math.round(amount).toLocaleString('es-CO', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
  return `$ ${value}`
}
