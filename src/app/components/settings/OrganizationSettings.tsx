import { useState } from 'react';
import { Building2, Calendar, Crown, Check, X } from 'lucide-react';
import { useAppData } from '../../lib/AppProvider';

interface OrganizationSettingsProps {
  userRole: 'owner' | 'admin' | 'editor' | 'viewer' | 'billing';
}

export function OrganizationSettings({ userRole }: OrganizationSettingsProps) {
  const { bootstrap, updateOrganizationName } = useAppData();
  const [isEditingName, setIsEditingName] = useState(false);
  const [orgName, setOrgName] = useState(bootstrap?.organization.name || 'Organization');
  const [editedName, setEditedName] = useState(orgName);

  const canEdit = userRole === 'owner' || userRole === 'admin';

  const handleSaveName = () => {
    void updateOrganizationName(editedName);
    setOrgName(editedName);
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditedName(orgName);
    setIsEditingName(false);
  };

  const organizationData = {
    slug: bootstrap?.organization.slug || '',
    plan: bootstrap?.organization.plan || '',
    owner: bootstrap?.organization.owner || '',
    ownerEmail: bootstrap?.organization.ownerEmail || '',
    created: bootstrap?.organization.created || '',
    members: bootstrap?.organization.membersCount || 0,
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2
          className="mb-2 text-xl tracking-tight text-black"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Organization
        </h2>
        <p className="text-sm text-black/60">
          Basic information about your workspace
        </p>
      </div>

      {/* Organization Name */}
      <div className="border border-black/10 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="mb-1 text-xs text-black/60">Organization Name</div>
            {isEditingName ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
                autoFocus
              />
            ) : (
              <div className="text-sm text-black">{orgName}</div>
            )}
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <>
                  <button
                    onClick={handleSaveName}
                    className="flex h-8 w-8 items-center justify-center border border-black bg-black text-white transition-all hover:bg-black/90"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex h-8 w-8 items-center justify-center border border-black/10 bg-white text-black transition-all hover:border-black/20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="border border-black/10 bg-white px-4 py-2 text-xs text-black transition-all hover:border-black/20"
                >
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Organization Details Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-black/10 bg-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-black/40" />
            <div className="text-xs text-black/60">Workspace Slug</div>
          </div>
          <div className="text-sm text-black">{organizationData.slug}</div>
          <div className="mt-2 text-xs text-black/40">
            Used for API access and workspace identification
          </div>
        </div>

        <div className="border border-black/10 bg-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <Crown className="h-4 w-4 text-black/40" />
            <div className="text-xs text-black/60">Current Plan</div>
          </div>
          <div className="text-sm text-black">{organizationData.plan}</div>
          <div className="mt-2 text-xs text-black/40">
            5 seats, unlimited engagements
          </div>
        </div>

        <div className="border border-black/10 bg-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <Crown className="h-4 w-4 text-black/40" />
            <div className="text-xs text-black/60">Organization Owner</div>
          </div>
          <div className="text-sm text-black">{organizationData.owner}</div>
          <div className="mt-1 text-xs text-black/40">{organizationData.ownerEmail}</div>
        </div>

        <div className="border border-black/10 bg-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-black/40" />
            <div className="text-xs text-black/60">Created</div>
          </div>
          <div className="text-sm text-black">{organizationData.created}</div>
          <div className="mt-2 text-xs text-black/40">
            {organizationData.members} active members
          </div>
        </div>
      </div>

      {/* Data Boundary Notice */}
      <div className="border-l-2 border-black/10 bg-black/[0.01] p-6">
        <div className="mb-2 text-xs text-black/60">Data Boundary</div>
        <div className="text-xs leading-relaxed text-black/70">
          All uploads, artifacts, and engagement data created within this workspace remain scoped to your organization. Files and outputs are not used to train shared public models. Team members can only access data within this organization boundary.
        </div>
      </div>

      {/* Danger Zone (Owner Only) */}
      {userRole === 'owner' && (
        <div className="border border-black/20 bg-white p-6">
          <div className="mb-4">
            <div
              className="mb-2 text-sm text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Workspace Deletion
            </div>
            <div className="text-xs text-black/60">
              Permanently delete this workspace and all associated data. This action cannot be undone.
            </div>
          </div>
          <button className="border border-black/20 bg-white px-4 py-2 text-xs text-black/70 transition-all hover:border-black/40 hover:text-black">
            Delete Workspace
          </button>
        </div>
      )}
    </div>
  );
}
