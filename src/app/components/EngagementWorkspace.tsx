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
import { useAppData } from '../lib/AppProvider';
import { BackButton } from './shared/BackButton';
import type { UploadDraft } from '../lib/types';

export default function EngagementWorkspace() {
  const { engagements, currentEngagement, selectEngagement, regenerateSection, saveWorkspace, restoreVersion, saveArtifact, uploadFiles } = useAppData();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('proposal');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [sectionToRegenerate, setSectionToRegenerate] = useState('');
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    const selectedId = searchParams.get('id') || engagements[0]?.id || null;
    if (selectedId) {
      void selectEngagement(selectedId);
    }
  }, [engagements, searchParams, selectEngagement]);

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

  const handleRegenerate = async (instructions: string) => {
    if (!currentEngagement) return;
    await regenerateSection(currentEngagement.id, sectionToRegenerate, instructions);
    setIsRegenerateOpen(false);
  };

  const handleSaveWorkspace = async () => {
    if (!currentEngagement || isSavingWorkspace) return;
    setIsSavingWorkspace(true);
    await saveWorkspace(currentEngagement.id);
    setIsSavingWorkspace(false);
    setSaveNotice('Saved successfully');
    window.setTimeout(() => setSaveNotice(null), 2000);
  };

  if (!currentEngagement) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-black/60">Loading workspace…</div>;
  }

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
          onVersionHistory={() => setIsVersionHistoryOpen(true)}
          isSaving={isSavingWorkspace}
          saveNotice={saveNotice}
        />

        {/* Tab Navigation */}
        <WorkspaceTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="bg-white">
          {activeTab === 'brief' && (
            <BriefTab
              engagement={currentEngagement}
              onUploadFiles={async (uploads: UploadDraft[]) => {
                await uploadFiles(currentEngagement.id, uploads);
              }}
            />
          )}
          {activeTab === 'matched-cases' && <MatchedCasesTab engagement={currentEngagement} onPreview={() => handlePreview()} />}
          {activeTab === 'proposal' && (
            <ProposalStarterTab
              onExport={() => setIsExportOpen(true)}
              onVersionHistory={() => setIsVersionHistoryOpen(true)}
              onRegenerateSection={handleRegenerateSection}
              onSaveArtifact={async (payload) => {
                await saveArtifact(currentEngagement.id, 'proposal', payload);
              }}
              engagement={currentEngagement}
            />
          )}
          {activeTab === 'issue-tree' && (
            <IssueTreeTab
              onExport={() => setIsExportOpen(true)}
              onVersionHistory={() => setIsVersionHistoryOpen(true)}
              onSaveArtifact={async (payload) => {
                await saveArtifact(currentEngagement.id, 'issue-tree', payload);
              }}
              engagement={currentEngagement}
            />
          )}
          {activeTab === 'workplan' && (
            <WorkplanTab
              onExport={() => setIsExportOpen(true)}
              onVersionHistory={() => setIsVersionHistoryOpen(true)}
              onSaveArtifact={async (payload) => {
                await saveArtifact(currentEngagement.id, 'workplan', payload);
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
          await restoreVersion(currentEngagement.id, versionId);
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
    </div>
  );
}
