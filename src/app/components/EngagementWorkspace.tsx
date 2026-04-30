import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Sidebar } from './shared/Sidebar';
import { WorkspaceTopBar } from './workspace/WorkspaceTopBar';
import { WorkspaceTabs } from './workspace/WorkspaceTabs';
import { BriefTab } from './workspace/BriefTab';
import { MatchedCasesTab } from './workspace/MatchedCasesTab';
import { ProposalStarterTab } from './workspace/ProposalStarterTab';
import { IssueTreeTab } from './workspace/IssueTreeTab';
import { WorkplanTab } from './workspace/WorkplanTab';
import { MatchPreviewModal } from './workspace/MatchPreviewModal';
import { VersionHistoryModal } from './workspace/VersionHistoryModal';
import { ExportModal } from './workspace/ExportModal';
import { RegenerateSectionModal } from './workspace/RegenerateSectionModal';
import { PromoteToVaultModal } from './workspace/PromoteToVaultModal';
import { useAppData } from '../lib/AppProvider';
import { BackButton } from './shared/BackButton';
import type { UploadDraft } from '../lib/types';

type NoticeTone = 'success' | 'error';

export default function EngagementWorkspace() {
  const {
    engagements,
    currentEngagement,
    selectEngagement,
    regenerateSection,
    saveWorkspace,
    restoreVersion,
    saveArtifact,
    uploadFiles,
    promoteEngagementToVault,
    duplicateEngagement,
    updateEngagementStatus,
    deleteEngagement,
  } = useAppData();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('proposal');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [sectionToRegenerate, setSectionToRegenerate] = useState('');
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<NoticeTone>('success');

  useEffect(() => {
    const selectedId = searchParams.get('id') || engagements[0]?.id || null;
    if (selectedId) {
      void selectEngagement(selectedId);
    }
  }, [engagements, searchParams, selectEngagement]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const handleInclude = () => {
    setIsPreviewOpen(false);
  };

  const handleRegenerateSection = (section: string) => {
    setSectionToRegenerate(section);
    setIsRegenerateOpen(true);
  };

  const handleRegenerate = async (instructions: string, evidenceMode: string) => {
    if (!currentEngagement) return;
    try {
      await regenerateSection(currentEngagement.id, sectionToRegenerate, instructions, evidenceMode);
      showNotice('Section regenerated');
      setIsRegenerateOpen(false);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Unable to regenerate section', 'error');
    }
  };

  const handleSaveWorkspace = async () => {
    if (!currentEngagement || isSavingWorkspace) return;
    try {
      setIsSavingWorkspace(true);
      await saveWorkspace(currentEngagement.id);
      showNotice('Workspace saved');
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Unable to save workspace', 'error');
    } finally {
      setIsSavingWorkspace(false);
    }
  };

  const showNotice = (message: string, tone: NoticeTone = 'success') => {
    setNoticeTone(tone);
    setSaveNotice(message);
    window.setTimeout(() => setSaveNotice(null), 2500);
  };

  if (!currentEngagement) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-black/60">Loading workspace…</div>;
  }

  const selectedCases = currentEngagement.matchedCases.filter((item) => item.included);
  const promoteDefaults = {
    title: `${currentEngagement.title} Internal Case`,
    summary:
      currentEngagement.notes.trim() ||
      currentEngagement.brief.split('\n').find((line) => line.trim()) ||
      `Reusable engagement pattern for ${currentEngagement.client}.`,
    industry: selectedCases[0]?.engagementTitle.split(' ').slice(0, 2).join(' ') || 'General',
    businessFunction: selectedCases[0]?.reusableElements[0] || 'Strategy',
    problemType: currentEngagement.problemType,
    capability: selectedCases[0]?.fileTitle || 'Engagement Delivery',
    tags: Array.from(
      new Set(
        [
          currentEngagement.problemType,
          currentEngagement.client,
          ...selectedCases.flatMap((item) => item.reusableElements),
        ]
          .map((item) => item.trim())
          .filter(Boolean)
      )
    ).slice(0, 6),
    outcomes: currentEngagement.outputs.slice(0, 4),
  };

  const workflowSteps = [
    { id: 'brief', label: 'Create engagement' },
    { id: 'matched-cases', label: 'Review matched cases' },
    { id: 'proposal', label: 'Generate outputs' },
    { id: 'workplan', label: 'Inspect traceability' },
    { id: 'vault', label: 'Save to vault' },
  ];

  const activeWorkflowIndex =
    activeTab === 'brief'
      ? 0
      : activeTab === 'matched-cases'
      ? 1
      : activeTab === 'proposal' || activeTab === 'issue-tree'
      ? 2
      : activeTab === 'workplan'
      ? 3
      : 4;

  const primaryAction = (() => {
    if (activeTab === 'brief') {
      return {
        label: 'Review Matched Cases',
        disabled: !currentEngagement.brief.trim() && currentEngagement.uploads.length === 0,
        run: () => setActiveTab('matched-cases'),
      };
    }
    if (activeTab === 'matched-cases') {
      return {
        label: 'Generate Proposal',
        disabled: currentEngagement.matchedCases.filter((item) => item.included).length === 0,
        run: () => setActiveTab('proposal'),
      };
    }
    if (activeTab === 'proposal') {
      return {
        label: 'Inspect Issue Tree',
        disabled: false,
        run: () => setActiveTab('issue-tree'),
      };
    }
    if (activeTab === 'issue-tree') {
      return {
        label: 'Review Workplan',
        disabled: false,
        run: () => setActiveTab('workplan'),
      };
    }
    return {
      label: 'Save to Vault',
      disabled: false,
      run: () => setIsPromoteOpen(true),
    };
  })();

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeItem="engagements" />

      <div className="flex-1">
        {/* Back Navigation */}
        <div className="border-b border-black/5 bg-white px-8 py-3">
          <BackButton fallbackTo="/dashboard" />
        </div>

        {/* Workspace Top Bar */}
        <WorkspaceTopBar
          engagement={currentEngagement}
          onSave={handleSaveWorkspace}
          onExport={() => setIsExportOpen(true)}
          onPrimaryAction={primaryAction.run}
          onVersionHistory={() => setIsVersionHistoryOpen(true)}
          onDuplicate={async () => {
            try {
              const duplicate = await duplicateEngagement(currentEngagement.id);
              showNotice('Engagement duplicated');
              window.location.assign(`/workspace?id=${duplicate.id}`);
            } catch (error) {
              showNotice(error instanceof Error ? error.message : 'Unable to duplicate engagement', 'error');
            }
          }}
          onArchive={async () => {
            try {
              const nextStatus = currentEngagement.status === 'Archived' ? 'Draft' : 'Archived';
              await updateEngagementStatus(currentEngagement.id, nextStatus);
              showNotice(nextStatus === 'Archived' ? 'Engagement archived' : 'Engagement restored to draft');
            } catch (error) {
              showNotice(error instanceof Error ? error.message : 'Unable to update engagement status', 'error');
            }
          }}
          onDelete={async () => {
            const confirmed = window.confirm(`Delete "${currentEngagement.title}"? This removes the workspace, uploads, and version history.`);
            if (!confirmed) return;
            try {
              await deleteEngagement(currentEngagement.id);
              window.location.assign('/dashboard');
            } catch (error) {
              showNotice(error instanceof Error ? error.message : 'Unable to delete engagement', 'error');
            }
          }}
          onPromoteToVault={() => setIsPromoteOpen(true)}
          primaryActionLabel={primaryAction.label}
          primaryActionDisabled={primaryAction.disabled}
          isSaving={isSavingWorkspace}
          saveNotice={saveNotice}
          noticeTone={noticeTone}
        />

        {/* Tab Navigation */}
        <WorkspaceTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="border-b border-black/5 bg-black/[0.015] px-8 py-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid gap-3 md:grid-cols-5">
              {workflowSteps.map((step, index) => {
                const isComplete = index < activeWorkflowIndex;
                const isActive = index === activeWorkflowIndex;
                return (
                  <div
                    key={step.id}
                    className={`border px-4 py-3 text-sm ${
                      isActive
                        ? 'border-black bg-white text-black'
                        : isComplete
                        ? 'border-black/10 bg-white text-black/70'
                        : 'border-black/10 bg-transparent text-black/40'
                    }`}
                  >
                    <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-black/35">Step {index + 1}</div>
                    <div>{step.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="max-w-md text-sm text-black/60">
              {activeTab === 'brief' && 'Make sure the brief is grounded enough to drive retrieval. Then move into matched cases.'}
              {activeTab === 'matched-cases' && 'Keep only the cases you would actually want shaping the first draft. Then generate outputs.'}
              {activeTab === 'proposal' && 'Start with the proposal storyline, then pressure-test the issue tree and workplan before saving the engagement.'}
              {activeTab === 'issue-tree' && 'Use the issue tree to verify that the proposal logic is defensible before moving into execution planning.'}
              {activeTab === 'workplan' && 'Check source traceability and final delivery structure. Then save the engagement into the vault if it is reusable.'}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white">
          {activeTab === 'brief' && (
            <BriefTab
              engagement={currentEngagement}
              onGoToMatchedCases={() => setActiveTab('matched-cases')}
              onUploadFiles={async (uploads: UploadDraft[]) => {
                try {
                  await uploadFiles(currentEngagement.id, uploads);
                } catch (error) {
                  showNotice(error instanceof Error ? error.message : 'Unable to upload files', 'error');
                  throw error;
                }
              }}
              onStatusMessage={(message, tone) => showNotice(message, tone)}
            />
          )}
          {activeTab === 'matched-cases' && (
            <MatchedCasesTab engagement={currentEngagement} onPreview={() => handlePreview()} onContinue={() => setActiveTab('proposal')} />
          )}
          {activeTab === 'proposal' && (
            <ProposalStarterTab
              onExport={() => setIsExportOpen(true)}
              onVersionHistory={() => setIsVersionHistoryOpen(true)}
              onRegenerateSection={handleRegenerateSection}
              onSaveArtifact={async (payload) => {
                try {
                  await saveArtifact(currentEngagement.id, 'proposal', payload);
                  showNotice('Proposal saved');
                } catch (error) {
                  showNotice(error instanceof Error ? error.message : 'Unable to save proposal', 'error');
                  throw error;
                }
              }}
              engagement={currentEngagement}
            />
          )}
          {activeTab === 'issue-tree' && (
            <IssueTreeTab
              onExport={() => setIsExportOpen(true)}
              onVersionHistory={() => setIsVersionHistoryOpen(true)}
              onSaveArtifact={async (payload) => {
                try {
                  await saveArtifact(currentEngagement.id, 'issue-tree', payload);
                  showNotice('Issue tree saved');
                } catch (error) {
                  showNotice(error instanceof Error ? error.message : 'Unable to save issue tree', 'error');
                  throw error;
                }
              }}
              engagement={currentEngagement}
            />
          )}
          {activeTab === 'workplan' && (
            <WorkplanTab
              onExport={() => setIsExportOpen(true)}
              onVersionHistory={() => setIsVersionHistoryOpen(true)}
              onSaveArtifact={async (payload) => {
                try {
                  await saveArtifact(currentEngagement.id, 'workplan', payload);
                  showNotice('Workplan saved');
                } catch (error) {
                  showNotice(error instanceof Error ? error.message : 'Unable to save workplan', 'error');
                  throw error;
                }
              }}
              engagement={currentEngagement}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <MatchPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onInclude={handleInclude}
      />
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        engagement={currentEngagement}
        onRestore={async (versionId) => {
          if (!currentEngagement) return;
          try {
            await restoreVersion(currentEngagement.id, versionId);
            showNotice('Version restored');
          } catch (error) {
            showNotice(error instanceof Error ? error.message : 'Unable to restore version', 'error');
            throw error;
          }
        }}
      />
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        engagement={currentEngagement}
      />
      <RegenerateSectionModal
        isOpen={isRegenerateOpen}
        onClose={() => setIsRegenerateOpen(false)}
        sectionName={sectionToRegenerate}
        onRegenerate={handleRegenerate}
      />
      <PromoteToVaultModal
        isOpen={isPromoteOpen}
        onClose={() => setIsPromoteOpen(false)}
        defaults={promoteDefaults}
        onSubmit={async (payload) => {
          try {
            await promoteEngagementToVault(currentEngagement.id, payload);
            showNotice('Saved to vault');
          } catch (error) {
            showNotice(error instanceof Error ? error.message : 'Unable to save engagement to vault', 'error');
            throw error;
          }
        }}
      />
    </div>
  );
}
