import { useState } from 'react';
import { FileText, AlertCircle, Save, RefreshCw, Upload } from 'lucide-react';
import { useAppData } from '../../lib/AppProvider';
import type { Engagement } from '../../lib/types';

export function BriefTab({ engagement }: { engagement: Engagement }) {
  const { saveBrief } = useAppData();
  const [brief, setBrief] = useState(engagement.brief);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Warning Banner */}
        <div className="border-l-2 border-black/20 bg-black/[0.02] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-black/60" />
            <div className="flex-1">
              <p className="text-sm text-black/70">
                Editing the canonical brief may affect case matching and generation quality. Save and re-run matching after significant changes.
              </p>
            </div>
          </div>
        </div>

        {/* Canonical Brief */}
        <section className="border border-black/10 bg-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2
                className="mb-1 text-lg tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Canonical Brief
              </h2>
              <p className="text-sm text-black/60">
                This is your source of truth for matching and generation
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => void saveBrief(engagement.id, brief)}
                className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20"
              >
                <Save className="h-4 w-4" />
                Save Brief
              </button>
              <button className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20">
                <RefreshCw className="h-4 w-4" />
                Re-run Matching
              </button>
            </div>
          </div>

          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={16}
            className="w-full resize-none border border-black/10 bg-white py-4 px-4 text-sm leading-relaxed text-black transition-colors focus:border-black focus:outline-none"
          />

          <div className="mt-3 text-xs text-black/40">
            Last saved: {engagement.workspace.lastSaved}
          </div>
        </section>

        {/* Source Materials */}
        <section className="border border-black/10 bg-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2
              className="text-lg tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Source Materials
            </h2>
            <button className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20">
              <Upload className="h-4 w-4" />
              Add Source File
            </button>
          </div>

          <div className="space-y-3">
            {engagement.uploads.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 border border-black/10 bg-white p-4 transition-all hover:border-black/20"
              >
                <FileText className="h-5 w-5 flex-shrink-0 text-black/40" />
                <div className="flex-1">
                  <div className="mb-1 text-sm text-black">{file.name}</div>
                  <div className="text-xs text-black/40">
                    {file.type} • {file.pages} pages • Uploaded {file.uploadedAt}
                  </div>
                </div>
                <button className="text-sm text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black">
                  Preview
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Extracted Source Text */}
        <section className="border border-black/10 bg-white p-8">
          <h2
            className="mb-6 text-lg tracking-tight text-black"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Extracted Source Text
          </h2>

          {engagement.workspace.sourceText.map((source, index) => (
            <div key={source.id} className={index === 0 ? "border-l-2 border-black/5 bg-black/[0.01] p-6" : "mt-4 border-l-2 border-black/5 bg-black/[0.01] p-6"}>
              <div className="mb-4 text-xs uppercase tracking-wider text-black/40">From: {source.source}</div>
              <p className="text-sm leading-relaxed text-black/70">{source.content}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
