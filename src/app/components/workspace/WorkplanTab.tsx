import { useEffect, useState } from 'react';
import { Save, FileDown, Clock, History } from 'lucide-react';
import type { Engagement } from '../../lib/types';

interface WorkplanTabProps {
  onExport: () => void;
  onVersionHistory: () => void;
  onSaveArtifact: (payload: { title: string; content: Engagement['workspace']['workplan']['content'] }) => Promise<void>;
  engagement: Engagement;
}

export function WorkplanTab({ onExport, onVersionHistory, onSaveArtifact, engagement }: WorkplanTabProps) {
  const [title, setTitle] = useState(engagement.workspace.workplan.title);
  const [phases, setPhases] = useState(engagement.workspace.workplan.content.phases);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  useEffect(() => {
    setTitle(engagement.workspace.workplan.title);
    setPhases(engagement.workspace.workplan.content.phases);
  }, [engagement.id, engagement.workspace.workplan]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveArtifact({ title, content: { phases } });
    setIsSaving(false);
    setSavedNotice('Saved');
    window.setTimeout(() => setSavedNotice(''), 2000);
  };

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 border-b border-black/5 bg-white px-8 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
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
        <div className="mx-auto max-w-5xl space-y-8">
          <div>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full border-none bg-transparent text-2xl tracking-tight text-black outline-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            />
            <div className="mt-2 text-sm text-black/40">Workplan • Persisted workspace artifact</div>
          </div>

          {phases.map((phase, phaseIndex) => (
            <div key={`${phase.name}-${phaseIndex}`} className="border border-black/10 bg-white p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                <input
                  value={phase.name}
                  onChange={(event) =>
                    setPhases((prev) =>
                      prev.map((item, index) => (index === phaseIndex ? { ...item, name: event.target.value } : item))
                    )
                  }
                  className="border border-black/10 bg-white px-4 py-3 text-base text-black focus:border-black focus:outline-none"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                />
                <input
                  value={phase.weeks}
                  onChange={(event) =>
                    setPhases((prev) =>
                      prev.map((item, index) => (index === phaseIndex ? { ...item, weeks: event.target.value } : item))
                    )
                  }
                  className="border border-black/10 bg-white px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                />
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs uppercase tracking-wider text-black/40">Deliverables</div>
                <textarea
                  value={phase.deliverables.join('\n')}
                  onChange={(event) =>
                    setPhases((prev) =>
                      prev.map((item, index) =>
                        index === phaseIndex
                          ? { ...item, deliverables: event.target.value.split('\n').filter(Boolean) }
                          : item
                      )
                    )
                  }
                  rows={6}
                  className="w-full resize-none border border-black/10 bg-white px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
