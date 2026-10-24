export type FdrStatus =
  | 'registered'
  | 'awaiting_verification'
  | 'pending_approval'
  | 'ready_for_release'
  | 'released'
  | 'blocked';

export type Department =
  | 'Finance'
  | 'Administration'
  | 'Accounts'
  | 'Audit'
  | 'Treasury'
  | 'Compliance';

export type WorkflowStageId =
  | 'registration'
  | 'document_verification'
  | 'department_clearance'
  | 'approval'
  | 'release_authorization'
  | 'final_release';

export type StageState = 'completed' | 'in_progress' | 'blocked' | 'upcoming';

export interface WorkflowStage {
  id: WorkflowStageId;
  label: string;
  state: StageState;
  department: Department;
  timestamp?: string;
  actor?: string;
  notes?: string;
  blockerReason?: string;
  missingRequirement?: string;
  evidence?: string[];
  recommendedAction?: string;
}

export type DocType =
  | 'FDR Receipt'
  | 'Bank Certificate'
  | 'Beneficiary ID'
  | 'Department NOC'
  | 'Invoice'
  | 'Sanction Letter';

export type VerificationState = 'match' | 'mismatch' | 'unverified';

export interface DocumentRecord {
  id: string;
  name: string;
  type: DocType;
  uploadedAt: string;
  uploadedBy: string;
  status: 'verified' | 'pending' | 'flagged';
  reference: string;
  sizeKb: number;
  fields: { label: string; value: string; state: VerificationState; note?: string }[];
  notes?: string;
}

export interface AuditEntry {
  id: string;
  fdrId: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  detail: string;
  category: 'document' | 'verification' | 'status' | 'approval' | 'note' | 'system';
}

export interface FdrRecord {
  id: string;
  beneficiary: string;
  organization: string;
  issuingBank: string;
  amount: number;
  issueDate: string;
  maturityDate: string;
  department: Department;
  status: FdrStatus;
  priority: 'high' | 'medium' | 'low';
  branch: string;
  ifsc: string;
  referenceNo: string;
  createdAt: string;
  updatedAt: string;
  nextAction: string;
  workflow: WorkflowStage[];
  documents: DocumentRecord[];
  notes: { id: string; author: string; at: string; text: string }[];
  audit: AuditEntry[];
  versionA: { label: string; value: string }[];
  versionB: { label: string; value: string }[];
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'Release Officer' | 'Verification Analyst' | 'Department Head' | 'Auditor' | 'Admin';
  department: Department;
  avatar: string;
  email: string;
}

export interface ToastMsg {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info' | 'warning';
}
