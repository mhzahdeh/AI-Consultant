import { useState } from 'react';
import { Save, FileDown, Clock, RefreshCw, Copy, History } from 'lucide-react';
import { SkeletonLoader } from '../design-system/SkeletonLoader';
import type { Engagement } from '../../lib/types';

interface ProposalStarterTabProps {
  onExport: () => void;
  onVersionHistory: () => void;
  onRegenerateSection: (section: string) => void;
  engagement: Engagement;
}

export function ProposalStarterTab({ onExport, onVersionHistory, onRegenerateSection, engagement }: ProposalStarterTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleRegenerateSection = (section: string) => {
    setRegeneratingSection(section);
    onRegenerateSection(section);
  };

  if (isGenerating) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex items-center justify-center gap-3 border border-black/10 bg-white p-8 text-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
            <p className="text-sm text-black/60">Generating proposal starter from matched cases...</p>
          </div>
          <SkeletonLoader className="h-8 w-1/2" />
          <SkeletonLoader className="h-4 w-full" />
          <SkeletonLoader className="h-4 w-full" />
          <SkeletonLoader className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Action Bar */}
      <div className="sticky top-0 z-10 border-b border-black/5 bg-white px-8 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-black/40">
            <Clock className="h-3 w-3" />
            Last saved: 5 minutes ago
            {isSaved && (
              <span className="text-black">Saved successfully</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onVersionHistory}
              className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20"
            >
              <History className="h-4 w-4" />
              Version History
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 border border-black bg-black px-4 py-2 text-sm text-white transition-all hover:bg-black/90"
            >
              <FileDown className="h-4 w-4" />
              Export Draft
            </button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="p-8">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Title */}
          <div>
            <input
              type="text"
              defaultValue={engagement.workspace.proposalStarter.title}
              className="w-full border-none bg-transparent text-3xl tracking-tight text-black outline-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            />
            <div className="mt-2 text-sm text-black/40">Proposal Starter • Generated from {engagement.workspace.proposalStarter.generatedFrom} prior cases</div>
          </div>

          {/* Problem Statement */}
          <Section
            title="Problem Statement"
            isRegenerating={regeneratingSection === 'problem'}
            onRegenerate={() => handleRegenerateSection('problem')}
          >
            <p className="text-sm leading-relaxed text-black">
              Northstar Retail seeks to assess the viability and approach for entering the Saudi Arabia consumer electronics market as part of their broader GCC expansion strategy. The organization requires comprehensive analysis of market attractiveness, optimal entry mode selection, regulatory compliance requirements, and implementation roadmap to support a board-level investment decision.
            </p>
          </Section>

          {/* Objectives */}
          <Section
            title="Objectives"
            isRegenerating={regeneratingSection === 'objectives'}
            onRegenerate={() => handleRegenerateSection('objectives')}
          >
            <ul className="space-y-2 text-sm leading-relaxed text-black">
              <li>• Assess market size, growth trajectory, and competitive landscape for consumer electronics in Saudi Arabia</li>
              <li>• Evaluate entry mode options including greenfield establishment, acquisition, and partnership approaches</li>
              <li>• Identify regulatory requirements, licensing procedures, and foreign ownership considerations</li>
              <li>• Develop go-to-market strategy with channel recommendations and positioning framework</li>
              <li>• Create detailed implementation roadmap with phased approach, timeline, and resource requirements</li>
              <li>• Quantify investment requirements and develop business case with financial projections</li>
            </ul>
          </Section>

          {/* Proposed Workstreams */}
          <Section
            title="Proposed Workstreams"
            isRegenerating={regeneratingSection === 'workstreams'}
            onRegenerate={() => handleRegenerateSection('workstreams')}
          >
            <div className="space-y-4">
              <div className="border-l-2 border-black/10 bg-black/[0.01] p-4">
                <div className="mb-2 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                  Workstream 1: Market Attractiveness Assessment
                </div>
                <p className="text-sm leading-relaxed text-black/70">
                  Market sizing and segmentation, consumer behavior analysis, competitive landscape mapping, growth drivers and market trends, addressable market quantification
                </p>
              </div>

              <div className="border-l-2 border-black/10 bg-black/[0.01] p-4">
                <div className="mb-2 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                  Workstream 2: Entry Mode & Go-to-Market Strategy
                </div>
                <p className="text-sm leading-relaxed text-black/70">
                  Entry mode evaluation (greenfield vs acquisition vs partnership), channel strategy development, pricing and positioning framework, partner identification and evaluation criteria
                </p>
              </div>

              <div className="border-l-2 border-black/10 bg-black/[0.01] p-4">
                <div className="mb-2 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                  Workstream 3: Regulatory & Operating Model
                </div>
                <p className="text-sm leading-relaxed text-black/70">
                  Regulatory framework analysis, licensing and foreign ownership requirements, entity structure recommendations, supply chain and logistics planning, organizational design
                </p>
              </div>

              <div className="border-l-2 border-black/10 bg-black/[0.01] p-4">
                <div className="mb-2 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                  Workstream 4: Business Case & Implementation Roadmap
                </div>
                <p className="text-sm leading-relaxed text-black/70">
                  Financial modeling and projections, investment requirements quantification, risk assessment and mitigation, phased implementation timeline, critical path milestones
                </p>
              </div>
            </div>
          </Section>

          {/* Deliverables */}
          <Section
            title="Deliverables"
            isRegenerating={regeneratingSection === 'deliverables'}
            onRegenerate={() => handleRegenerateSection('deliverables')}
          >
            <ul className="space-y-2 text-sm leading-relaxed text-black">
              <li>• Market assessment report with sizing, segmentation, and competitive analysis</li>
              <li>• Entry mode recommendation with detailed rationale and trade-off analysis</li>
              <li>• Go-to-market strategy including channel plan and positioning framework</li>
              <li>• Regulatory compliance roadmap and entity structure recommendations</li>
              <li>• Financial business case with 5-year projections and sensitivity analysis</li>
              <li>• Implementation roadmap with phased timeline and critical milestones</li>
              <li>• Risk register with mitigation strategies and contingency plans</li>
            </ul>
          </Section>

          {/* Timeline Draft */}
          <Section
            title="Timeline Draft"
            isRegenerating={regeneratingSection === 'timeline'}
            onRegenerate={() => handleRegenerateSection('timeline')}
          >
            <div className="space-y-3">
              <div className="flex gap-4 border-b border-black/5 pb-3">
                <div className="w-24 text-xs text-black/40">Weeks 1-3</div>
                <div className="flex-1">
                  <div className="mb-1 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    Phase 1: Market Assessment
                  </div>
                  <p className="text-sm text-black/70">
                    Market sizing, competitive analysis, consumer research, initial regulatory assessment
                  </p>
                </div>
              </div>

              <div className="flex gap-4 border-b border-black/5 pb-3">
                <div className="w-24 text-xs text-black/40">Weeks 4-7</div>
                <div className="flex-1">
                  <div className="mb-1 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    Phase 2: Strategy Development
                  </div>
                  <p className="text-sm text-black/70">
                    Entry mode evaluation, partner identification, go-to-market strategy, operating model design
                  </p>
                </div>
              </div>

              <div className="flex gap-4 border-b border-black/5 pb-3">
                <div className="w-24 text-xs text-black/40">Weeks 8-10</div>
                <div className="flex-1">
                  <div className="mb-1 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    Phase 3: Business Case & Planning
                  </div>
                  <p className="text-sm text-black/70">
                    Financial modeling, investment requirements, risk assessment, implementation roadmap
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-24 text-xs text-black/40">Weeks 11-12</div>
                <div className="flex-1">
                  <div className="mb-1 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    Phase 4: Final Recommendations
                  </div>
                  <p className="text-sm text-black/70">
                    Final report synthesis, executive presentations, board recommendation package
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* Assumptions */}
          <Section
            title="Assumptions"
            isRegenerating={regeneratingSection === 'assumptions'}
            onRegenerate={() => handleRegenerateSection('assumptions')}
          >
            <ul className="space-y-2 text-sm leading-relaxed text-black">
              <li>• Client has preliminary approval for GCC expansion budget allocation</li>
              <li>• Access to client's financial data, market research, and strategic plans will be provided</li>
              <li>• Key stakeholders available for weekly steering committee meetings</li>
              <li>• Consumer research fieldwork can be conducted in Saudi Arabia with local partners</li>
              <li>• Regulatory landscape remains stable during engagement period</li>
            </ul>
          </Section>

          {/* Risks */}
          <Section
            title="Risks"
            isRegenerating={regeneratingSection === 'risks'}
            onRegenerate={() => handleRegenerateSection('risks')}
          >
            <ul className="space-y-2 text-sm leading-relaxed text-black">
              <li>• Limited availability of granular market data may require primary research dependencies</li>
              <li>• Regulatory environment subject to change under Vision 2030 policy evolution</li>
              <li>• Partner identification timeline may extend if suitable candidates are scarce</li>
              <li>• Economic conditions and consumer spending patterns subject to oil price volatility</li>
            </ul>
          </Section>

          {/* Key Questions */}
          <Section
            title="Key Questions"
            isRegenerating={regeneratingSection === 'questions'}
            onRegenerate={() => handleRegenerateSection('questions')}
          >
            <ul className="space-y-2 text-sm leading-relaxed text-black">
              <li>• What is the acceptable investment range and expected return timeline?</li>
              <li>• Are there geographic priorities within Saudi Arabia (Riyadh, Jeddah, Eastern Province)?</li>
              <li>• What is the client's risk tolerance for greenfield vs acquisition approaches?</li>
              <li>• Are there specific product categories or segments to prioritize or exclude?</li>
              <li>• What decision criteria will the board use to evaluate the final recommendation?</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isRegenerating?: boolean;
  onRegenerate: () => void;
}

function Section({ title, children, isRegenerating, onRegenerate }: SectionProps) {
  return (
    <section className="group relative border-t border-black/5 pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2
          className="text-lg tracking-tight text-black"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          {title}
        </h2>
        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-1 text-xs text-black transition-all hover:border-black/20"
          >
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </button>
          <button className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-1 text-xs text-black transition-all hover:border-black/20">
            <Copy className="h-3 w-3" />
            Copy
          </button>
        </div>
      </div>

      {isRegenerating ? (
        <div className="space-y-3">
          <SkeletonLoader className="h-4 w-full" />
          <SkeletonLoader className="h-4 w-full" />
          <SkeletonLoader className="h-4 w-3/4" />
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">{children}</div>
      )}
    </section>
  );
}
