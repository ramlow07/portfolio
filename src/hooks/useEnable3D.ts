import { useEffect, useState } from 'react';

export type Quality = 'high' | 'low';
export interface Hero3DState {
  enabled: boolean;
  quality: Quality;
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl2') || c.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Decides whether to mount the WebGL hero and at what quality.
 * - Renders on mobile too, but at a cheaper 'low' tier (smaller buffers).
 * - Falls back to the static orb only for reduced-motion or no WebGL.
 * - `?d3` forces it on (used for screenshots).
 */
export function useHero3D(): Hero3DState {
  const [state, setState] = useState<Hero3DState>({ enabled: false, quality: 'high' });

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 860px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const forced = new URLSearchParams(window.location.search).has('d3');

    const update = () => {
      setState({
        enabled: forced || (!reduce.matches && hasWebGL()),
        quality: wide.matches ? 'high' : 'low',
      });
    };
    update();

    wide.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      wide.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  return state;
}
