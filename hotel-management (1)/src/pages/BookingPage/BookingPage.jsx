"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { toast } from 'react-toastify'
import { FaCheckCircle, FaPlus, FaMinus, FaSpinner, FaExclamationCircle } from 'react-icons/fa'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import roomEndpoints from '../../api/endpoints/roomEndpoints'
import bookingEndpoints from '../../api/endpoints/bookingEndpoints'
import serviceService from '../../services/serviceService'
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
  
  // Add new service-related states
  const [availableServices, setAvailableServices] = useState([])
  const [serviceCategories, setServiceCategories] = useState([])
  const [selectedServices, setSelectedServices] = useState({}) // { serviceId: quantity }
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesError, setServicesError] = useState(null)

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

  // New effect to fetch available services based on selectedRoom
  useEffect(() => {
    const fetchAvailableServices = async () => {
      if (selectedRoom && selectedRoom.id) {
        setServicesLoading(true)
        setServicesError(null)
        try {
          const response = await serviceService.getAllServices()
          const servicesData = response.data || []
          setAvailableServices(servicesData)

          // Fetch service categories if not already fetched
          if (servicesData.length > 0) {
            const categoriesResponse = await serviceService.getAllCategories()
            setServiceCategories(categoriesResponse.data || [])
          } else {
            setServiceCategories([])
          }

        } catch (error) {
          console.error("[BookingPage] Error fetching services:", error)
          setServicesError("Could not fetch services. Please try again later.")
        } finally {
          setServicesLoading(false)
        }
      } else {
        setAvailableServices([])
        setServiceCategories([])
      }
    }

    fetchAvailableServices()
  }, [selectedRoom])

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

  const handleServiceToggle = (serviceId) => {
    setSelectedServices((prev) => {
      const currentQuantity = prev[serviceId] || 0
      const newQuantity = currentQuantity > 0 ? 0 : 1 // Toggle between 0 and 1 for simplicity
      return { ...prev, [serviceId]: newQuantity }
    })
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

  // Calculate total services cost
  const servicesTotal = Object.keys(selectedServices).reduce((total, serviceId) => {
    const service = availableServices.find(s => s.id === parseInt(serviceId))
    const quantity = selectedServices[serviceId] || 0
    return total + (service ? service.price * quantity : 0)
  }, 0)

  const grandTotalWithServices = roomTotal + tax + servicesTotal

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
      toast.error("Vui lòng điền đầy đủ thông tin.")
      return  
    }

    let customerIdToUse = null
    const token = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        if(parsedUser && typeof parsedUser.id !== 'undefined') {
          customerIdToUse = parsedUser.id
        } else {
          console.warn("Không tìm thấy ID người dùng trong thông tin đã lưu");
        }
      } catch (e) {
        console.error("Lỗi khi lấy ID người dùng:", e)
      }
    }

    // Xây dựng payload cho đặt phòng
    const bookingPayload = {
      roomId: selectedRoom.id,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      adults: guests,
      children: 0,
      notes: formData.specialRequests || "",
      paymentMethod: formData.paymentMethod,
      Services: Object.entries(selectedServices)
        .filter(([_, quantity]) => quantity > 0)
        .map(([serviceId, quantity]) => ({
          ServiceId: parseInt(serviceId, 10),
          ServiceDate: new Date().toISOString(), // Or use checkInDate
          Quantity: quantity
        }))
    }

    // Nếu không có customer ID (người dùng chưa đăng nhập), thêm thông tin khách
    if (!customerIdToUse) {
      bookingPayload.customerInfo = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone
      }
    } else {
      bookingPayload.customerId = customerIdToUse
    }

    try {
      const response = await bookingEndpoints.createBooking(bookingPayload)
      if (response.data && response.data.bookingId) {
        toast.success("Đặt phòng thành công!")
        try {
          // Lấy chi tiết booking để hiển thị
          const detailsResponse = await bookingEndpoints.getBookingById(response.data.bookingId)
          setBookingDetails(detailsResponse.data)

          // Đợi 1 giây để đảm bảo booking đã được tạo hoàn toàn
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Tạo hóa đơn cho đặt phòng
          await bookingEndpoints.createInvoice(response.data.bookingId)

          // Đợi 0.5 giây để đảm bảo hóa đơn đã được tạo
          await new Promise(resolve => setTimeout(resolve, 500))

          // Lấy hóa đơn để hiển thị
          const invoiceResponse = await bookingEndpoints.getInvoice(response.data.bookingId)
          if (invoiceResponse.data) {
            setBookingDetails(prevDetails => ({
              ...prevDetails,
              Invoice: invoiceResponse.data
            }))
          }
        } catch (detailsError) {
          console.error("Error fetching booking details or creating invoice:", detailsError)
          // Vẫn hiển thị thông báo thành công vì đặt phòng đã thành công
          toast.warning("Đặt phòng thành công nhưng không thể tạo hóa đơn. Vui lòng liên hệ nhân viên.")
        }
        setBookingComplete(true)
        window.scrollTo(0, 0)
      } else {
        toast.error("Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("Lỗi khi đặt phòng:", error) 
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.")
    }
  }

  if (bookingComplete && bookingDetails) {
    return (
      <div className="booking-page booking-page-complete">
        <Header />
        <div className="container">
          <motion.div
            className="booking-complete-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="booking-complete-icon"><FaCheckCircle /></div>
            <h2>Đặt phòng thành công!</h2>
            <p>Cảm ơn bạn đã đặt phòng. Chúng tôi mong được phục vụ bạn.</p>

            <div className="booking-summary-details">
              <h3>Chi tiết đặt phòng</h3>
              <div className="detail-row">
                <span className="detail-label">Mã đặt phòng:</span>
                <span className="detail-value">#{bookingDetails.Id || bookingDetails.id || 'N/A'}</span>
              </div>
              {/* Hiển thị thông tin cơ bản luôn có sẵn */}
              <div className="detail-row">
                <span className="detail-label">Phòng:</span>
                <span className="detail-value">{selectedRoom?.roomTypeName || 'N/A'} - {selectedRoom?.roomNumber || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Nhận phòng:</span>
                <span className="detail-value">{checkInDate ? format(parseISO(checkInDate), "HH:mm, dd/MM/yyyy") : 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Trả phòng:</span>
                <span className="detail-value">{checkOutDate ? format(parseISO(checkOutDate), "HH:mm, dd/MM/yyyy") : 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Số khách:</span>
                <span className="detail-value">{guests} người lớn</span>
              </div>

              <h3>Thông tin khách hàng</h3>
              <div className="detail-row">
                <span className="detail-label">Họ tên:</span>
                <span className="detail-value">{bookingDetails.CustomerName || `${formData.firstName} ${formData.lastName}`}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{bookingDetails.CustomerEmail || formData.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Điện thoại:</span>  
                <span className="detail-value">{bookingDetails.CustomerPhone || formData.phone}</span>
              </div>

              {/* Chỉ hiển thị phần dịch vụ nếu có dữ liệu */}
              {bookingDetails.Services && bookingDetails.Services.length > 0 && (
                <div className="detail-section">
                  <h3>Dịch vụ đã chọn</h3>
                  <div className="services-table">
                    <div className="service-header">
                      <span>Tên dịch vụ</span>
                      <span>Số lượng</span>
                      <span>Đơn giá</span>
                      <span>Thành tiền</span>
                    </div>
                    {bookingDetails.Services.map((service, index) => (
                      <div key={index} className="service-row">
                        <span>{service.ServiceName}</span>
                        <span>{service.Quantity}</span>
                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.Price)}</span>
                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.Quantity * service.Price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hiển thị thông tin thanh toán cơ bản nếu chưa có hoá đơn */}
              <div className="invoice-section">
                <h3>Chi tiết thanh toán</h3>
                {bookingDetails.Invoice ? (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Số hoá đơn:</span>
                      <span className="detail-value">#{bookingDetails.Invoice.invoiceNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ngày tạo:</span>
                      <span className="detail-value">{format(parseISO(bookingDetails.Invoice.createdAt), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    {/* Hiển thị chi tiết từ hoá đơn */}
                    {bookingDetails.Invoice.items?.map((item, index) => (
                      <div key={index} className="detail-row">
                        <span className="detail-label">{item.description}:</span>
                        <span className="detail-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}</span>
                      </div>
                    ))}
                    <div className="detail-row total-amount">
                      <span className="detail-label">Tổng cộng:</span>
                      <span className="detail-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingDetails.Invoice.totalAmount)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Giá phòng ({numberOfNights()} đêm):</span>
                      <span className="detail-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(roomTotal)}</span>
                    </div>
                    {servicesTotal > 0 && (
                      <div className="detail-row">
                        <span className="detail-label">Tổng tiền dịch vụ:</span>
                        <span className="detail-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(servicesTotal)}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Thuế ({(taxRate * 100).toFixed(0)}%):</span>
                      <span className="detail-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tax)}</span>
                    </div>
                    <div className="detail-row total-amount">
                      <span className="detail-label">Tổng cộng:</span>
                      <span className="detail-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(grandTotalWithServices)}</span>
                    </div>
                    <div className="payment-note">
                      <p>* Chi tiết hoá đơn đầy đủ sẽ được gửi qua email của bạn.</p>
                      <p>* Vui lòng liên hệ nhân viên nếu bạn cần hoá đơn ngay.</p>
                    </div>
                  </>
                )}
              </div>

              {bookingDetails.Notes && (
                <div className="detail-row">
                  <span className="detail-label">Ghi chú:</span>
                  <span className="detail-value">{bookingDetails.Notes}</span>
                </div>
              )}
            </div>

            <p className="booking-note">
              Email xác nhận sẽ được gửi đến {bookingDetails.CustomerEmail || formData.email}. 
              Vui lòng kiểm tra cả hộp thư spam.
              Nếu có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi và cung cấp mã đặt phòng của bạn.
            </p>

            <div className="booking-actions">
              <button onClick={() => navigate("/")} className="btn btn-primary">
                Về trang chủ
              </button>
              <button onClick={() => navigate("/profile")} className="btn btn-secondary">
                Xem đặt phòng của tôi
              </button>
            </div>
          </motion.div>
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
                  {selectedRoom.images && selectedRoom.images.length > 0 ? (
                    <div className="selected-room-image">
                      <img 
                        src={getImageUrl(selectedRoom.images.find(img => img.isPrimary)?.url || selectedRoom.images[0]?.url)} 
                        alt={selectedRoom.roomTypeName} 
                      />
                    </div>
                  ) : null}
                  <div className="selected-room-info">
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
                    <h4>Room Total: ${roomTotal.toFixed(2)}</h4>
                    <p className="tax-note">(Includes ${tax.toFixed(2)} tax)</p>
                    
                    {/* Services Section */}                    <div className="additional-services-section">
                      <h4>Enhance Your Stay with Additional Services</h4>
                      {servicesLoading && (
                        <div className="loading-indicator">
                          <FaSpinner className="spinner" />
                          <span>Looking for available services...</span>
                        </div>
                      )}
                      {servicesError && (
                        <div className="error-message">
                          <FaExclamationCircle />
                          <span>{servicesError}</span>
                        </div>
                      )}
                      {!servicesLoading && !servicesError && (
                        <>
                          {availableServices.length > 0 ? (
                            <>
                              <p className="services-intro">Select additional services to make your stay more comfortable:</p>
                              <div className="services-list">
                                {availableServices.map(service => (
                                  <div key={service.id} className="service-item">
                                    <div className="service-info">
                                      <h5>{service.name}</h5>
                                      <p className="service-description">{service.description}</p>
                                      <p className="service-price">{service.price.toFixed(2)}</p>
                                    </div>
                                    <button 
                                      className={`btn-service-toggle ${selectedServices[service.id] ? 'selected' : ''}`}
                                      onClick={() => handleServiceToggle(service.id)}
                                      aria-label={`${selectedServices[service.id] ? 'Remove' : 'Add'} ${service.name}`}
                                      title={selectedServices[service.id] ? 'Remove service' : 'Add service'}
                                    >
                                      {selectedServices[service.id] ? <FaMinus size={16} /> : <FaPlus size={16} />}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <p className="info-text">No additional services are available for this room type.</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Show selected services summary if any */}                    {Object.keys(selectedServices).length > 0 && (
                      <div className="selected-services-summary">
                        <h4>Your Selected Services</h4>
                        <div className="selected-services-list">
                          {Object.entries(selectedServices).map(([serviceId, quantity]) => {
                            const service = availableServices.find(s => s.id === parseInt(serviceId))
                            if (service && quantity > 0) {
                              return (
                                <div key={serviceId} className="selected-service-item">
                                  <div className="selected-service-info">
                                    <span className="service-name">{service.name}</span>
                                    <span className="service-qty">×{quantity}</span>
                                  </div>
                                  <span className="selected-service-price">
                                    ${(service.price * quantity).toFixed(2)}
                                  </span>
                                </div>
                              )
                            }
                            return null
                          })}
                          <div className="services-total">
                            <span>Services Total</span>
                            <span className="total-amount">${servicesTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <hr />
                    <h4>Grand Total: ${grandTotalWithServices.toFixed(2)}</h4>
                  </div>
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
              </form>              {/* Additional services section moved to selected room summary */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default BookingPage

