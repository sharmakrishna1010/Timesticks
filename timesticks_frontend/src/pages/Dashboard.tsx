import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksApi, type Task } from '../api/tasks';
import { listsApi, type List } from '../api/lists';
import { habitsApi, type Habit } from '../api/habits';
import Sidebar, { type ViewMode } from '../components/dashboard/Sidebar';
import TaskList from '../components/dashboard/TaskList';
import HabitTracker from '../components/dashboard/HabitTracker';
import AddTaskModal from '../components/dashboard/AddTaskModal';
import EditTaskModal from '../components/dashboard/EditTaskModal';
import EditHabitModal from '../components/dashboard/EditHabitModal';
import CreateListModal from '../components/dashboard/CreateListModal';
import DeleteListModal from '../components/dashboard/DeleteListModal';

interface Toast { id: number; type: 'success' | 'error' | 'info'; message: string; }
let toastId = 0;

function formatTodayHeader() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/* ── Derive tasks to display ───────────────── */
function getFilteredTasks(tasks: Task[], viewMode: ViewMode, todayStr: string): Task[] {
  if (viewMode === 'today') {
    return tasks.filter(t => {
      const due = t.dueDate?.split('T')[0];
      return due <= todayStr; // includes overdue + today (done or pending)
    });
  }
  if (viewMode === 'all') return tasks;
  if (viewMode === 'next7') {
    const next7 = new Date();
    next7.setDate(next7.getDate() + 7);
    const next7Str = next7.toISOString().split('T')[0];
    return tasks.filter(t => {
      const due = t.dueDate?.split('T')[0];
      return due >= todayStr && due <= next7Str;
    });
  }
  if (viewMode.startsWith('list:')) {
    const listId = viewMode.slice(5);
    return tasks.filter(t => t.list === listId);
  }
  if (viewMode.startsWith('priority:')) {
    const priority = viewMode.slice(9) as Task['priority'];
    return tasks.filter(t => t.priority === priority);
  }
  return tasks;
}

