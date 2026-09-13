import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAdminUsers, grantUserEconomy } from '../../services/api/admin';
import type { AdminUserListItem } from '../../types/contract';
import { 
  Users, 
  Search, 
  Gift, 
  Coins, 
  Zap, 
  ShieldAlert, 
  Check, 
  X, 
  Loader2, 
  Sparkles,
  Award,
  Crown,
  Flame,
  Copy,
  RefreshCw,
  LayoutGrid,
  List,
  ArrowUpDown
} from 'lucide-react';

type RoleFilter = 'all' | 'admins' | 'monarchs' | 'streaks';
type SortField = 'level' | 'xp' | 'coins' | 'streak' | 'name';
type ViewMode = 'grid' | 'list';

export const UsersEconomyTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Filters, Sorting & View
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [sortBy, setSortBy] = useState<SortField>('level');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // Modal ESC handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedUser) {
        handleCloseGrantModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUser]);

  // Derive Real KPIs from Authoritative Database Data
  const stats = useMemo(() => {
    let totalXp = 0;
    let totalCoins = 0;
    let activeStreaks = 0;
    let adminsCount = 0;

    users.forEach((u) => {
      const char = u.character;
      const xp = char?.totalXp ?? u.totalXp ?? 0;
      const coins = char?.gold ?? u.coins ?? u.gold ?? 0;
      const streak = char?.streakCurrent ?? u.streakCurrent ?? 0;

      totalXp += xp;
      totalCoins += coins;
      if (streak > 0) activeStreaks++;
      if (u.role === 'ADMIN') adminsCount++;
    });

    return {
      totalAdventurers: totalCount || users.length,
      totalXp,
      totalCoins,
      activeStreaks,
      adminsCount,
    };
  }, [users, totalCount]);

  // Filter & Sort
  const processedUsers = useMemo(() => {
    let result = [...users];

    // Role filter
    if (roleFilter === 'admins') {
      result = result.filter(u => u.role === 'ADMIN');
    } else if (roleFilter === 'monarchs') {
      result = result.filter(u => !!(u.title || u.character?.title));
    } else if (roleFilter === 'streaks') {
      result = result.filter(u => (u.character?.streakCurrent ?? u.streakCurrent ?? 0) > 0);
    }

    // Sort
    result.sort((a, b) => {
      const aChar = a.character;
      const bChar = b.character;

      if (sortBy === 'level') {
        const aLvl = aChar?.level ?? a.level ?? 1;
        const bLvl = bChar?.level ?? b.level ?? 1;
        return bLvl - aLvl;
      }
      if (sortBy === 'xp') {
        const aXp = aChar?.totalXp ?? a.totalXp ?? 0;
        const bXp = bChar?.totalXp ?? b.totalXp ?? 0;
        return bXp - aXp;
      }
      if (sortBy === 'coins') {
        const aGold = aChar?.gold ?? a.coins ?? a.gold ?? 0;
        const bGold = bChar?.gold ?? b.coins ?? b.gold ?? 0;
        return bGold - aGold;
      }
      if (sortBy === 'streak') {
        const aStr = aChar?.streakCurrent ?? a.streakCurrent ?? 0;
        const bStr = bChar?.streakCurrent ?? b.streakCurrent ?? 0;
        return bStr - aStr;
      }
      if (sortBy === 'name') {
        return (a.displayName || '').localeCompare(b.displayName || '');
      }
      return 0;
    });

    return result;
  }, [users, roleFilter, sortBy]);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

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

      setGrantSuccessMsg(res.message || 'Treasury grant successfully dispatched!');

      // Optimistically update list
      const updatedUser = res.user;
      const updatedChar = updatedUser?.character || (res as any).character;

      setUsers(prev =>
        prev.map(u => {
          if (u.id !== selectedUser.id) return u;
          const newLevel = updatedChar?.level ?? updatedUser?.level ?? u.character?.level ?? u.level ?? 1;
          const newTotalXp = updatedChar?.totalXp ?? updatedUser?.totalXp ?? ((u.character?.totalXp ?? u.totalXp ?? 0) + Number(grantXp));
          const newGold = updatedChar?.gold ?? updatedUser?.coins ?? updatedUser?.gold ?? ((u.character?.gold ?? u.coins ?? u.gold ?? 0) + Number(grantGold));
          const newStreak = updatedChar?.streakCurrent ?? updatedUser?.streakCurrent ?? u.character?.streakCurrent ?? u.streakCurrent ?? 0;
          const newTitle = grantTitle.trim() || updatedUser?.title || u.title || updatedChar?.title || null;

          return {
            ...u,
            ...(updatedUser || {}),
            title: newTitle,
            level: newLevel,
            totalXp: newTotalXp,
            coins: newGold,
            gold: newGold,
            streakCurrent: newStreak,
            character: {
              level: newLevel,
              totalXp: newTotalXp,
              gold: newGold,
              streakCurrent: newStreak,
              title: newTitle,
            },
          };
        })
      );

      setTimeout(() => {
        handleCloseGrantModal();
        void fetchUsers(searchQuery);
      }, 1000);
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to grant rewards to user.');
    } finally {
      setIsSubmittingGrant(false);
    }
  };

  return (
    <div className="cmd-center-container">
      {/* 1. Page Hero Banner */}
      <section className="cmd-hero-panel">
        <div className="cmd-hero-title-group">
          <div className="cmd-hero-badge-tag">
            <span className="cmd-live-dot" />
            <span>Authoritative Command HUD</span>
          </div>
          <h2 className="cmd-hero-heading">
            <Users size={24} color="#38bdf8" />
            <span>Heroes & Economy Management ({totalCount})</span>
          </h2>
          <p className="cmd-hero-sub">
            Inspect real PostgreSQL database players and authoritatively grant XP, Coins, or Titles.
          </p>
        </div>

        <div className="cmd-hero-quick-status">
          <div className="cmd-status-pill">
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>DATABASE:</span>
            <span>PostgreSQL Active</span>
          </div>
        </div>
      </section>

      {/* 2. Admin KPI Overview Deck */}
      <section aria-label="Citadel KPI Metrics" className="cmd-kpi-grid">
        {/* Total Users */}
        <div className="cmd-kpi-card" style={{ '--kpi-accent': '#38bdf8', '--kpi-shadow': 'rgba(56, 189, 248, 0.2)' } as React.CSSProperties}>
          <div className="cmd-kpi-header">
            <span className="cmd-kpi-label">Total Adventurers</span>
            <div className="cmd-kpi-icon-box" style={{ '--kpi-icon-bg': 'rgba(56, 189, 248, 0.12)', '--kpi-icon-border': 'rgba(56, 189, 248, 0.3)', '--kpi-icon-color': '#38bdf8' } as React.CSSProperties}>
              <Users size={18} />
            </div>
          </div>
          <div className="cmd-kpi-value-row">
            <span className="cmd-kpi-number">{stats.totalAdventurers.toLocaleString()}</span>
          </div>
          <span className="cmd-kpi-subtext">Registered in Realm</span>
        </div>

        {/* Total Server XP */}
        <div className="cmd-kpi-card" style={{ '--kpi-accent': '#a855f7', '--kpi-shadow': 'rgba(168, 85, 247, 0.2)' } as React.CSSProperties}>
          <div className="cmd-kpi-header">
            <span className="cmd-kpi-label">Total Server XP</span>
            <div className="cmd-kpi-icon-box" style={{ '--kpi-icon-bg': 'rgba(168, 85, 247, 0.12)', '--kpi-icon-border': 'rgba(168, 85, 247, 0.3)', '--kpi-icon-color': '#c084fc' } as React.CSSProperties}>
              <Zap size={18} />
            </div>
          </div>
          <div className="cmd-kpi-value-row">
            <span className="cmd-kpi-number" style={{ color: '#e9d5ff' }}>{stats.totalXp.toLocaleString()}</span>
          </div>
          <span className="cmd-kpi-subtext">Earned by Adventurers</span>
        </div>

        {/* Treasury Coins */}
        <div className="cmd-kpi-card" style={{ '--kpi-accent': '#fbbf24', '--kpi-shadow': 'rgba(251, 191, 36, 0.2)' } as React.CSSProperties}>
          <div className="cmd-kpi-header">
            <span className="cmd-kpi-label">Treasury Coins</span>
            <div className="cmd-kpi-icon-box" style={{ '--kpi-icon-bg': 'rgba(245, 158, 11, 0.12)', '--kpi-icon-border': 'rgba(245, 158, 11, 0.3)', '--kpi-icon-color': '#fbbf24' } as React.CSSProperties}>
              <Coins size={18} />
            </div>
          </div>
          <div className="cmd-kpi-value-row">
            <span className="cmd-kpi-number" style={{ color: '#fef08a' }}>{stats.totalCoins.toLocaleString()}</span>
          </div>
          <span className="cmd-kpi-subtext">Total Gold In Circulation</span>
        </div>

        {/* Active Streaks */}
        <div className="cmd-kpi-card" style={{ '--kpi-accent': '#ef4444', '--kpi-shadow': 'rgba(239, 68, 68, 0.2)' } as React.CSSProperties}>
          <div className="cmd-kpi-header">
            <span className="cmd-kpi-label">Active Streaks</span>
            <div className="cmd-kpi-icon-box" style={{ '--kpi-icon-bg': 'rgba(239, 68, 68, 0.12)', '--kpi-icon-border': 'rgba(239, 68, 68, 0.3)', '--kpi-icon-color': '#fca5a5' } as React.CSSProperties}>
              <Flame size={18} />
            </div>
          </div>
          <div className="cmd-kpi-value-row">
            <span className="cmd-kpi-number" style={{ color: '#fca5a5' }}>{stats.activeStreaks}</span>
          </div>
          <span className="cmd-kpi-subtext">Adventurers with &gt;0 Streak</span>
        </div>

        {/* Admins / Staff */}
        <div className="cmd-kpi-card" style={{ '--kpi-accent': '#c084fc', '--kpi-shadow': 'rgba(192, 132, 252, 0.2)' } as React.CSSProperties}>
          <div className="cmd-kpi-header">
            <span className="cmd-kpi-label">Citadel Staff</span>
            <div className="cmd-kpi-icon-box" style={{ '--kpi-icon-bg': 'rgba(192, 132, 252, 0.12)', '--kpi-icon-border': 'rgba(192, 132, 252, 0.3)', '--kpi-icon-color': '#d8b4fe' } as React.CSSProperties}>
              <Crown size={18} />
            </div>
          </div>
          <div className="cmd-kpi-value-row">
            <span className="cmd-kpi-number" style={{ color: '#d8b4fe' }}>{stats.adminsCount}</span>
          </div>
          <span className="cmd-kpi-subtext">Verified Realm Admins</span>
        </div>
      </section>

      {/* 3. Control Toolbar */}
      <section aria-label="Management Toolbar" className="cmd-toolbar">
        <div className="cmd-toolbar-left">
          {/* Search Input */}
          <div className="cmd-search-wrapper">
            <Search size={16} className="cmd-search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cmd-search-input"
              aria-label="Search adventurers"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="cmd-search-clear"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Role Filter Pills */}
          <div className="cmd-filter-pill-group" role="tablist" aria-label="Filter Adventurers">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`cmd-filter-pill ${roleFilter === 'all' ? 'active' : ''}`}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('admins')}
              className={`cmd-filter-pill ${roleFilter === 'admins' ? 'active' : ''}`}
            >
              Admins
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('monarchs')}
              className={`cmd-filter-pill ${roleFilter === 'monarchs' ? 'active' : ''}`}
            >
              Titles
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('streaks')}
              className={`cmd-filter-pill ${roleFilter === 'streaks' ? 'active' : ''}`}
            >
              Streaks
            </button>
          </div>
        </div>

        <div className="cmd-toolbar-right">
          {/* Sorting Dropdown */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowUpDown size={14} color="#94a3b8" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="cmd-select-dropdown"
              aria-label="Sort adventurers"
            >
              <option value="level">Level (High → Low)</option>
              <option value="xp">Total XP (High → Low)</option>
              <option value="coins">Coins (High → Low)</option>
              <option value="streak">Streak (Highest)</option>
              <option value="name">Name (A → Z)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'inline-flex', gap: '0.3rem' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`cmd-action-icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid View"
              aria-label="Switch to Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`cmd-action-icon-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="Compact List View"
              aria-label="Switch to List View"
            >
              <List size={16} />
            </button>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => void fetchUsers(searchQuery)}
            disabled={isLoading}
            className="cmd-action-icon-btn"
            title="Refresh database"
            aria-label="Refresh player database"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </section>

      {/* Error Banner */}
      {errorText && (
        <div className="cmd-error-banner" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <ShieldAlert size={18} />
            <span>{errorText}</span>
          </div>
          <button
            type="button"
            onClick={() => void fetchUsers(searchQuery)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Main Adventurers Content */}
      {isLoading ? (
        <div className="cmd-adventurers-grid">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="cmd-skeleton-card">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="cmd-skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div className="cmd-skeleton" style={{ width: '60%', height: 16 }} />
                  <div className="cmd-skeleton" style={{ width: '80%', height: 12 }} />
                </div>
              </div>
              <div className="cmd-skeleton" style={{ width: '100%', height: 60, marginTop: 'auto' }} />
              <div className="cmd-skeleton" style={{ width: '100%', height: 36 }} />
            </div>
          ))}
        </div>
      ) : processedUsers.length === 0 ? (
        <div className="cmd-empty-state">
          <div className="cmd-empty-icon">
            <Users size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.35rem 0' }}>
              No Adventurers Found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0, maxWidth: '400px' }}>
              {searchQuery
                ? `No players matched the search "${searchQuery}". Try searching by another name, email, or user ID.`
                : 'No players currently match the selected role filter.'}
            </p>
          </div>
          {(searchQuery || roleFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="cmd-adventurers-grid">
          {processedUsers.map((u) => {
            const isAdmin = u.role === 'ADMIN';
            const char = u.character;
            const level = char?.level ?? u.level ?? 1;
            const totalXp = char?.totalXp ?? u.totalXp ?? 0;
            const coins = char?.gold ?? u.coins ?? u.gold ?? 0;
            const streak = char?.streakCurrent ?? u.streakCurrent ?? 0;
            const title = u.title || char?.title;
            const initials = (u.displayName || 'Hero')
              .split(' ')
              .map(n => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            // Computed visual progress indicator
            const xpPercent = Math.min(100, Math.max(8, Math.round(((totalXp % 500) / 500) * 100)));

            return (
              <article
                key={u.id}
                className={`cmd-user-card ${isAdmin ? 'is-admin' : ''}`}
              >
                {/* 1. Identity Header */}
                <div className="cmd-card-identity">
                  <div className="cmd-card-avatar">
                    {initials}
                  </div>

                  <div className="cmd-identity-info">
                    <div className="cmd-name-row">
                      <span className="cmd-player-name" title={u.displayName}>
                        {u.displayName || 'Anonymous Hero'}
                      </span>
                      {isAdmin && (
                        <span className="cmd-role-badge admin">
                          <Crown size={11} />
                          ADMIN
                        </span>
                      )}
                    </div>

                    {title && (
                      <div className="cmd-hero-title-tag">
                        <Award size={12} color="#fbbf24" />
                        <span>{title}</span>
                      </div>
                    )}

                    <div className="cmd-player-email" title={u.email}>
                      {u.email}
                    </div>

                    {/* Monospace Copyable ID Chip */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(u.id, e)}
                      className="cmd-id-chip"
                      title="Click to copy full ID"
                      aria-label={`Copy user ID ${u.id}`}
                    >
                      <Copy size={11} />
                      <span>ID: {u.id.slice(0, 8)}...</span>
                      {copiedId === u.id && (
                        <span className="cmd-copy-toast">Copied!</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Progression HUD Block */}
                <div className="cmd-progression-hud">
                  <div className="cmd-stats-columns">
                    <div className="cmd-stat-block">
                      <span className="cmd-stat-label">Level</span>
                      <span className="cmd-stat-val level">{level}</span>
                    </div>

                    <div className="cmd-stat-block">
                      <span className="cmd-stat-label">
                        <Zap size={11} color="#c084fc" />
                        <span>Total XP</span>
                      </span>
                      <span className="cmd-stat-val xp">{totalXp.toLocaleString()}</span>
                    </div>

                    <div className="cmd-stat-block">
                      <span className="cmd-stat-label">
                        <Coins size={11} color="#fbbf24" />
                        <span>Coins</span>
                      </span>
                      <span className="cmd-stat-val coins">{coins.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="cmd-card-xp-bar" title={`XP Progression towards Tier Mastery (${xpPercent}%)`}>
                    <div className="cmd-card-xp-fill" style={{ width: `${xpPercent}%` }} />
                  </div>
                </div>

                {/* 3. Footer Actions & Streak */}
                <div className="cmd-card-footer">
                  <span className={`cmd-streak-badge ${streak === 0 ? 'zero' : ''}`}>
                    <Flame size={13} />
                    <span>Streak: {streak}d</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenGrantModal(u)}
                    className="cmd-btn-grant"
                    aria-label={`Grant economy rewards to ${u.displayName}`}
                  >
                    <Gift size={14} className="cmd-btn-grant-icon" />
                    <span>Grant Economy</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* COMPACT LIST VIEW */
        <div className="cmd-list-view">
          {processedUsers.map((u) => {
            const isAdmin = u.role === 'ADMIN';
            const char = u.character;
            const level = char?.level ?? u.level ?? 1;
            const totalXp = char?.totalXp ?? u.totalXp ?? 0;
            const coins = char?.gold ?? u.coins ?? u.gold ?? 0;
            const streak = char?.streakCurrent ?? u.streakCurrent ?? 0;
            const title = u.title || char?.title;

            return (
              <div key={u.id} className="cmd-list-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>
                        {u.displayName || 'Anonymous Hero'}
                      </span>
                      {isAdmin && (
                        <span className="cmd-role-badge admin">
                          ADMIN
                        </span>
                      )}
                      {title && (
                        <span className="cmd-hero-title-tag" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                          {title}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      {u.email} · ID: {u.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                <div className="cmd-list-stats-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Level</div>
                    <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1rem' }}>{level}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Total XP</div>
                    <div style={{ color: '#c084fc', fontWeight: 800, fontSize: '1rem' }}>{totalXp.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Coins</div>
                    <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1rem' }}>{coins.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Streak</div>
                    <div style={{ color: '#fca5a5', fontWeight: 800, fontSize: '1rem' }}>{streak}d</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenGrantModal(u)}
                    className="cmd-btn-grant"
                    style={{ padding: '0.45rem 0.85rem' }}
                  >
                    <Gift size={13} />
                    <span>Grant</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Futuristic Grant Economy Action Dialog */}
      {selectedUser && (
        <div
          className="cmd-modal-backdrop"
          onClick={handleCloseGrantModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="grant-modal-title"
        >
          <div
            className="cmd-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cmd-sheet-drag-handle" />
            {/* Close Trigger */}
            <button
              type="button"
              onClick={handleCloseGrantModal}
              className="cmd-modal-close"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="cmd-modal-header">
              <div className="cmd-modal-tag">
                <Sparkles size={14} />
                <span>Citadel Treasury Dispatch</span>
              </div>
              <h3 id="grant-modal-title" className="cmd-modal-title">
                Grant Rewards to {selectedUser.displayName}
              </h3>
              <p className="cmd-modal-recipient">
                Recipient: <code>{selectedUser.email}</code>
              </p>
            </div>

            {grantSuccessMsg ? (
              <div
                style={{
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '14px',
                  color: '#10b981',
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <Check size={28} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc' }}>
                  Grant Dispatched!
                </div>
                <div style={{ fontSize: '0.88rem', marginTop: '0.35rem', color: '#a7f3d0' }}>
                  {grantSuccessMsg}
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteGrant} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* XP Input & Presets */}
                <div className="cmd-form-group">
                  <div className="cmd-form-label-row">
                    <label htmlFor="grant-xp-input" className="cmd-form-label">
                      <Zap size={14} color="#c084fc" />
                      <span>Experience Points (XP)</span>
                    </label>
                    <span className="cmd-form-current">
                      Current: {(selectedUser.character?.totalXp ?? (selectedUser as any).totalXp ?? 0).toLocaleString()}
                    </span>
                  </div>

                  <input
                    id="grant-xp-input"
                    type="number"
                    value={grantXp}
                    onChange={(e) => setGrantXp(Number(e.target.value))}
                    min={0}
                    max={100000}
                    className="cmd-form-input"
                    required
                  />

                  <div className="cmd-presets-row">
                    {[100, 500, 1000, 2500].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setGrantXp(val)}
                        className={`cmd-preset-btn ${grantXp === val ? 'active xp' : ''}`}
                      >
                        +{val} XP
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gold Input & Presets */}
                <div className="cmd-form-group">
                  <div className="cmd-form-label-row">
                    <label htmlFor="grant-gold-input" className="cmd-form-label">
                      <Coins size={14} color="#fbbf24" />
                      <span>Gold Coins</span>
                    </label>
                    <span className="cmd-form-current">
                      Current: {(selectedUser.character?.gold ?? (selectedUser as any).coins ?? (selectedUser as any).gold ?? 0).toLocaleString()}
                    </span>
                  </div>

                  <input
                    id="grant-gold-input"
                    type="number"
                    value={grantGold}
                    onChange={(e) => setGrantGold(Number(e.target.value))}
                    min={0}
                    max={100000}
                    className="cmd-form-input"
                    required
                  />

                  <div className="cmd-presets-row">
                    {[50, 100, 250, 1000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setGrantGold(val)}
                        className={`cmd-preset-btn ${grantGold === val ? 'active gold' : ''}`}
                      >
                        +{val} G
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Title Input */}
                <div className="cmd-form-group">
                  <div className="cmd-form-label-row">
                    <label htmlFor="grant-title-input" className="cmd-form-label">
                      <Award size={14} color="#38bdf8" />
                      <span>Bestow Hero Title / Honor</span>
                    </label>
                    {(selectedUser.title || selectedUser.character?.title) && (
                      <span className="cmd-form-current" style={{ color: '#fbbf24' }}>
                        Active: {selectedUser.title || selectedUser.character?.title}
                      </span>
                    )}
                  </div>

                  <input
                    id="grant-title-input"
                    type="text"
                    placeholder="e.g. Citadel Vanguard, Community Champion"
                    value={grantTitle}
                    onChange={(e) => setGrantTitle(e.target.value)}
                    className="cmd-form-input"
                  />
                </div>

                {/* Modal Form Actions */}
                <div className="cmd-modal-actions">
                  <button
                    type="button"
                    onClick={handleCloseGrantModal}
                    className="cmd-btn-cancel"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingGrant}
                    className="cmd-btn-submit"
                  >
                    {isSubmittingGrant ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Dispatching...</span>
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
