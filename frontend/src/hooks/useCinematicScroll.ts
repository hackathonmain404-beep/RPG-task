import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger);
}

export type AdventureStage = 'BEGIN' | 'QUEST' | 'ACTION' | 'GROWTH' | 'PROGRESSION' | 'ADVENTURE';

export interface CinematicScrollState {
  progress: number;
  stage: AdventureStage;
  prefersReducedMotion: boolean;
  isMobile: boolean;
}

/**
 * Maps raw scroll progress (0-100) to the 6 core LIFE RPG adventure journey stages.
 */
export function getAdventureStage(progress: number): AdventureStage {
  if (progress < 18) return 'BEGIN';
  if (progress < 38) return 'QUEST';
  if (progress < 58) return 'ACTION';
  if (progress < 78) return 'GROWTH';
  if (progress < 95) return 'PROGRESSION';
  return 'ADVENTURE';
}

/**
 * Custom hook providing centralized scroll progress, adventure stage mapping,
 * reduced motion detection, and GSAP ScrollTrigger registration.
 */
export function useCinematicScroll(): CinematicScrollState {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<AdventureStage>('BEGIN');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => 
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    // Listen for reduced motion preference changes
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    motionMedia.addEventListener('change', handleMotionChange);

    // Listen for viewport width changes
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile, { passive: true });

    // Global scroll listener for reactive state updates
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentPct = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
      const clampedPct = Math.min(100, Math.max(0, currentPct));

      setProgress(clampedPct);
      setStage(getAdventureStage(clampedPct));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      motionMedia.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return {
    progress,
    stage,
    prefersReducedMotion,
    isMobile,
  };
}

export { gsap, ScrollTrigger };
