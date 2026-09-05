import { useEffect, useRef, useState } from 'react';

type ScrollDirection = 'up' | 'down' | 'idle';

export function useScrollDirection(threshold = 80): {
  direction: ScrollDirection;
  scrollY: number;
  pastHero: boolean;
} {
  const [direction, setDirection] = useState<ScrollDirection>('idle');
  const [scrollY, setScrollY] = useState(0);
  const [pastHero, setPastHero] = useState(false);
  const lastY = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        const heroH = window.innerHeight * 0.85;

        setScrollY(y);
        setPastHero(y > heroH);

        if (y < threshold) {
          setDirection('idle');
        } else if (y > lastY.current + 4) {
          setDirection('down');
        } else if (y < lastY.current - 4) {
          setDirection('up');
        }

        lastY.current = y;
        rafId.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [threshold]);

  return { direction, scrollY, pastHero };
}
