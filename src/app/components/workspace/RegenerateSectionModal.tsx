import { X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface RegenerateSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  onRegenerate: (instructions: string) => void;
}

export function RegenerateSectionModal({ isOpen, onClose, sectionName, onRegenerate }: RegenerateSectionModalProps) {
  const [instructions, setInstructions] = useState('');

  const handleSubmit = () => {
    onRegenerate(instructions);
    onClose();
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
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgb(0,0,0,0.1)]"
          >
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2
                  className="mb-1 text-xl tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Regenerate Section
                </h2>
                <p className="text-sm text-black/60">
                  Regenerating: <span className="text-black">{sectionName}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-black/40 transition-colors hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Instructions Input */}
            <div className="mb-6">
              <label className="mb-2 block text-sm text-black">
                Targeted Instructions (Optional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Example: Focus more on regulatory requirements and include specific licensing timeline..."
                rows={6}
                className="w-full resize-none border border-black/10 bg-white py-3 px-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none"
              />
              <p className="mt-2 text-xs text-black/40">
                Provide specific guidance to refine the regenerated content. Leave blank to regenerate based on original brief and matched cases.
              </p>
            </div>

            {/* Warning */}
            <div className="mb-6 border-l-2 border-black/20 bg-black/[0.02] p-4">
              <div className="text-xs text-black/70">
                • Previous version will be preserved in version history
                <br />
                • Other sections will remain unchanged
                <br />
                • Generation uses the same matched cases as original
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate Section
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
