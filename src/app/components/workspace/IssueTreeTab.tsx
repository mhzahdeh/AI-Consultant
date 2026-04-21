import { useState } from 'react';
import { Save, FileDown, Clock, RefreshCw, History, Layout } from 'lucide-react';

interface IssueTreeTabProps {
  onExport: () => void;
  onVersionHistory: () => void;
}

export function IssueTreeTab({ onExport, onVersionHistory }: IssueTreeTabProps) {
  const [showVisualTree, setShowVisualTree] = useState(true);
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
            Last saved: 3 minutes ago
            {isSaved && <span className="text-black">Saved successfully</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowVisualTree(!showVisualTree)}
              className={`inline-flex items-center gap-2 border px-4 py-2 text-sm transition-all ${
                showVisualTree
                  ? 'border-black bg-black text-white'
                  : 'border-black/10 bg-white text-black hover:border-black/20'
              }`}
            >
              <Layout className="h-4 w-4" />
              {showVisualTree ? 'Hide' : 'Show'} Visual Tree
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
        <div className={`mx-auto ${showVisualTree ? 'max-w-6xl' : 'max-w-4xl'}`}>
          <div className={`${showVisualTree ? 'grid gap-8 grid-cols-2' : ''}`}>
            {/* Structured Content */}
            <div className="space-y-8">
              {/* Title */}
              <div>
                <input
                  type="text"
                  defaultValue="Saudi Arabia Market Entry - Issue Tree"
                  className="w-full border-none bg-transparent text-2xl tracking-tight text-black outline-none"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
                />
                <div className="mt-2 text-sm text-black/40">Issue Tree • Generated from matched cases</div>
              </div>

              {/* Root Question */}
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-3 text-xs uppercase tracking-wider text-black/40">Root Question</div>
                <textarea
                  defaultValue="Should Northstar Retail enter the Saudi Arabia consumer electronics market?"
                  rows={2}
                  className="w-full resize-none border-none bg-transparent text-base text-black outline-none"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                />
              </div>

              {/* Branch 1: Market Attractiveness */}
              <Branch
                title="Branch 1: Is the market attractive?"
                number="1"
              >
                <SubQuestion
                  question="What is the market size and growth potential?"
                  hypotheses={[
                    'Saudi consumer electronics market sized at $X billion with Y% CAGR',
                    'Vision 2030 driving increased consumer spending and retail modernization',
                  ]}
                  requiredData={[
                    'Market size by category (smartphones, laptops, audio, wearables)',
                    'Historical growth rates 2019-2025',
                    'GDP per capita trends and consumer spending patterns',
                  ]}
                />

                <SubQuestion
                  question="How competitive is the landscape?"
                  hypotheses={[
                    'Market dominated by 3-4 major players with X% combined share',
                    'Opportunity exists in premium and emerging product categories',
                  ]}
                  requiredData={[
                    'Competitor market shares and positioning',
                    'Pricing benchmarks by segment',
                    'Distribution channel analysis',
                  ]}
                />

                <SubQuestion
                  question="What are consumer preferences and behaviors?"
                  hypotheses={[
                    'Saudi consumers favor premium brands with strong after-sales support',
                    'E-commerce adoption accelerating but physical retail still dominant',
                  ]}
                  requiredData={[
                    'Consumer segmentation and purchasing drivers',
                    'Channel preferences (online vs offline)',
                    'Brand perception and loyalty patterns',
                  ]}
                />
              </Branch>

              {/* Branch 2: Feasibility */}
              <Branch
                title="Branch 2: Is market entry feasible?"
                number="2"
              >
                <SubQuestion
                  question="What are the regulatory and legal requirements?"
                  hypotheses={[
                    'Foreign ownership permitted with specific licensing requirements',
                    'Regulatory environment stable under MISA framework',
                  ]}
                  requiredData={[
                    'Foreign investment regulations and ownership limits',
                    'Licensing procedures and timeline',
                    'Import/export regulations and customs duties',
                  ]}
                />

                <SubQuestion
                  question="What entry modes are viable?"
                  hypotheses={[
                    'Greenfield provides full control but requires 18-24 month timeline',
                    'Partnership approach offers faster entry with established distribution',
                  ]}
                  requiredData={[
                    'Potential local partner identification and assessment',
                    'Real estate availability and costs for retail locations',
                    'Supply chain and logistics infrastructure evaluation',
                  ]}
                />

                <SubQuestion
                  question="What operational capabilities are required?"
                  hypotheses={[
                    'Local management talent available but requires competitive compensation',
                    'After-sales service network critical for premium positioning',
                  ]}
                  requiredData={[
                    'Talent availability and salary benchmarks',
                    'Service center requirements and costs',
                    'IT and systems integration needs',
                  ]}
                />
              </Branch>

              {/* Branch 3: Profitability */}
              <Branch
                title="Branch 3: Can we achieve profitable growth?"
                number="3"
              >
                <SubQuestion
                  question="What are the investment requirements?"
                  hypotheses={[
                    'Initial investment of $X-Y million for greenfield approach',
                    'Partnership model reduces upfront capital by 40-50%',
                  ]}
                  requiredData={[
                    'Retail location setup costs (flagship + satellite stores)',
                    'Inventory and working capital requirements',
                    'Marketing and brand-building budget',
                  ]}
                />

                <SubQuestion
                  question="What revenue and margin potential exists?"
                  hypotheses={[
                    'Year 3 revenue target of $X million with Y% EBITDA margin',
                    'Premium positioning supports 25-30% gross margins',
                  ]}
                  requiredData={[
                    'Revenue ramp assumptions by product category',
                    'Pricing power and margin benchmarks',
                    'Market share capture trajectory',
                  ]}
                />

                <SubQuestion
                  question="What are the key risks to profitability?"
                  hypotheses={[
                    'Currency fluctuation and oil price volatility create demand uncertainty',
                    'Competitive response could compress margins in early years',
                  ]}
                  requiredData={[
                    'Historical economic volatility and consumer spending correlation',
                    'Competitive response patterns to new entrants',
                    'Operating leverage and break-even analysis',
                  ]}
                />
              </Branch>
            </div>

            {/* Visual Tree Panel */}
            {showVisualTree && (
              <div className="sticky top-24 h-fit">
                <div className="border border-black/10 bg-white p-6">
                  <div className="mb-4 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    Visual Tree Preview
                  </div>

                  {/* Simplified Visual Representation */}
                  <div className="space-y-4">
                    {/* Root */}
                    <div className="border border-black/10 bg-black p-3 text-center">
                      <div className="text-xs text-white">Should Northstar enter Saudi market?</div>
                    </div>

                    {/* Branches */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="border border-black/10 bg-black/5 p-3">
                        <div className="mb-2 text-xs" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                          1. Attractive?
                        </div>
                        <div className="space-y-1">
                          <div className="border-l-2 border-black/20 pl-2 text-xs text-black/60">Market size</div>
                          <div className="border-l-2 border-black/20 pl-2 text-xs text-black/60">Competition</div>
                          <div className="border-l-2 border-black/20 pl-2 text-xs text-black/60">Consumers</div>
                        </div>
                      </div>

                      <div className="border border-black/10 bg-black/5 p-3">
                        <div className="mb-2 text-xs" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                          2. Feasible?
                        </div>
                        <div className="space-y-1">
                          <div className="border-l-2 border-black/20 pl-2 text-xs text-black/60">Regulatory</div>
                          <div className="border-l-2 border-black/20 pl-2 text-xs text-black/60">Entry modes</div>
                          <div className="border-l-2 border-black/20 pl-2 text-xs text-black/60">Operations</div>
                        </div>
                      </div>

                      <div className="border border-black/10 bg-black/5 p-3">
                        <div className="mb-2 text-xs" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                          3. Profitable?
                        </div>
                        <div className="space-y-1">
                          <div className="border-l-2 border-black/20 pl-2 text-xs text-black/60">Investment</div>
                          <div className="border-l-2 border-black/20 pl-2 text-xs text-black/60">Revenue</div>
                          <div className="border-l-2 border-black/20 pl-2 text-xs text-black/60">Risks</div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-black/5 pt-3 text-xs text-black/40">
                      Hierarchy: 1 root → 3 branches → 9 sub-questions → 27 data requirements
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface BranchProps {
  title: string;
  number: string;
  children: React.ReactNode;
}

function Branch({ title, number, children }: BranchProps) {
  return (
    <div className="border-l-4 border-black/20 pl-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center border border-black bg-black text-sm text-white">
          {number}
        </div>
        <h3
          className="text-base tracking-tight text-black"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          {title}
        </h3>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

interface SubQuestionProps {
  question: string;
  hypotheses: string[];
  requiredData: string[];
}

function SubQuestion({ question, hypotheses, requiredData }: SubQuestionProps) {
  return (
    <div className="border border-black/10 bg-white p-4">
      <div className="mb-3 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
        {question}
      </div>

      <div className="mb-3">
        <div className="mb-2 text-xs uppercase tracking-wider text-black/40">Hypotheses</div>
        <ul className="space-y-1">
          {hypotheses.map((hypothesis, i) => (
            <li key={i} className="text-xs leading-relaxed text-black/70">
              • {hypothesis}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-2 text-xs uppercase tracking-wider text-black/40">Required Data</div>
        <ul className="space-y-1">
          {requiredData.map((data, i) => (
            <li key={i} className="text-xs leading-relaxed text-black/70">
              • {data}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
