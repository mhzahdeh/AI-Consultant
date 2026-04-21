import { X, Check, TrendingUp, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';

interface UpgradeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
}

export function UpgradeSuccessModal({ isOpen, onClose, planName }: UpgradeSuccessModalProps) {
  const unlockedFeatures: Record<string, string[]> = {
    Solo: [
      'Unlimited active engagements',
      '500 uploads per month',
      '2,000 generations per month',
      '25 GB storage',
    ],
    Team: [
      'Up to 5 team seats',
      'Shared vault access',
      '1,000 uploads per month',
      '5,000 generations per month',
      'Role-based permissions',
    ],
    Enterprise: [
      'Unlimited team seats',
      'Multi-workspace vaults',
      '5,000 uploads per month',
      '25,000 generations per month',
      'Advanced admin controls',
    ],
  };

  const features = unlockedFeatures[planName] || unlockedFeatures.Team;

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
                  Upgrade Complete
                </h2>
                <p className="text-sm text-black/60">
                  Your {planName} plan is now active
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-black/40 transition-colors hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success Indicator */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center border-2 border-black bg-white">
                <Check className="h-8 w-8 text-black" />
              </div>
            </div>

            {/* Unlocked Features */}
            <div className="mb-6 space-y-4">
              <div className="border border-black/10 bg-black/[0.02] p-6">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-black/60" />
                  <div
                    className="text-sm"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Now Available
                  </div>
                </div>

                <div className="space-y-2.5">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/40" />
                      <div className="text-xs text-black/70">{feature}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="border-l-2 border-black/10 bg-white p-4">
                <div className="text-xs leading-relaxed text-black/70">
                  {planName === 'Solo' &&
                    'Your generation limits have been increased. Create unlimited engagements and build your consulting knowledge base.'}
                  {planName === 'Team' &&
                    'Invite team members from the Members page. Your shared vault is ready for collaborative work.'}
                  {planName === 'Enterprise' &&
                    'Your enterprise features are active. Contact support for onboarding assistance and custom configuration.'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 border-t border-black/5 pt-6">
              <Link
                to="/usage"
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20"
              >
                View Usage
              </Link>
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
