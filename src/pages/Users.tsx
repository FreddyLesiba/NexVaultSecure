import { Shield, User as UserIcon } from 'lucide-react';
import { TEST_USERS } from './Login';

export default function Users() {
  const users = Object.values(TEST_USERS);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>User Management</h1>
        <p className="text-secondary">View system accounts and assign organizational roles.</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>Email</th>
                <th style={{ padding: '1rem', fontWeight: 500 }}>System Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--bg-tertiary)', padding: '0.4rem', borderRadius: '50%' }}>
                      <UserIcon size={16} color={u.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                    </div>
                    {u.name}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      background: u.role === 'admin' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.05)', 
                      color: u.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {u.role === 'admin' && <Shield size={12} />}
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
