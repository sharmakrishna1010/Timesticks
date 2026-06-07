import { useState } from 'react';
import type { List } from '../../api/lists';

interface DeleteListModalProps {
  list: List;
  taskCount: number;
  onClose: () => void;
  onDelete: (listId: string, deleteAllTasks: boolean) => Promise<void>;
}

export default function DeleteListModal({ list, taskCount, onClose, onDelete }: DeleteListModalProps) {
  const [deleteAllTasks, setDeleteAllTasks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(list._id, deleteAllTasks);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Delete list" style={{ maxWidth: 380 }}>
        <h2>Delete "{list.title}"?</h2>

        {taskCount > 0 ? (
          <div style={{ marginBottom: '18px' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              This list has <strong>{taskCount}</strong> task{taskCount !== 1 ? 's' : ''}. What should happen to them?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Move to Inbox option */}
              <label className={`delete-list-option${!deleteAllTasks ? ' selected' : ''}`} id="delete-list-move">
                <input
                  type="radio"
                  name="deleteMode"
                  checked={!deleteAllTasks}
                  onChange={() => setDeleteAllTasks(false)}
                  style={{ display: 'none' }}
                />
                <span className="option-radio" />
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Move tasks to Inbox</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tasks will be kept safe in your default Inbox list</p>
                </div>
              </label>

              {/* Delete all option */}
              <label className={`delete-list-option${deleteAllTasks ? ' selected danger' : ''}`} id="delete-list-all">
                <input
                  type="radio"
                  name="deleteMode"
                  checked={deleteAllTasks}
                  onChange={() => setDeleteAllTasks(true)}
                  style={{ display: 'none' }}
                />
                <span className="option-radio" />
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: deleteAllTasks ? 'var(--error)' : 'var(--text-primary)' }}>Delete all tasks</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This cannot be undone</p>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            This list is empty. It will be permanently removed.
          </p>
        )}

        {error && <span className="field-error" style={{ marginBottom: '10px', display: 'block' }}>⚠ {error}</span>}

        <div className="modal-actions">
          <button type="button" id="delete-list-cancel" className="ts-btn ts-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            id="delete-list-confirm"
            className={`ts-btn ${deleteAllTasks ? 'ts-btn-danger' : 'ts-btn-primary'}`}
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <span className="spinner" style={{ borderTopColor: deleteAllTasks ? 'var(--error)' : '#fff' }} /> : (deleteAllTasks ? 'Delete Everything' : 'Delete List')}
          </button>
        </div>
      </div>
    </div>
  );
}
