import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import useTaskStore from '../store/useTaskStore';

const ConflictModal = () => {
  const conflict = useTaskStore((s) => s.conflict);
  const resolveConflict = useTaskStore((s) => s.resolveConflict);
  const clearConflict = useTaskStore((s) => s.clearConflict);

  if (!conflict) return null;

  return (
    <Modal isOpen={!!conflict} onClose={clearConflict} title="Sync conflict">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-50 dark:bg-warning-500/10 border border-warning-500/20 mb-5">
        <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-theme-secondary">
          This task was updated elsewhere. Choose which version to keep.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div className="p-4 rounded-xl border-2 border-primary-500/30 bg-primary-500/5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-2">Your version</p>
          <p className="font-semibold text-theme-primary">{conflict.localTask?.title}</p>
          <p className="text-xs text-theme-muted mt-1">{conflict.localTask?.status}</p>
        </div>
        <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-2">Server version</p>
          <p className="font-semibold text-theme-primary">{conflict.serverTask?.title}</p>
          <p className="text-xs text-theme-muted mt-1">{conflict.serverTask?.status}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => resolveConflict(false)}>Keep mine</Button>
        <Button onClick={() => resolveConflict(true)}>Use server</Button>
      </div>
    </Modal>
  );
};

export default ConflictModal;
