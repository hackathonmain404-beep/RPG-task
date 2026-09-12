import React, { useState, useEffect, useCallback } from 'react';
import { getAdminUsers, grantUserEconomy } from '../../services/api/admin';
import type { AdminUserListItem } from '../../types/contract';
import { 
  Users, 
  Search, 
  Gift, 
  Coins, 
  Zap, 
  ShieldAlert, 
  Calendar, 
  Check, 
  X, 
  Loader2, 
  Sparkles,
  Award,
  Crown
} from 'lucide-react';

export const UsersEconomyTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Grant Modal state
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [grantXp, setGrantXp] = useState<number>(100);
  const [grantGold, setGrantGold] = useState<number>(50);
  const [grantTitle, setGrantTitle] = useState<string>('');
  const [isSubmittingGrant, setIsSubmittingGrant] = useState<boolean>(false);
  const [grantSuccessMsg, setGrantSuccessMsg] = useState<string | null>(null);

  const fetchUsers = useCallback(async (search?: string) => {
    setIsLoading(true);
    setErrorText(null);
    try {
      const res = await getAdminUsers(search);
      setUsers(res.users);
      setTotalCount(res.total);
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to load players from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchUsers]);

  const handleOpenGrantModal = (user: AdminUserListItem) => {
    setSelectedUser(user);
    setGrantXp(100);
    setGrantGold(50);
    setGrantTitle('');
    setGrantSuccessMsg(null);
  };

  const handleCloseGrantModal = () => {
    setSelectedUser(null);
    setIsSubmittingGrant(false);
    setGrantSuccessMsg(null);
  };

  const handleExecuteGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmittingGrant(true);
    setErrorText(null);

    try {
      const res = await grantUserEconomy(selectedUser.id, {
        xp: Number(grantXp) || 0,
        gold: Number(grantGold) || 0,
        title: grantTitle.trim() || undefined,
      });

      setGrantSuccessMsg(res.message);

      // Optimistically update list
      setUsers(prev =>
        prev.map(u => (u.id === selectedUser.id ? { ...u, ...res.user } : u))
      );

      setTimeout(() => {
        handleCloseGrantModal();
      }, 1200);
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to grant rewards to user.');
    } finally {
      setIsSubmittingGrant(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar: Title & Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users size={22} color="#38bdf8" />
            <span>Heroes & Economy Management ({totalCount})</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Inspect real PostgreSQL database players and authoritatively grant XP, Coins, or Titles.
          </p>
        </div>

        {/* Search Field */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {errorText && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShieldAlert size={18} />
          <span>{errorText}</span>
        </div>
      )}

      {/* Hero Cards Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: '#38bdf8' }}>
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
          }}
        >
          No adventurers found matching &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {users.map((u) => {
            const isAdmin = u.role === 'ADMIN';
            const char = u.character;

            return (
              <div
                key={u.id}
                style={{
                  background: isAdmin
                    ? 'linear-gradient(145deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
                    : 'rgba(15, 23, 42, 0.65)',
                  border: isAdmin ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isAdmin ? '0 4px 20px rgba(124, 58, 237, 0.15)' : 'none',
                }}
              >
                {/* User Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>
                        {u.displayName || 'Anonymous Hero'}
                      </span>
                      {isAdmin && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(168, 85, 247, 0.2)',
                            border: '1px solid rgba(168, 85, 247, 0.5)',
                            color: '#c084fc',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                          }}
                        >
                          <Crown size={12} />
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                      {u.email}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#64748b',
                      padding: '0.2rem 0.45rem',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    ID: {u.id.slice(0, 8)}...
                  </span>
                </div>

                {/* Character Stat Pills */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Level</div>
                    <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.15rem' }}>
                      {char ? char.level : 1}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Total XP</div>
                    <div style={{ color: '#a855f7', fontWeight: 800, fontSize: '1.15rem' }}>
                      {char ? char.totalXp : 0}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Coins</div>
                    <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.15rem' }}>
                      {char ? char.gold : 0}
                    </div>
                  </div>
                </div>

                {/* Footer Info & Grant Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} />
                    <span>Streak: {char ? char.streakCurrent : 0}d</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenGrantModal(u)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Gift size={14} />
                    <span>Grant Economy</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* GRANT XP, COINS & TITLE MODAL                                   */}
      {/* -------------------------------------------------------------- */}
      {selectedUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={handleCloseGrantModal}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.15)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseGrantModal}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Title */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Sparkles size={16} />
                <span>Citadel Treasury Dispatch</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                Grant to {selectedUser.displayName}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                Recipient: <code style={{ color: '#e2e8f0' }}>{selectedUser.email}</code>
              </p>
            </div>

            {grantSuccessMsg ? (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '10px',
                  color: '#10b981',
                }}
              >
                <Check size={32} style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Success!</div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{grantSuccessMsg}</div>
              </div>
            ) : (
              <form onSubmit={handleExecuteGrant} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {/* XP Input & Presets */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Zap size={14} color="#a855f7" />
                      <span>Experience Points (XP)</span>
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Current: {selectedUser.character?.totalXp || 0}</span>
                  </div>
                  <input
                    type="number"
                    value={grantXp}
                    onChange={(e) => setGrantXp(Number(e.target.value))}
                    min={0}
                    max={100000}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#f8fafc',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                    {[100, 500, 1000, 2500].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setGrantXp(val)}
                        style={{
                          flex: 1,
                          padding: '0.25rem',
                          borderRadius: '4px',
                          background: grantXp === val ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                          border: grantXp === val ? '1px solid rgba(168, 85, 247, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#e2e8f0',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gold Input & Presets */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Coins size={14} color="#fbbf24" />
                      <span>Gold Coins</span>
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Current: {selectedUser.character?.gold || 0}</span>
                  </div>
                  <input
                    type="number"
                    value={grantGold}
                    onChange={(e) => setGrantGold(Number(e.target.value))}
                    min={0}
                    max={100000}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#f8fafc',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                    {[50, 100, 250, 1000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setGrantGold(val)}
                        style={{
                          flex: 1,
                          padding: '0.25rem',
                          borderRadius: '4px',
                          background: grantGold === val ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                          border: grantGold === val ? '1px solid rgba(251, 191, 36, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#e2e8f0',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Custom Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Award size={14} color="#38bdf8" />
                      <span>Optional Title / Audit Reason</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Citadel Vanguard, Community MVP"
                    value={grantTitle}
                    onChange={(e) => setGrantTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleCloseGrantModal}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#94a3b8',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingGrant}
                    style={{
                      flex: 2,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: isSubmittingGrant ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                    }}
                  >
                    {isSubmittingGrant ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Granting...</span>
                      </>
                    ) : (
                      <>
                        <Gift size={16} />
                        <span>Execute Grant</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
