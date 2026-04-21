import { Link, useSearchParams } from 'react-router';
import { useState } from 'react';
import { ArrowLeft, Building2, Users, CreditCard, BarChart3, Shield, Trash2, HelpCircle } from 'lucide-react';
import { Sidebar } from './shared/Sidebar';
import { OrganizationSettings } from './settings/OrganizationSettings';
import { PrivacySettings } from './settings/PrivacySettings';
import { DeletionSettings } from './settings/DeletionSettings';
import { SupportSettings } from './settings/SupportSettings';
import { useAppData } from '../lib/AppProvider';

export default function SettingsPage() {
  const { bootstrap } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'organization';
  const [userRole] = useState<'owner' | 'admin' | 'editor' | 'viewer' | 'billing'>((bootstrap?.user.role as 'owner') || 'owner');

  const sections = [
    { id: 'organization', label: 'Organization', icon: Building2, roles: ['owner', 'admin'] },
    { id: 'members', label: 'Members', icon: Users, roles: ['owner', 'admin'] },
    { id: 'billing', label: 'Billing', icon: CreditCard, roles: ['owner', 'billing'] },
    { id: 'usage', label: 'Usage', icon: BarChart3, roles: ['owner', 'admin', 'billing'] },
    { id: 'privacy', label: 'Privacy', icon: Shield, roles: ['owner', 'admin', 'editor', 'viewer'] },
    { id: 'deletion', label: 'Deletion', icon: Trash2, roles: ['owner', 'admin'] },
    { id: 'support', label: 'Support', icon: HelpCircle, roles: ['owner', 'admin', 'editor', 'viewer', 'billing'] },
  ];

  const visibleSections = sections.filter(section => section.roles.includes(userRole));

  const handleSectionChange = (sectionId: string) => {
    setSearchParams({ section: sectionId });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'organization':
        return <OrganizationSettings userRole={userRole} />;
      case 'members':
        return (
          <div className="border-l-2 border-black/10 bg-black/[0.01] p-6">
            <div className="text-sm text-black/70">
              Members are managed from the{' '}
              <Link to="/members" className="text-black underline decoration-black/20 hover:decoration-black">
                Members page
              </Link>
              .
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="border-l-2 border-black/10 bg-black/[0.01] p-6">
            <div className="text-sm text-black/70">
              Billing and plan management is handled on the{' '}
              <Link to="/billing" className="text-black underline decoration-black/20 hover:decoration-black">
                Billing page
              </Link>
              .
            </div>
          </div>
        );
      case 'usage':
        return (
          <div className="border-l-2 border-black/10 bg-black/[0.01] p-6">
            <div className="text-sm text-black/70">
              Usage tracking and limits are available on the{' '}
              <Link to="/usage" className="text-black underline decoration-black/20 hover:decoration-black">
                Usage page
              </Link>
              .
            </div>
          </div>
        );
      case 'privacy':
        return <PrivacySettings />;
      case 'deletion':
        return <DeletionSettings userRole={userRole} />;
      case 'support':
        return <SupportSettings />;
      default:
        return <OrganizationSettings userRole={userRole} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeItem="settings" />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-black/5 bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-black/60 transition-colors hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <div className="mt-4">
            <h1
              className="mb-1 text-3xl tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Settings
            </h1>
            <p className="text-sm text-black/60">
              Manage your workspace, privacy, and account preferences
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex">
          {/* Side Navigation */}
          <nav className="w-64 border-r border-black/5 bg-white px-4 py-8">
            <div className="space-y-1">
              {visibleSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-all ${
                    activeSection === section.id
                      ? 'bg-black text-white'
                      : 'text-black/60 hover:bg-black/[0.02] hover:text-black'
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-8">
            <div className="mx-auto max-w-3xl">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
