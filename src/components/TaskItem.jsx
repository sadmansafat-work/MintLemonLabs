import React, { useState } from 'react';
import { usePlanner } from '../PlannerContext';

const COLOR_MAP = {
  feature: '#10b981',
  bug: '#ef4444',
  sprint: '#f59e0b',
  review: '#8b5cf6',
  devops: '#06b6d4'
};

export default function TaskItem({ task }) {
  const { updateTask, deleteTask } = usePlanner();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      updateTask(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const formattedDate = task.event_date ? String(task.event_date).split('T')[0] : 'No Date';
  const badgeColor = COLOR_MAP[task.category] || '#94a3b8';

  return (
    <li className="ticket-card">
      <div className="ticket-main">
        <span className="badge" style={{ backgroundColor: badgeColor }}>
          {task.category}
        </span>
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="edit-inline-input"
            autoFocus
          />
        ) : (
          <span className="ticket-title">{task.title}</span>
        )}
      </div>

      <div className="ticket-actions">
        <span className="ticket-date">{formattedDate}</span>
        {isEditing ? (
          <button className="action-btn save" onClick={handleSave}>Save</button>
        ) : (
          <button className="action-btn" onClick={() => setIsEditing(true)}>Edit</button>
        )}
        <button className="action-btn danger" onClick={() => deleteTask(task.id)}>Delete</button>
      </div>
    </li>
  );
}