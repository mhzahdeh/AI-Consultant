import { X, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';

interface LimitHitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: string;
  used: number;
  limit: number;
  resetDate: string | null;
  userRole?: 'owner' | 'admin' | 'editor' | 'viewer';
}

export function LimitHitModal({
  isOpen,
  onClose,
  limitType,
  used,
  limit,
  resetDate,
  userRole = 'editor',
}: LimitHitModalProps) {
  const canUpgrade = userRole === 'owner';

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
                  Limit Reached
                </h2>
                <p className="text-sm text-black/60">
                  Your monthly {limitType.toLowerCase()} limit has been reached
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-black/40 transition-colors hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Limit Details */}
            <div className="mb-6 space-y-4">
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className="text-sm tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    {limitType}
                  </div>
                  <span className="inline-flex items-center bg-black px-3 py-1 text-xs text-white">
                    Limit reached
                  </span>
                </div>

                <div className="mb-3 text-xs text-black/60">
                  {used.toLocaleString()} of {limit.toLocaleString()}
                </div>

                {/* Progress Bar */}
                <div className="mb-4 h-1.5 w-full bg-black/5">
                  <div className="h-full bg-black" style={{ width: '100%' }} />
                </div>

                {/* Reset Info */}
                {resetDate && (
                  <div className="flex items-center gap-1.5 text-xs text-black/40">
                    <Clock className="h-3 w-3" />
                    Resets {resetDate}
                  </div>
                )}
              </div>

              {/* Warning Message */}
              <div className="border-l-2 border-black/20 bg-black/[0.02] p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/60" />
                  <div className="text-xs leading-relaxed text-black/70">
                    {resetDate ? (
                      <>
                        You have reached your monthly limit for {limitType.toLowerCase()}. Your limit will reset on {resetDate}.
                      </>
                    ) : (
                      <>
                        You have reached your limit for {limitType.toLowerCase()}.
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Coming soon notice for owners */}
              {canUpgrade && (
                <div className="border border-black/10 bg-black/[0.02] p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-black/60" />
                    <div
                      className="text-sm"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      Higher Limits Coming Soon
                    </div>
                  </div>

                  <div className="text-xs text-black/70">
                    Paid plans with expanded limits are in progress. Your limit will reset at the start of the next billing period.
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 border-t border-black/5 pt-6">
              <button
                onClick={onClose}
                className="flex-1 border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20"
              >
                Close
              </button>
              {canUpgrade && (
                <Link
                  to="/billing"
                  className="flex-1 inline-flex items-center justify-center border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
                >
                  View Billing
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
