import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap, ScrollTrigger, SplitText } from '../../lib/gsap';
import { useMagnetic } from '../../hooks/useMagnetic';
import './Contact.css';

const CONTACT = {
  email: 'ramlowdev@proton.me',
  github: 'https://github.com/ramlow07',
  linkedin: 'https://www.linkedin.com/in/luam-ramlow-20b72723b',
};

const ContactRow = ({
  label,
  meta,
  href,
}: {
  label: string;
  meta: string;
  href?: string;
}) => {
  const ref = useMagnetic<HTMLAnchorElement>(0.15);
  return (
    <a
      ref={ref}
      className="contact-row"
      data-cursor="↗"
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
    >
      <span className="contact-row-label">{label}</span>
      <span className="contact-row-meta mono">{meta}</span>
      <span className="contact-row-arrow" aria-hidden>↗</span>
    </a>
  );
};

const Contact = () => {
  const { t } = useTranslation();
  const root = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useMagnetic<HTMLAnchorElement>(0.4);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const split = new SplitText(titleRef.current, {
        type: 'lines',
        linesClass: 'contact-line',
      });
      gsap.set(split.lines, { yPercent: 110 });
      gsap.to(split.lines, {
        yPercent: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.12,
        scrollTrigger: { trigger: titleRef.current, start: 'top 85%' },
      });

      gsap.from('[data-reveal]', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.contact-content', start: 'top 85%' },
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="contact" className="contact">
      <div className="contact-glow" aria-hidden />
      <div className="shell contact-shell">
        <span className="eyebrow">03 — {t('contact.title')}</span>

        <h2 ref={titleRef} className="contact-title">
          {t('contact.heading')}
        </h2>

        <a
          ref={ctaRef}
          href={`mailto:${CONTACT.email}`}
          data-cursor="✉"
          className="contact-cta"
        >
          {t('contact.email')}
          <span aria-hidden="true">↗</span>
        </a>

        <div className="contact-content">
          <div data-reveal>
            <h3 className="contact-building-title">{t('contact.githubHeading')}</h3>
            <a
              className="contact-building-link"
              data-cursor="↗"
              href={CONTACT.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('contact.githubCta')}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="contact-links" data-reveal>
            <ContactRow label={t('contact.linkedin')} meta="Luam Ramlow" href={CONTACT.linkedin} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
