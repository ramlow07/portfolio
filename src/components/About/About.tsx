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
          <div className="section-header">
            <motion.div variants={itemVariants} className="section-title">
              <h2><span className="index">01.</span>{t('about.title')}</h2>
            </motion.div>
            <motion.p variants={itemVariants} className="section-subtitle">
              {t('about.subtitle')}
            </motion.p>
          </div>

          <div className="about-content">
            <motion.div variants={itemVariants} className="about-card">
              <div className="card-header">
                <div className="card-icon">🚀</div>
                <h3 className="card-title">Mission</h3>
              </div>
              <p className="about-text">{t('about.intro')}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="about-card">
              <div className="card-header">
                <div className="card-icon">🌍</div>
                <h3 className="card-title">Perspective</h3>
              </div>
              <p className="about-text">{t('about.polyglot')}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="about-card">
              <div className="card-header">
                <div className="card-icon">💡</div>
                <h3 className="card-title">Passion</h3>
              </div>
              <p className="about-text">{t('about.passion')}</p>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="about-footer">
            <div className="location-badge">
              <span className="location-text">{t('about.location')}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
