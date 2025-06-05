"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import Header from "../../components/Header/Header"
import Footer from "../../components/Footer/Footer"
import HeroBanner from "../../components/HeroBanner/HeroBanner"
import "./AboutPage.css"

const AboutPage = () => {
  // Cuộn lên đầu trang khi component được tải
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="about-page">
      <Header />

      <HeroBanner
        title="About Us"
        subtitle="Learn about our story, our mission, and the team behind our luxury hotel."
        image="https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80"
        showButtons={false}
      />

      <section className="section our-story-section">
        <div className="container">
          <div className="section-title">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Our Story
            </motion.h2>
          </div>

          <div className="story-content">
            <motion.div
              className="story-image"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="https://images.unsplash.com/photo-1529290130-4ca3753253ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1476&q=80"
                alt="Hotel History"
              />
            </motion.div>

            <motion.div
              className="story-text"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3>A Legacy of Luxury Since 1995</h3>
              <p>
                Luxury Hotel was founded in 1995 with a vision to create an exceptional hospitality experience that
                combines elegant accommodations, world-class service, and a commitment to guest satisfaction. What began
                as a boutique hotel with just 20 rooms has evolved into a renowned luxury destination that welcomes
                guests from around the world.
              </p>
              <p>
                Over the years, we have expanded our facilities while maintaining our dedication to personalized service
                and attention to detail. Our hotel has been recognized with numerous awards for excellence in
                hospitality, including the prestigious Five Star Award for ten consecutive years.
              </p>
              <p>
                Today, Luxury Hotel stands as a symbol of sophistication and comfort, continuing the tradition of
                providing memorable experiences for every guest who walks through our doors. Our history is built on the
                relationships we've formed with our guests, many of whom return year after year to experience the warmth
                and luxury that defines our establishment.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section mission-section">
        <div className="container">
          <div className="section-title">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Our Mission & Values
            </motion.h2>
          </div>

          <motion.div
            className="mission-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mission-statement">
              <h3>Our Mission</h3>
              <p>
                To create extraordinary experiences that delight our guests and exceed their expectations through
                impeccable service, luxurious accommodations, and attention to every detail.
              </p>
            </div>

            <div className="values-grid">
              <div className="value-card">
                <h4>Excellence</h4>
                <p>
                  We strive for excellence in everything we do, from the quality of our accommodations to the service we
                  provide.
                </p>
              </div>

              <div className="value-card">
                <h4>Personalization</h4>
                <p>
                  We recognize that each guest is unique, and we tailor our services to meet individual preferences and
                  needs.
                </p>
              </div>

              <div className="value-card">
                <h4>Integrity</h4>
                <p>
                  We conduct our business with honesty, transparency, and ethical standards that build trust with our
                  guests and partners.
                </p>
              </div>

              <div className="value-card">
                <h4>Innovation</h4>
                <p>
                  We continuously seek new ways to enhance the guest experience through innovative services and
                  amenities.
                </p>
              </div>

              <div className="value-card">
                <h4>Sustainability</h4>
                <p>
                  We are committed to environmentally responsible practices that preserve resources for future
                  generations.
                </p>
              </div>

              <div className="value-card">
                <h4>Community</h4>
                <p>
                  We value our role in the local community and strive to make a positive impact through engagement and
                  support.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section team-section">
        <div className="container">
          <div className="section-title">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Our Leadership Team
            </motion.h2>
          </div>

          <div className="team-grid">
            <TeamMember
              name="Michael Johnson"
              position="Chief Executive Officer"
              image="https://randomuser.me/api/portraits/men/32.jpg"
              bio="Michael brings over 25 years of experience in luxury hospitality management. His vision and leadership have been instrumental in establishing our hotel as a premier destination for discerning travelers."
              index={0}
            />

            <TeamMember
              name="Sarah Williams"
              position="General Manager"
              image="https://randomuser.me/api/portraits/women/44.jpg"
              bio="With a passion for exceptional service, Sarah oversees the day-to-day operations of our hotel. Her attention to detail and commitment to guest satisfaction ensure that every stay is memorable."
              index={1}
            />

            <TeamMember
              name="David Chen"
              position="Executive Chef"
              image="https://randomuser.me/api/portraits/men/64.jpg"
              bio="David's culinary expertise has earned our restaurant numerous accolades. His innovative approach to cuisine combines traditional techniques with contemporary flavors to create unforgettable dining experiences."
              index={2}
            />

            <TeamMember
              name="Emily Rodriguez"
              position="Spa Director"
              image="https://randomuser.me/api/portraits/women/68.jpg"
              bio="Emily leads our award-winning spa with a holistic approach to wellness. Her expertise in luxury spa services and commitment to guest rejuvenation make our spa a sanctuary of relaxation."
              index={3}
            />
          </div>
        </div>
      </section>

      <section className="section achievements-section">
        <div className="container">
          <div className="section-title">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Awards & Recognition
            </motion.h2>
          </div>

          <motion.div
            className="achievements-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="awards-list">
              <div className="award-item">
                <div className="award-year">2023</div>
                <div className="award-details">
                  <h4>Five Star Excellence Award</h4>
                  <p>Recognized for exceptional service and luxury accommodations for the tenth consecutive year.</p>
                </div>
              </div>

              <div className="award-item">
                <div className="award-year">2022</div>
                <div className="award-details">
                  <h4>Best Luxury Hotel</h4>
                  <p>Named the Best Luxury Hotel in the region by Travel & Leisure Magazine.</p>
                </div>
              </div>

              <div className="award-item">
                <div className="award-year">2021</div>
                <div className="award-details">
                  <h4>Culinary Excellence Award</h4>
                  <p>Our restaurant received recognition for innovative cuisine and exceptional dining experience.</p>
                </div>
              </div>

              <div className="award-item">
                <div className="award-year">2020</div>
                <div className="award-details">
                  <h4>Sustainable Luxury Certification</h4>
                  <p>Awarded for our commitment to environmentally responsible practices in luxury hospitality.</p>
                </div>
              </div>

              <div className="award-item">
                <div className="award-year">2019</div>
                <div className="award-details">
                  <h4>Top 10 Spa Destinations</h4>
                  <p>Our spa was recognized among the top 10 luxury spa destinations worldwide.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Component cho thành viên đội ngũ
const TeamMember = ({ name, position, image, bio, index }) => {
  return (
    <motion.div
      className="team-member"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="member-image">
        <img src={image || "/placeholder.svg"} alt={name} />
      </div>
      <div className="member-info">
        <h3>{name}</h3>
        <h4>{position}</h4>
        <p>{bio}</p>
      </div>
    </motion.div>
  )
}

export default AboutPage

