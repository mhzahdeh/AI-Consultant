import { HelpCircle, Mail, MessageSquare, Shield, Trash2, FileText } from 'lucide-react';

export function SupportSettings() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2
          className="mb-2 text-xl tracking-tight text-black"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Support
        </h2>
        <p className="text-sm text-black/60">
          Get help and contact our team
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-black/10 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-black/60" />
            <h3
              className="text-sm tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Email Support
            </h3>
          </div>
          <p className="mb-4 text-xs text-black/70">
            For general questions, technical issues, and account inquiries
          </p>
          <a
            href="mailto:support@aicopilot.com"
            className="inline-flex items-center border border-black bg-black px-4 py-2 text-xs text-white transition-all hover:bg-black/90"
          >
            support@aicopilot.com
          </a>
        </div>

        <div className="border border-black/10 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-black/60" />
            <h3
              className="text-sm tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              In-App Chat
            </h3>
          </div>
          <p className="mb-4 text-xs text-black/70">
            Real-time support for urgent technical issues
          </p>
          <button className="inline-flex items-center border border-black bg-black px-4 py-2 text-xs text-white transition-all hover:bg-black/90">
            Start Chat
          </button>
        </div>
      </div>

      {/* Response Expectations */}
      <div className="border border-black/10 bg-white p-6">
        <h3
          className="mb-4 text-sm tracking-tight text-black"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Response Expectations
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-4 border-b border-black/5 pb-4">
            <div className="w-32 flex-shrink-0 text-xs text-black/60">General Inquiries</div>
            <div className="text-xs text-black/70">Within 24 hours on business days</div>
          </div>

          <div className="flex items-start gap-4 border-b border-black/5 pb-4">
            <div className="w-32 flex-shrink-0 text-xs text-black/60">Technical Issues</div>
            <div className="text-xs text-black/70">Within 12 hours, prioritized by severity</div>
          </div>

          <div className="flex items-start gap-4 border-b border-black/5 pb-4">
            <div className="w-32 flex-shrink-0 text-xs text-black/60">Billing Questions</div>
            <div className="text-xs text-black/70">Within 8 business hours</div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-32 flex-shrink-0 text-xs text-black/60">Critical Outages</div>
            <div className="text-xs text-black/70">Immediate acknowledgment, ongoing updates</div>
          </div>
        </div>
      </div>

      {/* Request ID Explanation */}
      <div className="border-l-2 border-black/10 bg-black/[0.01] p-6">
        <div className="mb-2 text-xs text-black/60">Request Tracking</div>
        <div className="text-xs leading-relaxed text-black/70">
          When you contact support, you'll receive a request ID (e.g., REQ-2026-1234). Reference this ID in follow-up messages to help us track your issue and maintain conversation context.
        </div>
      </div>

      {/* Help Resources */}
      <div className="border border-black/10 bg-white p-6">
        <h3
          className="mb-4 text-sm tracking-tight text-black"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Common Help Topics
        </h3>

        <div className="space-y-3">
          <a
            href="#"
            className="flex items-start gap-3 border border-black/10 bg-white p-4 transition-all hover:border-black/20"
          >
            <HelpCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/40" />
            <div>
              <div className="mb-1 text-xs text-black">Getting Started Guide</div>
              <div className="text-xs text-black/60">
                Learn how to create your first engagement and generate artifacts
              </div>
            </div>
          </a>

          <a
            href="#"
            className="flex items-start gap-3 border border-black/10 bg-white p-4 transition-all hover:border-black/20"
          >
            <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/40" />
            <div>
              <div className="mb-1 text-xs text-black">Upload Best Practices</div>
              <div className="text-xs text-black/60">
                How to prepare files for matching and generation
              </div>
            </div>
          </a>

          <a
            href="#"
            className="flex items-start gap-3 border border-black/10 bg-white p-4 transition-all hover:border-black/20"
          >
            <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/40" />
            <div>
              <div className="mb-1 text-xs text-black">Privacy & Data Handling</div>
              <div className="text-xs text-black/60">
                Understanding how your data is stored and protected
              </div>
            </div>
          </a>

          <a
            href="#"
            className="flex items-start gap-3 border border-black/10 bg-white p-4 transition-all hover:border-black/20"
          >
            <Trash2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/40" />
            <div>
              <div className="mb-1 text-xs text-black">Deletion & Data Removal</div>
              <div className="text-xs text-black/60">
                How to delete uploads, artifacts, and workspace data
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Enterprise Support */}
      <div className="border border-black/10 bg-black/[0.02] p-6">
        <div className="mb-3 text-xs text-black/60">Enterprise Support</div>
        <div className="mb-3 text-xs leading-relaxed text-black/70">
          Enterprise customers receive dedicated support channels, priority response times, and direct access to our technical team. Contact{' '}
          <a
            href="mailto:enterprise@aicopilot.com"
            className="text-black underline decoration-black/20 transition-colors hover:decoration-black"
          >
            enterprise@aicopilot.com
          </a>{' '}
          for more information.
        </div>
      </div>
    </div>
  );
}
