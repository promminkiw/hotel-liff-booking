// Gemini function declarations. Descriptions double as the guardrail text
// the model actually reads - "must call before X" lives here, not just in
// the system prompt, since Gemini weighs per-tool descriptions heavily
// when deciding whether/when to call a function.
export const toolSchemas = [
  {
    name: 'search_rooms',
    description:
      'ค้นหาห้องพักที่มีอยู่ในระบบพร้อมรายละเอียดและราคา กรองตามประเภทห้องได้ (ไม่เช็ควันว่าง ใช้ตอบคำถามทั่วไปเรื่องประเภทห้อง/สิ่งอำนวยความสะดวก/ราคาเริ่มต้นเท่านั้น)',
    parameters: {
      type: 'object',
      properties: {
        roomType: {
          type: 'string',
          description: 'ประเภทห้อง เช่น Standard, Deluxe, Suite (เว้นว่างไว้เพื่อดูทุกประเภท)',
        },
      },
    },
  },
  {
    name: 'check_room_availability',
    description:
      'เช็คว่าห้องประเภทที่ระบุว่างกี่ห้องจริงในช่วงวันที่ที่กำหนด ต้องเรียกฟังก์ชันนี้ก่อนบอกราคาหรือความว่างของห้องให้ผู้ใช้เสมอ ห้ามเดาเอง',
    parameters: {
      type: 'object',
      properties: {
        roomType: { type: 'string', description: 'ประเภทห้อง เช่น Standard, Deluxe, Suite' },
        checkIn: { type: 'string', description: 'วันเช็คอิน รูปแบบ YYYY-MM-DD' },
        checkOut: { type: 'string', description: 'วันเช็คเอาท์ รูปแบบ YYYY-MM-DD' },
        guests: { type: 'number', description: 'จำนวนผู้เข้าพัก' },
      },
      required: ['roomType', 'checkIn', 'checkOut', 'guests'],
    },
  },
  {
    name: 'create_booking',
    description:
      'สร้างการจองห้องพักจริงในระบบ ห้ามเรียกฟังก์ชันนี้โดยไม่เรียก check_room_availability ก่อน และต้องได้รับการยืนยันชัดเจนจากผู้ใช้ก่อนเสมอ (เช่น ผู้ใช้พูดว่า "ยืนยัน" หรือ "จองเลย")',
    parameters: {
      type: 'object',
      properties: {
        roomType: { type: 'string', description: 'ประเภทห้อง เช่น Standard, Deluxe, Suite' },
        checkIn: { type: 'string', description: 'วันเช็คอิน รูปแบบ YYYY-MM-DD' },
        checkOut: { type: 'string', description: 'วันเช็คเอาท์ รูปแบบ YYYY-MM-DD' },
        guests: { type: 'number', description: 'จำนวนผู้เข้าพัก' },
      },
      required: ['roomType', 'checkIn', 'checkOut', 'guests'],
    },
  },
  {
    name: 'get_my_bookings',
    description: 'ดูรายการจองทั้งหมดของผู้ใช้ปัจจุบัน (สถานะ, วันที่, รหัสการจอง) ต้องเรียกก่อนตอบคำถามเกี่ยวกับการจองที่มีอยู่เสมอ',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'cancel_booking',
    description: 'ยกเลิกการจองของผู้ใช้ปัจจุบันด้วยรหัสการจอง ระบบจะตรวจสอบสิทธิ์และเงื่อนไขการยกเลิกให้อัตโนมัติ',
    parameters: {
      type: 'object',
      properties: {
        bookingCode: { type: 'string', description: 'รหัสการจอง เช่น BK20260914053537dbb8' },
      },
      required: ['bookingCode'],
    },
  },
]
