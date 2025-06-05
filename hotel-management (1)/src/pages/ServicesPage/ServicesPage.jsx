"use client"

import { useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  FaUtensils,
  FaSpa,
  FaCar,
  FaDumbbell,
  FaWifi,
  FaConciergeBell,
  FaSwimmingPool,
  FaGlassMartiniAlt,
} from "react-icons/fa"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import HeroBanner from "../../components/HeroBanner/HeroBanner"
import "./ServicesPage.css"

// Dữ liệu mẫu cho dịch vụ
const services = [
  {
    id: "restaurant",
    icon: <FaUtensils />,
    title: "Restaurant & Bar",
    description:
      "Enjoy exquisite dining at our restaurant with a variety of international cuisines and refreshing drinks at our bar.",
    longDescription:
      "Our award-winning restaurant offers a sophisticated dining experience with a menu that combines international flavors with local ingredients. Our expert chefs create culinary masterpieces that cater to all palates, from traditional favorites to innovative fusion dishes. The elegant ambiance, attentive service, and extensive wine list make every meal a memorable occasion. Our bar features premium spirits, craft cocktails, and a selection of fine wines from around the world, creating the perfect setting for relaxation or socializing.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "spa",
    icon: <FaSpa />,
    title: "Spa & Wellness",
    description:
      "Relax and rejuvenate with our premium spa treatments and wellness facilities designed for your comfort.",
    longDescription:
      "Our luxury spa is a sanctuary of tranquility where you can escape the stresses of everyday life. Indulge in a range of therapeutic treatments performed by our skilled therapists, from traditional massages to innovative skincare therapies using premium products. Our wellness facilities include a state-of-the-art fitness center, yoga studio, sauna, steam room, and relaxation lounges. Whether you seek physical rejuvenation or mental relaxation, our spa offers a holistic approach to well-being in an atmosphere of serenity and luxury.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "transfer",
    icon: <FaCar />,
    title: "Airport Transfer",
    description: "Convenient airport pickup and drop-off services to ensure a smooth start and end to your stay.",
    longDescription:
      "Begin and end your journey with our seamless airport transfer service. Our professional drivers will meet you at the airport and transport you to our hotel in comfort and style. We offer a fleet of luxury vehicles to accommodate individuals, couples, or groups of any size. All transfers are pre-arranged to align with your flight schedule, ensuring a stress-free transition to or from the airport. Our drivers are knowledgeable about the local area and can provide insights and recommendations during your journey, making your transfer not just convenient but informative as well.",
    image:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "fitness",
    icon: <FaDumbbell />,
    title: "Fitness Center",
    description:
      "Stay fit during your stay with our state-of-the-art fitness center equipped with modern exercise machines.",
    longDescription:
      "Maintain your fitness routine in our comprehensive fitness center, featuring the latest cardio and strength training equipment. Our facility is designed to cater to all fitness levels, from beginners to advanced athletes. Personal trainers are available upon request to provide guidance, create customized workout plans, or lead private sessions. The fitness center is complemented by a stretching area, free weights section, and a dedicated space for yoga and meditation. Open 24 hours, our fitness center ensures that you can exercise according to your schedule, making it easy to stay active during your stay.",
    image:
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "wifi",
    icon: <FaWifi />,
    title: "Free Wi-Fi",
    description: "Stay connected with complimentary high-speed internet access throughout the hotel premises.",
    longDescription:
      "In today's connected world, we understand the importance of reliable internet access. Our hotel offers complimentary high-speed Wi-Fi throughout all areas, including guest rooms, public spaces, and meeting facilities. Whether you need to stay connected for business, share your experiences on social media, or stream entertainment, our robust network ensures a seamless online experience. For guests with higher bandwidth requirements, we also offer premium internet packages with enhanced speed and security features. Our IT support team is available to assist with any connectivity issues, ensuring that you remain connected throughout your stay.",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "concierge",
    icon: <FaConciergeBell />,
    title: "Concierge Service",
    description:
      "Our dedicated concierge team is available to assist with all your needs and requests during your stay.",
    longDescription:
      "Our expert concierge team is the cornerstone of our commitment to exceptional service. Available 24/7, our concierges are local experts who can provide personalized recommendations for dining, entertainment, and attractions. They can arrange restaurant reservations, secure tickets to shows or events, organize tours, and coordinate special experiences tailored to your interests. From simple requests to complex itineraries, our concierge team goes above and beyond to enhance your stay and create memorable experiences. Their extensive knowledge and connections ensure that you receive VIP treatment wherever you go in the city.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "pool",
    icon: <FaSwimmingPool />,
    title: "Swimming Pool",
    description: "Relax and unwind at our luxurious swimming pool with comfortable loungers and poolside service.",
    longDescription:
      "Our stunning swimming pool is an oasis of relaxation and recreation. The expansive pool deck features comfortable loungers, private cabanas, and lush landscaping that creates a tranquil atmosphere. Enjoy refreshing drinks and light meals from our poolside service, delivered directly to your lounger. The temperature-controlled water ensures a pleasant swimming experience year-round. For families, we offer a separate children's pool with water features and enhanced safety measures. Pool attendants are always on hand to provide fresh towels, adjust umbrellas, or assist with any requests, allowing you to fully relax and enjoy the sun-soaked ambiance.",
    image:
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    id: "bar",
    icon: <FaGlassMartiniAlt />,
    title: "Rooftop Bar",
    description: "Enjoy breathtaking views and signature cocktails at our exclusive rooftop bar.",
    longDescription:
      "Perched atop our hotel, our rooftop bar offers a sophisticated atmosphere with panoramic views of the city skyline. It's the perfect setting to unwind after a day of exploration or business. Our mixologists craft signature cocktails using premium spirits and fresh ingredients, creating both classic favorites and innovative concoctions. The bar also features a curated selection of fine wines, craft beers, and non-alcoholic options. Complementing the drinks is a menu of gourmet small plates designed for sharing. With its stylish décor, ambient music, and stunning vistas, our rooftop bar has become a destination for both hotel guests and locals seeking a memorable night out.",
    image:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
  },
]

