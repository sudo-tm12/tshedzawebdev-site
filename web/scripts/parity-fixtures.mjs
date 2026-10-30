// Generates 500 random selections + the TS engine's results, so the PHP engine
// can be proven identical (api/tests/parity.php). Run: npm run parity
import { writeFileSync } from 'node:fs'
import { PRICEBOOK, computeEstimate } from '../src/lib/quote/engine.ts'

let seed = 42
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648)
const pick = (a) => a[Math.floor(rnd() * a.length)]
const cases = []
for (let i = 0; i < 500; i++) {
  const s = pick(PRICEBOOK.services)
  const t = pick(s.tiers)
  const units = s.unit ? Math.floor(rnd() * (s.unit.max + 5)) : 1
  const addons = {}
  for (const a of s.addons) if (rnd() < 0.4) addons[a.id] = 1 + Math.floor(rnd() * 3)
  const monthly = s.monthly.filter(() => rnd() < 0.4).map((m) => m.id)
  const sel = { service: s.id, tier: t.id, units, addons, monthly, priority: rnd() < 0.3 }
  const e = computeEstimate(sel)
  cases.push({ sel, expect: { oneOff: e.oneOff, monthly: e.monthly, low: e.low, high: e.high, deposit: e.deposit, weeks: e.weeks, lines: e.lines.map((l) => [l.label, l.amount]) } })
}
writeFileSync('../api/tests/parity-fixtures.json', JSON.stringify(cases))
console.log('wrote', cases.length, 'parity cases')
