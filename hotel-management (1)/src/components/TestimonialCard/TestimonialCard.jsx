"use client"

import { motion } from "framer-motion"
import { FaStar } from "react-icons/fa"
import "./TestimonialCard.css"

const TestimonialCard = ({ testimonial, index }) => {
  return (
    <motion.div
      className="testimonial-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="testimonial-rating">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < testimonial.rating ? "star-filled" : "star-empty"} />
        ))}
      </div>

      <p className="testimonial-content">"{testimonial.content}"</p>

      <div className="testimonial-author">
        <img src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} className="author-avatar" />
        <div className="author-info">
          <h4 className="author-name">{testimonial.name}</h4>
          <p className="author-role">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default TestimonialCard

