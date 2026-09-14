import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchHotelInfo } from '../../api/hotelInfoApi.js'
import Loading from '../../components/common/Loading.jsx'
import ErrorState from '../../components/common/ErrorState.jsx'

export default function Home() {
  const [hotelInfo, setHotelInfo] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHotelInfo()
      .then((data) => setHotelInfo(data.hotelInfo))
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <ErrorState message={error} />
  if (!hotelInfo) return <Loading />

  return (
    <section className="home">
      <h1>{hotelInfo.hotel_name}</h1>
      <p className="home-address">{hotelInfo.address}</p>

      <div className="home-facts">
        <span>เช็คอิน {hotelInfo.check_in_time} น.</span>
        <span>เช็คเอาท์ {hotelInfo.check_out_time} น.</span>
        <span>โทร {hotelInfo.phone}</span>
      </div>

      {hotelInfo.facilities?.length > 0 && (
        <ul className="home-facilities">
          {hotelInfo.facilities.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}

      <div className="home-cta">
        <Link to="/rooms" className="btn-primary">
          ดูห้องพัก
        </Link>
        <Link to="/ai-assistant" className="btn-link">
          หรือคุยกับ AI Assistant
        </Link>
      </div>
    </section>
  )
}
