interface Tab {
  id: string;
  label: string;
}

interface WorkspaceTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function WorkspaceTabs({ activeTab, onTabChange }: WorkspaceTabsProps) {
  const tabs: Tab[] = [
    { id: 'brief', label: 'Brief' },
    { id: 'matched-cases', label: 'Matched Cases' },
    { id: 'proposal', label: 'Proposal Starter' },
    { id: 'issue-tree', label: 'Issue Tree' },
    { id: 'workplan', label: 'Workplan' },
  ];

  return (
    <div className="border-b border-black/5 bg-white px-8">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative pb-4 text-sm transition-colors ${
              activeTab === tab.id ? 'text-black' : 'text-black/40 hover:text-black/60'
            }`}
            style={{ fontFamily: activeTab === tab.id ? 'var(--font-display)' : undefined }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-px bg-black" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
