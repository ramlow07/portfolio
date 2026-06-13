import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import './Work.css';

type Role = {
  company: string;
  role: string;
  period: string;
  context: string;
  description: string;
};

// Render order, newest first. Tech chips live here (not translated).
const ROLE_ORDER = ['veepag', 'ddc', 'borderless'] as const;
const ROLE_CHIPS: Record<string, string[]> = {
  veepag: ['React', 'TypeScript', 'Node.js', 'KYC', 'Payments'],
  ddc: ['BFF', 'PostgreSQL', 'BI', 'React'],
  borderless: ['React', 'TypeScript', 'Leadership'],
};

const Work = () => {
  const { t } = useTranslation();
  const root = useRef<HTMLElement>(null);

  const roles = t('work.history.roles', { returnObjects: true }) as Record<string, Role>;

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Gentle reveal of each timeline entry.
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((node) => {
        gsap.from(node, {
          opacity: 0,
          y: 28,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: node, start: 'top 85%' },
        });
      });

      // Draw the timeline line as you scroll through the section.
      gsap.fromTo(
        '.timeline-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.timeline',
            start: 'top 70%',
            end: 'bottom 70%',
            scrub: true,
          },
        }
      );

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="work" className="work">
      <div className="shell">
        <div className="work-head" data-reveal>
          <span className="eyebrow">01 — {t('work.title')}</span>
          <h2 className="work-heading">{t('work.subtitle')}</h2>
        </div>

        <div className="timeline">
          <span className="timeline-line" aria-hidden />

          {ROLE_ORDER.map((id, i) => {
            const role = roles?.[id];
            if (!role) return null;
            return (
              <article className="entry" data-reveal key={id}>
                <span className="entry-year mono">{role.period}</span>
                <div className="entry-body">
                  <span className={`entry-tag mono${i === 0 ? ' accent' : ''}`}>
                    {role.context}
                  </span>
                  <h3 className="entry-title">
                    {role.role} · {role.company}
                  </h3>
                  <p className="entry-text">{role.description}</p>
                  <div className="entry-chips">
                    {ROLE_CHIPS[id].map((c) => (
                      <span className="entry-chip" key={c}>{c}</span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="work-stats" data-reveal>
          <div className="stat">
            <span className="stat-num">5+</span>
            <span className="stat-label">{t('work.stats.years')}</span>
          </div>
          <div className="stat">
            <span className="stat-num">R$5M+</span>
            <span className="stat-label">{t('work.stats.volume')}</span>
          </div>
          <div className="stat">
            <span className="stat-num">BR · DE · UK</span>
            <span className="stat-label">{t('work.stats.clients')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
