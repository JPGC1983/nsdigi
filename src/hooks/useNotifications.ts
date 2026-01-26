import { useState, useCallback, useEffect } from "react";
import { Notification } from "@/components/notifications/NotificationPanel";

const STORAGE_KEY = "nmsd_notifications";
const MAX_NOTIFICATIONS = 50;
const RETENTION_DAYS = 90;

// Helper to generate unique IDs
const generateId = () => crypto.randomUUID();

// Helper to get relative time string
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString("pt-BR");
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filter out notifications older than retention period
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
        const filtered = parsed.filter((n: Notification & { createdAt?: string }) => {
          if (!n.createdAt) return true;
          return new Date(n.createdAt) > cutoffDate;
        });
        setNotifications(filtered);
      } catch (e) {
        console.error("Failed to parse notifications:", e);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback((
    type: Notification["type"],
    title: string,
    message: string,
    actionUrl?: string
  ) => {
    const newNotification: Notification & { createdAt: string } = {
      id: generateId(),
      type,
      title,
      message,
      time: getRelativeTime(new Date()),
      read: false,
      actionUrl,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      // Keep only the most recent notifications
      return updated.slice(0, MAX_NOTIFICATIONS);
    });

    return newNotification.id;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const openPanel = useCallback(() => setIsOpen(true), []);
  const closePanel = useCallback(() => setIsOpen(false), []);
  const togglePanel = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    notifications,
    unreadCount,
    isOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    openPanel,
    closePanel,
    togglePanel,
  };
};
