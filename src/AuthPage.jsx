import React, { useState } from 'react';
import { usePlanner } from '../PlannerContext';

export default function AuthPage() {
  const { login, register } = usePlanner();
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    let res;
    if (isLoginView) {
      res = await login(email, password);
    } else {
      res = await register(name, email, password);
    }

    if (!res.success) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-icon">🍊</span>
          <h2>OrangePlan</h2>
          <p>Developer Productivity & Workspace Engine</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLoginView ? 'active' : ''}`} 
            onClick={() => { setIsLoginView(true); setErrorMsg(''); }}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab ${!isLoginView ? 'active' : ''}`} 
            onClick={() => { setIsLoginView(false); setErrorMsg(''); }}
          >
            Create Account
          </button>
        </div>

        {errorMsg && <div className="auth-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLoginView && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Saadman Safat" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="dev@orangeplan.io" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="primary-btn auth-submit">
            {isLoginView ? 'Sign In to Dashboard' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}