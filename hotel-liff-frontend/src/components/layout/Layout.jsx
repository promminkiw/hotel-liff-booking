import { Outlet, NavLink } from 'react-router-dom'

const guestLinks = [
  { to: '/', label: 'หน้าแรก', end: true },
  { to: '/rooms', label: 'ห้องพัก' },
  { to: '/my-bookings', label: 'การจองของฉัน' },
  { to: '/ai-assistant', label: 'AI Assistant' },
]

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="navbar">
        <span className="navbar-brand">Hotel Booking</span>
        <nav className="navbar-links">
          {guestLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'navlink navlink-active' : 'navlink')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="page-container">
        <Outlet />
      </main>
    </div>
  )
}
