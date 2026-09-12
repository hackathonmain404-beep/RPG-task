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
  Lock,
  Zap
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Top Public Navigation */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(9, 12, 16, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
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
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
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
            <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              How It Works
            </a>
            <a href="#disciplines" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              Disciplines
            </a>
            <a href="#persistence" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              Persistence
            </a>
            <a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              FAQ
            </a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="rpg-btn rpg-btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              Log In
            </Link>
            <Link to="/register" className="rpg-btn rpg-btn-primary" style={{ padding: '0.5rem 1.15rem', fontSize: '0.9rem' }}>
              Begin Adventure
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
            padding: '4.5rem 1.5rem 3.5rem',
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
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={14} />
            <span>The Adventurer&apos;s Productivity Operating System</span>
          </div>

          {/* H1 Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              maxWidth: '900px',
              marginBottom: '1.5rem',
              lineHeight: 1.15,
            }}
          >
            Your Life is the Game.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
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
            <Link to="/register" className="rpg-btn rpg-btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '1.05rem' }}>
              Begin Your Adventure — Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="rpg-btn rpg-btn-secondary" style={{ padding: '0.85rem 1.85rem', fontSize: '1.05rem' }}>
              Enter the Citadel
            </Link>
          </div>

          {/* INTERACTIVE HERO QUEST SIMULATOR */}
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
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
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Interactive Simulator Preview
                </span>
                <span className="rpg-badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  Live Demo
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-xp)', fontWeight: 700 }}>{demoXp} XP</span>
                <span style={{ color: 'var(--color-gold)', fontWeight: 700 }}>{demoGold} Gold</span>
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
                backgroundColor: isDemoCompleted ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface-elevated)',
                border: isDemoCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
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
                    backgroundColor: isDemoCompleted ? '#10b981' : 'var(--bg-surface-sunken)',
                    border: isDemoCompleted ? '1px solid #10b981' : '2px solid var(--border-strong)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isDemoCompleted ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isDemoCompleted ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
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
                    <span className="rpg-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                      🧠 Intellect
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Difficulty: Medium</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="rpg-badge rpg-btn-gold" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                  +65 XP
                </span>
              </div>
            </div>

            {/* Micro Feedback celebration message */}
            {showCelebration ? (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
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
              <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                👆 Click the checkmark above to test the tactile dopamine loop.
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
            padding: '5rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="rpg-label" style={{ color: '#38bdf8' }}>The Gameplay Loop</span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem' }}>
              How Life RPG Transforms Your Routine
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                <div key={item.step} className="rpg-card" style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1.25rem',
                      fontSize: '1.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {item.step}
                  </div>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: `${item.color}18`,
                      border: `1px solid ${item.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Icon size={22} color={item.color} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.6rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
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
            padding: '5rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="rpg-label" style={{ color: '#a855f7' }}>Character Development</span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem' }}>
              Master the 5 Real-World Disciplines
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0.75rem auto 0' }}>
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
              { name: 'Intellect', icon: Brain, color: 'var(--attr-intellect)', tasks: 'Coding · Logic · System Design · Languages' },
              { name: 'Strength', icon: Dumbbell, color: 'var(--attr-strength)', tasks: 'Gym · Calisthenics · Running · Conditioning' },
              { name: 'Wisdom', icon: BookOpen, color: 'var(--attr-wisdom)', tasks: 'Reading · Research · Reflection · Strategy' },
              { name: 'Charisma', icon: Sparkles, color: 'var(--attr-charisma)', tasks: 'Public Speaking · Teamwork · Mentorship' },
              { name: 'Vitality', icon: Heart, color: 'var(--attr-vitality)', tasks: 'Sleep · Nutrition · Mindfulness · Hydration' },
            ].map(disc => {
              const Icon = disc.icon;
              return (
                <div key={disc.name} className="rpg-card rpg-card-hover">
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: `${disc.color}15`,
                      border: `1px solid ${disc.color}35`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <Icon size={20} color={disc.color} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: disc.color }}>{disc.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    {disc.tasks}
                  </p>
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
            padding: '5rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '16px',
              padding: '3rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.08)',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Database size={28} color="#38bdf8" />
            </div>

            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              Authentic Cloud Persistence. No Fake Local Storage.
            </h2>

            <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Many productivity demos fake progression using browser localStorage that disappears on another device. 
              Life RPG uses an enterprise-grade <strong>PostgreSQL</strong> relational database with atomic transactions, 
              ensuring your hard-earned XP, streak records, and armory inventory are permanently preserved.
            </p>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                <Check size={18} /> Cross-Device Synchronization
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                <Check size={18} /> Anti-Cheat Server Validation
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                <Check size={18} /> Refresh-Proof State Integrity
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: FAQ ACCORDION */}
        <section
          id="faq"
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '5rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="rpg-label" style={{ color: '#f59e0b' }}>Questions & Answers</span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                    backgroundColor: 'var(--bg-surface)',
                    border: isOpen ? '1px solid var(--border-strong)' : '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem',
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
                        padding: '0 1.25rem 1.25rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: '0.75rem',
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
            padding: '4rem 1.5rem 6rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              padding: '3rem 2rem',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>
              Ready to Forge Your Legendary Character?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
              Join thousands of adventurers translating mundane tasks into epic levels and daily momentum.
            </p>
            <Link to="/register" className="rpg-btn rpg-btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1.1rem' }}>
              Forge Character Now <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* SEMANTIC FOOTER */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-sunken)',
          padding: '2.5rem 1.5rem',
          color: 'var(--text-tertiary)',
          fontSize: '0.85rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} color="#38bdf8" />
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Life RPG</span>
            <span>&copy; {new Date().getFullYear()} — Built for the Hackathon</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Citadel Login</Link>
            <Link to="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>New Character</Link>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981' }}>
              <Lock size={12} /> Secure Session Auth
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
