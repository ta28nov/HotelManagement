"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaWifi, FaCoffee, FaTv, FaBath, FaUsers } from "react-icons/fa"
import "./RoomCard.css"

const RoomCard = ({ room }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Hàm hiển thị biểu tượng cho các tiện nghi
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
      default:
        return null
    }
  }

  return (
    <motion.div
      className="room-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="room-image-container">
        <img src={room.image || "/placeholder.svg"} alt={room.name} className="room-image" />
        <div className="room-price">
          <span>${room.price}</span>
          <span className="per-night">/ night</span>
        </div>
      </div>

      <div className="room-details">
        <h3 className="room-name">{room.name}</h3>

        <div className="room-capacity">
          <FaUsers />
          <span>Up to {room.capacity} guests</span>
        </div>

        <p className="room-description">{room.description}</p>

        <div className="room-amenities">
          {room.amenities.slice(0, 4).map((amenity, index) => (
            <div key={index} className="amenity" title={amenity.charAt(0).toUpperCase() + amenity.slice(1)}>
              {getAmenityIcon(amenity)}
            </div>
          ))}
          {room.amenities.length > 4 && <div className="amenity-more">+{room.amenities.length - 4} more</div>}
        </div>

        <div className="room-actions">
          <Link to={`/rooms/${room.id}`} className="btn btn-secondary">
            View Details
          </Link>
          <Link to={`/booking?room=${room.id}`} className="btn btn-primary">
            Book Now
          </Link>
        </div>
      </div>

      <motion.div
        className="hover-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to={`/rooms/${room.id}`} className="overlay-button">
          Explore Room
        </Link>
      </motion.div>
    </motion.div>
  )
}

export default RoomCard

