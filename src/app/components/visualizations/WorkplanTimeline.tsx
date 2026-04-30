import { useMemo } from "react";
import type { WorkplanPhase } from "../../lib/types";
import { chartTheme } from "./chartTheme";

function parseWeekRange(value: string, fallbackStart: number) {
  const matches = value.match(/\d+/g)?.map(Number) ?? [];
  if (matches.length >= 2) {
    const [first, second] = matches;
    return { start: Math.min(first, second), end: Math.max(first, second) };
  }
  if (matches.length === 1) {
    return { start: matches[0], end: matches[0] };
  }
  return { start: fallbackStart, end: fallbackStart + 1 };
}

const COLORS = [chartTheme.ink, chartTheme.strong, chartTheme.mid, chartTheme.muted, chartTheme.soft, "#bcbcbc"];

function truncateLabel(label: string, maxLength: number) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
}

export function WorkplanTimeline({ phases }: { phases: WorkplanPhase[] }) {
  const layout = useMemo(() => {
    const mapped = phases.reduce<Array<WorkplanPhase & { start: number; end: number; color: string }>>((acc, phase, index) => {
      const fallbackStart = acc.length ? acc[acc.length - 1].end + 1 : 1;
      const range = parseWeekRange(phase.weeks, fallbackStart);
      acc.push({ ...phase, ...range, color: COLORS[index % COLORS.length] });
      return acc;
    }, []);
    const maxWeek = mapped.reduce((max, phase) => Math.max(max, phase.end), 0);
    return { mapped, maxWeek };
  }, [phases]);

  if (!layout.mapped.length) return null;

  return (
    <div className="overflow-hidden border border-black/10 bg-white p-7 shadow-[0_18px_48px_rgba(0,0,0,0.03)]">
      <div className="mb-5 border-b border-black/5 pb-5">
        <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-black/35">Delivery Sequencing</div>
        <h3 className="mb-1 text-lg tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
          Phase Timeline
        </h3>
        <p className="text-sm text-black/60">Gantt-style workplan view showing how the current phases sequence over the full delivery window.</p>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="border-t border-black/10 pt-3">
          <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">Phase count</div>
          <div className="mt-2 text-2xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>{layout.mapped.length}</div>
        </div>
        <div className="border-t border-black/10 pt-3">
          <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">Delivery window</div>
          <div className="mt-2 text-2xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>W1-W{layout.maxWeek}</div>
        </div>
        <div className="border-t border-black/10 pt-3">
          <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">View</div>
          <div className="mt-2 text-sm text-black/70">A slimmer scheduling ribbon for phase pacing and overlap.</div>
        </div>
      </div>

      <div className="overflow-x-auto border border-black/5 bg-[linear-gradient(180deg,rgba(0,0,0,0.015),rgba(255,255,255,0.8))] p-4">
        <div className="min-w-[720px]">
          <div className="mb-3 grid" style={{ gridTemplateColumns: `220px repeat(${layout.maxWeek}, minmax(0, 1fr))` }}>
            <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">Phase</div>
            {Array.from({ length: layout.maxWeek }, (_, index) => (
              <div key={index} className="text-center text-[10px] uppercase tracking-[0.2em] text-black/40">
                W{index + 1}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {layout.mapped.map((phase) => (
              <div key={phase.name} className="grid items-center gap-3" style={{ gridTemplateColumns: `220px repeat(${layout.maxWeek}, minmax(0, 1fr))` }}>
                <div className="pr-4">
                  <div className="truncate text-sm text-black" title={phase.name} style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                    {truncateLabel(phase.name, 28)}
                  </div>
                  <div className="truncate text-xs text-black/50" title={phase.weeks}>{truncateLabel(phase.weeks, 24)}</div>
                </div>
                {Array.from({ length: layout.maxWeek }, (_, index) => {
                  const week = index + 1;
                  const active = week >= phase.start && week <= phase.end;
                  const edge = week === phase.start || week === phase.end;
                  return (
                    <div key={`${phase.name}-${week}`} className="flex h-10 items-center border border-black/5 bg-black/[0.015] px-1">
                      {active ? (
                        <div
                          className={`h-3 w-full rounded-full ${edge ? "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]" : ""}`}
                          style={{ background: active ? `linear-gradient(135deg, ${phase.color}, ${phase.color})` : undefined }}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
