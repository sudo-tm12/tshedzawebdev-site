import pricebookJson from '../data/pricebook.json' with { type: 'json' }

interface Coaching { name: string; tiers: { id: string; name: string; monthly: number }[]; note: string }

export const PRICEBOOK_COACHING = (pricebookJson as unknown as { coaching: Coaching }).coaching