// --- Bắt đầu Variants giống HomePage (chỉ cần elementVariants) --- 
const elementVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95, rotateZ: -2 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateZ: 0,
    transition: { duration: 1.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.95,
    rotateZ: 2,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};
// --- Kết thúc Variants giống HomePage ---

const ServicesPage = () => {
  // Cuộn lên đầu trang khi component được tải
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Xử lý cuộn đến dịch vụ khi có hash trong URL
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1)
      const element = document.getElementById(id)
      if (element) {
        setTimeout(() => {
          const yOffset = -100 // Offset để tính đến header
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: "smooth" })
        }, 500)
      }
    }
  }, [])

  return (
    <div className="services-page">
      <Header />

      <HeroBanner
        title="Our Services"
        subtitle="Discover the exceptional services and amenities we offer to enhance your stay."
        image="https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
        showButtons={false}
      />

      <section className="section services-intro-section">
        <div className="container">
          <motion.div
            className="services-intro"
            variants={elementVariants}
            initial="hidden"
            whileInView="visible"
            exit="exit"
            viewport={{ amount: 0.3 }}
          >
            <h2>Experience Luxury at Every Moment</h2>
            <p>
              At Luxury Hotel, we pride ourselves on providing exceptional services that cater to your every need. From
              gourmet dining to rejuvenating spa treatments, our dedicated team is committed to ensuring that every
              aspect of your stay exceeds expectations.
            </p>
            <p>
              Each of our services is designed with your comfort and satisfaction in mind, delivered with the
              personalized attention that defines true luxury. Explore our range of offerings below and discover how we
              can enhance your stay with us.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section services-list-section">
        <div className="container">
          {services.map((service, index) => (
            <ServiceDetail key={service.id} service={service} index={index} />
          ))}
        </div>
      </section>

      <section className="section services-cta-section">
        <div className="container">
          <motion.div
            className="services-cta"
            variants={elementVariants}
            initial="hidden"
            whileInView="visible"
            exit="exit"
            viewport={{ amount: 0.3 }}
          >
            <h2>Ready to Experience Our Services?</h2>
            <p>Book your stay now and indulge in the luxury and comfort that awaits you.</p>
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

// Component cho chi tiết dịch vụ
const ServiceDetail = ({ service, index }) => {
  const isEven = index % 2 === 0

  return (
    <motion.div
      id={service.id}
      className={`service-detail ${isEven ? "even" : "odd"}`}
      variants={elementVariants}
      initial="hidden"
      whileInView="visible"
      exit="exit"
      viewport={{ amount: 0.3 }}
    >
      <div className="service-image">
        <img src={service.image || "/placeholder.svg"} alt={service.title} />
      </div>

      <div className="service-content">
        <div className="service-icon">{service.icon}</div>
        <h3>{service.title}</h3>
        <p>{service.longDescription}</p>
        <a href="/contact" className="btn btn-secondary">
          Inquire Now
        </a>
      </div>
    </motion.div>
  )
}

export default ServicesPage

