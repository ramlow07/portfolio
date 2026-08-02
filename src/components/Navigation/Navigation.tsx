import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { useMagnetic } from '../../hooks/useMagnetic';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
import './Navigation.css';

const SECTIONS = ['work', 'skills', 'about', 'contact'] as const;

const NavLink = ({
  section,
  index,
  active,
  label,
}: {
  section: string;
  index: number;
  active: boolean;
  label: string;
}) => {
  const ref = useMagnetic<HTMLAnchorElement>(0.4);
  return (
    <a
      ref={ref}
      href={`#${section}`}
      data-cursor=""
      className={`nav-link ${active ? 'active' : ''}`}
    >
      <span className="nav-link-index">0{index + 1}</span>
      <span className="nav-link-label">{label}</span>
    </a>
  );
};

const Navigation = () => {
  const { t } = useTranslation();
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState('');

  useEffect(() => {
    // Slide the nav in on load.
    gsap.fromTo(
      navRef.current,
      { yPercent: -120 },
      { yPercent: 0, duration: 1, ease: 'power4.out', delay: 0.2 }
    );

    // Scroll progress bar.
    const prog = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        gsap.set(progressRef.current, { scaleX: self.progress });
      },
    });

    // Active section tracking.
    const triggers = SECTIONS.map((id) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (self) => self.isActive && setActive(id),
      })
    );

    return () => {
      prog.kill();
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <nav ref={navRef} className="navigation">
      <div className="nav-inner">
        <a href="#home" data-cursor="" className="nav-logo">
          LR<span className="nav-logo-dot">.</span>
        </a>

        <div className="nav-links">
          {SECTIONS.map((section, i) => (
            <NavLink
              key={section}
              section={section}
              index={i}
              active={active === section}
              label={t(`nav.${section}`)}
            />
          ))}
        </div>

        <div className="nav-actions">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
      <div className="nav-progress">
        <div ref={progressRef} className="nav-progress-bar" />
      </div>
    </nav>
  );
};

export default Navigation;
