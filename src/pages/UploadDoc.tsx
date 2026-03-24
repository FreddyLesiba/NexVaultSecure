import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { runGeminiExtraction, type ExtractionResult } from '../lib/aiExtraction';
import type { AppDocument } from '../types';

export default function UploadDoc() {
  const { documents, addDocument, user, apiKey } = useAppContext();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractionResult | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isExactDuplicate, setIsExactDuplicate] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setIsExtracting(true);
    setDuplicateWarning(null);
    setExtractionError(null);
    setExtractedData(null);
    setIsExactDuplicate(false);
    
    if (!apiKey) {
      setExtractionError("Missing Gemini API Key! Please click the Settings gear icon in the sidebar to securely enter your free key for Real AI Document Extraction.");
      setFile(null);
      setIsExtracting(false);
      return;
    }

    try {
      const result = await runGeminiExtraction(selectedFile, apiKey);
      setExtractedData(result);
      
      // Duplicate Detection
      const exactMatch = documents.find(d => d.invoiceNumber === result.invoiceNumber);
      const similarMatch = documents.find(d => d.vendor === result.vendor && d.amount === result.amount);
      
      setIsExactDuplicate(!!exactMatch);

      if (exactMatch) {
        setDuplicateWarning(`PRIMARY BLOCKED: A document with Invoice Number ${result.invoiceNumber} already exists in the system.`);
      } else if (similarMatch) {
        setDuplicateWarning(`Secondary Warning: A document from ${result.vendor} for $${result.amount} already exists. Proceed with caution.`);
      }
      
    } catch (error: any) {
      setExtractionError(error.message);
      setFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractedData || !file || !user) return;

    const base64Str = await getBase64(file);

    const newDoc: AppDocument = {
      id: Math.random().toString(36).substring(2, 9),
      ...extractedData,
      status: 'Pending',
      currentApprovalStep: 1,
      fileName: file.name,
      fileBase64: base64Str,
      uploadedBy: user.name,
      uploadedAt: new Date().toISOString(),
      approvalHistory: []
    };

    addDocument(newDoc);
    navigate('/my-docs');
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Upload Document</h1>
        <p className="text-secondary">Drag and drop an invoice or credit note for AI extraction.</p>
      </div>

      {extractionError && (
        <div className="animate-fade-in" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderRadius: '8px', background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <AlertTriangle size={24} color="var(--danger)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '0.25rem' }}>Upload Rejected</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{extractionError}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        <div 
          className="glass-panel" 
          style={{ 
            padding: '3rem 2rem', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            border: '2px dashed rgba(99, 102, 241, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minHeight: '300px'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept="application/pdf,image/png,image/jpeg"
          />
          
          {isExtracting ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Loader2 size={48} className="text-gradient animate-spin" />
              <div style={{ fontWeight: 500 }}>NexVault AI is analyzing document...</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Extracting vendor, amounts, and verifying duplicates.</div>
            </div>
          ) : file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={32} color="#10b981" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Ready for submission</div>
              </div>
              <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={(e) => { e.stopPropagation(); setFile(null); setExtractedData(null); setIsExactDuplicate(false); setExtractionError(null); }}>
                Remove File
              </button>
            </div>
          ) : (
            <>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Upload size={32} className="text-gradient" />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Click or drag file to this area to upload</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '80%' }}>Support for a single or bulk upload. Strictly PDF, PNG, JPG representing valid Invoices.</p>
            </>
          )}
        </div>

        {extractedData && (
          <form className="glass-panel animate-fade-in" style={{ padding: '2rem' }} onSubmit={handleSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
              <FileText className="text-gradient" size={24} />
              <h3 style={{ margin: 0 }}>Extraction Results</h3>
            </div>

            {duplicateWarning && (
              <div style={{ background: isExactDuplicate ? 'var(--danger-bg)' : 'var(--warning-bg)', border: `1px solid ${isExactDuplicate ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`, padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={20} color={isExactDuplicate ? "var(--danger)" : "var(--warning)"} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: isExactDuplicate ? 'var(--danger)' : 'var(--warning)' }}>Duplicate Detected</div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>{duplicateWarning}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Vendor</label>
                <input type="text" className="form-input" value={extractedData.vendor} onChange={e => setExtractedData({...extractedData, vendor: e.target.value})} required />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Invoice Number</label>
                <input type="text" className="form-input" value={extractedData.invoiceNumber} onChange={e => setExtractedData({...extractedData, invoiceNumber: e.target.value})} required />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={extractedData.date} onChange={e => setExtractedData({...extractedData, date: e.target.value})} required />
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Document Type</label>
                <select className="form-input" value={extractedData.type} onChange={e => setExtractedData({...extractedData, type: e.target.value as any})}>
                  <option value="Invoice">Invoice</option>
                  <option value="Credit Note">Credit Note</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Total Amount ($)</label>
                <input type="number" step="0.01" className="form-input" value={extractedData.amount} onChange={e => setExtractedData({...extractedData, amount: parseFloat(e.target.value)})} required />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">VAT ($)</label>
                <input type="number" step="0.01" className="form-input" value={extractedData.vat} onChange={e => setExtractedData({...extractedData, vat: parseFloat(e.target.value)})} required />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setFile(null); setExtractedData(null); setIsExactDuplicate(false); setExtractionError(null); }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isExactDuplicate} style={{ opacity: isExactDuplicate ? 0.5 : 1, cursor: isExactDuplicate ? 'not-allowed' : 'pointer' }}>
                Submit for Approval
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
