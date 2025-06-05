"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { formatCurrency } from "../../config/constants"
import { FaWifi, FaCoffee, FaTv, FaBath, FaUsers, FaCheck, FaArrowLeft, FaRulerCombined, FaBed } from "react-icons/fa"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import roomService from "../../services/roomService"
import "./RoomDetailPage.css"

const getAmenityIcon = (amenity) => {
  switch (amenity) {
    case "wifi":
      return <FaWifi />
    case "coffee":
      return <FaCoffee />
    case "tv":
      return <FaTv />
    case "bath":
      return <FaBath />
    case "users":
      return <FaUsers />
    default:
      return <FaCheck />
  }
}

const getImageUrl = (relativePath) => {
  if (!relativePath) return '';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5225";
  const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
  const imagePath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${serverBaseUrl}${imagePath}`;
}

// Dữ liệu mẫu tiện nghi (amenities) cho loại phòng
const AMENITIES_SAMPLE = [
  "wifi", "tv", "coffee", "bath", "air conditioning", "desk", "safe", "hairdryer"
];

const RoomDetailPage = () => {
  const { id } = useParams()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true)
      try {
        const roomRes = await roomService.getRoomById(id)
        const roomData = roomRes.data
        const roomTypeRes = await roomService.getRoomTypeById(roomData.roomTypeId)
        const roomType = roomTypeRes.data
        const imagesRes = await roomService.getRoomTypeImages(roomData.roomTypeId)
        console.log('DEBUG: Raw images data from API:', imagesRes.data);
        const images = Array.isArray(imagesRes.data) ? imagesRes.data : []
        const sortedImages = images.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
        const gallery = sortedImages.map(img => getImageUrl(img.value))
        // Lấy amenities/specifications từ features, bỏ qua image
        const features = Array.isArray(roomType.features) ? roomType.features : [];
        console.log('DEBUG: roomType.features:', features);
        const amenities = features.filter(f => f.featureType === "amenity").map(f => f.name || f.value || "");
        const specifications = features.filter(f => f.featureType === "specification");
        console.log('DEBUG: specifications array:', specifications);

        const sizeSpec = specifications.find(spec => spec.name === 'Area');
        const bedSpec = specifications.find(spec => spec.name === 'Bed');

        setRoom({
          id: roomData.id,
          name: roomType.name,
          description: roomType.description,
          longDescription: roomType.description,
          price: roomType.basePrice,
          capacity: roomType.capacity,
          size: sizeSpec ? sizeSpec.value : 'Đang cập nhật',
          bedType: bedSpec ? bedSpec.value : 'Đang cập nhật',
          type: roomType.name,
          status: roomData.status,
          image: gallery[0] || '',
          gallery: gallery.length ? gallery : ["/placeholder.svg"],
          amenities: amenities.length > 0 ? amenities : AMENITIES_SAMPLE,
          specifications,
        })
      } catch (err) {
        setRoom(null)
      } finally {
        setLoading(false)
      }
    }
    fetchRoom()
  }, [id])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading room details...</p>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="room-not-found">
        <h2>Room Not Found</h2>
        <p>The room you are looking for does not exist or has been removed.</p>
        <Link to="/rooms" className="btn btn-primary">
          Back to Rooms
        </Link>
      </div>
    )
  }

  return (
    <div className="room-detail-page">
      <Header />

      <div className="room-detail-container">
        <div className="container">
          <div className="back-to-rooms">
            <Link to="/rooms" className="btn btn-secondary">
              <FaArrowLeft /> Back to Rooms
            </Link>
          </div>

          <motion.div
            className="room-detail-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>{room.name}</h1>
            <div className="room-meta">
              <div className="meta-item">
                <FaUsers />
                <span>Up to {room.capacity} guests</span>
              </div>
              {room.size && room.size !== 'Đang cập nhật' && (
                <div className="meta-item">
                  <FaRulerCombined /> {/* Placeholder, consider a better icon for size/area */}
                  <span>{room.size}</span>
                </div>
              )}
              {room.bedType && room.bedType !== 'Đang cập nhật' && (
                <div className="meta-item">
                  <FaBed /> {/* Placeholder, consider a better icon for bed type */}
                  <span>{room.bedType}</span>
                </div>
              )}
            </div>
          </motion.div>

          <div className="room-gallery">
            <motion.div
              className="main-image"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img src={room.gallery[activeImage] || "/placeholder.svg"} alt={room.name} />
            </motion.div>

            <div className="thumbnail-container">
              {room.gallery.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail ${activeImage === index ? "active" : ""}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image || "/placeholder.svg"} alt={`${room.name} - View ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="room-detail-content">
            <div className="room-info">
              <motion.div
                className="room-description"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2>Room Description</h2>
                <p>{room.longDescription || room.description || "Đang cập nhật"}</p>
              </motion.div>

              <motion.div
                className="room-features-conveniences"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2>Room Features & Conveniences</h2>
                <div className="features-grid">
                  <div className="amenities-column">
                    <ul>
                      {room.amenities && room.amenities.length > 0 ? room.amenities.map((amenity, index) => (
                        <li key={index} className="amenity-item">
                          {getAmenityIcon(amenity)}
                          <span>{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</span>
                        </li>
                      )) : <li>Amenities data is being updated.</li>}
                    </ul>
                  </div>
                  {room.specifications && room.specifications.length > 0 && (
                  <div className="specifications-column">
                    <ul>
                      {room.specifications.map((spec, idx) => (
                        <li key={idx} className="specification-item">
                          <span className="spec-label">{spec.name}:</span> <span className="spec-value">{spec.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  )}
                </div>
              </motion.div>
            </div>

            <motion.div
              className="room-booking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="booking-card">
                <h3>Room Details</h3>
                <div className="price">
                  <span className="amount">{formatCurrency(room.price)}</span>
                  <span className="per-night">/ đêm</span>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <span className="label">Room Type:</span>
                    <span className="value">{room.type ? room.type.charAt(0).toUpperCase() + room.type.slice(1) : "Đang cập nhật"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Max Guests:</span>
                    <span className="value">{room.capacity || "Đang cập nhật"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Bed Type:</span>
                    <span className="value">{room.bedType || "Đang cập nhật"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Room Size:</span>
                    <span className="value">{room.size || "Đang cập nhật"}</span>
                  </div>
                </div>

                <Link to={`/booking?room=${room.id}`} className="btn btn-primary btn-block">
                  Book This Room
                </Link>

                <p className="booking-note">Free cancellation up to 24 hours before check-in</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default RoomDetailPage

