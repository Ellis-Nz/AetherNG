import { createContext, useContext, useState } from 'react';

// ─── AuthContext ──────────────────────────────────────────────────────────────
// Mock authentication — no real backend.
// Simulates login/register with a 1-second delay.
// User object is stored in React state (not localStorage — session only).
//
// INTERVIEW NOTE: In a real app you would:
//  1. POST credentials to an API
//  2. Store a JWT token in localStorage or an httpOnly cookie
//  3. Decode the token to get the user object

const AuthContext = createContext(null);

// Hardcoded demo user — "logs in" with any password
const DEMO_USER = {
  name: 'Ellis Nzeih',
  email: 'ellis@example.com',
  avatar: 'EN',
  addresses: [
    { id: 'a1', label: 'Home', address: '14 Dantata Estate', city: 'Abuja', state: 'FCT', postalCode: '901101', country: 'Nigeria', isDefault: true },
    { id: 'a2', label: 'Office', address: '4 Wuse Zone 5', city: 'Abuja', state: 'FCT', postalCode: '900001', country: 'Nigeria', isDefault: false },
  ],
};

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [authError, setAuthError] = useState('');

  // Mock login — accepts any email/password, returns demo user
  const login = async (email, password) => {
    setLoading(true);
    setAuthError('');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        setLoading(false);
        if (!email || !password) {
          const msg = 'Please enter your email and password.';
          setAuthError(msg);
          reject(msg);
        } else {
          setUser({ ...DEMO_USER, email });
          resolve();
        }
      }, 1000);
    });
  };

  // Mock register — same as login for demo purposes
  const register = async (name, email, password) => {
    setLoading(true);
    setAuthError('');
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        setLoading(false);
        if (!name || !email || !password) {
          const msg = 'Please fill in all fields.';
          setAuthError(msg);
          reject(msg);
        } else {
          setUser({ ...DEMO_USER, name, email, avatar: name.slice(0, 2).toUpperCase() });
          resolve();
        }
      }, 1000);
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, register, logout, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
  return ctx;
}
