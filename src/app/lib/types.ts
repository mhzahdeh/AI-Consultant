export type Role = "owner" | "admin" | "editor" | "viewer" | "billing";
export type MemberStatus = "active" | "invited" | "pending";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created: string;
  owner: string;
  ownerEmail: string;
  membersCount: number;
  invitesCount: number;
}

export interface Vault {
  totalDocuments: number;
  recentlyAdded: string[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  joinedAt?: string;
  invitedAt?: string;
}

export interface UploadItem {
  id: string;
  name: string;
  size: string;
  type: string;
  status: string;
  uploadedAt: string;
  pages?: number;
}

export interface MatchedCase {
  id: string;
  fileTitle: string;
  engagementTitle: string;
  confidence: number;
  confidenceLabel: "Strong" | "Medium" | "Weak";
  rationale: string;
  reusableElements: string[];
  included: boolean;
}

export interface WorkspaceData {
  lastSaved: string;
  sourceText: Array<{ id: string; source: string; content: string }>;
  proposalStarter: {
    title: string;
    generatedFrom: number;
  };
  issueTree: {
    title: string;
  };
  workplan: {
    title: string;
  };
  regenerationLog: Array<{ id: string; section: string; instructions: string; timestamp: string }>;
}

export interface Engagement {
  id: string;
  title: string;
  client: string;
  problemType: string;
  status: string;
  lastUpdated: string;
  createdAt: string;
  objective: string;
  progress: number;
  outputs: string[];
  brief: string;
  notes: string;
  uploads: UploadItem[];
  matchedCases: MatchedCase[];
  workspace: WorkspaceData;
}

export interface UsageSummaryItem {
  label: string;
  used: number;
  limit: number | string;
  unit?: string;
  icon: string;
}

export interface UsageMetric {
  category: string;
  used: number;
  limit: number | string;
  unit?: string;
  percentage: number;
  resetDate: string | null;
  isNearLimit: boolean;
  isAtLimit: boolean;
}

export interface UsageActivity {
  id: string;
  action: string;
  engagement: string;
  user: string;
  timestamp: string;
}

export interface UsageData {
  billingPeriod: string;
  summary: UsageSummaryItem[];
  metrics: UsageMetric[];
  recentActivity: UsageActivity[];
}

export interface BillingPlan {
  name: string;
  price: number | null;
  interval: string;
  description: string;
  seats: number | null;
  features: Array<{ label: string; value: string }>;
}

export interface BillingCurrentPlan {
  name: string;
  price: number | null;
  interval: string;
  renewalDate: string;
  status: string;
  seats: number | null;
  seatsUsed: number;
}

export interface BillingData {
  hasPaymentIssue: boolean;
  currentPlan: BillingCurrentPlan;
  paymentMethod: string;
  plans: BillingPlan[];
}

export interface SettingsData {
  privacyContact: string;
  supportEmail: string;
  enterpriseEmail: string;
}

export interface Bootstrap {
  user: User;
  organization: Organization;
  dashboard: {
    engagements: Array<Pick<Engagement, "id" | "title" | "client" | "problemType" | "status" | "lastUpdated" | "progress" | "objective" | "outputs">>;
    vault: Vault;
  };
  usage: UsageData;
  billing: BillingData;
  members: Member[];
  settings: SettingsData;
}
