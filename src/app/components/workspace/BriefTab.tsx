import { useRef, useState } from 'react';
import { FileText, AlertCircle, Save, RefreshCw, Upload } from 'lucide-react';
import { useAppData } from '../../lib/AppProvider';
import type { Engagement, UploadDraft } from '../../lib/types';

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

export function BriefTab({
  engagement,
  onUploadFiles,
  onStatusMessage,
  onGoToMatchedCases,
}: {
  engagement: Engagement;
  onUploadFiles: (uploads: UploadDraft[]) => Promise<void>;
  onStatusMessage?: (message: string, tone?: 'success' | 'error') => void;
  onGoToMatchedCases?: () => void;
}) {
  const { saveBrief, rematchEngagement } = useAppData();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [brief, setBrief] = useState(engagement.brief);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [briefError, setBriefError] = useState('');

  const hasBrief = brief.trim().length >= 80;
  const hasUploads = engagement.uploads.length > 0;
  const canAdvance = hasBrief || hasUploads;

  const handleUploadSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    try {
      setIsUploading(true);
      const uploads = await Promise.all(files.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size >= 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(1)} KB`,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        contentBase64: await fileToBase64(file),
      })));
      await onUploadFiles(uploads);
      setStatusMessage(`Added ${uploads.length} file${uploads.length === 1 ? '' : 's'}`);
      onStatusMessage?.(`Uploaded ${uploads.length} file${uploads.length === 1 ? '' : 's'}`);
      window.setTimeout(() => setStatusMessage(''), 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to upload files';
      setStatusMessage(message);
      onStatusMessage?.(message, 'error');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="p-8">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept=".txt,.md,.csv,.json,.pdf,.docx"
        onChange={(event) => void handleUploadSelection(event)}
      />

      <div className="mx-auto max-w-5xl space-y-8">
        <div className="border-l-2 border-black/20 bg-black/[0.02] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-black/60" />
            <div className="flex-1">
              <p className="text-sm text-black/70">
                Editing the canonical brief changes the source of truth used for matching, generation, and saved versions.
              </p>
            </div>
          </div>
        </div>

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
                onClick={() => {
                  void (async () => {
                    if (!brief.trim() && engagement.uploads.length === 0) {
                      setBriefError('Add a brief or upload at least one file before continuing.');
                      onStatusMessage?.('Add a brief or upload at least one file before continuing.', 'error');
                      return;
                    }
                    try {
                      setIsSaving(true);
                      setBriefError('');
                      await saveBrief(engagement.id, brief);
                      setStatusMessage('Brief saved');
                      onStatusMessage?.('Brief saved');
                      window.setTimeout(() => setStatusMessage(''), 2000);
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Unable to save brief';
                      setStatusMessage(message);
                      onStatusMessage?.(message, 'error');
                    } finally {
                      setIsSaving(false);
                    }
                  })();
                }}
                className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving…' : 'Save Brief'}
              </button>
              <button
                onClick={() => {
                  void (async () => {
                    if (!brief.trim() && engagement.uploads.length === 0) {
                      setBriefError('Add a brief or upload at least one file before refreshing matches.');
                      onStatusMessage?.('Add a brief or upload at least one file before refreshing matches.', 'error');
                      return;
                    }
                    try {
                      setIsSaving(true);
                      setBriefError('');
                      await rematchEngagement(engagement.id);
                      setStatusMessage('Matching refreshed');
                      onStatusMessage?.('Matching refreshed');
                      window.setTimeout(() => setStatusMessage(''), 2000);
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Unable to refresh matches';
                      setStatusMessage(message);
                      onStatusMessage?.(message, 'error');
                    } finally {
                      setIsSaving(false);
                    }
                  })();
                }}
                className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20"
              >
                <RefreshCw className="h-4 w-4" />
                Re-run Matching
              </button>
            </div>
          </div>

          <textarea
            value={brief}
            onChange={(e) => {
              setBrief(e.target.value);
              if (briefError && e.target.value.trim()) {
                setBriefError('');
              }
            }}
            rows={16}
            className="w-full resize-none border border-black/10 bg-white py-4 px-4 text-sm leading-relaxed text-black transition-colors focus:border-black focus:outline-none"
          />

          {briefError ? (
            <div className="mt-3 text-xs text-red-700">{briefError}</div>
          ) : null}

          <div className="mt-3 text-xs text-black/40">
            Last saved: {engagement.workspace.lastSaved} {statusMessage ? `• ${statusMessage}` : ''}
          </div>
        </section>

        <section className="border border-black/10 bg-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2
              className="text-lg tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Source Materials
            </h2>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading…' : 'Add Source File'}
            </button>
          </div>

          <div className="space-y-3">
            {engagement.uploads.length ? (
              engagement.uploads.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 border border-black/10 bg-white p-4 transition-all hover:border-black/20"
                >
                  <FileText className="h-5 w-5 flex-shrink-0 text-black/40" />
                  <div className="flex-1">
                    <div className="mb-1 text-sm text-black">{file.name}</div>
                    <div className="text-xs text-black/40">
                      {file.type} • {file.pages ? `${file.pages} pages • ` : ''}{file.status} • Uploaded {file.uploadedAt}
                    </div>
                  </div>
                  {file.error ? (
                    <div className="text-xs text-black/60">{file.error}</div>
                  ) : (
                    <div className="text-xs text-black/60">{file.extractedText ? 'Extracted' : 'Stored'}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="border border-dashed border-black/15 bg-black/[0.015] p-8 text-sm text-black/55">
                No source files yet. Upload the RFP, notes, prior proposal, or any client material that should inform matching and generation.
              </div>
            )}
          </div>
        </section>

        <section className="border border-black/10 bg-white p-8">
          <h2
            className="mb-6 text-lg tracking-tight text-black"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Extracted Source Text
          </h2>

          {engagement.workspace.sourceText.length ? (
            engagement.workspace.sourceText.map((source, index) => (
              <div key={source.id} className={index === 0 ? "border-l-2 border-black/5 bg-black/[0.01] p-6" : "mt-4 border-l-2 border-black/5 bg-black/[0.01] p-6"}>
                <div className="mb-4 text-xs uppercase tracking-wider text-black/40">From: {source.source}</div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-black/70">{source.content}</p>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-black/15 bg-black/[0.015] p-8 text-sm text-black/55">
              Parsed source text will appear here after you upload files. If you are working from the brief only, continue to matched cases once the brief is saved.
            </div>
          )}
        </section>

        <section className="border border-black/10 bg-black/[0.015] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-1 text-xs uppercase tracking-[0.2em] text-black/40">Step 1 Complete</div>
              <p className="text-sm text-black/65">
                {canAdvance
                  ? 'Your brief context is ready. Review the suggested analog cases next before generating outputs.'
                  : 'Add enough context first: a brief with real substance or at least one uploaded source file.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToMatchedCases}
              disabled={!canAdvance}
              className="inline-flex items-center justify-center border border-black bg-black px-5 py-3 text-sm text-white transition-all hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Review Matched Cases
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
