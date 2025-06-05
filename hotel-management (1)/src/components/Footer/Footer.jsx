import { Link } from "react-router-dom"
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa"
import "./Footer.css"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section about">
            <h3>Luxury Hotel</h3>
            <p>
              Experience luxury and comfort at our premium hotel. We offer the best accommodations and services for your
              stay.
            </p>
            <div className="social-links">
              <a href="https://www.facebook.com/seoonlyone/" target="_blank" rel="noopener noreferrer">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          <div className="footer-section links">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/rooms">Rooms</Link>
              </li>
              <li>
                <Link to="/services">Services</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section services">
            <h3>Services</h3>
            <ul>
              <li>
                <Link to="/services">Spa & Wellness</Link>
              </li>
              <li>
                <Link to="/services">Restaurant & Bar</Link>
              </li>
              <li>
                <Link to="/services">Room Service</Link>
              </li>
              <li>
                <Link to="/services">Concierge</Link>
              </li>
              <li>
                <Link to="/services">Airport Transfer</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section contact">
            <h3>Contact Us</h3>
            <ul className="contact-info">
              <li>
                <FaMapMarkerAlt />
                <span>Lac Hong University, Biên Hoà , Đồng Nai</span>
              </li>
              <li>
                <FaPhone />
                <span>0345543986</span>
              </li>
              <li>
                <FaEnvelope />
                <span>tiphong05@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; {currentYear} Luxury Hotel. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

