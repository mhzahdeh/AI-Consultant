import type { SourceTrace } from '../../lib/types';

interface SourceTracePanelProps {
  title?: string;
  traces: SourceTrace[];
  emptyMessage?: string;
}

export function SourceTracePanel({
  title = 'Source Trace',
  traces,
  emptyMessage = 'No persisted source trace is available for this section yet.',
}: SourceTracePanelProps) {
  return (
    <div className="border border-black/10 bg-black/[0.015] px-4 py-4">
      <div className="mb-3 text-xs uppercase tracking-wider text-black/40">{title}</div>
      {traces.length ? (
        <div className="space-y-3">
          {traces.map((trace) => (
            <div key={`${trace.label}-${trace.detail}`} className="border-l border-black/10 pl-3 text-sm text-black/70">
              <div className="font-medium text-black">{trace.label}</div>
              <div>{trace.detail}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-black/55">{emptyMessage}</div>
      )}
    </div>
  );
}
