import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useAppData } from '../../lib/AppProvider';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
}

export function ChangeRoleModal({ isOpen, onClose, member }: ChangeRoleModalProps) {
  const { updateMemberRole } = useAppData();
  const [newRole, setNewRole] = useState(member.role);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    void updateMemberRole(member.id, newRole as never).then(() => {
      setIsUpdating(false);
      onClose();
    });
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
                  Change Role
                </h2>
                <p className="text-sm text-black/60">
                  Update permissions for {member.name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-black/40 transition-colors hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Member Info */}
              <div className="border border-black/10 bg-white p-4">
                <div className="mb-2 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                  {member.name}
                </div>
                <div className="text-xs text-black/60">{member.email}</div>
                <div className="mt-2 text-xs text-black/40">
                  Current role: <span className="capitalize">{member.role}</span>
                </div>
              </div>

              {/* New Role */}
              <div>
                <label htmlFor="newRole" className="mb-2 block text-sm text-black">
                  New Role
                </label>
                <select
                  id="newRole"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  disabled={isUpdating}
                  className="w-full appearance-none border border-black/10 bg-white py-3 px-4 text-sm text-black transition-colors focus:border-black focus:outline-none disabled:cursor-not-allowed disabled:bg-black/[0.02]"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                  <option value="billing">Billing Admin</option>
                </select>
                <p className="mt-1.5 text-xs text-black/40">
                  {newRole === 'admin' && 'Can invite members and manage vault'}
                  {newRole === 'editor' && 'Can create and edit engagements'}
                  {newRole === 'viewer' && 'Read-only access'}
                  {newRole === 'billing' && 'Can manage billing only'}
                </p>
              </div>

              {/* Warning if downgrading */}
              {member.role === 'admin' && newRole !== 'admin' && (
                <div className="border-l-2 border-black/20 bg-black/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/60" />
                    <div className="text-xs leading-relaxed text-black/70">
                      Removing admin privileges will revoke this member's ability to invite new teammates and manage the vault.
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 border-t border-black/5 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUpdating}
                  className="flex-1 border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || newRole === member.role}
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Update Role
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
