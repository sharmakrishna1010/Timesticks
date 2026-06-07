import React, { useState } from 'react';
import type { Habit } from '../../api/habits';

interface HabitStripProps {
  habits: Habit[];
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onAdd: (data: { title: string; description?: string }) => Promise<void>;
}

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const PencilIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

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
    if (title.length > 50) { setError('Title must be under 50 characters'); return; }
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
    <div className="habit-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
        {error && <span className="field-error">⚠ {error}</span>}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button type="button" id="add-habit-cancel" className="ts-btn ts-btn-ghost" style={{ padding: '7px 14px' }} onClick={onCancel}>Cancel</button>
          <button type="submit" id="add-habit-submit" className="ts-btn ts-btn-primary" style={{ padding: '7px 14px' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Add Habit'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function HabitStrip({ habits, onToggle, onDelete, onEdit, onAdd }: HabitStripProps) {
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

      <div className="habit-strip">
        {habits.length === 0 && !showAddForm && (
          <div className="empty-state">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span>No habits yet — build a streak starting today!</span>
          </div>
        )}

        {habits.map(habit => (
          <div
            key={habit._id}
            className="habit-item"
            onMouseEnter={() => setHoveredId(habit._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Toggle */}
            <button
              className={`habit-toggle${habit.todayStatus ? ' done' : ''}`}
              onClick={() => onToggle(habit._id)}
              aria-label={habit.todayStatus ? 'Uncheck habit' : 'Complete habit'}
              id={`habit-toggle-${habit._id}`}
            >
              {habit.todayStatus ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>○</span>
              )}
            </button>

            {/* Info */}
            <div className="habit-info">
              <p className="habit-name" style={{ textDecoration: habit.todayStatus ? 'line-through' : 'none', color: habit.todayStatus ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                {habit.title}
              </p>
              <p className="habit-streak">
                {habit.currentStreak > 0 && <span className="streak-fire">🔥</span>}
                {habit.currentStreak > 0
                  ? `${habit.currentStreak} day streak · Best: ${habit.highestStreak}`
                  : 'Start your streak today!'}
              </p>
            </div>

            {/* Actions */}
            <div className="task-actions">
              <button
                className="habit-edit"
                onClick={() => onEdit(habit)}
                aria-label="Edit habit"
                id={`habit-edit-${habit._id}`}
                style={{ opacity: hoveredId === habit._id ? 1 : 0 }}
              >
                <PencilIcon />
              </button>
              <button
                className="habit-delete"
                onClick={() => onDelete(habit._id)}
                aria-label="Delete habit"
                id={`habit-delete-${habit._id}`}
                style={{ opacity: hoveredId === habit._id ? 1 : 0 }}
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}

        {/* Inline add form or add button */}
        {showAddForm ? (
          <AddHabitForm onAdd={onAdd} onCancel={() => setShowAddForm(false)} />
        ) : (
          <button className="add-task-btn" id="add-habit-open" onClick={() => setShowAddForm(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Habit
          </button>
        )}
      </div>
    </div>
  );
}
