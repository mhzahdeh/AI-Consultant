import { Link } from 'react-router';
import { useState } from 'react';
import { Home, LayoutDashboard, FolderOpen, Database, BarChart3, Settings } from 'lucide-react';
import { Button } from './design-system/Button';
import { Input } from './design-system/Input';
import { Textarea } from './design-system/Textarea';
import { Select } from './design-system/Select';
import { Tabs } from './design-system/Tabs';
import { Card } from './design-system/Card';
import { Badge } from './design-system/Badge';
import { Modal } from './design-system/Modal';
import { UploadZone } from './design-system/UploadZone';
import { TableRow } from './design-system/TableRow';
import { SidebarNavItem } from './design-system/SidebarNavItem';
import { SkeletonLoader, SkeletonCard } from './design-system/SkeletonLoader';

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-sidebar">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
          <div className="h-7 w-7 border border-white bg-white" />
          <span className="text-sm text-white" style={{ fontFamily: 'var(--font-display)' }}>
            AI Consultant Copilot
          </span>
        </div>
        <nav className="py-4">
          <SidebarNavItem icon={LayoutDashboard} label="Dashboard" />
          <SidebarNavItem icon={FolderOpen} label="Engagements" active />
          <SidebarNavItem icon={Database} label="Vault" />
          <SidebarNavItem icon={BarChart3} label="Usage" />
          <SidebarNavItem icon={Settings} label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-white">
        {/* Header */}
        <header className="border-b border-black/5 bg-white px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Design System
              </h1>
              <p className="mt-1 text-sm text-black/60">Premium monochrome components</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-sm text-black transition-all hover:border-black/20"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Buttons */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Buttons
              </h2>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="primary" icon>
                  Primary with Icon
                </Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="secondary" icon>
                  Secondary with Icon
                </Button>
              </div>
            </section>

            {/* Form Elements */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Form Elements
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Email address"
                  id="demo-email"
                  type="email"
                  placeholder="you@company.com"
                />
                <Input
                  label="Password"
                  id="demo-password"
                  type="password"
                  placeholder="Min. 8 characters"
                  error="Password must be at least 8 characters"
                />
                <Select
                  label="Industry"
                  id="demo-select"
                  options={[
                    { value: 'consulting', label: 'Consulting' },
                    { value: 'finance', label: 'Finance' },
                    { value: 'technology', label: 'Technology' },
                  ]}
                />
                <div>
                  <Textarea
                    label="Project brief"
                    id="demo-textarea"
                    placeholder="Describe your project..."
                    rows={4}
                  />
                </div>
              </div>
            </section>

            {/* Tabs */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Tabs
              </h2>
              <Tabs
                tabs={[
                  { id: 'overview', label: 'Overview', content: <p className="text-sm text-black/60">Overview content goes here</p> },
                  { id: 'details', label: 'Details', content: <p className="text-sm text-black/60">Details content goes here</p> },
                  { id: 'settings', label: 'Settings', content: <p className="text-sm text-black/60">Settings content goes here</p> },
                ]}
              />
            </section>

            {/* Cards */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Cards
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <h3
                    className="mb-2 text-base text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Default Card
                  </h3>
                  <p className="text-sm text-black/60">Standard card without hover effect</p>
                </Card>
                <Card hoverable>
                  <h3
                    className="mb-2 text-base text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Hoverable Card
                  </h3>
                  <p className="text-sm text-black/60">Hover to see the shadow effect</p>
                </Card>
                <Card className="bg-black text-white">
                  <h3
                    className="mb-2 text-base"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Dark Card
                  </h3>
                  <p className="text-sm text-white/60">Card with inverted colors</p>
                </Card>
              </div>
            </section>

            {/* Badges */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Status Badges
              </h2>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Active</Badge>
                <Badge variant="muted">Pending</Badge>
                <Badge variant="outline">Draft</Badge>
                <Badge variant="default">Completed</Badge>
                <Badge variant="muted">In Progress</Badge>
              </div>
            </section>

            {/* Modal */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Modal
              </h2>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Example Modal"
              >
                <p className="mb-6 text-sm text-black/60">
                  This is a premium modal dialog with a clean, minimal design. It features a backdrop blur and elegant animations.
                </p>
                <div className="flex gap-3">
                  <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                    Confirm
                  </Button>
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </Modal>
            </section>

            {/* Upload Zone */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Upload Drop Zone
              </h2>
              <UploadZone />
            </section>

            {/* Table */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Table Rows
              </h2>
              <div className="border border-black/10 bg-white">
                <div className="grid grid-cols-4 gap-4 border-b border-black/10 bg-black/[0.02] px-4 py-3">
                  <div className="text-xs uppercase tracking-wider text-black/60">Engagement</div>
                  <div className="text-xs uppercase tracking-wider text-black/60">Client</div>
                  <div className="text-xs uppercase tracking-wider text-black/60">Status</div>
                  <div className="text-xs uppercase tracking-wider text-black/60">Date</div>
                </div>
                <div className="px-4">
                  <TableRow
                    cells={['Digital Transformation', 'Acme Corp', 'In Progress', 'Apr 10, 2026']}
                    actions
                  />
                  <TableRow
                    cells={['Market Entry Strategy', 'TechCo', 'Completed', 'Apr 8, 2026']}
                    actions
                  />
                  <TableRow
                    cells={['Cost Optimization', 'Global Industries', 'Draft', 'Apr 5, 2026']}
                    actions
                  />
                </div>
              </div>
            </section>

            {/* Skeleton Loaders */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Skeleton Loaders
              </h2>
              <div className="space-y-4">
                <SkeletonLoader className="h-8 w-1/3" />
                <SkeletonLoader className="h-4 w-full" />
                <SkeletonLoader className="h-4 w-5/6" />
                <div className="grid gap-6 pt-4 md:grid-cols-3">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            </section>

            {/* Color Palette */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Color Palette
              </h2>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <div className="h-24 border border-black/10 bg-[#0a0a0a]" />
                  <div className="text-xs text-black/60">Black</div>
                  <div className="text-xs text-black/40">#0a0a0a</div>
                </div>
                <div className="space-y-2">
                  <div className="h-24 border border-black/10 bg-[#1a1a1a]" />
                  <div className="text-xs text-black/60">Dark Gray</div>
                  <div className="text-xs text-black/40">#1a1a1a</div>
                </div>
                <div className="space-y-2">
                  <div className="h-24 border border-black/10 bg-[#6b6b6b]" />
                  <div className="text-xs text-black/60">Medium Gray</div>
                  <div className="text-xs text-black/40">#6b6b6b</div>
                </div>
                <div className="space-y-2">
                  <div className="h-24 border border-black/10 bg-[#ffffff]" />
                  <div className="text-xs text-black/60">White</div>
                  <div className="text-xs text-black/40">#ffffff</div>
                </div>
              </div>
            </section>

            {/* Typography */}
            <section className="pb-16">
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Typography
              </h2>
              <div className="space-y-6">
                <div>
                  <div
                    className="mb-2 text-5xl tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.03em' }}
                  >
                    Display Headline
                  </div>
                  <p className="text-xs text-black/40">Bricolage Grotesque, 48px, Light</p>
                </div>
                <div>
                  <div
                    className="mb-2 text-3xl tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 400 }}
                  >
                    Page Title
                  </div>
                  <p className="text-xs text-black/40">Bricolage Grotesque, 30px, Regular</p>
                </div>
                <div>
                  <div className="mb-2 text-base text-black">
                    Body text using DM Sans. Designed for exceptional readability and clarity in premium interfaces. The font maintains a professional, minimal aesthetic.
                  </div>
                  <p className="text-xs text-black/40">DM Sans, 16px, Regular</p>
                </div>
                <div>
                  <div className="mb-2 text-sm text-black/60">
                    Small text for captions and secondary information
                  </div>
                  <p className="text-xs text-black/40">DM Sans, 14px, Regular</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
