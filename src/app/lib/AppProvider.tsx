import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type {
  Bootstrap,
  Engagement,
  InviteDetail,
  Member,
  Role,
  SessionState,
  UploadDraft,
  VaultCase,
  VaultOverview,
} from "./types";

interface CreateEngagementInput {
  title: string;
  client: string;
  problemType: string;
  brief: string;
  notes: string;
  uploads: UploadDraft[];
  selectedVaultCaseIds?: string[];
}

interface AppContextValue {
  session: SessionState | null;
  bootstrap: Bootstrap | null;
  engagements: Engagement[];
  currentEngagement: Engagement | null;
  isLoading: boolean;
  error: string | null;
  refreshSession: () => Promise<SessionState>;
  logIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  createOrganization: (input: { name: string; slug: string; useCase: string; plan: string }) => Promise<void>;
  selectOrganization: (organizationId: string) => Promise<void>;
  getInvite: (token: string) => Promise<InviteDetail>;
  acceptInvite: (token: string, payload: { fullName?: string; password?: string }) => Promise<void>;
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
  }) => Promise<VaultCase[]>;
  getVaultOverview: (params?: {
    query?: string;
    problemType?: string;
    industry?: string;
    capability?: string;
    sourceFirm?: string;
    limit?: number;
  }) => Promise<VaultOverview>;
  updateVaultCaseFeedback: (caseId: string, action: "favorite" | "hide" | "use_again") => Promise<void>;
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
  ) => Promise<void>;
  selectEngagement: (engagementId: string | null) => Promise<void>;
  createEngagement: (input: CreateEngagementInput) => Promise<Engagement>;
  saveBrief: (engagementId: string, brief: string) => Promise<void>;
  saveArtifact: (
    engagementId: string,
    kind: "proposal" | "issue-tree" | "workplan",
    payload: { title: string; content: unknown }
  ) => Promise<void>;
  uploadFiles: (engagementId: string, uploads: UploadDraft[]) => Promise<void>;
  saveWorkspace: (engagementId: string) => Promise<void>;
  restoreVersion: (engagementId: string, versionId: string) => Promise<void>;
  toggleMatchedCase: (engagementId: string, caseId: string, included: boolean) => Promise<void>;
  regenerateSection: (engagementId: string, section: string, instructions: string, evidenceMode: string) => Promise<void>;
  inviteMember: (email: string, role: Role) => Promise<Member>;
  updateMemberRole: (memberId: string, role: Role) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateOrganizationName: (name: string) => Promise<void>;
  updatePlan: (planName: string) => Promise<void>;
  markExport: (engagementId: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [currentEngagement, setCurrentEngagement] = useState<Engagement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncEngagement = useCallback((nextEngagement: Engagement) => {
    setEngagements((prev) =>
      prev.some((item) => item.id === nextEngagement.id)
        ? prev.map((item) => (item.id === nextEngagement.id ? nextEngagement : item))
        : [nextEngagement, ...prev]
    );
    setCurrentEngagement((prev) => (prev?.id === nextEngagement.id || !prev ? nextEngagement : prev));
  }, []);

  const refreshSession = useCallback(async () => {
    const nextSession = await api.session();
    setSession(nextSession);
    return nextSession;
  }, []);

  const refreshBootstrap = useCallback(async () => {
    const nextBootstrap = await api.bootstrap();
    setBootstrap(nextBootstrap);
    return nextBootstrap;
  }, []);

  const refreshWorkspace = useCallback(async () => {
    const nextSession = await refreshSession();
    if (!nextSession.bootstrapReady || !nextSession.authenticated) {
      setBootstrap(null);
      setEngagements([]);
      setCurrentEngagement(null);
      return;
    }
    const nextBootstrap = await refreshBootstrap();
    const summaries = nextBootstrap.dashboard.engagements;
    const details = await Promise.all(summaries.map((engagement) => api.getEngagement(engagement.id)));
    setEngagements(details);
    setCurrentEngagement((prev) => {
      if (!details.length) return null;
      if (!prev) return details[0];
      return details.find((item) => item.id === prev.id) || details[0];
    });
  }, [refreshBootstrap, refreshSession]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const nextSession = await api.session();
        if (cancelled) return;
        setSession(nextSession);
        if (nextSession.bootstrapReady && nextSession.authenticated) {
          const nextBootstrap = await api.bootstrap();
          const details = await Promise.all(
            nextBootstrap.dashboard.engagements.map((engagement) => api.getEngagement(engagement.id))
          );
          if (cancelled) return;
          setBootstrap(nextBootstrap);
          setEngagements(details);
          setCurrentEngagement(details[0] || null);
        } else {
          setBootstrap(null);
          setEngagements([]);
          setCurrentEngagement(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load app");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const logIn = useCallback(async (email: string, password: string) => {
    await api.logIn({ email, password });
    await refreshWorkspace();
  }, [refreshWorkspace]);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    await api.signUp({ fullName, email, password });
    await refreshWorkspace();
  }, [refreshWorkspace]);

  const logOut = useCallback(async () => {
    await api.logOut();
    await refreshWorkspace();
  }, [refreshWorkspace]);

  const createOrganization = useCallback(async (input: { name: string; slug: string; useCase: string; plan: string }) => {
    await api.createOrganization(input);
    await refreshWorkspace();
  }, [refreshWorkspace]);

  const selectOrganization = useCallback(async (organizationId: string) => {
    await api.selectOrganization(organizationId);
    await refreshWorkspace();
  }, [refreshWorkspace]);

  const getInvite = useCallback(async (token: string) => api.getInvite(token), []);

  const acceptInvite = useCallback(async (token: string, payload: { fullName?: string; password?: string }) => {
    await api.acceptInvite(token, payload);
    await refreshWorkspace();
  }, [refreshWorkspace]);

  const listVaultCases = useCallback(async (params?: {
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
    const result = await api.listVaultCases(params);
    return result.cases;
  }, []);

  const getVaultOverview = useCallback(async (params?: {
    query?: string;
    problemType?: string;
    industry?: string;
    capability?: string;
    sourceFirm?: string;
    limit?: number;
  }) => api.vaultOverview(params), []);

  const updateVaultCaseFeedback = useCallback(async (caseId: string, action: "favorite" | "hide" | "use_again") => {
    await api.updateVaultCaseFeedback(caseId, action);
  }, []);

  const promoteEngagementToVault = useCallback(async (
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
  ) => {
    await api.promoteEngagementToVault(engagementId, payload);
    await refreshWorkspace();
  }, [refreshWorkspace]);

  const selectEngagement = useCallback(async (engagementId: string | null) => {
    if (!engagementId) {
      setCurrentEngagement(null);
      return;
    }
    const engagement = await api.getEngagement(engagementId);
    syncEngagement(engagement);
    setCurrentEngagement(engagement);
  }, [syncEngagement]);

  const createEngagement = useCallback(async (input: CreateEngagementInput) => {
    const engagement = await api.createEngagement(input);
    syncEngagement(engagement);
    await refreshWorkspace();
    return engagement;
  }, [refreshWorkspace, syncEngagement]);

  const saveBrief = useCallback(async (engagementId: string, brief: string) => {
    const engagement = await api.saveBrief(engagementId, brief);
    syncEngagement(engagement);
    await refreshWorkspace();
  }, [refreshWorkspace, syncEngagement]);

  const saveArtifact = useCallback(async (
    engagementId: string,
    kind: "proposal" | "issue-tree" | "workplan",
    payload: { title: string; content: unknown }
  ) => {
    const engagement = await api.saveArtifact(engagementId, kind, payload);
    syncEngagement(engagement);
    await refreshWorkspace();
  }, [refreshWorkspace, syncEngagement]);

  const uploadFiles = useCallback(async (engagementId: string, uploads: UploadDraft[]) => {
    const engagement = await api.uploadFiles(engagementId, uploads);
    syncEngagement(engagement);
    await refreshWorkspace();
  }, [refreshWorkspace, syncEngagement]);

  const saveWorkspace = useCallback(async (engagementId: string) => {
    const engagement = await api.saveWorkspace(engagementId);
    syncEngagement(engagement);
    await refreshWorkspace();
  }, [refreshWorkspace, syncEngagement]);

  const restoreVersion = useCallback(async (engagementId: string, versionId: string) => {
    const engagement = await api.restoreVersion(engagementId, versionId);
    syncEngagement(engagement);
    await refreshWorkspace();
  }, [refreshWorkspace, syncEngagement]);

  const toggleMatchedCase = useCallback(async (engagementId: string, caseId: string, included: boolean) => {
    await api.toggleMatchedCase(engagementId, caseId, included);
    const engagement = await api.getEngagement(engagementId);
    syncEngagement(engagement);
    await refreshWorkspace();
  }, [refreshWorkspace, syncEngagement]);

  const regenerateSection = useCallback(async (engagementId: string, section: string, instructions: string, evidenceMode: string) => {
    const engagement = await api.regenerateSection(engagementId, section, instructions, evidenceMode);
    syncEngagement(engagement);
    await refreshWorkspace();
  }, [refreshWorkspace, syncEngagement]);

  const inviteMember = useCallback(async (email: string, role: Role) => {
    const result = await api.inviteMember(email, role);
    await refreshWorkspace();
    return result;
  }, [refreshWorkspace]);

  const updateMemberRole = useCallback(async (memberId: string, role: Role) => {
    await api.updateMemberRole(memberId, role);
    await refreshWorkspace();
  }, [refreshWorkspace]);

  const removeMember = useCallback(async (memberId: string) => {
    await api.removeMember(memberId);
    await refreshWorkspace();
  }, [refreshWorkspace]);

  const updateOrganizationName = useCallback(async (name: string) => {
    await api.updateOrganizationName(name);
    await refreshWorkspace();
  }, [refreshWorkspace]);

  const updatePlan = useCallback(async (planName: string) => {
    await api.updatePlan(planName);
    await refreshWorkspace();
  }, [refreshWorkspace]);

  const markExport = useCallback(async (engagementId: string) => {
    const engagement = await api.markExport(engagementId);
    syncEngagement(engagement);
    await refreshWorkspace();
  }, [refreshWorkspace, syncEngagement]);

  const value = useMemo<AppContextValue>(
    () => ({
      session,
      bootstrap,
      engagements,
      currentEngagement,
      isLoading,
      error,
      refreshSession,
      logIn,
      signUp,
      logOut,
      createOrganization,
      selectOrganization,
      getInvite,
      acceptInvite,
      listVaultCases,
      getVaultOverview,
      updateVaultCaseFeedback,
      promoteEngagementToVault,
      selectEngagement,
      createEngagement,
      saveBrief,
      saveArtifact,
      uploadFiles,
      saveWorkspace,
      restoreVersion,
      toggleMatchedCase,
      regenerateSection,
      inviteMember,
      updateMemberRole,
      removeMember,
      updateOrganizationName,
      updatePlan,
      markExport,
    }),
    [
      session,
      bootstrap,
      engagements,
      currentEngagement,
      isLoading,
      error,
      refreshSession,
      logIn,
      signUp,
      logOut,
      createOrganization,
      selectOrganization,
      getInvite,
      acceptInvite,
      listVaultCases,
      getVaultOverview,
      updateVaultCaseFeedback,
      promoteEngagementToVault,
      selectEngagement,
      createEngagement,
      saveBrief,
      saveArtifact,
      uploadFiles,
      saveWorkspace,
      restoreVersion,
      toggleMatchedCase,
      regenerateSection,
      inviteMember,
      updateMemberRole,
      removeMember,
      updateOrganizationName,
      updatePlan,
      markExport,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return value;
}
