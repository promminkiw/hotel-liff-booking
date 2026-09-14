import { useEffect, useState } from 'react'
import { fetchAvailabilityCalendar } from '../../api/bookingsApi.js'
import { todayInBangkok, shiftMonth } from '../../utils/dateTz.js'

const monthLabelFormatter = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: 'long',
  timeZone: 'UTC',
})

function formatMonthLabel(month) {
  const [y, m] = month.split('-').map(Number)
  return monthLabelFormatter.format(new Date(Date.UTC(y, m - 1, 1)))
}

function buildGrid(month, days) {
  const [y, m] = month.split('-').map(Number)
  const startWeekday = new Date(Date.UTC(y, m - 1, 1)).getUTCDay()
  const cells = Array(startWeekday).fill(null)
  return cells.concat(days)
}

const WEEKDAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

export default function AvailabilityCalendar({ roomType, checkIn, checkOut, onSelectRange }) {
  const today = todayInBangkok()
  const [month, setMonth] = useState(today.slice(0, 7))
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!roomType) return
    setData(null)
    setError(null)
    fetchAvailabilityCalendar({ roomType, month })
      .then(setData)
      .catch((err) => setError(err.message))
  }, [roomType, month])

  if (!roomType) return null

  function handleDayClick(day) {
    if (!day || day.date < today || day.availableCount <= 0) return

    if (!checkIn || (checkIn && checkOut) || day.date <= checkIn) {
      onSelectRange(day.date, '')
    } else {
      onSelectRange(checkIn, day.date)
    }
  }

  const canGoPrev = month > today.slice(0, 7)
  const grid = data ? buildGrid(month, data.days) : []

  return (
    <div className="availability-calendar">
      <div className="calendar-header">
        <button type="button" onClick={() => setMonth((m) => shiftMonth(m, -1))} disabled={!canGoPrev}>
          ‹
        </button>
        <span>{formatMonthLabel(month)}</span>
        <button type="button" onClick={() => setMonth((m) => shiftMonth(m, 1))}>
          ›
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {!error && !data && <p>กำลังโหลดปฏิทิน...</p>}

      {data && (
        <div className="calendar-grid">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="calendar-weekday">
              {label}
            </div>
          ))}
          {grid.map((day, i) => {
            if (!day) return <div key={`blank-${i}`} className="calendar-day calendar-day-blank" />

            const isPast = day.date < today
            const isFull = day.availableCount <= 0
            const isSelected = day.date === checkIn || day.date === checkOut
            const isInRange = checkIn && checkOut && day.date > checkIn && day.date < checkOut
            const disabled = isPast || isFull

            const classNames = ['calendar-day']
            if (disabled) classNames.push('calendar-day-disabled')
            if (isSelected) classNames.push('calendar-day-selected')
            if (isInRange) classNames.push('calendar-day-in-range')

            return (
              <button
                key={day.date}
                type="button"
                className={classNames.join(' ')}
                disabled={disabled}
                onClick={() => handleDayClick(day)}
                title={isFull ? 'เต็ม' : `ว่าง ${day.availableCount} ห้อง`}
              >
                {Number(day.date.slice(-2))}
              </button>
            )
          })}
        </div>
      )}

      <div className="calendar-legend">
        <span>
          <i className="legend-dot legend-available" /> ว่าง
        </span>
        <span>
          <i className="legend-dot legend-full" /> เต็ม
        </span>
      </div>
    </div>
  )
}
