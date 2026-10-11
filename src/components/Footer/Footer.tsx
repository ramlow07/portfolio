import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <span className="footer-mark">LR<span className="accent">.</span></span>
        <div className="footer-meta">
          <p className="mono">© {year} Luam Ramlow</p>
        </div>
        <a href="#introduction" data-cursor="↑" className="footer-top mono">
          {t('footer.backToTop')} ↑
        </a>
      </div>
    </footer>
  );
};

export default Footer;
