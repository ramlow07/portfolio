import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap, ScrollTrigger, SplitText } from '../../lib/gsap';
import './About.css';

const About = () => {
  const { t } = useTranslation();
  const root = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Word-by-word highlight as the lead statement scrolls through.
      const split = new SplitText(leadRef.current, { type: 'words' });
      gsap.set(split.words, { opacity: 0.18 });
      gsap.to(split.words, {
        opacity: 1,
        ease: 'none',
        stagger: 0.5,
        scrollTrigger: {
          trigger: leadRef.current,
          start: 'top 75%',
          end: 'bottom 55%',
          scrub: true,
        },
      });

      // Supporting columns + footer reveal
      gsap.from('[data-reveal]', {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.about-support', start: 'top 80%' },
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="about" className="about">
      <div className="shell">
        <span className="eyebrow">03 — {t('about.title')}</span>

        <p ref={leadRef} className="about-lead">
          {t('about.intro')}
        </p>

        <div className="about-support">
          <div className="about-col" data-reveal>
            <span className="about-col-tag mono">Perspective</span>
            <p>{t('about.polyglot')}</p>
          </div>
          <div className="about-col" data-reveal>
            <span className="about-col-tag mono">Off the clock</span>
            <p>{t('about.passion')}</p>
          </div>
        </div>

        <div className="about-foot" data-reveal>
          <span className="about-location">{t('about.location')}</span>
          <span className="about-langs mono">PT · EN · DE</span>
        </div>
      </div>
    </section>
  );
};

export default About;
