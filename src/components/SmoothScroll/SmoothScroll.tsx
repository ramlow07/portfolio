import { useEffect } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../../lib/gsap';

interface SmoothScrollProps {
  children: ReactNode;
}

/**
 * Wraps the app in a Lenis smooth-scroll instance and drives GSAP's
 * ScrollTrigger from the same RAF loop so pinned/scrubbed timelines stay
 * perfectly in sync with the eased scroll position.
 */
const SmoothScroll = ({ children }: SmoothScrollProps) => {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    // Let anchor links / programmatic scroll go through Lenis.
    const anchorHandler = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest('a[href^="#"], [data-scroll-to]');
      if (!target) return;
      const id =
        target.getAttribute('data-scroll-to') ||
        target.getAttribute('href')?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: 0, duration: 1.4 });
    };
    document.addEventListener('click', anchorHandler);

    // Expose for components that need to trigger scroll (e.g. nav).
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      document.removeEventListener('click', anchorHandler);
      gsap.ticker.remove(ticker);
      lenis.destroy();
      delete (window as Window & { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
