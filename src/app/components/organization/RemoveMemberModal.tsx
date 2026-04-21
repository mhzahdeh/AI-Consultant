import { X, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useAppData } from '../../lib/AppProvider';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface RemoveMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
}

export function RemoveMemberModal({ isOpen, onClose, member }: RemoveMemberModalProps) {
  const { removeMember } = useAppData();
  const [isRemoving, setIsRemoving] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const isSoleOwner = member.role === 'owner';
  const canRemove = !isSoleOwner && confirmText.toLowerCase() === 'remove';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canRemove) return;

    setIsRemoving(true);

    void removeMember(member.id).then(() => {
      setIsRemoving(false);
      onClose();
      setConfirmText('');
    });
  };

  const handleClose = () => {
    if (!isRemoving) {
      onClose();
      setConfirmText('');
    }
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
                  {isSoleOwner ? 'Cannot Remove Owner' : 'Remove Member'}
                </h2>
                <p className="text-sm text-black/60">
                  {isSoleOwner ? 'This action is not allowed' : 'Permanently remove this member from your workspace'}
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isRemoving}
                className="text-black/40 transition-colors hover:text-black disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isSoleOwner ? (
              /* Sole Owner Prevention */
              <div className="space-y-6">
                <div className="border-l-2 border-black/20 bg-black/[0.02] p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-black/60" />
                    <div>
                      <div className="mb-2 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        Organization must have at least one owner
                      </div>
                      <div className="text-xs leading-relaxed text-black/70">
                        {member.name} is the sole owner of this workspace. To remove this member, first transfer ownership to another admin or promote a new owner.
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20"
                >
                  Close
                </button>
              </div>
            ) : (
              /* Remove Confirmation Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Member Info */}
                <div className="border border-black/10 bg-white p-4">
                  <div className="mb-2 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    {member.name}
                  </div>
                  <div className="text-xs text-black/60">{member.email}</div>
                  <div className="mt-2 text-xs text-black/40">
                    Role: <span className="capitalize">{member.role}</span>
                  </div>
                </div>

                {/* Warning */}
                <div className="border-l-2 border-black/20 bg-black/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/60" />
                    <div className="text-xs leading-relaxed text-black/70">
                      <div className="mb-2">This action cannot be undone. {member.name} will:</div>
                      <ul className="space-y-1">
                        <li>• Immediately lose access to this workspace</li>
                        <li>• No longer see engagements or vault contents</li>
                        <li>• Need a new invitation to rejoin</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Confirmation Input */}
                <div>
                  <label htmlFor="confirm" className="mb-2 block text-sm text-black">
                    Type <span className="font-mono">remove</span> to confirm
                  </label>
                  <input
                    id="confirm"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="remove"
                    disabled={isRemoving}
                    className="w-full border border-black/10 bg-white py-3 px-4 font-mono text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none disabled:cursor-not-allowed disabled:bg-black/[0.02]"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 border-t border-black/5 pt-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isRemoving}
                    className="flex-1 border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canRemove || isRemoving}
                    className="flex-1 inline-flex items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRemoving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Remove Member
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
