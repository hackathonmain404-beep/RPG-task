import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { feedbackApi } from '../services/api/feedback';
import { useAuth } from './useAuth';
import { useSSE } from '../hooks/useSSE';
import type { FeedbackType, Feedback } from '../types/contract';

export interface NotificationItem {
  id: string; // unique notification identifier (usually feedbackId)
  feedbackId: string;
  type: FeedbackType;
  title: string;
  originalMessage: string;
  adminReply: string;
  status: string;
  repliedAt: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  hasUnread: boolean;
  isLoading: boolean;
  isDropdownOpen: boolean;
  setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'liferpg_read_notifications_';

function getReadIdsFromStorage(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    return new Set<string>(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
}

function saveReadIdsToStorage(userId: string, readIds: Set<string>): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${userId}`,
      JSON.stringify(Array.from(readIds))
    );
  } catch {
    // LocalStorage quota or access issue
  }
}

function getNotificationTitle(type: FeedbackType, status: string): string {
  const statusLabel = status === 'RESOLVED' ? 'Resolved' : 'Reviewed';
  switch (type) {
    case 'BUG_REPORT':
      return `Council ${statusLabel} Bug Report`;
    case 'FEATURE_REQUEST':
      return `Council ${statusLabel} Feature Suggestion`;
    case 'GENERAL':
    default:
      return `Council ${statusLabel} Feedback`;
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  const [rawFeedbacks, setRawFeedbacks] = useState<Feedback[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    return userId ? getReadIdsFromStorage(userId) : new Set<string>();
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Sync readIds when authenticated user changes
  useEffect(() => {
    if (userId) {
      setReadIds(getReadIdsFromStorage(userId));
    } else {
      setReadIds(new Set<string>());
      setRawFeedbacks([]);
    }
  }, [userId]);

  // Fetch feedback history for notifications
  const refreshNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await feedbackApi.getMyFeedback();
      const list = res.feedbacks || [];
      setRawFeedbacks(list);
    } catch {
      // Offline fallback
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      void refreshNotifications();
    }
  }, [userId, refreshNotifications]);

  // Real-time SSE listener for admin replies
  const sseHandlers = useMemo(
    () => ({
      'feedback:reply': (data: any) => {
        const feedbackId = data?.feedbackId || data?.feedback?.id;
        const adminReply = data?.adminReply || data?.feedback?.adminReply;
        const status = data?.status || data?.feedback?.status || 'REVIEWED';
        const repliedAt = data?.repliedAt || data?.feedback?.repliedAt || new Date().toISOString();
        const type = data?.type || data?.feedback?.type || 'GENERAL';
        const message = data?.message || data?.feedback?.message || '';

        if (feedbackId && adminReply) {
          setRawFeedbacks((prev) => {
            const existingIdx = prev.findIndex((f) => f.id === feedbackId);
            if (existingIdx >= 0) {
              const updated = [...prev];
              updated[existingIdx] = {
                ...updated[existingIdx],
                adminReply,
                status,
                repliedAt,
                type: updated[existingIdx].type || type,
                message: updated[existingIdx].message || message,
              };
              return updated;
            } else {
              return [
                {
                  id: feedbackId,
                  userId: userId || '',
                  type,
                  message,
                  status,
                  adminReply,
                  repliedAt,
                  createdAt: new Date().toISOString(),
                },
                ...prev,
              ];
            }
          });

          // Unmark this notification as read so the bell lights up immediately
          if (userId) {
            setReadIds((prev) => {
              if (prev.has(feedbackId)) {
                const next = new Set(prev);
                next.delete(feedbackId);
                saveReadIdsToStorage(userId, next);
                return next;
              }
              return prev;
            });
          }
        }
      },
    }),
    [userId]
  );

  useSSE(sseHandlers, !!userId);

  // Transform raw feedbacks that have admin replies into notifications
  const notifications: NotificationItem[] = useMemo(() => {
    return rawFeedbacks
      .filter((f) => f.adminReply && typeof f.adminReply === 'string' && f.adminReply.trim().length > 0)
      .map((f) => ({
        id: f.id,
        feedbackId: f.id,
        type: f.type,
        title: getNotificationTitle(f.type, f.status),
        originalMessage: f.message,
        adminReply: f.adminReply as string,
        status: f.status || 'REVIEWED',
        repliedAt: f.repliedAt || f.createdAt,
        createdAt: f.createdAt,
        read: readIds.has(f.id),
      }))
      .sort((a, b) => new Date(b.repliedAt).getTime() - new Date(a.repliedAt).getTime());
  }, [rawFeedbacks, readIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const hasUnread = unreadCount > 0;

  const markAsRead = useCallback(
    (id: string) => {
      if (!userId) return;
      setReadIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        saveReadIdsToStorage(userId, next);
        return next;
      });
    },
    [userId]
  );

  const markAllAsRead = useCallback(() => {
    if (!userId) return;
    const allIds = new Set<string>(readIds);
    notifications.forEach((n) => allIds.add(n.id));
    setReadIds(allIds);
    saveReadIdsToStorage(userId, allIds);
  }, [userId, readIds, notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasUnread,
        isLoading,
        isDropdownOpen,
        setIsDropdownOpen,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      hasUnread: false,
      isLoading: false,
      isDropdownOpen: false,
      setIsDropdownOpen: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      refreshNotifications: async () => {},
    };
  }
  return context;
}
