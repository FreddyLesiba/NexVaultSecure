import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { 
  FileText, 
  Upload, 
  CheckSquare, 
  BarChart, 
  LogOut,
  User as UserIcon,
  Settings,
  Users,
  LayoutDashboard
} from 'lucide-react';

export default function Layout() {
  const { user, logout, apiKey, setApiKey } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey || '');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const getNavItems = () => {
    switch(user?.role) {
      case 'admin':
        return [
          { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { path: '/upload', icon: <Upload size={20} />, label: 'Upload Document' },
          { path: '/my-docs', icon: <FileText size={20} />, label: 'All Documents' },
          { path: '/approvals', icon: <CheckSquare size={20} />, label: 'System Approvals' },
          { path: '/reports', icon: <BarChart size={20} />, label: 'Reports & Insights' },
          { path: '/users', icon: <Users size={20} />, label: 'User Management' },
        ];
      case 'uploader':
        return [
          { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { path: '/upload', icon: <Upload size={20} />, label: 'Upload Document' },
          { path: '/my-docs', icon: <FileText size={20} />, label: 'All Documents' },
          { path: '/reports', icon: <BarChart size={20} />, label: 'Reports & Insights' }
        ];
      case 'reviewer':
      case 'manager':
      case 'finance':
        return [
          { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
          { path: '/approvals', icon: <CheckSquare size={20} />, label: 'My Approvals' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <FileText size={18} />
            </div>
            <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.5px' }} className="text-gradient">NexVault</h2>
          </div>
        </div>
        
        <nav className="nav-menu">
          {navItems.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {user.role === 'admin' && (
            <button 
              onClick={() => setShowSettings(true)}
              className="nav-item" 
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <Settings size={20} />
              <span>Settings / API Key</span>
            </button>
          )}

          <div className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.5rem', borderRadius: '8px', color: 'var(--accent-primary)' }}>
              <UserIcon size={20} />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 500, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
            <button 
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </div>
      </main>

      {showSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ width: '400px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>System Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-secondary"><Settings size={20}/></button>
            </div>
            
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-primary)' }}>Google Gemini API Key (100% Free)</label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Since this is a client-side app, we use Google's free Gemini API to securely read your invoices.
                <br/><br/>
                Get your free key here instantly:<br/>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{color: 'var(--accent-primary)', textDecoration: 'underline'}}>Google AI Studio</a>
              </p>
              <input 
                type="password" 
                className="form-input" 
                placeholder="AIza..." 
                value={tempKey}
                onChange={e => setTempKey(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setApiKey(tempKey); setShowSettings(false); }}>Save API Key</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
