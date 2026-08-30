import React from 'react';
import { PlannerProvider, usePlanner } from './PlannerContext';
import AuthPage from './components/AuthPage';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Metrics from './components/Metrics';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import CalendarView from './components/CalendarView';
import ArchitectureView from './components/ArchitectureView';
import AgileBoard from './components/AgileBoard';
import TrashView from './components/TrashView';
import './index.css';

function ViewRouter() {
  const { currentView } = usePlanner();

  switch (currentView) {
    case 'landing': return <LandingPage />;
    case 'board': return <AgileBoard />;
    case 'calendar': return <CalendarView />;
    case 'architecture': return <ArchitectureView />;
    case 'trash': return <TrashView />;
    case 'planner':
    default:
      return (
        <>
          <Metrics />
          <TaskForm />
          <FilterBar />
          <TaskList />
        </>
      );
  }
}

function MainLayout() {
  const { user } = usePlanner();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-viewport">
      <div className="glass-container">
        <Navbar />
        <main className="view-content">
          <ViewRouter />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PlannerProvider>
      <MainLayout />
    </PlannerProvider>
  );
}
