import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './About.css';

const About = () => {
  const { t } = useTranslation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="about" className="about section">
      <div className="container">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="section-title">
            <h2>{t('about.title')}</h2>
            <p className="section-subtitle">{t('about.subtitle')}</p>
          </motion.div>

          <div className="about-content">
            <motion.div variants={itemVariants} className="about-card glass">
              <div className="card-icon">🚀</div>
              <p className="about-text">{t('about.intro')}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="about-card glass">
              <div className="card-icon">🌍</div>
              <p className="about-text">{t('about.polyglot')}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="about-card glass">
              <div className="card-icon">💡</div>
              <p className="about-text">{t('about.passion')}</p>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="about-footer">
            <div className="location-badge glass">
              <span className="location-text">{t('about.location')}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
