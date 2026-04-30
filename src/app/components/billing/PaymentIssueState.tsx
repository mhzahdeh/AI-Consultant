import { AlertCircle, CreditCard } from 'lucide-react';

export function PaymentIssueState() {
  return (
    <div className="border border-black/20 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-black/10 bg-black/[0.02]">
          <AlertCircle className="h-5 w-5 text-black/60" />
        </div>
        <div className="flex-1">
          <div
            className="mb-2 text-sm text-black"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            Payment Method Issue
          </div>
          <div className="mb-4 text-xs leading-relaxed text-black/70">
            We were unable to process your most recent payment. Your account remains active with
            limited functionality until payment is updated. Please update your payment method to
            restore full access.
          </div>

          {/* What's Affected */}
          <div className="mb-4 border-l-2 border-black/10 bg-black/[0.01] p-3">
            <div className="mb-2 text-xs text-black/60">Currently Limited:</div>
            <div className="space-y-1 text-xs text-black/70">
              <div>• New artifact generation paused</div>
              <div>• File uploads disabled</div>
              <div>• Team invitations disabled</div>
            </div>
          </div>

          <div className="mb-3 text-xs text-black/60">
            Existing engagements and vault access remain available in read-only mode.
          </div>

          {/* Action */}
          <a
            href="mailto:support@aicopilot.com?subject=Update%20Payment%20Method"
            className="inline-flex items-center gap-2 border border-black bg-black px-5 py-2.5 text-sm text-white transition-all hover:bg-black/90"
          >
            <CreditCard className="h-4 w-4" />
            Update Payment Method
          </a>
        </div>
      </div>
    </div>
  );
}
