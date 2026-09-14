import { describe, it, expect } from 'vitest'
import { validateBookingInput } from '../src/services/bookings.service.js'

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
