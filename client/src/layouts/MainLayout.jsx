import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useWorkspaceStore from '../store/useWorkspaceStore';
import {
  LogOut, LayoutDashboard, CheckSquare, Bell, Settings, Sun, Moon,
  Menu, ChevronDown, Plus, Users, Wifi, WifiOff, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationPanel from '../components/NotificationPanel';
import useNotificationStore from '../store/useNotificationStore';

const NavItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`group flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-primary-600 text-white nav-active-glow'
        : 'text-theme-secondary hover:bg-surface-100 dark:hover:bg-surface-800/80 hover:text-theme-primary'
    }`}
  >
    <Icon className={`h-5 w-5 flex-shrink-0 ${active ? '' : 'opacity-70 group-hover:opacity-100'}`} />
    <span>{label}</span>
  </Link>
);

const SidebarContent = ({ isOnline }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { activeWorkspace, workspaces, createWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const handleCreateWorkspace = async () => {
    const name = prompt('Workspace name:');
    if (!name?.trim()) return;
    try {
      await createWorkspace(name.trim());
      toast.success('Workspace created');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-[4.5rem] flex items-center gap-3 px-5 border-b border-[var(--border-default)]">
        <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center shadow-md">
          <CheckSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold gradient-text leading-tight block">SyncTask</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-theme-muted">Pro</span>
        </div>
      </div>

      <div className="px-4 pt-5 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-theme-muted mb-2 px-1">Workspace</p>
        <div className="relative">
          <button
            onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm rounded-xl border-2 border-[var(--border-default)] bg-[var(--bg-muted)] hover:border-primary-400/50 transition-all"
          >
            <span className="truncate font-medium text-theme-primary">
              {activeWorkspace?.name || 'Select workspace'}
            </span>
            <ChevronDown className={`h-4 w-4 text-theme-muted ml-2 transition-transform ${wsDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {wsDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute z-30 w-full mt-2 glass-strong rounded-xl overflow-hidden"
              >
                {workspaces.map((ws) => (
                  <button
                    key={ws._id}
                    onClick={() => { setActiveWorkspace(ws); setWsDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${
                      activeWorkspace?._id === ws._id
                        ? 'bg-primary-600/10 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-theme-secondary hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`}
                  >
                    {ws.name}
                  </button>
                ))}
                <button
                  onClick={() => { handleCreateWorkspace(); setWsDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 border-t border-[var(--border-default)] hover:bg-primary-50 dark:hover:bg-primary-900/20"
                >
                  <Plus className="h-4 w-4" /> New workspace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/dashboard'} />
        <NavItem to="/tasks" icon={CheckSquare} label="Tasks" active={location.pathname === '/tasks'} />
        <NavItem to="/team" icon={Users} label="Team" active={location.pathname === '/team'} />
        <NavItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
      </nav>

      <div className="px-4 py-3 mx-3 mb-2 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)]">
        <div className={`flex items-center gap-2 text-xs font-semibold ${isOnline ? 'text-accent-600 dark:text-accent-400' : 'text-warning-600 dark:text-warning-500'}`}>
          {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {isOnline ? 'Connected' : 'Offline mode'}
        </div>
        {!isOnline && <p className="text-[10px] text-theme-muted mt-1">Changes sync when back online</p>}
      </div>

      <div className="p-4 border-t border-[var(--border-default)]">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-muted)]">
          <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-theme-primary truncate">{user?.name}</p>
            <p className="text-xs text-theme-muted truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl border-2 border-[var(--border-default)] text-theme-secondary hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-warning-500" /> : <Moon className="h-4 w-4 text-primary-500" />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl text-danger-600 bg-danger-50 dark:bg-danger-500/10 dark:text-danger-500 hover:bg-danger-100 dark:hover:bg-danger-500/20 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Exit
          </button>
        </div>
      </div>
    </div>
  );
};

const MainLayout = () => {
  const { user } = useAuthStore();
  const { initTheme } = useThemeStore();
  const { activeWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifOpen, setNotifOpen] = useState(false);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  useEffect(() => { initTheme(); }, [initTheme]);
  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);
  useEffect(() => { if (user) fetchNotifications(); }, [user, fetchNotifications]);
  useEffect(() => {
    const onOn = () => setIsOnline(true);
    const onOff = () => setIsOnline(false);
    window.addEventListener('online', onOn);
    window.addEventListener('offline', onOff);
    return () => { window.removeEventListener('online', onOn); window.removeEventListener('offline', onOff); };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden app-mesh-bg">
      <aside className="hidden lg:flex w-[17.5rem] flex-col border-r border-[var(--border-default)] bg-[var(--bg-elevated)]/80 backdrop-blur-xl">
        <SidebarContent isOnline={isOnline} />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-surface-950/70 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 w-[18rem] z-50 bg-[var(--bg-elevated)] border-r border-[var(--border-default)] shadow-2xl lg:hidden"
            >
              <SidebarContent isOnline={isOnline} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-[4.5rem] flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]/70 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl text-theme-muted hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-theme-muted hidden sm:block">Workspace</p>
              <h2 className="text-lg font-bold text-theme-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-500 hidden sm:block" />
                {activeWorkspace?.name || 'SyncTask Pro'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2.5 rounded-xl text-theme-muted hover:text-theme-primary hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              aria-label="Notifications"
              aria-expanded={notifOpen}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
