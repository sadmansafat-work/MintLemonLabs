import React from 'react';

export function LandingView({ onNavigate }) {
  return (
    <div className="content-card glassmorphism home-dashboard">
      <div className="home-welcome">
        <h2>Welcome to <span className="banner-orange">Orange</span>Plan</h2>
        <p className="view-subtitle">Your aesthetic calendar & productivity companion.</p>
      </div>

      {/* Metrics Bar */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div className="stat-info">
            <span className="stat-value">3 Events</span>
            <span className="stat-label">Scheduled Today</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value">8 Tasks</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <div className="stat-info">
            <span className="stat-value">5 Days</span>
            <span className="stat-label">Active Streak</span>
          </div>
        </div>
      </div>

      {/* Focus Area */}
      <div className="dashboard-grid">
        <div className="dash-box">
          <h3>🎯 Today's Main Focus</h3>
          <p className="focus-text">Prepare final design review presentation & sync with dev team.</p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: '65%' }}></div>
          </div>
          <span className="progress-caption">65% Progress Completed</span>
        </div>

        <div className="dash-box quick-actions">
          <h3>⚡ Quick Actions</h3>
          <button className="dash-action-btn" onClick={() => onNavigate('Calendar')}>
            📅 Go to Calendar
          </button>
          <button className="dash-action-btn secondary" onClick={() => onNavigate('Entries')}>
            📝 Open Journal
          </button>
        </div>
      </div>
    </div>
  );
}