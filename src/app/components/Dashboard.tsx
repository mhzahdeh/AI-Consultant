import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Plus, ArrowRight, FileText, Clock, FolderOpen } from 'lucide-react';
import { Sidebar } from './shared/Sidebar';
import { useAppData } from '../lib/AppProvider';

export default function Dashboard() {
  const { bootstrap, isLoading } = useAppData();
  const engagements = bootstrap?.dashboard.engagements ?? [];
  const usageStats =
    bootstrap?.usage.summary.slice(0, 4).map((stat) => ({
      label: stat.label,
      value: String(stat.used),
      max: String(stat.limit),
    })) ?? [];
  const hasEngagements = engagements.length > 0;

  if (isLoading || !bootstrap) {
    return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-black/60">Loading dashboard…</div>;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeItem="dashboard" />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-black/5 bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="mb-1 text-3xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
              >
                Dashboard
              </h1>
              <p className="text-sm text-black/60">Private consulting workspace</p>
            </div>
            <Link
              to="/new-engagement"
              className="inline-flex items-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
            >
              <Plus className="h-4 w-4" />
              Create New Engagement
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          <div className="mx-auto max-w-7xl space-y-12">
            {hasEngagements ? (
              <>
                {/* Usage Summary */}
                <section>
                  <h2
                    className="mb-6 text-lg tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Usage Summary
                  </h2>
                  <div className="grid gap-6 md:grid-cols-4">
                    {usageStats.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="border border-black/10 bg-white p-6 transition-all hover:border-black/20"
                      >
                        <div className="mb-1 text-xs text-black/40">{stat.label}</div>
                        <div
                          className="mb-1 text-3xl tracking-tight text-black"
                          style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
                        >
                          {stat.value}
                        </div>
                        <div className="text-xs text-black/60">of {stat.max}</div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Recent Engagements */}
                <section>
                  <div className="mb-6 flex items-center justify-between">
                    <h2
                      className="text-lg tracking-tight text-black"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      Recent Engagements
                    </h2>
                    <Link
                      to="/workspace"
                      className="text-sm text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {engagements.map((engagement, i) => (
                      <motion.div
                        key={engagement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                        className="group border border-black/10 bg-white p-6 transition-all hover:border-black/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-3 flex items-center gap-3">
                              <h3
                                className="text-lg tracking-tight text-black"
                                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                              >
                                {engagement.title}
                              </h3>
                              <span
                                className={`inline-flex items-center px-3 py-1 text-xs ${
                                  engagement.status === 'Completed'
                                    ? 'bg-black text-white'
                                    : engagement.status === 'In Progress'
                                    ? 'bg-black/5 text-black/70'
                                    : 'border border-black/10 bg-transparent text-black'
                                }`}
                              >
                                {engagement.status}
                              </span>
                            </div>

                            <div className="mb-4 grid grid-cols-3 gap-4">
                              <div>
                                <div className="mb-1 text-xs text-black/40">Client</div>
                                <div className="text-sm text-black">{engagement.client}</div>
                              </div>
                              <div>
                                <div className="mb-1 text-xs text-black/40">Problem Type</div>
                                <div className="text-sm text-black">{engagement.problemType}</div>
                              </div>
                              <div>
                                <div className="mb-1 text-xs text-black/40">Last Updated</div>
                                <div className="flex items-center gap-1 text-sm text-black">
                                  <Clock className="h-3 w-3" />
                                  {engagement.lastUpdated}
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="h-1 w-full bg-black/5">
                                <div
                                  className="h-full bg-black transition-all"
                                  style={{ width: `${engagement.progress}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <Link
                                to={`/workspace?id=${engagement.id}`}
                                className="inline-flex items-center gap-2 border border-black bg-black px-5 py-2 text-sm text-white transition-all hover:bg-black/90"
                              >
                                Open Workspace
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                              <div className="flex items-center gap-1.5 text-xs text-black/40">
                                <div className="h-1.5 w-1.5 rounded-full bg-black/40" />
                                Private to your organization
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Suggested Next Step */}
                <section>
                  <div className="border-l-2 border-black bg-black/[0.01] p-6">
                    <div className="flex items-center gap-4">
                      <FileText className="h-6 w-6 flex-shrink-0 text-black/60" />
                      <div className="flex-1">
                        <h3
                          className="mb-1 text-base text-black"
                          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                        >
                          Ready to start a new engagement?
                        </h3>
                        <p className="text-sm text-black/60">
                          Upload a new RFP or brief and generate structured consulting outputs
                        </p>
                      </div>
                      <Link
                        to="/new-engagement"
                        className="border border-black/10 bg-white px-5 py-2 text-sm text-black transition-all hover:border-black/20"
                      >
                        Create Engagement
                      </Link>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex min-h-[500px] items-center justify-center"
              >
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-6 h-16 w-16 border border-black/10 bg-black/[0.02] p-4">
                    <FolderOpen className="h-full w-full text-black/40" />
                  </div>
                  <h2
                    className="mb-3 text-2xl tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
                  >
                    No engagements yet
                  </h2>
                  <p className="mb-8 text-sm leading-relaxed text-black/60">
                    Create your first engagement to turn RFPs and briefs into structured consulting outputs
                  </p>
                  <Link
                    to="/new-engagement"
                    className="inline-flex items-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
                  >
                    <Plus className="h-4 w-4" />
                    Create New Engagement
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
