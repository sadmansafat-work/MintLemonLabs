import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PlannerContext = createContext();
const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

export function PlannerProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [trashItems, setTrashItems] = useState([]);
  const [summary, setSummary] = useState({
    totalTickets: 0,
    featuresCount: 0,
    bugsCount: 0,
    todayScheduled: 0
  });
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentView, setCurrentView] = useState('planner');
  const [user, setUser] = useState(null);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterCategory) queryParams.append('category', filterCategory);
      if (filterDate) queryParams.append('date', filterDate);

      const res = await fetch(`${API_BASE}/tasks?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterDate]);

  const fetchTrash = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/trash`);
      if (res.ok) {
        const data = await res.json();
        setTrashItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch trash items:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchTrash();
    fetchSummary();
  }, [fetchTasks, fetchTrash]);

  const addTask = async (title, category, eventDate) => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, event_date: eventDate })
      });
      if (res.ok) {
        await fetchTasks();
        await fetchSummary();
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await fetchTasks();
        await fetchSummary();
      }
    } catch (err) {
      console.error('Failed to update ticket:', err);
    }
  };

  // Move task to Recovery Bin (Soft Delete)
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}/trash`, {
        method: 'PUT'
      });
      if (res.ok) {
        await fetchTasks();
        await fetchTrash();
        await fetchSummary();
      }
    } catch (err) {
      console.error('Failed to move task to trash:', err);
    }
  };

  // Restore task from Recovery Bin
  const restoreTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}/restore`, {
        method: 'PUT'
      });
      if (res.ok) {
        await fetchTasks();
        await fetchTrash();
        await fetchSummary();
      }
    } catch (err) {
      console.error('Failed to restore task:', err);
    }
  };

  // Permanent Delete
  const purgeTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/trash/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchTrash();
      }
    } catch (err) {
      console.error('Failed to purge task:', err);
    }
  };

  return (
    <PlannerContext.Provider
      value={{
        tasks,
        trashItems,
        summary,
        loading,
        filterCategory,
        setFilterCategory,
        filterDate,
        setFilterDate,
        currentView,
        setCurrentView,
        user,
        setUser,
        addTask,
        updateTask,
        deleteTask,
        restoreTask,
        purgeTask,
        refreshData: () => {
          fetchTasks();
          fetchTrash();
          fetchSummary();
        }
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  return useContext(PlannerContext);
}