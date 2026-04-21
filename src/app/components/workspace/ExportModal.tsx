import { X, FileDown, CheckCircle2, Loader2, AlertCircle, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import type { Engagement } from '../../lib/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagement: Engagement | null;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export function ExportModal({ isOpen, onClose, engagement }: ExportModalProps) {
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportFormat, setExportFormat] = useState<'docx' | 'pdf' | null>(null);

  const exportBody = engagement
    ? [
        engagement.title,
        `Client: ${engagement.client}`,
        `Problem Type: ${engagement.problemType}`,
        '',
        'Brief',
        engagement.brief,
        '',
        'Objective',
        engagement.objective,
        '',
        `Last saved: ${engagement.workspace.lastSaved}`,
      ].join('\n')
    : '';

  const handleExport = (format: 'docx' | 'pdf') => {
    setExportFormat(format);
    setExportStatus('exporting');

    setTimeout(() => {
      if (engagement) {
        const blob = new Blob([exportBody], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${engagement.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.${format}`;
        anchor.click();
        URL.revokeObjectURL(url);
      }
      setExportStatus('success');
    }, 400);
  };

  const handleCopyToClipboard = async () => {
    if (!exportBody) return;
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
                  onClick={() => handleExport('docx')}
                  className="flex w-full items-center justify-between border border-black/10 bg-white p-4 text-left transition-all hover:border-black/20 hover:bg-black/[0.01]"
                >
                  <div>
                    <div className="mb-1 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Export as DOCX
                    </div>
                    <div className="text-xs text-black/60">
                      Microsoft Word format, fully editable
                    </div>
                  </div>
                  <FileDown className="h-5 w-5 text-black/40" />
                </button>

                <button
                  onClick={() => handleExport('pdf')}
                  className="flex w-full items-center justify-between border border-black/10 bg-white p-4 text-left transition-all hover:border-black/20 hover:bg-black/[0.01]"
                >
                  <div>
                    <div className="mb-1 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Export as PDF
                    </div>
                    <div className="text-xs text-black/60">
                      Portable document format, read-only
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
                      Your {exportFormat?.toUpperCase()} file has been downloaded
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
