"use client"

/**
 * Dashboard.jsx
 *
 * Vai trò: Trang dashboard cho admin và nhân viên.
 * Chức năng:
 * - Hiển thị tổng quan về hoạt động của khách sạn
 * - Hiển thị các thống kê quan trọng
 * - Hiển thị biểu đồ doanh thu, công suất phòng
 * - Hiển thị danh sách đặt phòng mới nhất .
 *
 * Quyền truy cập: Admin và Employee
 */

import { useState, useEffect } from "react"
import { FaUsers, FaBed, FaCalendarCheck, FaMoneyBillWave } from "react-icons/fa"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"
import roomService from "../../../services/roomService"
import bookingService from "../../../services/bookingService"
import customerService from "../../../services/customerService"
import reportService from "../../../services/reportService"
import { formatCurrency } from "../../../config/constants"
import "./Dashboard.css"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    totalBookings: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  })
  const [revenueData, setRevenueData] = useState(null)
  const [occupancyData, setOccupancyData] = useState(null)
  const [roomTypeData, setRoomTypeData] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch rooms data
        const roomsResponse = await roomService.getAllRooms()
        const rooms = roomsResponse.data
        const availableRooms = rooms.filter((room) => room.status === "available").length

        // Fetch room types data
        const roomTypesResponse = await roomService.getRoomTypes()
        const roomTypes = roomTypesResponse.data

        // Fetch bookings data
        const bookingsResponse = await bookingService.getAllBookings()
        const bookings = bookingsResponse.data

        // Fetch customers data
        const customersResponse = await customerService.getAllCustomers()
        const customers = customersResponse.data        

        // Chuẩn bị date range cho reports (6 tháng gần nhất)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
        const reportStartDate = sixMonthsAgo.toISOString().split('T')[0]
        const reportEndDate = new Date().toISOString().split('T')[0]

        // Fetch revenue & occupancy data
        const revenueResponse = await reportService.getRevenueReport(reportStartDate, reportEndDate)
        const revenueData = revenueResponse.data

        const occupancyResponse = await reportService.getOccupancyReport(reportStartDate, reportEndDate) 
        const occupancyData = occupancyResponse.data

        // Calculate total revenue
        const totalRevenue = revenueData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0)

        // Set stats
        setStats({
          totalRooms: rooms.length,
          availableRooms,
          totalBookings: bookings.length,
          totalCustomers: customers.length,
          totalRevenue,
        })

        // Set recent bookings - sort by date descending first
        const sortedBookings = bookings.sort((a, b) => 
          new Date(b.checkInDate) - new Date(a.checkInDate)
        ).slice(0, 5)
        setRecentBookings(sortedBookings)

        // Prepare chart data
        prepareRevenueChartData(revenueData)
        prepareOccupancyChartData(occupancyData)
        prepareRoomTypeChartData(rooms, roomTypes)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])
  // Prepare revenue chart data
  const prepareRevenueChartData = (data) => {
    if (!data || data.length === 0) {
      setRevenueData(null);
      return;
    }
    // Sắp xếp theo thời gian
    const sortedData = [...data].sort((a, b) => new Date(a.year, a.month - 1) - new Date(b.year, b.month - 1));
    const labels = sortedData.map(item => format(new Date(item.year, item.month - 1), "MM/yyyy", { locale: vi }));
    const monthlyRevenue = sortedData.map(item => (item.totalRevenue || 0) / 1000000);
    const monthlyRoomRevenue = sortedData.map(item => (item.roomRevenue || 0) / 1000000);
    const monthlyServiceRevenue = sortedData.map(item => (item.serviceRevenue || 0) / 1000000);
    setRevenueData({
      labels,
      datasets: [
        {
          type: 'line',
          label: "Tổng doanh thu",
          data: monthlyRevenue,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
          order: 1,
          pointRadius: 4,
        },
        {
          type: 'bar',
          label: "Doanh thu phòng",
          data: monthlyRoomRevenue,
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          borderRadius: 6,
          order: 2,
          barPercentage: 0.5,
          categoryPercentage: 0.6,
        },
        {
          type: 'bar',
          label: "Doanh thu dịch vụ",
          data: monthlyServiceRevenue,
          backgroundColor: "rgba(245, 158, 11, 0.8)",
          borderRadius: 6,
          order: 2,
          barPercentage: 0.5,
          categoryPercentage: 0.6,
        }
      ]
    });
  }

  // Prepare occupancy chart data
  const prepareOccupancyChartData = (data) => {
    if (!data || data.length === 0) {
      setOccupancyData(null);
      return;
    }
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedData.map(item => format(parseISO(item.date), "dd/MM"));
    const occupancyRates = sortedData.map(item => (item.occupancyRate || 0) * 100);
    setOccupancyData({
      labels,
      datasets: [
        {
          label: "Tỷ lệ lấp đầy (%)",
          data: occupancyRates,
          backgroundColor: "#3b82f6",
          borderRadius: 8,
          maxBarThickness: 48,
        }
      ]
    });
  }

  // Prepare room type chart data
  const prepareRoomTypeChartData = (rooms, roomTypes) => {
    if (!rooms || !roomTypes || rooms.length === 0) {
      setRoomTypeData(null);
      return;
    }
    // Đảm bảo đủ 8 loại phòng, kể cả khi không có phòng nào thuộc loại đó
    const typeNames = roomTypes.map(type => type.name);
    const typeIds = roomTypes.map(type => type.id);
    const counts = typeIds.map(id => rooms.filter(room => room.roomTypeId === id).length);
    setRoomTypeData({
      labels: typeNames,
      datasets: [
        {
          data: counts,
          backgroundColor: [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
            '#8b5cf6', '#ec4899', '#6366f1', '#84cc16'
          ],
          borderWidth: 1,
        }
      ]
    });
  }

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Tổng quan</h1>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon rooms-icon">
            <FaBed />
          </div>
          <div className="stat-content">
            <h3>Phòng</h3>
            <div className="stat-numbers">
              <span className="stat-main">{stats.availableRooms}</span>
              <span className="stat-sub">/ {stats.totalRooms}</span>
            </div>
            <p className="stat-label">Phòng trống</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bookings-icon">
            <FaCalendarCheck />
          </div>
          <div className="stat-content">
            <h3>Đặt phòng</h3>
            <div className="stat-numbers">
              <span className="stat-main">{stats.totalBookings}</span>
            </div>
            <p className="stat-label">Tổng số đặt phòng</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>Khách hàng</h3>
            <div className="stat-numbers">
              <span className="stat-main">{stats.totalCustomers}</span>
            </div>
            <p className="stat-label">Tổng số khách hàng</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-content">
            <h3>Doanh thu</h3>
            <div className="stat-numbers">
              <span className="stat-main">{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <p className="stat-label">Tổng doanh thu</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>Doanh thu theo tháng</h3>
          {revenueData && (
            <Line
              data={revenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    align: "center",
                    labels: {
                      boxWidth: 12,
                      usePointStyle: true,
                      padding: 20,
                      font: { size: 12 }
                    }
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    padding: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#111827',
                    bodyColor: '#4B5563',
                    borderColor: '#E5E7EB',
                    borderWidth: 1,
                    callbacks: {
                      label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(0)} triệu VND`
                    }
                  }
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { maxRotation: 0, font: { size: 12 } }
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: '#F3F4F6' },
                    ticks: {
                      font: { size: 12 },
                      callback: (value) => `${value}M`
                    }
                  }
                },
                interaction: {
                  mode: 'nearest',
                  axis: 'x',
                  intersect: false
                }
              }}
            />
          )}
        </div>

        <div className="chart-card">
          <h3>Phân bố loại phòng</h3>
          {roomTypeData && (
            <Doughnut
              data={roomTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                    labels: {
                      boxWidth: 12,
                      usePointStyle: true,
                      padding: 12,
                      font: { size: 12 }
                    }
                  },
                  tooltip: {
                    padding: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#111827',
                    bodyColor: '#4B5563',
                    borderColor: '#E5E7EB',
                    borderWidth: 1,
                    callbacks: {
                      label: (context) => {
                        const value = context.raw;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${value} (${percent}%)`;
                      }
                    }
                  }
                },
                cutout: '65%'
              }}
            />
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="recent-bookings">
        <h3>Đặt phòng gần đây</h3>
        <div className="table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Mã đặt phòng</th>
                <th>Khách hàng</th>
                <th>Phòng</th>
                <th>Ngày nhận</th>
                <th>Ngày trả</th>
                <th>Trạng thái</th>
                <th>Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{String(booking.id).padStart(4, '0')}</td>
                  <td>{booking.customerName}</td>
                  <td>{booking.roomNumber}</td>
                  <td>{format(new Date(booking.checkInDate), "dd/MM/yyyy")}</td>
                  <td>{format(new Date(booking.checkOutDate), "dd/MM/yyyy")}</td>
                  <td>
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status === "confirmed" ? "Đã xác nhận"
                        : booking.status === "pending" ? "Chờ xác nhận"
                        : booking.status === "checked_in" ? "Đã nhận phòng"
                        : booking.status === "checked_out" ? "Đã trả phòng"
                        : booking.status === "cancelled" ? "Đã hủy"
                        : booking.status}
                    </span>
                  </td>
                  <td>{formatCurrency(booking.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

