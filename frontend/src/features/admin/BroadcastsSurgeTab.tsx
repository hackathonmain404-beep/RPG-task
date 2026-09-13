import React, { useState, useEffect, useCallback } from 'react';
import { 
  getAdminBroadcast, 
  setAdminBroadcast, 
  dismissAdminBroadcast,
  getAdminSurgeStatus,
  startSurgeEvent,
  endSurgeEvent
} from '../../services/api/admin';
import type { Broadcast, SurgeStatus } from '../../types/contract';
import { 
  Radio, 
  Flame, 
  Megaphone, 
  Clock, 
  Check, 
  X, 
  Loader2, 
  AlertTriangle,
  Info,
  PartyPopper,
  Sparkles
} from 'lucide-react';

export const BroadcastsSurgeTab: React.FC = () => {
  // Broadcast State
  const [activeBroadcast, setActiveBroadcast] = useState<Broadcast | null>(null);
  const [broadcastType, setBroadcastType] = useState<'EVENT' | 'INFO' | 'ALERT' | 'PARTY'>('EVENT');
  const [broadcastMsg, setBroadcastMsg] = useState<string>('');
  const [actionText, setActionText] = useState<string>('');
  const [actionUrl, setActionUrl] = useState<string>('');
  const [expiryMinutes, setExpiryMinutes] = useState<number>(120);
  const [isPublishingBroadcast, setIsPublishingBroadcast] = useState<boolean>(false);
  const [isDismissingBroadcast, setIsDismissingBroadcast] = useState<boolean>(false);
  const [broadcastStatusMsg, setBroadcastStatusMsg] = useState<string | null>(null);

  // Surge State
  const [surgeStatus, setSurgeStatus] = useState<SurgeStatus | null>(null);
  const [selectedHours, setSelectedHours] = useState<number>(2);
  const [isTogglingSurge, setIsTogglingSurge] = useState<boolean>(false);
  const [surgeStatusMsg, setSurgeStatusMsg] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const fetchStatus = useCallback(async () => {
    try {
      const [bRes, sRes] = await Promise.all([
        getAdminBroadcast(),
        getAdminSurgeStatus(),
      ]);
      setActiveBroadcast(bRes.broadcast);
      setSurgeStatus(sRes.surge);
      setRemainingSeconds(sRes.surge.remainingSeconds || 0);
    } catch (err: any) {
      console.error('Failed to fetch broadcast/surge status:', err);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
    const interval = setInterval(() => {
      void fetchStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Surge countdown timer ticker
  useEffect(() => {
    if (!surgeStatus?.active || remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          void fetchStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [surgeStatus?.active, remainingSeconds, fetchStatus]);

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Publish Broadcast Handler
  const handlePublishBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;

    setIsPublishingBroadcast(true);
    setBroadcastStatusMsg(null);

    try {
      const res = await setAdminBroadcast({
        type: broadcastType,
        message: broadcastMsg.trim(),
        actionText: actionText.trim() || undefined,
        actionUrl: actionUrl.trim() || undefined,
        expiresInMinutes: expiryMinutes || undefined,
      });

      setActiveBroadcast(res.broadcast);
      setBroadcastStatusMsg('Platform broadcast successfully published live to all adventurers!');
      setTimeout(() => setBroadcastStatusMsg(null), 3500);
    } catch (err: any) {
      setBroadcastStatusMsg(`Error: ${err?.message || 'Failed to set broadcast'}`);
    } finally {
      setIsPublishingBroadcast(false);
    }
  };

  // Dismiss Broadcast Handler
  const handleDismissBroadcast = async () => {
    setIsDismissingBroadcast(true);
    try {
      await dismissAdminBroadcast();
      setActiveBroadcast(null);
      setBroadcastStatusMsg('Active broadcast dismissed from player screens.');
      setTimeout(() => setBroadcastStatusMsg(null), 3500);
    } catch (err: any) {
      setBroadcastStatusMsg(`Error: ${err?.message || 'Failed to dismiss broadcast'}`);
    } finally {
      setIsDismissingBroadcast(false);
    }
  };

  // Ignite / End Surge Handler
  const handleToggleSurge = async () => {
    setIsTogglingSurge(true);
    setSurgeStatusMsg(null);

    try {
      if (surgeStatus?.active) {
        await endSurgeEvent();
        setSurgeStatusMsg('2X Surge event halted.');
      } else {
        const res = await startSurgeEvent(selectedHours);
        setSurgeStatus(res.surge);
        setRemainingSeconds(res.surge.remainingSeconds || selectedHours * 3600);
        setSurgeStatusMsg(`Global 2X Surge activated for ${selectedHours} hours!`);
      }
      await fetchStatus();
      setTimeout(() => setSurgeStatusMsg(null), 3500);
    } catch (err: any) {
      setSurgeStatusMsg(`Error: ${err?.message || 'Failed to update surge event'}`);
    } finally {
      setIsTogglingSurge(false);
    }
  };

  // Color helpers
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EVENT': return '#c084fc';
      case 'ALERT': return '#ef4444';
      case 'PARTY': return '#10b981';
      case 'INFO':
      default: return '#38bdf8';
    }
  };

  return (
    <div className="cmd-center-container">
      {/* 1. Page Hero Banner */}
      <section className="cmd-hero-panel" aria-label="Broadcast Center Hero">
        <div className="cmd-hero-title-group">
          <div className="cmd-hero-badge-tag">
            <span className="cmd-live-dot" />
            <span>
              {activeBroadcast?.active 
                ? 'BROADCAST SYSTEM ● 1 ACTIVE BANNER' 
                : 'BROADCAST SYSTEM ● READY'}
            </span>
          </div>
          <h2 className="cmd-hero-heading">
            <Megaphone size={24} color="#38bdf8" />
            <span>BROADCAST CENTER</span>
          </h2>
          <p className="cmd-hero-sub">
            Reach every adventurer across the realm. Create and publish real-time announcements to active players.
          </p>
        </div>

        <div className="cmd-hero-quick-status">
          <div className="cmd-status-pill">
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>ENGINE:</span>
            <span>WebSocket Live Broadcast</span>
          </div>
          <div className="cmd-status-pill">
            <span style={{ color: surgeStatus?.active ? '#f97316' : '#94a3b8', fontWeight: 700 }}>SURGE:</span>
            <span>{surgeStatus?.active ? '2.0X Active' : '1.0X Standby'}</span>
          </div>
        </div>
      </section>

      {/* 2. Main 2-Column Command Center Grid */}
      <div className="cmd-broadcast-surge-grid">
        {/* ============================================================== */}
        {/* LEFT COLUMN: BROADCAST COMPOSER (50%)                          */}
        {/* ============================================================== */}
        <div className="cmd-panel-card">
          <div className="cmd-panel-header">
            <div>
              <div className="cmd-panel-title">
                <Radio size={20} color="#38bdf8" />
                <span>Broadcast Composer</span>
              </div>
              <p className="cmd-panel-sub">
                Dispatch system alerts and announcements straight to active player screens.
              </p>
            </div>
            {activeBroadcast?.active && (
              <span className="cmd-badge-role admin">
                <span className="cmd-live-dot" style={{ width: 6, height: 6, marginRight: 4 }} />
                1 ACTIVE
              </span>
            )}
          </div>

          {/* Feedback message banner */}
          {broadcastStatusMsg && (
            <div
              className={`cmd-alert-banner ${broadcastStatusMsg.startsWith('Error') ? 'error' : ''}`}
              style={{
                background: broadcastStatusMsg.startsWith('Error') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                borderColor: broadcastStatusMsg.startsWith('Error') ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)',
                color: broadcastStatusMsg.startsWith('Error') ? '#fca5a5' : '#10b981',
                borderRadius: 10,
                padding: '0.75rem 1rem',
              }}
            >
              <Check size={16} />
              <span>{broadcastStatusMsg}</span>
            </div>
          )}

          {/* Active Broadcast Quick Card */}
          {activeBroadcast && activeBroadcast.active && (
            <div
              style={{
                padding: '0.85rem 1.15rem',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                  <span>LIVE PLATFORM BANNER ACTIVE</span>
                </div>
                <div style={{ color: '#f8fafc', fontSize: '0.86rem', marginTop: '0.25rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  &quot;{activeBroadcast.message}&quot;
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissBroadcast}
                disabled={isDismissingBroadcast}
                style={{
                  flexShrink: 0,
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#fca5a5',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: isDismissingBroadcast ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 180ms ease',
                }}
              >
                {isDismissingBroadcast ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                <span>Dismiss</span>
              </button>
            </div>
          )}

          <form onSubmit={handlePublishBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Step 1: Broadcast Type / Category Selector */}
            <div className="cmd-form-group">
              <label className="cmd-form-label">
                <span>1. Broadcast Style / Category</span>
                <span style={{ color: getTypeColor(broadcastType), fontSize: '0.72rem', fontWeight: 700 }}>
                  Selected: {broadcastType}
                </span>
              </label>
              <div className="cmd-category-grid" role="tablist" aria-label="Broadcast Category">
                {[
                  { type: 'EVENT', icon: <Sparkles size={14} />, color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', glow: 'rgba(192, 132, 252, 0.3)' },
                  { type: 'INFO', icon: <Info size={14} />, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', glow: 'rgba(56, 189, 248, 0.3)' },
                  { type: 'ALERT', icon: <AlertTriangle size={14} />, color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', glow: 'rgba(239, 68, 68, 0.3)' },
                  { type: 'PARTY', icon: <PartyPopper size={14} />, color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', glow: 'rgba(16, 185, 129, 0.3)' },
                ].map(({ type, icon, color, bg, glow }) => {
                  const isSel = broadcastType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBroadcastType(type as any)}
                      className={`cmd-category-btn ${isSel ? 'active' : ''}`}
                      style={{
                        '--cat-color': color,
                        '--cat-active-bg': bg,
                        '--cat-glow': glow,
                      } as React.CSSProperties}
                    >
                      {icon}
                      <span>{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Broadcast Message Input */}
            <div className="cmd-form-group">
              <label className="cmd-form-label" htmlFor="cmd-broadcast-message">
                <span>2. Broadcast Message</span>
                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
                  {broadcastMsg.length} characters
                </span>
              </label>
              <textarea
                id="cmd-broadcast-message"
                rows={3}
                placeholder="e.g. ⚡ Weekend Surge Active! Double XP and Gold drops across all quest categories."
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                required
                className="cmd-form-textarea"
                aria-label="Broadcast Message"
              />
            </div>

            {/* Step 3: Action Button & URL (Optional) */}
            <div className="cmd-input-grid-2">
              <div className="cmd-form-group">
                <label className="cmd-form-label" htmlFor="cmd-action-text">
                  3. Action Button (Optional)
                </label>
                <input
                  id="cmd-action-text"
                  type="text"
                  placeholder="e.g. View Quests"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  className="cmd-form-input"
                  aria-label="Action Button Label"
                />
              </div>
              <div className="cmd-form-group">
                <label className="cmd-form-label" htmlFor="cmd-action-url">
                  4. Target URL (Optional)
                </label>
                <input
                  id="cmd-action-url"
                  type="text"
                  placeholder="e.g. /app/quests"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="cmd-form-input"
                  aria-label="Target URL"
                />
              </div>
            </div>

            {/* Step 4: Expiration Duration */}
            <div className="cmd-form-group">
              <label className="cmd-form-label">
                <span>5. Duration</span>
                <span style={{ color: '#38bdf8', fontSize: '0.72rem', fontWeight: 700 }}>
                  Active for: {expiryMinutes >= 60 ? `${expiryMinutes / 60} hours` : `${expiryMinutes} minutes`}
                </span>
              </label>
              <div className="cmd-duration-group" role="radiogroup" aria-label="Broadcast Duration">
                {[
                  { label: '30m', val: 30 },
                  { label: '2h', val: 120 },
                  { label: '6h', val: 360 },
                  { label: '24h', val: 1440 },
                ].map(({ label, val }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setExpiryMinutes(val)}
                    className={`cmd-duration-chip ${expiryMinutes === val ? 'active' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Live Player Banner Preview */}
            <div className="cmd-form-group">
              <label className="cmd-form-label">
                <span>6. Live Player Banner Preview</span>
                <span style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 700 }}>
                  ● Simulation
                </span>
              </label>
              <div
                className="cmd-live-preview-box"
                style={{
                  '--prev-color': getTypeColor(broadcastType),
                  '--prev-color-fade': `${getTypeColor(broadcastType)}18`,
                  '--prev-border': `${getTypeColor(broadcastType)}55`,
                  '--prev-shadow': `${getTypeColor(broadcastType)}25`,
                } as React.CSSProperties}
              >
                <div className="cmd-preview-left">
                  <span className="cmd-preview-tag">
                    [{broadcastType}]
                  </span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {broadcastMsg || 'Your live platform announcement will appear here...'}
                  </span>
                </div>
                {actionText && (
                  <span className="cmd-preview-cta">
                    {actionText}
                  </span>
                )}
              </div>
            </div>

            {/* Step 6: Publish Button */}
            <button
              type="submit"
              disabled={isPublishingBroadcast || !broadcastMsg.trim()}
              className="cmd-btn-publish"
            >
              {isPublishingBroadcast ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Broadcasting to Realm...</span>
                </>
              ) : (
                <>
                  <Radio size={18} />
                  <span>Publish Platform Broadcast</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: GLOBAL 2X SURGE ENGINE (50%)                     */}
        {/* ============================================================== */}
        <div className={`cmd-panel-card ${surgeStatus?.active ? 'cmd-surge-card-active' : ''}`}>
          <div className="cmd-panel-header">
            <div>
              <div className="cmd-panel-title">
                <Flame size={22} color={surgeStatus?.active ? '#f97316' : '#94a3b8'} />
                <span>GLOBAL 2X SURGE</span>
              </div>
              <p className="cmd-panel-sub">
                Control the server-authoritative experience multiplier across all quests and activities.
              </p>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: surgeStatus?.active ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: surgeStatus?.active ? '1px solid rgba(249, 115, 22, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: surgeStatus?.active ? '#fb923c' : '#94a3b8',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              {surgeStatus?.active ? (
                <>
                  <span className="cmd-live-dot" style={{ width: 6, height: 6, backgroundColor: '#f97316', boxShadow: '0 0 8px #f97316' }} />
                  <span>SURGE ACTIVE</span>
                </>
              ) : (
                <span>STANDBY</span>
              )}
            </span>
          </div>

          {/* Surge Status Feedback Banner */}
          {surgeStatusMsg && (
            <div
              className="cmd-alert-banner"
              style={{
                background: 'rgba(249, 115, 22, 0.15)',
                border: '1px solid rgba(249, 115, 22, 0.35)',
                color: '#fdba74',
                borderRadius: 10,
                padding: '0.75rem 1rem',
              }}
            >
              <Check size={16} />
              <span>{surgeStatusMsg}</span>
            </div>
          )}

          {/* High-Impact Multiplier Telemetry Display */}
          <div className="cmd-telemetry-box">
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              CURRENT MULTIPLIER
            </div>
            <div
              className={`cmd-multiplier-display ${surgeStatus?.active ? 'cmd-multiplier-active' : 'cmd-multiplier-standby'}`}
            >
              {surgeStatus?.active ? '2.0X' : '1.0X'}
            </div>

            {surgeStatus?.active ? (
              <div className="cmd-countdown-display">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f97316', fontSize: '0.84rem', fontWeight: 700 }}>
                  <Clock size={16} />
                  <span>COUNTDOWN REMAINING:</span>
                </div>
                <div className="cmd-countdown-clock">
                  {formatCountdown(remainingSeconds)}
                </div>
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '1rem', fontFamily: 'var(--font-mono)' }}>
                System ready for ignition. Experience & gold will double globally.
              </div>
            )}
          </div>

          {/* Surge Preset Duration Selector */}
          <div className="cmd-form-group">
            <label className="cmd-form-label">
              <span>Select Surge Duration</span>
              <span style={{ color: '#f97316', fontSize: '0.72rem', fontWeight: 700 }}>
                {surgeStatus?.active ? 'Locked while active' : `Target: ${selectedHours} Hours`}
              </span>
            </label>
            <div className="cmd-surge-preset-grid" role="radiogroup" aria-label="Surge Duration">
              {[
                { label: '1 Hour', hours: 1 },
                { label: '2 Hours', hours: 2 },
                { label: '6 Hours', hours: 6 },
                { label: '24 Hours', hours: 24 },
              ].map(({ label, hours }) => (
                <button
                  key={hours}
                  type="button"
                  disabled={surgeStatus?.active}
                  onClick={() => setSelectedHours(hours)}
                  className={`cmd-surge-preset-card ${selectedHours === hours ? 'active' : ''}`}
                >
                  <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{label}</span>
                  <span style={{ fontSize: '0.72rem', color: selectedHours === hours ? '#fb923c' : '#64748b' }}>
                    {hours}h Event
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Surge Action Button */}
          <button
            type="button"
            onClick={handleToggleSurge}
            disabled={isTogglingSurge}
            className={surgeStatus?.active ? 'cmd-btn-surge-halt' : 'cmd-btn-surge-ignite'}
          >
            {isTogglingSurge ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Updating Surge Engine...</span>
              </>
            ) : surgeStatus?.active ? (
              <>
                <X size={18} />
                <span>Halt Surge Event</span>
              </>
            ) : (
              <>
                <Flame size={18} />
                <span>Ignite {selectedHours}-Hour 2X Surge Event</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
