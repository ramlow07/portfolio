import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import './Work.css';

const Work = () => {
  const { t } = useTranslation();
  const root = useRef<HTMLElement>(null);

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

          <article className="entry" data-reveal>
            <span className="entry-year mono">2024 — Present</span>
            <div className="entry-body">
              <span className="entry-tag mono accent">{t('work.current')}</span>
              <h3 className="entry-title">{t('work.currentRole')}</h3>
              <p className="entry-text">{t('work.currentDescription')}</p>
              <div className="entry-chips">
                {['React', 'TypeScript', 'Node.js', 'Fintech'].map((c) => (
                  <span className="entry-chip" key={c}>{c}</span>
                ))}
              </div>
            </div>
          </article>

          <article className="entry" data-reveal>
            <span className="entry-year mono">2021 — 2024</span>
            <div className="entry-body">
              <span className="entry-tag mono">{t('work.journey')}</span>
              <h3 className="entry-title">{t('work.experience')}</h3>
              <p className="entry-text">{t('work.journeyDescription')}</p>
            </div>
          </article>
        </div>

        <div className="work-stats" data-reveal>
          <div className="stat">
            <span className="stat-num">3+</span>
            <span className="stat-label">{t('work.experience')}</span>
          </div>
          <div className="stat">
            <span className="stat-num">3</span>
            <span className="stat-label">{t('work.languages')} · PT / EN / DE</span>
          </div>
          <div className="stat">
            <span className="stat-num">BR · DE · UK</span>
            <span className="stat-label">Clients shipped for</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
