// Acceptance examples from docs/QUOTE-ENGINE.md §3, pinned.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeEstimate } from '../src/lib/quote/engine.ts'

const base = { addons: {}, monthly: [], priority: false }

test('Business site, 5 pages', () => {
  const e = computeEstimate({ ...base, service: 'website', tier: 'business', units: 5 })
  assert.deepEqual([e.oneOff, e.low, e.high, e.deposit, e.weeks], [3500, 3150, 4050, 1600, 2])
})

test('Business site, 8 pages + booking + care plan', () => {
  const e = computeEstimate({ ...base, service: 'website', tier: 'business', units: 8, addons: { booking: 1 }, monthly: ['care'] })
  assert.deepEqual([e.oneOff, e.monthly, e.low, e.high, e.deposit, e.weeks], [6700, 350, 6050, 7700, 3050, 3])
})

test('Growth store, 60 products', () => {
  const e = computeEstimate({ ...base, service: 'ecommerce', tier: 'growth-store', units: 60 })
  assert.deepEqual([e.oneOff, e.low, e.high, e.deposit, e.weeks], [6500, 5850, 7500, 2950, 3])
})

test('Starter site, priority: no deposit under the R3 000 threshold', () => {
  const e = computeEstimate({ ...base, service: 'website', tier: 'landing', units: 1, priority: true })
  assert.deepEqual([e.oneOff, e.low, e.high, e.deposit, e.weeks], [2400, 2150, 2750, 0, 1])
})

test('Per-unit add-on follows the unit count; rate add-on uses build cost', () => {
  const e = computeEstimate({ ...base, service: 'website', tier: 'business', units: 6, addons: { copy: 1, multilingual: 1 } })
  // build 3500 + 400 = 3900; copy 6 × 350 = 2100; second language 25% of 3900 = 975
  assert.equal(e.oneOff, 3900 + 2100 + 975)
})

test('Social media is monthly only', () => {
  const e = computeEstimate({ ...base, service: 'social', tier: 'tier-1', units: 1 })
  assert.deepEqual([e.oneOff, e.monthly, e.deposit], [0, 5500, 0])
})

test('Units are clamped to the service limits', () => {
  const e = computeEstimate({ ...base, service: 'website', tier: 'business', units: 999 })
  assert.equal(e.oneOff, 3500 + (30 - 5) * 400)
})

test('Unknown tier is rejected', () => {
  assert.throws(() => computeEstimate({ ...base, service: 'website', tier: 'nope', units: 1 }))
})
