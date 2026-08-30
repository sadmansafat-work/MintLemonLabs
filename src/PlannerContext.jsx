import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PlannerContext = createContext();
const API_BASE = 'http://localhost:5000/api';

export function PlannerProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('op_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('op_token') || '');
  const [tasks, setTasks] = useState([]);
  const [trashItems, setTrashItems] = useState([]);
  const [summary, setSummary] = useState({ totalTickets: 0, featuresCount: 0, bugsCount: 0, todayScheduled: 0 });
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentView, setCurrentView] = useState('planner');

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }), [token]);

  const fetchSummary = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/summary`, { headers: getHeaders() });
      if (res.ok) setSummary(await res.json());
    } catch (err) { console.error(err); }
  }, [token, getHeaders]);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterCategory) queryParams.append('category', filterCategory);
      if (filterDate) queryParams.append('date', filterDate);

      const res = await fetch(`${API_BASE}/tasks?${queryParams.toString()}`, { headers: getHeaders() });
      if (res.ok) setTasks(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token, filterCategory, filterDate, getHeaders]);

  const fetchTrash = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/trash`, { headers: getHeaders() });
      if (res.ok) setTrashItems(await res.json());
    } catch (err) { console.error(err); }
  }, [token, getHeaders]);

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchTrash();
      fetchSummary();
    }
  }, [token, fetchTasks, fetchTrash, fetchSummary]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('op_token', data.token);
        localStorage.setItem('op_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Connection failure' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('op_token', data.token);
        localStorage.setItem('op_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Connection failure' };
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('op_token');
    localStorage.removeItem('op_user');
  };

  const addTask = async (title, category, eventDate) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, category, event_date: eventDate })
    });
    if (res.ok) { fetchTasks(); fetchSummary(); }
  };

  const updateTask = async (id, updates) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (res.ok) { fetchTasks(); fetchSummary(); }
  };

  const deleteTask = async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}/trash`, { method: 'PUT', headers: getHeaders() });
    if (res.ok) { fetchTasks(); fetchTrash(); fetchSummary(); }
  };

  const restoreTask = async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}/restore`, { method: 'PUT', headers: getHeaders() });
    if (res.ok) { fetchTasks(); fetchTrash(); fetchSummary(); }
  };

  const purgeTask = async (id) => {
    const res = await fetch(`${API_BASE}/trash/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (res.ok) fetchTrash();
  };

  return (
    <PlannerContext.Provider value={{
      user, token, login, register, logout, tasks, trashItems, summary, loading,
      filterCategory, setFilterCategory, filterDate, setFilterDate,
      currentView, setCurrentView, addTask, updateTask, deleteTask, restoreTask, purgeTask
    }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() { return useContext(PlannerContext); }
