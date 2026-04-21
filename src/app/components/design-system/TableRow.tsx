import { MoreVertical } from 'lucide-react';

interface TableRowProps {
  cells: string[];
  actions?: boolean;
}

export function TableRow({ cells, actions = false }: TableRowProps) {
  return (
    <div className="grid grid-cols-4 gap-4 border-b border-black/5 py-4 transition-colors hover:bg-black/[0.01]">
      {cells.map((cell, i) => (
        <div key={i} className="text-sm text-black">
          {cell}
        </div>
      ))}
      {actions && (
        <div className="flex justify-end">
          <button className="text-black/40 transition-colors hover:text-black">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
