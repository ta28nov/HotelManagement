"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import "./AnimatedButton.css"

// Component nút bấm với hiệu ứng động
const AnimatedButton = ({
  children,
  onClick,
  type = "button",
  variant = "primary", // 'primary', 'secondary', 'outline', 'text'
  size = "medium", // 'small', 'medium', 'large'
  fullWidth = false,
  disabled = false,
  className = "",
  icon = null,
  iconPosition = "left", // 'left', 'right'
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false)

  // Các biến thể của nút
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    disabled: { opacity: 0.6, scale: 1 },
  }

  // Hiệu ứng cho đường viền
  const borderVariants = {
    initial: {
      opacity: 0,
      pathLength: 0,
    },
    hover: {
      opacity: 1,
      pathLength: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`animated-button animated-button--${variant} animated-button--${size} ${fullWidth ? "animated-button--full-width" : ""} ${className}`}
      initial="initial"
      animate={disabled ? "disabled" : isHovered ? "hover" : "initial"}
      whileTap={disabled ? "disabled" : "tap"}
      onHoverStart={() => !disabled && setIsHovered(true)}
      onHoverEnd={() => !disabled && setIsHovered(false)}
      variants={buttonVariants}
      {...props}
    >
      {variant === "outline" && (
        <svg className="animated-button__border" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.rect
            width="100"
            height="100"
            rx="8"
            ry="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            variants={borderVariants}
            initial="initial"
            animate={isHovered ? "hover" : "initial"}
          />
        </svg>
      )}

      {icon && iconPosition === "left" && (
        <span className="animated-button__icon animated-button__icon--left">{icon}</span>
      )}

      <span className="animated-button__text">{children}</span>

      {icon && iconPosition === "right" && (
        <span className="animated-button__icon animated-button__icon--right">{icon}</span>
      )}

      <motion.div
        className="animated-button__background"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isHovered ? 1 : 0,
          opacity: isHovered ? 0.15 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}

export default AnimatedButton

