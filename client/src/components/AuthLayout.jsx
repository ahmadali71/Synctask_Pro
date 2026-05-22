import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckSquare, Zap, Shield, Users } from 'lucide-react';

const features = [
  { icon: Zap, text: 'Real-time collaboration' },
  { icon: Shield, text: 'Offline-first sync' },
  { icon: Users, text: 'Team workspaces' },
];

const AuthLayout = ({ children, title, subtitle }) => (
  <div className="auth-mesh-bg flex min-h-screen">
    {/* Decorative panel — desktop */}
    <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg opacity-95" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
            <CheckSquare className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">SyncTask Pro</span>
        </Link>

        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl xl:text-5xl font-bold leading-tight mb-6"
          >
            Work together.
            <br />
            <span className="text-primary-200">Ship faster.</span>
          </motion.h2>
          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3 text-white/90"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-medium">{text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-white/60">© SyncTask Pro — Enterprise task management</p>
      </div>
    </div>

    {/* Form panel */}
    <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">SyncTask Pro</span>
        </div>

        <div className="glass rounded-2xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">{title}</h1>
            <p className="mt-2 text-sm text-theme-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  </div>
);

export default AuthLayout;
