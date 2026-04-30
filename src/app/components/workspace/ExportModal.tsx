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

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderTraceMarkdown(title: string, traces: { label: string; detail: string }[]) {
  if (!traces.length) return '';
  return [
    `Source Trace: ${title}`,
    ...traces.map((trace) => `- ${trace.label}: ${trace.detail}`),
    '',
  ].join('\n');
}

export function ExportModal({ isOpen, onClose, engagement }: ExportModalProps) {
  const { markExport } = useAppData();
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportFormat, setExportFormat] = useState<'html' | 'md' | null>(null);

  const proposalProvenance = engagement?.workspace.proposalStarter.content.provenance || {};
  const issueTreeProvenance = engagement?.workspace.issueTree.content.provenance;
  const workplanProvenance = engagement?.workspace.workplan.content.provenance || {};

  const exportBody = engagement
    ? [
        `# ${engagement.title}`,
        `Client: ${engagement.client}`,
        `Problem Type: ${engagement.problemType}`,
        `Status: ${engagement.status}`,
        '',
        '## Executive Brief',
        engagement.brief,
        '',
        '## Proposal Starter',
        ...engagement.workspace.proposalStarter.content.sections.flatMap((section) => [
          `### ${section.label}`,
          section.body,
          '',
          renderTraceMarkdown(section.label, proposalProvenance[section.key] || []),
        ]),
        '## Issue Tree',
        engagement.workspace.issueTree.content.rootQuestion,
        '',
        renderTraceMarkdown('Root Question', issueTreeProvenance?.rootQuestion || []),
        ...engagement.workspace.issueTree.content.branches.flatMap((branch) => [
          `### ${branch.title}`,
          `Hypotheses: ${branch.hypotheses.join('; ')}`,
          `Required Data: ${branch.requiredData.join('; ')}`,
          '',
          renderTraceMarkdown(branch.title, issueTreeProvenance?.branches?.[branch.title] || []),
        ]),
        '## Workplan',
        ...engagement.workspace.workplan.content.phases.flatMap((phase) => [
          `### ${phase.name}`,
          phase.weeks,
          ...phase.deliverables.map((item) => `- ${item}`),
          '',
          renderTraceMarkdown(phase.name, workplanProvenance[phase.name] || []),
        ]),
        '## Selected Analog Cases',
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
    <title>${escapeHtml(engagement.title)}</title>
    <style>
      body { font-family: "Helvetica Neue", Arial, sans-serif; margin: 40px auto; max-width: 920px; color: #111; line-height: 1.65; background: #fafafa; }
      h1, h2, h3 { font-family: Georgia, serif; font-weight: 500; }
      h1 { margin-bottom: 0.35rem; font-size: 34px; }
      h2 { margin: 0 0 14px; font-size: 22px; }
      h3 { margin: 0 0 10px; font-size: 17px; }
      .shell { background: #fff; border: 1px solid #ddd; padding: 36px 40px; }
      .meta { color: #555; margin-bottom: 2rem; font-size: 14px; }
      section { margin: 2.25rem 0; }
      ul { padding-left: 1.25rem; margin: 0.6rem 0 0; }
      .card { border: 1px solid #ddd; padding: 18px; margin: 14px 0; background: #fff; }
      .trace { margin-top: 14px; padding-left: 14px; border-left: 2px solid #111; background: #f7f7f7; padding-top: 12px; padding-bottom: 12px; }
      .trace-title { text-transform: uppercase; letter-spacing: 0.18em; font-size: 10px; color: #666; margin-bottom: 8px; }
      .trace-item { margin: 8px 0; }
      .trace-item strong { display: block; font-size: 13px; color: #111; }
      .eyebrow { text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px; color: #666; margin-bottom: 8px; }
    </style>
  </head>
  <body>
    <div class="shell">
      <h1>${escapeHtml(engagement.title)}</h1>
      <div class="meta">Client: ${escapeHtml(engagement.client)} | Problem Type: ${escapeHtml(engagement.problemType)} | Status: ${escapeHtml(engagement.status)} | Last saved: ${escapeHtml(engagement.workspace.lastSaved)}</div>
      <section><div class="eyebrow">Working Draft</div><h2>Executive Brief</h2><p>${escapeHtml(engagement.brief).replace(/\n/g, '<br />')}</p></section>
      <section><h2>Proposal Starter</h2>${engagement.workspace.proposalStarter.content.sections.map((section) => `<div class="card"><h3>${escapeHtml(section.label)}</h3><p>${escapeHtml(section.body).replace(/\n/g, '<br />')}</p>${(proposalProvenance[section.key] || []).length ? `<div class="trace"><div class="trace-title">Source Trace</div>${(proposalProvenance[section.key] || []).map((trace) => `<div class="trace-item"><strong>${escapeHtml(trace.label)}</strong>${escapeHtml(trace.detail)}</div>`).join('')}</div>` : ''}</div>`).join('')}</section>
      <section><h2>Issue Tree</h2><div class="card"><h3>Root Question</h3><p>${escapeHtml(engagement.workspace.issueTree.content.rootQuestion)}</p>${(issueTreeProvenance?.rootQuestion || []).length ? `<div class="trace"><div class="trace-title">Source Trace</div>${(issueTreeProvenance?.rootQuestion || []).map((trace) => `<div class="trace-item"><strong>${escapeHtml(trace.label)}</strong>${escapeHtml(trace.detail)}</div>`).join('')}</div>` : ''}</div>${engagement.workspace.issueTree.content.branches.map((branch) => `<div class="card"><h3>${escapeHtml(branch.title)}</h3><p><strong>Hypotheses:</strong><br />${branch.hypotheses.map((item) => escapeHtml(item)).join('<br />')}</p><p><strong>Required Data:</strong><br />${branch.requiredData.map((item) => escapeHtml(item)).join('<br />')}</p>${(issueTreeProvenance?.branches?.[branch.title] || []).length ? `<div class="trace"><div class="trace-title">Source Trace</div>${(issueTreeProvenance?.branches?.[branch.title] || []).map((trace) => `<div class="trace-item"><strong>${escapeHtml(trace.label)}</strong>${escapeHtml(trace.detail)}</div>`).join('')}</div>` : ''}</div>`).join('')}</section>
      <section><h2>Workplan</h2>${engagement.workspace.workplan.content.phases.map((phase) => `<div class="card"><h3>${escapeHtml(phase.name)}</h3><p>${escapeHtml(phase.weeks)}</p><ul>${phase.deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>${(workplanProvenance[phase.name] || []).length ? `<div class="trace"><div class="trace-title">Source Trace</div>${(workplanProvenance[phase.name] || []).map((trace) => `<div class="trace-item"><strong>${escapeHtml(trace.label)}</strong>${escapeHtml(trace.detail)}</div>`).join('')}</div>` : ''}</div>`).join('')}</section>
      <section><h2>Selected Analog Cases</h2>${engagement.matchedCases.filter((item) => item.included).map((item) => `<div class="card"><h3>${escapeHtml(item.engagementTitle)}</h3><p>${escapeHtml(item.rationale)}</p></div>`).join('')}</section>
    </div>
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
                  Export a working draft with visible source traceability
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close export modal"
                className="text-black/40 transition-colors hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Latest Version Notice */}
            <div className="mb-6 border-l-2 border-black/10 bg-black/[0.01] p-4">
              <div className="mb-1 text-xs uppercase tracking-wider text-black/40">
                Export Version
              </div>
              <div className="text-sm text-black">
                Latest saved version • Saved {engagement?.workspace.lastSaved || 'recently'}
              </div>
            </div>

            <div className="mb-6 grid gap-3 md:grid-cols-3">
              <div className="border border-black/10 bg-black/[0.015] p-4">
                <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-black/40">Proposal Sections</div>
                <div className="text-2xl tracking-tight text-black" style={{ fontFamily: 'var(--font-display)' }}>
                  {engagement?.workspace.proposalStarter.content.sections.length || 0}
                </div>
              </div>
              <div className="border border-black/10 bg-black/[0.015] p-4">
                <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-black/40">Issue Branches</div>
                <div className="text-2xl tracking-tight text-black" style={{ fontFamily: 'var(--font-display)' }}>
                  {engagement?.workspace.issueTree.content.branches.length || 0}
                </div>
              </div>
              <div className="border border-black/10 bg-black/[0.015] p-4">
                <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-black/40">Workplan Phases</div>
                <div className="text-2xl tracking-tight text-black" style={{ fontFamily: 'var(--font-display)' }}>
                  {engagement?.workspace.workplan.content.phases.length || 0}
                </div>
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
