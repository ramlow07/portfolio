import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Work.css';

const Work = () => {
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
        staggerChildren: 0.1,
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
    <section id="work" className="work">
      <div className="container">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <div className="section-header">
            <motion.div variants={itemVariants} className="section-title">
              <h2><span className="index">01.</span>{t('work.title')}</h2>
            </motion.div>
            <motion.p variants={itemVariants} className="section-subtitle">
              {t('work.subtitle')}
            </motion.p>
          </div>

          <div className="work-grid">
            <motion.div variants={itemVariants} className="work-card current-work">
              <div className="card-header">
                <span className="badge">{t('work.current')}</span>
                <span className="card-year">2024 - PRESENT</span>
              </div>
              
              <h3 className="work-role">{t('work.currentRole')}</h3>
              
              <p className="work-description">
                {t('work.currentDescription')}
              </p>
              
              <div className="work-tags">
                <span className="tag">REACT</span>
                <span className="tag">TYPESCRIPT</span>
                <span className="tag">NODE.JS</span>
                <span className="tag">FINTECH</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="work-card journey-card">
              <div className="card-header">
                <span className="badge" style={{ background: 'var(--color-electric)' }}>{t('work.journey')}</span>
                <span className="card-year">EXPERIENCE</span>
              </div>

              <div className="journey-highlights">
                <div className="highlight-item">
                  <div className="highlight-icon">⚡</div>
                  <div className="highlight-content">
                    <h4>{t('work.experience')}</h4>
                    <p>International experience</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🌐</div>
                  <div className="highlight-content">
                    <h4>{t('work.languages')}</h4>
                    <p>PT • EN • DE</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">💻</div>
                  <div className="highlight-content">
                    <h4>{t('work.programming')}</h4>
                    <p>Fullstack Development</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Work;
