import { Link } from 'react-router';
import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Crown, Calendar, CreditCard, Users, Check, AlertCircle, TrendingUp } from 'lucide-react';
import { Sidebar } from './shared/Sidebar';
import { UpgradeModal } from './billing/UpgradeModal';
import { UpgradeSuccessModal } from './billing/UpgradeSuccessModal';
import { PaymentIssueState } from './billing/PaymentIssueState';
import { useAppData } from '../lib/AppProvider';

export default function BillingPage() {
  const { bootstrap, updatePlan } = useAppData();
  const [userRole] = useState<'owner' | 'admin' | 'editor' | 'viewer' | 'billing'>((bootstrap?.user.role as 'owner') || 'owner');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const hasPaymentIssue = bootstrap?.billing.hasPaymentIssue || false;
  const currentPlan = bootstrap?.billing.currentPlan;
  const plans =
    bootstrap?.billing.plans.map((plan) => ({
      ...plan,
      cta: plan.name === currentPlan?.name ? 'Current Plan' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Switch Plan',
      isCurrent: plan.name === currentPlan?.name,
      disabled: plan.name === currentPlan?.name,
    })) || [];

  const canManageBilling = userRole === 'owner' || userRole === 'billing';

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    setIsUpgradeModalOpen(true);
  };

  const handleUpgradeConfirm = () => {
    setIsUpgradeModalOpen(false);
    setTimeout(async () => {
      if (selectedPlan) {
        await updatePlan(selectedPlan);
      }
      setIsSuccessModalOpen(true);
    }, 500);
  };

  if (!bootstrap || !currentPlan) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-black/60">Loading billing…</div>;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeItem="billing" />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-black/5 bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <div className="mt-4">
            <h1
              className="mb-1 text-3xl tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Plan & Billing
            </h1>
            <p className="text-sm text-black/60">
              Manage your subscription, usage limits, and billing details
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Payment Issue Banner */}
            {hasPaymentIssue && <PaymentIssueState />}

            {/* Access Restriction for Non-Owners */}
            {!canManageBilling && (
              <div className="border-l-2 border-black/20 bg-black/[0.02] p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-black/60" />
                  <div>
                    <div
                      className="mb-2 text-sm text-black"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      Billing Access Restricted
                    </div>
                    <div className="mb-3 text-xs leading-relaxed text-black/70">
                      Only workspace owners and billing administrators can manage subscriptions and payment methods. Contact your workspace administrator to request billing changes.
                    </div>
                    <Link
                      to="/members"
                      className="inline-flex items-center gap-2 text-xs text-black underline decoration-black/20 transition-colors hover:decoration-black"
                    >
                      View workspace members
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Current Plan Overview */}
            {canManageBilling && (
              <section>
                <h2
                  className="mb-4 text-lg tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Current Plan
                </h2>
                <div className="border border-black/10 bg-white p-8">
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-3">
                        <Crown className="h-6 w-6 text-black/60" />
                        <h3
                          className="text-2xl tracking-tight text-black"
                          style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
                        >
                          {currentPlan.name}
                        </h3>
                      </div>
                      <div className="text-sm text-black/60">
                        ${currentPlan.price}/{currentPlan.interval}
                      </div>
                    </div>
                    <span className="inline-flex items-center border border-black/10 bg-transparent px-4 py-2 text-xs text-black">
                      {currentPlan.status}
                    </span>
                  </div>

                  <div className="mb-6 grid gap-6 md:grid-cols-3">
                    <div className="border-l-2 border-black/10 pl-4">
                      <div className="mb-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-black/40" />
                        <div className="text-xs text-black/60">Renewal Date</div>
                      </div>
                      <div className="text-sm text-black">{currentPlan.renewalDate}</div>
                    </div>

                    <div className="border-l-2 border-black/10 pl-4">
                      <div className="mb-1 flex items-center gap-2">
                        <Users className="h-4 w-4 text-black/40" />
                        <div className="text-xs text-black/60">Seats</div>
                      </div>
                      <div className="text-sm text-black">
                        {currentPlan.seatsUsed} of {currentPlan.seats} used
                      </div>
                    </div>

                    <div className="border-l-2 border-black/10 pl-4">
                      <div className="mb-1 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-black/40" />
                        <div className="text-xs text-black/60">Payment Method</div>
                      </div>
                      <div className="text-sm text-black">{bootstrap.billing.paymentMethod}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-black/5 pt-6">
                    <button
                      onClick={() => handleUpgrade('Enterprise')}
                      className="border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
                    >
                      Upgrade Plan
                    </button>
                    <button className="border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20">
                      Manage Billing
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Plan Comparison */}
            <section>
              <h2
                className="mb-4 text-lg tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Plan Comparison
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan, i) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className={`border bg-white p-6 transition-all ${
                      plan.isCurrent
                        ? 'border-black'
                        : 'border-black/10 hover:border-black/20'
                    }`}
                  >
                    {/* Plan Header */}
                    <div className="mb-6 border-b border-black/5 pb-6">
                      <h3
                        className="mb-2 text-xl tracking-tight text-black"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                      >
                        {plan.name}
                      </h3>
                      <div className="mb-3 text-xs text-black/60">{plan.description}</div>
                      <div className="flex items-baseline gap-1">
                        {plan.price !== null ? (
                          <>
                            <span
                              className="text-3xl tracking-tight text-black"
                              style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
                            >
                              ${plan.price}
                            </span>
                            <span className="text-sm text-black/60">/{plan.interval}</span>
                          </>
                        ) : (
                          <span
                            className="text-xl tracking-tight text-black"
                            style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
                          >
                            Custom pricing
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6 space-y-3">
                      {plan.features.map((feature, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-black/40" />
                          <div className="text-xs">
                            <span className="text-black/60">{feature.label}:</span>{' '}
                            <span className="text-black">{feature.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    {canManageBilling && (
                      <button
                        onClick={() => !plan.disabled && handleUpgrade(plan.name)}
                        disabled={plan.disabled}
                        className={`w-full px-6 py-3 text-sm transition-all ${
                          plan.isCurrent
                            ? 'border border-black/10 bg-transparent text-black/40 cursor-not-allowed'
                            : plan.disabled
                            ? 'border border-black/10 bg-transparent text-black/40 cursor-not-allowed'
                            : 'border border-black bg-black text-white hover:bg-black/90'
                        }`}
                      >
                        {plan.cta}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>

            {/* What You're Paying For */}
            <section>
              <h2
                className="mb-4 text-lg tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                What You're Paying For
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="border border-black/10 bg-black/[0.02] p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-black/60" />
                    <div
                      className="text-sm"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      Speed & Volume
                    </div>
                  </div>
                  <div className="text-xs leading-relaxed text-black/70">
                    Higher limits mean faster iteration cycles, more client engagements, and less waiting for generation capacity to reset.
                  </div>
                </div>

                <div className="border border-black/10 bg-black/[0.02] p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-black/60" />
                    <div
                      className="text-sm"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      Institutional Memory
                    </div>
                  </div>
                  <div className="text-xs leading-relaxed text-black/70">
                    Your case library, frameworks, and engagement history become searchable organizational knowledge that compounds with every project.
                  </div>
                </div>

                <div className="border border-black/10 bg-black/[0.02] p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-black/60" />
                    <div
                      className="text-sm"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      Team Leverage
                    </div>
                  </div>
                  <div className="text-xs leading-relaxed text-black/70">
                    Shared workspaces, role-based permissions, and collaborative artifacts let your team operate with one institutional brain.
                  </div>
                </div>
              </div>
            </section>

            {/* Billing History (minimal) */}
            {canManageBilling && (
              <section>
                <h2
                  className="mb-4 text-lg tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Recent Billing
                </h2>
                <div className="border border-black/10 bg-white">
                  {[
                    { date: 'Apr 1, 2026', amount: 149, status: 'Paid', invoice: 'INV-2026-04' },
                    { date: 'Mar 1, 2026', amount: 149, status: 'Paid', invoice: 'INV-2026-03' },
                    { date: 'Feb 1, 2026', amount: 149, status: 'Paid', invoice: 'INV-2026-02' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-6 py-4 transition-all hover:bg-black/[0.01] ${
                        i !== 2 ? 'border-b border-black/5' : ''
                      }`}
                    >
                      <div>
                        <div className="mb-1 text-sm text-black">{item.date}</div>
                        <div className="text-xs text-black/60">{item.invoice}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-sm text-black">${item.amount}</div>
                        <div className="text-xs text-black/60">{item.status}</div>
                        <button className="text-xs text-black underline decoration-black/20 transition-colors hover:decoration-black">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        planName={selectedPlan || ''}
        onConfirm={handleUpgradeConfirm}
      />

      {/* Success Modal */}
      <UpgradeSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        planName={selectedPlan || ''}
      />
    </div>
  );
}
