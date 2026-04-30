import { X, RotateCcw, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import type { Engagement } from '../../lib/types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  engagement: Engagement | null;
  onRestore: (versionId: string) => Promise<void>;
}

export function VersionHistoryModal({ isOpen, onClose, engagement, onRestore }: VersionHistoryModalProps) {
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const versions =
    engagement?.workspace.versions.map((version) => ({
      ...version,
      isCurrent: version.id === engagement.workspace.currentVersionId,
    })) || [];

  const currentVersion = versions.find((version) => version.isCurrent) || null;
  const compareVersion = versions.find((version) => version.id === compareVersionId) || null;

  const handleRestore = async (versionId: string) => {
    setRestoringVersionId(versionId);
    await onRestore(versionId);
    setRestoringVersionId(null);
    setCompareVersionId(null);
    setStatusMessage('Version restored successfully');
    window.setTimeout(() => setStatusMessage(null), 2000);
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
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l border-black/10 bg-white shadow-[-20px_0_60px_rgb(0,0,0,0.1)]"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-black/5 bg-white px-8 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2
                    className="mb-1 text-xl tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Version History
                  </h2>
                  <p className="text-sm text-black/60">
                    Restore previous versions or compare changes
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close version history"
                  className="text-black/40 transition-colors hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Version List */}
            <div className="p-8">
              {statusMessage && (
                <div className="mb-4 flex items-center gap-2 border border-black/10 bg-black/[0.02] px-4 py-3 text-sm text-black">
                  <CheckCircle2 className="h-4 w-4" />
                  {statusMessage}
                </div>
              )}
              {compareVersion && currentVersion && (
                <div className="mb-6 border border-black/10 bg-black/[0.02] p-4">
                  <div className="mb-3 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    Comparing Version {compareVersion.number} to current Version {currentVersion.number}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="border border-black/10 bg-white p-4">
                      <div className="mb-1 text-xs uppercase tracking-wider text-black/40">Selected version</div>
                      <div className="text-sm text-black">{compareVersion.description}</div>
                      <div className="mt-2 text-xs text-black/50">{compareVersion.source} • {compareVersion.timestamp}</div>
                    </div>
                    <div className="border border-black/10 bg-white p-4">
                      <div className="mb-1 text-xs uppercase tracking-wider text-black/40">Current version</div>
                      <div className="text-sm text-black">{currentVersion.description}</div>
                      <div className="mt-2 text-xs text-black/50">{currentVersion.source} • {currentVersion.timestamp}</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`border p-4 transition-all ${
                      version.isCurrent
                        ? 'border-black bg-black/[0.02]'
                        : 'border-black/10 bg-white hover:border-black/20'
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center border text-xs ${
                            version.isCurrent
                              ? 'border-black bg-black text-white'
                              : 'border-black/20 bg-white text-black'
                          }`}
                        >
                          {version.number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                              Version {version.number}
                            </span>
                            {version.isCurrent && (
                              <span className="inline-flex items-center bg-black px-2 py-0.5 text-xs text-white">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-black/40">{version.timestamp}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 border-l-2 border-black/10 pl-4">
                      <div className="mb-1 text-xs uppercase tracking-wider text-black/40">
                        {version.source}
                      </div>
                      <div className="text-sm text-black/70">{version.description}</div>
                    </div>

                    {!version.isCurrent && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleRestore(version.id)}
                          disabled={restoringVersionId === version.id}
                          className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-1.5 text-xs text-black transition-all hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <RotateCcw className="h-3 w-3" />
                          {restoringVersionId === version.id ? 'Restoring…' : 'Restore Version'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCompareVersionId(compareVersionId === version.id ? null : version.id)}
                          className={`inline-flex items-center gap-2 border px-3 py-1.5 text-xs transition-all ${
                            compareVersionId === version.id
                              ? 'border-black bg-black text-white'
                              : 'border-black/10 bg-white text-black hover:border-black/20'
                          }`}
                        >
                          <Copy className="h-3 w-3" />
                          {compareVersionId === version.id ? 'Comparing' : 'Compare'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
