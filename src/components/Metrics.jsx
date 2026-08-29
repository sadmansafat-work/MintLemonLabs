import React from 'react';
import { usePlanner } from '../PlannerContext';

export default function Metrics() {
  const { summary } = usePlanner();

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <span className="metric-label">Total Tickets</span>
        <span className="metric-val">{summary.totalTickets}</span>
      </div>
      <div className="metric-card">
        <span className="metric-label">Features</span>
        <span className="metric-val" style={{ color: '#10b981' }}>{summary.featuresCount}</span>
      </div>
      <div className="metric-card">
        <span className="metric-label">Open Bugs</span>
        <span className="metric-val" style={{ color: '#ef4444' }}>{summary.bugsCount}</span>
      </div>
      <div className="metric-card">
        <span className="metric-label">Due Today</span>
        <span className="metric-val" style={{ color: '#f97316' }}>{summary.todayScheduled}</span>
      </div>
    </div>
  );
}