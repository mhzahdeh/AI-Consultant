import { X, FileText, CheckCircle2, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MatchPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInclude: () => void;
}

export function MatchPreviewModal({ isOpen, onClose, onInclude }: MatchPreviewModalProps) {
  const caseData = {
    fileTitle: 'KSA_Retail_Market_Entry_Proposal_2024.pdf',
    engagementTitle: 'Saudi Arabia Retail Market Entry - Consumer Electronics',
    confidence: 94,
    date: 'March 2024',
    lead: 'Sarah Chen',
    client: 'Delta Consumer Group',
    outcome: 'Won - Implementation ongoing',
    rationale: 'Geographic alignment (Saudi Arabia), industry overlap (retail/consumer), similar entry mode analysis (greenfield vs acquisition), regulatory framework coverage',
    reusableElements: [
      {
        section: 'Proposal Structure',
        description: 'Three-phase approach with market assessment, strategy development, and implementation planning',
      },
      {
        section: 'Regulatory Analysis Framework',
        description: 'Comprehensive Saudi regulatory checklist including FDI requirements, licensing process, and ownership structures',
      },
      {
        section: 'Partner Evaluation Criteria',
        description: 'Scorecard for assessing potential local partners including financial strength, market access, and cultural fit',
      },
      {
        section: 'Timeline Pattern',
        description: '8-week engagement structure with weekly milestone deliverables and client check-ins',
      },
    ],
    excerpt: 'Executive Summary: Delta Consumer Group seeks to establish retail presence in Kingdom of Saudi Arabia as anchor market for broader GCC expansion. Recommended approach combines greenfield flagship stores in Riyadh and Jeddah with strategic partnership for distribution network. Entry timing optimized for Q4 2024 to capture Vision 2030 momentum and consumer spending growth.\n\nKey success factors include: 1) Securing appropriate retail locations in prime commercial zones, 2) Establishing local entity with compliant ownership structure, 3) Building supply chain infrastructure with regional hub approach, 4) Recruiting experienced local management team.\n\nMarket assessment indicates $2.8B addressable market with 12-15% annual growth trajectory...',
  };

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
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l border-black/10 bg-white shadow-[-20px_0_60px_rgb(0,0,0,0.1)]"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-black/5 bg-white px-8 py-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2
                    className="mb-2 text-xl tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    {caseData.engagementTitle}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-black/40">
                    <FileText className="h-3 w-3" />
                    {caseData.fileTitle}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-black/40 transition-colors hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="space-y-8">
                {/* Metadata */}
                <section className="grid gap-4 border border-black/10 bg-white p-6 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-xs text-black/40">Engagement Date</div>
                    <div className="flex items-center gap-2 text-sm text-black">
                      <Calendar className="h-4 w-4" />
                      {caseData.date}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-black/40">Engagement Lead</div>
                    <div className="flex items-center gap-2 text-sm text-black">
                      <User className="h-4 w-4" />
                      {caseData.lead}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-black/40">Client</div>
                    <div className="text-sm text-black">{caseData.client}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-black/40">Outcome</div>
                    <div className="text-sm text-black">{caseData.outcome}</div>
                  </div>
                </section>

                {/* Match Rationale */}
                <section>
                  <h3
                    className="mb-4 text-base tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Why This Matched
                  </h3>
                  <div className="border-l-2 border-black/10 bg-black/[0.01] p-6">
                    <p className="text-sm leading-relaxed text-black/70">
                      {caseData.rationale}
                    </p>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 bg-black px-4 py-2 text-xs text-white">
                    {caseData.confidence}% Strong Match
                  </div>
                </section>

                {/* Reusable Elements */}
                <section>
                  <h3
                    className="mb-4 text-base tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Reusable Elements
                  </h3>
                  <div className="space-y-4">
                    {caseData.reusableElements.map((element, i) => (
                      <div key={i} className="border border-black/10 bg-white p-4">
                        <div
                          className="mb-2 text-sm text-black"
                          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                        >
                          {element.section}
                        </div>
                        <p className="text-sm leading-relaxed text-black/60">
                          {element.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Preview Excerpt */}
                <section>
                  <h3
                    className="mb-4 text-base tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Content Preview
                  </h3>
                  <div className="border border-black/10 bg-white p-6">
                    <p className="text-sm leading-relaxed text-black/70">
                      {caseData.excerpt}
                    </p>
                  </div>
                  <div className="mt-3 text-xs text-black/40">
                    Showing first 500 characters
                  </div>
                </section>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 border-t border-black/5 bg-white px-8 py-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={onInclude}
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Include in Generation
                </button>
                <button
                  onClick={onClose}
                  className="border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
