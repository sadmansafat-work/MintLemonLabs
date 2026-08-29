import React, { useState } from 'react';
import { PlannerProvider, usePlanner } from './PlannerContext';

function MainDashboard() {
  const { events, activities, addEvent } = usePlanner();
  const [taskTitle, setTaskTitle] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    addEvent(today, taskTitle, 'task');
    setTaskTitle('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'system-ui, sans-serif', padding: '0 20px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-[#111]between', borderBottom: '2px solid #eee', pb: '10px' }}>
        <h1 style={{ color: '#f97316', margin: 0 }}>🍊 OrangePlan</h1>
      </header>

      <main style={{ marginTop: '20px' }}>
        <h2>Add Event / Task</h2>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Enter task or meal plan..."
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Add Task
          </button>
        </form>

        <h2>Activity Log</h2>
        <ul>
          {activities.map((act) => (
            <li key={act.id}>
              <strong>[{act.tag}]</strong> {act.action} — <em>{act.time}</em>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <PlannerProvider>
      <MainDashboard />
    </PlannerProvider>
  );
}