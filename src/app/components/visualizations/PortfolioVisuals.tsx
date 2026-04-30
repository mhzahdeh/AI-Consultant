import { useMemo } from "react";
import { ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import type { Engagement } from "../../lib/types";
import { chartTheme } from "./chartTheme";

const STATUS_COLORS: Record<string, string> = {
  Draft: chartTheme.ink,
  "In Progress": chartTheme.mid,
  Completed: chartTheme.soft,
  Archived: chartTheme.pale,
};

function classifyStatus(status: string) {
  return STATUS_COLORS[status] || "#64748b";
}

function truncateLabel(label: string, maxLength: number) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
}

function ScatterTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { title: string; client: string; status: string; progress: number; knowledgeDepth: number; artifactVolume: number } }>;
}) {
  const entry = payload?.[0]?.payload;
  if (!active || !entry) return null;

  return (
    <div className="w-[280px] border border-black/10 bg-white px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
      <div className="mb-3 border-b border-black/5 pb-3">
        <div className="text-[10px] uppercase tracking-[0.26em] text-black/35">Engagement</div>
        <div className="mt-2 truncate text-base tracking-tight text-black" title={entry.title} style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
          {truncateLabel(entry.title, 34)}
        </div>
        <div className="mt-1 text-xs text-black/50">{entry.client} • {entry.status}</div>
      </div>
      <div className="space-y-2 text-sm text-black/72">
        <div className="flex items-center justify-between gap-4">
          <span>Progress</span>
          <span className="text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>{entry.progress}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Knowledge depth</span>
          <span className="text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>{entry.knowledgeDepth}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Artifact volume</span>
          <span className="text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>{entry.artifactVolume}</span>
        </div>
      </div>
    </div>
  );
}

export function PortfolioVisuals({ engagements }: { engagements: Engagement[] }) {
  const bubbleData = useMemo(
    () =>
      engagements.map((engagement) => ({
        id: engagement.id,
        title: engagement.title,
        progress: engagement.progress,
        knowledgeDepth: Math.min(100, engagement.uploads.length * 14 + engagement.matchedCases.filter((item) => item.included).length * 16 + 18),
        artifactVolume: Math.max(12, engagement.outputs.length * 10 + engagement.uploads.length * 8),
        status: engagement.status,
        client: engagement.client,
      })),
    [engagements]
  );

  const portfolioStats = useMemo(() => {
    const total = engagements.length;
    const active = engagements.filter((engagement) => engagement.status !== "Archived").length;
    const avgProgress = total ? Math.round(engagements.reduce((sum, engagement) => sum + engagement.progress, 0) / total) : 0;
    const avgKnowledgeDepth = total
      ? Math.round(
          engagements.reduce(
            (sum, engagement) =>
              sum + Math.min(100, engagement.uploads.length * 14 + engagement.matchedCases.filter((item) => item.included).length * 16 + 18),
            0
          ) / total
        )
      : 0;
    return { total, active, avgProgress, avgKnowledgeDepth };
  }, [engagements]);

  const rankedEngagements = useMemo(
    () =>
      [...engagements]
        .map((engagement) => ({
          id: engagement.id,
          title: engagement.title,
          client: engagement.client,
          status: engagement.status,
          progress: engagement.progress,
          knowledgeDepth: Math.min(100, engagement.uploads.length * 14 + engagement.matchedCases.filter((item) => item.included).length * 16 + 18),
        }))
        .sort((a, b) => b.knowledgeDepth + b.progress - (a.knowledgeDepth + a.progress))
        .slice(0, 3),
    [engagements]
  );

  return (
    <section className="overflow-hidden border border-black/10 bg-white p-7 shadow-[0_18px_48px_rgba(0,0,0,0.03)]">
      <div className="mb-5 border-b border-black/5 pb-5">
        <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-black/35">Portfolio Intelligence</div>
        <h2 className="mb-1 text-lg tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
          Portfolio Bubble Map
        </h2>
        <p className="text-sm text-black/60">Each engagement is sized by output activity and positioned by progress versus knowledge depth.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <div className="overflow-hidden">
          <div className="overflow-hidden border border-black/5 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(255,255,255,0.55))] px-2 py-3">
            <div className="mb-2 flex items-center justify-between px-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Progress</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Knowledge Depth</div>
            </div>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 16, right: 20, bottom: 20, left: 8 }}>
                  <CartesianGrid stroke={chartTheme.grid} strokeDasharray="2 8" />
                  <XAxis type="number" dataKey="progress" name="Progress" unit="%" stroke={chartTheme.soft} tick={{ fill: chartTheme.muted, fontSize: 11 }} domain={[0, 100]} />
                  <YAxis type="number" dataKey="knowledgeDepth" name="Knowledge Depth" unit="%" stroke={chartTheme.soft} tick={{ fill: chartTheme.muted, fontSize: 11 }} domain={[0, 100]} />
                  <ZAxis type="number" dataKey="artifactVolume" range={[180, 1200]} />
                  <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter data={bubbleData}>
                    {bubbleData.map((entry) => (
                      <Cell key={entry.id} fill={classifyStatus(entry.status)} fillOpacity={0.84} stroke="#ffffff" strokeWidth={1.5} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <div className="border-l-2 border-black/15 pl-4">
              <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">Upper right</div>
              <div className="mt-2 text-base tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>Advanced engagement cluster</div>
              <div className="mt-2 text-sm leading-relaxed text-black/70">High-progress work with stronger source depth, usually where prior cases and uploads are compounding well.</div>
            </div>
            <div className="border-l-2 border-black/10 pl-4">
              <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">Lower left</div>
              <div className="mt-2 text-base tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>Build-up zone</div>
              <div className="mt-2 text-sm leading-relaxed text-black/70">Earlier-stage engagements that still need richer uploads, stronger analog selection, or sharper problem framing.</div>
            </div>
            <div className="flex flex-wrap items-start gap-3 lg:justify-end">
              {Object.entries(STATUS_COLORS).map(([label, color]) => (
                <div key={label} className="px-3 py-2 text-xs text-black/65">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="border border-black/5 bg-[linear-gradient(180deg,rgba(0,0,0,0.018),rgba(255,255,255,0.7))] p-5">
            <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-black/40">Portfolio Readout</div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div className="border-t border-black/10 pt-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Active engagements</div>
                <div className="mt-2 text-3xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>{portfolioStats.active}</div>
              </div>
              <div className="border-t border-black/10 pt-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Average progress</div>
                <div className="mt-2 text-3xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>{portfolioStats.avgProgress}%</div>
              </div>
              <div className="border-t border-black/10 pt-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Knowledge depth</div>
                <div className="mt-2 text-3xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>{portfolioStats.avgKnowledgeDepth}%</div>
              </div>
              <div className="border-t border-black/10 pt-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Portfolio size</div>
                <div className="mt-2 text-3xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>{portfolioStats.total}</div>
              </div>
            </div>
          </div>

          <div className="border border-black/5 bg-white p-5">
            <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-black/40">Leading Engagements</div>
            <div className="space-y-4">
              {rankedEngagements.map((engagement, index) => (
                <div key={engagement.id} className="border-t border-black/10 pt-4">
                  <div className="mb-1 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-black/35">0{index + 1}</div>
                      <div className="text-sm text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                        {truncateLabel(engagement.title, 30)}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-black/45">{engagement.status}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-black/55">
                    <div>Progress</div>
                    <div className="text-right text-black">{engagement.progress}%</div>
                    <div>Knowledge depth</div>
                    <div className="text-right text-black">{engagement.knowledgeDepth}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
