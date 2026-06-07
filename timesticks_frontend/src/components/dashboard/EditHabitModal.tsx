import React, { useState } from 'react';
import type { Habit } from '../../api/habits';

interface EditHabitModalProps {
  habit: Habit;
  onClose: () => void;
  onSave: (habitId: string, data: { title: string; description?: string }) => Promise<void>;
}

export default function EditHabitModal({ habit, onClose, onSave }: EditHabitModalProps) {
  const [title, setTitle] = useState(habit.title);
  const [desc, setDesc] = useState(habit.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (title.length > 50) { setError('Title must be under 50 characters'); return; }
    setLoading(true);
    try {
      await onSave(habit._id, {
        title: title.trim(),
        description: desc.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Edit habit">
        <h2>Edit Habit</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="edit-habit-title"
              value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              placeholder="Habit name"
              className="ts-input"
              autoFocus
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              id="edit-habit-desc"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Description (optional)"
              className="ts-input"
              maxLength={250}
            />
          </div>

          {error && <span className="field-error" style={{ marginBottom: '10px', display: 'block' }}>⚠ {error}</span>}

          <div className="modal-actions">
            <button type="button" id="edit-habit-cancel" className="ts-btn ts-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" id="edit-habit-submit" className="ts-btn ts-btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
