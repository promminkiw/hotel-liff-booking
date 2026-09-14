import { useParams } from 'react-router-dom'

export default function RoomDetail() {
  const { roomId } = useParams()
  return (
    <section>
      <h1>รายละเอียดห้อง</h1>
      <p>room id: {roomId} — เนื้อหาจริงจะถูกเพิ่มใน Phase 6</p>
    </section>
  )
}
