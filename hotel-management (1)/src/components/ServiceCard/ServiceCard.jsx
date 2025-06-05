"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import "./ServiceCard.css"

const ServiceCard = ({ service, index }) => {
  return (
    <motion.div
      className="service-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="service-icon">{service.icon}</div>

      <h3 className="service-title">{service.title}</h3>

      <p className="service-description">{service.description}</p>

      <Link to={`/services#${service.id}`} className="service-link">
        Learn more
      </Link>
    </motion.div>
  )
}

export default ServiceCard

