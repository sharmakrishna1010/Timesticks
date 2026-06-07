import React, { useState } from 'react';
import type { List } from '../../api/lists';

interface AddTaskModalProps {
  lists: List[];
  onClose: () => void;
  defaultListId?: string;
  onAdd: (data: {
    title: string;
    description?: string;
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
    listId?: string;
  }) => Promise<void>;
}

export default function AddTaskModal({ lists, onClose, onAdd, defaultListId }: AddTaskModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    dueDate: today,
    listId: defaultListId || lists.find(l => l.isDefault)?._id || lists[0]?._id || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (form.title.length > 50) { setError('Title must be under 50 characters'); return; }
    setLoading(true);
    try {
      await onAdd({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        dueDate: form.dueDate,
        listId: form.listId || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add task">
        <h2>Add Task</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="title"
              id="add-task-title"
              value={form.title}
              onChange={handleChange}
              placeholder="Task title"
              className="ts-input"
              autoFocus
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="description"
              id="add-task-desc"
              value={form.description}
              onChange={handleChange}
              placeholder="Description (optional)"
              className="ts-input"
              maxLength={250}
            />
          </div>

          <div className="modal-row">
            <div className="form-group" style={{ flex: 1 }}>
              <select name="priority" id="add-task-priority" value={form.priority} onChange={handleChange} className="ts-input" style={{ appearance: 'none' }}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <input
                type="date"
                name="dueDate"
                id="add-task-due"
                value={form.dueDate}
                onChange={handleChange}
                className="ts-input"
                min={today}
              />
            </div>
          </div>

          {lists.length > 1 && (
            <div className="form-group">
              <select name="listId" id="add-task-list" value={form.listId} onChange={handleChange} className="ts-input" style={{ appearance: 'none' }}>
                {lists.map(l => (
                  <option key={l._id} value={l._id}>{l.isDefault ? `Inbox` : l.title}</option>
                ))}
              </select>
            </div>
          )}

          {error && <span className="field-error" style={{ marginBottom: '10px', display: 'block' }}>⚠ {error}</span>}

          <div className="modal-actions">
            <button type="button" id="add-task-cancel" className="ts-btn ts-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" id="add-task-submit" className="ts-btn ts-btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
