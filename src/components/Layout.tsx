
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { 
  FileText, 
  Upload, 
  CheckSquare, 
  BarChart, 
  LogOut,
  User as UserIcon,
  Users,
  LayoutDashboard
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

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

    </div>
  );
}
