import React, { useState } from 'react';

export default function Sidebar({
  user,
  channels,
  activeChannel,
  setActiveChannel,
  activeView,
  setActiveView,
  onLogout,
  onAddChannel,
  theme,
  toggleTheme
}) {
  const [newChan, setNewChan] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newChan.trim()) return;
    onAddChannel(newChan);
    setNewChan('');
    setShowForm(false);
  };

  return (
    <aside className="sidebar">
      <div className="sb-header">
        <span className="brand-logo">🍊 OrangePlan</span>
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="user-profile">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div>
          <strong>{user.name}</strong>
          <span className="role-tag">{user.role}</span>
        </div>
      </div>

      <div className="nav-section">
        <button
          className={`nav-btn ${activeView === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveView('tasks')}
        >
          📋 Tasks & Calendar
        </button>
        <button
          className={`nav-btn ${activeView === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveView('chat')}
        >
          💬 Team Channels
        </button>
      </div>

      {activeView === 'chat' && (
        <div className="channel-list-container">
          <div className="cl-header">
            <span>CHANNELS</span>
            <button onClick={() => setShowForm(!showForm)}>+</button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="chan-form">
              <input
                type="text"
                placeholder="channel-name"
                value={newChan}
                onChange={(e) => setNewChan(e.target.value)}
              />
            </form>
          )}

          <div className="cl-items">
            {channels.map((c) => (
              <div
                key={c.id}
                className={`cl-item ${activeChannel?.id === c.id ? 'active' : ''}`}
                onClick={() => setActiveChannel(c)}
              >
                # {c.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="logout-btn" onClick={onLogout}>Sign Out</button>
    </aside>
  );
}