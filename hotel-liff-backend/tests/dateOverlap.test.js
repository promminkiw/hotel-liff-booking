import { describe, it, expect } from 'vitest'
import { datesOverlap } from '../src/utils/dateOverlap.js'

describe('datesOverlap', () => {
  it('returns true when ranges fully overlap', () => {
    expect(datesOverlap('2026-01-05', '2026-01-10', '2026-01-01', '2026-01-15')).toBe(true)
  })

  it('returns true when ranges partially overlap', () => {
    expect(datesOverlap('2026-01-01', '2026-01-10', '2026-01-05', '2026-01-15')).toBe(true)
  })

  it('returns false when one range ends exactly when the other starts (back-to-back)', () => {
    expect(datesOverlap('2026-01-01', '2026-01-05', '2026-01-05', '2026-01-10')).toBe(false)
  })

  it('returns false when ranges do not touch at all', () => {
    expect(datesOverlap('2026-01-01', '2026-01-05', '2026-02-01', '2026-02-05')).toBe(false)
  })

  it('returns true when one range fully contains the other', () => {
    expect(datesOverlap('2026-01-01', '2026-01-31', '2026-01-10', '2026-01-15')).toBe(true)
  })

  it('is symmetric', () => {
    const a = ['2026-03-01', '2026-03-10']
    const b = ['2026-03-05', '2026-03-20']
    expect(datesOverlap(...a, ...b)).toBe(datesOverlap(...b, ...a))
  })
})
