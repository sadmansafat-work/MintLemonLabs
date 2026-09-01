import React, { useState, useEffect } from 'react';

export default function TaskManager({ user }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [mode, setMode] = useState('list');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:5000/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: desc,
        due_date: dueDate,
        created_by: user.id
      })
    });

    setTitle('');
    setDesc('');
    setDueDate('');
    fetchTasks();
  };

  const toggleStatus = async (id, currentStatus) => {
    const status = currentStatus === 'done' ? 'pending' : 'done';
    await fetch(`http://localhost:5000/api/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  return (
    <div className="task-manager">
      <div className="tm-top">
        <h2>Tasks & Deadlines</h2>
        <div className="mode-toggle">
          <button className={mode === 'list' ? 'active' : ''} onClick={() => setMode('list')}>List</button>
          <button className={mode === 'calendar' ? 'active' : ''} onClick={() => setMode('calendar')}>Calendar</button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="task-input-form">
        <input
          type="text"
          placeholder="Task title..."
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <input
          type="date"
          required
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button type="submit" className="btn-primary">Add Task</button>
      </form>

      {mode === 'list' ? (
        <div className="task-list">
          {tasks.map((t) => (
            <div key={t.id} className={`task-card ${t.status}`}>
              <input
                type="checkbox"
                checked={t.status === 'done'}
                onChange={() => toggleStatus(t.id, t.status)}
              />
              <div className="tc-body">
                <strong>{t.title}</strong>
                {t.description && <p>{t.description}</p>}
                <span className="tc-date">Due: {new Date(t.due_date).toLocaleDateString()}</span>
              </div>
              <span className={`status-pill ${t.status}`}>{t.status}</span>
              {user.role === 'admin' && (
                <button className="del-btn" onClick={() => deleteTask(t.id)}>✕</button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="calendar-grid">
          {tasks.map((t) => (
            <div key={t.id} className={`cal-node ${t.status}`}>
              <div className="cal-date">{new Date(t.due_date).toLocaleDateString()}</div>
              <strong>{t.title}</strong>
              <span>{t.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}