import React from 'react';

export function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const navItems = [
    { id: 'Landing', label: 'Home' },
    { id: 'Calendar', label: 'Calendar' },
    { id: 'Activity', label: 'Activity' },
    { id: 'Entries', label: 'Entries' },
  ];

  return (
    <header className="top-navbar">
      <nav className="nav-menu">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="nav-brand" onClick={() => setActiveTab('Landing')}>
        <span className="banner-orange">Orange</span>
        <span className="banner-plan">Plan</span>
      </div>

      <div className="nav-auth">
        <button className="auth-btn" onClick={onOpenAuth}>
          Login / Sign Up
        </button>
      </div>
    </header>
  );
}