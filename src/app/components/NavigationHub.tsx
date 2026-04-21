import { Link } from 'react-router';
import {
  Home,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Plus,
  FileCheck,
  Upload,
  Briefcase,
  Grid3x3,
  Eye,
  FileText,
  Building2,
  Users as UsersIcon,
  Mail,
  BarChart3,
  CreditCard,
  Settings
} from 'lucide-react';

export default function NavigationHub() {
  const pages = [
    {
      category: 'Marketing',
      items: [
        { name: 'Landing Page', path: '/landing', icon: Home },
        { name: 'Sign Up', path: '/signup', icon: UserPlus },
        { name: 'Log In', path: '/login', icon: LogIn },
      ],
    },
    {
      category: 'Organization Management',
      items: [
        { name: 'Create Organization', path: '/create-organization', icon: Building2 },
        { name: 'Select Organization', path: '/select-organization', icon: Building2 },
        { name: 'Accept Invite', path: '/accept-invite', icon: Mail },
        { name: 'Members & Invites', path: '/members', icon: UsersIcon },
      ],
    },
    {
      category: 'Authenticated Product',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'New Engagement', path: '/new-engagement', icon: Plus },
        { name: 'Brief Review', path: '/brief-review', icon: FileCheck },
        { name: 'Engagement Workspace', path: '/workspace', icon: Briefcase },
        { name: 'Usage', path: '/usage', icon: BarChart3 },
        { name: 'Billing', path: '/billing', icon: CreditCard },
        { name: 'Settings', path: '/settings', icon: Settings },
      ],
    },
    {
      category: 'Design System',
      items: [
        { name: 'Components', path: '/design-system', icon: Grid3x3 },
        { name: 'Upload States', path: '/upload-states', icon: Upload },
        { name: 'Matched Cases States', path: '/matched-cases-states', icon: Eye },
        { name: 'Artifact Generation States', path: '/artifact-states', icon: FileText },
        { name: 'Organization States', path: '/organization-states', icon: Building2 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/5 bg-black px-8 py-8">
        <h1
          className="mb-2 text-4xl tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.03em' }}
        >
          AI Consultant Copilot
        </h1>
        <p className="text-sm text-white/60">Navigation hub - All screens and states</p>
      </header>

      <div className="p-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-4">
            {pages.map((category, i) => (
              <div key={i}>
                <h2
                  className="mb-4 text-xs uppercase tracking-wider text-black/40"
                >
                  {category.category}
                </h2>
                <div className="space-y-2">
                  {category.items.map((item, j) => (
                    <Link
                      key={j}
                      to={item.path}
                      className="group flex items-center gap-3 border border-black/10 bg-white p-4 transition-all hover:border-black/20 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)]"
                    >
                      <item.icon className="h-5 w-5 text-black/40 transition-colors group-hover:text-black" />
                      <span className="text-sm text-black">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-black/5 pt-8">
            <div className="border-l-2 border-black/10 bg-black/[0.01] p-6">
              <h3
                className="mb-2 text-base text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Design Principles
              </h3>
              <ul className="space-y-1 text-sm text-black/70">
                <li>• Premium monochrome aesthetic (black, white, greys only)</li>
                <li>• Bricolage Grotesque for headlines, DM Sans for body text</li>
                <li>• No bright colors, gradients, or playful elements</li>
                <li>• Private executive workspace, not startup SaaS</li>
                <li>• Transparent AI with clear rationale for all recommendations</li>
                <li>• Serious consulting workflow, not chatbot interface</li>
                <li>• Client-ready document editing, not chat responses</li>
                <li>• Section-level regeneration with version control</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
