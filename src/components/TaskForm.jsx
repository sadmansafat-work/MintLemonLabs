import React, { useState } from 'react';
import { usePlanner } from '../PlannerContext';

const CATEGORIES = [
  { id: 'feature', label: 'Feature' },
  { id: 'bug', label: 'Bug Fix' },
  { id: 'sprint', label: 'Sprint Task' },
  { id: 'review', label: 'Code Review' },
  { id: 'devops', label: 'DevOps / Infra' }
];

export default function TaskForm() {
  const { addTask } = usePlanner();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('feature');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), category, eventDate);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="ticket-form">
      <div className="input-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Implement OAuth connection retry logic..."
          className="text-input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select-input"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="date-input"
        />
        <button type="submit" className="primary-btn">Log Ticket</button>
      </div>
    </form>
  );
}