"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from "react-icons/fa"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import HeroBanner from "../../components/HeroBanner/HeroBanner"
import "./ContactPage.css"

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Cuộn lên đầu trang khi component được tải
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Xác thực form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Xử lý gửi form
  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      // Mô phỏng API call
      setTimeout(() => {
        setIsSubmitting(false)
        setSubmitSuccess(true)
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })

        // Đặt lại thông báo thành công sau 5 giây
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 5000)
      }, 1500)
    }
  }

  return (
    <div className="contact-page">
      <Header />

      <HeroBanner
        title="Contact Us"
        subtitle="Get in touch with our team for inquiries, reservations, or any assistance you may need."
        image="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        showButtons={false}
      />

      <section className="section contact-info-section">
        <div className="container">
          <div className="contact-info-grid">
            <motion.div
              className="contact-info-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <div className="info-icon">
                <FaMapMarkerAlt />
              </div>
              <h3>Address</h3>
              <p>Lac Hong University</p>
              <p>Biên Hoà , Đồng Nai</p>
              <p>Viet Nam</p>
            </motion.div>

            <motion.div
              className="contact-info-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="info-icon">
                <FaPhone />
              </div>
              <h3>Phone</h3>
              <p>Reservations: 0345543986</p>
              <p>Front Desk: 0345543986</p>
              <p>Customer Service: 0345543986</p>
            </motion.div>

            <motion.div
              className="contact-info-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="info-icon">
                <FaEnvelope />
              </div>
              <h3>Email</h3>
              <p>tiphong05@gmail.com</p>
              <p>reservations@luxuryhotel.com</p>
              <p>support@luxuryhotel.com</p>
            </motion.div>

            <motion.div
              className="contact-info-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="info-icon">
                <FaClock />
              </div>
              <h3>Hours</h3>
              <p>Check-in: 3:00 PM</p>
              <p>Check-out: 12:00 AM</p>
              <p>Front Desk: 24/7</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section contact-form-section">
        <div className="container">
          <div className="contact-form-container">
            <motion.div
              className="contact-form-content"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2>Send Us a Message</h2>
              <p>
                Have a question or need assistance? Fill out the form below, and our team will get back to you as soon
                as possible.
              </p>

              {submitSuccess && (
                <div className="success-message">
                  Your message has been sent successfully. We'll get back to you soon!
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Your Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? "error" : ""}
                    />
                    {errors.name && <div className="error-message">{errors.name}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Your Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number (Optional)</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={errors.subject ? "error" : ""}
                    />
                    {errors.subject && <div className="error-message">{errors.subject}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={errors.message ? "error" : ""}
                  ></textarea>
                  {errors.message && <div className="error-message">{errors.message}</div>}
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </motion.div>

            <motion.div
              className="contact-map"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3917.1237709281913!2d106.80239365465339!3d10.95402209853728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d95970202f3f%3A0x679e7fa6d33f74e5!2zVHLGsOG7nW5nIMSR4bqhaSBo4buNYyBM4bqhYyBI4buTbmc!5e0!3m2!1svi!2s!4v1746089072043!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hotel Location"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="container">
          <div className="section-title">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Frequently Asked Questions
            </motion.h2>
          </div>

          <motion.div
            className="faq-container"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="faq-item">
              <h3>What are the check-in and check-out times?</h3>
              <p>
                Check-in time is 3:00 PM, and check-out time is 12:00 PM. Early check-in and late check-out may be
                available upon request, subject to availability and additional charges.
              </p>
            </div>

            <div className="faq-item">
              <h3>Is breakfast included in the room rate?</h3>
              <p>
                Breakfast is included in select room packages. Please check your reservation details or contact our
                reservations team to confirm if breakfast is included in your stay.
              </p>
            </div>

            <div className="faq-item">
              <h3>Do you offer airport transportation?</h3>
              <p>
                Yes, we offer airport transportation services for an additional fee. Please contact our concierge at
                least 24 hours in advance to arrange transportation.
              </p>
            </div>

            <div className="faq-item">
              <h3>Is there a cancellation fee?</h3>
              <p>
                Our standard cancellation policy requires notice 48 hours prior to arrival to avoid a cancellation fee
                equivalent to one night's stay. Special rates and packages may have different cancellation policies.
              </p>
            </div>

            <div className="faq-item">
              <h3>Are pets allowed at the hotel?</h3>
              <p>
                We welcome pets under 25 pounds for an additional fee of $50 per night. Please inform us in advance if
                you plan to bring a pet, as we have designated pet-friendly rooms.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default ContactPage

