import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import './Hero.css';

const Hero = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="hero" id="home">
      <div className="hero-background">
        <div className="hero-grid"></div>
      </div>
      
      <div className="container">
        <motion.div 
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="hero-text-content">
            <motion.span variants={itemVariants} className="hero-eyebrow">
              {t('hero.greeting') || 'Hello World'}
            </motion.span>
            
            <motion.h1 variants={itemVariants} className="hero-title">
              DIGITAL <br />
              <span className="highlight" data-text="ALCHEMIST">ALCHEMIST</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="hero-description">
              {t('hero.subtitle') || 'Crafting immersive digital experiences with precision and creativity.'}
            </motion.p>

            <motion.div variants={itemVariants} className="hero-cta-group">
              <a href="#work" className="btn btn-primary">
                {t('nav.work') || 'View Work'}
              </a>
              <a href="#contact" className="btn btn-secondary">
                {t('nav.contact') || 'Contact Me'}
              </a>
            </motion.div>
          </div>

          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <div className="hero-visual-inner">
               <img src="/profilepic.jpeg" alt="Luam Ramlow" />
               <div className="hero-visual-decoration"></div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <span>SCROLL</span>
        <div className="scroll-line"></div>
      </motion.div>
    </section>
  );
};

export default Hero;
