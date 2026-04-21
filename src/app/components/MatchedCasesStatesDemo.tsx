import { Loader2, AlertCircle, TrendingUp, FileText, CheckCircle2, X, Eye } from 'lucide-react';
import { BackButton } from './shared/BackButton';
import { Sidebar } from './shared/Sidebar';

export default function MatchedCasesStatesDemo() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeItem="engagements" />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-black/5 bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <BackButton fallbackTo="/workspace" label="Back to Workspace" />
          </div>
          <div className="mt-4">
            <h1
              className="mb-1 text-3xl tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Matched Cases States Reference
            </h1>
            <p className="text-sm text-black/60">All state variations for case matching</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Loading State */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                1. Loading / Matching in Progress
              </h2>
              <div className="border border-black/10 bg-white">
                <div className="flex min-h-[400px] items-center justify-center p-8">
                  <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-black/40" />
                    <p className="text-sm text-black/60">Matching against prior engagements...</p>
                    <p className="mt-2 text-xs text-black/40">Analyzing 247 documents from your vault</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Empty State */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                2. No Matches Found
              </h2>
              <div className="border border-black/10 bg-white">
                <div className="flex min-h-[400px] items-center justify-center p-12 text-center">
                  <div>
                    <div className="mx-auto mb-6 h-16 w-16 border border-black/10 bg-black/[0.02] p-4">
                      <AlertCircle className="h-full w-full text-black/40" />
                    </div>
                    <h3
                      className="mb-3 text-xl tracking-tight text-black"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      No strong prior matches found
                    </h3>
                    <p className="mb-8 text-sm leading-relaxed text-black/60">
                      We couldn't find closely related prior engagements in your vault. You can still generate outputs from your brief, or upload more relevant prior work to improve reuse over time.
                    </p>
                    <button className="border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90">
                      Continue with Brief Only
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Matched Cases - Strong Match */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                3. Strong Match (90%+)
              </h2>
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3
                        className="text-base tracking-tight text-black"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                      >
                        Saudi Arabia Retail Market Entry - Consumer Electronics
                      </h3>
                      <span className="inline-flex items-center bg-black px-3 py-1 text-xs text-white">
                        94% Strong Match
                      </span>
                    </div>
                    <div className="mb-4 flex items-center gap-2 text-xs text-black/40">
                      <FileText className="h-3 w-3" />
                      KSA_Retail_Market_Entry_Proposal_2024.pdf
                    </div>
                  </div>
                </div>

                <div className="mb-4 border-l-2 border-black/10 bg-black/[0.01] p-4">
                  <div className="mb-2 text-xs uppercase tracking-wider text-black/40">
                    Why this matched
                  </div>
                  <p className="text-sm leading-relaxed text-black/70">
                    Geographic alignment (Saudi Arabia), industry overlap (retail/consumer), similar entry mode analysis (greenfield vs acquisition), regulatory framework coverage
                  </p>
                </div>

                <div className="mb-6">
                  <div className="mb-2 text-xs uppercase tracking-wider text-black/40">
                    Reusable elements
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                      Proposal structure
                    </span>
                    <span className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                      Regulatory analysis framework
                    </span>
                    <span className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                      Partner evaluation criteria
                    </span>
                    <span className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                      Timeline pattern
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-black/5 pt-4">
                  <button className="inline-flex items-center gap-2 text-sm text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black">
                    <Eye className="h-4 w-4" />
                    Preview Case
                  </button>
                  <button className="inline-flex items-center gap-2 border border-black/10 bg-white px-5 py-2 text-sm text-black transition-all hover:border-black/20">
                    <X className="h-4 w-4" />
                    Exclude from Generation
                  </button>
                </div>
              </div>
            </section>

            {/* Medium Match */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                4. Medium Match (60-89%)
              </h2>
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3
                        className="text-base tracking-tight text-black"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                      >
                        Middle East Pricing Strategy
                      </h3>
                      <span className="inline-flex items-center bg-black/5 px-3 py-1 text-xs text-black/70">
                        68% Medium Match
                      </span>
                    </div>
                    <div className="mb-4 flex items-center gap-2 text-xs text-black/40">
                      <FileText className="h-3 w-3" />
                      Regional_Pricing_Transformation_Summary.pdf
                    </div>
                  </div>
                </div>

                <div className="mb-4 border-l-2 border-black/10 bg-black/[0.01] p-4">
                  <div className="mb-2 text-xs uppercase tracking-wider text-black/40">
                    Why this matched
                  </div>
                  <p className="text-sm leading-relaxed text-black/70">
                    Regional pricing considerations, competitive analysis structure, some consumer behavior overlap
                  </p>
                </div>

                <div className="mb-6">
                  <div className="mb-2 text-xs uppercase tracking-wider text-black/40">
                    Reusable elements
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                      Competitive benchmarking approach
                    </span>
                    <span className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                      Pricing analysis framework
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-black/5 pt-4">
                  <button className="inline-flex items-center gap-2 text-sm text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black">
                    <Eye className="h-4 w-4" />
                    Preview Case
                  </button>
                  <button className="inline-flex items-center gap-2 border border-black bg-black px-5 py-2 text-sm text-white transition-all hover:bg-black/90">
                    <CheckCircle2 className="h-4 w-4" />
                    Include in Generation
                  </button>
                </div>
              </div>
            </section>

            {/* Weak Match */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                5. Weak Match (Below 60%)
              </h2>
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3
                        className="text-base tracking-tight text-black"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                      >
                        European Expansion - Issue Decomposition
                      </h3>
                      <span className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                        47% Weak Match
                      </span>
                    </div>
                    <div className="mb-4 flex items-center gap-2 text-xs text-black/40">
                      <FileText className="h-3 w-3" />
                      Europe_Market_Entry_Issues.pdf
                    </div>
                  </div>
                </div>

                <div className="mb-4 border-l-2 border-black/10 bg-black/[0.01] p-4">
                  <div className="mb-2 text-xs uppercase tracking-wider text-black/40">
                    Why this matched
                  </div>
                  <p className="text-sm leading-relaxed text-black/70">
                    Similar market entry questions, issue tree structure for expansion projects
                  </p>
                </div>

                <div className="mb-6">
                  <div className="mb-2 text-xs uppercase tracking-wider text-black/40">
                    Reusable elements
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black">
                      Issue tree structure
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-black/5 pt-4">
                  <button className="inline-flex items-center gap-2 text-sm text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black">
                    <Eye className="h-4 w-4" />
                    Preview Case
                  </button>
                  <button className="inline-flex items-center gap-2 border border-black bg-black px-5 py-2 text-sm text-white transition-all hover:bg-black/90">
                    <CheckCircle2 className="h-4 w-4" />
                    Include in Generation
                  </button>
                </div>
              </div>
            </section>

            {/* Summary Strip */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                6. Selected Cases Summary Strip
              </h2>
              <div className="border-l-2 border-black bg-black/[0.02] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <TrendingUp className="h-6 w-6 text-black/60" />
                    <div>
                      <h3
                        className="mb-1 text-base text-black"
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                      >
                        Influenced by 3 prior cases
                      </h3>
                      <p className="text-sm text-black/60">
                        Generation will reuse structure, frameworks, and patterns from selected materials
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select className="appearance-none border border-black/10 bg-white py-2 px-3 pr-8 text-sm text-black transition-colors hover:border-black/20 focus:border-black focus:outline-none">
                      <option value="confidence">Sort by Confidence</option>
                      <option value="date">Sort by Date</option>
                      <option value="title">Sort by Title</option>
                    </select>
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
