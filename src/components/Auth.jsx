import React, { useState } from 'react';

export default function Auth({ initialMode = 'login', onBack, onSuccess }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Auth failed');

      if (data.token) localStorage.setItem('orange_token', data.token);
      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <button className="auth-back-btn" onClick={onBack}>← Back</button>
      <div className="auth-card">
        <h2>{isLogin ? 'Sign In to OrangePlan' : 'Create Workspace Account'}</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Saadman Safat"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Account Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="student">Student / Employee</option>
                  <option value="admin">Admin / Client</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="user@orangeplan.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>
        <p className="auth-toggle-text" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Need an account? Register" : "Already registered? Sign In"}
        </p>
      </div>
    </div>
  );
}