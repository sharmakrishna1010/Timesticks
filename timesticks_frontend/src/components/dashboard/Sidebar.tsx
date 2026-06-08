import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import type { List } from '../../api/lists';
import logo from '../../assets/logo_noBG.png';

export type ViewMode =
  | 'today'
  | 'all'
  | 'next7'
  | 'overdue'
  | 'habits'
  | `list:${string}`
  | `priority:${'High' | 'Medium' | 'Low'}`;

interface SidebarTask {
  list: string;
  done: boolean;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
}

interface SidebarProps {
  lists: List[];
  tasks: SidebarTask[];
  viewMode: ViewMode;
  onSetView: (v: ViewMode) => void;
  onCreateList: () => void;
  onRenameList: (list: List) => Promise<void>;
  onDeleteList: (list: List) => void;
  habitCount: number;
  /** Mobile sidebar open state */
  isOpen?: boolean;
  /** Called when sidebar should close (mobile) */
  onClose?: () => void;
}

/* ── Icons ──────────────────────────────────── */
const Icons = {
  Today: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  All: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  Next7: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
    </svg>
  ),
  Overdue: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Inbox: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  List: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Habits: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  Logout: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Plus: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Pencil: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
};

/* ── Priority dot ──────────────────────────── */
function PriorityDot({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const colors: Record<string, string> = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' };
  return (
    <span style={{
      display: 'inline-block',
      width: 10, height: 10,
      borderRadius: '50%',
      background: colors[level],
      flexShrink: 0,
    }} />
  );
}

/* ── Simple nav button ─────────────────────── */
function SidebarBtn({
  icon, label, count, active, onClick, id,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  id: string;
}) {
  return (
    <button className={`sidebar-item${active ? ' active' : ''}`} onClick={onClick} id={id}>
      {icon}
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      {(count !== undefined && count > 0) && <span className="item-count">{count}</span>}
    </button>
  );
}

/* ── List row (with rename/delete on hover) ── */
function ListRow({
  list, taskCount, isSelected, onSelect, onRename, onDelete,
}: {
  list: List; taskCount: number; isSelected: boolean;
  onSelect: () => void; onRename: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hovered) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setHovered(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [hovered]);

  return (
    <div
      ref={ref}
      className={`sidebar-list-row${isSelected ? ' active' : ''}`}
      onMouseEnter={() => !list.isDefault && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button className="sidebar-list-btn" onClick={onSelect} id={`sidebar-list-${list._id}`}>
        {list.isDefault ? Icons.Inbox : Icons.List}
        <span className="sidebar-list-title">{list.title}</span>
        {taskCount > 0 && <span className="item-count">{taskCount}</span>}
      </button>
      {!list.isDefault && hovered && (
        <div className="sidebar-list-actions">
          <button
            className="sidebar-action-btn rename"
            onClick={e => { e.stopPropagation(); onRename(); setHovered(false); }}
            aria-label={`Rename ${list.title}`}
            id={`sidebar-rename-${list._id}`}
            title="Rename"
          >{Icons.Pencil}</button>
          <button
            className="sidebar-action-btn delete"
            onClick={e => { e.stopPropagation(); onDelete(); setHovered(false); }}
            aria-label={`Delete ${list.title}`}
            id={`sidebar-delete-${list._id}`}
            title="Delete"
          >{Icons.Trash}</button>
        </div>
      )}
    </div>
  );
}

/* ── Rename Popover ────────────────────────── */
function RenamePopover({ list, onSave, onCancel }: {
  list: List;
  onSave: (title: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(list.title);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Name required'); return; }
    if (title.trim() === list.title) { onCancel(); return; }
    setLoading(true);
    try { await onSave(title.trim()); onCancel(); }
    catch (err: any) { setError(err?.response?.data?.message || 'Failed to rename'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal" role="dialog" aria-modal="true" style={{ maxWidth: 340 }}>
        <h2>Rename List</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" id="rename-list-input" value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              className="ts-input" autoFocus maxLength={50} />
          </div>
          {error && <span className="field-error" style={{ marginBottom: '10px', display: 'block' }}>— {error}</span>}
          <div className="modal-actions">
            <button type="button" id="rename-list-cancel" className="ts-btn ts-btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" id="rename-list-save" className="ts-btn ts-btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Sidebar ──────────────────────────── */
export default function Sidebar({
  lists, tasks, viewMode, onSetView,
  onCreateList, onRenameList, onDeleteList,
  habitCount, isOpen = false, onClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout, theme, toggleTheme } = useAuth();
  const [renamingList, setRenamingList] = useState<List | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const next7Str = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; })();

  const pendingTasks = tasks.filter(t => !t.done);

  // Counts
  const todayCount   = pendingTasks.filter(t => t.dueDate?.split('T')[0] === todayStr).length;
  const overdueCount = pendingTasks.filter(t => { const d = t.dueDate?.split('T')[0]; return d !== undefined && d < todayStr; }).length;
  const allCount     = pendingTasks.length;
  const next7Count   = pendingTasks.filter(t => { const d = t.dueDate?.split('T')[0]; return d >= todayStr && d <= next7Str; }).length;
  const highCount   = pendingTasks.filter(t => t.priority === 'High').length;
  const medCount    = pendingTasks.filter(t => t.priority === 'Medium').length;
  const lowCount    = pendingTasks.filter(t => t.priority === 'Low').length;

  const getListCount = (listId: string) => pendingTasks.filter(t => t.list === listId).length;

  const sortedLists = [...lists].sort((a, b) => {
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    return a.title.localeCompare(b.title);
  });

  // Close sidebar on mobile whenever a nav item is selected
  const setView = (v: ViewMode) => { onSetView(v); navigate('/dashboard'); onClose?.(); };

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) {}
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className={`sidebar-overlay${isOpen ? ' sidebar-overlay--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <img src={logo} alt="Timesticks Logo" className="brand-logo" />
          <span className="brand-name">T<span style={{ color: 'var(--blue)' }}>i</span>mesticks</span>
        </div>

        {/* ── Tasks ── */}
        <div className="sidebar-section">
          <p className="sidebar-section-label">Tasks</p>

          <SidebarBtn icon={Icons.Today}   label="Today"      count={todayCount}   active={viewMode === 'today'}   onClick={() => setView('today')}   id="sidebar-today" />
          <SidebarBtn icon={Icons.All}     label="All Tasks"  count={allCount}     active={viewMode === 'all'}     onClick={() => setView('all')}     id="sidebar-all" />
          <SidebarBtn icon={Icons.Next7}   label="Next 7 Days" count={next7Count}  active={viewMode === 'next7'}   onClick={() => setView('next7')}   id="sidebar-next7" />
          {overdueCount > 0 && (
            <SidebarBtn
              icon={<span style={{ color: '#ef4444', display: 'flex' }}>{Icons.Overdue}</span>}
              label="Overdue"
              count={overdueCount}
              active={viewMode === 'overdue'}
              onClick={() => setView('overdue')}
              id="sidebar-overdue"
            />
          )}

          <div className="sidebar-divider" />

          {sortedLists.map(list => (
            <ListRow
              key={list._id}
              list={list}
              taskCount={getListCount(list._id)}
              isSelected={viewMode === `list:${list._id}`}
              onSelect={() => setView(`list:${list._id}` as ViewMode)}
              onRename={() => setRenamingList(list)}
              onDelete={() => onDeleteList(list)}
            />
          ))}

          <button className="sidebar-new-list-btn" id="sidebar-new-list" onClick={() => { onCreateList(); onClose?.(); }}>
            {Icons.Plus}
            New List
          </button>
        </div>

        {/* ── Priority ── */}
        <div className="sidebar-section">
          <p className="sidebar-section-label">Priority</p>
          <SidebarBtn icon={<PriorityDot level="High" />}   label="High"   count={highCount} active={viewMode === 'priority:High'}   onClick={() => setView('priority:High')}   id="sidebar-priority-high" />
          <SidebarBtn icon={<PriorityDot level="Medium" />} label="Medium" count={medCount}  active={viewMode === 'priority:Medium'} onClick={() => setView('priority:Medium')} id="sidebar-priority-medium" />
          <SidebarBtn icon={<PriorityDot level="Low" />}    label="Low"    count={lowCount}  active={viewMode === 'priority:Low'}    onClick={() => setView('priority:Low')}    id="sidebar-priority-low" />
        </div>

        {/* ── Habits ── */}
        <div className="sidebar-section">
          <p className="sidebar-section-label">Habits</p>
          <SidebarBtn icon={Icons.Habits} label="My Habits" count={habitCount} active={viewMode === 'habits'} onClick={() => setView('habits')} id="sidebar-habits" />
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user-profile" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div className="user-avatar">
                {user?.fullName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
              </div>
              <span className="user-name">{user?.fullName || 'User'}</span>
            </div>
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme} 
              aria-label="Toggle theme"
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center',
                borderRadius: '4px'
              }}
            >
              {theme === 'dark' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
          <button className="sidebar-item" id="sidebar-logout" onClick={handleLogout} style={{ color: 'var(--error)' }}>
            {Icons.Logout}
            Sign Out
          </button>
        </div>
      </aside>

      {renamingList && (
        <RenamePopover
          list={renamingList}
          onSave={async (title) => { await onRenameList({ ...renamingList, title }); }}
          onCancel={() => setRenamingList(null)}
        />
      )}
    </>
  );
}
