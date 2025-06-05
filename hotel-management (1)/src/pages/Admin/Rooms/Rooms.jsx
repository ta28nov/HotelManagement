"use client"

/**
 * Rooms.jsx
 *
 * Vai trò: Trang quản lý phòng cho admin và nhân viên.
 * Chức năng:
 * - Hiển thị danh sách phòng
 * - Thêm, sửa, xóa phòng
 * - Lọc và tìm kiếm phòng
 *
 * Quyền truy cập: Admin và Employee
 */

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import RoomList from "../../../components/admin/rooms/RoomList"
import RoomTypeManagement from "../../../components/admin/rooms/RoomTypeManagement"
import "./Rooms.css"

const Rooms = () => {
  const [activeTab, setActiveTab] = useState('rooms')

  return (
    <div className="admin-rooms-container admin-page-container">
      <motion.h1
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="page-title"
      >
        Quản lý Phòng & Loại phòng
      </motion.h1>

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          Quản lý Phòng
        </button>
        <button 
          className={`tab-button ${activeTab === 'roomTypes' ? 'active' : ''}`}
          onClick={() => setActiveTab('roomTypes')}
        >
          Quản lý Loại phòng
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'rooms' && (
          <motion.div key="room-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <RoomList /> 
          </motion.div>
        )}
        {activeTab === 'roomTypes' && (
           <motion.div key="room-type-management" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
             <RoomTypeManagement />
           </motion.div>
        )}
      </div>
    </div>
  )
}

export default Rooms

