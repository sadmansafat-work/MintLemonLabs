import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import TaskManager from './components/TaskManager';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [activeView, setActiveView] = useState('tasks');
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) fetchChannels();
  }, [user]);

  const fetchChannels = async () => {
    const res = await fetch(`${API_URL}/api/channels`);
    const data = await res.json();
    setChannels(data);
    if (data.length > 0 && !activeChannel) setActiveChannel(data[0]);
  };

  const handleAddChannel = async (name) => {
    const res = await fetch(`${API_URL}/api/channels`,  {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: 'Workspace discussion channel' })
    });
    if (res.ok) {
      const created = await res.json();
      fetchChannels();
      setActiveChannel(created);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!user && authMode) {
    return (
      <Auth
        initialMode={authMode}
        onBack={() => setAuthMode(null)}
        onSuccess={(u) => setUser(u)}
      />
    );
  }

  return (
    <div className={`app-root ${theme}`}>
      {user ? (
        <div className="workspace-layout">
          <Sidebar
            user={user}
            channels={channels}
            activeChannel={activeChannel}
            setActiveChannel={setActiveChannel}
            activeView={activeView}
            setActiveView={setActiveView}
            onLogout={() => setUser(null)}
            onAddChannel={handleAddChannel}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <main className="main-viewport">
            {activeView === 'tasks' ? (
              <TaskManager user={user} />
            ) : (
              <ChatArea activeChannel={activeChannel} user={user} />
            )}
          </main>
        </div>
      ) : (
        <div className="landing-view">
          <header className="landing-nav">
            <span>🍊 <strong>OrangePlan</strong></span>
            <button className="theme-btn" onClick={toggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          </header>
          <div className="landing-hero">
            <h1>Orange Workspace Engine</h1>
            <p>Slack messaging, task tracking, calendar management, and file transfers in one workspace.</p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={() => setAuthMode('signup')}>Get Started Free</button>
              <button className="btn-secondary" onClick={() => setAuthMode('login')}>Sign In</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}