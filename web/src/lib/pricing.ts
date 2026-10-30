import { PRICEBOOK, rand } from './quote/engine'

/** "From R2 500" or "From R5 500/month" for a service, read from the price book. */
export function fromPrice(pricebookId: string): string {
  const s = PRICEBOOK.services.find((x) => x.id === pricebookId)
  if (!s) return ''
  const once = s.tiers.map((t) => t.base).filter((n): n is number => typeof n === 'number')
  if (once.length) return `From ${rand(Math.min(...once))}`
  const monthly = s.tiers.map((t) => t.monthlyBase).filter((n): n is number => typeof n === 'number')
  return monthly.length ? `From ${rand(Math.min(...monthly))}/month` : ''
}
