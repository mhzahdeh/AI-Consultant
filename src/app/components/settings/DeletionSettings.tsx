import { useState } from 'react';
import { Trash2, AlertCircle, FileText, Upload } from 'lucide-react';
import { DeleteUploadModal } from './DeleteUploadModal';
import { DeleteArtifactModal } from './DeleteArtifactModal';
import { DeleteWorkspaceModal } from './DeleteWorkspaceModal';

interface DeletionSettingsProps {
  userRole: 'owner' | 'admin' | 'editor' | 'viewer' | 'billing';
}

export function DeletionSettings({ userRole }: DeletionSettingsProps) {
  const [isDeleteUploadModalOpen, setIsDeleteUploadModalOpen] = useState(false);
  const [isDeleteArtifactModalOpen, setIsDeleteArtifactModalOpen] = useState(false);
  const [isDeleteWorkspaceModalOpen, setIsDeleteWorkspaceModalOpen] = useState(false);

  const canDeleteItems = userRole === 'owner' || userRole === 'admin';
  const canDeleteWorkspace = userRole === 'owner';

  // Sample data
  const recentUploads = [
    { id: '1', name: 'Market Analysis Q4 2025.pdf', date: '2 days ago', size: '2.4 MB' },
    { id: '2', name: 'Competitive Landscape Framework.pdf', date: '1 week ago', size: '1.8 MB' },
    { id: '3', name: 'Case Study - Retail Transformation.pdf', date: '2 weeks ago', size: '3.1 MB' },
  ];

  const recentArtifacts = [
    { id: '1', name: 'Proposal Starter - Market Entry Saudi Arabia', type: 'Proposal', date: '1 day ago' },
    { id: '2', name: 'Issue Tree - Digital Transformation', type: 'Issue Tree', date: '3 days ago' },
    { id: '3', name: 'Workplan - Cost Optimization Program', type: 'Workplan', date: '1 week ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2
          className="mb-2 text-xl tracking-tight text-black"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Deletion
        </h2>
        <p className="text-sm text-black/60">
          Manage data removal and workspace deletion
        </p>
      </div>

      {/* Deletion Overview */}
      <div className="border-l-2 border-black/10 bg-black/[0.01] p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-black/60" />
          <div>
            <div className="mb-2 text-xs text-black/60">How Deletion Works</div>
            <div className="text-xs leading-relaxed text-black/70">
              Items you delete are removed immediately from the application and become inaccessible to all team members. Underlying storage cleanup follows a 30-day retention window for recovery purposes, after which data is permanently deleted from all systems.
            </div>
          </div>
        </div>
      </div>

      {/* Delete Uploads */}
      {canDeleteItems && (
        <div className="border border-black/10 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Upload className="h-5 w-5 text-black/60" />
                <h3
                  className="text-sm tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Delete Uploads
                </h3>
              </div>
              <p className="text-xs text-black/60">
                Remove individual uploaded files from your vault
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {recentUploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center justify-between border border-black/10 bg-white p-4 transition-all hover:border-black/20"
              >
                <div>
                  <div className="mb-1 text-sm text-black">{upload.name}</div>
                  <div className="text-xs text-black/60">
                    {upload.date} • {upload.size}
                  </div>
                </div>
                <button
                  onClick={() => setIsDeleteUploadModalOpen(true)}
                  className="border border-black/10 bg-white px-4 py-2 text-xs text-black transition-all hover:border-black/20"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-black/40">
            Showing 3 most recent uploads
          </div>
        </div>
      )}

      {/* Delete Artifacts */}
      {canDeleteItems && (
        <div className="border border-black/10 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <FileText className="h-5 w-5 text-black/60" />
                <h3
                  className="text-sm tracking-tight text-black"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                >
                  Delete Artifacts
                </h3>
              </div>
              <p className="text-xs text-black/60">
                Remove generated proposals, issue trees, and workplans
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {recentArtifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="flex items-center justify-between border border-black/10 bg-white p-4 transition-all hover:border-black/20"
              >
                <div>
                  <div className="mb-1 text-sm text-black">{artifact.name}</div>
                  <div className="text-xs text-black/60">
                    {artifact.type} • {artifact.date}
                  </div>
                </div>
                <button
                  onClick={() => setIsDeleteArtifactModalOpen(true)}
                  className="border border-black/10 bg-white px-4 py-2 text-xs text-black transition-all hover:border-black/20"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-black/40">
            Showing 3 most recent artifacts
          </div>
        </div>
      )}

      {/* Workspace Deletion */}
      {canDeleteWorkspace && (
        <div className="border border-black/20 bg-white p-6">
          <div className="mb-4 flex items-start gap-3">
            <Trash2 className="mt-1 h-5 w-5 flex-shrink-0 text-black/60" />
            <div className="flex-1">
              <h3
                className="mb-2 text-sm tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                Delete Entire Workspace
              </h3>
              <p className="mb-4 text-xs leading-relaxed text-black/70">
                Permanently delete your workspace and all associated data including uploads, artifacts, engagements, and team member access. This action cannot be undone.
              </p>

              <div className="mb-4 border-l-2 border-black/20 bg-black/[0.02] p-4">
                <div className="mb-2 text-xs text-black/60">What will be deleted:</div>
                <div className="space-y-1 text-xs text-black/70">
                  <div>• All uploaded files and documents</div>
                  <div>• All generated artifacts and outputs</div>
                  <div>• All engagement data and history</div>
                  <div>• Team member access and invitations</div>
                  <div>• Usage history and activity logs</div>
                </div>
              </div>

              <button
                onClick={() => setIsDeleteWorkspaceModalOpen(true)}
                className="border border-black/20 bg-white px-4 py-2 text-xs text-black/70 transition-all hover:border-black/40 hover:text-black"
              >
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Notice for Non-Owners */}
      {!canDeleteItems && (
        <div className="border-l-2 border-black/10 bg-black/[0.01] p-6">
          <div className="text-xs leading-relaxed text-black/70">
            Only workspace owners and administrators can delete uploads, artifacts, and workspace data. Contact your workspace administrator if you need to remove specific items.
          </div>
        </div>
      )}

      {/* Modals */}
      <DeleteUploadModal
        isOpen={isDeleteUploadModalOpen}
        onClose={() => setIsDeleteUploadModalOpen(false)}
        uploadName="Market Analysis Q4 2025.pdf"
      />

      <DeleteArtifactModal
        isOpen={isDeleteArtifactModalOpen}
        onClose={() => setIsDeleteArtifactModalOpen(false)}
        artifactName="Proposal Starter - Market Entry Saudi Arabia"
        artifactType="Proposal"
      />

      <DeleteWorkspaceModal
        isOpen={isDeleteWorkspaceModalOpen}
        onClose={() => setIsDeleteWorkspaceModalOpen(false)}
        workspaceName="Acme Strategy Partners"
      />
    </div>
  );
}
