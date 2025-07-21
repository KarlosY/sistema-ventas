export function formatCurrency(amount: number): string {
  // Formato para Soles Peruanos (S/)
  return `S/ ${amount.toFixed(2)}`;
}
