"use client"

import { useRef, useEffect } from "react"
import { useInView } from "react-intersection-observer"
import "./ParallaxSection.css"

// Component tạo hiệu ứng parallax cho các section
const ParallaxSection = ({
  children,
  backgroundImage,
  speed = 0.5,
  className = "",
  overlayColor = "rgba(0, 0, 0, 0.3)",
  height = "100vh",
}) => {
  const parallaxRef = useRef(null)
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  // Xử lý hiệu ứng parallax khi cuộn
  useEffect(() => {
    if (!parallaxRef.current) return

    const handleScroll = () => {
      if (!inView) return

      const scrollTop = window.pageYOffset
      const sectionTop = parallaxRef.current.offsetTop
      const sectionHeight = parallaxRef.current.offsetHeight

      // Chỉ áp dụng hiệu ứng khi section trong tầm nhìn
      if (scrollTop + window.innerHeight > sectionTop && scrollTop < sectionTop + sectionHeight) {
        const yPos = (scrollTop - sectionTop) * speed
        const transform = `translate3d(0, ${yPos}px, 0)`

        // Áp dụng transform cho background
        if (parallaxRef.current.querySelector(".parallax-bg")) {
          parallaxRef.current.querySelector(".parallax-bg").style.transform = transform
        }
      }
    }

    window.addEventListener("scroll", handleScroll)

    // Gọi một lần để thiết lập vị trí ban đầu
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [inView, speed])

  return (
    <section
      ref={(el) => {
        parallaxRef.current = el
        ref(el)
      }}
      className={`parallax-section ${className}`}
      style={{ height }}
    >
      <div
        className="parallax-bg"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />
      <div className="parallax-overlay" style={{ backgroundColor: overlayColor }} />
      <div className="parallax-content">{children}</div>
    </section>
  )
}

export default ParallaxSection

