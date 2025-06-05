"use client"

/**
 * Customers.jsx
 *
 * Vai trò: Trang quản lý khách hàng cho admin và nhân viên.
 * Chức năng:
 * - Hiển thị danh sách khách hàng
 * - Thêm, sửa, xóa khách hàng
 * - Xem lịch sử đặt phòng của khách hàng
 *
 * Quyền truy cập: Admin và Employee
 */

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import CustomerList from "../../../components/admin/customers/CustomerList"
import "./Customers.css"

const Customers = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="admin-customers-container">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading customers data...</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <CustomerList />
        </motion.div>
      )}
    </div>
  )
}

export default Customers

