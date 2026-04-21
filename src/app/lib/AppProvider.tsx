import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import type { Bootstrap, Engagement, Member, Role } from "./types";

interface CreateEngagementInput {
  title: string;
  client: string;
  problemType: string;
  brief: string;
  notes: string;
  uploads: Engagement["uploads"];
}

interface AppContextValue {
  bootstrap: Bootstrap | null;
  engagements: Engagement[];
  currentEngagement: Engagement | null;
  isLoading: boolean;
  error: string | null;
  selectEngagement: (engagementId: string | null) => Promise<void>;
  createEngagement: (input: CreateEngagementInput) => Promise<Engagement>;
  saveBrief: (engagementId: string, brief: string) => Promise<void>;
  saveWorkspace: (engagementId: string) => Promise<void>;
  toggleMatchedCase: (engagementId: string, caseId: string, included: boolean) => Promise<void>;
  regenerateSection: (engagementId: string, section: string, instructions: string) => Promise<void>;
  inviteMember: (email: string, role: Role) => Promise<Member>;
  updateMemberRole: (memberId: string, role: Role) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateOrganizationName: (name: string) => Promise<void>;
  updatePlan: (planName: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [currentEngagement, setCurrentEngagement] = useState<Engagement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBootstrap = useCallback(async () => {
    const nextBootstrap = await api.bootstrap();
    setBootstrap(nextBootstrap);
    return nextBootstrap;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const nextBootstrap = await refreshBootstrap();
        const summaries = nextBootstrap.dashboard.engagements;
        const details = await Promise.all(summaries.map((engagement) => api.getEngagement(engagement.id)));
        if (!cancelled) {
          setEngagements(details);
          setCurrentEngagement(details[0] || null);
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

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshBootstrap]);

  const syncEngagement = useCallback((nextEngagement: Engagement) => {
    setEngagements((prev) =>
      prev.some((item) => item.id === nextEngagement.id)
        ? prev.map((item) => (item.id === nextEngagement.id ? nextEngagement : item))
        : [nextEngagement, ...prev]
    );
    setCurrentEngagement((prev) => (prev?.id === nextEngagement.id || !prev ? nextEngagement : prev));
  }, []);

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
    await refreshBootstrap();
    return engagement;
  }, [refreshBootstrap, syncEngagement]);

  const saveBrief = useCallback(async (engagementId: string, brief: string) => {
    const engagement = await api.saveBrief(engagementId, brief);
    syncEngagement(engagement);
  }, [syncEngagement]);

  const saveWorkspace = useCallback(async (engagementId: string) => {
    const engagement = await api.saveWorkspace(engagementId);
    syncEngagement(engagement);
    await refreshBootstrap();
  }, [refreshBootstrap, syncEngagement]);

  const toggleMatchedCase = useCallback(async (engagementId: string, caseId: string, included: boolean) => {
    await api.toggleMatchedCase(engagementId, caseId, included);
    const engagement = await api.getEngagement(engagementId);
    syncEngagement(engagement);
  }, [syncEngagement]);

  const regenerateSection = useCallback(async (engagementId: string, section: string, instructions: string) => {
    await api.regenerateSection(engagementId, section, instructions);
    const engagement = await api.getEngagement(engagementId);
    syncEngagement(engagement);
    await refreshBootstrap();
  }, [refreshBootstrap, syncEngagement]);

  const inviteMember = useCallback(async (email: string, role: Role) => {
    const member = await api.inviteMember(email, role);
    await refreshBootstrap();
    return member;
  }, [refreshBootstrap]);

  const updateMemberRole = useCallback(async (memberId: string, role: Role) => {
    await api.updateMemberRole(memberId, role);
    await refreshBootstrap();
  }, [refreshBootstrap]);

  const removeMember = useCallback(async (memberId: string) => {
    await api.removeMember(memberId);
    await refreshBootstrap();
  }, [refreshBootstrap]);

  const updateOrganizationName = useCallback(async (name: string) => {
    await api.updateOrganizationName(name);
    await refreshBootstrap();
  }, [refreshBootstrap]);

  const updatePlan = useCallback(async (planName: string) => {
    await api.updatePlan(planName);
    await refreshBootstrap();
  }, [refreshBootstrap]);

  const value = useMemo<AppContextValue>(
    () => ({
      bootstrap,
      engagements,
      currentEngagement,
      isLoading,
      error,
      selectEngagement,
      createEngagement,
      saveBrief,
      saveWorkspace,
      toggleMatchedCase,
      regenerateSection,
      inviteMember,
      updateMemberRole,
      removeMember,
      updateOrganizationName,
      updatePlan,
    }),
    [
      bootstrap,
      engagements,
      currentEngagement,
      isLoading,
      error,
      selectEngagement,
      createEngagement,
      saveBrief,
      saveWorkspace,
      toggleMatchedCase,
      regenerateSection,
      inviteMember,
      updateMemberRole,
      removeMember,
      updateOrganizationName,
      updatePlan,
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
