import { useState } from 'react';
import type { Task } from '../../api/tasks';
import type { List } from '../../api/lists';

interface TaskListProps {
  tasks: Task[];
  lists: List[];
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onAddClick: () => void;
  title?: string;
  overdueTasks?: Task[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── Icons ──────────────────────────────────── */
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const PencilIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

/* Folder/list icon for list tag */
const ListTagIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);

/* Calendar icon for due date */
const CalendarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

/* Priority flag icon */
const FlagIcon = ({ color }: { color: string }) => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const priorityColors: Record<string, string> = {
  High: '#dc2626', Medium: '#d97706', Low: '#16a34a'
};

export default function TaskList({ tasks, lists, onToggle, onDelete, onEdit, onAddClick, title = 'Tasks', overdueTasks = [] }: TaskListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const getListName = (listId: string) => lists.find(l => l._id === listId)?.title || '';

  const pending = tasks.filter(t => !t.done);
  const done    = tasks.filter(t => t.done);
  const sorted  = [...pending, ...done];

  const renderTaskCard = (task: Task) => (
    <div
      key={task._id}
      className="task-item"
      onMouseEnter={() => setHoveredId(task._id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      {/* Check */}
      <button
        className={`task-check${task.done ? ' done' : ''}`}
        onClick={() => onToggle(task._id)}
        aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
        id={`task-toggle-${task._id}`}
      >
        <CheckIcon />
      </button>

      {/* Content */}
      <div className="task-body">
        <p className={`task-title${task.done ? ' done' : ''}`}>{task.title}</p>
        <div className="task-meta">
          {getListName(task.list) && (
            <span className="task-list-tag">
              <ListTagIcon />
              {getListName(task.list)}
            </span>
          )}
          <span className={`task-priority priority-${task.priority}`}>
            <FlagIcon color={priorityColors[task.priority]} />
            {task.priority}
          </span>
          <span className="task-due">
            <CalendarIcon />
            {formatDate(task.dueDate)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="task-actions" style={{ opacity: hoveredId === task._id ? 1 : 0 }}>
        <button
          className="task-edit"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          id={`task-edit-${task._id}`}
        >
          <PencilIcon />
        </button>
        <button
          className="task-delete"
          onClick={() => onDelete(task._id)}
          aria-label="Delete task"
          id={`task-delete-${task._id}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );

  const hasAnyTasks = sorted.length > 0 || overdueTasks.length > 0;

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {pending.length} remaining
        </span>
      </div>

      {!hasAnyTasks ? (
        <div className="empty-state">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/>
          </svg>
          <span>No tasks here — add your first one!</span>
        </div>
      ) : (
        <div className="task-list">
          {sorted.map(task => renderTaskCard(task))}

          {/* Overdue section shown only in Today view */}
          {overdueTasks.length > 0 && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                margin: '18px 0 8px',
              }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: '#ef4444',
                }}>⚠ Overdue</span>
                <div style={{ flex: 1, height: '1px', background: '#ef444430' }} />
                <span style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 500 }}>
                  {overdueTasks.length} task{overdueTasks.length !== 1 ? 's' : ''}
                </span>
              </div>
              {overdueTasks.map(task => (
                <div
                  key={task._id}
                  className="task-item overdue-task"
                  onMouseEnter={() => setHoveredId(task._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ borderLeft: '3px solid #ef4444' }}
                >
                  {/* Check */}
                  <button
                    className={`task-check${task.done ? ' done' : ''}`}
                    onClick={() => onToggle(task._id)}
                    aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
                    id={`task-toggle-${task._id}`}
                  >
                    <CheckIcon />
                  </button>

                  {/* Content */}
                  <div className="task-body">
                    <p className={`task-title${task.done ? ' done' : ''}`}>{task.title}</p>
                    <div className="task-meta">
                      {getListName(task.list) && (
                        <span className="task-list-tag">
                          <ListTagIcon />
                          {getListName(task.list)}
                        </span>
                      )}
                      <span className={`task-priority priority-${task.priority}`}>
                        <FlagIcon color={priorityColors[task.priority]} />
                        {task.priority}
                      </span>
                      <span className="task-due" style={{ color: '#ef4444' }}>
                        <CalendarIcon />
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="task-actions" style={{ opacity: hoveredId === task._id ? 1 : 0 }}>
                    <button
                      className="task-edit"
                      onClick={() => onEdit(task)}
                      aria-label="Edit task"
                      id={`task-edit-overdue-${task._id}`}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      className="task-delete"
                      onClick={() => onDelete(task._id)}
                      aria-label="Delete task"
                      id={`task-delete-overdue-${task._id}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <button className="add-task-btn" id="add-task-open" onClick={onAddClick} style={{ marginTop: '10px' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Task
      </button>
    </div>
  );
}
