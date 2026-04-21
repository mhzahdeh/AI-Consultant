import { Shield, Database, Trash2, Lock } from 'lucide-react';

export function PrivacySettings() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2
          className="mb-2 text-xl tracking-tight text-black"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Privacy
        </h2>
        <p className="text-sm text-black/60">
          How your data is used, stored, and protected
        </p>
      </div>

      {/* Trust Stance */}
      <div className="border border-black/10 bg-white p-8">
        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-6 w-6 text-black/60" />
          <h3
            className="text-lg tracking-tight text-black"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Our Trust Stance
          </h3>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-black/70">
          <p>
            AI Consultant Copilot is built for consultants and advisory firms handling sensitive client materials. Your trust is the product foundation.
          </p>

          <div className="border-l-2 border-black/10 bg-black/[0.01] p-4">
            <div className="space-y-3 text-xs">
              <div>
                <strong className="text-black">Files and outputs are not used for model training.</strong>
                <br />
                Documents you upload and artifacts we generate stay within your organization boundary. They are never used to train shared public models or improve the service for other customers.
              </div>
              <div>
                <strong className="text-black">Data stays within your workspace.</strong>
                <br />
                Team members can only access engagements, uploads, and vault items within your organization. Data is scoped to your workspace and not visible to other customers.
              </div>
              <div>
                <strong className="text-black">You control deletion.</strong>
                <br />
                You can delete individual uploads, artifacts, or your entire workspace at any time. Deletion is immediate from the application. Underlying storage cleanup follows standard retention windows.
              </div>
            </div>
          </div>

          <p className="text-xs">
            We encourage anonymizing uploads and scrubbing client names before uploading sensitive materials. AI Consultant Copilot works just as effectively with anonymized case data.
          </p>
        </div>
      </div>

      {/* What Is Stored */}
      <div className="border border-black/10 bg-white p-8">
        <div className="mb-6 flex items-center gap-3">
          <Database className="h-6 w-6 text-black/60" />
          <h3
            className="text-lg tracking-tight text-black"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            What Is Stored and Why
          </h3>
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-2 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Engagement Data
            </div>
            <div className="text-xs leading-relaxed text-black/70">
              Project names, brief responses, generated proposals, issue trees, workplans, and engagement metadata. This data powers your workspace timeline, vault search, and institutional memory features.
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Uploaded Files
            </div>
            <div className="text-xs leading-relaxed text-black/70">
              PDFs, documents, case studies, and frameworks you upload for matching and context retrieval. Files are stored encrypted and accessed only during artifact generation within your workspace.
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Generated Artifacts
            </div>
            <div className="text-xs leading-relaxed text-black/70">
              Proposals, issue trees, workplans, and other outputs we generate. Stored to enable version history, export, and reuse across your team. You can delete artifacts individually at any time.
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Usage Metadata
            </div>
            <div className="text-xs leading-relaxed text-black/70">
              Generation counts, upload timestamps, export events, and activity logs. Used for billing, usage tracking, and operational transparency. Does not include file contents or artifact text.
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Account Information
            </div>
            <div className="text-xs leading-relaxed text-black/70">
              Email addresses, organization name, team member roles, and billing details. Required for authentication, access control, and subscription management.
            </div>
          </div>
        </div>
      </div>

      {/* Storage & Deletion Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-black/10 bg-black/[0.02] p-6">
          <div className="mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5 text-black/60" />
            <div
              className="text-sm"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Storage
            </div>
          </div>
          <div className="text-xs leading-relaxed text-black/70">
            All files and artifacts are stored encrypted at rest. Access is scoped to your organization and authenticated team members with appropriate role permissions.
          </div>
        </div>

        <div className="border border-black/10 bg-black/[0.02] p-6">
          <div className="mb-3 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-black/60" />
            <div
              className="text-sm"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Deletion
            </div>
          </div>
          <div className="text-xs leading-relaxed text-black/70">
            Deleted items are removed immediately from the application. Underlying storage cleanup follows a 30-day retention window for recovery purposes, then permanent deletion.
          </div>
        </div>
      </div>

      {/* Contact for Privacy Questions */}
      <div className="border-l-2 border-black/10 bg-white p-4">
        <div className="text-xs leading-relaxed text-black/70">
          Questions about privacy, data handling, or compliance?{' '}
          <a
            href="mailto:privacy@aicopilot.com"
            className="text-black underline decoration-black/20 transition-colors hover:decoration-black"
          >
            Contact our privacy team
          </a>
          .
        </div>
      </div>
    </div>
  );
}
