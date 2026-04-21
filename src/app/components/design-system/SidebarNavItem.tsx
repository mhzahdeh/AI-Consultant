import { LucideIcon } from 'lucide-react';

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({ icon: Icon, label, active = false, onClick }: SidebarNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors ${
        active
          ? 'bg-white/10 text-white'
          : 'text-white/60 hover:bg-white/5 hover:text-white/80'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
