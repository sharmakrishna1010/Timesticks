import React, { useState } from 'react';

interface CreateListModalProps {
  onClose: () => void;
  onCreate: (title: string) => Promise<void>;
}

export default function CreateListModal({ onClose, onCreate }: CreateListModalProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('List name is required'); return; }
    if (title.length > 50) { setError('Name must be under 50 characters'); return; }
    setLoading(true);
    try {
      await onCreate(title.trim());
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Create list" style={{ maxWidth: 360 }}>
        <h2>New List</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="create-list-title"
              value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              placeholder="List name (e.g. Work, Shopping)"
              className="ts-input"
              autoFocus
              maxLength={50}
            />
          </div>

          {error && <span className="field-error" style={{ marginBottom: '10px', display: 'block' }}>⚠ {error}</span>}

          <div className="modal-actions">
            <button type="button" id="create-list-cancel" className="ts-btn ts-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" id="create-list-submit" className="ts-btn ts-btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
