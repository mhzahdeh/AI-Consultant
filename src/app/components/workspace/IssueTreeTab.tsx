import { useEffect, useState } from 'react';
import { Save, FileDown, Clock, History } from 'lucide-react';
import type { Engagement } from '../../lib/types';

interface IssueTreeTabProps {
  onExport: () => void;
  onVersionHistory: () => void;
  onSaveArtifact: (payload: { title: string; content: Engagement['workspace']['issueTree']['content'] }) => Promise<void>;
  engagement: Engagement;
}

export function IssueTreeTab({ onExport, onVersionHistory, onSaveArtifact, engagement }: IssueTreeTabProps) {
  const [title, setTitle] = useState(engagement.workspace.issueTree.title);
  const [rootQuestion, setRootQuestion] = useState(engagement.workspace.issueTree.content.rootQuestion);
  const [branches, setBranches] = useState(engagement.workspace.issueTree.content.branches);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  useEffect(() => {
    setTitle(engagement.workspace.issueTree.title);
    setRootQuestion(engagement.workspace.issueTree.content.rootQuestion);
    setBranches(engagement.workspace.issueTree.content.branches);
  }, [engagement.id, engagement.workspace.issueTree]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveArtifact({ title, content: { rootQuestion, branches } });
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
            <div className="mt-2 text-sm text-black/40">Issue Tree • Persisted workspace artifact</div>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <div className="mb-3 text-xs uppercase tracking-wider text-black/40">Root Question</div>
            <textarea
              value={rootQuestion}
              onChange={(event) => setRootQuestion(event.target.value)}
              rows={3}
              className="w-full resize-none border border-black/10 bg-white px-4 py-3 text-base text-black focus:border-black focus:outline-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            />
          </div>

          {branches.map((branch, branchIndex) => (
            <div key={`${branch.title}-${branchIndex}`} className="border border-black/10 bg-white p-6">
              <input
                value={branch.title}
                onChange={(event) =>
                  setBranches((prev) =>
                    prev.map((item, index) => (index === branchIndex ? { ...item, title: event.target.value } : item))
                  )
                }
                className="mb-4 w-full border-none bg-transparent text-lg text-black outline-none"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs uppercase tracking-wider text-black/40">Hypotheses</div>
                  <textarea
                    value={branch.hypotheses.join('\n')}
                    onChange={(event) =>
                      setBranches((prev) =>
                        prev.map((item, index) =>
                          index === branchIndex
                            ? { ...item, hypotheses: event.target.value.split('\n').filter(Boolean) }
                            : item
                        )
                      )
                    }
                    rows={6}
                    className="w-full resize-none border border-black/10 bg-white px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <div className="mb-2 text-xs uppercase tracking-wider text-black/40">Required Data</div>
                  <textarea
                    value={branch.requiredData.join('\n')}
                    onChange={(event) =>
                      setBranches((prev) =>
                        prev.map((item, index) =>
                          index === branchIndex
                            ? { ...item, requiredData: event.target.value.split('\n').filter(Boolean) }
                            : item
                        )
                      )
                    }
                    rows={6}
                    className="w-full resize-none border border-black/10 bg-white px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
