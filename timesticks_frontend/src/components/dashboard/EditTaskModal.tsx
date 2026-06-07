import React, { useState } from 'react';
import type { Task } from '../../api/tasks';
import type { List } from '../../api/lists';

interface EditTaskModalProps {
  task: Task;
  lists: List[];
  onClose: () => void;
  onSave: (taskId: string, data: {
    title?: string;
    description?: string;
    priority?: 'High' | 'Medium' | 'Low';
    dueDate?: string;
    listId?: string;
  }) => Promise<void>;
}

export default function EditTaskModal({ task, lists, onClose, onSave }: EditTaskModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : today,
    listId: task.list || lists.find(l => l.isDefault)?._id || lists[0]?._id || '',
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
      await onSave(task._id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        dueDate: form.dueDate,
        listId: form.listId || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Edit task">
        <h2>Edit Task</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="title"
              id="edit-task-title"
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
              id="edit-task-desc"
              value={form.description}
              onChange={handleChange}
              placeholder="Description (optional)"
              className="ts-input"
              maxLength={250}
            />
          </div>

          <div className="modal-row">
            <div className="form-group" style={{ flex: 1 }}>
              <select name="priority" id="edit-task-priority" value={form.priority} onChange={handleChange} className="ts-input" style={{ appearance: 'none' }}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <input
                type="date"
                name="dueDate"
                id="edit-task-due"
                value={form.dueDate}
                onChange={handleChange}
                className="ts-input"
              />
            </div>
          </div>

          {lists.length > 1 && (
            <div className="form-group">
              <select name="listId" id="edit-task-list" value={form.listId} onChange={handleChange} className="ts-input" style={{ appearance: 'none' }}>
                {lists.map(l => (
                  <option key={l._id} value={l._id}>{l.isDefault ? 'Inbox' : `${l.title}`}</option>
                ))}
              </select>
            </div>
          )}

          {error && <span className="field-error" style={{ marginBottom: '10px', display: 'block' }}>⚠ {error}</span>}

          <div className="modal-actions">
            <button type="button" id="edit-task-cancel" className="ts-btn ts-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" id="edit-task-submit" className="ts-btn ts-btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
