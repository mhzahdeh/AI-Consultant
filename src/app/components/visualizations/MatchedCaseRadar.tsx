import { useMemo } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import type { MatchedCase } from "../../lib/types";
import { chartTheme } from "./chartTheme";

const SERIES_COLORS = [chartTheme.ink, chartTheme.mid, chartTheme.soft];

function truncateLabel(label: string, maxLength: number) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
}

function RadarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="w-[250px] border border-black/10 bg-white px-4 py-3 shadow-[0_16px_36px_rgba(0,0,0,0.08)]">
      <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-black/40">{label}</div>
      <div className="space-y-2">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 text-sm text-black/72">
            <span className="truncate text-black">{truncateLabel(String(entry.name || ''), 26)}</span>
            <span className="shrink-0 text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {Math.round(Number(entry.value || 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MatchedCaseRadar({ cases }: { cases: MatchedCase[] }) {
  const topCases = useMemo(() => [...cases].sort((a, b) => b.confidence - a.confidence).slice(0, 3), [cases]);

  const chartData = useMemo(() => {
    const dimensions = [
      { key: "similarity", label: "Similarity" },
      { key: "frameworkFit", label: "Framework Fit" },
      { key: "evidenceDepth", label: "Evidence Depth" },
      { key: "portability", label: "Portability" },
      { key: "deliveryInfluence", label: "Delivery Influence" },
    ];

    return dimensions.map((dimension) => {
      const row: Record<string, string | number> = { dimension: dimension.label };
      for (const item of topCases) {
        const portability = Math.min(100, item.reusableElements.join(" ").length * 1.1);
        const evidenceDepth = Math.min(100, item.rationale.length * 0.75);
        const frameworkFit = Math.min(100, item.reusableElements.length * 18 + 22);
        const deliveryInfluence = item.included ? 94 : 62;
        row[item.engagementTitle] =
          dimension.key === "similarity"
            ? item.confidence
            : dimension.key === "frameworkFit"
            ? frameworkFit
            : dimension.key === "evidenceDepth"
            ? evidenceDepth
            : dimension.key === "portability"
            ? portability
            : deliveryInfluence;
      }
      return row;
    });
  }, [topCases]);

  if (!topCases.length) return null;

  return (
    <div className="border border-black/10 bg-white p-7 shadow-[0_18px_48px_rgba(0,0,0,0.03)]">
      <div className="mb-5 border-b border-black/5 pb-5">
        <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-black/35">Comparative Fit</div>
        <h3 className="mb-1 text-lg tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
          Analog Fit Radar
        </h3>
        <p className="text-sm text-black/60">Polar comparison of the top matched cases across similarity, portability, and delivery strength.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="overflow-hidden border border-black/5 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.025),rgba(255,255,255,0)_62%)] px-2 py-3">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} outerRadius="72%">
                <PolarGrid stroke={chartTheme.grid} />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: chartTheme.muted, fontSize: 11 }} tickFormatter={(value: string) => truncateLabel(value, 12)} />
                <Tooltip content={<RadarTooltip />} />
                {topCases.map((item, index) => (
                  <Radar
                    key={item.id}
                    name={item.engagementTitle}
                    dataKey={item.engagementTitle}
                    stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                    fill={SERIES_COLORS[index % SERIES_COLORS.length]}
                    fillOpacity={0.06 + index * 0.04}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">Comparison Set</div>
          {topCases.map((item, index) => (
            <div key={item.id} className="border-t border-black/10 pt-3 text-black/70">
              <div className="mb-1 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }} />
                <span className="truncate text-sm text-black" title={item.engagementTitle} style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>{truncateLabel(item.engagementTitle, 28)}</span>
              </div>
              <div className="text-xs text-black/50">{item.confidence}% confidence • {item.included ? "included in generation" : "available as optional analog"}</div>
            </div>
          ))}
          <div className="border-l-2 border-black/10 pl-4 pt-1 text-sm text-black/65">
            The tighter and darker the polygon, the more transferable the case is likely to be for this engagement.
          </div>
        </div>
      </div>
    </div>
  );
}
