import { Link } from 'react-router';
import { LayoutDashboard, FolderOpen, Database, BarChart3, CreditCard, Settings } from 'lucide-react';
import { SidebarNavItem } from '../design-system/SidebarNavItem';
import { useAppData } from '../../lib/AppProvider';

interface SidebarProps {
  activeItem?: string;
}

export function Sidebar({ activeItem = 'dashboard' }: SidebarProps) {
  const { bootstrap } = useAppData();
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    { id: 'engagements', label: 'Engagements', icon: FolderOpen, to: '/workspace' },
    { id: 'vault', label: 'Vault', icon: Database, to: '/vault' },
    { id: 'usage', label: 'Usage', icon: BarChart3, to: '/usage' },
    { id: 'billing', label: 'Billing', icon: CreditCard, to: '/billing' },
    { id: 'settings', label: 'Settings', icon: Settings, to: '/settings' },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
        <div className="h-7 w-7 border border-white bg-white" />
        <span className="text-sm text-white" style={{ fontFamily: 'var(--font-display)' }}>
          AI Consultant Copilot
        </span>
      </div>
      <nav className="py-4">
        {items.map((item) => (
          <Link key={item.id} to={item.to}>
            <SidebarNavItem icon={item.icon} label={item.label} active={activeItem === item.id} />
          </Link>
        ))}
      </nav>

      {/* Plan Badge */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="border border-white/10 bg-white/5 px-4 py-3">
          <div className="mb-1 text-xs text-white/40">Current plan</div>
          <div className="text-sm text-white" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
            {bootstrap?.organization.plan || 'Team'}
          </div>
        </div>
      </div>
    </aside>
  );
}
