import React, { useState } from 'react';
import type { Habit } from '../../api/habits';

interface HabitTrackerProps {
  habits: Habit[];
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onAdd: (data: { title: string; description?: string }) => Promise<void>;
}

/* ── Icons ───────────────────────────────────── */
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const FlameIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const TrophyIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

const PencilIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

/* ── Helper for local date string ───────────── */
function getLocalDateStr(d: Date = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* ── Build 1-week history grid ───────────────── */
function buildWeekGrid(createdAt: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = getLocalDateStr(today);
  
  // Use UTC created string from backend, extract date part
  const createdStr = createdAt.split('T')[0];

  // Monday of current week
  const dow = today.getDay(); // 0=Sun
  const mondayOffset = dow === 0 ? 6 : dow - 1;

  // Start = Monday of this week
  const start = new Date(today);
  start.setDate(today.getDate() - mondayOffset);

  const week: { date: string; isToday: boolean; isFuture: boolean; isBeforeCreation: boolean }[] = [];
  for (let d = 0; d < 7; d++) {
    const cell = new Date(start);
    cell.setDate(start.getDate() + d);
    const dateStr = getLocalDateStr(cell);
    week.push({
      date: dateStr,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      isBeforeCreation: dateStr < createdStr,
    });
  }
  return week;
}

/* ── History Grid Component ──────────────────── */
function HabitHistoryGrid({ habit }: { habit: Habit }) {
  const todayStr = getLocalDateStr();

  const historyMap = new Map(
    habit.history.map(h => [h.date.split('T')[0], h.completed])
  );
  // Override today with live todayStatus
  historyMap.set(todayStr, habit.todayStatus);

  const week = buildWeekGrid(habit.createdAt);
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="habit-history-grid" style={{ flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {DAY_LABELS.map((label, i) => (
          <span key={i} className="habit-grid-day-label" style={{ width: '22px', textAlign: 'center' }}>{label}</span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        {week.map(({ date, isToday, isFuture, isBeforeCreation }) => {
          const completed = historyMap.get(date) ?? false;
          let cls = 'habit-cell';
          if (isBeforeCreation || isFuture) cls += ' habit-cell-na';
          else if (completed) cls += ' habit-cell-done';
          else cls += ' habit-cell-missed';
          if (isToday) cls += ' habit-cell-today';
          return (
            <div
              key={date}
              className={cls}
              style={{ width: '22px', height: '22px' }}
              title={isToday ? `${date} · Today` : date}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Add Habit Inline Form ───────────────────── */
interface AddHabitFormProps {
  onAdd: (data: { title: string; description?: string }) => Promise<void>;
  onCancel: () => void;
}

function AddHabitForm({ onAdd, onCancel }: AddHabitFormProps) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (title.length > 50) { setError('Max 50 characters'); return; }
    setLoading(true);
    try {
      await onAdd({ title: title.trim(), description: desc.trim() || undefined });
      onCancel();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="habit-add-form">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            id="add-habit-title"
            value={title}
            onChange={e => { setTitle(e.target.value); setError(''); }}
            placeholder="Habit name (e.g. Read 20 min)"
            className="ts-input"
            autoFocus
            maxLength={50}
          />
          <input
            type="text"
            id="add-habit-desc"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Description (optional)"
            className="ts-input"
            maxLength={250}
          />
          {error && <span className="field-error">— {error}</span>}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" id="add-habit-cancel" className="ts-btn ts-btn-ghost" style={{ padding: '7px 14px' }} onClick={onCancel}>Cancel</button>
            <button type="submit" id="add-habit-submit" className="ts-btn ts-btn-primary" style={{ padding: '7px 14px' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Add Habit'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ── Main HabitTracker Export ────────────────── */
export default function HabitTracker({ habits, onToggle, onDelete, onEdit, onAdd }: HabitTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Habits — Today</h2>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {habits.filter(h => h.todayStatus).length}/{habits.length} done
        </span>
      </div>

      {habits.length === 0 && !showAddForm && (
        <div className="empty-state">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
          <span>No habits yet — start building streaks today!</span>
        </div>
      )}

      <div className="habit-tracker-list">
        {habits.map(habit => (
          <div
            key={habit._id}
            className="habit-tracker-card"
            onMouseEnter={() => setHoveredId(habit._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Header row: toggle + info + actions */}
            <div className="habit-tracker-header">
              {/* Toggle */}
              <button
                className={`habit-toggle${habit.todayStatus ? ' done' : ''}`}
                onClick={() => onToggle(habit._id)}
                aria-label={habit.todayStatus ? 'Uncheck habit' : 'Mark habit done'}
                id={`habit-toggle-${habit._id}`}
              >
                {habit.todayStatus && <CheckIcon />}
              </button>

              {/* Info */}
              <div className="habit-tracker-info">
                <p
                  className="habit-name"
                  style={{
                    textDecoration: habit.todayStatus ? 'line-through' : 'none',
                    color: habit.todayStatus ? 'var(--text-muted)' : 'var(--text-primary)',
                  }}
                >
                  {habit.title}
                </p>
                {habit.description && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {habit.description}
                  </p>
                )}
                <div className="habit-streak-row">
                  {habit.currentStreak > 0 ? (
                    <span className="habit-streak-badge">
                      <FlameIcon />
                      {habit.currentStreak} day streak
                    </span>
                  ) : (
                    <span className="habit-no-streak">Start today!</span>
                  )}
                  <span className="habit-best-streak">
                    <TrophyIcon />
                    Best: {habit.highestStreak}
                  </span>
                </div>
              </div>

              {/* Actions (hover-reveal) */}
              <div className="task-actions" style={{ opacity: hoveredId === habit._id ? 1 : 0 }}>
                <button
                  className="habit-edit"
                  onClick={() => onEdit(habit)}
                  aria-label="Edit habit"
                  id={`habit-edit-${habit._id}`}
                >
                  <PencilIcon />
                </button>
                <button
                  className="habit-delete"
                  onClick={() => onDelete(habit._id)}
                  aria-label="Delete habit"
                  id={`habit-delete-${habit._id}`}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>

            {/* 4-week history grid */}
            <HabitHistoryGrid habit={habit} />
          </div>
        ))}
      </div>

      {/* Add form or button */}
      {showAddForm ? (
        <AddHabitForm onAdd={onAdd} onCancel={() => setShowAddForm(false)} />
      ) : (
        <button className="add-task-btn" id="add-habit-open" onClick={() => setShowAddForm(true)} style={{ marginTop: '10px' }}>
          <PlusIcon />
          Add Habit
        </button>
      )}
    </div>
  );
}
