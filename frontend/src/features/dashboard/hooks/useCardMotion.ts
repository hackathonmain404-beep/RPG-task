import { useCallback, useRef } from 'react';

interface CardMotionOptions {
  maxTiltDeg?: number;
  enableTilt?: boolean;
  enableGlow?: boolean;
}

export function useCardMotion<T extends HTMLElement = HTMLDivElement>(options: CardMotionOptions = {}) {
  const { maxTiltDeg = 2.5, enableTilt = true, enableGlow = true } = options;
  const cardRef = useRef<T | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<T>) => {
    // Check for reduced motion or touch screens
    if (typeof window !== 'undefined') {
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isTouch = window.matchMedia('(hover: none)').matches;
      if (isReducedMotion || isTouch) return;
    }

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      // Set CSS variables for localized radial cursor glow
      if (enableGlow) {
        card.style.setProperty('--cursor-x', `${x}px`);
        card.style.setProperty('--cursor-y', `${y}px`);
      }

      // Compute subtle 3D tilt
      if (enableTilt) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const percentX = (x - centerX) / centerX;
        const percentY = (y - centerY) / centerY;

        const tiltX = -percentY * maxTiltDeg;
        const tiltY = percentX * maxTiltDeg;

        card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;
      }
    });
  }, [enableGlow, enableTilt, maxTiltDeg]);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.removeProperty('--cursor-x');
      card.style.removeProperty('--cursor-y');
    });
  }, []);

  return {
    cardRef,
    handleMouseMove,
    handleMouseLeave,
  };
}
