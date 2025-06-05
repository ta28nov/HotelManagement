"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { FaUtensils, FaSpa, FaCar, FaDumbbell, FaWifi } from "react-icons/fa"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import HeroBanner from "../../components/HeroBanner/HeroBanner"
import RoomCard from "../../components/RoomCard/RoomCard"
import ServiceCard from "../../components/ServiceCard/ServiceCard"
import TestimonialCard from "../../components/TestimonialCard/TestimonialCard"
import "./HomePage.css"

// Dữ liệu mẫu cho phòng
const featuredRooms = [
  {
    id: 1,
    name: "Standard Room",
    description: "A comfortable room with all the essential amenities for a pleasant stay.",
    price: 150,
    capacity: 2,
    type: "standard",
    status: "available",
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    amenities: ["wifi", "tv", "coffee", "bath"],
  },
  {
    id: 2,
    name: "Deluxe Room",
    description: "Spacious room with premium furnishings and additional amenities.",
    price: 250,
    capacity: 2,
    type: "deluxe",
    status: "available",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    amenities: ["wifi", "tv", "coffee", "bath", "minibar"],
  },
  {
    id: 3,
    name: "Executive Suite",
    description: "Luxurious suite with separate living area and exclusive services.",
    price: 350,
    capacity: 3,
    type: "executive",
    status: "available",
    image:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
    amenities: ["wifi", "tv", "coffee", "bath", "minibar", "workspace"],
  },
]

// Dữ liệu mẫu cho dịch vụ
const services = [
  {
    id: "restaurant",
    icon: <FaUtensils />,
    title: "Restaurant & Bar",
    description:
      "Enjoy exquisite dining at our restaurant with a variety of international cuisines and refreshing drinks at our bar.",
  },
  {
    id: "spa",
    icon: <FaSpa />,
    title: "Spa & Wellness",
    description:
      "Relax and rejuvenate with our premium spa treatments and wellness facilities designed for your comfort.",
  },
  {
    id: "transfer",
    icon: <FaCar />,
    title: "Airport Transfer",
    description: "Convenient airport pickup and drop-off services to ensure a smooth start and end to your stay.",
  },
  {
    id: "fitness",
    icon: <FaDumbbell />,
    title: "Fitness Center",
    description:
      "Stay fit during your stay with our state-of-the-art fitness center equipped with modern exercise machines.",
  },
  {
    id: "wifi",
    icon: <FaWifi />,
    title: "Free Wi-Fi",
    description: "Stay connected with complimentary high-speed internet access throughout the hotel premises.",
  },
]

// Dữ liệu mẫu cho đánh giá
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "Business Traveler",
    content:
      "The service at this hotel is exceptional. The staff went above and beyond to make my business trip comfortable and productive. The rooms are spacious and well-equipped for work.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "Family Vacation",
    content:
      "We had an amazing family vacation at this hotel. The rooms were clean and comfortable, and the kids loved the pool. The location is perfect for exploring the city.",
    rating: 4,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    role: "Couple's Retreat",
    content:
      "My partner and I had a wonderful romantic getaway. The spa services were top-notch, and the restaurant offered delicious dining options. We'll definitely be back!",
    rating: 5,
  },
]

// Định nghĩa variants cho các phần tử đơn lẻ và tiêu đề
const elementVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95, rotateZ: -2 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateZ: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.95,
    rotateZ: 2,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Định nghĩa variants cho các container lưới (để stagger children)
const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5 }
  }
};

