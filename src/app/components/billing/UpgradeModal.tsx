import { X, Check, CreditCard, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  onConfirm: () => void;
}

export function UpgradeModal({ isOpen, onClose, planName, onConfirm }: UpgradeModalProps) {
  const planDetails: Record<string, { price: number | null; features: string[] }> = {
    Solo: {
      price: 49,
      features: [
        'Unlimited active engagements',
        '500 uploads per month',
        '2,000 generations per month',
        '200 exports per month',
        '25 GB storage',
      ],
    },
    Team: {
      price: 149,
      features: [
        'Up to 5 seats',
        'Unlimited active engagements',
        '1,000 uploads per month',
        '5,000 generations per month',
        'Shared vault access',
        'Role-based permissions',
      ],
    },
    Enterprise: {
      price: null,
      features: [
        'Unlimited seats',
        '5,000 uploads per month',
        '25,000 generations per month',
        'Multi-workspace vaults',
        'Advanced admin controls',
        'Dedicated support',
      ],
    },
  };

  const plan = planDetails[planName] || planDetails.Team;
  const isEnterprise = planName === 'Enterprise';

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
                  {isEnterprise ? 'Contact Sales' : `Upgrade to ${planName}`}
                </h2>
                <p className="text-sm text-black/60">
                  {isEnterprise
                    ? 'Get custom pricing and support for your organization'
                    : 'Confirm your plan upgrade'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-black/40 transition-colors hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Plan Summary */}
            <div className="mb-6 space-y-4">
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <div
                    className="text-lg tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    {planName} Plan
                  </div>
                  {plan.price !== null && (
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-2xl tracking-tight text-black"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
                      >
                        ${plan.price}
                      </span>
                      <span className="text-sm text-black/60">/month</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/40" />
                      <div className="text-xs text-black/70">{feature}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Value Proposition */}
              {!isEnterprise && (
                <div className="border-l-2 border-black/10 bg-black/[0.02] p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/60" />
                    <div className="text-xs leading-relaxed text-black/70">
                      {planName === 'Solo'
                        ? 'Unlock unlimited engagements and 4x generation capacity. Your workspace becomes a permanent consulting knowledge base.'
                        : 'Team plan adds collaborative workspace, shared vault, and role-based permissions. Your entire firm operates from one institutional memory.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Enterprise Contact Info */}
              {isEnterprise && (
                <div className="border border-black/10 bg-black/[0.02] p-5">
                  <div className="mb-3 text-xs text-black/60">
                    Enterprise includes custom seat counts, advanced security, dedicated support, and volume discounts.
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="text-black/60">Email:</span>{' '}
                      <a
                        href="mailto:enterprise@aicopilot.com"
                        className="text-black underline decoration-black/20 hover:decoration-black"
                      >
                        enterprise@aicopilot.com
                      </a>
                    </div>
                    <div className="text-xs">
                      <span className="text-black/60">Schedule:</span>{' '}
                      <a
                        href="mailto:enterprise@aicopilot.com?subject=Enterprise%20Demo%20Request"
                        className="text-black underline decoration-black/20 hover:decoration-black"
                      >
                        Book a demo
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {!isEnterprise && (
                <div className="border border-black/10 bg-white p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-black/60" />
                    <div className="text-xs text-black/60">Payment Method</div>
                  </div>
                  <div className="mb-3 text-sm text-black">•••• •••• •••• 4242</div>
                  <a
                    href="mailto:support@aicopilot.com?subject=Update%20Payment%20Method"
                    className="text-xs text-black underline decoration-black/20 transition-colors hover:decoration-black"
                  >
                    Update payment method
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 border-t border-black/5 pt-6">
              <button
                onClick={onClose}
                className="flex-1 border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20"
              >
                Cancel
              </button>
              {!isEnterprise ? (
                <button
                  onClick={onConfirm}
                  className="flex-1 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
                >
                  Confirm Upgrade
                </button>
              ) : (
                <a
                  href="mailto:enterprise@aicopilot.com"
                  className="flex-1 inline-flex items-center justify-center border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
                >
                  Contact Sales
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
