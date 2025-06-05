"use client"

/**
 * Header.jsx
 *
 * Vai trò: Component header chung cho các trang public.
 * Chức năng:
 * - Hiển thị logo và menu điều hướng
 * - Xử lý responsive menu
 * - Thay đổi style khi cuộn trang
 * - Hiển thị nút đăng nhập/đăng ký hoặc thông tin người dùng
 */

import { useState, useEffect, useCallback } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"
import "./Header.css"

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

  // Theo dõi sự kiện cuộn trang để thay đổi kiểu dáng header
  const handleScroll = useCallback(() => {
    if (window.scrollY > 50) {
      setIsScrolled(true)
    } else {
      setIsScrolled(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Đóng menu mobile khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [location])

  // Xử lý đóng/mở menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Xử lý đóng/mở menu người dùng
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="container header-container">
        <Link to="/" className="logo">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Luxury Hotel
          </motion.h1>
        </Link>

        <div className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <nav className={`main-nav ${isMobileMenuOpen ? "open" : ""}`} aria-label="Main navigation">
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            <motion.li
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link to="/" className={location.pathname === "/" ? "active" : ""}>
                Trang chủ
              </Link>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link to="/rooms" className={location.pathname.includes("/rooms") ? "active" : ""}>
                Phòng
              </Link>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link to="/services" className={location.pathname === "/services" ? "active" : ""}>
                Dịch vụ
              </Link>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link to="/about" className={location.pathname === "/about" ? "active" : ""}>
                Giới thiệu
              </Link>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>
                Liên hệ
              </Link>
            </motion.li>
          </motion.ul>
        </nav>

        <div className="header-actions">
          {currentUser ? (
            <div className="user-menu-container">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="user-menu-trigger"
                onClick={toggleUserMenu}
              >
                <div className="user-avatar">
                  <FaUser />
                </div>
                <span className="user-name">{currentUser.name}</span>
              </motion.div>

              {isUserMenuOpen && (
                <div className="user-dropdown">
                  {(currentUser.role === "admin" || currentUser.role === "employee") && (
                    <Link to="/admin/dashboard" className="dropdown-item">
                      Quản trị
                    </Link>
                  )}
                  <Link to="/profile" className="dropdown-item">
                    Hồ sơ của tôi
                  </Link>
                  <Link to="/booking" className="dropdown-item">
                    Đặt phòng của tôi
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <FaSignOutAlt /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Link to="/login" className="btn btn-secondary">
                  Đăng nhập
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link to="/booking" className="btn btn-primary">
                  Đặt phòng
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

