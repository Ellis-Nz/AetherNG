import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, Eye, EyeOff } from 'lucide-react';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// ─── LoginPage ────────────────────────────────────────────────────────────────
// Mock login — any email + password combination works.
// Controlled form with validation, password show/hide, and loading spinner.

export default function LoginPage() {
  const { login, loading, authError } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      await login(email, password);
      addToast('Welcome back! 👋', 'success');
      navigate('/');
    } catch (_) { /* authError is set in context */ }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">AetherNG</Link>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account</p>

        {authError && <div className="auth-error">{authError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="password-wrap">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={errors.password ? 'input-error' : ''}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <><Loader size={16} className="spinner" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
        <p className="auth-hint">💡 Tip: any email + password works in this demo.</p>
      </div>
    </div>
  );
}
