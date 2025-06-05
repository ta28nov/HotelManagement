"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { toast } from 'react-toastify'
import { FaCheckCircle } from 'react-icons/fa'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import roomEndpoints from '../../api/endpoints/roomEndpoints'
import bookingEndpoints from '../../api/endpoints/bookingEndpoints'
import { TOKEN_KEY, USER_KEY } from '../../config/constants'
import './BookingPage.css'

// Hàm tiện ích để tạo URL đầy đủ cho ảnh
const getImageUrl = (relativePath) => {
  if (!relativePath) return '';
  // Giả sử VITE_API_URL được định nghĩa trong .env và trỏ đến base của API (ví dụ http://localhost:5225/api)
  // Hoặc nếu không có, dùng giá trị mặc định.
  const apiServiceBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5225/api";
  // Loại bỏ phần /api để lấy gốc của server backend nơi chứa ảnh
  const serverRootUrl = apiServiceBaseUrl.replace(/\/api\/?$/, '');
  const imagePath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${serverRootUrl}${imagePath}`;
};

const BookingPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [initialRoomInfo, setInitialRoomInfo] = useState(null)
  const [allRooms, setAllRooms] = useState([])
  const [availableRoomsLoading, setAvailableRoomsLoading] = useState(false)
  const [availableRoomsError, setAvailableRoomsError] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)

  const queryParams = new URLSearchParams(location.search)
  const queryCheckIn = queryParams.get("checkIn")
  const queryCheckOut = queryParams.get("checkOut")
  const queryRoomId = queryParams.get("roomId")
  const queryGuests = queryParams.get("guests")

  const [checkInDate, setCheckInDate] = useState(
    queryCheckIn && isValid(parseISO(queryCheckIn)) ? format(parseISO(queryCheckIn), "yyyy-MM-dd") : ""
  )
  const [checkOutDate, setCheckOutDate] = useState(
    queryCheckOut && isValid(parseISO(queryCheckOut)) ? format(parseISO(queryCheckOut), "yyyy-MM-dd") : ""
  )
  const [guests, setGuests] = useState(queryGuests ? parseInt(queryGuests, 10) : 1)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    paymentMethod: "PayAtHotel",
  })

  const [errors, setErrors] = useState({})
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingDetails, setBookingDetails] = useState(null) // Will hold BookingDto after successful booking

  useEffect(() => {
    const fetchInitialRoomDetails = async () => {
      if (queryRoomId) {
        try {
          const res = await roomEndpoints.getRoomById(queryRoomId)
          if (res.data) {
            console.log("[BookingPage] Initial room details fetched:", res.data);
            setInitialRoomInfo(res.data)
          }
        } catch (error) {
          console.error("Error fetching initial room details:", error)
          toast.error("Could not load details for the pre-selected room.")
        }
      }
    }
    fetchInitialRoomDetails()
  }, [queryRoomId])

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      console.log("[BookingPage] Attempting to fetch available rooms. Dates:", { checkInDate, checkOutDate });

      if (checkInDate && checkOutDate && isValid(parseISO(checkInDate)) && isValid(parseISO(checkOutDate))) {
        const startDate = parseISO(checkInDate)
        const endDate = parseISO(checkOutDate)

        console.log("[BookingPage] Parsed dates:", { startDate, endDate });

        if (differenceInCalendarDays(endDate, startDate) <= 0) {
          console.log("[BookingPage] Invalid date range: Check-out must be after check-in.");
          setAllRooms([])
          setSelectedRoom(null)
          if (checkInDate && checkOutDate) { 
             toast.error("Check-out date must be after check-in date.")
          }
          return
        }

        setAvailableRoomsLoading(true)
        setAvailableRoomsError(null)
        console.log("[BookingPage] Resetting allRooms and selectedRoom before API call.");
        setAllRooms([])
        setSelectedRoom(null) 

        try {
          const params = {
            checkIn: startDate.toISOString(),
            checkOut: endDate.toISOString(),
          }
          console.log("[BookingPage] Calling roomEndpoints.checkAvailability with params:", params);
          
          const response = await roomEndpoints.checkAvailability(params)
          
          console.log("[BookingPage] Response from roomEndpoints.checkAvailability:", response);
          
          const fetchedRooms = response.data || [];
          setAllRooms(fetchedRooms);
          console.log("[BookingPage] Updated allRooms state with (count: " + fetchedRooms.length + "):", fetchedRooms);

          if (initialRoomInfo && fetchedRooms.some(room => room.id === initialRoomInfo.id)) {
            console.log("[BookingPage] Initial room info present and found in available rooms. Attempting to pre-select.", initialRoomInfo);
            const roomCapacity = initialRoomInfo.capacity || 1
            if (queryGuests && parseInt(queryGuests, 10) <= roomCapacity) {
              setSelectedRoom(initialRoomInfo)
              console.log("[BookingPage] Pre-selected initial room based on queryGuests.");
            } else if (!queryGuests && 1 <= roomCapacity) {
              setSelectedRoom(initialRoomInfo)
              console.log("[BookingPage] Pre-selected initial room with default guest count.");
            }
          }

        } catch (error) {
          console.error("[BookingPage] Error fetching available rooms API:", error.response || error.message || error);
          setAvailableRoomsError("Could not fetch available rooms. Please try different dates or contact support.")
          toast.error("Could not fetch available rooms. Ensure dates are valid.")
        } finally {
          setAvailableRoomsLoading(false)
          console.log("[BookingPage] Finished fetching available rooms. Loading set to false.");
        }
      } else {
        console.log("[BookingPage] Check-in or Check-out date is missing or invalid. Clearing rooms list.");
        setAllRooms([])
        setSelectedRoom(null)
      }
    }

    fetchAvailableRooms()
  }, [checkInDate, checkOutDate, initialRoomInfo, queryGuests])

  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
    const roomCapacity = room.capacity || 1
    if (guests > roomCapacity) {
      setGuests(roomCapacity)
    }
    if (guests < 1) {
      setGuests(1)
    }
  }

  const numberOfNights = useCallback(() => {
    if (checkInDate && checkOutDate) {
      const start = parseISO(checkInDate)
      const end = parseISO(checkOutDate)
      if (isValid(start) && isValid(end)) {
        const diff = differenceInCalendarDays(end, start)
        return diff > 0 ? diff : 0
      }
    }
    return 0
  }, [checkInDate, checkOutDate])

  const roomTotal = selectedRoom && numberOfNights() > 0 ? selectedRoom.basePrice * numberOfNights() : 0
  const taxRate = 0.12
  const tax = roomTotal * taxRate
  const grandTotal = roomTotal + tax

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validateBookingForm = () => {
    const newErrors = {}
    if (!selectedRoom) {
      newErrors.room = "Please select a room from the list."
      toast.warn("Please select a room.")
    }
    if (!checkInDate || !checkOutDate || numberOfNights() <= 0) {
        newErrors.dates = "Please select valid check-in and check-out dates."
        toast.warn("Please select valid check-in and check-out dates.")
    }
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    else if (!/^\d{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = "Phone number must be at least 10 digits"
    }
    if (guests < 1) newErrors.guests = "Number of guests must be at least 1."
    if (selectedRoom && guests > selectedRoom.capacity) {
        newErrors.guests = `This room can only accommodate up to ${selectedRoom.capacity} guests.`;
        toast.warn(`Selected room capacity is ${selectedRoom.capacity}. Please adjust guest count.`)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCompleteBooking = async () => {
    if (!validateBookingForm()) {
      toast.error("Please correct the errors in the form.")
      return
    }

    let customerIdToUse = null 
    const token = localStorage.getItem(TOKEN_KEY) 
    const storedUser = localStorage.getItem(USER_KEY) 

    console.log("[BookingPage] Attempting to get customer ID. Token Key Used:", TOKEN_KEY, "User Key Used:", USER_KEY);
    console.log("[BookingPage] Token from localStorage:", token ? "Exists" : "Not Found");
    console.log("[BookingPage] Stored user string from localStorage:", storedUser);

    if (token && storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser)
            console.log("[BookingPage] Parsed user object:", parsedUser);
            if(parsedUser && typeof parsedUser.id !== 'undefined') {
                customerIdToUse = parsedUser.id 
                console.log("[BookingPage] Customer ID found:", customerIdToUse);
            } else {
                console.warn("[BookingPage] Parsed user object does not contain a valid 'id' property.", parsedUser);
            }
        } catch (e) {
            console.error("[BookingPage] Error parsing user from localStorage:", e);
            toast.error("Error processing user information. Please try logging out and in again.")
            return
        }
    } else {
        console.warn("[BookingPage] Token or stored user not found in localStorage using provided keys.");
    }
    
    if (!customerIdToUse) {
        toast.error("You must be logged in to complete a booking. Please log in and try again.")
        console.log("[BookingPage] Customer ID not resolved. Booking aborted.");
        return
    }

    const bookingPayload = {
      CustomerId: customerIdToUse,
      RoomId: selectedRoom.id, 
      CheckInDate: parseISO(checkInDate).toISOString(),
      CheckOutDate: parseISO(checkOutDate).toISOString(),
      Adults: guests, 
      Children: 0, 
      TotalAmount: grandTotal, 
      Notes: formData.specialRequests,
    }
    console.log("[BookingPage] Booking payload prepared:", bookingPayload);

    try {
      const response = await bookingEndpoints.createBooking(bookingPayload)
      if (response.data && response.data.bookingId) {
        toast.success(response.data.message || "Booking created successfully! Fetching details...")
        const detailsResponse = await bookingEndpoints.getBookingById(response.data.bookingId)
        setBookingDetails(detailsResponse.data) 
        setBookingComplete(true)
        window.scrollTo(0, 0)
      } else {
        toast.error("Failed to create booking. Unexpected response from server.")
        console.error("Unexpected booking creation response:", response)
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      toast.error(error.response?.data?.message || error.response?.data?.error || "An error occurred while creating your booking. Please try again.")
    }
  }

  if (bookingComplete && bookingDetails) {
    return (
      <div className="booking-page booking-page-complete">
        <Header />
        <div className="booking-container">
          <div className="container">
            <motion.div
              className="booking-complete-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="booking-complete-icon"><FaCheckCircle /></div>
              <h2>Booking Confirmed!</h2>
              <p>Thank you for your reservation. We look forward to welcoming you.</p>

              <div className="booking-summary-details">
                <h3>Booking Summary</h3>
                <div className="detail-row">
                  <span className="detail-label">Booking ID:</span>
                  <span className="detail-value">{bookingDetails.Id || bookingDetails.id || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Room:</span>
                  <span className="detail-value">{bookingDetails.RoomTypeName || selectedRoom?.roomTypeName || 'N/A'}</span>
                </div>
                 <div className="detail-row">
                  <span className="detail-label">Room Number:</span>
                  <span className="detail-value">{bookingDetails.RoomNumber || selectedRoom?.roomNumber || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Check-in:</span>
                  <span className="detail-value">{format(parseISO(bookingDetails.CheckInDate), "MMMM dd, yyyy, HH:mm")}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Check-out:</span>
                  <span className="detail-value">{format(parseISO(bookingDetails.CheckOutDate), "MMMM dd, yyyy, HH:mm")}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Guests:</span>
                  <span className="detail-value">{bookingDetails.Adults}{bookingDetails.Children > 0 ? ` & ${bookingDetails.Children} Children` : ''}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Booked For:</span>
                  <span className="detail-value">{bookingDetails.CustomerName || `${formData.firstName} ${formData.lastName}`}</span>
                </div>
                 <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{bookingDetails.CustomerEmail || formData.email}</span>
                </div>
                <div className="detail-row total-amount-row">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value">${bookingDetails.TotalAmount?.toFixed(2) || 'N/A'}</span>
                </div>
                 <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">{bookingDetails.Status || 'N/A'}</span>
                </div>
                {bookingDetails.Notes && (
                    <div className="detail-row">
                        <span className="detail-label">Your Notes:</span>
                        <span className="detail-value">{bookingDetails.Notes}</span>
                    </div>
                )}
              </div>

              <p className="booking-note">
                A confirmation email (if applicable) might be sent to {bookingDetails.CustomerEmail || formData.email}. Please check your spam folder.
                For any questions, please contact our customer service with your Booking ID.
              </p>

              <div className="booking-actions">
                <button onClick={() => navigate("/")} className="btn btn-primary">
                  Return to Homepage
                </button>
                <button onClick={() => navigate("/my-bookings")} className="btn btn-secondary">
                  View My Bookings
                </button>
              </div>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="booking-page">
      <Header />
      <div className="booking-container-new-layout">
        <h1 className="booking-main-title">Book Your Stay</h1>
        <div className="booking-content-wrapper">
          <div className="booking-left-column">
            <div className="booking-filters-card">
              <h2>Find Your Room</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="checkIn">Check-in Date</label>
                  <input
                    type="date"
                    id="checkIn"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className={errors.dates ? "error" : ""}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkOut">Check-out Date</label>
                  <input
                    type="date"
                    id="checkOut"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || format(new Date(), "yyyy-MM-dd")}
                    className={errors.dates ? "error" : ""}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="guests-filter">Number of Guests</label>
                <input 
                    type="number"
                    id="guests-filter"
                    value={guests}
                    onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        setGuests(val > 0 ? val : 1)
                    }}
                    min="1"
                    max="10" 
                    className={errors.guests ? "error" : ""}
                />
              </div>
               {errors.dates && <div className="error-message">{errors.dates}</div>}
            </div>

            <div className="available-rooms-list-card">
              <h2>Available Rooms ({allRooms.length})</h2>
              {availableRoomsLoading && <p className="loading-text">Loading rooms...</p>}
              {availableRoomsError && <p className="error-message">{availableRoomsError}</p>}
              {!availableRoomsLoading && !availableRoomsError && allRooms.length === 0 && (checkInDate && checkOutDate) && (
                <p className="info-text">No rooms available for the selected dates/criteria. Please try different dates.</p>
              )}
              {!availableRoomsLoading && !availableRoomsError && allRooms.length === 0 && !(checkInDate && checkOutDate) && (
                <p className="info-text">Please select check-in and check-out dates to see available rooms.</p>
              )}
              <div className="rooms-scrollable-list">
                {(() => {
                  console.log("[BookingPage] Guests value before filtering:", guests);
                  const filteredRooms = allRooms.filter(room => room.capacity >= guests);
                  console.log("[BookingPage] Filtered rooms (count: " + filteredRooms.length + "):", filteredRooms);
                  if (filteredRooms.length === 0 && allRooms.length > 0) {
                    console.warn("[BookingPage] No rooms match the filter criteria. Guests:", guests, "All rooms capacity data:", allRooms.map(r => ({id: r.id, capacity: r.capacity })));
                  }
                  return filteredRooms.map((room) => (
                  <div 
                    key={room.id}
                    className={`room-list-item ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    {room.images && room.images.length > 0 ? (
                        <img 
                            src={getImageUrl(room.images.find(img => img.isPrimary)?.url || room.images[0]?.url)} 
                            alt={room.roomTypeName} 
                            className="room-item-image" 
                        />
                    ) : (
                        <div className="room-item-image-placeholder">No Image</div>
                    )}
                    <div className="room-item-details">
                        <h4>{room.roomTypeName} (Floor: {room.floor})</h4>
                        <p>Room Number: {room.roomNumber}</p>
                        <p>Capacity: {room.capacity} guests</p>
                        <p className="room-item-price">${room.basePrice?.toFixed(2)} / night</p>
                    </div>
                  </div>
                ))})()}
              </div>
            </div>
          </div>

          <div className="booking-right-column">
            <div className="booking-form-card">
              <h2>Your Booking Details</h2>
              {selectedRoom ? (
                <div className="selected-room-summary">
                  <h3>{selectedRoom.roomTypeName}</h3>
                  <p>Room: {selectedRoom.roomNumber} | Floor: {selectedRoom.floor}</p>
                  <p>Price per night: ${selectedRoom.basePrice?.toFixed(2)}</p>
                  <p>Nights: {numberOfNights()}</p>
                  <p>Capacity: {selectedRoom.capacity} guests</p>
                  {selectedRoom.features && selectedRoom.features.length > 0 && (
                    <div>
                        <strong>Features:</strong>
                        <ul>
                            {selectedRoom.features.map(f => <li key={f.id}>{f.name}{f.value ? `: ${f.value}` : ''}</li>)}
                        </ul>
                    </div>
                  )}
                  <hr />
                  <h4>Total Estimate: ${grandTotal.toFixed(2)}</h4>
                  <p className="tax-note">(Includes ${tax.toFixed(2)} tax)</p>
                  <hr />
                </div>
              ) : (
                <p className="info-text">Please select a room from the list on the left.</p>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleCompleteBooking(); }}>
                <h3>Guest Information</h3>
                 <div className="form-row">
                    <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className={errors.firstName ? "error" : ""} required />
                    {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                    </div>
                    <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className={errors.lastName ? "error" : ""} required />
                    {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={errors.email ? "error" : ""} required />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                    </div>
                    <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className={errors.phone ? "error" : ""} required />
                    {errors.phone && <div className="error-message">{errors.phone}</div>}
                    </div>
                </div>

                <div className="form-group">
                  <label htmlFor="specialRequests">Special Requests (Optional)</label>
                  <textarea id="specialRequests" name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} rows="3"></textarea>
                </div>

                <div className="form-group">
                    <label>Payment Method</label>
                    <div className="payment-options-display">
                        <p>Pay at Hotel (Selected)</p> 
                    </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-block" 
                    disabled={!selectedRoom || availableRoomsLoading}
                  >
                    Complete Booking
                  </button>
                </div>
                 {errors.room && <div className="error-message">{errors.room}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default BookingPage

