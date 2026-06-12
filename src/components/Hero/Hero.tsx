import { Suspense, lazy, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap, ScrollTrigger, SplitText } from '../../lib/gsap';
import { useEnable3D } from '../../hooks/useEnable3D';
import './Hero.css';

const GlassMonolith = lazy(() => import('../Hero3D/GlassMonolith'));

const Hero = () => {
  const { t } = useTranslation();
  const root = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const enable3D = useEnable3D();

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Calm line-by-line mask reveal for the headline.
      const split = new SplitText(titleRef.current, {
        type: 'lines',
        linesClass: 'hero-line',
      });
      gsap.set(split.lines, { yPercent: 110 });

      const tl = gsap.timeline({ delay: 0.3 });
      tl.from('[data-hero-fade]', {
        opacity: 0,
        y: 16,
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.1,
      })
        .to(
          split.lines,
          { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12 },
          '-=0.5'
        )
        .from(
          '[data-hero-foot]',
          { opacity: 0, y: 16, duration: 0.8, ease: 'power2.out', stagger: 0.1 },
          '-=0.7'
        );

      // Subtle drift on the text as you scroll away — restraint, not spectacle.
      gsap.to('.hero-text', {
        yPercent: -8,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="home" className="hero">
      <div className="shell hero-layout">
        <div className="hero-text">
          <span data-hero-fade className="eyebrow">{t('hero.greeting')}</span>

          <h1 ref={titleRef} className="hero-title">
            {t('hero.title')}
          </h1>

          <p data-hero-fade className="hero-sub">{t('hero.subtitle')}</p>
        </div>

        <div className="hero-visual" aria-hidden>
          {enable3D ? (
            <Suspense fallback={<div className="hero-fallback" />}>
              <GlassMonolith />
            </Suspense>
          ) : (
            <div className="hero-fallback" />
          )}
        </div>
      </div>

      <div className="shell hero-foot">
        <span data-hero-foot className="hero-status mono">
          <span className="hero-dot" /> Available for work
        </span>
        <a data-hero-foot href="#work" className="hero-scroll mono" data-cursor="">
          Scroll
        </a>
      </div>
    </section>
  );
};

export default Hero;
