import type {
  FdrRecord,
  FdrStatus,
  Department,
  WorkflowStage,
  WorkflowStageId,
  DocumentRecord,
  AuditEntry,
  UserProfile,
} from '@/types';

const banks = [
  'State Bank of India',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Bank of India',
  'Indian Bank',
  'ICICI Bank',
];

const branches = [
  'Connaught Place, New Delhi',
  'Fort, Mumbai',
  'MG Road, Bengaluru',
  'Anna Salai, Chennai',
  'Park Street, Kolkata',
  'Hazratganj, Lucknow',
  'Sector 17, Chandigarh',
  'Banjara Hills, Hyderabad',
];

const orgs = [
  'National Institute of Technology, Kurukshetra',
  'IIT Bombay Research Foundation',
  'All India Council for Technical Education',
  'Vellore Institute of Technology',
  'BITS Pilani Campus Trust',
  'Delhi Technological University',
  'Anna University Grants Cell',
  'College of Engineering, Pune',
  'JNTU Hyderabad Finance Office',
  'NIT Trichy Administrative Block',
  'IIIT Hyderabad Sponsored Projects',
  'PEC University of Technology',
];

const beneficiaries = [
  'Dr. Anil Sharma',
  'Prof. Meera Iyer',
  'Dr. Rajesh Kumar',
  'Ms. Priya Nair',
  'Dr. Sanjay Verma',
  'Prof. Kavita Reddy',
  'Dr. Arjun Mehta',
  'Ms. Sneha Patil',
  'Dr. Vivek Anand',
  'Prof. Rohit Deshmukh',
  'Dr. Nisha Gupta',
  'Dr. Karthik Subramaniam',
  'Prof. Anita Joshi',
  'Dr. Manoj Saxena',
  'Ms. Divya Krishnan',
];

const departments: Department[] = ['Finance', 'Administration', 'Accounts', 'Audit', 'Treasury', 'Compliance'];

const stageLabels: Record<WorkflowStageId, string> = {
  registration: 'FDR Registration',
  document_verification: 'Document Verification',
  department_clearance: 'Department Clearance',
  approval: 'Approval',
  release_authorization: 'Release Authorization',
  final_release: 'Final Release',
};

