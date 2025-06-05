"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import "./HeroBanner.css"

const HeroBanner = ({ title, subtitle, image, showButtons = true }) => {
  return (
    <div className="hero-banner" style={{ backgroundImage: `url(${image})` }}>
      <div className="overlay"></div>
      <div className="container hero-content">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hero-title"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="hero-subtitle"
        >
          {subtitle}
        </motion.p>

        {showButtons && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="hero-buttons"
          >
            <Link to="/booking" className="btn btn-primary btn-lg">
              Book Now
            </Link>
            <Link to="/services" className="btn btn-secondary btn-lg">
              Explore Services
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default HeroBanner

