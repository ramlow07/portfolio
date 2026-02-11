import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Contact.css';

const Contact = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const contactInfo = {
    whatsapp: '+5548999430682',
    email: 'ramlowdev@proton.me',
    github: 'https://github.com/ramlow07',
    linkedin: 'https://www.linkedin.com/in/luam-ramlow-20b72723b',
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hi! I found your portfolio and would like to connect.');
    window.open(`https://wa.me/${contactInfo.whatsapp}?text=${message}`, '_blank');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-background">
        <div className="contact-orb-1"></div>
        <div className="contact-orb-2"></div>
      </div>

      <div className="container">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <div className="section-header">
            <motion.div variants={itemVariants} className="section-title">
              <h2><span className="index">03.</span>{t('contact.title')}</h2>
            </motion.div>
            <motion.p variants={itemVariants} className="section-subtitle">
              {t('contact.subtitle')}
            </motion.p>
          </div>

          <div className="contact-content">
            <motion.div variants={itemVariants} className="contact-grid">
              <button onClick={handleWhatsAppClick} className="contact-card">
                <div className="contact-icon">💬</div>
                <h3>{t('contact.whatsapp')}</h3>
                <p>Quick response guaranteed</p>
              </button>

              <a href={`mailto:${contactInfo.email}`} className="contact-card">
                <div className="contact-icon">📧</div>
                <h3>{t('contact.email')}</h3>
                <p>Professional inquiries</p>
              </a>

              <a href={contactInfo.github} target="_blank" rel="noopener noreferrer" className="contact-card">
                <div className="contact-icon">💻</div>
                <h3>{t('contact.github')}</h3>
                <p>Check out my code</p>
              </a>

              <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="contact-card">
                <div className="contact-icon">🔗</div>
                <h3>{t('contact.linkedin')}</h3>
                <p>Let's network</p>
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="contact-note">
              <p className="language-note">
                <span>{t('contact.languages')}</span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
