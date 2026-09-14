import 'dotenv/config'
import { createSupabaseClient } from '../src/config/supabaseClient.js'

const supabase = createSupabaseClient()

const rooms = [
  {
    room_number: '101',
    room_type: 'Standard',
    name: 'Standard Room 101',
    description: 'ห้องมาตรฐาน เตียงเดี่ยวขนาดใหญ่ วิวสวน',
    price_per_night: 1200,
    max_guests: 2,
    bed_type: 'Queen',
    amenities: ['Wi-Fi', 'Air Conditioning', 'TV'],
    status: 'active',
  },
  {
    room_number: '102',
    room_type: 'Standard',
    name: 'Standard Room 102',
    description: 'ห้องมาตรฐาน เตียงเดี่ยวขนาดใหญ่ วิวสวน',
    price_per_night: 1200,
    max_guests: 2,
    bed_type: 'Queen',
    amenities: ['Wi-Fi', 'Air Conditioning', 'TV'],
    status: 'active',
  },
  {
    room_number: '201',
    room_type: 'Deluxe',
    name: 'Deluxe Room 201',
    description: 'ห้องดีลักซ์ กว้างขวาง วิวเมือง',
    price_per_night: 2200,
    max_guests: 3,
    bed_type: 'King',
    amenities: ['Wi-Fi', 'Air Conditioning', 'TV', 'Mini Bar'],
    status: 'active',
  },
  {
    room_number: '202',
    room_type: 'Deluxe',
    name: 'Deluxe Room 202',
    description: 'ห้องดีลักซ์ กว้างขวาง วิวเมือง',
    price_per_night: 2200,
    max_guests: 3,
    bed_type: 'King',
    amenities: ['Wi-Fi', 'Air Conditioning', 'TV', 'Mini Bar'],
    status: 'active',
  },
  {
    room_number: '301',
    room_type: 'Suite',
    name: 'Suite 301',
    description: 'ห้องสวีทหรูหรา พร้อมห้องนั่งเล่นแยก',
    price_per_night: 4500,
    max_guests: 4,
    bed_type: 'King + Sofa Bed',
    amenities: ['Wi-Fi', 'Air Conditioning', 'TV', 'Mini Bar', 'Bathtub'],
    status: 'active',
  },
]

const hotelInfo = {
  id: 1,
  hotel_name: 'Portfolio Grand Hotel',
  address: '123 ถนนสุขุมวิท กรุงเทพฯ',
  phone: '02-123-4567',
  check_in_time: '14:00',
  check_out_time: '12:00',
  facilities: ['สระว่ายน้ำ', 'ฟิตเนส', 'ที่จอดรถ', 'Wi-Fi ฟรี'],
  policies: 'ห้ามสูบบุหรี่ในห้องพัก / อนุญาตให้นำสัตว์เลี้ยงเข้าพักได้ในบางห้อง',
  cancellation_days_before: 1,
  max_advance_booking_days: 365,
  max_length_of_stay_nights: 30,
}

async function seed() {
  console.log('Seeding rooms...')
  const { error: roomsError } = await supabase
    .from('rooms')
    .upsert(rooms, { onConflict: 'room_number' })
  if (roomsError) throw roomsError
  console.log(`  ${rooms.length} rooms upserted`)

  console.log('Seeding hotel_info...')
  const { error: hotelInfoError } = await supabase
    .from('hotel_info')
    .upsert(hotelInfo, { onConflict: 'id' })
  if (hotelInfoError) throw hotelInfoError
  console.log('  hotel_info upserted')

  console.log('Seed complete.')
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
