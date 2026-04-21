import { X, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useAppData } from '../../lib/AppProvider';
import type { Role } from '../../lib/types';

interface InviteTeammateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type InviteStatus = 'idle' | 'sending' | 'success' | 'error';

export function InviteTeammateModal({ isOpen, onClose }: InviteTeammateModalProps) {
  const { inviteMember } = useAppData();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('editor');
  const [status, setStatus] = useState<InviteStatus>('idle');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    setStatus('sending');
    setError('');

    void inviteMember(email, role).then(() => {
      setStatus('success');
      setTimeout(() => {
        onClose();
        setEmail('');
        setRole('editor');
        setStatus('idle');
      }, 2000);
    });
  };

  const handleClose = () => {
    if (status !== 'sending') {
      onClose();
      setEmail('');
      setRole('editor');
      setStatus('idle');
      setError('');
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
                  Invite Teammate
                </h2>
                <p className="text-sm text-black/60">
                  Send an invitation to join this workspace
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={status === 'sending'}
                className="text-black/40 transition-colors hover:text-black disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {status === 'success' ? (
              /* Success State */
              <div className="flex items-center justify-center gap-3 border border-black/10 bg-white p-8 text-center">
                <CheckCircle2 className="h-6 w-6 text-black" />
                <div>
                  <div className="mb-1 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    Invitation Sent
                  </div>
                  <div className="text-xs text-black/60">
                    {email} has been invited
                  </div>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm text-black">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="colleague@company.com"
                      disabled={status === 'sending'}
                      className={`w-full border ${error ? 'border-black' : 'border-black/10'} bg-white py-3 pl-10 pr-4 text-sm text-black placeholder-black/40 transition-colors focus:border-black focus:outline-none disabled:cursor-not-allowed disabled:bg-black/[0.02]`}
                    />
                  </div>
                  {error && (
                    <p className="mt-1.5 text-xs text-black/60">{error}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="mb-2 block text-sm text-black">
                    Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={status === 'sending'}
                    className="w-full appearance-none border border-black/10 bg-white py-3 px-4 text-sm text-black transition-colors focus:border-black focus:outline-none disabled:cursor-not-allowed disabled:bg-black/[0.02]"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                    <option value="billing">Billing Admin</option>
                  </select>
                  <p className="mt-1.5 text-xs text-black/40">
                    {role === 'admin' && 'Can invite members and manage vault'}
                    {role === 'editor' && 'Can create and edit engagements'}
                    {role === 'viewer' && 'Read-only access'}
                    {role === 'billing' && 'Can manage billing only'}
                  </p>
                </div>

                {/* Privacy Notice */}
                <div className="border-l-2 border-black/10 bg-black/[0.01] p-4">
                  <div className="text-xs leading-relaxed text-black/70">
                    Invitations expire after 7 days. The recipient will receive an email with a secure link to join this workspace.
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={status === 'sending'}
                    className="flex-1 border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="flex-1 inline-flex items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Send Invitation
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
