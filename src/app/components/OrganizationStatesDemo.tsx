import { Crown, CheckCircle2, Mail, Loader2, AlertCircle } from 'lucide-react';
import { BackButton } from './shared/BackButton';
import { Sidebar } from './shared/Sidebar';

export default function OrganizationStatesDemo() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeItem="settings" />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-black/5 bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <BackButton fallbackTo="/" label="Back to Hub" />
          </div>
          <div className="mt-4">
            <h1
              className="mb-1 text-3xl tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Organization Management States
            </h1>
            <p className="text-sm text-black/60">All states for organization and member management</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Role Badges */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                1. Role Badges
              </h2>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 bg-black px-3 py-1 text-xs text-white">
                  <Crown className="h-3 w-3" />
                  Owner
                </span>
                <span className="inline-flex items-center bg-black/5 px-3 py-1 text-xs text-black/70">
                  Admin
                </span>
                <span className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                  Editor
                </span>
                <span className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                  Viewer
                </span>
                <span className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                  Billing Admin
                </span>
              </div>
            </section>

            {/* Status Badges */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                2. Member Status Badges
              </h2>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 bg-black px-3 py-1 text-xs text-white">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
                <span className="inline-flex items-center gap-1.5 bg-black/5 px-3 py-1 text-xs text-black/70">
                  <Mail className="h-3 w-3" />
                  Invited
                </span>
                <span className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                  Pending
                </span>
              </div>
            </section>

            {/* Plan Selection */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                3. Plan Selection (Selected vs Unselected)
              </h2>
              <div className="grid gap-3 md:w-1/2">
                <button className="w-full border border-black bg-black/[0.02] p-4 text-left">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Team
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-black" />
                  </div>
                  <div className="mb-2 text-xs text-black/60">Unlimited users • Unlimited vault</div>
                  <div className="text-xs text-black/40">$49/user/month</div>
                </button>

                <button className="w-full border border-black/10 bg-white p-4 text-left transition-all hover:border-black/20">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Solo
                    </span>
                  </div>
                  <div className="mb-2 text-xs text-black/60">1 user • Unlimited vault</div>
                  <div className="text-xs text-black/40">$99/month</div>
                </button>
              </div>
            </section>

            {/* Organization Card - Active */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                4. Organization Card - Active State
              </h2>
              <div className="border border-black bg-black/[0.02] p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
                <div className="mb-3 flex items-center gap-3">
                  <h2
                    className="text-xl tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Northstar Advisory
                  </h2>
                  <span className="inline-flex items-center bg-black px-3 py-1 text-xs text-white">
                    Active
                  </span>
                  <Crown className="h-4 w-4 text-black/40" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="mb-1 text-xs text-black/40">Your Role</div>
                    <div className="text-sm text-black">Owner</div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-black/40">Plan</div>
                    <div className="text-sm text-black">Team</div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-black/40">Members</div>
                    <div className="text-sm text-black">12</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-black/40">
                  copilot.ai/northstar-advisory
                </div>
              </div>
            </section>

            {/* Member Table Row */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                5. Member Table Row with Hover
              </h2>
              <div className="border border-black/10 bg-white">
                <div className="grid grid-cols-12 gap-4 border-b border-black/10 bg-black/[0.02] px-6 py-3">
                  <div className="col-span-4 text-xs uppercase tracking-wider text-black/60">Name</div>
                  <div className="col-span-3 text-xs uppercase tracking-wider text-black/60">Email</div>
                  <div className="col-span-2 text-xs uppercase tracking-wider text-black/60">Role</div>
                  <div className="col-span-2 text-xs uppercase tracking-wider text-black/60">Status</div>
                  <div className="col-span-1 text-xs uppercase tracking-wider text-black/60"></div>
                </div>

                <div className="grid grid-cols-12 gap-4 border-b border-black/5 px-6 py-4 transition-all hover:bg-black/[0.01]">
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <Crown className="h-4 w-4 text-black/40" />
                      <div>
                        <div className="text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                          Sarah Chen
                        </div>
                        <div className="text-xs text-black/40">Joined 6 months ago</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center">
                    <div className="text-sm text-black/70">sarah@northstar-advisory.com</div>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <span className="inline-flex items-center gap-2 bg-black px-3 py-1 text-xs text-white">
                      <Crown className="h-3 w-3" />
                      Owner
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <span className="inline-flex items-center gap-1.5 bg-black px-3 py-1 text-xs text-white">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  </div>

                  <div className="col-span-1"></div>
                </div>
              </div>
            </section>

            {/* Invitation Sending States */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                6. Invitation Sending States
              </h2>
              <div className="space-y-4">
                {/* Sending */}
                <div className="border border-black/10 bg-white p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                    <span className="text-sm text-black">Sending invitation...</span>
                  </div>
                </div>

                {/* Success */}
                <div className="border border-black/10 bg-white p-4">
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-black" />
                    <div>
                      <div className="mb-1 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        Invitation Sent
                      </div>
                      <div className="text-xs text-black/60">colleague@company.com has been invited</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sole Owner Prevention */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                7. Sole Owner Removal Prevention
              </h2>
              <div className="border-l-2 border-black/20 bg-black/[0.02] p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-black/60" />
                  <div>
                    <div className="mb-2 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Organization must have at least one owner
                    </div>
                    <div className="text-xs leading-relaxed text-black/70">
                      This member is the sole owner of this workspace. To remove this member, first transfer ownership to another admin or promote a new owner.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Role Change Warning */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                8. Role Downgrade Warning
              </h2>
              <div className="border-l-2 border-black/20 bg-black/[0.02] p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/60" />
                  <div className="text-xs leading-relaxed text-black/70">
                    Removing admin privileges will revoke this member's ability to invite new teammates and manage the vault.
                  </div>
                </div>
              </div>
            </section>

            {/* Privacy Notices */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                9. Privacy Reassurance Components
              </h2>
              <div className="space-y-4">
                <div className="border-l-2 border-black/10 bg-black/[0.01] p-4">
                  <div className="text-xs leading-relaxed text-black/70">
                    Your workspace is completely private. Files, engagements, and vault contents are accessible only to members you explicitly invite. Data is not used to train public models.
                  </div>
                </div>

                <div className="border-l-2 border-black/10 bg-black/[0.01] p-4">
                  <div className="text-xs leading-relaxed text-black/70">
                    All work within this organization remains private to members. Files, engagements, and vault contents are not shared outside the workspace.
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
