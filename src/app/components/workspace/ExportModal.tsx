import { X, FileDown, CheckCircle2, Loader2, AlertCircle, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import type { Engagement } from '../../lib/types';
import { useAppData } from '../../lib/AppProvider';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagement: Engagement | null;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export function ExportModal({ isOpen, onClose, engagement }: ExportModalProps) {
  const { markExport } = useAppData();
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportFormat, setExportFormat] = useState<'html' | 'md' | null>(null);

  const exportBody = engagement
    ? [
        engagement.title,
        `Client: ${engagement.client}`,
        `Problem Type: ${engagement.problemType}`,
        `Status: ${engagement.status}`,
        '',
        '=== EXECUTIVE BRIEF ===',
        engagement.brief,
        '',
        '=== PROPOSAL STARTER ===',
        ...engagement.workspace.proposalStarter.content.sections.flatMap((section) => [section.label, section.body, '']),
        '=== ISSUE TREE ===',
        engagement.workspace.issueTree.content.rootQuestion,
        '',
        ...engagement.workspace.issueTree.content.branches.flatMap((branch) => [branch.title, `Hypotheses: ${branch.hypotheses.join('; ')}`, `Required Data: ${branch.requiredData.join('; ')}`, '']),
        '=== WORKPLAN ===',
        ...engagement.workspace.workplan.content.phases.flatMap((phase) => [phase.name, phase.weeks, ...phase.deliverables, '']),
        '=== SELECTED ANALOG CASES ===',
        ...engagement.matchedCases.filter((item) => item.included).flatMap((item) => [item.engagementTitle, item.rationale, '']),
        '',
        `Last saved: ${engagement.workspace.lastSaved}`,
      ].join('\n')
    : '';

  const exportHtml = engagement
    ? `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${engagement.title}</title>
    <style>
      body { font-family: Georgia, serif; margin: 48px auto; max-width: 860px; color: #111; line-height: 1.6; }
      h1, h2, h3 { font-family: "Helvetica Neue", Arial, sans-serif; }
      h1 { margin-bottom: 0.25rem; }
      .meta { color: #555; margin-bottom: 2rem; }
      section { margin: 2rem 0; }
      ul { padding-left: 1.25rem; }
      .card { border: 1px solid #ddd; padding: 16px; margin: 12px 0; }
    </style>
  </head>
  <body>
    <h1>${engagement.title}</h1>
    <div class="meta">Client: ${engagement.client} | Problem Type: ${engagement.problemType} | Status: ${engagement.status}</div>
    <section><h2>Executive Brief</h2><p>${engagement.brief.replace(/\n/g, '<br />')}</p></section>
    <section><h2>Proposal Starter</h2>${engagement.workspace.proposalStarter.content.sections.map((section) => `<div class="card"><h3>${section.label}</h3><p>${section.body.replace(/\n/g, '<br />')}</p></div>`).join('')}</section>
    <section><h2>Issue Tree</h2><div class="card"><h3>Root Question</h3><p>${engagement.workspace.issueTree.content.rootQuestion}</p></div>${engagement.workspace.issueTree.content.branches.map((branch) => `<div class="card"><h3>${branch.title}</h3><p><strong>Hypotheses:</strong><br />${branch.hypotheses.join('<br />')}</p><p><strong>Required Data:</strong><br />${branch.requiredData.join('<br />')}</p></div>`).join('')}</section>
    <section><h2>Workplan</h2>${engagement.workspace.workplan.content.phases.map((phase) => `<div class="card"><h3>${phase.name}</h3><p>${phase.weeks}</p><ul>${phase.deliverables.map((item) => `<li>${item}</li>`).join('')}</ul></div>`).join('')}</section>
    <section><h2>Selected Analog Cases</h2>${engagement.matchedCases.filter((item) => item.included).map((item) => `<div class="card"><h3>${item.engagementTitle}</h3><p>${item.rationale}</p></div>`).join('')}</section>
  </body>
</html>`
    : '';

  const handleExport = (format: 'html' | 'md') => {
    setExportFormat(format);
    setExportStatus('exporting');

    void (async () => {
      try {
        if (engagement) {
          await markExport(engagement.id);
          const blob = new Blob([format === 'html' ? exportHtml : exportBody], {
            type: format === 'html' ? 'text/html' : 'text/markdown',
          });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `${engagement.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.${format}`;
          anchor.click();
          URL.revokeObjectURL(url);
        }
        setExportStatus('success');
      } catch {
        setExportStatus('error');
      }
    })();
  };

  const handleCopyToClipboard = async () => {
    if (!exportBody) return;
    if (engagement) {
      await markExport(engagement.id);
    }
    await navigator.clipboard.writeText(exportBody);
    setExportFormat(null);
    setExportStatus('success');
  };

  const handleRetry = () => {
    setExportStatus('idle');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgb(0,0,0,0.1)]"
          >
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2
                  className="mb-1 text-xl tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Export Draft
                </h2>
                <p className="text-sm text-black/60">
                  Download or copy your proposal starter
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-black/40 transition-colors hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Latest Version Notice */}
            <div className="mb-6 border-l-2 border-black/10 bg-black/[0.01] p-4">
              <div className="text-xs uppercase tracking-wider text-black/40 mb-1">
                Export Version
              </div>
              <div className="text-sm text-black">
                Latest saved version • Saved {engagement?.workspace.lastSaved || 'recently'}
              </div>
            </div>

            {/* Export Options */}
            {exportStatus === 'idle' && (
              <div className="space-y-4">
                <button
                  onClick={() => handleExport('html')}
                  className="flex w-full items-center justify-between border border-black/10 bg-white p-4 text-left transition-all hover:border-black/20 hover:bg-black/[0.01]"
                >
                  <div>
                    <div className="mb-1 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Export Client HTML
                    </div>
                    <div className="text-xs text-black/60">
                      Styled document for browser review or PDF printing
                    </div>
                  </div>
                  <FileDown className="h-5 w-5 text-black/40" />
                </button>

                <button
                  onClick={() => handleExport('md')}
                  className="flex w-full items-center justify-between border border-black/10 bg-white p-4 text-left transition-all hover:border-black/20 hover:bg-black/[0.01]"
                >
                  <div>
                    <div className="mb-1 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Export Markdown
                    </div>
                    <div className="text-xs text-black/60">
                      Clean working draft for editing in docs or notes tools
                    </div>
                  </div>
                  <FileDown className="h-5 w-5 text-black/40" />
                </button>

                <button
                  onClick={handleCopyToClipboard}
                  className="flex w-full items-center justify-between border border-black/10 bg-white p-4 text-left transition-all hover:border-black/20 hover:bg-black/[0.01]"
                >
                  <div>
                    <div className="mb-1 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Copy to Clipboard
                    </div>
                    <div className="text-xs text-black/60">
                      Plain text format for pasting
                    </div>
                  </div>
                  <Copy className="h-5 w-5 text-black/40" />
                </button>
              </div>
            )}

            {/* Exporting State */}
            {exportStatus === 'exporting' && (
              <div className="flex items-center justify-center gap-3 border border-black/10 bg-white p-8 text-center">
                <Loader2 className="h-5 w-5 animate-spin text-black/40" />
                <div>
                  <div className="mb-1 text-sm text-black">
                    Exporting as {exportFormat?.toUpperCase()}...
                  </div>
                  <div className="text-xs text-black/60">
                    Preparing your document
                  </div>
                </div>
              </div>
            )}

            {/* Success State */}
            {exportStatus === 'success' && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 border border-black/10 bg-white p-8 text-center">
                  <CheckCircle2 className="h-6 w-6 text-black" />
                  <div>
                    <div className="mb-1 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Export Complete
                    </div>
                    <div className="text-xs text-black/60">
                      {exportFormat ? `Your ${exportFormat.toUpperCase()} file has been downloaded` : 'The working draft was copied to your clipboard'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRetry}
                    className="flex-1 border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20"
                  >
                    Export Another Format
                  </button>
                  <button
                    onClick={onClose}
                    className="border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {exportStatus === 'error' && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 border border-black/10 bg-white p-8 text-center">
                  <AlertCircle className="h-6 w-6 text-black/60" />
                  <div>
                    <div className="mb-1 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Export Failed
                    </div>
                    <div className="text-xs text-black/60">
                      There was a problem exporting your document
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRetry}
                    className="flex-1 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
