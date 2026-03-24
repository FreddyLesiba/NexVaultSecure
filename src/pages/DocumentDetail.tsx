import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { FileText, CheckCircle, XCircle, Clock, ArrowLeft, Trash2 } from 'lucide-react';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { documents, updateDocument, user } = useAppContext();
  
  const [showVoid, setShowVoid] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  const doc = documents.find(d => d.id === id);

  if (!doc || !user) return <div style={{ padding: '2rem' }}>Document not found.</div>;

  const canAction = doc.status === 'Pending' && doc.currentApprovalStep !== 'Done' && (
    (user.role === 'reviewer' && doc.currentApprovalStep === 1) ||
    (user.role === 'manager' && doc.currentApprovalStep === 2) ||
    (user.role === 'finance' && doc.currentApprovalStep === 3) ||
    (user.role === 'admin' && doc.currentApprovalStep === 3)
  );

  const canVoid = user.role === 'admin' || (user.role === 'uploader' && doc.status === 'Pending');

  const handleAction = (action: 'Approve' | 'Reject') => {
    let nextStep = doc.currentApprovalStep;
    let nextStatus = doc.status;

    if (action === 'Reject') {
      nextStatus = 'Rejected';
      nextStep = 'Done';
    } else if (action === 'Approve') {
      if (doc.currentApprovalStep === 1) nextStep = 2;
      else if (doc.currentApprovalStep === 2) nextStep = 3;
      else if (doc.currentApprovalStep === 3) {
        nextStep = 'Done';
        nextStatus = 'Approved';
      }
    }

    const newHistory = [
      ...(doc.approvalHistory || []), 
      { step: doc.currentApprovalStep as number, action, actedBy: user!.name, timestamp: new Date().toISOString() }
    ];

    updateDocument(doc.id, {
      status: nextStatus,
      currentApprovalStep: nextStep,
      approvalHistory: newHistory
    });
    
    navigate('/approvals');
  };

  const executeVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidReason.trim()) return;

    updateDocument(doc.id, {
      status: 'Voided',
      currentApprovalStep: 'Done',
      voidReason,
      approvalHistory: [
        ...(doc.approvalHistory || []),
        { step: typeof doc.currentApprovalStep === 'number' ? doc.currentApprovalStep : 0, action: 'Void', actedBy: user!.name, timestamp: new Date().toISOString() }
      ]
    });
    
    setShowVoid(false);
    navigate('/my-docs');
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1.5rem', background: 'transparent', padding: '0 0.5rem', border: 'none', color: 'var(--text-muted)' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={28} className="text-secondary" /> 
            {doc.vendor}
          </h1>
          <p className="text-secondary">Document #{doc.id.substring(0,8)} • {doc.type}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {canVoid && doc.status !== 'Voided' && (
            <button onClick={() => setShowVoid(true)} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <Trash2 size={16} /> Mark as Void
            </button>
          )}
          <span className={`badge badge-${doc.status.toLowerCase()}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
            {doc.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) minmax(280px, 1fr)', gap: '1.5rem' }}>
        
        {/* Left Side Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>Extracted Metadata</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supplier</label>
                <div style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>{doc.vendor}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice Number</label>
                <div style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>{doc.invoiceNumber}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tax Amount (VAT)</label>
                <div style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>${doc.vat.toFixed(2)}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</label>
                <div style={{ fontSize: '1.35rem', color: 'var(--accent-primary)', fontWeight: 600 }}>${doc.amount.toFixed(2)}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date</label>
                <div style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>{new Date(doc.date).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          
          {doc.fileBase64 && doc.fileBase64.startsWith('JVBERi0') ? (
             <div className="glass-panel" style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="text-muted">PDF Document Attached (Internal Preview hidden for demo speed)</p>
             </div>
          ) : doc.fileBase64 ? (
             <div className="glass-panel" style={{ padding: '1rem', overflow: 'hidden' }}>
               <img src={`data:image/jpeg;base64,${doc.fileBase64}`} alt="Invoice" style={{ width: '100%', borderRadius: '8px' }} />
             </div>
          ) : null}
        </div>

        {/* Right Side Actions & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {canAction && doc.status !== 'Voided' && (
            <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--accent-primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
              <h4 style={{ marginBottom: '1rem' }}>Required Approval Action</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                You are currently tasked with verifying this document for Stage {doc.currentApprovalStep}. Please review the extracted metrics against the source.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn" style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={() => handleAction('Reject')}>
                  <XCircle size={18} /> Reject
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleAction('Approve')}>
                  <CheckCircle size={18} /> Approve
                </button>
              </div>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Approval Ledger</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {doc.status === 'Voided' && doc.voidReason && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '0.25rem' }}>Document Voided</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>Reason: "{doc.voidReason}"</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ marginTop: '0.2rem', color: 'var(--text-muted)' }}><Clock size={18} /></div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Document Submitted</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {doc.uploadedBy} on {new Date(doc.uploadedAt).toLocaleString()}</div>
                </div>
              </div>
              
              {doc.approvalHistory?.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ marginTop: '0.2rem', color: h.action === 'Approve' ? 'var(--success)' : 'var(--danger)' }}>
                    {h.action === 'Approve' ? <CheckCircle size={18}/> : <XCircle size={18}/>}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      System Action: {h.action} {h.action !== 'Void' && `(Stage ${h.step})`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {h.actedBy} on {new Date(h.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}

              {doc.status === 'Pending' && (
                <div style={{ display: 'flex', gap: '1rem', opacity: 0.5 }}>
                  <div style={{ marginTop: '0.2rem', color: 'var(--text-muted)' }}><Clock size={18} /></div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Waiting on Stage {doc.currentApprovalStep}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requires Action</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>

      </div>

      {showVoid && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <form className="glass-panel animate-fade-in" style={{ width: '400px', padding: '2rem' }} onSubmit={executeVoid}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trash2 size={24} /> Void Document
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to void Document #{doc.id.substring(0,8)}? This action is heavily audited and cannot be undone. You must supply a reason.
            </p>
            <div className="form-group">
              <label className="form-label">Delete Reason (Required)</label>
              <textarea 
                className="form-input" 
                rows={3} 
                required 
                value={voidReason} 
                onChange={e => setVoidReason(e.target.value)}
                placeholder="E.g., Duplicate upload, incorrect vendor, etc."
                style={{ resize: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowVoid(false)}>Cancel</button>
              <button type="submit" className="btn" style={{ background: 'var(--danger)', color: 'white' }}>Confirm Void</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
