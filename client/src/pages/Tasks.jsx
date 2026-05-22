import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, Filter, Search, X } from 'lucide-react';
import useTaskStore from '../store/useTaskStore';
import useWorkspaceStore from '../store/useWorkspaceStore';
import PageHeader from '../components/PageHeader';
import TaskCard from '../components/TaskCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'In Progress', 'Completed'];
const columnStyles = {
  Pending: { class: 'kanban-column-pending', dot: 'bg-primary-500', label: 'To do' },
  'In Progress': { class: 'kanban-column-progress', dot: 'bg-warning-500', label: 'In progress' },
  Completed: { class: 'kanban-column-done', dot: 'bg-accent-500', label: 'Done' },
};
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
];

const Tasks = () => {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const { tasks, fetchTasks, updateTaskStatus, addTask, updateTask, deleteTask, isLoading } =
    useTaskStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sort: 'newest',
  });

  const workspaceId = activeWorkspace?._id;

  useEffect(() => {
    if (workspaceId) {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.sort) params.sort = filters.sort;
      if (searchQuery) params.search = searchQuery;
      fetchTasks(workspaceId, params);
    }
  }, [workspaceId, fetchTasks, filters.status, filters.priority, filters.sort]);

  const onDragEnd = useCallback(
    (result) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index)
        return;
      updateTaskStatus(draggableId, destination.droppableId);
    },
    [updateTaskStatus]
  );

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const handleCreateTask = async (data) => {
    if (!workspaceId) return;
    try {
      await addTask({
        ...data,
        workspaceId,
        status: 'Pending',
        labels: data.labels ? data.labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
        dueDate: data.dueDate || undefined,
      });
      setIsCreateOpen(false);
      reset();
      toast.success('Task created');
    } catch {
      toast.error('Failed to create task');
    }
  };

  const handleEditTask = async (data) => {
    if (!editTask) return;
    try {
      await updateTask(editTask._id, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate || null,
        labels: data.labels ? data.labels.split(',').map((l) => l.trim()).filter(Boolean) : [],
      });
      setEditTask(null);
      toast.success('Task updated');
    } catch {
      toast.error('Failed to update task');
    }
  };

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => t.title?.toLowerCase().includes(q));
    }
    return list;
  }, [tasks, searchQuery]);

  if (!activeWorkspace) {
    return (
      <div className="card-elevated rounded-2xl p-16 text-center text-theme-muted">
        Select or create a workspace to manage tasks.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Task board"
        subtitle={`${activeWorkspace.name} — drag cards to update status`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-muted" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tasks"
                className="pl-9 pr-4 h-11 w-44 sm:w-52 rounded-xl border-2 border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}>
              <Filter className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsCreateOpen(true)} size="sm">
              <Plus className="h-4 w-4" /> Add task
            </Button>
          </div>
        }
      />

      {showFilters && (
        <div className="card-elevated rounded-2xl p-5 mb-5 flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-surface-500 block mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="rounded-xl border-2 border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-theme-primary"
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-surface-500 block mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
              className="rounded-xl border-2 border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-theme-primary"
            >
              <option value="">All</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-surface-500 block mb-1">Sort</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              className="rounded-xl border-2 border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-theme-primary"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setFilters({ status: '', priority: '', sort: 'newest' })}>
            <X className="h-4 w-4" /> Clear
          </Button>
        </div>
      )}

      {isLoading && tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center" role="status">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 min-h-0">
            {STATUSES.map((status) => {
              const col = columnStyles[status];
              return (
              <div
                key={status}
                className={`flex flex-col min-h-[420px] rounded-2xl p-4 border border-[var(--border-default)] ${col.class}`}
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    <h2 className="font-bold text-theme-primary">{col.label}</h2>
                  </div>
                  <span className="text-xs font-bold text-theme-muted bg-[var(--bg-elevated)] px-2.5 py-1 rounded-lg border border-[var(--border-default)]">
                    {filteredTasks.filter((t) => t.status === status).length}
                  </span>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 overflow-y-auto custom-scrollbar min-h-[220px] transition-all rounded-xl p-1 ${
                        snapshot.isDraggingOver ? 'ring-2 ring-primary-500/30 bg-primary-500/5' : ''
                      }`}
                    >
                      {filteredTasks
                        .filter((t) => t.status === status)
                        .map((task, index) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            index={index}
                            onEdit={() => setEditTask(task)}
                            onDelete={async () => {
                              if (confirm('Delete this task?')) {
                                await deleteTask(task._id);
                                toast.success('Task deleted');
                              }
                            }}
                          />
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
            })}
          </div>
        </DragDropContext>
      )}

      <TaskFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
        onSubmit={handleCreateTask}
        register={register}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        reset={reset}
      />

      {editTask && (
        <TaskFormModal
          isOpen={!!editTask}
          onClose={() => setEditTask(null)}
          title="Edit Task"
          defaultValues={{
            title: editTask.title,
            description: editTask.description,
            priority: editTask.priority,
            dueDate: editTask.dueDate ? editTask.dueDate.split('T')[0] : '',
            labels: editTask.labels?.join(', '),
          }}
          onSubmit={handleEditTask}
          register={register}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

const TaskFormModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  register,
  handleSubmit,
  isSubmitting,
  defaultValues,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Title" {...register('title', { required: true })} defaultValue={defaultValues?.title} placeholder="Task title" />
      <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">Description</label>
            <textarea
              {...register('description')}
              defaultValue={defaultValues?.description}
              className="w-full rounded-xl border-2 border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-theme-primary focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
              rows={4}
            />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
              <label className="block text-sm font-medium text-theme-secondary mb-2">Priority</label>
              <select
                {...register('priority')}
                defaultValue={defaultValues?.priority || 'Medium'}
                className="w-full h-11 rounded-xl border-2 border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 text-sm text-theme-primary"
              >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <Input label="Due Date" type="date" {...register('dueDate')} defaultValue={defaultValues?.dueDate} />
      </div>
      <Input label="Labels (comma separated)" {...register('labels')} defaultValue={defaultValues?.labels} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>Save</Button>
      </div>
    </form>
  </Modal>
);

export default Tasks;
