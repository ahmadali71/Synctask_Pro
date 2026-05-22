import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck } from 'lucide-react';
import useNotificationStore from '../store/useNotificationStore';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead, isLoading } =
    useNotificationStore();

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 glass-strong rounded-2xl overflow-hidden shadow-2xl"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-default)] bg-[var(--bg-muted)]">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span className="font-bold text-theme-primary">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs font-bold bg-primary-600 text-white px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-theme-muted">Loading…</div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell className="h-10 w-10 text-theme-muted mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-theme-muted">All caught up!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={`w-full text-left px-5 py-3.5 border-b border-[var(--border-default)] last:border-0 transition-colors ${
                      !n.isRead
                        ? 'bg-primary-500/5 hover:bg-primary-500/10'
                        : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
                    }`}
                  >
                    <p className="text-sm text-theme-primary leading-snug">{n.message}</p>
                    <p className="text-xs text-theme-muted mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
