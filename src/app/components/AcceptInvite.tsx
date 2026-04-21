import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Building2, Clock, Shield, ArrowRight } from 'lucide-react';

export default function AcceptInvite() {
  const invitation = {
    organizationName: 'Northstar Advisory',
    invitedBy: 'Sarah Chen',
    invitedByEmail: 'sarah@northstar-advisory.com',
    role: 'Editor',
    expiresIn: '5 days',
    organizationPlan: 'Team',
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black/5 px-8 py-6">
        <div className="mx-auto max-w-3xl">
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
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Title */}
            <div className="mb-12 text-center">
              <h1
                className="mb-3 text-4xl tracking-tight text-black lg:text-5xl"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.03em' }}
              >
                You've been invited
              </h1>
              <p className="text-sm text-black/60">
                Join your team's workspace to collaborate on consulting engagements
              </p>
            </div>

            {/* Invitation Card */}
            <div className="mb-8 border border-black/10 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              {/* Organization Info */}
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border border-black/10 bg-black/[0.02]">
                  <Building2 className="h-8 w-8 text-black/60" />
                </div>
                <h2
                  className="mb-2 text-2xl tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  {invitation.organizationName}
                </h2>
                <p className="text-sm text-black/60">
                  {invitation.organizationPlan} Plan
                </p>
              </div>

              {/* Invitation Details */}
              <div className="mb-8 grid gap-6 md:grid-cols-2">
                <div className="border border-black/10 bg-white p-4">
                  <div className="mb-1 text-xs uppercase tracking-wider text-black/40">
                    Invited by
                  </div>
                  <div className="text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    {invitation.invitedBy}
                  </div>
                  <div className="text-xs text-black/60">{invitation.invitedByEmail}</div>
                </div>

                <div className="border border-black/10 bg-white p-4">
                  <div className="mb-1 text-xs uppercase tracking-wider text-black/40">
                    Your Role
                  </div>
                  <div className="text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    {invitation.role}
                  </div>
                  <div className="text-xs text-black/60">Can create and edit engagements</div>
                </div>
              </div>

              {/* Expiration Notice */}
              <div className="mb-8 border-l-2 border-black/10 bg-black/[0.01] p-4">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/60" />
                  <div className="text-xs leading-relaxed text-black/70">
                    This invitation expires in {invitation.expiresIn}
                  </div>
                </div>
              </div>

              {/* Privacy Reassurance */}
              <div className="mb-8 border-l-2 border-black/10 bg-black/[0.01] p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/60" />
                  <div className="text-xs leading-relaxed text-black/70">
                    All work within this organization remains private to members. Files, engagements, and vault contents are not shared outside the workspace.
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <Link
                  to="/dashboard"
                  className="flex w-full items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
                >
                  Join Workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button className="w-full border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20">
                  Sign in with another account
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-black/40">
              Wrong invitation? <button className="underline hover:text-black">Contact support</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
