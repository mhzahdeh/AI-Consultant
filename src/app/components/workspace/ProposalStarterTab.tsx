import { useEffect, useState } from 'react';
import { Save, FileDown, Clock, History, RefreshCw } from 'lucide-react';
import type { Engagement, ProposalSection, SourceTrace } from '../../lib/types';

interface ProposalStarterTabProps {
  onExport: () => void;
  onVersionHistory: () => void;
  onRegenerateSection: (section: string) => void;
  onSaveArtifact: (payload: { title: string; content: { sections: ProposalSection[]; provenance?: Record<string, SourceTrace[]> } }) => Promise<void>;
  engagement: Engagement;
}

export function ProposalStarterTab({
  onExport,
  onVersionHistory,
  onRegenerateSection,
  onSaveArtifact,
  engagement,
}: ProposalStarterTabProps) {
  const [title, setTitle] = useState(engagement.workspace.proposalStarter.title);
  const [sections, setSections] = useState(engagement.workspace.proposalStarter.content.sections);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');
  const selectedCases = engagement.matchedCases.filter((item) => item.included);
  const topUploads = engagement.uploads.slice(0, 3);
  const persistedProvenance = engagement.workspace.proposalStarter.content.provenance || {};

  const buildSourceTrace = (sectionKey: string): SourceTrace[] => {
    const traces: SourceTrace[] = [
      {
        label: 'Client brief',
        detail: engagement.brief.split('\n').find((line) => line.trim()) || 'Primary engagement objective and working notes.',
      },
    ];

    if (sectionKey === 'case_evidence' || sectionKey === 'workstreams' || sectionKey === 'deliverables' || sectionKey === 'timeline') {
      traces.push(
        ...selectedCases.slice(0, 3).map((item) => ({
          label: item.engagementTitle,
          detail: item.rationale,
        }))
      );
    }

    if (sectionKey !== 'case_evidence') {
      traces.push(
        ...topUploads.map((upload) => ({
          label: upload.name,
          detail: `Uploaded source available for grounding (${upload.status}).`,
        }))
      );
    }

    return traces.slice(0, 4);
  };

  useEffect(() => {
    setTitle(engagement.workspace.proposalStarter.title);
    setSections(engagement.workspace.proposalStarter.content.sections);
  }, [engagement.id, engagement.workspace.proposalStarter]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveArtifact({ title, content: { sections, provenance: persistedProvenance } });
    setIsSaving(false);
    setSavedNotice('Saved');
    window.setTimeout(() => setSavedNotice(''), 2000);
  };

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 border-b border-black/5 bg-white px-8 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-black/40">
            <Clock className="h-3 w-3" />
            Last saved: {engagement.workspace.lastSaved}
            {savedNotice && <span className="text-black">{savedNotice}</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onVersionHistory}
              className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20"
            >
              <History className="h-4 w-4" />
              Version History
            </button>
            <button
              onClick={() => void handleSave()}
              className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 border border-black bg-black px-4 py-2 text-sm text-white transition-all hover:bg-black/90"
            >
              <FileDown className="h-4 w-4" />
              Export Draft
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full border-none bg-transparent text-3xl tracking-tight text-black outline-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            />
            <div className="mt-2 text-sm text-black/40">
              Proposal Starter • Generated from {engagement.workspace.proposalStarter.generatedFrom} prior cases
            </div>
          </div>

          {engagement.matchedCases.filter((item) => item.included).length > 0 && (
            <div className="border-l-2 border-black bg-black/[0.02] p-5">
              <div className="mb-2 text-xs uppercase tracking-wider text-black/40">Case Influence</div>
              <p className="text-sm leading-relaxed text-black/70">
                This draft is currently grounded in {engagement.matchedCases.filter((item) => item.included).length} selected analog case
                {engagement.matchedCases.filter((item) => item.included).length === 1 ? "" : "s"}.
                {" "}
                {engagement.matchedCases
                  .filter((item) => item.included)
                  .slice(0, 3)
                  .map((item) => item.engagementTitle)
                  .join(", ")}
              </p>
            </div>
          )}

          {sections.map((section) => (
            <section key={section.key} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3
                  className="text-xl tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  {section.label}
                </h3>
                <button
                  type="button"
                  onClick={() => onRegenerateSection(section.key)}
                  className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-1.5 text-xs text-black transition-all hover:border-black/20"
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </button>
              </div>
              <textarea
                value={section.body}
                onChange={(event) =>
                  setSections((prev) =>
                    prev.map((item) => (item.key === section.key ? { ...item, body: event.target.value } : item))
                  )
                }
                rows={Math.max(5, section.body.split('\n').length + 2)}
                className="w-full resize-none border border-black/10 bg-white px-4 py-4 text-sm leading-relaxed text-black focus:border-black focus:outline-none"
              />
              <div className="border border-black/10 bg-black/[0.015] px-4 py-4">
                <div className="mb-3 text-xs uppercase tracking-wider text-black/40">Source Trace</div>
                <div className="space-y-3">
                  {(persistedProvenance[section.key] || buildSourceTrace(section.key)).map((trace) => (
                    <div key={`${section.key}-${trace.label}`} className="text-sm text-black/70">
                      <div className="font-medium text-black">{trace.label}</div>
                      <div>{trace.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
