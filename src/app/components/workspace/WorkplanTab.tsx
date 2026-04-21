import { useState } from 'react';
import { Save, FileDown, Clock, History, Calendar } from 'lucide-react';

interface WorkplanTabProps {
  onExport: () => void;
  onVersionHistory: () => void;
}

export function WorkplanTab({ onExport, onVersionHistory }: WorkplanTabProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="relative">
      {/* Action Bar */}
      <div className="sticky top-0 z-10 border-b border-black/5 bg-white px-8 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-black/40">
            <Clock className="h-3 w-3" />
            Last saved: 1 minute ago
            {isSaved && <span className="text-black">Saved successfully</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'timeline' ? 'table' : 'timeline')}
              className={`inline-flex items-center gap-2 border px-4 py-2 text-sm transition-all ${
                viewMode === 'timeline'
                  ? 'border-black bg-black text-white'
                  : 'border-black/10 bg-white text-black hover:border-black/20'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Timeline View
            </button>
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

      {/* Content */}
      <div className="p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Title */}
          <div>
            <input
              type="text"
              defaultValue="Saudi Arabia Market Entry - 12-Week Workplan"
              className="w-full border-none bg-transparent text-2xl tracking-tight text-black outline-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            />
            <div className="mt-2 text-sm text-black/40">Workplan • Generated from matched cases</div>
          </div>

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="border border-black/10 bg-white p-8">
              <div className="space-y-8">
                {/* Phase 1 */}
                <Phase
                  number={1}
                  title="Market Assessment & Analysis"
                  weeks="Weeks 1-3"
                  duration="3 weeks"
                >
                  <Workstream
                    name="Market Sizing & Segmentation"
                    deliverables={[
                      'Total addressable market quantification',
                      'Market segmentation by category and consumer type',
                      'Growth trajectory analysis and forecasts',
                    ]}
                  />
                  <Workstream
                    name="Competitive Landscape Analysis"
                    deliverables={[
                      'Competitor market share and positioning analysis',
                      'Pricing benchmarking by segment',
                      'Distribution channel mapping',
                    ]}
                  />
                  <Workstream
                    name="Consumer Research"
                    deliverables={[
                      'Consumer segmentation and behavior patterns',
                      'Brand perception and purchase drivers',
                      'Channel preferences analysis',
                    ]}
                  />
                  <Milestone
                    week="Week 3"
                    title="Market Assessment Complete"
                    description="Steering committee presentation on market attractiveness"
                  />
                </Phase>

                {/* Phase 2 */}
                <Phase
                  number={2}
                  title="Strategy Development"
                  weeks="Weeks 4-7"
                  duration="4 weeks"
                >
                  <Workstream
                    name="Entry Mode Evaluation"
                    deliverables={[
                      'Greenfield vs acquisition vs partnership analysis',
                      'Partner identification and preliminary assessment',
                      'Entry mode recommendation with rationale',
                    ]}
                  />
                  <Workstream
                    name="Go-to-Market Strategy"
                    deliverables={[
                      'Channel strategy and retail format recommendations',
                      'Pricing and positioning framework',
                      'Marketing and brand launch plan',
                    ]}
                  />
                  <Workstream
                    name="Regulatory & Compliance"
                    deliverables={[
                      'Regulatory framework analysis',
                      'Licensing roadmap and timeline',
                      'Entity structure recommendations',
                    ]}
                  />
                  <Milestone
                    week="Week 7"
                    title="Strategy Recommendation Ready"
                    description="Entry mode and go-to-market strategy finalized"
                  />
                </Phase>

                {/* Phase 3 */}
                <Phase
                  number={3}
                  title="Business Case & Operating Model"
                  weeks="Weeks 8-10"
                  duration="3 weeks"
                >
                  <Workstream
                    name="Financial Modeling"
                    deliverables={[
                      '5-year financial projections with scenarios',
                      'Investment requirements breakdown',
                      'Return analysis and payback period',
                    ]}
                  />
                  <Workstream
                    name="Operating Model Design"
                    deliverables={[
                      'Organizational structure and headcount plan',
                      'Supply chain and logistics framework',
                      'Technology and systems requirements',
                    ]}
                  />
                  <Workstream
                    name="Risk Assessment"
                    deliverables={[
                      'Comprehensive risk register',
                      'Mitigation strategies by risk category',
                      'Contingency planning framework',
                    ]}
                  />
                  <Milestone
                    week="Week 10"
                    title="Business Case Complete"
                    description="Full financial model and operating plan delivered"
                  />
                </Phase>

                {/* Phase 4 */}
                <Phase
                  number={4}
                  title="Final Recommendations & Roadmap"
                  weeks="Weeks 11-12"
                  duration="2 weeks"
                >
                  <Workstream
                    name="Implementation Roadmap"
                    deliverables={[
                      'Phased implementation timeline',
                      'Critical path milestones and dependencies',
                      'Resource allocation and governance structure',
                    ]}
                  />
                  <Workstream
                    name="Final Synthesis"
                    deliverables={[
                      'Executive summary and recommendation',
                      'Board presentation materials',
                      'Detailed supporting appendices',
                    ]}
                  />
                  <Milestone
                    week="Week 12"
                    title="Board Presentation"
                    description="Final recommendation and decision request"
                  />
                </Phase>
              </div>
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto border border-black/10 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/10 bg-black/[0.02]">
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-black/60">Phase</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-black/60">Duration</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-black/60">Workstreams</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-black/60">Key Milestone</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black/5">
                    <td className="px-4 py-4">
                      <div className="text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        Phase 1: Market Assessment
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-black/60">Weeks 1-3</td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-black/70">
                        Market Sizing, Competitive Analysis, Consumer Research
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-black/70">Market Assessment Complete</td>
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="px-4 py-4">
                      <div className="text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        Phase 2: Strategy Development
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-black/60">Weeks 4-7</td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-black/70">
                        Entry Mode, Go-to-Market, Regulatory & Compliance
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-black/70">Strategy Recommendation Ready</td>
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="px-4 py-4">
                      <div className="text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        Phase 3: Business Case
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-black/60">Weeks 8-10</td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-black/70">
                        Financial Modeling, Operating Model, Risk Assessment
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-black/70">Business Case Complete</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4">
                      <div className="text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        Phase 4: Final Recommendations
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-black/60">Weeks 11-12</td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-black/70">
                        Implementation Roadmap, Final Synthesis
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-black/70">Board Presentation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Dependencies Note */}
          <div className="border-l-2 border-black/10 bg-black/[0.01] p-6">
            <div className="mb-2 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Key Dependencies
            </div>
            <ul className="space-y-1 text-xs leading-relaxed text-black/70">
              <li>• Consumer research fieldwork depends on local partner engagement (Week 1)</li>
              <li>• Partner identification requires market assessment completion (Week 3)</li>
              <li>• Financial modeling depends on entry mode decision (Week 7)</li>
              <li>• Implementation roadmap requires business case approval (Week 10)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PhaseProps {
  number: number;
  title: string;
  weeks: string;
  duration: string;
  children: React.ReactNode;
}

function Phase({ number, title, weeks, duration, children }: PhaseProps) {
  return (
    <div className="border-l-4 border-black/20 pl-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-black bg-black text-base text-white">
            {number}
          </div>
          <div>
            <h3
              className="text-base tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              {title}
            </h3>
            <div className="text-xs text-black/40">{weeks} • {duration}</div>
          </div>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface WorkstreamProps {
  name: string;
  deliverables: string[];
}

function Workstream({ name, deliverables }: WorkstreamProps) {
  return (
    <div className="border border-black/10 bg-white p-4">
      <div className="mb-2 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
        {name}
      </div>
      <div className="text-xs uppercase tracking-wider text-black/40 mb-2">Deliverables</div>
      <ul className="space-y-1">
        {deliverables.map((deliverable, i) => (
          <li key={i} className="text-xs leading-relaxed text-black/70">
            • {deliverable}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface MilestoneProps {
  week: string;
  title: string;
  description: string;
}

function Milestone({ week, title, description }: MilestoneProps) {
  return (
    <div className="border border-black bg-black/[0.02] p-4">
      <div className="mb-1 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-black" />
        <div className="text-xs text-black/60">{week}</div>
      </div>
      <div className="mb-1 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
        {title}
      </div>
      <div className="text-xs text-black/70">{description}</div>
    </div>
  );
}
