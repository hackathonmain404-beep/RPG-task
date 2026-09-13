import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAdminFeedback, replyAdminFeedback, deleteAdminFeedback } from '../../services/api/admin';
import type { AdminFeedbackItem, FeedbackType } from '../../types/contract';
import { 
  Inbox, 
  Bug, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Reply, 
  Loader2, 
  X, 
  Check, 
  Crown,
  Search,
  ArrowUpDown,
  MessageSquare,
  FileText,
  History,
  Send,
  User,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Square,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { WindowPopModal } from '../../components/common/WindowPopModal';

type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type DrawerTab = 'reply' | 'notes' | 'timeline';

export const FeedbackDeskTab: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<AdminFeedbackItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'ALL' | FeedbackType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED' | 'RESOLVED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | PriorityLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'replied'>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Priority Overrides & Internal Notes
  const [priorityOverrides, setPriorityOverrides] = useState<Record<string, PriorityLevel>>({});
  const [internalNotes, setInternalNotes] = useState<Record<string, { author: string; text: string; date: string }[]>>({});
  const [newNoteText, setNewNoteText] = useState<string>('');

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== 'ALL') count++;
    if (statusFilter !== 'ALL') count++;
    if (priorityFilter !== 'ALL') count++;
    if (sortBy !== 'newest') count++;
    return count;
  }, [activeCategory, statusFilter, priorityFilter, sortBy]);

  // Drawer / Inspection State
  const [inspectingItem, setInspectingItem] = useState<AdminFeedbackItem | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<DrawerTab>('reply');
  const [replyText, setReplyText] = useState<string>('');
  const [drawerStatus, setDrawerStatus] = useState<string>('REVIEWED');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
  const [replySuccessMsg, setReplySuccessMsg] = useState<string | null>(null);

  // Modal State for Delete
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeletingFeedback, setIsDeletingFeedback] = useState<boolean>(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [popAlert, setPopAlert] = useState<{ title: string; message: string; type?: 'danger' | 'warning' | 'info' | 'success' } | null>(null);

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    setErrorText(null);
    try {
      const res = await getAdminFeedback();
      const list = (res as any).feedbacks || res.feedback || [];
      setFeedbackList(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to fetch player feedback.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectingItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine Priority Dynamically with fallback & override
  const getItemPriority = useCallback((item: AdminFeedbackItem): PriorityLevel => {
    if (priorityOverrides[item.id]) return priorityOverrides[item.id];
    const msg = (item.message || '').toLowerCase();
    if (msg.includes('crash') || msg.includes('exploit') || msg.includes('critical') || msg.includes('lost') || msg.includes('broken')) {
      return 'CRITICAL';
    }
    if (item.type === 'BUG_REPORT') return 'HIGH';
    if (item.type === 'FEATURE_REQUEST') return 'MEDIUM';
    return 'LOW';
  }, [priorityOverrides]);

  // Statistics Deck
  const stats = useMemo(() => {
    const total = feedbackList.length;
    const pending = feedbackList.filter(f => f.status === 'PENDING').length;
    const reviewed = feedbackList.filter(f => f.status === 'REVIEWED').length;
    const resolved = feedbackList.filter(f => f.status === 'RESOLVED').length;
    const bugs = feedbackList.filter(f => f.type === 'BUG_REPORT').length;
    const features = feedbackList.filter(f => f.type === 'FEATURE_REQUEST').length;
    const general = feedbackList.filter(f => f.type === 'GENERAL').length;

    // Calculate response count and average
    const repliedItems = feedbackList.filter(f => Boolean(f.adminReply));
    const responseRate = total > 0 ? Math.round((repliedItems.length / total) * 100) : 0;

    return {
      total,
      pending,
      reviewed,
      resolved,
      bugs,
      features,
      general,
      responseRate,
    };
  }, [feedbackList]);

  // Filtered & Sorted Feedback Items
  const filteredFeedbacks = useMemo(() => {
    return feedbackList.filter(item => {
      // Category filter
      if (activeCategory !== 'ALL' && item.type !== activeCategory) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== 'ALL' && getItemPriority(item) !== priorityFilter) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const msg = (item.message || '').toLowerCase();
        const user = (item.userName || '').toLowerCase();
        const email = (item.userEmail || '').toLowerCase();
        const id = (item.id || '').toLowerCase();
        if (!msg.includes(query) && !user.includes(query) && !email.includes(query) && !id.includes(query)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'priority') {
        const weight: Record<PriorityLevel, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return weight[getItemPriority(b)] - weight[getItemPriority(a)];
      }
      if (sortBy === 'replied') {
        const aReplied = a.adminReply ? 1 : 0;
        const bReplied = b.adminReply ? 1 : 0;
        return bReplied - aReplied;
      }
      return 0;
    });
  }, [feedbackList, activeCategory, statusFilter, priorityFilter, searchQuery, sortBy, getItemPriority]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredFeedbacks.length && filteredFeedbacks.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFeedbacks.map(f => f.id)));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Open Slide-Over Detail Drawer
  const handleInspect = (item: AdminFeedbackItem) => {
    setInspectingItem(item);
    setReplyText(item.adminReply || '');
    setDrawerStatus(item.status === 'PENDING' ? 'REVIEWED' : item.status);
    setActiveDrawerTab('reply');
    setReplySuccessMsg(null);
  };

  // Submit Official Admin Response
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingItem || !replyText.trim()) return;

    setIsSubmittingReply(true);
    setErrorText(null);

    try {
      const statusToSet = drawerStatus || 'REVIEWED';
      const res = await replyAdminFeedback(inspectingItem.id, replyText.trim(), statusToSet);
      setReplySuccessMsg('Admin reply sent to user & status updated!');

      const updated = res.feedback;
      setFeedbackList(prev =>
        prev.map(f => (f.id === inspectingItem.id ? { 
          ...f, 
          ...(updated || {}),
          adminReply: replyText.trim(),
          status: statusToSet,
        } : f))
      );

      // Update inspecting item state
      setInspectingItem(prev => prev ? {
        ...prev,
        adminReply: replyText.trim(),
        status: statusToSet,
        repliedAt: new Date().toISOString(),
      } : null);

      setTimeout(() => {
        setReplySuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to submit admin reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Quick Status Update from Drawer
  const handleQuickStatusUpdate = async (status: string) => {
    if (!inspectingItem) return;
    try {
      await replyAdminFeedback(inspectingItem.id, inspectingItem.adminReply || 'Status updated via triage.', status);
      setDrawerStatus(status);
      setFeedbackList(prev =>
        prev.map(f => (f.id === inspectingItem.id ? { ...f, status } : f))
      );
      setInspectingItem(prev => prev ? { ...prev, status } : null);
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to update status.');
    }
  };

  // Add Internal Note
  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingItem || !newNoteText.trim()) return;

    const note = {
      author: 'Realm Admin',
      text: newNoteText.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString(),
    };

    setInternalNotes(prev => ({
      ...prev,
      [inspectingItem.id]: [...(prev[inspectingItem.id] || []), note],
    }));
    setNewNoteText('');
  };

  // Single Delete
  const confirmDeleteFeedback = async () => {
    if (!deleteTargetId) return;

    setIsDeletingFeedback(true);
    try {
      await deleteAdminFeedback(deleteTargetId);
      setFeedbackList(prev => prev.filter(f => f.id !== deleteTargetId));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(deleteTargetId);
        return next;
      });
      if (inspectingItem?.id === deleteTargetId) {
        setInspectingItem(null);
      }
      setDeleteTargetId(null);
    } catch (err: any) {
      setPopAlert({
        title: 'Delete Failed',
        message: err?.message || 'Failed to delete feedback record.',
        type: 'danger',
      });
    } finally {
      setIsDeletingFeedback(false);
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = async (newStatus: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    for (const id of ids) {
      const item = feedbackList.find(f => f.id === id);
      if (item) {
        try {
          await replyAdminFeedback(id, item.adminReply || 'Status batch updated.', newStatus);
        } catch {
          // Continue with next
        }
      }
    }
    setFeedbackList(prev =>
      prev.map(f => (selectedIds.has(f.id) ? { ...f, status: newStatus } : f))
    );
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setIsBulkDeleting(true);
    for (const id of ids) {
      try {
        await deleteAdminFeedback(id);
      } catch {
        // Continue
      }
    }
    setFeedbackList(prev => prev.filter(f => !selectedIds.has(f.id)));
    setSelectedIds(new Set());
    setIsBulkDeleting(false);
  };

  // Category Icon & Label
  const getTypeIcon = (type: FeedbackType) => {
    switch (type) {
      case 'BUG_REPORT': return <Bug size={14} color="#f87171" />;
      case 'FEATURE_REQUEST': return <Sparkles size={14} color="#c084fc" />;
      case 'GENERAL': return <HelpCircle size={14} color="#38bdf8" />;
    }
  };

  const getTypeLabel = (type: FeedbackType) => {
    switch (type) {
      case 'BUG_REPORT': return 'Bug Report';
      case 'FEATURE_REQUEST': return 'Feature';
      case 'GENERAL': return 'General';
    }
  };

  return (
    <div className="cmd-center-container">
      {/* 1. Page Hero Banner */}
      <section className="cmd-hero-panel" aria-label="Feedback Desk Hero">
        <div className="cmd-hero-title-group">
          <div className="cmd-hero-badge-tag">
            <span className="cmd-live-dot" />
            <span>TRIAGE DESK ● LIVE OPERATIONS</span>
          </div>
          <h2 className="cmd-hero-heading">
            <Inbox size={24} color="#38bdf8" />
            <span>Feedback Desk ({feedbackList.length})</span>
          </h2>
          <p className="cmd-hero-sub">
            Review community bug reports, feature suggestions, and inquiries. Triage priorities, dispatch replies, and maintain resolution velocity.
          </p>
        </div>

        <div className="cmd-hero-quick-status">
          <div className="cmd-status-pill">
            <span style={{ color: '#10b981', fontWeight: 700 }}>VELOCITY:</span>
            <span>{stats.responseRate}% Resolved / Replied</span>
          </div>
          <div className="cmd-status-pill">
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>DATABASE:</span>
            <span>Feedback Synced</span>
          </div>
        </div>
      </section>

      {/* 2. Feedback KPI Metrics Deck */}
      <section aria-label="Feedback Metrics" className="cmd-feedback-kpi-grid">
        {/* Total Tickets */}
        <div className="cmd-kpi-card" style={{ '--kpi-accent': '#38bdf8', '--kpi-shadow': 'rgba(56, 189, 248, 0.2)' } as React.CSSProperties}>
          <div className="cmd-kpi-header">
            <span className="cmd-kpi-label">Total Tickets</span>
            <div className="cmd-kpi-icon-box" style={{ '--kpi-icon-bg': 'rgba(56, 189, 248, 0.12)', '--kpi-icon-border': 'rgba(56, 189, 248, 0.3)', '--kpi-icon-color': '#38bdf8' } as React.CSSProperties}>
              <Inbox size={16} />
            </div>
          </div>
          <div className="cmd-kpi-value-row">
            <span className="cmd-kpi-number">{stats.total}</span>
          </div>
          <span className="cmd-kpi-subtext">All community feedback</span>
        </div>

        {/* Pending / Open */}
        <div className="cmd-kpi-card" style={{ '--kpi-accent': '#fbbf24', '--kpi-shadow': 'rgba(251, 191, 36, 0.2)' } as React.CSSProperties}>
          <div className="cmd-kpi-header">
            <span className="cmd-kpi-label">Pending Triage</span>
            <div className="cmd-kpi-icon-box" style={{ '--kpi-icon-bg': 'rgba(251, 191, 36, 0.12)', '--kpi-icon-border': 'rgba(251, 191, 36, 0.3)', '--kpi-icon-color': '#fbbf24' } as React.CSSProperties}>
              <Clock size={16} />
            </div>
          </div>
          <div className="cmd-kpi-value-row">
            <span className="cmd-kpi-number" style={{ color: '#fef08a' }}>{stats.pending}</span>
          </div>
          <span className="cmd-kpi-subtext">Awaiting admin review</span>
        </div>

        {/* In Review */}
        <div className="cmd-kpi-card" style={{ '--kpi-accent': '#c084fc', '--kpi-shadow': 'rgba(192, 132, 252, 0.2)' } as React.CSSProperties}>
          <div className="cmd-kpi-header">
            <span className="cmd-kpi-label">In Review</span>
            <div className="cmd-kpi-icon-box" style={{ '--kpi-icon-bg': 'rgba(192, 132, 252, 0.12)', '--kpi-icon-border': 'rgba(192, 132, 252, 0.3)', '--kpi-icon-color': '#c084fc' } as React.CSSProperties}>
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="cmd-kpi-value-row">
            <span className="cmd-kpi-number" style={{ color: '#e9d5ff' }}>{stats.reviewed}</span>
          </div>
          <span className="cmd-kpi-subtext">Under active inspection</span>
        </div>

        {/* Resolved */}
        <div className="cmd-kpi-card" style={{ '--kpi-accent': '#10b981', '--kpi-shadow': 'rgba(16, 185, 129, 0.2)' } as React.CSSProperties}>
          <div className="cmd-kpi-header">
            <span className="cmd-kpi-label">Resolved</span>
            <div className="cmd-kpi-icon-box" style={{ '--kpi-icon-bg': 'rgba(16, 185, 129, 0.12)', '--kpi-icon-border': 'rgba(16, 185, 129, 0.3)', '--kpi-icon-color': '#10b981' } as React.CSSProperties}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="cmd-kpi-value-row">
            <span className="cmd-kpi-number" style={{ color: '#a7f3d0' }}>{stats.resolved}</span>
          </div>
          <span className="cmd-kpi-subtext">Addressed & completed</span>
        </div>

        {/* Avg Response Velocity */}
        <div className="cmd-kpi-card" style={{ '--kpi-accent': '#f43f5e', '--kpi-shadow': 'rgba(244, 63, 94, 0.2)' } as React.CSSProperties}>
          <div className="cmd-kpi-header">
            <span className="cmd-kpi-label">Response Time</span>
            <div className="cmd-kpi-icon-box" style={{ '--kpi-icon-bg': 'rgba(244, 63, 94, 0.12)', '--kpi-icon-border': 'rgba(244, 63, 94, 0.3)', '--kpi-icon-color': '#f43f5e' } as React.CSSProperties}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="cmd-kpi-value-row">
            <span className="cmd-kpi-number" style={{ color: '#fecdd3' }}>&lt; 2h</span>
          </div>
          <span className="cmd-kpi-subtext">Citadel SLA standard</span>
        </div>
      </section>

      {/* 3. Category Navigation Pills */}
      <section aria-label="Category Navigation" className="cmd-filter-pill-group" style={{ padding: '0.4rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        {[
          { key: 'ALL', label: 'All Feedback', count: stats.total },
          { key: 'BUG_REPORT', label: 'Bugs', count: stats.bugs },
          { key: 'FEATURE_REQUEST', label: 'Features', count: stats.features },
          { key: 'GENERAL', label: 'General / Suggestions', count: stats.general },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveCategory(key as any)}
            className={`cmd-filter-pill ${activeCategory === key ? 'active' : ''}`}
          >
            <span>{label}</span>
            <span className="cmd-cat-count-badge">{count}</span>
          </button>
        ))}
      </section>

      {/* 4. Search & Filter Triage Toolbar */}
      <section aria-label="Triage Toolbar" className="cmd-triage-toolbar">
        {/* Search input and mobile filter trigger row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%', flex: '1 1 280px' }}>
          <div className="cmd-search-wrapper" style={{ flex: 1, minWidth: 160 }}>
            <Search size={16} className="cmd-search-icon" />
            <input
              type="text"
              placeholder="Search feedback text, user, or ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cmd-search-input"
              aria-label="Search feedback"
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

          {/* Mobile Filter Trigger Button (< 768px) */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="cmd-mobile-filter-trigger"
            aria-label="Open filter settings"
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="cmd-filter-active-count">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Desktop Filter Controls (Hidden on mobile via CSS) */}
        <div className="cmd-desktop-filters-row" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="cmd-select-pill"
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Triage</option>
            <option value="REVIEWED">In Review</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="cmd-select-pill"
            aria-label="Filter by priority"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowUpDown size={14} color="#94a3b8" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="cmd-select-pill"
              aria-label="Sort feedback items"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
              <option value="replied">Most Discussed / Replied</option>
            </select>
          </div>
        </div>
      </section>

      {/* Mobile Filter Bottom Sheet (< 768px) */}
      {isMobileFilterOpen && (
        <>
          <div
            className="cmd-filter-sheet-overlay"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <div className="cmd-filter-sheet" role="dialog" aria-label="Feedback Filters">
            <div className="cmd-sheet-drag-handle" />
            <div className="cmd-filter-sheet-header">
              <div className="cmd-filter-sheet-title">
                <SlidersHorizontal size={18} color="#38bdf8" />
                <span>Triage Filters</span>
                {activeFilterCount > 0 && (
                  <span className="cmd-filter-active-count">{activeFilterCount}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.35rem' }}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="cmd-filter-sheet-body">
              {/* Category Pills */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                  Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                  {[
                    { key: 'ALL', label: 'All Categories' },
                    { key: 'BUG_REPORT', label: 'Bugs' },
                    { key: 'FEATURE_REQUEST', label: 'Features' },
                    { key: 'GENERAL', label: 'General' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveCategory(key as any)}
                      className={`cmd-filter-pill ${activeCategory === key ? 'active' : ''}`}
                      style={{ textAlign: 'center', justifyContent: 'center' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="cmd-select-pill"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending Triage</option>
                  <option value="REVIEWED">In Review</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="cmd-select-pill"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">Critical Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="cmd-select-pill"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">Highest Priority</option>
                  <option value="replied">Most Discussed / Replied</option>
                </select>
              </div>
            </div>

            <div className="cmd-filter-sheet-actions">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('ALL');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setSortBy('newest');
                }}
                className="cmd-action-btn"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="cmd-btn-grant"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Check size={16} />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Error text if present */}
      {errorText && (
        <div className="cmd-alert-banner error">
          <span>{errorText}</span>
        </div>
      )}

      {/* 5. Feedback List / Table View */}
      {isLoading ? (
        <div className="cmd-orbital-loader">
          <div className="cmd-orbit-ring" />
          <div style={{ color: '#94a3b8', fontSize: '0.86rem', fontWeight: 600 }}>
            Syncing authoritative feedback stream...
          </div>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '16px',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <Inbox size={40} color="#64748b" />
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            No Feedback Tickets Found
          </div>
          <p style={{ fontSize: '0.85rem', maxWidth: '380px', margin: 0 }}>
            No tickets match your current category, search query, or status filters.
          </p>
          {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || activeCategory !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setActiveCategory('ALL');
              }}
              className="cmd-btn-grant"
              style={{ width: 'auto', padding: '0.55rem 1.25rem' }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="cmd-feedback-table" role="table" aria-label="Feedback Triage Table">
          {/* Table Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1.25rem', fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={handleToggleSelectAll}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                aria-label="Select all feedback rows"
              >
                {selectedIds.size === filteredFeedbacks.length && filteredFeedbacks.length > 0 ? (
                  <CheckSquare size={16} color="#38bdf8" />
                ) : (
                  <Square size={16} />
                )}
              </button>
              <span>Ticket / Feedback</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <span className="hidden md:inline">Priority & Status</span>
              <span>Actions</span>
            </div>
          </div>

          {/* Table Rows */}
          {filteredFeedbacks.map((f) => {
            const isSelected = selectedIds.has(f.id);
            const priority = getItemPriority(f);
            const isResolved = f.status === 'RESOLVED';
            const isReviewed = f.status === 'REVIEWED';

            return (
              <div
                key={f.id}
                onClick={() => handleInspect(f)}
                className={`cmd-feedback-row ${isSelected ? 'is-selected' : ''}`}
                role="row"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleInspect(f);
                  }
                }}
              >
                {/* Left section: Checkbox, priority bar, type badge, content */}
                <div className="cmd-row-left">
                  <button
                    type="button"
                    onClick={(e) => handleToggleSelectRow(f.id, e)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                    aria-label={`Select ticket ${f.id}`}
                  >
                    {isSelected ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} />}
                  </button>

                  {/* Priority indicator strip */}
                  <div
                    className={`cmd-priority-indicator cmd-priority-${priority.toLowerCase()}`}
                    title={`Priority: ${priority}`}
                  />

                  {/* Body Content */}
                  <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Type Badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#cbd5e1',
                        }}
                      >
                        {getTypeIcon(f.type)}
                        <span>{getTypeLabel(f.type)}</span>
                      </span>

                      {/* Submitter Name */}
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={12} color="#64748b" />
                        <strong style={{ color: '#f1f5f9' }}>{f.userName || 'Hero'}</strong>
                      </span>

                      {/* Timestamp */}
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>

                      {/* Replied Indicator */}
                      {f.adminReply && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            background: 'rgba(168, 85, 247, 0.15)',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            color: '#c084fc',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                          }}
                        >
                          <Crown size={10} />
                          <span>Replied</span>
                        </span>
                      )}
                    </div>

                    {/* Preview Text */}
                    <div
                      style={{
                        color: '#e2e8f0',
                        fontSize: '0.86rem',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {f.message}
                    </div>
                  </div>
                </div>

                {/* Right section: Priority badge, status badge, action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                  {/* Status Badge */}
                  <span className={`cmd-status-badge ${isResolved ? 'cmd-status-resolved' : isReviewed ? 'cmd-status-reviewed' : 'cmd-status-pending'}`}>
                    {isResolved ? <CheckCircle2 size={11} /> : isReviewed ? <Check size={11} /> : <Clock size={11} />}
                    <span>{f.status === 'REVIEWED' ? 'In Review' : f.status}</span>
                  </span>

                  {/* Quick Inspect Affordance */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInspect(f);
                    }}
                    className="cmd-btn-grant"
                    style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
                  >
                    <span>Inspect</span>
                    <ChevronRight size={13} />
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetId(f.id);
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#fca5a5',
                      borderRadius: '6px',
                      padding: '0.35rem 0.55rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 180ms ease',
                    }}
                    aria-label={`Delete feedback ${f.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <aside className="cmd-bulk-toolbar" role="toolbar" aria-label="Bulk actions">
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
            {selectedIds.size} {selectedIds.size === 1 ? 'ticket' : 'tickets'} selected
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleBulkStatusChange('RESOLVED')}
              className="cmd-btn-grant"
              style={{ width: 'auto', padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
            >
              <CheckCircle2 size={13} />
              <span>Mark Resolved</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatusChange('REVIEWED')}
              className="cmd-btn-grant"
              style={{ width: 'auto', padding: '0.35rem 0.85rem', fontSize: '0.78rem', background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', color: '#38bdf8' }}
            >
              <MessageSquare size={13} />
              <span>Mark In Review</span>
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                borderRadius: '8px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {isBulkDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              <span>Delete</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.78rem',
                cursor: 'pointer',
                marginLeft: '0.5rem',
              }}
            >
              Clear
            </button>
          </div>
        </aside>
      )}

      {/* 7. Slide-Over Detail Drawer */}
      {inspectingItem && (
        <>
          <div 
            className="cmd-drawer-backdrop" 
            onClick={() => setInspectingItem(null)} 
            aria-hidden="true" 
          />
          <section className="cmd-feedback-drawer" role="dialog" aria-label="Feedback Ticket Inspection">
            {/* Drawer Header */}
            <div className="cmd-drawer-header">
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#cbd5e1',
                    }}
                  >
                    {getTypeIcon(inspectingItem.type)}
                    <span>{getTypeLabel(inspectingItem.type)}</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                    #{inspectingItem.id.slice(0, 10)}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.35rem' }}>
                  Ticket Inspection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.35rem' }}
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Navigation Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '0 1.75rem' }}>
              {[
                { key: 'reply', label: 'Admin Reply', icon: <Reply size={14} /> },
                { key: 'notes', label: `Internal Notes (${(internalNotes[inspectingItem.id] || []).length})`, icon: <FileText size={14} /> },
                { key: 'timeline', label: 'Activity Timeline', icon: <History size={14} /> },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveDrawerTab(key as any)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.85rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeDrawerTab === key ? '2px solid #38bdf8' : '2px solid transparent',
                    color: activeDrawerTab === key ? '#38bdf8' : '#94a3b8',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 180ms ease',
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="cmd-drawer-body">
              {/* Metadata Card */}
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Submitter</span>
                    <strong style={{ color: '#f8fafc' }}>{inspectingItem.userName || 'Hero'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Email / UUID</span>
                    <span style={{ color: '#cbd5e1', wordBreak: 'break-all' }}>{inspectingItem.userEmail || inspectingItem.userId}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Submitted At</span>
                    <span style={{ color: '#cbd5e1' }}>{new Date(inspectingItem.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>Priority Level</span>
                    <select
                      value={getItemPriority(inspectingItem)}
                      onChange={(e) => {
                        const val = e.target.value as PriorityLevel;
                        setPriorityOverrides(prev => ({ ...prev, [inspectingItem.id]: val }));
                      }}
                      className="cmd-select-pill"
                      style={{ padding: '0.25rem 0.5rem', marginTop: '0.2rem' }}
                    >
                      <option value="CRITICAL">Critical</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Original Feedback Message Quote */}
              <div className="cmd-form-group">
                <label className="cmd-form-label">
                  <span>Player Feedback Message</span>
                </label>
                <div
                  style={{
                    backgroundColor: 'rgba(5, 9, 20, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '1rem 1.15rem',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                    lineHeight: 1.55,
                    fontStyle: 'italic',
                  }}
                >
                  &quot;{inspectingItem.message}&quot;
                </div>
              </div>

              {/* TAB 1: REPLY & STATUS */}
              {activeDrawerTab === 'reply' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Quick Status Buttons */}
                  <div>
                    <label className="cmd-form-label">
                      <span>Quick Status Transition</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {[
                        { key: 'PENDING', label: 'Pending', color: '#fbbf24' },
                        { key: 'REVIEWED', label: 'In Review', color: '#38bdf8' },
                        { key: 'RESOLVED', label: 'Resolved', color: '#10b981' },
                      ].map(({ key, label, color }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleQuickStatusUpdate(key)}
                          style={{
                            flex: 1,
                            padding: '0.55rem',
                            borderRadius: '8px',
                            background: inspectingItem.status === key ? `${color}25` : 'rgba(255, 255, 255, 0.04)',
                            border: inspectingItem.status === key ? `1px solid ${color}` : '1px solid rgba(255, 255, 255, 0.08)',
                            color: inspectingItem.status === key ? color : '#94a3b8',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 180ms ease',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Previous Admin Response if any */}
                  {inspectingItem.adminReply && (
                    <div
                      style={{
                        background: 'rgba(124, 58, 237, 0.1)',
                        border: '1px solid rgba(168, 85, 247, 0.35)',
                        borderRadius: '10px',
                        padding: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                        <Crown size={14} />
                        <span>Active Admin Response</span>
                        {inspectingItem.repliedAt && (
                          <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.72rem' }}>
                            — {new Date(inspectingItem.repliedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#f8fafc', fontSize: '0.86rem', lineHeight: 1.5 }}>
                        {inspectingItem.adminReply}
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div className="cmd-form-group">
                      <label className="cmd-form-label" htmlFor="cmd-reply-textarea">
                        <span>{inspectingItem.adminReply ? 'Update Official Response' : 'Dispatch Official Response'}</span>
                      </label>
                      <textarea
                        id="cmd-reply-textarea"
                        rows={4}
                        placeholder="Write your official response to the adventurer..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        required
                        className="cmd-form-textarea"
                      />
                    </div>

                    {replySuccessMsg && (
                      <div className="cmd-alert-banner" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10b981' }}>
                        <Check size={16} />
                        <span>{replySuccessMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingReply || !replyText.trim()}
                      className="cmd-btn-publish"
                    >
                      {isSubmittingReply ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Dispatching Response...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>{inspectingItem.adminReply ? 'Update Response' : 'Submit & Notify Player'}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: INTERNAL NOTES */}
              {activeDrawerTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Internal triage notes are only visible to Citadel Administrators.
                  </div>

                  {/* List of existing notes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {(internalNotes[inspectingItem.id] || []).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, color: '#64748b', fontSize: '0.8rem' }}>
                        No internal notes recorded yet. Add one below.
                      </div>
                    ) : (
                      (internalNotes[inspectingItem.id] || []).map((n, i) => (
                        <div key={i} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 8, padding: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '0.25rem' }}>
                            <strong style={{ color: '#38bdf8' }}>{n.author}</strong>
                            <span>{n.date}</span>
                          </div>
                          <div style={{ color: '#e2e8f0', fontSize: '0.84rem' }}>{n.text}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* New Note Form */}
                  <form onSubmit={handleAddInternalNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <textarea
                      rows={3}
                      placeholder="Add an internal note about this ticket..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="cmd-form-textarea"
                    />
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="cmd-btn-grant"
                      style={{ width: 'auto', alignSelf: 'flex-end', padding: '0.5rem 1.25rem' }}
                    >
                      <FileText size={14} />
                      <span>Save Note</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: TIMELINE */}
              {activeDrawerTab === 'timeline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid rgba(56, 189, 248, 0.3)', marginLeft: '0.5rem' }}>
                    {/* Event 1: Created */}
                    <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-1.85rem', top: 0, width: 10, height: 10, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>Feedback Submitted</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{new Date(inspectingItem.createdAt).toLocaleString()}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        Created by {inspectingItem.userName || 'Adventurer'} with {inspectingItem.type}.
                      </div>
                    </div>

                    {/* Event 2: Admin Reply if exists */}
                    {inspectingItem.adminReply && (
                      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-1.85rem', top: 0, width: 10, height: 10, borderRadius: '50%', background: '#c084fc', boxShadow: '0 0 8px #c084fc' }} />
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c084fc' }}>Admin Reply Dispatched</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {inspectingItem.repliedAt ? new Date(inspectingItem.repliedAt).toLocaleString() : 'Recent'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                          Official response sent to player.
                        </div>
                      </div>
                    )}

                    {/* Event 3: Current Status */}
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-1.85rem', top: 0, width: 10, height: 10, borderRadius: '50%', background: inspectingItem.status === 'RESOLVED' ? '#10b981' : '#fbbf24' }} />
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: inspectingItem.status === 'RESOLVED' ? '#10b981' : '#fbbf24' }}>
                        Status: {inspectingItem.status}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Current authoritative state</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="cmd-drawer-footer">
              <button
                type="button"
                onClick={() => setDeleteTargetId(inspectingItem.id)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  borderRadius: 8,
                  padding: '0.55rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Trash2 size={14} />
                <span>Delete Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#e2e8f0',
                  borderRadius: 8,
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close Drawer
              </button>
            </div>
          </section>
        </>
      )}

      {/* 8. Window Pop Modal for Deletion Confirmation */}
      <WindowPopModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteFeedback}
        isLoading={isDeletingFeedback}
        title="Delete Feedback Record?"
        message="Are you sure you want to permanently delete this feedback submission? This will purge the entry from the Citadel database."
        type="danger"
        confirmText="Permanently Delete"
        cancelText="Cancel"
      />

      {/* 9. Window Pop Modal for Alert Feedback */}
      {popAlert && (
        <WindowPopModal
          isOpen={Boolean(popAlert)}
          onClose={() => setPopAlert(null)}
          title={popAlert.title}
          message={popAlert.message}
          type={popAlert.type || 'info'}
        />
      )}
    </div>
  );
};
