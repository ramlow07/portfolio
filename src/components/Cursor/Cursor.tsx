import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import './Cursor.css';

/**
 * A single small dot that follows the pointer and gently grows over
 * interactive elements. Deliberately understated.
 */
const Cursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dot = dotRef.current!;

    const xTo = gsap.quickTo(dot, 'x', { duration: 0.18, ease: 'power3' });
    const yTo = gsap.quickTo(dot, 'y', { duration: 0.18, ease: 'power3' });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const interactive = (e.target as HTMLElement)?.closest(
        'a, button, [data-cursor]'
      );
      dot.classList.toggle('is-active', !!interactive);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    gsap.set(dot, { xPercent: -50, yPercent: -50 });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  return <div ref={dotRef} className="cursor-dot" aria-hidden />;
};

export default Cursor;
