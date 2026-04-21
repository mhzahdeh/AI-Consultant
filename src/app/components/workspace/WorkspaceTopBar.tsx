import { Clock, Lock, Save, FileDown, MoreVertical } from 'lucide-react';
import { Badge } from '../design-system/Badge';

interface WorkspaceTopBarProps {
  engagement: {
    title: string;
    client: string;
    problemType: string;
    status: string;
    lastUpdated: string;
  };
}

export function WorkspaceTopBar({ engagement }: WorkspaceTopBarProps) {
  return (
    <div className="border-b border-black/5 bg-white px-8 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h1
              className="text-2xl tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}
            >
              {engagement.title}
            </h1>
            <Badge variant="muted">{engagement.status}</Badge>
          </div>

          <div className="flex items-center gap-6 text-sm text-black/60">
            <div className="flex items-center gap-2">
              <span className="text-black/40">Client:</span>
              <span className="text-black">{engagement.client}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black/40">Type:</span>
              <span className="text-black">{engagement.problemType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-black/40" />
              {engagement.lastUpdated}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-black/40">
            <Lock className="h-3 w-3" />
            Private to your organization
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20">
            <Save className="h-4 w-4" />
            Save
          </button>
          <button className="inline-flex items-center gap-2 border border-black bg-black px-4 py-2 text-sm text-white transition-all hover:bg-black/90">
            <FileDown className="h-4 w-4" />
            Export
          </button>
          <button className="border border-black/10 bg-white px-3 py-2 text-black transition-all hover:border-black/20">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
