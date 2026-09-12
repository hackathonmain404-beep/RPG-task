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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
      {/* ============================================================== */}
      {/* LEFT COLUMN: PLATFORM BROADCAST BANNER ENGINE                  */}
      {/* ============================================================== */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Megaphone size={22} color="#38bdf8" />
            <span>Platform Broadcast Banner</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Broadcast real-time announcement banners to every active player across the entire web application.
          </p>
        </div>

        {broadcastStatusMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: broadcastStatusMsg.startsWith('Error') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: broadcastStatusMsg.startsWith('Error') ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
              color: broadcastStatusMsg.startsWith('Error') ? '#fca5a5' : '#10b981',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Check size={16} />
            <span>{broadcastStatusMsg}</span>
          </div>
        )}

        {/* Active Broadcast Indicator */}
        {activeBroadcast && activeBroadcast.active && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                <span>LIVE PLATFORM BANNER ACTIVE</span>
              </div>
              <div style={{ color: '#f8fafc', fontSize: '0.88rem', marginTop: '0.3rem', fontWeight: 500 }}>
                &quot;{activeBroadcast.message}&quot;
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismissBroadcast}
              disabled={isDismissingBroadcast}
              style={{
                flexShrink: 0,
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {isDismissingBroadcast ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
              <span>Dismiss</span>
            </button>
          </div>
        )}

        <form onSubmit={handlePublishBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Banner Type Tabs */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Broadcast Style / Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              {(['EVENT', 'INFO', 'ALERT', 'PARTY'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBroadcastType(t)}
                  style={{
                    padding: '0.55rem 0.4rem',
                    borderRadius: '8px',
                    border: broadcastType === t ? `1px solid ${getTypeColor(t)}` : '1px solid rgba(255, 255, 255, 0.08)',
                    background: broadcastType === t ? `${getTypeColor(t)}22` : 'rgba(15, 23, 42, 0.6)',
                    color: broadcastType === t ? getTypeColor(t) : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                  }}
                >
                  {t === 'EVENT' && <Sparkles size={13} />}
                  {t === 'INFO' && <Info size={13} />}
                  {t === 'ALERT' && <AlertTriangle size={13} />}
                  {t === 'PARTY' && <PartyPopper size={13} />}
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Broadcast Message Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Broadcast Message
            </label>
            <textarea
              rows={3}
              placeholder="e.g. ⚡ Weekend Surge Active! Double XP and Gold drops across all quest categories."
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
              }}
            />
          </div>

          {/* Action Button & URL (Optional) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                Action Button (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. View Quests"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                Target URL (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. /app/quests"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '0.82rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Expiration Duration */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
              Duration
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
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
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    borderRadius: '6px',
                    background: expiryMinutes === val ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: expiryMinutes === val ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Live Player Banner Preview
            </div>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: `linear-gradient(90deg, ${getTypeColor(broadcastType)}15 0%, rgba(15, 23, 42, 0.9) 100%)`,
                border: `1px solid ${getTypeColor(broadcastType)}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                boxShadow: `0 0 15px ${getTypeColor(broadcastType)}20`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: '#f8fafc' }}>
                <span style={{ color: getTypeColor(broadcastType), fontWeight: 700, fontSize: '0.75rem' }}>
                  [{broadcastType}]
                </span>
                <span>{broadcastMsg || 'Your live platform announcement will appear here...'}</span>
              </div>
              {actionText && (
                <span
                  style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    backgroundColor: getTypeColor(broadcastType),
                    color: '#000',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {actionText}
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPublishingBroadcast || !broadcastMsg.trim()}
            style={{
              padding: '0.8rem 1.25rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: isPublishingBroadcast || !broadcastMsg.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              marginTop: '0.5rem',
            }}
          >
            {isPublishingBroadcast ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Broadcasting to Realm...</span>
              </>
            ) : (
              <>
                <Radio size={16} />
                <span>Publish Platform Broadcast</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ============================================================== */}
      {/* RIGHT COLUMN: GLOBAL 2X SURGE ENGINE                           */}
      {/* ============================================================== */}
      <div
        style={{
          background: surgeStatus?.active
            ? 'linear-gradient(145deg, rgba(67, 20, 7, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'rgba(15, 23, 42, 0.65)',
          border: surgeStatus?.active ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: surgeStatus?.active ? '0 0 35px rgba(249, 115, 22, 0.15)' : 'none',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Flame size={22} color={surgeStatus?.active ? '#f97316' : '#94a3b8'} />
              <span>Global 2X Surge Event Engine</span>
            </h2>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: surgeStatus?.active ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: surgeStatus?.active ? '1px solid rgba(249, 115, 22, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: surgeStatus?.active ? '#fb923c' : '#94a3b8',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {surgeStatus?.active ? 'SURGE ACTIVE' : 'STANDBY'}
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            Server-authoritative 2X multiplier applied directly to every task completion across the realm.
          </p>
        </div>

        {surgeStatusMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'rgba(249, 115, 22, 0.15)',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              color: '#fdba74',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Check size={16} />
            <span>{surgeStatusMsg}</span>
          </div>
        )}

        {/* Big Telemetry Display */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '1.75rem',
            textAlign: 'center',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            Authoritative XP & Gold Multiplier
          </div>
          <div
            style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              background: surgeStatus?.active
                ? 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)'
                : 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {surgeStatus?.active ? '2.0X' : '1.0X'}
          </div>

          {surgeStatus?.active && (
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f97316', fontSize: '0.85rem', fontWeight: 600 }}>
                <Clock size={16} />
                <span>Countdown Remaining:</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '0.08em',
                  textShadow: '0 0 15px rgba(249, 115, 22, 0.4)',
                }}
              >
                {formatCountdown(remainingSeconds)}
              </div>
            </div>
          )}
        </div>

        {/* Preset Duration Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
            Select Surge Duration
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
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
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: '8px',
                  border: selectedHours === hours ? '1px solid #f97316' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: selectedHours === hours ? 'rgba(249, 115, 22, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: selectedHours === hours ? '#fb923c' : '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: surgeStatus?.active ? 'not-allowed' : 'pointer',
                  opacity: surgeStatus?.active ? 0.5 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <span>{label}</span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{hours}h</span>
              </button>
            ))}
          </div>
        </div>

        {/* Surge Action Button */}
        <button
          type="button"
          onClick={handleToggleSurge}
          disabled={isTogglingSurge}
          style={{
            marginTop: 'auto',
            padding: '0.9rem 1.25rem',
            borderRadius: '10px',
            background: surgeStatus?.active
              ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
              : 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: isTogglingSurge ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.55rem',
            boxShadow: surgeStatus?.active
              ? '0 4px 18px rgba(239, 68, 68, 0.35)'
              : '0 4px 18px rgba(234, 88, 12, 0.35)',
            transition: 'all 0.2s ease',
          }}
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
  );
};
