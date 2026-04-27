export type Role = "owner" | "admin" | "editor" | "viewer" | "billing";
export type MemberStatus = "active" | "invited" | "pending";
export type UploadStatus = "processing" | "parsed" | "failed";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface SessionOrganization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: Role;
  status: MemberStatus;
  memberCount: number;
  isActive: boolean;
}

export interface SessionState {
  authenticated: boolean;
  user: Pick<User, "id" | "fullName" | "email"> | null;
  organizations: SessionOrganization[];
  activeOrganizationId: string | null;
  activeRole: Role | null;
  bootstrapReady: boolean;
  onboarding?: {
    seededOwnerEmail: string;
    seededOwnerPassword: string;
  };
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

export interface VaultArtifact {
  id: string;
  name: string;
  engagementId: string;
  engagementTitle: string;
  client: string;
  problemType: string;
  uploadedAt: string;
  uploadedAtIso: string;
  status: UploadStatus;
  pages?: number;
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
  mimeType: string;
  status: UploadStatus;
  uploadedAt: string;
  uploadedAtIso: string;
  pages?: number;
  extractedText?: string;
  error?: string | null;
}

export interface SourceTrace {
  label: string;
  detail: string;
  sourceType?: "brief" | "case" | "upload" | "system";
  sourceId?: string | null;
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

export interface VaultCase {
  id: string;
  title: string;
  clientName: string;
  sourceFirm: string;
  sourceUrl: string;
  industry: string;
  businessFunction: string;
  problemType: string;
  capability: string;
  summary: string;
  outcomes: string[];
  tags: string[];
  region: string;
  year: number | null;
  evidenceStrength: number;
  reviewStatus: string;
  matchScore?: number;
  matchedSignals?: string[];
  isFavorite: boolean;
  isHidden: boolean;
  useAgainCount: number;
  isInternal?: boolean;
  linkedEngagementId?: string | null;
}

export interface VaultOverview {
  totals: {
    totalCases: number;
    totalArtifacts: number;
    totalSources: number;
  };
  highlightedCapabilities: string[];
  cases: VaultCase[];
  artifacts: VaultArtifact[];
}

export interface VersionEntry {
  id: string;
  number: number;
  timestamp: string;
  createdAt: string;
  source: string;
  description: string;
}

export interface ProposalSection {
  key: string;
  label: string;
  body: string;
}

export interface ProposalArtifactContent {
  sections: ProposalSection[];
  provenance?: Record<string, SourceTrace[]>;
}

export interface IssueTreeBranch {
  title: string;
  hypotheses: string[];
  requiredData: string[];
}

export interface IssueTreeArtifactContent {
  rootQuestion: string;
  branches: IssueTreeBranch[];
  provenance?: {
    rootQuestion?: SourceTrace[];
    branches?: Record<string, SourceTrace[]>;
  };
}

export interface WorkplanPhase {
  name: string;
  weeks: string;
  deliverables: string[];
}

export interface WorkplanArtifactContent {
  phases: WorkplanPhase[];
  provenance?: Record<string, SourceTrace[]>;
}

export interface BriefArtifactContent {
  text: string;
  notes: string;
}

export interface ArtifactRecord<TContent> {
  id: string;
  title: string;
  generatedFrom: number;
  content: TContent;
  updatedAt: string;
}

export interface WorkspaceData {
  lastSaved: string;
  currentVersionId: string | null;
  versions: VersionEntry[];
  sourceText: Array<{ id: string; source: string; content: string }>;
  proposalStarter: ArtifactRecord<ProposalArtifactContent>;
  issueTree: ArtifactRecord<IssueTreeArtifactContent>;
  workplan: ArtifactRecord<WorkplanArtifactContent>;
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
  icon?: string;
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
  icon?: string;
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

export interface InviteDetail {
  token: string;
  organizationName: string;
  invitedBy: string;
  invitedByEmail: string;
  role: Role;
  expiresIn: string;
  organizationPlan: string;
  status: string;
  email: string;
}

export interface UploadDraft {
  id: string;
  name: string;
  size: string;
  type: string;
  mimeType: string;
  uploadedAt: string;
  contentBase64: string;
}
