import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
import './Navigation.css';

const Navigation = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = ['work', 'skills', 'about', 'contact'];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      className={`navigation ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "circOut" }}
    >
      <div className="nav-container">
        <div className="nav-logo">
          LUAM<span className="keyword">.DEV</span>
        </div>

        <div className="nav-links">
          {['work', 'skills', 'about', 'contact'].map((section) => (
             <button
              key={section}
              onClick={() => scrollToSection(section)}
              className={`nav-link ${activeSection === section ? 'active' : ''}`}
            >
              <span className="nav-index">0{['work', 'skills', 'about', 'contact'].indexOf(section) + 1}.</span> {t(`nav.${section}`)}
            </button>
          ))}
        </div>

        <div className="nav-actions">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
