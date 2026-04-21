import { useState } from 'react';
import { X, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
}

export function DeleteWorkspaceModal({ isOpen, onClose, workspaceName }: DeleteWorkspaceModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === workspaceName;

  const handleDelete = () => {
    if (canDelete) {
      // Perform workspace deletion
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
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 border border-black/20 bg-white p-8 shadow-[0_20px_60px_rgb(0,0,0,0.1)]"
          >
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2
                  className="mb-1 text-xl tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Delete Entire Workspace
                </h2>
                <p className="text-sm text-black/60">
                  This action is permanent and cannot be undone
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-black/40 transition-colors hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Workspace Info */}
            <div className="mb-6 border border-black/20 bg-black/[0.02] p-4">
              <div className="mb-2 text-xs text-black/60">Workspace to be deleted:</div>
              <div
                className="text-lg text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                {workspaceName}
              </div>
            </div>

            {/* Critical Warning */}
            <div className="mb-6 border-l-2 border-black/30 bg-black/[0.03] p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-black/70" />
                <div>
                  <div
                    className="mb-3 text-sm text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Critical Warning
                  </div>
                  <div className="mb-3 text-xs leading-relaxed text-black/70">
                    Deleting this workspace will permanently destroy all data, immediately revoke all team member access, and cancel your subscription. This includes:
                  </div>
                  <div className="space-y-1.5 text-xs text-black/70">
                    <div>• All uploaded files and documents (permanently deleted)</div>
                    <div>• All generated artifacts and outputs (all versions destroyed)</div>
                    <div>• All engagement data, briefs, and history (unrecoverable)</div>
                    <div>• Team member access and pending invitations (revoked immediately)</div>
                    <div>• Usage history and activity logs (permanently deleted)</div>
                    <div>• Vault contents and organizational knowledge base (destroyed)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="mb-6 space-y-4">
              <div>
                <div
                  className="mb-2 text-sm text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  What Happens Next
                </div>
                <div className="space-y-2 text-xs text-black/70">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 bg-black/40" />
                    <div>
                      <strong className="text-black">Immediate removal:</strong> The workspace and all data becomes inaccessible to all team members within seconds. You will be logged out and redirected.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 bg-black/40" />
                    <div>
                      <strong className="text-black">Storage cleanup:</strong> Underlying storage follows a 30-day retention window for catastrophic recovery purposes only. After 30 days, all data is permanently deleted from all systems and backups.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 bg-black/40" />
                    <div>
                      <strong className="text-black">Billing:</strong> Your subscription will be cancelled immediately. You will not be charged for the next billing cycle. No refunds are issued for partial billing periods.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Reminder */}
            <div className="mb-6 border border-black/10 bg-white p-4">
              <div className="mb-2 text-xs text-black/60">Before you proceed:</div>
              <div className="text-xs leading-relaxed text-black/70">
                Make sure you have exported any artifacts or documents you want to keep. Once deletion begins, there is no way to retrieve your data through the application interface.
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="mb-2 block text-xs text-black/70">
                Type the exact workspace name <strong className="text-black">{workspaceName}</strong> to confirm permanent deletion
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={workspaceName}
                className="w-full border border-black/20 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 border-t border-black/10 pt-6">
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
                Delete Workspace Permanently
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
