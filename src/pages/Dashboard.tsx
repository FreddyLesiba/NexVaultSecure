import { useAppContext } from '../store/AppContext';
import { FileText, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const { documents, user } = useAppContext();

  const pendingCount = documents.filter(d => d.status === 'Pending').length;
  const approvedCount = documents.filter(d => d.status === 'Approved').length;
  const rejectedCount = documents.filter(d => d.status === 'Rejected').length;
  const voidedCount = documents.filter(d => d.status === 'Voided').length;
  const activeCount = documents.length - voidedCount;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Welcome back, <span className="text-gradient">{user?.name}</span></h1>
        <p className="text-secondary">Here's an overview of your document management workspace.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="Active Docs" value={activeCount} icon={<FileText size={24} />} color="var(--accent-primary)" />
        <StatCard title="Pending" value={pendingCount} icon={<Clock size={24} />} color="var(--warning)" />
        <StatCard title="Approved" value={approvedCount} icon={<CheckCircle size={24} />} color="var(--success)" />
        <StatCard title="Rejected" value={rejectedCount} icon={<XCircle size={24} />} color="var(--danger)" />
        <StatCard title="Voided" value={voidedCount} icon={<Trash2 size={24} />} color="var(--text-muted)" />
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Recent Documents</h3>
        {documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
            <p>No documents found.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Upload an invoice or credit note to get started.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {documents.slice(0, 5).map(doc => (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 500 }}>{doc.invoiceNumber}</td>
                    <td>{doc.vendor}</td>
                    <td className="text-secondary">{new Date(doc.date).toLocaleDateString()}</td>
                    <td>${doc.amount.toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${doc.status.toLowerCase()}`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ 
        width: '54px', height: '54px', borderRadius: '14px', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `rgba(${color === 'var(--warning)' ? '245, 158, 11' : color === 'var(--success)' ? '16, 185, 129' : color === 'var(--danger)' ? '239, 68, 68' : color === 'var(--text-muted)' ? '148, 163, 184' : '99, 102, 241'}, 0.1)`,
        color: color
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{title}</div>
      </div>
    </div>
  );
}
