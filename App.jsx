import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { Calendar } from './components/Calendar';
import { ActivityView } from './components/ActivityView';
import { EntriesView } from './components/EntriesView';
import { AuthView } from './components/AuthView';
import './Calendar.css';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('Calendar');
  const [wallpaper, setWallpaper] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div 
      className="app-viewport" 
      style={wallpaper ? { '--bg-image': `url(${wallpaper})` } : {}}
    >
      {/* Navbar Component */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAuth={() => setShowAuthModal(true)} 
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'Landing' && <LandingView onNavigate={setActiveTab} />}
        {activeTab === 'Calendar' && <Calendar wallpaper={wallpaper} setWallpaper={setWallpaper} />}
        {activeTab === 'Activity' && <ActivityView />}
        {activeTab === 'Entries' && <EntriesView />}
      </main>

      {/* Auth Modal */}
      {showAuthModal && <AuthView onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}