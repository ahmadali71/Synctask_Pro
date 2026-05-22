import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const AuthBootstrap = () => {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (!isBootstrapping) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center app-mesh-bg"
      role="status"
      aria-live="polite"
      aria-label="Loading application"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="h-16 w-16 mx-auto rounded-2xl gradient-bg flex items-center justify-center shadow-lg nav-active-glow mb-6"
        >
          <CheckSquare className="h-8 w-8 text-white" />
        </motion.div>
        <p className="text-sm font-medium text-theme-muted">Loading SyncTask Pro…</p>
        <div className="mt-4 h-1 w-32 mx-auto rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden">
          <motion.div
            className="h-full gradient-bg rounded-full"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            style={{ width: '50%' }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthBootstrap;
