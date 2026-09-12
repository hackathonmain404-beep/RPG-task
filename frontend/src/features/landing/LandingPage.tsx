import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { useCinematicScroll, gsap, ScrollTrigger } from '../../hooks/useCinematicScroll';
import { 
  Shield, 
  Flame, 
  Coins, 
  Check, 
  Brain, 
  Dumbbell, 
  BookOpen, 
  Sparkles, 
  Heart, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Database,
  Zap,
  Code2,
  Terminal,
  ArrowUp,
  Radio,
  Calendar,
  Crown,
  Target,
  CheckCircle2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  useDocumentMetadata('Life RPG — Turn Everyday Tasks Into Epic Progression & Character Growth', { noindex: false });

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const { stage: adventureStage, prefersReducedMotion, isMobile } = useCinematicScroll();

  // FAQ Accordion Open State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Active Section Tracking
  const [activeSection, setActiveSection] = useState<'hero' | 'how-it-works' | 'disciplines' | 'persistence' | 'faq'>('hero');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Hero Live Progression HUD Micro-Interaction States
  const [questHovered, setQuestHovered] = useState(false);
  const [xpHovered, setXpHovered] = useState(false);
  const [attrHovered, setAttrHovered] = useState(false);

  // GSAP Cinematic ScrollTrigger System
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Instant reveal without transform animation for users preferring reduced motion
        gsap.set(
          '.cinematic-layer, .hero-progression-hud-wrapper, .gameplay-card-wrapper, .discipline-card-wrapper, .persistence-glow-card, .faq-item-reveal, .cta-box-reveal, .hero-badge-el, .headline-row-1, .headline-row-2, .hero-desc-el, .hero-cta-btn, .hud-stagger-node',
          { opacity: 1, y: 0, x: 0, scale: 1, filter: 'none', clearProps: 'all' }
        );
        gsap.set('.discipline-progress-bar', {
          scaleX: 1,
          clearProps: 'transform',
        });
        gsap.set('.hero-hud-progress-fill', {
          scaleX: 0.68,
        });
        return;
      }

      // Master Entrance Sequence for Hero Elements
      const entranceTl = gsap.timeline({ delay: 0.1 });

      entranceTl.fromTo('.hero-badge-el',
        { opacity: 0, y: -8, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' }
      );

      entranceTl.fromTo('.headline-row-1',
        { opacity: 0, y: 14, filter: 'blur(5px)', scale: 0.97 },
        { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 0.5, ease: 'power2.out' },
        '-=0.15'
      );

      entranceTl.fromTo('.headline-row-2',
        { opacity: 0, y: 14, filter: 'blur(5px)', scale: 0.97 },
        { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 0.55, ease: 'power2.out' },
        '-=0.2'
      );

      entranceTl.fromTo('.hero-desc-el',
        { opacity: 0, y: 10, filter: 'blur(3px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' },
        '-=0.15'
      );

      entranceTl.fromTo('.hero-cta-btn',
        { opacity: 0, y: 10, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.2)' },
        '-=0.15'
      );

      entranceTl.fromTo('.hero-hud-energy-connector',
        { opacity: 0, scaleY: 0, transformOrigin: 'top center' },
        { opacity: 1, scaleY: 1, duration: 0.25, ease: 'power2.out' }
      );

      entranceTl.fromTo('.hero-progression-hud-card',
        { opacity: 0, y: 14, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' },
        '-=0.08'
      );

      entranceTl.fromTo('.hud-stagger-node',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' },
        '-=0.2'
      );

      entranceTl.fromTo('.hero-hud-progress-fill',
        { scaleX: 0 },
        { scaleX: 0.68, duration: 0.85, ease: 'power2.out' },
        '-=0.1'
      );

      entranceTl.fromTo('.hero-scroll-indicator',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
        '-=0.15'
      );

      // 0. SCROLL STATE TRACKERS (Native to GSAP, zero unthrottled reflow loops)
      ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        end: 'bottom bottom',
        onLeave: () => setShowScrollTop(true),
        onEnterBack: () => setShowScrollTop(false),
      });

      // Global scroll progress ring updater (direct DOM update via GSAP, no React render cycles)
      ScrollTrigger.create({
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          if (progressCircleRef.current) {
            progressCircleRef.current.style.strokeDashoffset = `${144.5 - 144.5 * self.progress}`;
          }
        },
      });

      const sectionNavTriggers: Array<{ id: 'hero' | 'how-it-works' | 'disciplines' | 'persistence' | 'faq'; trigger: string }> = [
        { id: 'hero', trigger: '#hero' },
        { id: 'how-it-works', trigger: '#how-it-works' },
        { id: 'disciplines', trigger: '#disciplines' },
        { id: 'persistence', trigger: '#persistence' },
        { id: 'faq', trigger: '#faq' },
      ];

      sectionNavTriggers.forEach(({ id, trigger }) => {
        ScrollTrigger.create({
          trigger,
          start: 'top 45%',
          end: 'bottom 45%',
          onEnter: () => setActiveSection(id),
          onEnterBack: () => setActiveSection(id),
        });
      });

      // ======================================================================
      // 1. HERO SCROLL EXIT & PARALLAX — CONTINUOUS REVERSIBLE SCRUB
      // 0-20% stable, 20-50% text rises, video scales back
      // 50-80% gradual fade, 80-100% complete transition
      // Symmetrical ease 'none' ensures identical 1:1 forward and reverse motion
      // ======================================================================
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.3,
        },
      });

      heroTl
        .to('.hero-video-el', {
          y: isMobile ? -15 : -40,
          scale: 0.95,
          opacity: 0.2,
          ease: 'none',
        }, 0)
        .to('.hero-vignette-overlay', {
          opacity: 0.95,
          ease: 'none',
        }, 0.1)
        .to('.hero-scroll-indicator', {
          opacity: 0,
          y: 12,
          ease: 'none',
        }, 0)
        .to('.hero-headline-group', {
          y: isMobile ? -25 : -55,
          opacity: 0,
          ease: 'none',
        }, 0.05)
        .to('.hero-progression-hud-wrapper', {
          y: isMobile ? -18 : -38,
          opacity: 0,
          ease: 'none',
        }, 0.08)
        .to('.hero-content-layer', {
          opacity: 0,
          ease: 'none',
        }, 0.45);

      // ======================================================================
      // 2. GAMEPLAY LOOP SECTION — BIDIRECTIONAL SCRUB TIMELINE
      // Staggered reveal from depth (opacity, translateY, scale)
      // GPU-accelerated: no layout thrashing or blur filters during scroll
      // ======================================================================
      const loopTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#how-it-works',
          start: 'top 85%',
          end: 'top 25%',
          scrub: 0.3,
        },
      });

      loopTl
        .fromTo('.gameplay-header-reveal',
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, ease: 'none' }
        )
        .fromTo('.gameplay-card-wrapper',
          { opacity: 0, y: 50, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.08,
            ease: 'none',
          },
          '-=0.15'
        );

      // ======================================================================
      // 3. DISCIPLINES SECTION — UNIFIED BIDIRECTIONAL SCRUB TIMELINE
      // Eyebrow -> heading -> description -> 5 cards (alternating vectors) -> progress bars
      // All synchronized on one reversible timeline: scrolls down to enter, reverses on scroll up
      // ======================================================================
      const discTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#disciplines',
          start: 'top 85%',
          end: 'top 20%',
          scrub: 0.3,
        },
      });

      discTl
        .fromTo('.discipline-eyebrow-reveal',
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, ease: 'none' }
        )
        .fromTo('.discipline-heading-reveal',
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, ease: 'none' },
          '-=0.1'
        )
        .fromTo('.discipline-desc-reveal',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, ease: 'none' },
          '-=0.1'
        );

      // Alternating directional vectors for the 5 real-world disciplines
      // Staggered onto the same timeline so scrolling up reverses card order (5 -> 4 -> 3 -> 2 -> 1)
      const discCards = gsap.utils.toArray<HTMLElement>('.discipline-card-wrapper');
      const vectors = [
        { x: -35, y: 20 },
        { x: 0, y: 45 },
        { x: 35, y: 20 },
        { x: 0, y: 45 },
        { x: -35, y: 20 },
      ];

      discCards.forEach((card, index) => {
        const v = vectors[index % vectors.length];
        discTl.fromTo(card,
          { opacity: 0, x: isMobile ? 0 : v.x, y: v.y, scale: 0.96 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            ease: 'none',
          },
          index === 0 ? '-=0.1' : '<+=0.06'
        );
      });

      // Attribute Progress Bars: animate scaleX on GPU (zero layout reflow), reversing to 0 on scroll up
      const progressBars = gsap.utils.toArray<HTMLElement>('.discipline-progress-bar');
      progressBars.forEach((bar, index) => {
        discTl.fromTo(bar,
          { scaleX: 0 },
          { scaleX: 1, ease: 'none' },
          index === 0 ? '<+=0.06' : '<+=0.03'
        );
      });

      // ======================================================================
      // 4. PERSISTENCE SECTION — BIDIRECTIONAL SCRUB TIMELINE
      // Glow intensification, database badge 0.88 -> 1.0, data nodes activate
      // ======================================================================
      const persistenceTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#persistence',
          start: 'top 75%',
          end: 'top 20%',
          scrub: 0.3,
        },
      });

      persistenceTl
        .fromTo('.persistence-glow-card',
          { boxShadow: '0 0 0px rgba(56, 189, 248, 0)', borderColor: 'rgba(56, 189, 248, 0.2)' },
          {
            boxShadow: '0 0 50px rgba(56, 189, 248, 0.18), 0 20px 50px rgba(0, 0, 0, 0.8)',
            borderColor: 'rgba(56, 189, 248, 0.45)',
            ease: 'none',
          }
        )
        .fromTo('.persistence-badge-icon',
          { scale: 0.88, opacity: 0 },
          { scale: 1, opacity: 1, ease: 'none' },
          '-=0.2'
        )
        .fromTo('.persistence-heading-reveal',
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, ease: 'none' },
          '-=0.15'
        )
        .fromTo('.persistence-node-pill',
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, stagger: 0.06, ease: 'none' },
          '-=0.15'
        )
        .fromTo('.persistence-status-check',
          { opacity: 0, y: 15, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.06, ease: 'none' },
          '-=0.1'
        );

      // ======================================================================
      // 5. FAQ SECTION — BIDIRECTIONAL SCRUB TIMELINE
      // Calm, measured entry sequence, cleanly reversing on scroll up
      // ======================================================================
      const faqTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#faq',
          start: 'top 78%',
          end: 'top 25%',
          scrub: 0.3,
        },
      });

      faqTl
        .fromTo('.faq-header-reveal',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, ease: 'none' }
        )
        .fromTo('.faq-item-reveal',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.06, ease: 'none' },
          '-=0.15'
        );

      // ======================================================================
      // 6. FINAL CTA SECTION — BIDIRECTIONAL SCRUB TIMELINE
      // Climax of the scroll journey, glowing pulse, scale 0.95 -> 1.0
      // ======================================================================
      const ctaTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#final-cta-section',
          start: 'top 80%',
          end: 'bottom 90%',
          scrub: 0.3,
        },
      });

      ctaTl
        .fromTo('.cta-box-reveal',
          { scale: 0.94, opacity: 0.7, boxShadow: '0 0 10px rgba(56, 189, 248, 0.05)' },
          {
            scale: 1,
            opacity: 1,
            boxShadow: '0 0 50px rgba(56, 189, 248, 0.25), 0 20px 60px rgba(0, 0, 0, 0.8)',
            ease: 'none',
          }
        )
        .fromTo('.cta-headline-reveal',
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, ease: 'none' },
          '-=0.2'
        )
        .fromTo('.cta-desc-reveal',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, ease: 'none' },
          '-=0.15'
        )
        .fromTo('.cta-buttons-reveal',
          { opacity: 0, y: 15, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, ease: 'none' },
          '-=0.1'
        );
    }, mainContainerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion, isMobile]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 72;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile || prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to('.hero-hud-parallax-inner', {
      x: x * 14,
      y: y * 10,
      duration: 0.35,
      ease: 'power1.out',
      overwrite: 'auto',
    });
  };

  const handleHeroMouseLeave = () => {
    if (isMobile || prefersReducedMotion) return;
    gsap.to('.hero-hud-parallax-inner', {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  return (
    <div 
      ref={mainContainerRef}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh', 
        backgroundColor: '#090c10',
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.08) 0%, transparent 60%),
          radial-gradient(circle at 80% 40%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
        color: '#f8fafc',
        position: 'relative'
      }}
    >
      {/* Top Public Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(9, 12, 16, 0.75)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '-76px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
                }}
              >
                <Shield size={22} color="#38bdf8" />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  letterSpacing: '0.04em',
                  background: 'linear-gradient(90deg, #f8fafc, #38bdf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                LIFE RPG
              </span>
            </Link>

            {/* Subtle Adventure Journey Stage Badge */}
            <div className="cinematic-stage-badge desktop-only" aria-label={`Current Journey Stage: ${adventureStage}`}>
              <span className="stage-pulse" />
              <span>STAGE: {adventureStage}</span>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-only" aria-label="Public sections">
            <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s ease' }}>
              How It Works
            </a>
            <a href="#disciplines" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s ease' }}>
              Disciplines
            </a>
            <a href="#persistence" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s ease' }}>
              Persistence
            </a>
            <a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s ease' }}>
              FAQ
            </a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="rpg-btn rpg-btn-primary" style={{ padding: '0.5rem 1.15rem', fontSize: '0.9rem', gap: '0.4rem' }}>
              Log In <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* RIGHT-SIDE RPG HUD SCROLL NAVIGATOR */}
      <div
        style={{
          position: 'fixed',
          right: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.85rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          userSelect: 'none',
        }}
        className="desktop-only"
        aria-label="Section Scroll Navigator"
      >
        <div 
          style={{ 
            fontSize: '0.62rem', 
            color: '#38bdf8', 
            letterSpacing: '0.14em', 
            fontWeight: 800, 
            marginBottom: '0.25rem',
            padding: '0.2rem 0.5rem',
            backgroundColor: 'rgba(9, 14, 31, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '4px',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.15)'
          }}
        >
          SYS: {adventureStage}
        </div>
        {[
          { id: 'hero', label: '00 START' },
          { id: 'how-it-works', label: '01 LOOP' },
          { id: 'disciplines', label: '02 STATS' },
          { id: 'persistence', label: '03 VAULT' },
          { id: 'faq', label: '04 INTEL' },
        ].map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.2rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                color: isActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.45)',
                transition: 'all 0.25s ease',
              }}
            >
              <span
                style={{
                  fontWeight: isActive ? 700 : 500,
                  opacity: isActive ? 1 : 0.45,
                  transform: isActive ? 'translateX(0)' : 'translateX(4px)',
                  color: isActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.5)',
                  transition: 'all 0.25s ease',
                }}
              >
                {item.label}
              </span>
              <div
                className={isActive ? 'scroll-hud-dot-active' : ''}
                style={{
                  width: isActive ? '8px' : '6px',
                  height: isActive ? '8px' : '6px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#38bdf8' : 'transparent',
                  border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: isActive ? '0 0 10px #38bdf8' : 'none',
                  transition: 'all 0.25s ease',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Main Marketing Flow */}
      <main style={{ flex: 1 }}>
        {/* HERO SECTION WITH CINEMATIC BACKGROUND VIDEO */}
        <section
          id="hero"
          className="hero-fullscreen"
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            minHeight: '100dvh',
            boxSizing: 'border-box',
            paddingTop: 'calc(76px + clamp(0.75rem, 2vh, 1.75rem))',
            paddingBottom: 'clamp(0.75rem, 2vh, 1.5rem)',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'center',
          }}
        >
          {/* Background Video Layer with smooth gradient feathering */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              pointerEvents: 'none',
              zIndex: 0,
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.35) 85%, rgba(0,0,0,0) 100%)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.35) 85%, rgba(0,0,0,0) 100%)',
            }}
          >
            <video
              className="hero-video-el cinematic-layer"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.65,
                filter: 'contrast(1.15) brightness(0.9)',
                transformOrigin: 'center center',
              }}
              src="/videos/hero-bg.mp4"
            />
            {/* Cinematic Gradient Vignette Overlay to ensure perfect contrast and soft bottom fade */}
            <div
              className="hero-vignette-overlay cinematic-layer"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(ellipse at 50% 40%, rgba(9, 12, 16, 0.3) 0%, rgba(9, 12, 16, 0.75) 60%, #090c10 100%),
                  linear-gradient(to bottom, rgba(9, 12, 16, 0.75) 0%, transparent 20%, transparent 55%, rgba(9, 12, 16, 0.6) 75%, rgba(9, 12, 16, 0.95) 90%, #090c10 100%)
                `,
                pointerEvents: 'none',
              }}
            />
          </div>

          <div
            className="hero-content-layer cinematic-depth-container"
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              flex: 1,
            }}
          >
            {/* Layer 1: Headline, Eyebrow, CTAs */}
            <div 
              className="hero-headline-group cinematic-layer" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                margin: 'auto 0',
              }}
            >
              {/* Eyebrow Tag */}
              <div
                className="hero-badge-el"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 1.1rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.12)',
                }}
              >
                <Sparkles size={14} />
                <span>The Adventurer&apos;s Productivity Operating System</span>
              </div>

              {/* H1 Heading */}
              <h1
                style={{
                  fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
                  maxWidth: '920px',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                }}
              >
                <span
                  className="headline-row-1"
                  style={{
                    display: 'block',
                    color: '#f8fafc',
                    marginBottom: '0.1em',
                  }}
                >
                  Your Life is the Game.
                </span>
                <span
                  className="headline-row-2 xp-sweep-active"
                  style={{
                    display: 'inline-block',
                    position: 'relative',
                    background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 25px rgba(56, 189, 248, 0.3))',
                  }}
                >
                  Start Gaining XP.
                  <span className="xp-spark" style={{ top: '-4px', right: '-8px' }} />
                  <span className="xp-spark" style={{ bottom: '2px', right: '-12px', animationDelay: '2.05s' }} />
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className="hero-desc-el"
                style={{
                  fontSize: '1.15rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '720px',
                  marginBottom: '1.25rem',
                  lineHeight: 1.6,
                }}
              >
                Transform daily tasks, habits, and study into a real RPG adventure. Level up attributes, 
                maintain streaks, earn gold, and unlock equipment with verified database persistence.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '0.4rem' }}>
                <Link 
                  to="/login" 
                  className="hero-cta-btn rpg-btn rpg-btn-primary" 
                  style={{ 
                    padding: '0.85rem 1.85rem', 
                    fontSize: '1.05rem',
                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)'
                  }}
                >
                  Begin Your Adventure — Free <ArrowRight size={18} />
                </Link>
              </div>

              {/* Luminous Energy Connector from CTA to Live Progression HUD */}
              <div className="hero-hud-energy-connector" aria-hidden="true" />

              {/* LIVE PROGRESSION HUD (Layered Floating Player Interface) */}
              <div
                className="hero-progression-hud-wrapper cinematic-layer"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '0.2rem',
                  marginBottom: '0.2rem',
                }}
              >
                {/* Desktop Mouse Parallax Inner Container */}
                <div className="hero-hud-parallax-inner">
                  <div
                    className="hero-progression-hud-card"
                    onMouseLeave={() => {
                      setQuestHovered(false);
                      setXpHovered(false);
                      setAttrHovered(false);
                    }}
                    role="region"
                    aria-label="Live Quest and Progression Demonstration HUD"
                  >
                    {/* Cyber Corner Brackets */}
                    <div className="hud-corner hud-corner-tl" />
                    <div className="hud-corner hud-corner-tr" />
                    <div className="hud-corner hud-corner-bl" />
                    <div className="hud-corner hud-corner-br" />

                    {/* Top Status Bar: LIVE PROGRESSION | [ACTIVE QUEST] ... TODAY 🗓️ */}
                    <div
                      className="hud-stagger-node"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.65rem',
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                        <span style={{ fontWeight: 800, letterSpacing: '0.12em', color: '#38bdf8', textTransform: 'uppercase' }}>
                          LIVE PROGRESSION
                        </span>
                        <span style={{ color: 'rgba(56, 189, 248, 0.35)', margin: '0 0.15rem' }}>|</span>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.12rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            color: '#34d399',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                          }}
                        >
                          <span
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              backgroundColor: '#10b981',
                              boxShadow: '0 0 6px #10b981',
                            }}
                          />
                          <span>ACTIVE QUEST</span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: 'var(--text-tertiary)',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                        }}
                      >
                        <span>TODAY</span>
                        <Calendar size={12} color="#38bdf8" />
                      </div>
                    </div>

                    {/* Middle Four-Node Connected Row */}
                    <div
                      className="hud-main-grid hud-stagger-node"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(56, 189, 248, 0.12)',
                      }}
                    >
                      {/* Node 1: Quest Node */}
                      <div
                        className="hero-hud-quest-pill"
                        onMouseEnter={() => setQuestHovered(true)}
                        onMouseLeave={() => setQuestHovered(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          flex: '1 1 auto',
                          minWidth: '180px',
                          cursor: 'pointer',
                        }}
                      >
                        {/* Hexagon icon */}
                        <div className="hud-hex-node">
                          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                            <polygon
                              points="19,2 34,10.5 34,27.5 19,36 4,27.5 4,10.5"
                              fill="rgba(56, 189, 248, 0.1)"
                              stroke="#38bdf8"
                              strokeWidth="1.5"
                            />
                            {/* Inner task icon */}
                            <path
                              d="M14 15h10M14 19h7M14 23h5"
                              stroke="#38bdf8"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        {/* Text info */}
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '0.2rem', position: 'relative' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                              45-MIN DEEP CODING SESSION
                            </span>
                            {questHovered && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 'calc(100% + 4px)',
                                  left: 0,
                                  fontSize: '0.58rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: '#38bdf8',
                                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                  padding: '0.12rem 0.45rem',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(56, 189, 248, 0.45)',
                                  boxShadow: '0 4px 15px rgba(0,0,0,0.7)',
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                  zIndex: 30,
                                  pointerEvents: 'none',
                                }}
                              >
                                COMPLETE QUEST
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.62rem', fontFamily: 'var(--font-mono)' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>INTELLECT • MEDIUM</span>
                            <span
                              style={{
                                color: '#fbbf24',
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                padding: '0.08rem 0.4rem',
                                borderRadius: '9999px',
                                border: '1px solid rgba(245, 158, 11, 0.35)',
                                fontWeight: 800,
                              }}
                            >
                              +65 XP
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Vector Arrow 1 */}
                      <div className="hud-arrow-connector">→</div>

                      {/* Node 2: XP Node */}
                      <div
                        className="hud-hex-node-group"
                        onMouseEnter={() => setXpHovered(true)}
                        onMouseLeave={() => setXpHovered(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          transform: xpHovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        <div className="hud-hex-node">
                          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                            <polygon
                              points="19,2 34,10.5 34,27.5 19,36 4,27.5 4,10.5"
                              fill={xpHovered ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)'}
                              stroke="#34d399"
                              strokeWidth="1.5"
                            />
                            <text
                              x="19"
                              y="23"
                              textAnchor="middle"
                              fill="#34d399"
                              fontSize="11"
                              fontWeight="800"
                              fontFamily="var(--font-mono)"
                            >
                              XP
                            </text>
                          </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                            +65 XP
                          </span>
                          <span style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            Quest Completed
                          </span>
                        </div>
                      </div>

                      {/* Vector Arrow 2 */}
                      <div className="hud-arrow-connector">→</div>

                      {/* Node 3: Attribute Node */}
                      <div
                        className="hero-hud-attr-pill"
                        onMouseEnter={() => setAttrHovered(true)}
                        onMouseLeave={() => setAttrHovered(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        <div className="hud-hex-node">
                          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                            <polygon
                              points="19,2 34,10.5 34,27.5 19,36 4,27.5 4,10.5"
                              fill={attrHovered ? 'rgba(168, 85, 247, 0.25)' : 'rgba(168, 85, 247, 0.12)'}
                              stroke="#c084fc"
                              strokeWidth="1.5"
                            />
                          </svg>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <Brain size={16} color="#c084fc" />
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                            INTELLECT
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                            +2
                          </span>
                        </div>

                        {/* Tooltip */}
                        {attrHovered && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 'calc(100% + 8px)',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              whiteSpace: 'nowrap',
                              padding: '0.25rem 0.55rem',
                              backgroundColor: '#0f172a',
                              border: '1px solid rgba(56, 189, 248, 0.4)',
                              borderRadius: '4px',
                              fontSize: '0.62rem',
                              color: '#38bdf8',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
                              zIndex: 30,
                              pointerEvents: 'none',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            Real-world action → Attribute progression
                          </div>
                        )}
                      </div>

                      {/* Node 4: Next Level Progress */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          textAlign: 'left',
                          minWidth: '130px',
                          gap: '0.3rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', letterSpacing: '0.08em', fontWeight: 700 }}>
                            NEXT LEVEL
                          </span>
                          <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 800 }}>
                            LVL 1
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '5px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '9999px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            className="hero-hud-progress-fill"
                            style={{
                              width: '100%',
                              height: '100%',
                              transformOrigin: 'left center',
                              transform: prefersReducedMotion ? 'scaleX(0.68)' : 'scaleX(0)',
                              background: 'linear-gradient(90deg, #38bdf8, #a855f7)',
                              boxShadow: '0 0 8px rgba(56, 189, 248, 0.5)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          340 / 500 XP
                        </span>
                      </div>
                    </div>

                    {/* Bottom Pipeline Track: QUEST -> XP -> ATTRIBUTE -> LEVEL UP */}
                    <div className="hud-pipeline-track hud-stagger-node">
                      <div className="hud-pipeline-step" style={{ color: '#38bdf8' }}>
                        <CheckCircle2 size={12} color="#38bdf8" />
                        <span>QUEST</span>
                      </div>
                      <span style={{ color: 'rgba(56, 189, 248, 0.4)' }}>→</span>
                      <div className="hud-pipeline-step" style={{ color: '#34d399' }}>
                        <Target size={12} color="#34d399" />
                        <span>XP</span>
                      </div>
                      <span style={{ color: 'rgba(56, 189, 248, 0.4)' }}>→</span>
                      <div className="hud-pipeline-step" style={{ color: '#c084fc' }}>
                        <Brain size={12} color="#c084fc" />
                        <span>ATTRIBUTE</span>
                      </div>
                      <span style={{ color: 'rgba(56, 189, 248, 0.4)' }}>→</span>
                      <div className="hud-pipeline-step" style={{ color: '#fbbf24' }}>
                        <Crown size={12} color="#fbbf24" />
                        <span style={{ color: '#fbbf24' }}>LEVEL UP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 2: THEME-BASED SCROLL DOWN TRIGGER INDICATOR */}
            <div
              className="hero-scroll-indicator cinematic-layer"
              style={{
                marginTop: '0.75rem',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'transform 0.2s ease, filter 0.2s ease',
              }}
              onClick={() => scrollToSection('how-it-works')}
              role="button"
              tabIndex={0}
              aria-label="Scroll down to explore gameplay loop"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  scrollToSection('how-it-works');
                }
              }}
            >
              <span
                style={{
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.14em',
                  color: '#38bdf8',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  opacity: 0.85,
                }}
              >
                System Dive · Scroll Down
              </span>
              <div
                style={{
                  width: '24px',
                  height: '38px',
                  borderRadius: '12px',
                  border: '2px solid rgba(56, 189, 248, 0.45)',
                  display: 'flex',
                  justifyContent: 'center',
                  paddingTop: '6px',
                  backgroundColor: 'rgba(9, 14, 31, 0.7)',
                  boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)',
                }}
              >
                <div
                  className="scroll-indicator-wheel"
                  style={{
                    width: '3.5px',
                    height: '8px',
                    borderRadius: '2px',
                    backgroundColor: '#38bdf8',
                    boxShadow: '0 0 6px #38bdf8',
                  }}
                />
              </div>
              <div className="scroll-indicator-bounce" style={{ marginTop: '-4px' }}>
                <ChevronDown size={16} color="#38bdf8" />
              </div>
            </div>
          </div>
        </section>

        {/* ATMOSPHERIC CYBER HORIZON CONNECTOR */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            marginTop: '-1px',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          {/* Ambient Glow Pool between sections */}
          <div
            style={{
              position: 'absolute',
              top: '-35px',
              width: 'min(900px, 90vw)',
              height: '70px',
              background: 'radial-gradient(ellipse at 50% 50%, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0.04) 50%, transparent 80%)',
              filter: 'blur(10px)',
            }}
          />

          {/* Luminous Feathered Horizon Beam */}
          <div
            style={{
              width: '100%',
              maxWidth: '1280px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.05) 15%, rgba(56, 189, 248, 0.4) 50%, rgba(56, 189, 248, 0.05) 85%, transparent 100%)',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)',
              position: 'relative',
            }}
          >
            {/* Center Glowing Rune Waypoint */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(45deg)',
                width: '6px',
                height: '6px',
                backgroundColor: '#090c10',
                border: '1px solid #38bdf8',
                boxShadow: '0 0 10px #38bdf8',
              }}
            />
          </div>
        </div>

        {/* SECTION 2: HOW IT WORKS (THE 4-STEP LOOP) */}
        <section
          id="how-it-works"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '5rem 1.5rem 6.5rem',
            scrollMarginTop: '80px',
            position: 'relative',
          }}
        >
          <div className="gameplay-header-reveal cinematic-layer" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="rpg-label" style={{ color: '#38bdf8', letterSpacing: '0.08em' }}>The Gameplay Loop</span>
            <h2 style={{ fontSize: '2.35rem', marginTop: '0.5rem', fontWeight: 800 }}>
              How Life RPG Transforms Your Routine
            </h2>
          </div>

          <div
            className="cinematic-depth-container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                step: '01',
                title: 'Formulate the Quest',
                desc: 'Define your real goals with targeted disciplines and balanced difficulty tiers.',
                icon: Shield,
                color: '#38bdf8',
                accentBorder: 'rgba(56, 189, 248, 0.45)',
                accentGlow: 'rgba(56, 189, 248, 0.22)',
                accentNum: 'rgba(56, 189, 248, 0.28)',
              },
              {
                step: '02',
                title: 'Execute in Reality',
                desc: 'Put your distraction away, hit the gym, study the lesson, or write the prose.',
                icon: Zap,
                color: '#f59e0b',
                accentBorder: 'rgba(245, 158, 11, 0.45)',
                accentGlow: 'rgba(245, 158, 11, 0.22)',
                accentNum: 'rgba(245, 158, 11, 0.28)',
              },
              {
                step: '03',
                title: 'Claim Authoritative Spoils',
                desc: 'Check off the quest to trigger XP fly-ups, gold counter chimes, and attribute growth.',
                icon: Coins,
                color: '#a855f7',
                accentBorder: 'rgba(168, 85, 247, 0.45)',
                accentGlow: 'rgba(168, 85, 247, 0.22)',
                accentNum: 'rgba(168, 85, 247, 0.28)',
              },
              {
                step: '04',
                title: 'Ascend & Equip',
                desc: 'Conquer non-linear level thresholds, maintain streak flames, and unlock gear in the Armory.',
                icon: Flame,
                color: '#ef4444',
                accentBorder: 'rgba(239, 68, 68, 0.45)',
                accentGlow: 'rgba(239, 68, 68, 0.22)',
                accentNum: 'rgba(239, 68, 68, 0.28)',
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="gameplay-card-wrapper cinematic-layer">
                  <div 
                    className="rpg-card rpg-card-hover gameplay-card" 
                    style={{ 
                      position: 'relative',
                      backgroundColor: '#0f141c',
                      borderRadius: '14px',
                      padding: '1.75rem',
                      height: '100%',
                      ['--card-accent' as any]: item.color,
                      ['--card-accent-border' as any]: item.accentBorder,
                      ['--card-accent-glow' as any]: item.accentGlow,
                      ['--card-accent-num' as any]: item.accentNum,
                    }}
                  >
                    <div
                      className="gameplay-card-step"
                      style={{
                        position: 'absolute',
                        top: '1.25rem',
                        right: '1.25rem',
                        fontSize: '1.85rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        color: 'rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      {item.step}
                    </div>
                    <div
                      className="gameplay-card-icon"
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '10px',
                        backgroundColor: `${item.color}15`,
                        border: `1px solid ${item.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem',
                        boxShadow: `0 0 16px ${item.color}25`,
                      }}
                    >
                      <Icon size={22} color={item.color} />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.6rem', fontWeight: 700 }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: THE 5 DISCIPLINES */}
        <section
          id="disciplines"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '5.5rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="rpg-label discipline-eyebrow-reveal cinematic-layer" style={{ color: '#a855f7', letterSpacing: '0.08em' }}>Character Development</span>
            <h2 className="discipline-heading-reveal cinematic-layer" style={{ fontSize: '2.35rem', marginTop: '0.5rem', fontWeight: 800 }}>
              Master the 5 Real-World Disciplines
            </h2>
            <p className="discipline-desc-reveal cinematic-layer" style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0.75rem auto 0', fontSize: '1rem' }}>
              Every quest builds a specific facet of your character. Diversify your life to develop a legendary adventurer.
            </p>
          </div>

          <div
            className="cinematic-depth-container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {[
              { 
                name: 'Intellect', 
                level: 'LVL 14', 
                progress: 70, 
                icon: Brain, 
                color: '#3b82f6', 
                accentBorder: 'rgba(59, 130, 246, 0.45)',
                accentGlow: 'rgba(59, 130, 246, 0.22)',
                tasks: 'Coding · Logic · System Design · Languages' 
              },
              { 
                name: 'Strength', 
                level: 'LVL 12', 
                progress: 55, 
                icon: Dumbbell, 
                color: '#ef4444', 
                accentBorder: 'rgba(239, 68, 68, 0.45)',
                accentGlow: 'rgba(239, 68, 68, 0.22)',
                tasks: 'Gym · Calisthenics · Running · Conditioning' 
              },
              { 
                name: 'Wisdom', 
                level: 'LVL 18', 
                progress: 85, 
                icon: BookOpen, 
                color: '#14b8a6', 
                accentBorder: 'rgba(20, 184, 166, 0.45)',
                accentGlow: 'rgba(20, 184, 166, 0.22)',
                tasks: 'Reading · Research · Reflection · Strategy' 
              },
              { 
                name: 'Charisma', 
                level: 'LVL 09', 
                progress: 40, 
                icon: Sparkles, 
                color: '#8b5cf6', 
                accentBorder: 'rgba(139, 92, 246, 0.45)',
                accentGlow: 'rgba(139, 92, 246, 0.22)',
                tasks: 'Public Speaking · Teamwork · Mentorship' 
              },
              { 
                name: 'Vitality', 
                level: 'LVL 16', 
                progress: 80, 
                icon: Heart, 
                color: '#10b981', 
                accentBorder: 'rgba(16, 185, 129, 0.45)',
                accentGlow: 'rgba(16, 185, 129, 0.22)',
                tasks: 'Sleep · Nutrition · Mindfulness · Hydration' 
              },
            ].map(disc => {
              const Icon = disc.icon;
              return (
                <div key={disc.name} className="discipline-card-wrapper cinematic-layer">
                  <div 
                    className="rpg-card rpg-card-hover discipline-card"
                    style={{
                      backgroundColor: '#0f141c',
                      borderRadius: '12px',
                      padding: '1.35rem',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      ['--card-accent' as any]: disc.color,
                      ['--card-accent-border' as any]: disc.accentBorder,
                      ['--card-accent-glow' as any]: disc.accentGlow,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div
                          className="discipline-card-icon"
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            backgroundColor: `${disc.color}15`,
                            border: `1px solid ${disc.color}35`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 12px ${disc.color}20`,
                          }}
                        >
                          <Icon size={20} color={disc.color} />
                        </div>
                        <span
                          className="discipline-card-badge"
                          style={{
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: disc.color,
                            backgroundColor: `${disc.color}12`,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            border: `1px solid ${disc.color}30`
                          }}
                        >
                          {disc.level}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: '#f8fafc', fontWeight: 700 }}>
                        {disc.name}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                        {disc.tasks}
                      </p>
                    </div>

                    {/* Attribute Progress Bar */}
                    <div>
                      <div className="rpg-progress-track" style={{ height: '5px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}>
                        <div
                          className="rpg-progress-fill discipline-progress-bar"
                          data-target-width={`${disc.progress}%`}
                          style={{
                            width: `${disc.progress}%`,
                            transformOrigin: 'left center',
                            transform: prefersReducedMotion ? 'none' : 'scaleX(0)',
                            backgroundColor: disc.color,
                            boxShadow: `0 0 8px ${disc.color}`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: REAL DATABASE PERSISTENCE */}
        <section
          id="persistence"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '5.5rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div
            className="persistence-glow-card cinematic-layer"
            style={{
              backgroundColor: '#0f141c',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '18px',
              padding: '3.5rem 2.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(56, 189, 248, 0.08), 0 20px 40px rgba(0, 0, 0, 0.6)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Persistence scanning glow beam line */}
            <div className="persistence-glow-line" style={{ top: 0, left: 0, right: 0 }} />

            {/* Top right floating badges */}
            <div 
              style={{ 
                position: 'absolute', 
                top: '1.25rem', 
                right: '1.5rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.35rem', 
                alignItems: 'flex-end',
                opacity: 0.85 
              }}
              className="desktop-only"
            >
              <span className="persistence-node-pill" style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>DB: ACID 🔒</span>
              <span className="persistence-node-pill" style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#10b981' }}>RLS: ACTIVE ✓</span>
              <span className="persistence-node-pill" style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>SCHEMA: V2.1</span>
              <span className="persistence-node-pill" style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>RETENTION: PERM</span>
            </div>

            <div
              className="persistence-badge-icon"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)',
              }}
            >
              <Database size={28} color="#38bdf8" />
            </div>

            <h2 className="persistence-heading-reveal" style={{ fontSize: '2.25rem', marginBottom: '1.25rem', fontWeight: 800 }}>
              Authentic Cloud Persistence. No Fake Local Storage.
            </h2>

            <p className="persistence-heading-reveal" style={{ color: 'var(--text-secondary)', maxWidth: '720px', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '2.5rem' }}>
              Many productivity demos fake progression using browser localStorage that disappears on another device. 
              Life RPG uses an enterprise-grade <strong style={{ color: '#38bdf8' }}>PostgreSQL</strong> relational database with atomic transactions, 
              ensuring your hard-earned XP, streak records, and armory inventory are permanently preserved.
            </p>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className="persistence-status-check" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>
                <Check size={18} /> Cross-Device Synchronization
              </div>
              <div className="persistence-status-check" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>
                <Check size={18} /> Anti-Cheat Server Validation
              </div>
              <div className="persistence-status-check" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>
                <Check size={18} /> Refresh-Proof State Integrity
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: FAQ ACCORDION */}
        <section
          id="faq"
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            padding: '5.5rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div className="faq-header-reveal cinematic-layer" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="rpg-label" style={{ color: '#f59e0b', letterSpacing: '0.08em' }}>Questions & Answers</span>
            <h2 style={{ fontSize: '2.35rem', marginTop: '0.5rem', fontWeight: 800 }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              {
                q: 'What is Life RPG?',
                a: 'Life RPG is a full-stack gamified productivity platform that transforms daily habits and tasks into a role-playing game. You earn verified XP, level up your character across 5 real-world attributes, maintain streaks, and spend earned currency in a virtual armory.',
              },
              {
                q: 'How does the XP and Leveling system work?',
                a: 'Progression uses a non-linear mathematical curve where each subsequent level requires progressively more XP. XP is calculated and verified securely on our server engine, preventing cheating and preserving the value of your milestones.',
              },
              {
                q: 'How are streaks calculated?',
                a: 'A streak increments when you complete at least one quest within a calendar day in your chosen timezone. Completing multiple quests in the same day continues to award XP and Gold, while maintaining your daily streak.',
              },
              {
                q: 'What are the 5 Disciplines and Attributes?',
                a: 'Tasks belong to one of 5 core disciplines: Intellect (coding, technical work), Strength (fitness, physical conditioning), Wisdom (reading, research), Charisma (communication, social), and Vitality (sleep, nutrition, mindfulness).',
              },
              {
                q: 'What can I purchase with Gold?',
                a: 'Gold earned from completing quests can be spent in the Armory on customizable UI themes (such as Neon Outpost or Mystic Forest), avatar frames, and milestone relics. All purchases are permanently stored in your database inventory.',
              },
              {
                q: 'Is my progression saved across devices?',
                a: 'Yes. All characters, quest logs, streaks, and inventory are persisted in a secure PostgreSQL cloud database. You can sign in from any desktop or mobile browser and pick up right where you left off.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="faq-item-reveal cinematic-layer"
                  style={{
                    backgroundColor: '#0f141c',
                    border: isOpen ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '1.35rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={20} color="#38bdf8" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
                  </button>
                  {isOpen && (
                    <div
                      className="faq-content-enter"
                      style={{
                        padding: '0 1.35rem 1.35rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: '0.85rem',
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section
          id="final-cta-section"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '4rem 1.5rem 6.5rem',
            textAlign: 'center',
          }}
        >
          <div
            className="cta-box-reveal cinematic-layer"
            style={{
              padding: '3.5rem 2rem',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 0 40px rgba(56, 189, 248, 0.1), 0 20px 50px rgba(0, 0, 0, 0.6)'
            }}
          >
            <h2 className="cta-headline-reveal" style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>
              Ready to Forge Your Legendary Character?
            </h2>
            <p className="cta-desc-reveal" style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.25rem', fontSize: '1.1rem' }}>
              Join thousands of adventurers translating mundane tasks into epic levels and daily momentum.
            </p>
            <div className="cta-buttons-reveal" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" className="rpg-btn rpg-btn-primary" style={{ padding: '0.85rem 2.25rem', fontSize: '1.1rem', boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)' }}>
                Forge Character Now <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* RICH 5-COLUMN FOOTER & COMMAND CENTER (STITCH SPEC) */}
      <footer
        id="command-center-footer"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#04060d',
          padding: '4rem 1.5rem 2rem',
          color: 'var(--text-tertiary)',
          fontSize: '0.9rem',
          position: 'relative',
          zIndex: 20,
          overflow: 'hidden'
        }}
      >
        {/* Subtle Horizon Glow Divider */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(56, 189, 248, 0.4), transparent)'
          }} 
        />
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '75%',
            height: '96px',
            backgroundColor: 'rgba(56, 189, 248, 0.05)',
            filter: 'blur(48px)',
            pointerEvents: 'none'
          }} 
        />

        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem 2rem',
            marginBottom: '3.5rem',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Col 1: Brand & Bio */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.25)'
                }}
              >
                <Shield size={20} color="#38bdf8" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', color: '#f8fafc', letterSpacing: '0.04em' }}>
                LIFE <span style={{ color: '#38bdf8', textShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}>RPG</span>
              </span>
            </div>
            <p style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.02em', marginBottom: '0.5rem' }}>
              Turn your real life into an adventure.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: '380px', marginBottom: '1.5rem' }}>
              Transform everyday tasks, habits, and learning into quests, earn XP, build your character, and level up your life.
            </p>

            <div>
              <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.6rem' }}>
                Translink Satellites
              </span>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <a href="https://github.com" target="_blank" rel="noreferrer" style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.2s ease' }} aria-label="GitHub">
                  <Code2 size={16} />
                </a>
                <a href="#terminal" style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.2s ease' }} aria-label="Terminal">
                  <Terminal size={16} />
                </a>
                <a href="#broadcast" style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.2s ease' }} aria-label="Broadcast">
                  <Radio size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem', borderLeft: '2px solid #38bdf8', paddingLeft: '0.6rem' }}>
              Product
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, margin: 0, fontSize: '0.85rem' }}>
              <li><a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Features <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></a></li>
              <li><a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>How It Works <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></a></li>
              <li><Link to="/quests" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Quests <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></Link></li>
              <li><a href="#disciplines" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Character Progression <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></a></li>
              <li><Link to="/rewards" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Rewards <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></Link></li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem', borderLeft: '2px solid #c084fc', paddingLeft: '0.6rem' }}>
              Resources
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, margin: 0, fontSize: '0.85rem' }}>
              <li><a href="#persistence" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Documentation <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></a></li>
              <li><a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>FAQ <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></a></li>
              <li><a href="#persistence" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>System Architecture <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></a></li>
              <li>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  Changelog <span className="rpg-badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>v2.4.0</span> <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem', borderLeft: '2px solid #fbbf24', paddingLeft: '0.6rem' }}>
              Company
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, margin: 0, fontSize: '0.85rem' }}>
              <li><a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></a></li>
              <li><a href="#community" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Community <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></a></li>
              <li><a href="#contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></a></li>
              <li><a href="#citadel" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Citadel HQ <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></a></li>
            </ul>
          </div>

          {/* Col 5: Legal */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem', borderLeft: '2px solid #f43f5e', paddingLeft: '0.6rem' }}>
              Legal
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, margin: 0, fontSize: '0.85rem' }}>
              <li><Link to="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></Link></li>
              <li><Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Service <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></Link></li>
              <li><Link to="/accessibility" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Accessibility Statement <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></Link></li>
            </ul>
          </div>
        </div>

        {/* DECORATIVE RPG SYSTEM STATUS MODULE (HUD Console) */}
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '1.5rem 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Status Pill */}
            <div
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(9, 14, 31, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#38bdf8',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.2)'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
              System Status
            </div>

            <span className="desktop-only" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>

            {/* Engine Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(6, 9, 19, 0.6)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', fontSize: '0.65rem' }}>Quest Engine:</span>
              <span style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }} /> ONLINE
              </span>
            </div>

            {/* XP Progression Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(6, 9, 19, 0.6)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', fontSize: '0.65rem' }}>XP Progression:</span>
              <span style={{ color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8' }} /> ONLINE
              </span>
            </div>

            {/* Cloud Vault Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(6, 9, 19, 0.6)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', fontSize: '0.65rem' }}>Cloud Vault (PostgreSQL):</span>
              <span style={{ color: '#818cf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#818cf8' }} /> VERIFIED
              </span>
            </div>

            {/* Latency */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#fbbf24' }}>
              <Zap size={13} color="#fbbf24" />
              <span>24ms SYNCHRONIZED</span>
            </div>
          </div>

          {/* Back to Top */}
          <button
            type="button"
            onClick={scrollToTop}
            id="back-to-top"
            aria-label="Scroll back to top of page"
            style={{
              background: 'rgba(15, 23, 49, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.45rem 0.95rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowUp size={12} /> Back to Top
          </button>
        </div>

        {/* COPYRIGHT & SESSION METADATA BAR */}
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            paddingTop: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} color="#38bdf8" />
            <span>&copy; 2026 <strong style={{ color: '#f8fafc' }}>LIFE RPG</strong> — Built for adventurers.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-tertiary)' }}>
              <Link to="/privacy" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Privacy</Link>
              <span>·</span>
              <Link to="/terms" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Terms</Link>
              <span>·</span>
              <Link to="/accessibility" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Accessibility</Link>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.2rem 0.65rem',
                borderRadius: '4px',
                backgroundColor: '#060913',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
              <span>SESSION: <code style={{ color: '#38bdf8' }}>CID-8842-PROD</code></span>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING CYBER HUD SCROLL UP / ASCEND BUTTON */}
      <div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 45,
          opacity: showScrollTop ? 1 : 0,
          pointerEvents: showScrollTop ? 'auto' : 'none',
          transform: showScrollTop ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.9)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll back to top of page"
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'rgba(9, 14, 31, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.25), 0 10px 25px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            color: '#38bdf8',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 0 25px rgba(56, 189, 248, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.25), 0 10px 25px rgba(0, 0, 0, 0.8)';
          }}
        >
          {/* Circular SVG Scroll Progress Ring */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '54px',
              height: '54px',
              transform: 'rotate(-90deg)',
              pointerEvents: 'none',
            }}
          >
            <circle
              cx="27"
              cy="27"
              r="23"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="2.5"
            />
            <circle
              ref={progressCircleRef}
              cx="27"
              cy="27"
              r="23"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray={144.5}
              strokeDashoffset={144.5}
              strokeLinecap="round"
            />
          </svg>
          <ArrowUp size={15} strokeWidth={2.5} color="#38bdf8" />
          <span style={{ fontSize: '0.46rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38bdf8', marginTop: '-1px', letterSpacing: '0.04em' }}>
            {adventureStage}
          </span>
        </button>
      </div>
    </div>
  );
};
