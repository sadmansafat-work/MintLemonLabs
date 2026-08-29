import React, { createContext, useContext, useState, useEffect } from 'react';

const PlannerContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export function PlannerProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('op_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [events, setEvents] = useState({});
  const [activities, setActivities] = useState([
    { id: 1, action: "System initialized", time: "Just now", tag: "System" }
  ]);

  // Fetch tasks from Express server on load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      const data = await res.json();
      
      // Group tasks by date string (YYYY-MM-DD) for Calendar view
      const grouped = {};
      data.forEach(task => {
        const dateKey = task.event_date ? task.event_date.split('T')[0] : 'unassigned';
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(task);
      });
      setEvents(grouped);
    } catch (err) {
      console.error("Failed to fetch tasks from database:", err);
    }
  };

  const addEvent = async (dateKey, title, category) => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          event_date: dateKey,
          user_id: user?.id || null
        })
      });
      const data = await res.json();

      if (data.success) {
        // Refresh live state from DB
        fetchTasks();

        // Push live activity log
        setActivities(prev => [{
          id: Date.now(),
          action: `Created ${category} '${title}'`,
          time: 'Just now',
          tag: category.charAt(0).toUpperCase() + category.slice(1)
        }, ...prev]);
      }
    } catch (err) {
      console.error("Failed to save task to backend:", err);
    }
  };

  const deleteEvent = async (dateKey, eventId) => {
    try {
      await fetch(`${API_BASE}/tasks/${eventId}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task from backend:", err);
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('op_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('op_user');
  };

  return (
    <PlannerContext.Provider value={{ user, events, activities, addEvent, deleteEvent, login, logout, fetchTasks }}>
      {children}
    </PlannerContext.Provider>
  );
}

export const usePlanner = () => useContext(PlannerContext);