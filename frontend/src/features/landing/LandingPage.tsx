import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
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
  Radio
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  useDocumentMetadata('Life RPG — Turn Everyday Tasks Into Epic Progression & Character Growth', { noindex: false });

  // Sandboxed Interactive Hero Quest Demo state
  const [isDemoCompleted, setIsDemoCompleted] = useState(false);
  const [demoXp, setDemoXp] = useState(340);
  const [demoGold, setDemoGold] = useState(120);
  const [showCelebration, setShowCelebration] = useState(false);

  // FAQ Accordion Open State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleDemoComplete = () => {
    if (isDemoCompleted) return;
    setIsDemoCompleted(true);
    setDemoXp(prev => prev + 65);
    setDemoGold(prev => prev + 18);
    setShowCelebration(true);
  };

  const resetDemo = () => {
    setIsDemoCompleted(false);
    setShowCelebration(false);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div 
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
          backgroundColor: 'rgba(9, 12, 16, 0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
            <Link to="/login" className="rpg-btn rpg-btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              Log In
            </Link>
            <Link to="/register" className="rpg-btn rpg-btn-primary" style={{ padding: '0.5rem 1.15rem', fontSize: '0.9rem', gap: '0.4rem' }}>
              Begin Adventure <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Marketing Flow */}
      <main style={{ flex: 1 }}>
        {/* HERO SECTION */}
        <section
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '5rem 1.5rem 4rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Eyebrow Tag */}
          <div
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
              marginBottom: '1.75rem',
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
              marginBottom: '1.5rem',
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            Your Life is the Game.{' '}
            <span
              style={{
                display: 'block',
                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 25px rgba(56, 189, 248, 0.3))',
              }}
            >
              Start Gaining XP.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: '720px',
              marginBottom: '2.5rem',
              lineHeight: 1.6,
            }}
          >
            Transform daily tasks, habits, and study into a real RPG adventure. Level up attributes, 
            maintain streaks, earn gold, and unlock equipment with verified database persistence.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3.5rem' }}>
            <Link 
              to="/register" 
              className="rpg-btn rpg-btn-primary" 
              style={{ 
                padding: '0.85rem 1.85rem', 
                fontSize: '1.05rem',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)'
              }}
            >
              Begin Your Adventure — Free <ArrowRight size={18} />
            </Link>
            <Link 
              to="/login" 
              className="rpg-btn rpg-btn-secondary" 
              style={{ 
                padding: '0.85rem 1.85rem', 
                fontSize: '1.05rem',
                backgroundColor: 'rgba(22, 29, 40, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.15)'
              }}
            >
              Enter the Citadel
            </Link>
          </div>

          {/* INTERACTIVE HERO QUEST SIMULATOR */}
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: '#0f141c',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.12)',
              position: 'relative',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Interactive Simulator Preview
                </span>
                <span className="rpg-badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  Live Demo
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.85rem' }}>
                <span className="rpg-badge" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)', fontWeight: 700 }}>
                  <Sparkles size={12} /> {demoXp} XP
                </span>
                <span className="rpg-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 700 }}>
                  <Coins size={12} /> {demoGold} Gold
                </span>
              </div>
            </div>

            {/* Simulating Quest Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderRadius: '12px',
                backgroundColor: isDemoCompleted ? 'rgba(16, 185, 129, 0.08)' : '#161d28',
                border: isDemoCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={handleDemoComplete}
                  disabled={isDemoCompleted}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: isDemoCompleted ? '#10b981' : '#06080b',
                    border: isDemoCompleted ? '1px solid #10b981' : '2px solid rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isDemoCompleted ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isDemoCompleted ? '0 0 14px rgba(16, 185, 129, 0.5)' : 'none',
                  }}
                  aria-label="Complete Demo Quest"
                >
                  {isDemoCompleted ? <Check size={18} color="#090c10" strokeWidth={3} /> : null}
                </button>
                <div>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: isDemoCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                      textDecoration: isDemoCompleted ? 'line-through' : 'none',
                    }}
                  >
                    Complete 45-Minute Deep Coding Session
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', alignItems: 'center' }}>
                    <span className="rpg-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                      🧠 Intellect
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Difficulty: Medium</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="rpg-badge rpg-btn-gold" style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}>
                  +65 XP
                </span>
              </div>
            </div>

            {/* Micro Feedback celebration message */}
            {showCelebration ? (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                  ✨ Quest Claimed! +65 XP and +18 Gold added. Try it with your real tasks!
                </span>
                <button
                  type="button"
                  onClick={resetDemo}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  Reset Demo
                </button>
              </div>
            ) : (
              <p style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                👆 Click the checkbox above to test the tactile dopamine loop.
              </p>
            )}
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS (THE 4-STEP LOOP) */}
        <section
          id="how-it-works"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '5.5rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="rpg-label" style={{ color: '#38bdf8', letterSpacing: '0.08em' }}>The Gameplay Loop</span>
            <h2 style={{ fontSize: '2.35rem', marginTop: '0.5rem', fontWeight: 800 }}>
              How Life RPG Transforms Your Routine
            </h2>
          </div>

          <div
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
              },
              {
                step: '02',
                title: 'Execute in Reality',
                desc: 'Put your distraction away, hit the gym, study the lesson, or write the prose.',
                icon: Zap,
                color: '#f59e0b',
              },
              {
                step: '03',
                title: 'Claim Authoritative Spoils',
                desc: 'Check off the quest to trigger XP fly-ups, gold counter chimes, and attribute growth.',
                icon: Coins,
                color: '#a855f7',
              },
              {
                step: '04',
                title: 'Ascend & Equip',
                desc: 'Conquer non-linear level thresholds, maintain streak flames, and unlock gear in the Armory.',
                icon: Flame,
                color: '#ef4444',
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.step} 
                  className="rpg-card rpg-card-hover" 
                  style={{ 
                    position: 'relative',
                    backgroundColor: '#0f141c',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '1.75rem',
                  }}
                >
                  <div
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
            <span className="rpg-label" style={{ color: '#a855f7', letterSpacing: '0.08em' }}>Character Development</span>
            <h2 style={{ fontSize: '2.35rem', marginTop: '0.5rem', fontWeight: 800 }}>
              Master the 5 Real-World Disciplines
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0.75rem auto 0', fontSize: '1rem' }}>
              Every quest builds a specific facet of your character. Diversify your life to develop a legendary adventurer.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {[
              { name: 'Intellect', level: 'LVL 14', progress: 70, icon: Brain, color: 'var(--attr-intellect)', tasks: 'Coding · Logic · System Design · Languages' },
              { name: 'Strength', level: 'LVL 12', progress: 55, icon: Dumbbell, color: 'var(--attr-strength)', tasks: 'Gym · Calisthenics · Running · Conditioning' },
              { name: 'Wisdom', level: 'LVL 18', progress: 85, icon: BookOpen, color: 'var(--attr-wisdom)', tasks: 'Reading · Research · Reflection · Strategy' },
              { name: 'Charisma', level: 'LVL 09', progress: 40, icon: Sparkles, color: 'var(--attr-charisma)', tasks: 'Public Speaking · Teamwork · Mentorship' },
              { name: 'Vitality', level: 'LVL 16', progress: 80, icon: Heart, color: 'var(--attr-vitality)', tasks: 'Sleep · Nutrition · Mindfulness · Hydration' },
            ].map(disc => {
              const Icon = disc.icon;
              return (
                <div 
                  key={disc.name} 
                  className="rpg-card rpg-card-hover"
                  style={{
                    backgroundColor: '#0f141c',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1.35rem',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div
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
                        className="rpg-progress-fill"
                        style={{
                          width: `${disc.progress}%`,
                          backgroundColor: disc.color,
                          boxShadow: `0 0 8px ${disc.color}`,
                        }}
                      />
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
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>DB: ACID 🔒</span>
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#10b981' }}>RLS: ACTIVE ✓</span>
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>SCHEMA: V2.1</span>
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>RETENTION: PERM</span>
            </div>

            <div
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

            <h2 style={{ fontSize: '2.25rem', marginBottom: '1.25rem', fontWeight: 800 }}>
              Authentic Cloud Persistence. No Fake Local Storage.
            </h2>

            <p style={{ color: 'var(--text-secondary)', maxWidth: '720px', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '2.5rem' }}>
              Many productivity demos fake progression using browser localStorage that disappears on another device. 
              Life RPG uses an enterprise-grade <strong style={{ color: '#38bdf8' }}>PostgreSQL</strong> relational database with atomic transactions, 
              ensuring your hard-earned XP, streak records, and armory inventory are permanently preserved.
            </p>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>
                <Check size={18} /> Cross-Device Synchronization
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>
                <Check size={18} /> Anti-Cheat Server Validation
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>
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
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
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
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '4rem 1.5rem 6.5rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              padding: '3.5rem 2rem',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 0 40px rgba(56, 189, 248, 0.1), 0 20px 50px rgba(0, 0, 0, 0.6)'
            }}
          >
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>
              Ready to Forge Your Legendary Character?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.25rem', fontSize: '1.1rem' }}>
              Join thousands of adventurers translating mundane tasks into epic levels and daily momentum.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="rpg-btn rpg-btn-primary" style={{ padding: '0.85rem 2.25rem', fontSize: '1.1rem', boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)' }}>
                Forge Character Now <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="rpg-btn rpg-btn-secondary" style={{ padding: '0.85rem 2.25rem', fontSize: '1.1rem', backgroundColor: 'rgba(22, 29, 40, 0.7)' }}>
                Enter the Citadel <ArrowRight size={18} />
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
              <li><Link to="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Quests <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></Link></li>
              <li><a href="#disciplines" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Character Progression <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></a></li>
              <li><Link to="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Rewards <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>→</span></Link></li>
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
    </div>
  );
};
