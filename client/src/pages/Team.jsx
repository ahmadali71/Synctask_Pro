import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Crown, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useAuthStore from '../store/useAuthStore';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import * as collaborationService from '../services/collaborationService';

const roleIcon = { admin: Shield, member: User, viewer: User };

const Team = () => {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const user = useAuthStore((s) => s.user);
  const [members, setMembers] = useState({ owner: null, members: [] });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMembers = async () => {
    if (!activeWorkspace?._id) return;
    setLoading(true);
    try {
      const res = await collaborationService.fetchMembers(activeWorkspace._id);
      setMembers(res.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMembers(); }, [activeWorkspace?._id]);
  useEffect(() => {
    const handler = (e) => setOnlineUsers(e.detail.online || []);
    window.addEventListener('presence', handler);
    return () => window.removeEventListener('presence', handler);
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await collaborationService.inviteMember(activeWorkspace._id, inviteEmail.trim());
      toast.success('Invitation sent');
      setInviteEmail('');
      loadMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invite failed');
    }
  };

  const isOwner = members.owner?._id === user?._id;
  const canInvite = isOwner || members.members.some((m) => m.userId?._id === user?._id && m.role === 'admin');

  if (!activeWorkspace) {
    return (
      <div className="card-elevated rounded-2xl p-16 text-center text-theme-muted">Select a workspace first.</div>
    );
  }

  const allMembers = [
    { ...(members.owner || {}), role: 'owner' },
    ...members.members.map((m) => ({ ...m.userId, role: m.role })),
  ].filter((m) => m._id);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Team"
        subtitle={`${allMembers.length} members in ${activeWorkspace.name}`}
      />

      {onlineUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {onlineUsers.map((u) => (
            <span
              key={u.userId}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {u.userName}
            </span>
          ))}
        </div>
      )}

      {canInvite && (
        <form onSubmit={handleInvite} className="card-elevated rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-4 items-end">
          <Input
            label="Invite by email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            className="flex-1"
          />
          <Button type="submit">
            <UserPlus className="h-4 w-4" /> Invite
          </Button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {allMembers.map((member, i) => {
            const Icon = member.role === 'owner' ? Crown : roleIcon[member.role] || User;
            const isOnline = onlineUsers.some((u) => u.userId === member._id);
            return (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-elevated rounded-2xl p-5 flex items-center gap-4 card-hover"
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl gradient-bg flex items-center justify-center text-white font-bold shadow-md">
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-[var(--bg-elevated)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-theme-primary">{member.name}</p>
                  <p className="text-sm text-theme-muted truncate">{member.email}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-xl bg-[var(--bg-muted)] text-theme-secondary border border-[var(--border-default)]">
                  <Icon className="h-3.5 w-3.5" />
                  {member.role}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Team;
