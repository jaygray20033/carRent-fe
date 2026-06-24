/**
 * Format number as Vietnamese currency (VND)
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount)
}

/**
 * Format as full currency string
 */
export function formatCurrency(amount: number): string {
  return `${formatVND(amount)} VND`
}

/**
 * Calculate rental days from two date strings (dd-mm-yyyy)
 */
export function calcRentalDays(pickupDate: string, returnDate: string): number {
  const [pd, pm, py] = pickupDate.split('-').map(Number)
  const [rd, rm, ry] = returnDate.split('-').map(Number)
  const pickup = new Date(py, pm - 1, pd)
  const ret = new Date(ry, rm - 1, rd)
  const diffMs = ret.getTime() - pickup.getTime()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(days, 1)
}
