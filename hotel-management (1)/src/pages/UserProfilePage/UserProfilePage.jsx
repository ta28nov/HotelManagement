"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaKey } from "react-icons/fa"
import { toast } from "react-toastify"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import { useAuth } from "../../context/AuthContext"
import bookingService from "../../services/bookingService"
import "./UserProfilePage.css"
import ChangePasswordForm from "./components/ChangePasswordForm"

// Helper function to format date strings (optional)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-CA'); // YYYY-MM-DD format
  } catch (e) {
    return dateString; // Return original if parsing fails
  }
};

// Helper function to format currency
const formatCurrency = (amount) => {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

const UserProfilePage = () => {
  // Get user data and update function from context
  const { currentUser, updateProfile, loading: authLoading } = useAuth()

  // State for managing editing mode and form data
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  })
  const [errors, setErrors] = useState({})

  const [activeTab, setActiveTab] = useState("profile")
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState(null)

  // Initialize editData when currentUser is loaded or editing starts
  useEffect(() => {
    if (currentUser) {
      setEditData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
      })
    }
  }, [currentUser])

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Fetch bookings when the bookings tab is active and user is available
  useEffect(() => {
    const fetchBookings = async () => {
      if (activeTab === "bookings" && currentUser) {
        setBookingsLoading(true)
        setBookingsError(null)
        try {
          const userBookings = await bookingService.getMyBookings()
          setBookings(userBookings || []) // Ensure bookings is always an array
        } catch (err) {
          console.error("Failed to fetch user bookings:", err)
          setBookingsError(err.response?.data?.message || "Could not load your bookings.")
          setBookings([]) // Clear bookings on error
        } finally {
          setBookingsLoading(false)
        }
      }
    }

    fetchBookings()
  }, [activeTab, currentUser]) // Re-fetch if tab or user changes

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setIsEditing(false)
  }

  const handleStartEdit = () => {
    if (currentUser) {
      setEditData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
      })
      setIsEditing(true)
      setErrors({})
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateEditForm = () => {
    const newErrors = {}
    if (!editData.name?.trim()) {
      newErrors.name = "Tên không được để trống"
    }
    if (!editData.email?.trim()) {
      newErrors.email = "Email không được để trống"
    } else if (!/\S+@\S+\.\S+/.test(editData.email)) {
      newErrors.email = "Email không hợp lệ"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveChanges = async () => {
    if (!validateEditForm()) {
      return
    }
    try {
      const updatePayload = {
        name: editData.name,
        email: editData.email,
        phoneNumber: editData.phoneNumber,
      }
      await updateProfile(updatePayload)
      setIsEditing(false)
    } catch (err) {
      console.error("Update profile failed:", err)
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      }
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setErrors({})
  }

  if (authLoading && !currentUser) {
    return <div className="loading-container">Loading user profile...</div>
  }

  if (!currentUser) {
    return <div className="profile-page"><Header /><div className="profile-container"><p>Could not load user profile. Please try logging in again.</p></div><Footer /></div>
  }

  const formattedJoinDate = currentUser.dateJoined
    ? new Date(currentUser.dateJoined).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A'

  return (
    <div className="profile-page">
      <Header />

      <div className="profile-container">
        <div className="container">
          <h1 className="profile-title">My Account</h1>

          <div className="profile-content">
            <div className="profile-sidebar">
              <div className="user-info">
                <div className="user-avatar">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=random`} alt="User Avatar" />
                </div>
                <h3>{currentUser.name || 'User Name'}</h3>
                <p>{currentUser.email || 'No email provided'}</p>
              </div>

              <div className="profile-tabs">
                <button
                  className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
                  onClick={() => handleTabChange("profile")}
                >
                  <FaUser /> Profile
                </button>
                <button
                  className={`tab-button ${activeTab === "bookings" ? "active" : ""}`}
                  onClick={() => handleTabChange("bookings")}
                >
                  <FaCalendarAlt /> My Bookings
                </button>
                <button
                  className={`tab-button ${activeTab === "password" ? "active" : ""}`}
                  onClick={() => handleTabChange("password")}
                >
                  <FaKey /> Change Password
                </button>
              </div>
            </div>

            <div className="profile-main">
              {activeTab === "profile" && (
                <motion.div
                  className="profile-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="section-header">
                    <h2>Personal Information</h2>
                    {!isEditing && (
                      <button className="btn-edit" onClick={handleStartEdit} disabled={authLoading}>
                        <FaEdit /> Edit
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="edit-form">
                      <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={editData.name}
                          onChange={handleInputChange}
                          className={errors.name ? "error" : ""}
                        />
                        {errors.name && <div className="error-message">{errors.name}</div>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={editData.email}
                          onChange={handleInputChange}
                          className={errors.email ? "error" : ""}
                        />
                        {errors.email && <div className="error-message">{errors.email}</div>}
                      </div>
                      <div className="form-group">
                        <label htmlFor="phoneNumber">Phone</label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={editData.phoneNumber}
                          onChange={handleInputChange}
                          className={errors.phoneNumber ? "error" : ""}
                        />
                        {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
                      </div>
                      <div className="edit-actions">
                        <button className="btn btn-primary" onClick={handleSaveChanges} disabled={authLoading}>
                          {authLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className="btn btn-secondary" onClick={handleCancelEdit} disabled={authLoading}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-details">
                      <div className="detail-item">
                        <FaUser /> <strong>Name:</strong> {currentUser.name || 'N/A'}
                      </div>
                      <div className="detail-item">
                        <FaEnvelope /> <strong>Email:</strong> {currentUser.email || 'N/A'}
                      </div>
                      <div className="detail-item">
                        <FaPhone /> <strong>Phone:</strong> {currentUser.phoneNumber || 'N/A'}
                      </div>
                      <div className="detail-item">
                        <FaCalendarAlt /> <strong>Joined:</strong> {formattedJoinDate}
                      </div>
                      <div className="detail-item">
                        <FaKey /> <strong>Role:</strong> {currentUser.role || 'N/A'}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "bookings" && (
                <motion.div
                  className="profile-section bookings-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2>My Bookings</h2>

                  {bookingsLoading && <div className="loading-indicator">Loading bookings...</div>}
                  {bookingsError && <div className="error-message">{bookingsError}</div>}

                  {!bookingsLoading && !bookingsError && bookings.length === 0 && (
                    <div className="no-bookings">
                      <p>You haven't made any bookings yet.</p>
                      <Link to="/rooms" className="btn btn-primary">
                        Browse Rooms
                      </Link>
                    </div>
                  )}

                  {!bookingsLoading && !bookingsError && bookings.length > 0 && (
                    <div className="bookings-list">
                      {bookings.map((booking) => (
                        <div key={booking.id} className={`booking-card status-${booking.status?.toLowerCase() || 'unknown'}`}>
                          <div className="booking-header">
                            <h3>{booking.roomTypeName || `Booking #${booking.id}`}</h3>
                            <span className="booking-status">{booking.status || 'N/A'}</span>
                          </div>
                          <div className="booking-details">
                            <div className="booking-info">
                              <p><strong>Room:</strong> {booking.roomNumber || 'N/A'} ({booking.roomTypeName || 'N/A'})</p>
                              <p><strong>Check-in:</strong> {formatDate(booking.checkInDate)}</p>
                              <p><strong>Check-out:</strong> {formatDate(booking.checkOutDate)}</p>
                              <p><strong>Guests:</strong> {booking.adults} Adults{booking.children > 0 ? `, ${booking.children} Children` : ''}</p>
                              <p><strong>Total:</strong> {formatCurrency(booking.totalAmount)}</p>
                              <p><strong>Payment:</strong> {booking.paymentStatus || 'N/A'}</p>
                            </div>
                            <div className="booking-actions">
                              {/* Link to the booking detail page - REMOVED */}
                              {/* <Link to={`/booking-details/${booking.id}`} className="btn btn-secondary">View Details</Link> */}
                              {/* Placeholder for potential future actions like rebooking? */}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "password" && (
                <motion.div
                  className="profile-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2>Change Password</h2>
                  <ChangePasswordForm />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default UserProfilePage

