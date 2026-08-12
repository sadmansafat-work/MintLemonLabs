import React from 'react';

export function EntriesView() {
  const entries = [
    { id: 1, title: "Q3 Strategy Notes", date: "Jul 24, 2026", snippet: "Key deliverables for the upcoming release cycle." },
    { id: 2, title: "Exam Prep Checkpoints", date: "Jul 20, 2026", snippet: "Chapters 4 through 8 covered in detail." },
    { id: 3, title: "Weekly Wins & Reflections", date: "Jul 18, 2026", snippet: "Achieved 95% task completion rate." },
  ];

  return (
    <div className="content-card glassmorphism">
      <h2 className="view-title">Journal & Entries</h2>
      <p className="view-subtitle">Your saved notes and project documentation</p>

      <div className="entries-grid">
        {entries.map((entry) => (
          <div key={entry.id} className="entry-card">
            <span className="entry-date">{entry.date}</span>
            <h3 className="entry-title">{entry.title}</h3>
            <p className="entry-snippet">{entry.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}