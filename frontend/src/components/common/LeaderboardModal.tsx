import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RotateCw, X, Star, Zap, Coins } from 'lucide-react';
import { getLeaderboard, type LeaderboardSortBy } from '../../services/api/leaderboard';
import type { LeaderboardResponse, LeaderboardEntry } from '../../types/contract';
import { useAuth } from '../../context/useAuth';
import './leaderboard-modal.css';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>('level');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);

  // Fetch leaderboard data from database
  const fetchLeaderboardData = useCallback(async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    try {
      setError(null);
      const res = await getLeaderboard(sortBy, 50);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Unable to load global rankings. Please try again.');
    } finally {
      setIsLoading(false);
      if (isManualRefresh) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, [sortBy]);

  // Initial fetch and auto-polling every 10 seconds while modal is active
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    void fetchLeaderboardData(false);

    const intervalId = setInterval(() => {
      void fetchLeaderboardData(false);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [isOpen, fetchLeaderboardData]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format metric value depending on active tab
  const getMetricValue = (entry: LeaderboardEntry) => {
    if (sortBy === 'xp') return entry.totalXp.toLocaleString();
    if (sortBy === 'coins') return entry.gold.toLocaleString();
    return entry.level.toString();
  };

  // Avatar helper with fallback letter
  const renderAvatar = (entry: LeaderboardEntry, isPodium: boolean) => {
    const initial = (entry.displayName || 'A').trim().charAt(0).toUpperCase();
    const bgIndex = (entry.displayName || '').charCodeAt(0) % 6;
    const bgClass = `avatar-bg-${bgIndex}`;

    if (entry.avatarUrl) {
      return (
        <img
          src={entry.avatarUrl}
          alt={entry.displayName}
          className={isPodium ? 'podium-avatar-img' : 'leaderboard-row-avatar'}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            (e.target as HTMLElement).style.display = 'none';
            const placeholder = (e.target as HTMLElement).nextElementSibling as HTMLElement;
            if (placeholder) placeholder.style.display = 'flex';
          }}
        />
      );
    }

    return (
      <div className={`${isPodium ? 'podium-avatar-placeholder' : 'leaderboard-row-placeholder'} ${bgClass}`}>
        {initial}
      </div>
    );
  };

  const rank1 = data?.leaderboard.find(x => x.rank === 1);
  const rank2 = data?.leaderboard.find(x => x.rank === 2);
  const rank3 = data?.leaderboard.find(x => x.rank === 3);
  const remainingRows = data?.leaderboard.filter(x => x.rank > 3) || [];

  return (
    <div
      className="leaderboard-overlay"
      onClick={(e) => {
        if (modalCardRef.current && !modalCardRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-modal-title"
    >
      <div ref={modalCardRef} className="leaderboard-card">
        {/* Modal Header */}
        <div className="leaderboard-header">
          <div className="leaderboard-header-left">
            <div className="leaderboard-trophy-badge" aria-hidden="true">
              <Trophy size={22} color="#fbbf24" />
            </div>
            <div className="leaderboard-title-group">
              <h2 id="leaderboard-modal-title" className="leaderboard-title">Leaderboard</h2>
              <span className="leaderboard-subtitle">Global Rankings</span>
            </div>
          </div>

          <div className="leaderboard-header-actions">
            <button
              type="button"
              className="leaderboard-icon-btn"
              onClick={() => fetchLeaderboardData(true)}
              disabled={isRefreshing}
              title="Refresh Leaderboard"
              aria-label="Refresh Leaderboard"
            >
              <RotateCw size={18} className={isRefreshing ? 'spin-animation' : ''} />
            </button>
            <button
              type="button"
              className="leaderboard-icon-btn"
              onClick={onClose}
              title="Close Leaderboard"
              aria-label="Close Leaderboard"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="leaderboard-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={sortBy === 'level'}
            className={`leaderboard-tab-btn ${sortBy === 'level' ? 'active-level' : ''}`}
            onClick={() => setSortBy('level')}
          >
            <Star size={15} fill={sortBy === 'level' ? '#fbbf24' : 'none'} />
            <span>Level</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={sortBy === 'xp'}
            className={`leaderboard-tab-btn ${sortBy === 'xp' ? 'active-xp' : ''}`}
            onClick={() => setSortBy('xp')}
          >
            <Zap size={15} fill={sortBy === 'xp' ? '#38bdf8' : 'none'} />
            <span>XP</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={sortBy === 'coins'}
            className={`leaderboard-tab-btn ${sortBy === 'coins' ? 'active-coins' : ''}`}
            onClick={() => setSortBy('coins')}
          >
            <Coins size={15} />
            <span>Coins</span>
          </button>
        </div>

        {/* Top 3 Podium */}
        {data && (
          <div className="leaderboard-podium">
            {/* 2ND Place (Left) */}
            <div className="podium-card podium-card-rank-2">
              <div className="podium-avatar-wrapper">
                {rank2 && renderAvatar(rank2, true)}
                <span className="podium-badge podium-badge-2">2</span>
              </div>
              <div className="podium-name" title={rank2?.displayName || '—'}>
                {rank2?.displayName || '—'}
              </div>
              <div>
                <div className="podium-stat-val">
                  {rank2 ? getMetricValue(rank2) : '—'}
                </div>
                <div className="podium-rank-label">2ND</div>
              </div>
            </div>

            {/* 1ST Place (Center, Elevated & Glowing) */}
            <div className="podium-card podium-card-rank-1">
              <div className="podium-avatar-wrapper">
                {rank1 && renderAvatar(rank1, true)}
                <span className="podium-badge podium-badge-1">1</span>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="podium-name" title={rank1?.displayName || '—'}>
                  {rank1?.displayName || '—'}
                </div>
                {rank1?.role === 'ADMIN' && (
                  <span className="podium-admin-pill">Admin</span>
                )}
              </div>
              <div>
                <div className="podium-stat-val">
                  {rank1 ? getMetricValue(rank1) : '—'}
                </div>
                <div className="podium-rank-label">1ST</div>
              </div>
            </div>

            {/* 3RD Place (Right) */}
            <div className="podium-card podium-card-rank-3">
              <div className="podium-avatar-wrapper">
                {rank3 && renderAvatar(rank3, true)}
                <span className="podium-badge podium-badge-3">3</span>
              </div>
              <div className="podium-name" title={rank3?.displayName || '—'}>
                {rank3?.displayName || '—'}
              </div>
              <div>
                <div className="podium-stat-val">
                  {rank3 ? getMetricValue(rank3) : '—'}
                </div>
                <div className="podium-rank-label">3RD</div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable List for Ranks #4 and onwards */}
        <div className="leaderboard-list-container">
          {isLoading && !data ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              <RotateCw size={24} className="spin-animation" style={{ margin: '0 auto 0.75rem auto' }} />
              <div>Fetching global rankings...</div>
            </div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
              {error}
            </div>
          ) : remainingRows.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              All registered adventurers are featured on the podium.
            </div>
          ) : (
            remainingRows.map((entry) => {
              const isCurrentUser = user && entry.userId === user.id;
              // Progress bar fill: level progress percentage or relative xp/coin bar
              const fillPercent = Math.max(6, Math.min(100, entry.progressPercent || 10));

              return (
                <div
                  key={entry.userId}
                  className={`leaderboard-row ${isCurrentUser ? 'is-current-user' : ''}`}
                >
                  <span className="leaderboard-row-rank">#{entry.rank}</span>
                  {renderAvatar(entry, false)}
                  <div className="leaderboard-row-info">
                    <div className="leaderboard-row-top">
                      <span className="leaderboard-row-name" title={entry.displayName}>
                        {entry.displayName}
                      </span>
                      {entry.role === 'ADMIN' && (
                        <span className="podium-admin-pill" style={{ margin: 0, padding: '0.05rem 0.35rem' }}>
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="leaderboard-progress-track">
                      <div
                        className="leaderboard-progress-bar"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>
                  <span className="leaderboard-row-value">{getMetricValue(entry)}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Sticky Footer */}
        <div className="leaderboard-footer">
          <p className="leaderboard-footer-text">
            {data?.currentUserRank ? (
              <>
                You are ranked{' '}
                <span className="leaderboard-footer-highlight">
                  #{data.currentUserRank.rank}
                </span>{' '}
                globally by {sortBy}
              </>
            ) : user ? (
              <>
                You are ranked{' '}
                <span className="leaderboard-footer-highlight">#1</span> globally by {sortBy}
              </>
            ) : (
              'Sign in to claim your place on the global leaderboard'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
