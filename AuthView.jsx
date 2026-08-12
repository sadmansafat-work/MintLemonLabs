import React, { useState } from 'react';

export function AuthView({ onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glassmorphism" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        <h2>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
        <p className="view-subtitle">
          {isSignUp ? 'Sign up to sync your calendar across devices' : 'Log in to access your OrangePlan agenda'}
        </p>

        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          {isSignUp && (
            <input type="text" placeholder="Full Name" className="event-input" required />
          )}
          <input type="email" placeholder="Email Address" className="event-input" required />
          <input type="password" placeholder="Password" className="event-input" required />

          <button type="submit" className="dash-action-btn auth-submit-btn">
            {isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="auth-toggle-note">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => setIsSignUp(!isSignUp)} className="auth-toggle-link">
            {isSignUp ? 'Log In' : 'Sign Up'}
          </span>
        </div>
      </div>
    </div>
  );
}