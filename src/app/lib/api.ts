import type { BillingCurrentPlan, Bootstrap, Engagement, Member, Role } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed for ${path}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  bootstrap: () => request<Bootstrap>("/api/bootstrap"),
  getEngagement: (engagementId: string) => request<Engagement>(`/api/engagements/${engagementId}`),
  createEngagement: (payload: {
    title: string;
    client: string;
    problemType: string;
    brief: string;
    notes: string;
    uploads: Engagement["uploads"];
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
  toggleMatchedCase: (engagementId: string, caseId: string, included: boolean) =>
    request(`/api/engagements/${engagementId}/matches/${caseId}`, {
      method: "PATCH",
      body: JSON.stringify({ included }),
    }),
  regenerateSection: (engagementId: string, section: string, instructions: string) =>
    request(`/api/engagements/${engagementId}/regenerate`, {
      method: "POST",
      body: JSON.stringify({ section, instructions }),
    }),
  inviteMember: (email: string, role: Role) =>
    request<Member>("/api/members/invite", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),
  updateMemberRole: (memberId: string, role: Role) =>
    request<Member>(`/api/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  removeMember: (memberId: string) =>
    request(`/api/members/${memberId}`, {
      method: "DELETE",
    }),
  updateOrganizationName: (name: string) =>
    request(`/api/settings/organization`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),
  updatePlan: (planName: string) =>
    request<BillingCurrentPlan>(`/api/billing/plan`, {
      method: "PATCH",
      body: JSON.stringify({ planName }),
    }),
};