// Định nghĩa variants cho các item bên trong lưới (card)
const gridItemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95, rotateZ: -2 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateZ: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.95,
    rotateZ: 2,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const HomePage = () => {
  // Cuộn lên đầu trang khi component được tải
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="home-page">
      <Header />

      <HeroBanner
        title="Experience Luxury Like Never Before"
        subtitle="Indulge in the perfect blend of comfort, elegance, and exceptional service at our premium hotel."
        image="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      />

      <section className="section welcome-section">
        <div className="container">
          <div className="section-title">
            <motion.h2
              variants={elementVariants}
              initial="hidden"
              whileInView="visible"
              exit="exit"
              viewport={{ amount: 0.3 }}
            >
              Welcome to Luxury Hotel
            </motion.h2>
          </div>

          <div className="welcome-content">
            <motion.div
              className="welcome-image"
              variants={elementVariants}
              initial="hidden"
              whileInView="visible"
              exit="exit"
              viewport={{ amount: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Hotel Lobby"
              />
            </motion.div>

            <motion.div
              className="welcome-text"
              variants={elementVariants}
              initial="hidden"
              whileInView="visible"
              exit="exit"
              viewport={{ amount: 0.3 }}
            >
              <h3>Experience the Ultimate Luxury</h3>
              <p>
                Welcome to our exquisite hotel, where luxury meets comfort and every detail is designed to provide you
                with an unforgettable experience. Nestled in a prime location, our hotel offers a perfect blend of
                elegant accommodations, world-class amenities, and exceptional service.
              </p>
              <p>
                Whether you're traveling for business or leisure, our dedicated staff is committed to ensuring your stay
                exceeds all expectations. From our gourmet restaurant to our state-of-the-art spa facilities, every
                aspect of our hotel is crafted to deliver the ultimate in relaxation and indulgence.
              </p>
              <p>
                Discover the art of hospitality redefined and create memories that will last a lifetime at our luxury
                hotel.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section rooms-section">
        <div className="container">
          <div className="section-title">
            <motion.h2
              variants={elementVariants}
              initial="hidden"
              whileInView="visible"
              exit="exit"
              viewport={{ amount: 0.3 }}
            >
              Our Rooms
            </motion.h2>
          </div>

          <motion.div
            className="rooms-grid"
            variants={gridContainerVariants}
            initial="hidden"
            whileInView="visible"
            exit="exit"
            viewport={{ amount: 0.3 }}
          >
            {featuredRooms.map((room, index) => (
              <motion.div key={room.id} variants={gridItemVariants}>
                <RoomCard room={room} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="view-all-rooms"
            variants={elementVariants}
            initial="hidden"
            whileInView="visible"
            exit="exit"
            viewport={{ amount: 0.3 }}
          >
            <a href="/rooms" className="btn btn-primary">
              View All Rooms
            </a>
          </motion.div>
        </div>
      </section>

      <section className="section services-section">
        <div className="container">
          <div className="section-title">
            <motion.h2
              variants={elementVariants}
              initial="hidden"
              whileInView="visible"
              exit="exit"
              viewport={{ amount: 0.3 }}
            >
              Our Services
            </motion.h2>
          </div>

          <motion.div
            className="services-grid"
            variants={gridContainerVariants}
            initial="hidden"
            whileInView="visible"
            exit="exit"
            viewport={{ amount: 0.3 }}
          >
            {services.map((service, index) => (
              <motion.div key={service.id} variants={gridItemVariants}>
                <ServiceCard service={service} index={index} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="container">
          <div className="section-title">
            <motion.h2
              variants={elementVariants}
              initial="hidden"
              whileInView="visible"
              exit="exit"
              viewport={{ amount: 0.3 }}
            >
              What Our Guests Say
            </motion.h2>
          </div>

          <motion.div
            className="testimonials-grid"
            variants={gridContainerVariants}
            initial="hidden"
            whileInView="visible"
            exit="exit"
            viewport={{ amount: 0.3 }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.id} variants={gridItemVariants}>
                <TestimonialCard testimonial={testimonial} index={index} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            variants={elementVariants}
            initial="hidden"
            whileInView="visible"
            exit="exit"
            viewport={{ amount: 0.3 }}
          >
            <h2>Ready to Experience Luxury?</h2>
            <p>Book your stay now and enjoy exclusive benefits and special offers.</p>
            <a href="/booking" className="btn btn-primary btn-lg">
              Book Now
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage

