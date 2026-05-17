import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader, Eye, EyeOff } from 'lucide-react';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { register, loading, authError } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name     = 'Full name is required';
    if (!form.email.trim())   e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)       e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await register(form.name, form.email, form.password);
      addToast('Account created! Welcome to AetherNG 🎉', 'success');
      navigate('/');
    } catch (_) {}
  };

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div className="auth-field">
      <label>{label}</label>
      <input type={type} name={name} value={form[name]}
        onChange={handleChange} placeholder={placeholder}
        className={errors[name] ? 'input-error' : ''}
      />
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">AetherNG</Link>
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-sub">Join AETHER and start shopping</p>

        {authError && <div className="auth-error">{authError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <Field label="Full Name"    name="name"     placeholder="Emeka Okafor" />
          <Field label="Email"        name="email"    type="email" placeholder="you@example.com" />

          <div className="auth-field">
            <label>Password</label>
            <div className="password-wrap">
              <input type={showPw ? 'text' : 'password'} name="password"
                value={form.password} onChange={handleChange}
                placeholder="At least 6 characters"
                className={errors.password ? 'input-error' : ''}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(s => !s)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <Field label="Confirm Password" name="confirm" type="password" placeholder="Repeat password" />

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <><Loader size={16} className="spinner" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
