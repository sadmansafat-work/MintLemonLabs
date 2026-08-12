import React, { useState, useEffect } from 'react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ACCENT_PRESETS = ['#f97316', '#38bdf8', '#10b981', '#a855f7', '#f43f5e', '#eab308'];

const EVENT_TYPES = [
  { id: 'task', label: 'Task' },
  { id: 'exam', label: 'Exam' },
  { id: 'celebration', label: 'Celebration' },
  { id: 'meeting', label: 'Meeting' }
];

export function Calendar({ wallpaper, setWallpaper }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);

  const [theme, setTheme] = useState(() => localStorage.getItem('op_theme') || 'dark');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('op_accent') || '#f97316');
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('op_events');
    return saved ? JSON.parse(saved) : {};
  });

  const [showSettings, setShowSettings] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('task');

  useEffect(() => { 
    localStorage.setItem('op_theme', theme); 
    document.documentElement.className = `theme-${theme}`; 
  }, [theme]);

  useEffect(() => { localStorage.setItem('op_accent', accentColor); }, [accentColor]);
  useEffect(() => { localStorage.setItem('op_events', JSON.stringify(events)); }, [events]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const formatDateKey = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const selectedDateKey = formatDateKey(selectedDate);
  const currentDayEvents = events[selectedDateKey] || [];

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const handleWallpaperUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setWallpaper(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvent = {
      id: Date.now(),
      title: newEventTitle.trim(),
      category: selectedCategory
    };

    setEvents(prev => ({
      ...prev,
      [selectedDateKey]: [...(prev[selectedDateKey] || []), newEvent]
    }));
    setNewEventTitle('');
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(prev => {
      const updatedList = (prev[selectedDateKey] || []).filter(item => item.id !== eventId);
      if (updatedList.length === 0) {
        const copy = { ...prev };
        delete copy[selectedDateKey];
        return copy;
      }
      return { ...prev, [selectedDateKey]: updatedList };
    });
  };

  const generateGridCells = () => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({ dayNumber: daysInPrevMonth - i, isCurrentMonth: false, dateObj: new Date(year, month - 1, daysInPrevMonth - i) });
    }
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      cells.push({ dayNumber: day, isCurrentMonth: true, dateObj: new Date(year, month, day) });
    }
    const remainingSlots = 42 - cells.length;
    for (let day = 1; day <= remainingSlots; day++) {
      cells.push({ dayNumber: day, isCurrentMonth: false, dateObj: new Date(year, month + 1, day) });
    }
    return cells;
  };

  const cells = generateGridCells();
  const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  return (
    <div className="calendar-landscape-card glassmorphism" style={{ '--accent-color': accentColor }}>
      {/* LEFT PANE */}
      <div className="pane-left">
        <div className="card-top-bar">
          <div className="header-text-group">
            <div className="today-live-badge">
              <span className="pulse-dot"></span>
              <span>Today: {MONTH_NAMES[today.getMonth()]} {today.getDate()}, {today.getFullYear()}</span>
            </div>
            <div className="header-date">
              {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
            </div>
          </div>
          <button className="settings-toggle-btn" title="Calendar Settings" onClick={() => setShowSettings(!showSettings)}>
            ⚙
          </button>
        </div>

        {/* Ergonomic Month Navigation */}
        <div className="calendar-nav">
          <button className="nav-arrow" onClick={handlePrevMonth} aria-label="Previous Month">
            ‹
          </button>
          <span className="nav-month">{MONTH_NAMES[month]} {year}</span>
          <button className="nav-arrow" onClick={handleNextMonth} aria-label="Next Month">
            ›
          </button>
        </div>

        <div className="weekday-grid">
          {WEEKDAYS.map((day, idx) => <div key={idx} className="weekday-label">{day}</div>)}
        </div>

        <div className="days-grid">
          {cells.map((cell, index) => {
            const isTodayDate = isSameDay(cell.dateObj, today);
            const isSelectedDate = isSameDay(cell.dateObj, selectedDate);
            const cellKey = formatDateKey(cell.dateObj);
            const hasEvents = events[cellKey] && events[cellKey].length > 0;

            let dayStateClass = '';
            if (isTodayDate && isSelectedDate) dayStateClass = 'is-today-selected';
            else if (isTodayDate) dayStateClass = 'is-today';
            else if (isSelectedDate) dayStateClass = 'is-selected';

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(cell.dateObj)}
                className={`day-cell ${!cell.isCurrentMonth ? 'muted' : ''} ${dayStateClass}`}
              >
                <span>{cell.dayNumber}</span>
                {hasEvents && <span className="event-dot" />}
              </button>
            );
          })}
        </div>

        <div className="calendar-footer">
          <button className="today-btn" onClick={handleToday}>
            Jump to Today
          </button>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="pane-right">
        {showSettings && (
          <div className="settings-panel">
            <div className="settings-section">
              <span className="settings-label">Mode</span>
              <div className="theme-toggle-group">
                <button className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>Dark</button>
                <button className={`theme-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>Light</button>
              </div>
            </div>

            <div className="settings-section">
              <span className="settings-label">Accent Color</span>
              <div className="color-presets">
                {ACCENT_PRESETS.map((color) => (
                  <button key={color} className={`color-swatch ${accentColor === color ? 'selected' : ''}`} style={{ backgroundColor: color }} onClick={() => setAccentColor(color)} />
                ))}
              </div>
            </div>

            <div className="settings-section">
              <span className="settings-label">Wallpaper</span>
              <div className="wallpaper-actions">
                <label className="upload-btn">
                  Upload Wallpaper
                  <input type="file" accept="image/*" onChange={handleWallpaperUpload} hidden />
                </label>
                {wallpaper && (
                  <button className="remove-wp-btn" onClick={() => setWallpaper(null)}>
                    Reset Default
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="agenda-section">
          <div className="agenda-header">Agenda & Planned Events</div>
          <form className="event-form" onSubmit={handleAddEvent}>
            <input 
              type="text" 
              placeholder="Add exam, meeting, task..." 
              value={newEventTitle} 
              onChange={(e) => setNewEventTitle(e.target.value)} 
              className="event-input" 
            />
            <div className="event-form-controls">
              <div className="category-selector">
                {EVENT_TYPES.map(cat => (
                  <button 
                    key={cat.id} 
                    type="button" 
                    className={`material-btn ${selectedCategory === cat.id ? 'active' : ''}`} 
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <button type="submit" className="add-event-btn">+</button>
            </div>
          </form>

          <div className="event-list">
            {currentDayEvents.length === 0 ? (
              <div className="empty-agenda">No events scheduled for this date</div>
            ) : (
              currentDayEvents.map(item => (
                <div key={item.id} className="event-item">
                  <span className="event-badge">{item.category}</span>
                  <span className="event-title">{item.title}</span>
                  <button className="delete-event-btn" onClick={() => handleDeleteEvent(item.id)}>✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}