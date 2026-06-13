import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import './Skills.css';

const GROUPS: { key: string; index: string; items: string[] }[] = [
  {
    key: 'frontend',
    index: '/01',
    items: ['React', 'TypeScript', 'JavaScript', 'Next.js', 'HTML / CSS'],
  },
  {
    key: 'backend',
    index: '/02',
    items: ['Node.js', 'Express', 'PostgreSQL', 'NestJS', 'MongoDB'],
  },
  {
    key: 'tools',
    index: '/03',
    items: ['Git', 'Docker', 'AWS', 'Google Cloud', 'Figma'],
  },
];

const Skills = () => {
  const { t } = useTranslation();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Heading rises
      gsap.from('.skills-heading [data-reveal]', {
        yPercent: 110,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.skills-heading', start: 'top 80%' },
      });

      // Each column reveals its rows in sequence
      gsap.utils.toArray<HTMLElement>('.skill-col').forEach((col) => {
        const rows = col.querySelectorAll('.skill-row');
        gsap.from(rows, {
          opacity: 0,
          y: 26,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: { trigger: col, start: 'top 82%' },
        });
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="skills" className="skills">
      <div className="shell">
        <div className="skills-head">
          <span className="eyebrow">02 — {t('skills.title')}</span>
          <h2 className="skills-heading">
            <span className="reveal-line"><span data-reveal>Tools of</span></span>
            <span className="reveal-line"><span data-reveal>the <span className="accent">trade</span></span></span>
          </h2>
          <p className="skills-sub">{t('skills.subtitle')}</p>
        </div>

        <div className="skills-grid">
          {GROUPS.map((group) => (
            <div className="skill-col" key={group.key}>
              <div className="skill-col-head">
                <h3>{t(`skills.${group.key}`)}</h3>
                <span className="skill-col-index mono">{group.index}</span>
              </div>
              <ul className="skill-list">
                {group.items.map((name) => (
                  <li className="skill-row" key={name} data-cursor="">
                    <span className="skill-name">{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
