import { X, RotateCcw, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VersionHistoryModal({ isOpen, onClose }: VersionHistoryModalProps) {
  const versions = [
    {
      id: 'v7',
      number: 7,
      timestamp: '2 hours ago',
      source: 'Manual edit',
      description: 'Updated timeline phase 2 duration',
      isCurrent: true,
    },
    {
      id: 'v6',
      number: 6,
      timestamp: '3 hours ago',
      source: 'Section regeneration',
      description: 'Regenerated "Proposed Workstreams" section',
      isCurrent: false,
    },
    {
      id: 'v5',
      number: 5,
      timestamp: '5 hours ago',
      source: 'Manual edit',
      description: 'Added key questions section',
      isCurrent: false,
    },
    {
      id: 'v4',
      number: 4,
      timestamp: '1 day ago',
      source: 'Section regeneration',
      description: 'Regenerated "Problem Statement" with targeted instructions',
      isCurrent: false,
    },
    {
      id: 'v3',
      number: 3,
      timestamp: '1 day ago',
      source: 'Manual edit',
      description: 'Updated assumptions and risks',
      isCurrent: false,
    },
    {
      id: 'v2',
      number: 2,
      timestamp: '2 days ago',
      source: 'Full regeneration',
      description: 'Regenerated entire document after brief update',
      isCurrent: false,
    },
    {
      id: 'v1',
      number: 1,
      timestamp: '2 days ago',
      source: 'Initial generation',
      description: 'Generated from matched cases',
      isCurrent: false,
    },
  ];

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
                  className="text-black/40 transition-colors hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Version List */}
            <div className="p-8">
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
                        <button className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-1.5 text-xs text-black transition-all hover:border-black/20">
                          <RotateCcw className="h-3 w-3" />
                          Restore Version
                        </button>
                        <button className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-1.5 text-xs text-black transition-all hover:border-black/20">
                          <Copy className="h-3 w-3" />
                          Compare
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
