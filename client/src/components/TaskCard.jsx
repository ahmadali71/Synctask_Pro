import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, MoreVertical, Pencil, Trash2, GripVertical } from 'lucide-react';
import { format } from 'date-fns';

const priorityStyles = {
  Urgent: 'bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-400 border-danger-200 dark:border-danger-500/30',
  High: 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400 border-warning-200 dark:border-warning-500/25',
  Medium: 'bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300 border-primary-200 dark:border-primary-500/25',
  Low: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400 border-surface-200 dark:border-surface-600',
};

const TaskCard = ({ task, index, onEdit, onDelete }) => {
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group card-elevated rounded-xl p-4 mb-3 ${
            snapshot.isDragging
              ? '!shadow-xl ring-2 ring-primary-500/40 rotate-1 scale-[1.02]'
              : 'card-hover'
          }`}
          style={provided.draggableProps.style}
          role="article"
          aria-label={`Task: ${task.title}`}
        >
          <div className="flex items-start gap-2 mb-3">
            <div
              {...provided.dragHandleProps}
              className="mt-0.5 p-1 rounded-lg text-theme-muted opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1 flex flex-wrap gap-1.5 min-w-0">
              {task.labels?.map((label) => (
                <span
                  key={label}
                  className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300"
                >
                  {label}
                </span>
              ))}
              {task.priority && (
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md border ${priorityStyles[task.priority] || ''}`}>
                  {task.priority}
                </span>
              )}
            </div>
            <div className="relative">
              <button
                className="p-1.5 rounded-lg text-theme-muted hover:text-theme-primary hover:bg-surface-100 dark:hover:bg-surface-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                aria-label="Task options"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-8 z-20 hidden group-hover:block focus-within:block glass-strong rounded-xl py-1 min-w-[130px] shadow-lg">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-theme-secondary hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg mx-1"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-lg mx-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-theme-primary mb-1 line-clamp-2 leading-snug pl-7">
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-theme-muted mb-3 line-clamp-2 pl-7 leading-relaxed">{task.description}</p>
          )}

          <div className="flex items-center justify-between pl-7 pt-2 border-t border-[var(--border-default)]">
            {task.dueDate ? (
              <div className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-danger-600 dark:text-danger-400' : 'text-theme-muted'}`}>
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <time dateTime={task.dueDate}>{format(new Date(task.dueDate), 'MMM d')}</time>
              </div>
            ) : (
              <span />
            )}
            <div className="flex -space-x-2">
              {task.assignees?.slice(0, 3).map((assignee, i) => (
                <div
                  key={assignee._id || i}
                  className="h-7 w-7 rounded-lg gradient-bg flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-[var(--bg-elevated)]"
                  title={assignee.name}
                >
                  {assignee.name?.charAt(0) || '?'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