const stageDepartments: Record<WorkflowStageId, Department> = {
  registration: 'Administration',
  document_verification: 'Compliance',
  department_clearance: 'Accounts',
  approval: 'Audit',
  release_authorization: 'Treasury',
  final_release: 'Finance',
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rng = seededRandom(20261024);
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const pickI = <T>(arr: T[], i: number): T => arr[i % arr.length];
const money = (min: number, max: number) => Math.round((min + rng() * (max - min)) / 50000) * 50000;

function pad(n: number, w = 4) { return String(n).padStart(w, '0'); }

function daysFromNow(d: number): string {
  const t = new Date('2026-10-24T09:00:00Z');
  t.setDate(t.getDate() + d);
  return t.toISOString();
}

function isoDate(d: number): string {
  const t = new Date('2026-10-24T09:00:00Z');
  t.setDate(t.getDate() + d);
  return t.toISOString().slice(0, 10);
}

const statusFlow: FdrStatus[] = [
  'registered',
  'awaiting_verification',
  'pending_approval',
  'ready_for_release',
  'released',
];

function buildWorkflow(status: FdrStatus, blockedStage?: WorkflowStageId, id: string = ''): WorkflowStage[] {
  const order: WorkflowStageId[] = [
    'registration',
    'document_verification',
    'department_clearance',
    'approval',
    'release_authorization',
    'final_release',
  ];
  const blockedIndex = blockedStage ? order.indexOf(blockedStage) : -1;
  let activeIndex: number;
  if (status === 'blocked' && blockedStage) {
    activeIndex = order.indexOf(blockedStage);
  } else if (status === 'released') {
    activeIndex = order.length;
  } else {
    activeIndex = statusFlow.indexOf(status);
  }
  return order.map((sid, i) => {
    let state: WorkflowStage['state'];
    if (i < activeIndex || (status === 'released' && i < order.length)) state = 'completed';
    else if (status === 'blocked' && i === activeIndex) state = 'blocked';
    else if (i === activeIndex) state = 'in_progress';
    else state = 'upcoming';

    const stage: WorkflowStage = {
      id: sid,
      label: stageLabels[sid],
      state,
      department: stageDepartments[sid],
    };
    if (state === 'completed') {
      stage.timestamp = daysFromNow(-(order.length - i) * 3 - (rng() * 2));
      stage.actor = pick(['Anita Verma', 'Rajiv Menon', 'Sunita Kapoor', 'Deepak Rao']);
      stage.notes = `${stageLabels[sid]} completed and logged.`;
    }
    if (state === 'in_progress') {
      stage.timestamp = daysFromNow(-1);
      stage.notes = `${stageLabels[sid]} in progress. Awaiting department sign-off.`;
    }
    if (state === 'blocked') {
      stage.blockerReason = 'Outstanding document not submitted by beneficiary department.';
      stage.missingRequirement = 'Original bank FDR receipt with seal';
      stage.evidence = ['Document upload log', 'Beneficiary request email'];
      stage.recommendedAction = 'Request physical receipt from beneficiary within 48 hours.';
      stage.notes = `Blocked at ${stageLabels[sid]} — pending evidence.`;
    }
    return stage;
  });
}

function buildDocuments(fdrId: string, status: FdrStatus): DocumentRecord[] {
  const base: { type: DocumentRecord['type']; name: string; ref: string }[] = [
    { type: 'FDR Receipt', name: 'FDR-Receipt.pdf', ref: '' },
    { type: 'Bank Certificate', name: 'Bank-Cert.pdf', ref: '' },
    { type: 'Beneficiary ID', name: 'KYC-Beneficiary.pdf', ref: '' },
    { type: 'Department NOC', name: 'NOC-Dept.pdf', ref: '' },
    { type: 'Sanction Letter', name: 'Sanction.pdf', ref: '' },
  ];
  return base.map((b, i) => {
    const verified = status === 'released' || status === 'ready_for_release' ? true : i < 2;
    const flagged = status === 'blocked' && i === 3;
    return {
      id: `${fdrId}-DOC-${pad(i + 1)}`,
      name: b.name,
      type: b.type,
      uploadedAt: daysFromNow(-(8 + i)),
      uploadedBy: pick(['Anita Verma', 'Rajiv Menon', 'Sunita Kapoor']),
      status: flagged ? 'flagged' : verified ? 'verified' : 'pending',
      reference: `REF/${b.type.slice(0, 3).toUpperCase()}/${pad(2000 + i)}`,
      sizeKb: 120 + Math.floor(rng() * 600),
      fields: [
        { label: 'FDR Number', value: fdrId, state: verified ? 'match' : 'unverified' },
        { label: 'Beneficiary', value: pick(beneficiaries), state: verified ? 'match' : 'unverified' },
        { label: 'Amount', value: `₹${(money(5, 80)).toLocaleString('en-IN')}`, state: verified ? 'match' : 'unverified' },
        { label: 'Issue Date', value: isoDate(-120), state: verified ? 'match' : 'unverified' },
        { label: 'Maturity Date', value: isoDate(45), state: flagged ? 'mismatch' : verified ? 'match' : 'unverified', note: flagged ? 'Date differs from bank certificate' : undefined },
      ],
      notes: verified ? 'All key fields verified against source.' : flagged ? 'Maturity date mismatch detected during review.' : 'Pending verification by compliance team.',
    };
  });
}

function buildAudit(fdrId: string): AuditEntry[] {
  const actions = [
    { action: 'FDR Registered', detail: 'New FDR record created and submitted by Administration.', category: 'status' as const },
    { action: 'Document Uploaded', detail: 'FDR Receipt and Bank Certificate uploaded.', category: 'document' as const },
    { action: 'Verification Started', detail: 'Compliance began document verification.', category: 'verification' as const },
    { action: 'Fields Verified', detail: 'FDR number and amount matched against bank certificate.', category: 'verification' as const },
    { action: 'Department Clearance', detail: 'Accounts department reviewed and cleared.', category: 'approval' as const },
    { action: 'Approval Granted', detail: 'Audit granted approval for release authorization.', category: 'approval' as const },
    { action: 'Release Authorized', detail: 'Treasury authorized final release.', category: 'approval' as const },
    { action: 'FDR Released', detail: 'Final release completed and recorded.', category: 'status' as const },
  ];
  return actions.map((a, i) => ({
    id: `${fdrId}-AUD-${pad(i + 1)}`,
    fdrId,
    timestamp: daysFromNow(-(actions.length - i) * 3),
    actor: pick(['Anita Verma', 'Rajiv Menon', 'Sunita Kapoor', 'Deepak Rao']),
    role: pick(['Verification Analyst', 'Release Officer', 'Department Head', 'Auditor']),
    action: a.action,
    detail: a.detail,
    category: a.category,
  }));
}

function buildVersions(amount: number, maturityDate: string, bank: string, beneficiary: string, ref: string) {
  const a = [
    { label: 'FDR Number', value: ref },
    { label: 'Bank Name', value: bank },
    { label: 'Principal Amount', value: `₹${amount.toLocaleString('en-IN')}` },
    { label: 'Issue Date', value: isoDate(-120) },
    { label: 'Maturity Date', value: maturityDate },
    { label: 'Beneficiary', value: beneficiary },
    { label: 'Reference Number', value: `REF/${ref.slice(-4)}/2026` },
  ];
  // version B has a different maturity date to demo a discrepancy
  const b = a.map((row) => ({ ...row }));
  const mIdx = b.findIndex((r) => r.label === 'Maturity Date');
  const orig = new Date(maturityDate);
  orig.setDate(orig.getDate() + 22);
  b[mIdx] = { ...b[mIdx], value: orig.toISOString().slice(0, 10) };
  return { versionA: a, versionB: b };
}

let fdrCounter = 1001;
const records: FdrRecord[] = [];

for (let i = 0; i < 48; i++) {
  const id = `FDR-${26}-${pad(fdrCounter++, 5)}`;
  const statusIdx = Math.floor(rng() * 6);
  let status: FdrStatus;
  let blockedStage: WorkflowStageId | undefined;
  if (statusIdx === 5) {
    status = 'blocked';
    blockedStage = pickI(['document_verification', 'department_clearance', 'approval'] as WorkflowStageId[], i);
  } else {
    status = statusFlow[statusIdx % statusFlow.length];
  }
  const dept = pickI(departments, i);
  const bank = pickI(banks, i + 2);
  const amount = money(5, 80) * 100000; // 5L to 80L
  const issueDate = isoDate(-120 + Math.floor(rng() * -60));
  const maturityDate = isoDate(10 + Math.floor(rng() * 90));
  const beneficiary = pickI(beneficiaries, i);
  const org = pickI(orgs, i);
  const ref = `SBI/${pad(8000 + i, 5)}/${new Date().getFullYear()}`;

  const nextActions: Record<FdrStatus, string> = {
    registered: 'Submit original bank certificate',
    awaiting_verification: 'Complete document verification',
    pending_approval: 'Awaiting department approval',
    ready_for_release: 'Authorize final release',
    released: 'No action — released',
    blocked: 'Resolve outstanding blocker',
  };

  const workflow = buildWorkflow(status, blockedStage, id);
  const documents = buildDocuments(id, status);
  const audit = buildAudit(id);
  const versions = buildVersions(amount, maturityDate, bank, beneficiary, ref);

  records.push({
    id,
    beneficiary,
    organization: org,
    issuingBank: bank,
    amount,
    issueDate,
    maturityDate,
    department: dept,
    status,
    priority: rng() > 0.7 ? 'high' : rng() > 0.4 ? 'medium' : 'low',
    branch: pickI(branches, i),
    ifsc: `SBIN0${pad(6000 + i, 5)}`,
    referenceNo: ref,
    createdAt: daysFromNow(-15 - Math.floor(rng() * 30)),
    updatedAt: daysFromNow(-Math.floor(rng() * 5)),
    nextAction: nextActions[status],
    workflow,
    documents,
    notes: [
      { id: `${id}-N1`, author: 'Anita Verma', at: daysFromNow(-4), text: 'Beneficiary confirmed receipt details over email.' },
    ],
    audit,
    versionA: versions.versionA,
    versionB: versions.versionB,
  });
}

// Ensure at least a few in each status for consistency
function forceStatus(target: FdrStatus, start: number, count: number) {
  for (let i = 0; i < count; i++) {
    records[start + i].status = target;
    records[start + i].workflow = buildWorkflow(target, undefined, records[start + i].id);
    records[start + i].nextAction = ({
      registered: 'Submit original bank certificate',
      awaiting_verification: 'Complete document verification',
      pending_approval: 'Awaiting department approval',
      ready_for_release: 'Authorize final release',
      released: 'No action — released',
      blocked: 'Resolve outstanding blocker',
    } as const)[target];
  }
}
forceStatus('awaiting_verification', 0, 11);
forceStatus('pending_approval', 11, 9);
forceStatus('ready_for_release', 20, 6);
forceStatus('released', 26, 16);
for (let i = 42; i < 48; i++) {
  records[i].status = 'blocked';
  const bs = (['document_verification', 'department_clearance', 'approval'] as WorkflowStageId[])[i % 3];
  records[i].workflow = buildWorkflow('blocked', bs, records[i].id);
  records[i].nextAction = 'Resolve outstanding blocker';
}

export const fdrRecords: FdrRecord[] = records;

export function getFdr(id: string): FdrRecord | undefined {
  return fdrRecords.find((r) => r.id === id);
}

export function getAllAudit(): AuditEntry[] {
  return [...fdrRecords]
    .flatMap((r) => r.audit)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export interface DashboardKpis {
  total: number;
  awaitingVerification: number;
  pendingApprovals: number;
  readyForRelease: number;
  blocked: number;
  released: number;
}

export function getKpis(): DashboardKpis {
  const count = (s: FdrStatus) => fdrRecords.filter((r) => r.status === s).length;
  return {
    total: fdrRecords.length,
    awaitingVerification: count('awaiting_verification'),
    pendingApprovals: count('pending_approval'),
    readyForRelease: count('ready_for_release'),
    blocked: count('blocked'),
    released: count('released'),
  };
}

export function getReleaseTrends() {
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  return months.map((m, i) => ({
    month: m,
    submitted: 14 + i * 5 + Math.floor(rng() * 6),
    released: 8 + i * 4 + Math.floor(rng() * 5),
  }));
}

export function getWorkflowHealth() {
  const stages: WorkflowStageId[] = [
    'registration',
    'document_verification',
    'department_clearance',
    'approval',
    'release_authorization',
    'final_release',
  ];
  return stages.map((s) => ({
    stage: stageLabels[s],
    count: fdrRecords.filter((r) => {
      const st = r.workflow.find((w) => w.id === s);
      return st && (st.state === 'in_progress' || st.state === 'blocked');
    }).length + Math.floor(rng() * 4),
  }));
}

export function getDepartmentWorkload() {
  return departments.map((d) => ({
    department: d,
    pending: fdrRecords.filter((r) => r.department === d && r.status !== 'released').length,
  }));
}

export function getUpcomingMaturities() {
  const now = new Date('2026-10-24').getTime();
  return fdrRecords
    .filter((r) => {
      const m = new Date(r.maturityDate).getTime();
      const days = (m - now) / (1000 * 60 * 60 * 24);
      return days > 0 && days < 60;
    })
    .sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime())
    .slice(0, 6);
}

export function getPriorityQueue() {
  return fdrRecords
    .filter((r) => r.priority === 'high' && r.status !== 'released')
    .slice(0, 6)
    .map((r) => {
      const blocked = r.workflow.find((w) => w.state === 'blocked');
      const inprog = r.workflow.find((w) => w.state === 'in_progress');
      return {
        id: r.id,
        beneficiary: r.beneficiary,
        amount: r.amount,
        department: r.department,
        blocker: blocked ? blocked.blockerReason || 'Pending evidence' : inprog ? inprog.label + ' in progress' : 'Awaiting step',
        nextAction: r.nextAction,
        status: r.status,
      };
    });
}

export function getRecentActivity(limit = 8): AuditEntry[] {
  return getAllAudit().slice(0, limit);
}

export const users: UserProfile[] = [
  { id: 'u1', name: 'Anita Verma', role: 'Release Officer', department: 'Finance', avatar: 'AV', email: 'anita.verma@fdrsentinel.gov.in' },
  { id: 'u2', name: 'Rajiv Menon', role: 'Verification Analyst', department: 'Compliance', avatar: 'RM', email: 'rajiv.menon@fdrsentinel.gov.in' },
  { id: 'u3', name: 'Sunita Kapoor', role: 'Department Head', department: 'Accounts', avatar: 'SK', email: 'sunita.kapoor@fdrsentinel.gov.in' },
  { id: 'u4', name: 'Deepak Rao', role: 'Auditor', department: 'Audit', avatar: 'DR', email: 'deepak.rao@fdrsentinel.gov.in' },
  { id: 'u5', name: 'Meera Nair', role: 'Admin', department: 'Administration', avatar: 'MN', email: 'meera.nair@fdrsentinel.gov.in' },
];

export const statusConfig: Record<FdrStatus, { label: string; badge: string; dot: string }> = {
  registered: { label: 'Registered', badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  awaiting_verification: { label: 'Awaiting Verification', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  pending_approval: { label: 'Pending Approval', badge: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  ready_for_release: { label: 'Ready for Release', badge: 'bg-brand-50 text-brand-700', dot: 'bg-brand-500' },
  released: { label: 'Released', badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  blocked: { label: 'Blocked', badge: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
};

export function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function relativeTime(iso: string): string {
  const now = new Date('2026-10-24T09:00:00Z').getTime();
  const t = new Date(iso).getTime();
  const diff = Math.round((t - now) / 1000);
  const abs = Math.abs(diff);
  if (abs < 60) return 'just now';
  if (abs < 3600) return `${Math.round(abs / 60)}m ${diff < 0 ? 'ago' : 'from now'}`;
  if (abs < 86400) return `${Math.round(abs / 3600)}h ${diff < 0 ? 'ago' : 'from now'}`;
  return `${Math.round(abs / 86400)}d ${diff < 0 ? 'ago' : 'from now'}`;
}
