import React from 'react';
import { useForm } from 'react-hook-form';
import { User, Bell, Palette, Sparkles } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const SettingsSection = ({ icon: Icon, title, children }) => (
  <section className="card-elevated rounded-2xl p-6 sm:p-8">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-default)]">
      <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-bold text-theme-primary">{title}</h2>
    </div>
    {children}
  </section>
);

const Settings = () => {
  const user = useAuthStore((s) => s.user);
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const onSubmit = () => {
    toast.success('Profile saved locally (API update coming soon)');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <SettingsSection icon={User} title="Profile">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Full name" {...register('name')} />
          <Input label="Email" type="email" disabled {...register('email')} />
          <p className="text-xs text-theme-muted -mt-2">Email cannot be changed</p>
          <Button type="submit" size="sm">Save profile</Button>
        </form>
      </SettingsSection>

      <SettingsSection icon={Palette} title="Appearance">
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)]">
          <div>
            <p className="font-semibold text-theme-primary capitalize">{theme} mode</p>
            <p className="text-sm text-theme-muted mt-0.5">
              Optimized contrast for readability (WCAG-oriented)
            </p>
          </div>
          <Button variant="outline" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              theme === 'light'
                ? 'border-primary-500 ring-4 ring-primary-500/15'
                : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="h-8 w-full rounded-lg bg-surface-100 border border-surface-200 mb-2" />
            <span className="text-sm font-semibold text-theme-primary">Light</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              theme === 'dark'
                ? 'border-primary-500 ring-4 ring-primary-500/15'
                : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="h-8 w-full rounded-lg bg-surface-900 border border-surface-700 mb-2" />
            <span className="text-sm font-semibold text-theme-primary">Dark</span>
          </button>
        </div>
      </SettingsSection>

      <SettingsSection icon={Bell} title="Notifications">
        <div className="space-y-4">
          {[
            { label: 'Task assignment alerts', defaultChecked: true },
            { label: 'Due date reminders', defaultChecked: true },
            { label: 'Workspace invites', defaultChecked: true },
          ].map(({ label, defaultChecked }) => (
            <label
              key={label}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                defaultChecked={defaultChecked}
                className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-theme-secondary">{label}</span>
            </label>
          ))}
        </div>
      </SettingsSection>

      <div className="flex items-center gap-2 text-xs text-theme-muted px-1">
        <Sparkles className="h-3.5 w-3.5 text-primary-500" />
        SyncTask Pro — built for modern teams
      </div>
    </div>
  );
};

export default Settings;
