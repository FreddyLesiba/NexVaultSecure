import { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, CheckSquare } from 'lucide-react';

export default function Approvals() {
  const { documents, user } = useAppContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Pending');

  if (!user) return null;

  const relevantDocs = documents.filter(doc => {
    if (filter === 'Pending' && doc.status !== 'Pending') return false;
    if (filter === 'Completed' && doc.status === 'Pending') return false;
    
    // Only show documents relevant to current role
    if (user.role === 'admin') return true;
    if (user.role === 'reviewer' && doc.currentApprovalStep === 1) return true;
    if (user.role === 'manager' && doc.currentApprovalStep === 2) return true;
    if (user.role === 'finance' && doc.currentApprovalStep === 3) return true;
    
    // Default fallback to see past approvals
    if (doc.approvalHistory?.some(h => h.actedBy === user.name)) return true;

    return false;
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>System Approvals</h1>
          <p className="text-secondary">Manage documents awaiting your sign-off.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${filter === 'Pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('Pending')}>
            Action Required
          </button>
          <button className={`btn ${filter === 'Completed' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('Completed')}>
            Review History
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {relevantDocs.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', marginBottom: '1rem' }}>
              <CheckSquare size={48} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3>You're all caught up!</h3>
            <p className="text-secondary" style={{ marginTop: '0.5rem' }}>No documents are currently awaiting your approval stage.</p>
          </div>
        ) : (
          relevantDocs.map(doc => (
            <div 
              key={doc.id} 
              className="glass-card animate-fade-in"
              onClick={() => navigate(`/document/${doc.id}`)}
              style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText className="text-gradient" size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {doc.vendor}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                    <span>INV: #{doc.invoiceNumber}</span>
                    <span>•</span>
                    <span>Date: {new Date(doc.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: '300px', justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>
                    ${doc.amount.toFixed(2)}
                  </div>
                  <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {doc.status !== 'Pending' ? (
                      <span>Workflow Finished</span>
                    ) : (
                      <span>Step {doc.currentApprovalStep} Pending</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={24} className="text-muted" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
