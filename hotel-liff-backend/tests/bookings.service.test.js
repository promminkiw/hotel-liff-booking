import { describe, it, expect } from 'vitest'
import { validateBookingInput, getVirtualStatus, getCancellationError } from '../src/services/bookings.service.js'

const hotelInfo = {
  max_advance_booking_days: 365,
  max_length_of_stay_nights: 30,
}

const today = '2026-06-15'

describe('validateBookingInput', () => {
  it('accepts a valid booking', () => {
    const errors = validateBookingInput({
      checkIn: '2026-06-20',
      checkOut: '2026-06-22',
      guests: 2,
      hotelInfo,
      today,
    })
    expect(errors).toEqual([])
  })

  it('rejects a check-in date in the past', () => {
    const errors = validateBookingInput({
      checkIn: '2026-06-10',
      checkOut: '2026-06-12',
      guests: 2,
      hotelInfo,
      today,
    })
    expect(errors).toContain('ไม่สามารถจองวันที่ผ่านมาแล้วได้')
  })

  it('rejects check-out on or before check-in', () => {
    const errors = validateBookingInput({
      checkIn: '2026-06-20',
      checkOut: '2026-06-20',
      guests: 2,
      hotelInfo,
      today,
    })
    expect(errors).toContain('วันเช็คเอาท์ต้องอยู่หลังวันเช็คอิน')
  })

  it('rejects zero or negative guests', () => {
    const errors = validateBookingInput({
      checkIn: '2026-06-20',
      checkOut: '2026-06-22',
      guests: 0,
      hotelInfo,
      today,
    })
    expect(errors).toContain('จำนวนผู้เข้าพักต้องมากกว่า 0')
  })

  it('rejects a stay longer than max_length_of_stay_nights', () => {
    const errors = validateBookingInput({
      checkIn: '2026-06-20',
      checkOut: '2026-07-25', // 35 nights
      guests: 2,
      hotelInfo,
      today,
    })
    expect(errors.some((e) => e.includes('30 คืน'))).toBe(true)
  })

  it('rejects a check-in beyond max_advance_booking_days', () => {
    const errors = validateBookingInput({
      checkIn: '2028-01-01', // far beyond 365 days from today
      checkOut: '2028-01-02',
      guests: 2,
      hotelInfo,
      today,
    })
    expect(errors.some((e) => e.includes('365 วัน'))).toBe(true)
  })

  it('accepts a check-in exactly at the max_advance_booking_days boundary', () => {
    const errors = validateBookingInput({
      checkIn: '2027-06-15', // exactly 365 days after today
      checkOut: '2027-06-16',
      guests: 2,
      hotelInfo,
      today,
    })
    expect(errors).toEqual([])
  })
})

describe('getVirtualStatus', () => {
  it('keeps confirmed as-is when checkout is still in the future', () => {
    const status = getVirtualStatus({ status: 'confirmed', check_out: '2026-06-20' }, today)
    expect(status).toBe('confirmed')
  })

  it('keeps confirmed as-is when checkout is today (guest may still be checking out)', () => {
    const status = getVirtualStatus({ status: 'confirmed', check_out: today }, today)
    expect(status).toBe('confirmed')
  })

  it('shows completed once checkout has passed', () => {
    const status = getVirtualStatus({ status: 'confirmed', check_out: '2026-06-01' }, today)
    expect(status).toBe('completed')
  })

  it('never overrides cancelled, even if checkout has passed', () => {
    const status = getVirtualStatus({ status: 'cancelled', check_out: '2026-06-01' }, today)
    expect(status).toBe('cancelled')
  })
})

describe('getCancellationError', () => {
  const cancellationDaysBefore = 2

  it('allows cancellation when check-in is beyond the cutoff', () => {
    const error = getCancellationError({ status: 'confirmed', checkIn: '2026-06-20', cancellationDaysBefore, today })
    expect(error).toBeNull()
  })

  it('allows cancellation exactly at the cutoff boundary', () => {
    // today=2026-06-15, cancellationDaysBefore=2 -> earliest cancellable check-in is 2026-06-17
    const error = getCancellationError({ status: 'confirmed', checkIn: '2026-06-17', cancellationDaysBefore, today })
    expect(error).toBeNull()
  })

  it('refuses cancellation when check-in is inside the cutoff window', () => {
    const error = getCancellationError({ status: 'confirmed', checkIn: '2026-06-16', cancellationDaysBefore, today })
    expect(error).toMatch(/ใกล้วันเข้าพัก/)
  })

  it('refuses cancellation for an already-cancelled booking', () => {
    const error = getCancellationError({ status: 'cancelled', checkIn: '2026-06-20', cancellationDaysBefore, today })
    expect(error).toMatch(/ยกเลิกไปแล้ว/)
  })

  it('refuses cancellation for a completed stay', () => {
    const error = getCancellationError({ status: 'completed', checkIn: '2026-06-01', cancellationDaysBefore, today })
    expect(error).toMatch(/เข้าพักเสร็จสิ้นแล้ว/)
  })
})
