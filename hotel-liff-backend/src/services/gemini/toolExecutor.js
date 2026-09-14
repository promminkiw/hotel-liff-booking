import { randomUUID } from 'crypto'
import { listRooms, checkRoomTypeAvailability } from '../rooms.service.js'
import { createBooking, listBookingsByUser, cancelBookingByCode } from '../bookings.service.js'

// The only thing an AI-driven booking is allowed to touch beyond the tool's
// declared arguments is identity - lineUserId/displayName always come from
// the verified request context (context), never from the model's
// arguments. This is the same guardrail the roadmap calls "no shortcuts":
// every tool here calls the exact same service functions the normal UI
// uses (create_booking_atomic, the same cancellation policy check, etc).
export async function executeTool(name, args, context) {
  switch (name) {
    case 'search_rooms': {
      const rooms = await listRooms({ roomType: args.roomType || undefined })
      return { rooms }
    }

    case 'check_room_availability': {
      return checkRoomTypeAvailability({
        roomType: args.roomType,
        checkIn: args.checkIn,
        checkOut: args.checkOut,
        guests: Number(args.guests),
      })
    }

    case 'create_booking': {
      try {
        const booking = await createBooking({
          lineUserId: context.lineUserId,
          displayName: context.displayName,
          roomType: args.roomType,
          checkIn: args.checkIn,
          checkOut: args.checkOut,
          guests: Number(args.guests),
          idempotencyKey: randomUUID(),
        })
        return { success: true, booking }
      } catch (err) {
        if (err.status) return { success: false, error: err.message }
        throw err
      }
    }

    case 'get_my_bookings': {
      const bookings = await listBookingsByUser(context.lineUserId)
      return { bookings }
    }

    case 'cancel_booking': {
      try {
        const booking = await cancelBookingByCode({ bookingCode: args.bookingCode, lineUserId: context.lineUserId })
        return { success: true, booking }
      } catch (err) {
        if (err.status) return { success: false, error: err.message }
        throw err
      }
    }

    default:
      return { error: `unknown tool: ${name}` }
  }
}
