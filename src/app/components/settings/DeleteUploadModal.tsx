import { useState } from 'react';
import { X, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeleteUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadName: string;
}

export function DeleteUploadModal({ isOpen, onClose, uploadName }: DeleteUploadModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText.toLowerCase() === 'delete';

  const handleDelete = () => {
    if (canDelete) {
      // Perform deletion
      onClose();
      setConfirmText('');
    }
  };

  const handleClose = () => {
    setConfirmText('');
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
            onClick={handleClose}
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
                  Delete Upload
                </h2>
                <p className="text-sm text-black/60">
                  This action cannot be undone
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-black/40 transition-colors hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* File Info */}
            <div className="mb-6 border border-black/10 bg-white p-4">
              <div className="mb-2 text-xs text-black/60">File to be deleted:</div>
              <div className="text-sm text-black">{uploadName}</div>
            </div>

            {/* Warning */}
            <div className="mb-6 border-l-2 border-black/20 bg-black/[0.02] p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/60" />
                <div>
                  <div className="mb-2 text-xs text-black/70">
                    Deleting this upload will:
                  </div>
                  <div className="space-y-1 text-xs text-black/70">
                    <div>• Remove the file from your vault immediately</div>
                    <div>• Remove it from case matching and search results</div>
                    <div>• Prevent it from being used in future artifact generation</div>
                    <div>• Not affect artifacts already generated using this file</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deletion Timeline */}
            <div className="mb-6 text-xs text-black/60">
              The file will be removed from the application immediately. Underlying storage cleanup follows a 30-day retention window, after which the file is permanently deleted.
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="mb-2 block text-xs text-black/60">
                Type <strong className="text-black">delete</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete"
                className="w-full border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 border-t border-black/5 pt-6">
              <button
                onClick={handleClose}
                className="flex-1 border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!canDelete}
                className={`flex-1 inline-flex items-center justify-center gap-2 border px-6 py-3 text-sm transition-all ${
                  canDelete
                    ? 'border-black bg-black text-white hover:bg-black/90'
                    : 'border-black/10 bg-black/5 text-black/40 cursor-not-allowed'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                Delete Upload
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
