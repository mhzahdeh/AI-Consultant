import { useMemo, useState } from "react";
import type { VaultCase } from "../../lib/types";
import { chartTheme } from "./chartTheme";

interface Segment {
  id: string;
  label: string;
  value: number;
  depth: number;
  startAngle: number;
  endAngle: number;
  color: string;
  path: string;
  textX: number;
  textY: number;
  showLabel: boolean;
  breadcrumb: string[];
}

interface TreeNode {
  label: string;
  value: number;
  children: TreeNode[];
}

const PALETTE = [
  chartTheme.ink,
  chartTheme.strong,
  chartTheme.mid,
  chartTheme.muted,
  chartTheme.soft,
  "#b5b5b5",
  "#d2d2d2",
  "#e4e4e4",
];

function truncateLabel(label: string, maxLength: number) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function arcPath(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function buildTree(cases: VaultCase[]): TreeNode {
  const root = new Map<string, Map<string, Map<string, number>>>();

  for (const item of cases) {
    const source = item.isInternal ? "Internal Vault" : item.sourceFirm;
    if (!root.has(source)) root.set(source, new Map());
    const industryMap = root.get(source)!;
    if (!industryMap.has(item.industry)) industryMap.set(item.industry, new Map());
    const capabilityMap = industryMap.get(item.industry)!;
    capabilityMap.set(item.capability, (capabilityMap.get(item.capability) || 0) + 1);
  }

  return {
    label: "Vault",
    value: cases.length,
    children: Array.from(root.entries()).map(([source, industries]) => ({
      label: source,
      value: Array.from(industries.values()).reduce(
        (sum, capabilities) => sum + Array.from(capabilities.values()).reduce((inner, count) => inner + count, 0),
        0
      ),
      children: Array.from(industries.entries()).map(([industry, capabilities]) => ({
        label: industry,
        value: Array.from(capabilities.values()).reduce((sum, count) => sum + count, 0),
        children: Array.from(capabilities.entries()).map(([capability, count]) => ({
          label: capability,
          value: count,
          children: [],
        })),
      })),
    })),
  };
}

function layoutSegments(node: TreeNode, startAngle: number, endAngle: number, depth: number, breadcrumb: string[], ringWidth: number, paletteIndex: number): Segment[] {
  if (!node.children.length) return [];

  let currentAngle = startAngle;
  const total = node.children.reduce((sum, child) => sum + child.value, 0);

  return node.children.flatMap((child, index) => {
    const sweep = total > 0 ? ((endAngle - startAngle) * child.value) / total : 0;
    const childStart = currentAngle;
    const childEnd = currentAngle + sweep;
    currentAngle = childEnd;

    const innerRadius = 58 + depth * ringWidth;
    const outerRadius = innerRadius + ringWidth - 6;
    const midAngle = (childStart + childEnd) / 2;
    const textPoint = polarToCartesian(180, 180, innerRadius + (outerRadius - innerRadius) / 2, midAngle);
    const color = PALETTE[(paletteIndex + index) % PALETTE.length];
    const segment: Segment = {
      id: `${breadcrumb.join("/")}/${child.label}`,
      label: child.label,
      value: child.value,
      depth,
      startAngle: childStart,
      endAngle: childEnd,
      color,
      path: arcPath(180, 180, innerRadius, outerRadius, childStart, childEnd),
      textX: textPoint.x,
      textY: textPoint.y,
      showLabel: sweep > 0.32,
      breadcrumb: [...breadcrumb, child.label],
    };

    return [segment, ...layoutSegments(child, childStart, childEnd, depth + 1, [...breadcrumb, child.label], ringWidth, paletteIndex + index + 1)];
  });
}

export function KnowledgeSunburst({ cases }: { cases: VaultCase[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const { segments, totalCases, summary } = useMemo(() => {
    const tree = buildTree(cases);
    const topSources = [...tree.children]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((item) => ({ label: item.label, value: item.value }));
    const topIndustries = [...tree.children.flatMap((item) => item.children)]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((item) => ({ label: item.label, value: item.value }));
    const topCapabilities = [...tree.children.flatMap((item) => item.children.flatMap((child) => child.children))]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((item) => ({ label: item.label, value: item.value }));
    return {
      totalCases: tree.value,
      segments: layoutSegments(tree, -Math.PI / 2, Math.PI * 1.5, 0, [tree.label], 34, 0),
      summary: {
        topSources,
        topIndustries,
        topCapabilities,
      },
    };
  }, [cases]);

  const activeSegment = segments.find((segment) => segment.id === activeId) || null;

  return (
    <div className="overflow-hidden border border-black/10 bg-white p-7 shadow-[0_18px_48px_rgba(0,0,0,0.035)]">
      <div className="mb-5 border-b border-black/5 pb-5">
        <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-black/35">Knowledge Architecture</div>
        <h3 className="mb-1 text-lg tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
          Vault Topology
        </h3>
        <p className="text-sm text-black/60">Sunburst view of source, industry, and capability concentration across your case library.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-center">
        <div className="mx-auto w-full max-w-[400px] overflow-hidden border border-black/5 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.025),rgba(255,255,255,0)_62%)] px-3 py-5">
          <svg viewBox="0 0 360 360" className="h-auto w-full" shapeRendering="geometricPrecision" textRendering="geometricPrecision">
            <circle cx="180" cy="180" r="150" fill="none" stroke={chartTheme.grid} strokeWidth="1" />
            <circle cx="180" cy="180" r="116" fill="none" stroke={chartTheme.grid} strokeWidth="1" />
            <circle cx="180" cy="180" r="82" fill="none" stroke={chartTheme.grid} strokeWidth="1" />
            <circle cx="180" cy="180" r="46" fill={chartTheme.ink} />
            <text x="180" y="170" textAnchor="middle" className="fill-white text-[10px] uppercase tracking-[0.32em]">
              Vault
            </text>
            <text x="180" y="196" textAnchor="middle" className="fill-white text-[22px]" style={{ fontFamily: "var(--font-display)" }}>
              {totalCases}
            </text>
            {segments.map((segment) => (
              <g key={segment.id}>
                <path
                  d={segment.path}
                  fill={segment.color}
                  fillOpacity={activeId === segment.id ? 0.98 : 0.9 - segment.depth * 0.08}
                  stroke={chartTheme.white}
                  strokeWidth="1.5"
                  style={{ cursor: "pointer", transition: "fill-opacity 160ms ease, transform 160ms ease" }}
                  onMouseEnter={() => setActiveId(segment.id)}
                  onMouseLeave={() => setActiveId(null)}
                />
                {segment.showLabel && segment.depth === 0 ? (
                  <text
                    x={segment.textX}
                    y={segment.textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none fill-white text-[10px]"
                    style={{ letterSpacing: "0.02em" }}
                  >
                    {truncateLabel(segment.label, 14)}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-6">
          <div className="border-l-2 border-black bg-[linear-gradient(180deg,rgba(0,0,0,0.03),rgba(0,0,0,0.012))] p-5">
            <div className="mb-2 text-[10px] uppercase tracking-[0.24em] text-black/40">Current Slice</div>
            {activeSegment ? (
              <>
                <div className="text-xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  {truncateLabel(activeSegment.label, 42)}
                </div>
                <div className="mt-1 break-words text-sm leading-relaxed text-black/60">{activeSegment.breadcrumb.slice(1).join(" / ")}</div>
                <div className="mt-3 text-sm text-black/70">
                  {activeSegment.value} case{activeSegment.value === 1 ? "" : "s"} in this segment
                </div>
              </>
            ) : (
              <>
                <div className="text-xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  Hover a segment
                </div>
                <div className="mt-3 text-sm text-black/70">
                  Use the radial hierarchy to inspect concentration by source, then by industry, then by capability.
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <div className="border-b border-black/5 pb-3">
              <div className="mb-1 text-[10px] uppercase tracking-[0.24em] text-black/40">Reading The Chart</div>
              <div className="text-sm text-black/70">The closer the band is to the center, the more structural the layer. The outer bands show where capability depth has accumulated.</div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="min-w-0 border-t border-black/10 pt-3 text-black">
                <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">Source Mix</div>
                <div className="mt-2 space-y-2">
                  {summary.topSources.map((item) => (
                    <div key={item.label} className="flex items-baseline justify-between gap-3">
                      <div className="truncate text-sm text-black" title={item.label} style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                        {truncateLabel(item.label, 16)}
                      </div>
                      <div className="shrink-0 text-xs text-black/50">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="min-w-0 border-t border-black/10 pt-3 text-black">
                <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">Industries</div>
                <div className="mt-2 space-y-2">
                  {summary.topIndustries.map((item) => (
                    <div key={item.label} className="flex items-baseline justify-between gap-3">
                      <div className="truncate text-sm text-black" title={item.label} style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                        {truncateLabel(item.label, 18)}
                      </div>
                      <div className="shrink-0 text-xs text-black/50">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="min-w-0 border-t border-black/10 pt-3 text-black">
                <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">Capabilities</div>
                <div className="mt-2 space-y-2">
                  {summary.topCapabilities.map((item) => (
                    <div key={item.label} className="flex items-baseline justify-between gap-3">
                      <div className="truncate text-sm text-black" title={item.label} style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                        {truncateLabel(item.label, 18)}
                      </div>
                      <div className="shrink-0 text-xs text-black/50">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