function getViewLabel(viewMode: ViewMode, lists: List[]): string {
  if (viewMode === 'today')  return 'Today';
  if (viewMode === 'all')    return 'All Tasks';
  if (viewMode === 'next7')  return 'Next 7 Days';
  if (viewMode === 'habits') return 'Habits';
  if (viewMode.startsWith('list:')) {
    const id = viewMode.slice(5);
    return lists.find(l => l._id === id)?.title ?? 'List';
  }
  if (viewMode.startsWith('priority:')) {
    return `${viewMode.slice(9)} Priority`;
  }
  return 'Today';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Core data ──────────────────────────────
  const [tasks,  setTasks]  = useState<Task[]>([]);
  const [lists,  setLists]  = useState<List[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // ── View ───────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>('today');

  // ── Modals ─────────────────────────────────
  const [showAddTask,   setShowAddTask]   = useState(false);
  const [editingTask,   setEditingTask]   = useState<Task | null>(null);
  const [editingHabit,  setEditingHabit]  = useState<Habit | null>(null);
  const [showCreateList, setShowCreateList] = useState(false);
  const [deletingList,  setDeletingList]  = useState<List | null>(null);

  // ── Toasts ─────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((type: Toast['type'], message: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // ── Load data ──────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [tasksRes, listsRes, habitsRes] = await Promise.all([
          tasksApi.getAll(), listsApi.getAll(), habitsApi.getAll(),
        ]);
        setTasks(tasksRes.data);
        setLists(listsRes.data);
        setHabits(habitsRes.data);
      } catch (err: any) {
        if ([401, 403].includes(err?.response?.status)) { navigate('/login'); return; }
        toast('error', 'Failed to load data');
      } finally { setLoading(false); }
    })();
  }, []);

  // ── Derived state ──────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];
  const isHabitsView = viewMode === 'habits';
  const displayedTasks = isHabitsView ? [] : getFilteredTasks(tasks, viewMode, todayStr);
  const viewLabel = getViewLabel(viewMode, lists);

  // ── Task handlers ──────────────────────────
  const handleToggleTask = async (taskId: string) => {
    const prev = tasks.find(t => t._id === taskId)!;
    setTasks(ts => ts.map(t => t._id === taskId ? { ...t, done: !t.done } : t));
    try {
      const res = await tasksApi.toggle(taskId);
      setTasks(ts => ts.map(t => t._id === taskId ? res.data : t));
    } catch {
      setTasks(ts => ts.map(t => t._id === taskId ? prev : t));
      toast('error', 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const prev = tasks;
    setTasks(ts => ts.filter(t => t._id !== taskId));
    try { await tasksApi.delete(taskId); toast('success', 'Task deleted'); }
    catch { setTasks(prev); toast('error', 'Failed to delete task'); }
  };

  const handleAddTask = async (data: Parameters<typeof tasksApi.create>[0]) => {
    const res = await tasksApi.create(data);
    setTasks(ts => [res.data, ...ts]);
    toast('success', 'Task added!');
  };

  const handleEditTask = async (taskId: string, data: Parameters<typeof tasksApi.update>[1]) => {
    const res = await tasksApi.update(taskId, data);
    setTasks(ts => ts.map(t => t._id === taskId ? res.data : t));
    toast('success', 'Task updated!');
  };

  // ── Habit handlers ─────────────────────────
  const handleToggleHabit = async (habitId: string) => {
    const prev = habits.find(h => h._id === habitId)!;
    setHabits(hs => hs.map(h => h._id === habitId ? { ...h, todayStatus: !h.todayStatus } : h));
    try {
      const res = await habitsApi.toggle(habitId);
      setHabits(hs => hs.map(h => h._id === habitId ? res.data.habit : h));
    } catch {
      setHabits(hs => hs.map(h => h._id === habitId ? prev : h));
      toast('error', 'Failed to toggle habit');
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    const prev = habits;
    setHabits(hs => hs.filter(h => h._id !== habitId));
    try { await habitsApi.delete(habitId); toast('success', 'Habit deleted'); }
    catch { setHabits(prev); toast('error', 'Failed to delete habit'); }
  };

  const handleAddHabit = async (data: { title: string; description?: string }) => {
    const res = await habitsApi.create(data);
    setHabits(hs => [res.data, ...hs]);
    toast('success', 'Habit created!');
  };

  const handleEditHabit = async (habitId: string, data: { title: string; description?: string }) => {
    const res = await habitsApi.update(habitId, data);
    setHabits(hs => hs.map(h => h._id === habitId ? res.data : h));
    toast('success', 'Habit updated!');
  };

  // ── List handlers ──────────────────────────
  const handleCreateList = async (title: string) => {
    const res = await listsApi.create(title);
    setLists(ls => [...ls, res.data]);
    toast('success', `List "${title}" created!`);
  };

  const handleRenameList = async (updatedList: List) => {
    const res = await listsApi.update(updatedList._id, updatedList.title);
    setLists(ls => ls.map(l => l._id === updatedList._id ? res.data : l));
    toast('success', 'List renamed!');
  };

  const handleDeleteList = async (listId: string, deleteAllTasks: boolean) => {
    await listsApi.delete(listId, deleteAllTasks);
    setLists(ls => ls.filter(l => l._id !== listId));
    const tasksRes = await tasksApi.getAll();
    setTasks(tasksRes.data);
    if (viewMode === `list:${listId}`) setViewMode('today');
    toast('success', deleteAllTasks ? 'List and tasks deleted' : 'List deleted, tasks moved to Inbox');
  };

  // ── Default list ID for Add Task modal ──────
  const activeListId = viewMode.startsWith('list:') ? viewMode.slice(5) : undefined;

  if (loading) {
    return (
      <div className="loading-page">
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, border: '3px solid var(--border)',
            borderTopColor: 'var(--blue)', borderRadius: '50%',
            animation: 'spin 600ms linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading your workspace…</p>
        </div>
      </div>
    );
  }

  // Header subtitle
  const headerSub = isHabitsView
    ? `${habits.filter(h => h.todayStatus).length} of ${habits.length} done today`
    : viewMode === 'today'
    ? formatTodayHeader()
    : viewMode === 'all'
    ? `${tasks.filter(t => !t.done).length} pending total`
    : viewMode === 'next7'
    ? 'Coming up in the next 7 days'
    : `${displayedTasks.filter(t => !t.done).length} task${displayedTasks.filter(t => !t.done).length !== 1 ? 's' : ''} remaining`;

  return (
    <div className="dashboard">
      <Sidebar
        lists={lists}
        tasks={tasks.map(t => ({ list: t.list, done: t.done, priority: t.priority, dueDate: t.dueDate }))}
        viewMode={viewMode}
        onSetView={setViewMode}
        onCreateList={() => setShowCreateList(true)}
        onRenameList={handleRenameList}
        onDeleteList={setDeletingList}
        habitCount={habits.length}
      />

      <main className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">{viewLabel}</h1>
            <p className="dash-date">{headerSub}</p>
          </div>
          {!isHabitsView && (
            <button id="dash-add-task" className="ts-btn ts-btn-primary" style={{ padding: '8px 16px' }} onClick={() => setShowAddTask(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Task
            </button>
          )}
        </div>

        {/* Content */}
        <div className="dash-content">
          {isHabitsView ? (
            <HabitTracker
              habits={habits}
              onToggle={handleToggleHabit}
              onDelete={handleDeleteHabit}
              onEdit={setEditingHabit}
              onAdd={handleAddHabit}
            />
          ) : (
            <>
              <TaskList
                tasks={displayedTasks}
                lists={lists}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onEdit={setEditingTask}
                onAddClick={() => setShowAddTask(true)}
                title={viewLabel}
              />

              {/* Show habit tracker in Today view as secondary section */}
              {viewMode === 'today' && (
                <>
                  <div style={{ height: '1px', background: 'var(--border)' }} />
                  <HabitTracker
                    habits={habits}
                    onToggle={handleToggleHabit}
                    onDelete={handleDeleteHabit}
                    onEdit={setEditingHabit}
                    onAdd={handleAddHabit}
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Modals ──────────────────────────── */}
      {showAddTask && (
        <AddTaskModal lists={lists} onClose={() => setShowAddTask(false)} onAdd={handleAddTask} defaultListId={activeListId} />
      )}
      {editingTask && (
        <EditTaskModal task={editingTask} lists={lists} onClose={() => setEditingTask(null)} onSave={handleEditTask} />
      )}
      {editingHabit && (
        <EditHabitModal habit={editingHabit} onClose={() => setEditingHabit(null)} onSave={handleEditHabit} />
      )}
      {showCreateList && (
        <CreateListModal onClose={() => setShowCreateList(false)} onCreate={handleCreateList} />
      )}
      {deletingList && (
        <DeleteListModal
          list={deletingList}
          taskCount={tasks.filter(t => t.list === deletingList._id).length}
          onClose={() => setDeletingList(null)}
          onDelete={handleDeleteList}
        />
      )}

      {/* ── Toasts ──────────────────────────── */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
    </div>
  );
}
