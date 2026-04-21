import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Plus, Users, ArrowRight, Crown } from 'lucide-react';

export default function OrganizationSelection() {
  const organizations = [
    {
      id: '1',
      name: 'Acme Consulting',
      slug: 'acme-consulting',
      role: 'Owner',
      plan: 'Team',
      memberCount: 12,
      isActive: false,
    },
    {
      id: '2',
      name: 'Northstar Advisory',
      slug: 'northstar-advisory',
      role: 'Admin',
      plan: 'Team',
      memberCount: 8,
      isActive: true,
    },
    {
      id: '3',
      name: 'Personal Workspace',
      slug: 'sarah-chen',
      role: 'Owner',
      plan: 'Solo',
      memberCount: 1,
      isActive: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black/5 px-8 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 border border-black bg-black" />
            <span className="text-sm" style={{ fontFamily: 'var(--font-display)' }}>
              AI Consultant Copilot
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-8 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Title */}
            <div className="mb-12">
              <h1
                className="mb-3 text-4xl tracking-tight text-black lg:text-5xl"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.03em' }}
              >
                Select workspace
              </h1>
              <p className="text-sm text-black/60">
                Choose which organization to access
              </p>
            </div>

            {/* Organization List */}
            <div className="mb-8 space-y-4">
              {organizations.map((org, i) => (
                <motion.button
                  key={org.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`group w-full border p-6 text-left transition-all ${
                    org.isActive
                      ? 'border-black bg-black/[0.02] shadow-[0_2px_12px_rgb(0,0,0,0.04)]'
                      : 'border-black/10 bg-white hover:border-black/20 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <h2
                          className="text-xl tracking-tight text-black"
                          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                        >
                          {org.name}
                        </h2>
                        {org.isActive && (
                          <span className="inline-flex items-center bg-black px-3 py-1 text-xs text-white">
                            Active
                          </span>
                        )}
                        {org.role === 'Owner' && (
                          <Crown className="h-4 w-4 text-black/40" />
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="mb-1 text-xs text-black/40">Your Role</div>
                          <div className="text-sm text-black">{org.role}</div>
                        </div>
                        <div>
                          <div className="mb-1 text-xs text-black/40">Plan</div>
                          <div className="text-sm text-black">{org.plan}</div>
                        </div>
                        <div>
                          <div className="mb-1 text-xs text-black/40">Members</div>
                          <div className="flex items-center gap-1.5 text-sm text-black">
                            <Users className="h-3 w-3" />
                            {org.memberCount}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-black/40">
                        copilot.ai/{org.slug}
                      </div>
                    </div>

                    {!org.isActive && (
                      <ArrowRight className="h-5 w-5 text-black/40 transition-transform group-hover:translate-x-1" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Create New Organization */}
            <Link
              to="/create-organization"
              className="group flex w-full items-center justify-between border border-black/10 bg-white p-6 text-left transition-all hover:border-black/20 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center border border-black/10 bg-black/[0.02]">
                  <Plus className="h-6 w-6 text-black/60" />
                </div>
                <div>
                  <div
                    className="mb-1 text-base tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Create New Organization
                  </div>
                  <div className="text-xs text-black/60">
                    Start a new workspace for your team
                  </div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-black/40 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Sign Out */}
            <div className="mt-8 text-center">
              <button className="text-sm text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black">
                Sign out
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
