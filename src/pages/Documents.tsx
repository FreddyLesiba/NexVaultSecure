import { useAppContext } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';

export default function Documents() {
  const { documents, user } = useAppContext();
  const navigate = useNavigate();

  if (!user) return null;

  const displayDocs = documents;
  const title = 'All Documents';

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{title}</h1>
        <p className="text-secondary">{displayDocs.length} total documents system wide</p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {displayDocs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No documents found.
          </div>
        ) : (
          displayDocs.map(doc => (
            <div 
              key={doc.id} 
              className="glass-card"
              onClick={() => navigate(`/document/${doc.id}`)}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <FileText size={24} style={{ color: 'var(--accent-primary)' }} />
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.25rem' }}>{doc.vendor} - #{doc.invoiceNumber}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>$ {doc.amount.toFixed(2)} • {new Date(doc.date).toLocaleDateString()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span className={`badge badge-${doc.status.toLowerCase()}`}>
                  {doc.status}
                </span>
                <ChevronRight size={20} className="text-muted" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
