import React from 'react';

export function ActivityView() {
  const activities = [
    { id: 1, action: "Completed task 'Design Review'", time: "2 hours ago", tag: "Task" },
    { id: 2, action: "Added new event 'Team Sync'", time: "4 hours ago", tag: "Meeting" },
    { id: 3, action: "Logged study session 'Math Exam'", time: "Yesterday", tag: "Exam" },
  ];

  return (
    <div className="content-card glassmorphism">
      <h2 className="view-title">Activity Dashboard</h2>
      <p className="view-subtitle">Recent productivity and workflow logs</p>

      <div className="activity-list">
        {activities.map((item) => (
          <div key={item.id} className="activity-card">
            <div className="activity-info">
              <span className="activity-tag">{item.tag}</span>
              <span className="activity-action">{item.action}</span>
            </div>
            <span className="activity-time">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}