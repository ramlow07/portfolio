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
    <section id="work" className="work section">
      <div className="container">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="section-title">
            <h2>{t('work.title')}</h2>
            <p className="section-subtitle">{t('work.subtitle')}</p>
          </motion.div>

          <div className="work-content">
            <motion.div variants={itemVariants} className="work-card glass current-work">
              <div className="card-header">
                <span className="badge">{t('work.current')}</span>
                <div className="company-logo">
                  <span className="logo-icon">🚀</span>
                </div>
              </div>
              <h3 className="work-role">{t('work.currentRole')}</h3>
              <p className="work-description">{t('work.currentDescription')}</p>
              <div className="work-tags">
                <span className="tag">React</span>
                <span className="tag">TypeScript</span>
                <span className="tag">Node.js</span>
                <span className="tag">Fintech</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="work-card glass journey-card">
              <div className="journey-header">
                <h3>{t('work.journey')}</h3>
              </div>
              <p className="work-description">{t('work.journeyDescription')}</p>
              
              <div className="journey-highlights">
                <div className="highlight-item">
                  <div className="highlight-icon">🇩🇪</div>
                  <div className="highlight-content">
                    <h4>{t('work.experience')}</h4>
                    <p>International experience</p>
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🌍</div>
                  <div className="highlight-content">
                    <h4>{t('work.languages')}</h4>
                    <p>PT • EN • DE</p>
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
