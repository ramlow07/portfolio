import { useEffect, useState } from 'react';

/**
 * Gates the WebGL hero so it only mounts where it's worth the cost:
 * a wide viewport, a fine pointer, and motion allowed. Everything else
 * gets the lightweight static fallback.
 */
export function useEnable3D() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(
      '(min-width: 860px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
    );
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return enabled;
}
