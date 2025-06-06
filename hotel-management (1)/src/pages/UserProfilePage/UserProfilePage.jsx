"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaKey, FaEdit, 
         FaFileInvoice, FaInfoCircle } from "react-icons/fa"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import { useAuth } from "../../context/AuthContext"
import bookingService from "../../services/bookingService"
import "./UserProfilePage.css"
import ChangePasswordForm from "./components/ChangePasswordForm"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

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

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState(null)

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

  const handleViewInvoice = async (bookingId) => {
    setModalLoading(true)
    setModalError(null)
    try {
      const booking = bookings.find(b => b.id === bookingId)
      if (!booking) {
        throw new Error("Booking not found")
      }
      
      // Fetch invoice if not already included in booking
      if (!booking.Invoice) {
        const invoiceResponse = await bookingEndpoints.getInvoice(bookingId)
        booking.Invoice = invoiceResponse.data
      }
      
      setSelectedBooking(booking)
      setShowInvoiceModal(true)
    } catch (error) {
      console.error("Error fetching invoice:", error)
      setModalError("Không thể tải hoá đơn. Vui lòng thử lại sau.")
      toast.error("Không thể tải hoá đơn. Vui lòng thử lại sau.")
    } finally {
      setModalLoading(false)
    }
  }

  const handleViewDetails = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      setSelectedBooking(booking)
      setShowDetailsModal(true)
    }
  }

  const closeModals = () => {
    setShowInvoiceModal(false)
    setShowDetailsModal(false)
    setSelectedBooking(null)
    setModalError(null)
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
                        <motion.div 
                          key={booking.id} 
                          className={`booking-card status-${booking.status?.toLowerCase() || 'unknown'}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="booking-header">
                            <div className="booking-title">
                              <h3>{booking.roomTypeName || `Booking #${booking.id}`}</h3>
                              <span className={`booking-status ${booking.status?.toLowerCase()}`}>
                                {booking.status || 'N/A'}
                              </span>
                            </div>
                            <div className="booking-dates">
                              <div className="date-item">
                                <span className="date-label">Check-in</span>
                                <span className="date-value">{formatDate(booking.checkInDate)}</span>
                              </div>
                              <div className="date-separator">→</div>
                              <div className="date-item">
                                <span className="date-label">Check-out</span>
                                <span className="date-value">{formatDate(booking.checkOutDate)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="booking-details">
                            <div className="booking-info">
                              <div className="info-grid">
                                <div className="info-item">
                                  <span className="info-label">Room</span>
                                  <span className="info-value">{booking.roomNumber || 'N/A'} ({booking.roomTypeName || 'N/A'})</span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Guests</span>
                                  <span className="info-value">
                                    {booking.adults} Adults{booking.children > 0 ? `, ${booking.children} Children` : ''}
                                  </span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Payment Status</span>
                                  <span className={`info-value payment-status ${booking.paymentStatus?.toLowerCase()}`}>
                                    {booking.paymentStatus || 'N/A'}
                                  </span>
                                </div>
                                <div className="info-item total-amount">
                                  <span className="info-label">Total Amount</span>
                                  <span className="info-value">{formatCurrency(booking.totalAmount)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="booking-actions">
                              <button 
                                className="btn btn-primary"
                                onClick={() => handleViewInvoice(booking.id)}
                              >
                                <FaFileInvoice /> View Invoice
                              </button>
                              <button 
                                className="btn btn-outline"
                                onClick={() => handleViewDetails(booking.id)}
                              >
                                <FaInfoCircle /> Details
                              </button>
                            </div>
                          </div>
                        </motion.div>
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

      {/* Invoice Modal */}
      {showInvoiceModal && selectedBooking && (
        <div className="modal-overlay" onClick={closeModals}>
          <motion.div 
            className="modal-content"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button className="modal-close" onClick={closeModals}>&times;</button>
            
            {modalLoading ? (
              <div className="modal-loading">Loading invoice...</div>
            ) : modalError ? (
              <div className="modal-error">{modalError}</div>
            ) : (
              <div className="invoice-container">
                <div className="invoice-header">
                  <h2>Invoice</h2>
                  <p>Booking #{selectedBooking.id}</p>
                </div>

                <div className="invoice-info">
                  <div className="customer-info">
                    <h4>Customer Details</h4>
                    <p>{selectedBooking.customerName}</p>
                    <p>{selectedBooking.customerEmail}</p>
                    <p>{selectedBooking.customerPhone}</p>
                  </div>
                  <div className="booking-info">
                    <h4>Booking Details</h4>
                    <p><strong>Check-in:</strong> {formatDate(selectedBooking.checkInDate)}</p>
                    <p><strong>Check-out:</strong> {formatDate(selectedBooking.checkOutDate)}</p>
                    <p><strong>Room:</strong> {selectedBooking.roomNumber} ({selectedBooking.roomTypeName})</p>
                  </div>
                </div>

                <div className="invoice-items">
                  <div className="invoice-item header">
                    <span>Description</span>
                    <span>Quantity</span>
                    <span>Price</span>
                    <span>Total</span>
                  </div>
                  
                  {/* Room Charge */}
                  <div className="invoice-item">
                    <span>{selectedBooking.roomTypeName}</span>
                    <span>1</span>
                    <span>{formatCurrency(selectedBooking.roomPrice)}</span>
                    <span>{formatCurrency(selectedBooking.roomPrice)}</span>
                  </div>

                  {/* Services */}
                  {selectedBooking.Services?.map((service, index) => (
                    <div key={index} className="invoice-item">
                      <span>{service.ServiceName}</span>
                      <span>{service.Quantity}</span>
                      <span>{formatCurrency(service.Price)}</span>
                      <span>{formatCurrency(service.Price * service.Quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="invoice-total">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedBooking.totalAmount)}</span>
                </div>

                <div className="invoice-footer">
                  <p>Thank you for choosing our hotel!</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="modal-overlay" onClick={closeModals}>
          <motion.div 
            className="modal-content"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button className="modal-close" onClick={closeModals}>&times;</button>
            
            <div className="booking-details-modal">
              <h2>Booking Details</h2>
              
              <div className="details-section">
                <h3>Room Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Room Type</span>
                    <span className="detail-value">{selectedBooking.roomTypeName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Room Number</span>
                    <span className="detail-value">{selectedBooking.roomNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Floor</span>
                    <span className="detail-value">{selectedBooking.floor || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Stay Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Check-in</span>
                    <span className="detail-value">{formatDate(selectedBooking.checkInDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Check-out</span>
                    <span className="detail-value">{formatDate(selectedBooking.checkOutDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">
                      {Math.ceil((new Date(selectedBooking.checkOutDate) - new Date(selectedBooking.checkInDate)) / (1000 * 60 * 60 * 24))} nights
                    </span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Guest Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Adults</span>
                    <span className="detail-value">{selectedBooking.adults}</span>
                  </div>
                  {selectedBooking.children > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Children</span>
                      <span className="detail-value">{selectedBooking.children}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedBooking.Services && selectedBooking.Services.length > 0 && (
                <div className="details-section">
                  <h3>Additional Services</h3>
                  <div className="services-list">
                    {selectedBooking.Services.map((service, index) => (
                      <div key={index} className="service-item">
                        <div className="service-name">{service.ServiceName}</div>
                        <div className="service-quantity">x{service.Quantity}</div>
                        <div className="service-price">{formatCurrency(service.Price * service.Quantity)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.specialRequests && (
                <div className="details-section">
                  <h3>Special Requests</h3>
                  <p className="special-requests">{selectedBooking.specialRequests}</p>
                </div>
              )}

              <div className="details-footer">
                <div className="status-section">
                  <div className={`status-badge ${selectedBooking.status?.toLowerCase()}`}>
                    {selectedBooking.status}
                  </div>
                  <div className={`payment-badge ${selectedBooking.paymentStatus?.toLowerCase()}`}>
                    {selectedBooking.paymentStatus}
                  </div>
                </div>
                <div className="total-section">
                  <span className="total-label">Total Amount</span>
                  <span className="total-value">{formatCurrency(selectedBooking.totalAmount)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default UserProfilePage

