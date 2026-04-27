import type {
  BillingCurrentPlan,
  Bootstrap,
  Engagement,
  InviteDetail,
  Member,
  Role,
  SessionState,
  UploadDraft,
  VaultCase,
} from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed for ${path}`;
    try {
      const payload = await response.json();
      message = payload.error || message;
    } catch {
      const text = await response.text();
      message = text || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  session: () => request<SessionState>("/api/session"),
  signUp: (payload: { email: string; password: string; fullName: string }) =>
    request<{ ok: true; session: SessionState }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logIn: (payload: { email: string; password: string }) =>
    request<{ ok: true; session: SessionState }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logOut: () =>
    request<{ ok: true }>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    }),
  createOrganization: (payload: { name: string; slug: string; useCase: string; plan: string }) =>
    request<{ ok: true; organizationId: string }>("/api/organizations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  selectOrganization: (organizationId: string) =>
    request<{ ok: true }>("/api/organizations/select", {
      method: "POST",
      body: JSON.stringify({ organizationId }),
    }),
  getInvite: (token: string) => request<InviteDetail>(`/api/invites/${token}`),
  acceptInvite: (token: string, payload: { fullName?: string; password?: string }) =>
    request<{ ok: true }>(`/api/invites/${token}/accept`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  bootstrap: () => request<Bootstrap>("/api/bootstrap"),
  listVaultCases: (params?: {
    query?: string;
    title?: string;
    client?: string;
    brief?: string;
    problemType?: string;
    industry?: string;
    capability?: string;
    sourceFirm?: string;
    limit?: number;
  }) => {
    const search = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        search.set(key, String(value));
      }
    });
    const query = search.toString();
    return request<{ cases: VaultCase[]; total: number }>(`/api/vault/cases${query ? `?${query}` : ""}`);
  },
  vaultOverview: (params?: {
    query?: string;
    problemType?: string;
    industry?: string;
    capability?: string;
    sourceFirm?: string;
    limit?: number;
  }) => {
    const search = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        search.set(key, String(value));
      }
    });
    const query = search.toString();
    return request<import("./types").VaultOverview>(`/api/vault/overview${query ? `?${query}` : ""}`);
  },
  updateVaultCaseFeedback: (caseId: string, action: "favorite" | "hide" | "use_again") =>
    request<{ ok: true; caseId: string; action: string }>(`/api/vault/cases/${caseId}/feedback`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }),
  promoteEngagementToVault: (
    engagementId: string,
    payload: {
      title: string;
      summary: string;
      industry: string;
      businessFunction: string;
      problemType: string;
      capability: string;
      tags: string[];
      outcomes: string[];
    }
  ) =>
    request<{ ok: true; vaultCaseId: string }>(`/api/engagements/${engagementId}/promote-to-vault`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getEngagement: (engagementId: string) => request<Engagement>(`/api/engagements/${engagementId}`),
  createEngagement: (payload: {
    title: string;
    client: string;
    problemType: string;
    brief: string;
    notes: string;
    uploads: UploadDraft[];
    selectedVaultCaseIds?: string[];
  }) =>
    request<Engagement>("/api/engagements", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  saveBrief: (engagementId: string, brief: string) =>
    request<Engagement>(`/api/engagements/${engagementId}/brief`, {
      method: "PATCH",
      body: JSON.stringify({ brief }),
    }),
  saveArtifact: (
    engagementId: string,
    kind: "proposal" | "issue-tree" | "workplan",
    payload: { title: string; content: unknown }
  ) =>
    request<Engagement>(`/api/engagements/${engagementId}/artifacts/${kind}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  saveWorkspace: (engagementId: string) =>
    request<Engagement>(`/api/engagements/${engagementId}/save`, {
      method: "PATCH",
      body: JSON.stringify({}),
    }),
  restoreVersion: (engagementId: string, versionId: string) =>
    request<Engagement>(`/api/engagements/${engagementId}/versions/${versionId}/restore`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  toggleMatchedCase: (engagementId: string, caseId: string, included: boolean) =>
    request(`/api/engagements/${engagementId}/matches/${caseId}`, {
      method: "PATCH",
      body: JSON.stringify({ included }),
    }),
  regenerateSection: (engagementId: string, section: string, instructions: string, evidenceMode: string) =>
    request<Engagement>(`/api/engagements/${engagementId}/regenerate`, {
      method: "POST",
      body: JSON.stringify({ section, instructions, evidenceMode }),
    }),
  uploadFiles: (engagementId: string, uploads: UploadDraft[]) =>
    request<Engagement>(`/api/engagements/${engagementId}/uploads`, {
      method: "POST",
      body: JSON.stringify({ uploads }),
    }),
  inviteMember: (email: string, role: Role) =>
    request<Member>("/api/members/invite", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),
  updateMemberRole: (memberId: string, role: Role) =>
    request<{ ok: true }>(`/api/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  removeMember: (memberId: string) =>
    request<{ ok: true }>(`/api/members/${memberId}`, {
      method: "DELETE",
    }),
  updateOrganizationName: (name: string) =>
    request<{ ok: true }>(`/api/settings/organization`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),
  updatePlan: (planName: string) =>
    request<BillingCurrentPlan>(`/api/billing/plan`, {
      method: "PATCH",
      body: JSON.stringify({ planName }),
    }),
  markExport: (engagementId: string) =>
    request<Engagement>(`/api/engagements/${engagementId}/export`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
};
