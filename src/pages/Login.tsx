import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { FileText, Lock, Mail } from 'lucide-react';
import type { User } from '../types';

export const TEST_USERS: Record<string, User & { password: string }> = {
  'admin@nexvault.com': { id: 'usr_admin', name: 'System Admin', email: 'admin@nexvault.com', role: 'admin', password: 'password123' },
  'uploader@nexvault.com': { id: 'usr_upload', name: 'Data Entry', email: 'uploader@nexvault.com', role: 'uploader', password: 'password123' },
  'reviewer@nexvault.com': { id: 'usr_rev', name: 'Stage 1 Reviewer', email: 'reviewer@nexvault.com', role: 'reviewer', password: 'password123' },
  'manager@nexvault.com': { id: 'usr_mgr', name: 'Financial Manager', email: 'manager@nexvault.com', role: 'manager', password: 'password123' },
  'finance@nexvault.com': { id: 'usr_fin', name: 'VP of Finance', email: 'finance@nexvault.com', role: 'finance', password: 'password123' }
};

export default function Login() {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const foundUser = TEST_USERS[email];
    if (foundUser && foundUser.password === password) {
      // Exclude password before storing in Context
      const { password: _, ...secureUser } = foundUser;
      login(secureUser);
      navigate('/');
    } else {
      setError('Invalid email or password combination.');
    }
  };

  return (
    <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '1000px', display: 'flex', overflow: 'hidden' }}>
        
        <div style={{ flex: 1, padding: '3.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRight: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'var(--accent-gradient)', marginBottom: '1.5rem', boxShadow: 'var(--shadow-glow)' }}>
            <FileText size={32} color="white" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>NexVault Secure</h1>
          <p className="text-secondary" style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>Enterprise Document Authentication Gateway.</p>
        </div>
        
        <div style={{ flex: 1, padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Sign In</h2>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>Please enter your corporate credentials to continue.</p>
          
          <form onSubmit={handleLogin}>
            
            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> Email Address
              </label>
              <input 
                type="email" 
                className="form-input" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={16} /> Password
              </label>
              <input 
                type="password" 
                className="form-input" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '1rem' }}>
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
