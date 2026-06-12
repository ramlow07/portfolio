import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <span className="footer-mark">LR<span className="accent">.</span></span>
        <div className="footer-meta">
          <p className="mono">© {year} Luam Ramlow — Fullstack Engineer</p>
          <p className="mono">Brazil 🇧🇷 · Germany 🇩🇪 · Built with React + GSAP</p>
        </div>
        <a href="#home" data-cursor="↑" className="footer-top mono">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
};

export default Footer;
