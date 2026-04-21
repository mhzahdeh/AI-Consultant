import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, CheckCircle2, X, Eye, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { useAppData } from '../../lib/AppProvider';
import type { Engagement } from '../../lib/types';

interface MatchedCasesTabProps {
  engagement: Engagement;
  onPreview: (caseId: string) => void;
}

export function MatchedCasesTab({ engagement, onPreview }: MatchedCasesTabProps) {
  const { toggleMatchedCase } = useAppData();
  const [matchingStatus, setMatchingStatus] = useState<'loading' | 'completed' | 'empty'>('completed');
  const [sortBy, setSortBy] = useState('confidence');
  const cases = engagement.matchedCases;

  const toggleInclude = async (id: string, included: boolean) => {
    await toggleMatchedCase(engagement.id, id, included);
  };

  const selectedCount = cases.filter(c => c.included).length;

  if (matchingStatus === 'loading') {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-black/40" />
          <p className="text-sm text-black/60">Matching against prior engagements...</p>
          <p className="mt-2 text-xs text-black/40">Analyzing 247 documents from your vault</p>
        </div>
      </div>
    );
  }

  if (matchingStatus === 'empty') {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex min-h-[400px] items-center justify-center border border-black/10 bg-white p-12 text-center">
            <div>
              <div className="mx-auto mb-6 h-16 w-16 border border-black/10 bg-black/[0.02] p-4">
                <AlertCircle className="h-full w-full text-black/40" />
              </div>
              <h2
                className="mb-3 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                No strong prior matches found
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-black/60">
                We couldn't find closely related prior engagements in your vault. You can still generate outputs from your brief, or upload more relevant prior work to improve reuse over time.
              </p>
              <button className="border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90">
                Continue with Brief Only
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Summary Strip */}
        <div className="border-l-2 border-black bg-black/[0.02] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-6 w-6 text-black/60" />
              <div>
                <h3
                  className="mb-1 text-base text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Influenced by {selectedCount} prior case{selectedCount !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-black/60">
                  Generation will reuse structure, frameworks, and patterns from selected materials
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none border border-black/10 bg-white py-2 px-3 pr-8 text-sm text-black transition-colors hover:border-black/20 focus:border-black focus:outline-none"
              >
                <option value="confidence">Sort by Confidence</option>
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Matched Cases */}
        <div className="space-y-4">
          {cases.map((matchedCase, i) => (
            <motion.div
              key={matchedCase.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={`border bg-white p-6 transition-all ${
                matchedCase.included
                  ? 'border-black/20 shadow-[0_2px_12px_rgb(0,0,0,0.04)]'
                  : 'border-black/10 hover:border-black/20'
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3
                      className="text-base tracking-tight text-black"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      {matchedCase.engagementTitle}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs ${
                        matchedCase.confidenceLabel === 'Strong'
                          ? 'bg-black text-white'
                          : matchedCase.confidenceLabel === 'Medium'
                          ? 'bg-black/5 text-black/70'
                          : 'border border-black/10 bg-transparent text-black'
                      }`}
                    >
                      {matchedCase.confidence}% {matchedCase.confidenceLabel} Match
                    </span>
                  </div>
                  <div className="mb-4 flex items-center gap-2 text-xs text-black/40">
                    <FileText className="h-3 w-3" />
                    {matchedCase.fileTitle}
                  </div>
                </div>
              </div>

              <div className="mb-4 border-l-2 border-black/10 bg-black/[0.01] p-4">
                <div className="mb-2 text-xs uppercase tracking-wider text-black/40">
                  Why this matched
                </div>
                <p className="text-sm leading-relaxed text-black/70">
                  {matchedCase.rationale}
                </p>
              </div>

              <div className="mb-6">
                <div className="mb-2 text-xs uppercase tracking-wider text-black/40">
                  Reusable elements
                </div>
                <div className="flex flex-wrap gap-2">
                  {matchedCase.reusableElements.map((element, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center border border-black/10 bg-transparent px-3 py-1 text-xs text-black"
                    >
                      {element}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/5 pt-4">
                <button
                  onClick={() => onPreview(matchedCase.id)}
                  className="inline-flex items-center gap-2 text-sm text-black/60 underline decoration-black/20 transition-colors hover:text-black hover:decoration-black"
                >
                  <Eye className="h-4 w-4" />
                  Preview Case
                </button>

                <button
                  onClick={() => void toggleInclude(matchedCase.id, !matchedCase.included)}
                  className={`inline-flex items-center gap-2 border px-5 py-2 text-sm transition-all ${
                    matchedCase.included
                      ? 'border-black/10 bg-white text-black hover:border-black/20'
                      : 'border-black bg-black text-white hover:bg-black/90'
                  }`}
                >
                  {matchedCase.included ? (
                    <>
                      <X className="h-4 w-4" />
                      Exclude from Generation
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Include in Generation
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
