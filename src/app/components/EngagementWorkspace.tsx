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

export default function EngagementWorkspace() {
  const { engagements, currentEngagement, selectEngagement, regenerateSection } = useAppData();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('proposal');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [sectionToRegenerate, setSectionToRegenerate] = useState('');

  useEffect(() => {
    const selectedId = searchParams.get('id') || engagements[0]?.id || null;
    if (selectedId) {
      void selectEngagement(selectedId);
    }
  }, [engagements, searchParams, selectEngagement]);

  const handlePreview = (caseId: string) => {
    setSelectedCaseId(caseId);
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
        <WorkspaceTopBar engagement={currentEngagement} />

        {/* Tab Navigation */}
        <WorkspaceTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="bg-white">
          {activeTab === 'brief' && <BriefTab engagement={currentEngagement} />}
          {activeTab === 'matched-cases' && <MatchedCasesTab engagement={currentEngagement} onPreview={handlePreview} />}
          {activeTab === 'proposal' && (
            <ProposalStarterTab
              onExport={() => setIsExportOpen(true)}
              onVersionHistory={() => setIsVersionHistoryOpen(true)}
              onRegenerateSection={handleRegenerateSection}
              engagement={currentEngagement}
            />
          )}
          {activeTab === 'issue-tree' && (
            <IssueTreeTab
              onExport={() => setIsExportOpen(true)}
              onVersionHistory={() => setIsVersionHistoryOpen(true)}
            />
          )}
          {activeTab === 'workplan' && (
            <WorkplanTab
              onExport={() => setIsExportOpen(true)}
              onVersionHistory={() => setIsVersionHistoryOpen(true)}
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
      />
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
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
