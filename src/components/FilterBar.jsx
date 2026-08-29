import React from 'react';
import { usePlanner } from '../PlannerContext';

const CATEGORIES = [
  { id: 'feature', label: 'Feature' },
  { id: 'bug', label: 'Bug Fix' },
  { id: 'sprint', label: 'Sprint Task' },
  { id: 'review', label: 'Code Review' },
  { id: 'devops', label: 'DevOps / Infra' }
];

export default function FilterBar() {
  const { filterCategory, setFilterCategory, filterDate, setFilterDate } = usePlanner();

  return (
    <div className="filter-bar">
      <div className="category-chips">
        <button
          className={`chip ${filterCategory === '' ? 'active' : ''}`}
          onClick={() => setFilterCategory('')}
        >
          All Items
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`chip ${filterCategory === cat.id ? 'active' : ''}`}
            onClick={() => setFilterCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="date-filter">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="date-input-sm"
        />
        {filterDate && (
          <button className="clear-btn" onClick={() => setFilterDate('')}>Clear Date</button>
        )}
      </div>
    </div>
  );
}