export type Role = 'admin' | 'uploader' | 'reviewer' | 'manager' | 'finance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type DocumentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Voided';

export interface AppDocument {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  vat: number;
  invoiceNumber: string;
  type: 'Invoice' | 'Credit Note';
  status: DocumentStatus;
  currentApprovalStep: 1 | 2 | 3 | 'Done'; // 1: Reviewer, 2: Manager, 3: Admin
  uploadedBy: string; // user.id
  uploadedAt: string;
  voidReason?: string;
  fileName: string;
  fileBase64?: string;
  approvalHistory: ApprovalAction[];
}

export interface ApprovalAction {
  step: number;
  actedBy: string;
  action: 'Approve' | 'Reject' | 'Void';
  timestamp: string;
}
