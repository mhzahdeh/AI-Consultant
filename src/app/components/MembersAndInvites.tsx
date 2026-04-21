import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, UserPlus, MoreVertical, Crown, Mail, CheckCircle2 } from 'lucide-react';
import { Sidebar } from './shared/Sidebar';
import { InviteTeammateModal } from './organization/InviteTeammateModal';
import { ChangeRoleModal } from './organization/ChangeRoleModal';
import { RemoveMemberModal } from './organization/RemoveMemberModal';
import { useAppData } from '../lib/AppProvider';
import type { Member } from '../lib/types';

export default function MembersAndInvites() {
  const { bootstrap } = useAppData();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showRoleHelper, setShowRoleHelper] = useState(false);
  const members = bootstrap?.members || [];

  const handleChangeRole = (member: Member) => {
    setSelectedMember(member);
    setIsChangeRoleModalOpen(true);
  };

  const handleRemoveMember = (member: Member) => {
    setSelectedMember(member);
    setIsRemoveMemberModalOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      owner: 'bg-black text-white',
      admin: 'bg-black/5 text-black/70',
      editor: 'border border-black/10 bg-transparent text-black',
      viewer: 'border border-black/10 bg-transparent text-black',
      billing: 'border border-black/10 bg-transparent text-black',
    };
    return styles[role as keyof typeof styles] || styles.viewer;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-black text-white',
      invited: 'bg-black/5 text-black/70',
      pending: 'border border-black/10 bg-transparent text-black',
    };
    return styles[status as keyof typeof styles] || styles.pending;
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
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1
                className="mb-1 text-3xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
              >
                Members & Invites
              </h1>
              <p className="text-sm text-black/60">Manage your team and pending invitations</p>
            </div>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90"
            >
              <UserPlus className="h-4 w-4" />
              Invite Teammate
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-4">
              {/* Left: Members List */}
              <div className="lg:col-span-3">
                <div className="border border-black/10 bg-white">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 border-b border-black/10 bg-black/[0.02] px-6 py-3">
                    <div className="col-span-4 text-xs uppercase tracking-wider text-black/60">Name</div>
                    <div className="col-span-3 text-xs uppercase tracking-wider text-black/60">Email</div>
                    <div className="col-span-2 text-xs uppercase tracking-wider text-black/60">Role</div>
                    <div className="col-span-2 text-xs uppercase tracking-wider text-black/60">Status</div>
                    <div className="col-span-1 text-xs uppercase tracking-wider text-black/60"></div>
                  </div>

                  {/* Members */}
                  <div>
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="grid grid-cols-12 gap-4 border-b border-black/5 px-6 py-4 transition-all hover:bg-black/[0.01]"
                      >
                        <div className="col-span-4">
                          <div className="flex items-center gap-3">
                            {member.role === 'owner' && (
                              <Crown className="h-4 w-4 text-black/40" />
                            )}
                            <div>
                              <div className="text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                                {member.name}
                              </div>
                              <div className="text-xs text-black/40">
                                {member.status === 'active' ? `Joined ${member.joinedAt}` : `Invited ${member.invitedAt}`}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-3 flex items-center">
                          <div className="text-sm text-black/70">{member.email}</div>
                        </div>

                        <div className="col-span-2 flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 text-xs capitalize ${getRoleBadge(member.role)}`}>
                            {member.role}
                          </span>
                        </div>

                        <div className="col-span-2 flex items-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs capitalize ${getStatusBadge(member.status)}`}>
                            {member.status === 'active' && <CheckCircle2 className="h-3 w-3" />}
                            {member.status === 'invited' && <Mail className="h-3 w-3" />}
                            {member.status}
                          </span>
                        </div>

                        <div className="col-span-1 flex items-center justify-end">
                          {member.role !== 'owner' && (
                            <div className="relative">
                              <button className="text-black/40 transition-colors hover:text-black">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {/* Dropdown would appear here */}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-4 text-xs text-black/40">
                  {members.filter(m => m.status === 'active').length} active members • {members.filter(m => m.status === 'invited').length} pending invitations
                </div>
              </div>

              {/* Right: Role Helper */}
              <div>
                <div className="sticky top-8 border border-black/10 bg-white p-6">
                  <div className="mb-4 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    Role Permissions
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <Crown className="h-3 w-3 text-black/60" />
                        <span className="text-xs" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                          Owner
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-black/60">
                        Full access. Can manage billing, delete organization, and assign roles.
                      </p>
                    </div>

                    <div>
                      <div className="mb-1 text-xs" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        Admin
                      </div>
                      <p className="text-xs leading-relaxed text-black/60">
                        Can invite members, manage vault, and access all engagements.
                      </p>
                    </div>

                    <div>
                      <div className="mb-1 text-xs" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        Editor
                      </div>
                      <p className="text-xs leading-relaxed text-black/60">
                        Can create and edit engagements, upload to vault, and export artifacts.
                      </p>
                    </div>

                    <div>
                      <div className="mb-1 text-xs" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        Viewer
                      </div>
                      <p className="text-xs leading-relaxed text-black/60">
                        Read-only access to engagements and vault. Cannot create or edit.
                      </p>
                    </div>

                    <div>
                      <div className="mb-1 text-xs" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                        Billing Admin
                      </div>
                      <p className="text-xs leading-relaxed text-black/60">
                        Can manage billing and subscription. No access to engagements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InviteTeammateModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
      {selectedMember && (
        <>
          <ChangeRoleModal
            isOpen={isChangeRoleModalOpen}
            onClose={() => setIsChangeRoleModalOpen(false)}
            member={selectedMember}
          />
          <RemoveMemberModal
            isOpen={isRemoveMemberModalOpen}
            onClose={() => setIsRemoveMemberModalOpen(false)}
            member={selectedMember}
          />
        </>
      )}
    </div>
  );
}
