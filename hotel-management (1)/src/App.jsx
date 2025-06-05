"use client"

// Import các thư viện cần thiết
import { Routes, Route, Navigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { useAuth } from "./context/AuthContext"

// Import các trang công khai
import HomePage from "./pages/HomePage/HomePage"
import RoomsPage from "./pages/RoomsPage/RoomsPage"
import RoomDetailPage from "./pages/RoomDetailPage/RoomDetailPage"
import BookingPage from "./pages/BookingPage/BookingPage"
import ServicesPage from "./pages/ServicesPage/ServicesPage"
import AboutPage from "./pages/AboutPage/AboutPage"
import ContactPage from "./pages/ContactPage/ContactPage"
import LoginPage from "./pages/LoginPage/LoginPage"
import RegisterPage from "./pages/RegisterPage/RegisterPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage"
import UserProfilePage from "./pages/UserProfilePage/UserProfilePage"
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage"

// Import các trang quản trị
import AdminLayout from "./components/layout/AdminLayout"
import AdminDashboard from "./pages/Admin/Dashboard/Dashboard"
import AdminRooms from "./pages/Admin/Rooms/Rooms"
import AdminCustomers from "./pages/Admin/Customers/Customers"
import AdminServices from "./pages/Admin/Services/Services"
import AdminBookings from "./pages/Admin/Bookings/Bookings"
import AdminReports from "./pages/Admin/Reports/Reports"
import AdminUsers from "./pages/Admin/Users/Users"
import AdminInvoices from "./pages/Admin/Invoices/Invoices"

/**
 * Component bảo vệ route, kiểm tra quyền truy cập
 * @param {React.ReactNode} children - Các component con được bảo vệ
 * @param {string|string[]} requiredRole - Vai trò yêu cầu để truy cập route
 * @returns {React.ReactNode} - Component con hoặc chuyển hướng
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, hasPermission } = useAuth()

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // Nếu không có quyền truy cập, chuyển hướng đến trang chủ
  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Các route công khai */}
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Route người dùng được bảo vệ */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Route quản trị */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole={["admin", "employee"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="invoices" element={<AdminInvoices />} />

          {/* Route chỉ dành cho admin */}
          <Route
            path="reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Route 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App

