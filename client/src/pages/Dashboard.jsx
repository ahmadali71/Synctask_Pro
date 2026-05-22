import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, BarChart3, Plus, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../store/useAuthStore';
import useWorkspaceStore from '../store/useWorkspaceStore';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import { fetchTaskStats } from '../services/taskService';
import { fetchActivity } from '../services/collaborationService';

const statThemes = {
  total: { icon: BarChart3, gradient: 'from-primary-500 to-violet-600', light: 'bg-primary-500/10 text-primary-600 dark:text-primary-400' },
  completed: { icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600', light: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  inProgress: { icon: Clock, gradient: 'from-amber-500 to-orange-500', light: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  overdue: { icon: AlertCircle, gradient: 'from-red-500 to-rose-600', light: 'bg-red-500/10 text-red-600 dark:text-red-400' },
};

const StatCard = ({ title, value, themeKey, delay = 0 }) => {
  const { icon: Icon, gradient, light } = statThemes[themeKey];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="card-elevated rounded-2xl p-6 card-hover overflow-hidden relative"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`} />
      <div className="flex items-center gap-4 relative">
        <div className={`p-3.5 rounded-2xl ${light}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-theme-muted">{title}</p>
          <p className="text-3xl font-bold text-theme-primary tracking-tight">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

const statusBarColors = {
  Pending: 'from-primary-500 to-violet-500',
  'In Progress': 'from-amber-500 to-orange-500',
  Completed: 'from-emerald-500 to-teal-500',
};

const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeWorkspace?._id) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetchTaskStats(activeWorkspace._id),
          fetchActivity(activeWorkspace._id, 1),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data.activities || []);
      } catch {
        setStats({ total: 0, completed: 0, inProgress: 0, overdue: 0, byStatus: {} });
      } finally {
        setLoading(false);
      }
    };
    load();
    const onSync = () => load();
    window.addEventListener('sync:completed', onSync);
    return () => window.removeEventListener('sync:completed', onSync);
  }, [activeWorkspace?._id]);

  if (!activeWorkspace) {
    return (
      <div className="card-elevated rounded-2xl p-16 text-center max-w-lg mx-auto">
        <div className="h-16 w-16 mx-auto rounded-2xl gradient-bg flex items-center justify-center mb-6 opacity-80">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-theme-primary mb-2">No workspace yet</h2>
        <p className="text-theme-muted">Create or select a workspace from the sidebar to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Hey, ${user?.name?.split(' ')[0]} 👋`}
        subtitle={`${activeWorkspace.name} — here's your productivity snapshot`}
        action={
          <Link to="/tasks">
            <Button>
              <Plus className="h-4 w-4" /> New task
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard title="Total tasks" value={stats?.total ?? 0} themeKey="total" delay={0} />
          <StatCard title="Completed" value={stats?.completed ?? 0} themeKey="completed" delay={0.05} />
          <StatCard title="In progress" value={stats?.inProgress ?? 0} themeKey="inProgress" delay={0.1} />
          <StatCard title="Overdue" value={stats?.overdue ?? 0} themeKey="overdue" delay={0.15} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 card-elevated rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-theme-primary mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-500" />
            Tasks by status
          </h3>
          {stats?.byStatus && Object.keys(stats.byStatus).length > 0 ? (
            <div className="space-y-5">
              {Object.entries(stats.byStatus).map(([status, count]) => {
                const total = stats.total || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-theme-secondary">{status}</span>
                      <span className="font-bold text-theme-primary">{count} <span className="text-theme-muted font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${statusBarColors[status] || 'from-primary-500 to-primary-600'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-theme-muted text-sm">Create tasks to see analytics here.</p>
          )}
        </div>

        <div className="card-elevated rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-theme-primary mb-6">Recent activity</h3>
          <div className="space-y-4 max-h-72 overflow-y-auto custom-scrollbar">
            {activity.length === 0 ? (
              <p className="text-sm text-theme-muted italic py-4 text-center">No activity yet</p>
            ) : (
              activity.map((a, i) => (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {a.userId?.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-theme-secondary leading-snug">{a.details}</p>
                    <p className="text-xs text-theme-muted mt-0.5">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
