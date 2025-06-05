"use client"

import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import "./NotFoundPage.css"

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <Header />

      <div className="not-found-container">
        <div className="container">
          <motion.div
            className="not-found-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>The page you are looking for does not exist or has been moved.</p>
            <Link to="/" className="btn btn-primary">
              Return to Homepage
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default NotFoundPage

