import React from 'react';
import { usePlanner } from '../PlannerContext';
import TaskItem from './TaskItem';

export default function TaskList() {
  const { tasks, loading } = usePlanner();

  if (loading) {
    return <div className="status-msg">Loading developer workspace...</div>;
  }

  if (tasks.length === 0) {
    return <div className="status-msg">No tickets found for current criteria.</div>;
  }

  return (
    <ul className="ticket-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}