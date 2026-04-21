import { Link } from 'react-router';
import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Upload, RefreshCw, FileDown, Database, Clock, TrendingUp, Crown, ArrowRight } from 'lucide-react';
import { Sidebar } from './shared/Sidebar';
import { LimitHitModal } from './usage/LimitHitModal';
import { useAppData } from '../lib/AppProvider';
import { BackButton } from './shared/BackButton';

export default function UsagePage() {
  const { bootstrap } = useAppData();
  const [userRole] = useState<'owner' | 'admin' | 'editor' | 'viewer'>((bootstrap?.user.role as 'owner') || 'owner');
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const currentPlan = bootstrap?.organization.plan || 'Team';
  const billingPeriod = bootstrap?.usage.billingPeriod || '';
  const usageSummary = bootstrap?.usage.summary || [];
  const usageMetrics = bootstrap?.usage.metrics || [];
  const recentActivity = bootstrap?.usage.recentActivity || [];
  const iconMap = { FileText, Upload, RefreshCw, FileDown, Database };

  if (!bootstrap) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-black/60">Loading usage…</div>;
  }

  const planUpgradeFeatures = [
    'Unlimited active engagements',
    'Increased upload limits (5,000/month)',
    'Increased generation limits (25,000/month)',
    'Priority generation speed',
    'Advanced vault organization',
  ];

  const getProgressBarStyle = (metric: typeof usageMetrics[0]) => {
    if (metric.isAtLimit) return 'bg-black';
    if (metric.isNearLimit) return 'bg-black/70';
    return 'bg-black/40';
  };

  const getStatusIndicator = (metric: typeof usageMetrics[0]) => {
    if (metric.isAtLimit) return { text: 'Limit reached', style: 'bg-black text-white' };
    if (metric.isNearLimit) return { text: 'Near limit', style: 'bg-black/5 text-black/70' };
    return { text: 'Active', style: 'border border-black/10 bg-transparent text-black' };
  };

  // Role-based visibility
  const canViewFullUsage = userRole === 'owner' || userRole === 'admin';
  const canViewActivityLog = userRole !== 'viewer';

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeItem="usage" />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-black/5 bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <BackButton fallbackTo="/dashboard" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1
                className="mb-1 text-3xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
              >
                Usage
              </h1>
              <p className="text-sm text-black/60">Current billing period: {billingPeriod}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center bg-black px-4 py-2 text-xs text-white">
                {currentPlan} Plan
              </span>
              {userRole === 'owner' && (
                <Link
                  to="/billing"
                  className="border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20"
                >
                  Manage Plan
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Summary Cards */}
            {canViewFullUsage && (
              <section>
                <h2
                  className="mb-4 text-lg tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Current Period Summary
                </h2>
                <div className="grid gap-4 md:grid-cols-5">
                  {usageSummary.map((item, i) => (
                    (() => {
                      const Icon = iconMap[item.icon as keyof typeof iconMap] || FileText;
                      return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="border border-black/10 bg-white p-6 transition-all hover:border-black/20"
                    >
                      <Icon className="mb-3 h-5 w-5 text-black/40" />
                      <div className="mb-1 text-xs text-black/40">{item.label}</div>
                      <div className="flex items-baseline gap-1">
                        <div
                          className="text-2xl tracking-tight text-black"
                          style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
                        >
                          {item.used}
                          {item.unit && <span className="text-sm text-black/60"> {item.unit}</span>}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-black/60">
                        of {typeof item.limit === 'number' ? `${item.limit}${item.unit ? ` ${item.unit}` : ''}` : item.limit}
                      </div>
                    </motion.div>
                      );
                    })()
                  ))}
                </div>
              </section>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left: Limit Tracking */}
              <div className="lg:col-span-2 space-y-8">
                {/* Limit Tracking Modules */}
                {canViewFullUsage && (
                  <section>
                    <h2
                      className="mb-4 text-lg tracking-tight text-black"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      Limit Tracking
                    </h2>
                    <div className="space-y-4">
                      {usageMetrics.map((metric, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                          className="border border-black/10 bg-white p-6"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <div
                                className="mb-1 text-sm tracking-tight text-black"
                                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                              >
                                {metric.category}
                              </div>
                              <div className="text-xs text-black/60">
                                {metric.used} of {typeof metric.limit === 'number' ? metric.limit : metric.limit}
                                {metric.unit && ` ${metric.unit}`}
                              </div>
                            </div>
                            {metric.limit !== 'Unlimited' && (
                              <span className={`inline-flex items-center px-3 py-1 text-xs ${getStatusIndicator(metric).style}`}>
                                {getStatusIndicator(metric).text}
                              </span>
                            )}
                          </div>

                          {metric.limit !== 'Unlimited' && (
                            <>
                              {/* Progress Bar */}
                              <div className="mb-3 h-1.5 w-full bg-black/5">
                                <div
                                  className={`h-full transition-all ${getProgressBarStyle(metric)}`}
                                  style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                                />
                              </div>

                              {/* Reset Info */}
                              {metric.resetDate && (
                                <div className="flex items-center gap-1.5 text-xs text-black/40">
                                  <Clock className="h-3 w-3" />
                                  Resets {metric.resetDate}
                                </div>
                              )}
                            </>
                          )}

                          {/* Action for near limit */}
                          {metric.isNearLimit && !metric.isAtLimit && userRole === 'owner' && (
                            <div className="mt-4 border-t border-black/5 pt-4">
                              <button className="text-xs text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black">
                                Upgrade to increase limit
                              </button>
                            </div>
                          )}

                          {/* Action for at limit */}
                          {metric.isAtLimit && (
                            <div className="mt-4 border-t border-black/5 pt-4">
                              <button
                                onClick={() => setIsLimitModalOpen(true)}
                                className="text-xs text-black underline decoration-black/20 transition-colors hover:decoration-black"
                              >
                                View upgrade options
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Activity Log */}
                {canViewActivityLog && (
                  <section>
                    <h2
                      className="mb-4 text-lg tracking-tight text-black"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      Recent Activity
                    </h2>
                    <div className="border border-black/10 bg-white">
                      {recentActivity.map((activity, i) => (
                        <div
                          key={activity.id}
                          className={`px-6 py-4 transition-all hover:bg-black/[0.01] ${
                            i !== recentActivity.length - 1 ? 'border-b border-black/5' : ''
                          }`}
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div
                              className="text-sm text-black"
                              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                            >
                              {activity.action}
                            </div>
                            <div className="text-xs text-black/40">{activity.timestamp}</div>
                          </div>
                          <div className="text-xs text-black/60">{activity.engagement}</div>
                          <div className="mt-1 text-xs text-black/40">by {activity.user}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-black/40">
                      Showing last 6 events
                    </div>
                  </section>
                )}
              </div>

              {/* Right: Plan Guidance */}
              {userRole === 'owner' && (
                <div>
                  <div className="sticky top-8 space-y-6">
                    {/* Current Plan */}
                    <div className="border border-black/10 bg-white p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Crown className="h-5 w-5 text-black/60" />
                        <div
                          className="text-sm"
                          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                        >
                          {currentPlan} Plan
                        </div>
                      </div>

                      <div className="mb-4 space-y-2 text-xs text-black/70">
                        <div>• Unlimited active engagements</div>
                        <div>• 1,000 uploads/month</div>
                        <div>• 5,000 generations/month</div>
                        <div>• 500 exports/month</div>
                        <div>• 50 GB storage</div>
                      </div>

                      <Link
                        to="/billing"
                        className="inline-flex w-full items-center justify-center border border-black/10 bg-white px-4 py-2 text-xs text-black transition-all hover:border-black/20"
                      >
                        Manage Plan
                      </Link>
                    </div>

                    {/* Upgrade Guidance */}
                    <div className="border border-black/10 bg-black/[0.02] p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-black/60" />
                        <div
                          className="text-sm"
                          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                        >
                          Enterprise Features
                        </div>
                      </div>

                      <div className="mb-4 space-y-2 text-xs text-black/70">
                        {planUpgradeFeatures.map((feature, i) => (
                          <div key={i}>• {feature}</div>
                        ))}
                      </div>

                      <Link
                        to="/plans"
                        className="inline-flex w-full items-center justify-center gap-2 border border-black bg-black px-4 py-2 text-xs text-white transition-all hover:bg-black/90"
                      >
                        View Plans
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {/* Usage Insights */}
                    <div className="border-l-2 border-black/10 bg-black/[0.01] p-4">
                      <div className="text-xs leading-relaxed text-black/70">
                        Your team is using an average of 167 generations per week. Current pace suggests you'll use ~60% of monthly limit.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Editor/Viewer Limited View */}
            {!canViewFullUsage && (
              <section>
                <div className="border-l-2 border-black/10 bg-black/[0.01] p-6 text-center">
                  <div className="mb-2 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    Limited Usage Visibility
                  </div>
                  <div className="text-xs text-black/60">
                    Full usage details are available to organization owners and admins.
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Limit Hit Modal */}
      <LimitHitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        limitType="Artifact Generations"
        used={5000}
        limit={5000}
        resetDate="May 1, 2026"
      />
    </div>
  );
}
