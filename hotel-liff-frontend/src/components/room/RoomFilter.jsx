const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite']

export default function RoomFilter({ roomType, guests, onChange }) {
  return (
    <div className="room-filter">
      <label>
        ประเภทห้อง
        <select
          value={roomType}
          onChange={(e) => onChange({ roomType: e.target.value, guests })}
        >
          <option value="">ทั้งหมด</option>
          {ROOM_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label>
        จำนวนผู้เข้าพัก
        <input
          type="number"
          min="1"
          value={guests}
          onChange={(e) => onChange({ roomType, guests: e.target.value })}
          placeholder="ไม่ระบุ"
        />
      </label>
    </div>
  )
}
