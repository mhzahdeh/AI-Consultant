import { Clock, Lock, Save, ArrowRight, MoreVertical, History, PanelsTopLeft, Archive, Copy, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '../design-system/Badge';

interface WorkspaceTopBarProps {
  engagement: {
    title: string;
    client: string;
    problemType: string;
    status: string;
    lastUpdated: string;
    workspace?: {
      lastSaved?: string;
    };
  };
  onSave: () => void;
  onExport: () => void;
  onPrimaryAction: () => void;
  onVersionHistory: () => void;
  onPromoteToVault: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  primaryActionLabel: string;
  primaryActionDisabled?: boolean;
  isSaving?: boolean;
  saveNotice?: string | null;
  noticeTone?: 'success' | 'error';
}

export function WorkspaceTopBar({
  engagement,
  onSave,
  onExport,
  onPrimaryAction,
  onVersionHistory,
  onPromoteToVault,
  onDuplicate,
  onArchive,
  onDelete,
  primaryActionLabel,
  primaryActionDisabled = false,
  isSaving = false,
  saveNotice,
  noticeTone = 'success',
}: WorkspaceTopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isMenuOpen]);

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
            {saveNotice && <div className={noticeTone === 'error' ? 'text-red-700' : 'text-black'}>{saveNotice}</div>}
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-black/40">
            <Lock className="h-3 w-3" />
            Private to your organization
            {engagement.workspace?.lastSaved ? <span>• Last saved {engagement.workspace.lastSaved}</span> : null}
          </div>
        </div>

        <div className="relative flex items-center gap-3" ref={menuRef}>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={primaryActionDisabled}
            className="inline-flex items-center gap-2 border border-black bg-black px-4 py-2 text-sm text-white transition-all hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowRight className="h-4 w-4" />
            {primaryActionLabel}
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Open workspace actions"
            className="border border-black/10 bg-white px-3 py-2 text-black transition-all hover:border-black/20"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-14 z-20 min-w-52 border border-black/10 bg-white p-2 shadow-[0_12px_30px_rgb(0,0,0,0.08)]">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDuplicate();
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-black transition-colors hover:bg-black/[0.03]"
              >
                <Copy className="h-4 w-4" />
                Duplicate engagement
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onArchive();
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-black transition-colors hover:bg-black/[0.03]"
              >
                <Archive className="h-4 w-4" />
                Archive engagement
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onPromoteToVault();
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-black transition-colors hover:bg-black/[0.03]"
              >
                <Archive className="h-4 w-4" />
                Save to vault
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onVersionHistory();
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-black transition-colors hover:bg-black/[0.03]"
              >
                <History className="h-4 w-4" />
                Version history
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onExport();
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-black transition-colors hover:bg-black/[0.03]"
              >
                <PanelsTopLeft className="h-4 w-4" />
                Export draft
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-red-700 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete engagement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
