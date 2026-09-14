import { Routes, Route } from 'react-router-dom'
import GuestShell from './components/layout/GuestShell.jsx'
import AdminShell from './components/layout/AdminShell.jsx'
import RequireAdminAuth from './components/layout/RequireAdminAuth.jsx'
import Home from './pages/Home/index.jsx'
import Rooms from './pages/Rooms/index.jsx'
import RoomDetail from './pages/RoomDetail/index.jsx'
import Booking from './pages/Booking/index.jsx'
import MyBookings from './pages/MyBookings/index.jsx'
import AIAssistant from './pages/AIAssistant/index.jsx'
import AdminLogin from './pages/Admin/AdminLogin.jsx'
import AdminRoomList from './pages/Admin/AdminRoomList.jsx'
import AdminRoomCreate from './pages/Admin/AdminRoomCreate.jsx'
import AdminBookingList from './pages/Admin/AdminBookingList.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:roomId" element={<RoomDetail />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
      </Route>

      {/* Admin has its own JWT auth, entirely separate from LINE/LIFF -
          accessed from a plain browser, never wrapped in GuestShell. */}
      <Route element={<AdminShell />}>
        <Route path="/admin" element={<AdminLogin />} />
        <Route element={<RequireAdminAuth />}>
          <Route path="/admin/rooms" element={<AdminRoomList />} />
          <Route path="/admin/rooms/new" element={<AdminRoomCreate />} />
          <Route path="/admin/bookings" element={<AdminBookingList />} />
        </Route>
      </Route>
    </Routes>
  )
}
