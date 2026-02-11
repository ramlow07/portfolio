import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p className="footer-text">
            © {currentYear} Luam Ramlow. Built with React, TypeScript & ❤️
          </p>
          <p className="footer-subtext">
            Fullstack Engineer • <span>Brazil 🇧🇷</span> • <span>Germany 🇩🇪</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
