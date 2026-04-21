# Frontend Placeholder Audit

> **Purpose:** This document catalogs every UI element in the frontend that is currently a placeholder — buttons with no real behavior, hardcoded mock data, toast-only saves, and broken links. Use this as a backlog to prioritize implementation work.

**Total placeholders found: ~40**
**Date audited: 2026-04-21**

---

## Placeholder Types Legend

| Type | Meaning |
|------|---------|
| `no-handler` | Button/link exists but has no `onClick` or `href` |
| `toast-only` | Shows a success toast but makes no API call |
| `empty-handler` | Has a handler but it only `console.log`s or does nothing real |
| `mock-data` | Simulates an action (fake delay + success) without actually doing it |
| `hardcoded-data` | Displays fixture/template data instead of real dynamic content |

---

## 1. Workspace Tabs — Save Buttons (Toast-Only)

All three artifact tabs have Save buttons that show a success toast but **never call the API**.

### ProposalStarterTab.tsx — Save Button
- **Location:** Action bar, top right
- **Current behavior:** Shows toast `"Saved successfully"` for 2 seconds, no API call
- **Intended behavior:** `PATCH /api/engagements/:id` to persist manual edits to proposal content
- **Why it matters:** Without real saves, consultants lose all manual edits on page reload
- **Type:** `toast-only`

### IssueTreeTab.tsx — Save Button
- **Location:** Action bar, top right
- **Current behavior:** Shows toast `"Saved successfully"` for 2 seconds, no API call
- **Intended behavior:** Persist issue tree structure edits to database
- **Why it matters:** Issue trees are iteratively refined; losing edits breaks the workflow
- **Type:** `toast-only`

### WorkplanTab.tsx — Save Button
- **Location:** Action bar, top right
- **Current behavior:** Shows toast `"Saved successfully"`, no API call
- **Intended behavior:** Persist workplan phase/milestone edits to database
- **Why it matters:** Workplans are client-facing deliverables; edits must persist
- **Type:** `toast-only`

---

## 2. Export Modal — Export Buttons (Mock Data)

### ExportModal.tsx — Export as DOCX
- **Location:** Export modal, idle state
- **Current behavior:** Simulates a 2-second delay then shows success — **no file is downloaded**
- **Intended behavior:** Generate and trigger browser download of a `.docx` file containing the proposal content
- **Why it matters:** Consultants need editable Word documents to deliver to clients and collaborators
- **Type:** `mock-data`

### ExportModal.tsx — Export as PDF
- **Location:** Export modal, idle state
- **Current behavior:** Simulates a 2-second delay then shows success — **no file is downloaded**
- **Intended behavior:** Generate and trigger browser download of a `.pdf` file
- **Why it matters:** PDFs are the standard format for client-ready deliverables
- **Type:** `mock-data`

### ExportModal.tsx — Copy to Clipboard
- **Location:** Export modal, idle state
- **Current behavior:** `console.log("Copied to clipboard")` — **clipboard is never written**
- **Intended behavior:** Write full proposal text to `navigator.clipboard`
- **Why it matters:** Quick copy is needed to paste into email, Slack, or other tools
- **Type:** `empty-handler`

---

## 3. Brief Tab — Action Buttons (No Handler)

### BriefTab.tsx — Re-run Matching Button
- **Location:** Canonical Brief section, action bar
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Re-trigger case matching algorithm after brief edits; refresh `matchedCases` via API
- **Why it matters:** After editing a brief, matched cases become stale — re-matching is a core workflow step
- **Type:** `no-handler`

### BriefTab.tsx — Add Source File Button
- **Location:** Source Materials section
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Open file picker / upload dialog to attach additional PDFs or documents
- **Why it matters:** Clients often send follow-up documents mid-engagement
- **Type:** `no-handler`

### BriefTab.tsx — Preview Link (per file)
- **Location:** Source Materials, file list rows
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Open a preview modal showing parsed document content
- **Why it matters:** Users need to verify what was extracted from uploaded files before generating artifacts
- **Type:** `no-handler`

---

## 4. Version History Modal — Version Controls (No Handler)

### VersionHistoryModal.tsx — Restore Version Button
- **Location:** Version list, per non-current version
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Revert engagement content to the selected version via API
- **Why it matters:** Undo / rollback is essential when regeneration produces worse output
- **Type:** `no-handler`

### VersionHistoryModal.tsx — Compare Button
- **Location:** Version list, per non-current version
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Show a diff view between the current version and the selected version
- **Why it matters:** Consultants need to understand exactly what changed between AI regenerations
- **Type:** `no-handler`

### VersionHistoryModal.tsx — All Version Entries (Hardcoded)
- **Location:** Version list
- **Current behavior:** 7 hardcoded version entries are always displayed
- **Intended behavior:** Fetch and display actual version history for the current engagement (populated by `regenerationLog` in the backend)
- **Why it matters:** Users need to see their real edit history, not template data
- **Type:** `hardcoded-data`

---

## 5. Workspace Top Bar (No Handler)

### WorkspaceTopBar.tsx — Save Button
- **Location:** Top bar, right side
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Persist current workspace state to database
- **Why it matters:** Users expect a top-level save action at all times
- **Type:** `no-handler`

### WorkspaceTopBar.tsx — More Options Menu (⋮)
- **Location:** Top bar, right side
- **Current behavior:** No `onClick` handler, no dropdown renders
- **Intended behavior:** Open a context menu with additional workspace actions (rename, archive, share, etc.)
- **Why it matters:** Power users need quick access to advanced actions from anywhere in the workspace
- **Type:** `no-handler`

---

## 6. Brief Review (New Engagement Flow)

### BriefReview.tsx — Edit Brief → Save Button
- **Location:** Canonical Brief section, edit mode
- **Current behavior:** Toggles `isEditing` state locally but **does not persist changes**; no API call
- **Intended behavior:** `PATCH /api/engagements/:id/brief` to save the edited brief text
- **Why it matters:** Editing the brief is how consultants refine AI-extracted content; without persistence this is useless
- **Type:** `hardcoded-data`

### BriefReview.tsx — Add More Files Button
- **Location:** Source Files section, bottom
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Open file upload dialog to add more supporting documents
- **Why it matters:** Users often realize they missed files during the review step
- **Type:** `no-handler`

### BriefReview.tsx — Preview Link (per file)
- **Location:** Source Files section, file list
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Open file preview modal
- **Why it matters:** Users need to verify file content before proceeding to generation
- **Type:** `no-handler`

### BriefReview.tsx — Uploaded Files List (Hardcoded)
- **Location:** Source Files section
- **Current behavior:** Always shows 2 hardcoded files (`RFP_Northstar_Saudi_Expansion.pdf`, `Client_Email_Chain.docx`)
- **Intended behavior:** Display files actually uploaded by the user during the New Engagement flow
- **Why it matters:** Users need to see and confirm their real uploads
- **Type:** `hardcoded-data`

### BriefReview.tsx — Parsing Summary Stats (Hardcoded)
- **Location:** Parsing Summary section
- **Current behavior:** Fixed numbers: 16 pages, 8 sections, etc.
- **Intended behavior:** Show actual extraction stats from the file parsing backend
- **Why it matters:** Users rely on these stats to trust the AI-extracted brief
- **Type:** `hardcoded-data`

---

## 7. New Engagement Flow

### NewEngagement.tsx — Save Draft Button
- **Location:** Actions section, bottom left
- **Current behavior:** Navigates to `/dashboard` but **discards all form data**
- **Intended behavior:** Save form state to the database as a draft engagement for later resumption
- **Why it matters:** Users filling out complex briefs need to be able to step away and come back
- **Type:** `no-handler`

### NewEngagement.tsx — File Drop Zone (Click to Browse)
- **Location:** Upload Files section
- **Current behavior:** Drag-and-drop works, but the "click to browse" text implies the zone is clickable — it is not
- **Intended behavior:** Clicking anywhere in the drop zone should open a native file picker
- **Why it matters:** Most users expect click-to-upload; drag-drop-only breaks mobile and non-technical users
- **Type:** `hardcoded-data`

---

## 8. Matched Cases Tab

### MatchedCasesTab.tsx — Sort Dropdown
- **Location:** Matched cases summary strip
- **Current behavior:** `onChange` updates local state but **no sorting is applied** to the list
- **Intended behavior:** Re-order matched cases by the selected criterion (confidence, relevance, etc.)
- **Why it matters:** Users with many matched cases need to find the most relevant ones quickly
- **Type:** `hardcoded-data`

### MatchedCasesTab.tsx — Continue with Brief Only Button (Empty State)
- **Location:** Empty state when no matches are found
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Skip case matching and proceed to artifact generation with brief only
- **Why it matters:** New users with no vault content have no path forward
- **Type:** `no-handler`

### MatchPreviewModal.tsx — All Modal Content (Hardcoded)
- **Location:** Case preview panel
- **Current behavior:** Displays hardcoded 2024 Saudi retail engagement data regardless of which case is selected
- **Intended behavior:** Render actual case data passed from the parent (file title, rationale, reusable elements)
- **Why it matters:** The preview is the key decision surface for including/excluding cases
- **Type:** `hardcoded-data`

---

## 9. Artifact Tabs — Hardcoded Content

### ProposalStarterTab.tsx — Proposal Content
- **Location:** All sections (Problem Statement, Objectives, Approach, etc.)
- **Current behavior:** Always displays fixture content for the Saudi Arabia retail case
- **Intended behavior:** Render AI-generated proposal content specific to the current engagement
- **Why it matters:** Every engagement is unique; showing another client's proposal is misleading and potentially a data leak
- **Type:** `hardcoded-data`

### IssueTreeTab.tsx — Issue Tree Structure
- **Location:** Root question, branches, sub-questions
- **Current behavior:** Always shows the Saudi Arabia market entry template tree
- **Intended behavior:** Render the dynamically generated issue tree for the current engagement
- **Why it matters:** Same as above — the tree must reflect the actual problem framing
- **Type:** `hardcoded-data`

### WorkplanTab.tsx — Workplan Phases
- **Location:** Phases 1–4, workstreams, milestones
- **Current behavior:** Always shows the Saudi Arabia retail 12-week expansion plan
- **Intended behavior:** Render the dynamically generated workplan for the current engagement
- **Why it matters:** Timelines, phases, and milestones are engagement-specific deliverables
- **Type:** `hardcoded-data`

---

## 10. Billing Page

### BillingPage.tsx — Manage Billing Button
- **Location:** Current Plan section, bottom
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Open Stripe Billing Portal or navigate to a payment method management page
- **Why it matters:** Owners must be able to update payment info when cards expire
- **Type:** `no-handler`

### BillingPage.tsx — Download Invoice Button (per invoice)
- **Location:** Recent Billing section, per row
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Download PDF invoice from the billing provider (Stripe)
- **Why it matters:** Finance teams require invoice PDFs for expense reporting and audits
- **Type:** `no-handler`

### BillingPage.tsx — Contact Sales Link (Enterprise Plan)
- **Location:** Plan Comparison, Enterprise card CTA
- **Current behavior:** `mailto:enterprise@aicopilot.com` (raw mailto, no context)
- **Intended behavior:** Open an in-app contact/demo scheduling form with pre-filled context
- **Why it matters:** A cold mailto creates friction; a guided form improves conversion
- **Type:** `no-handler`

---

## 11. Upgrade Modal

### UpgradeModal.tsx — Update Payment Method Link
- **Location:** Payment Method section
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Open Stripe portal or payment method editor
- **Why it matters:** Users can't complete an upgrade if their payment method is expired
- **Type:** `no-handler`

### UpgradeModal.tsx — Book a Demo Link (Enterprise)
- **Location:** Enterprise contact info
- **Current behavior:** `href="#"` — broken link
- **Intended behavior:** Open Calendly or equivalent scheduling tool
- **Why it matters:** Enterprise sales are conversation-driven; a broken link kills the conversion
- **Type:** `no-handler`

---

## 12. Usage Page

### UsagePage.tsx — Upgrade to Increase Limit Button
- **Location:** Limit Tracking section, near-limit metric rows
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Navigate to `/billing` or open the Upgrade Modal
- **Why it matters:** The moment a user hits a limit is the highest-intent upgrade opportunity
- **Type:** `no-handler`

### LimitHitModal.tsx — Hardcoded Values
- **Location:** Usage page
- **Current behavior:** Modal is rendered with hardcoded `limitType`, `used`, `limit`, `resetDate`
- **Intended behavior:** Pass actual usage metric values from the bootstrap data
- **Why it matters:** Users need to see the real numbers that triggered the modal
- **Type:** `hardcoded-data`

---

## 13. Organization & Settings

### OrganizationSettings.tsx — Delete Workspace Button
- **Location:** Workspace Deletion section (owner-only)
- **Current behavior:** No `onClick` handler
- **Intended behavior:** Open a confirmation modal, then call a delete workspace API endpoint
- **Why it matters:** Owners need to be able to clean up test or abandoned workspaces
- **Type:** `no-handler`

### MembersAndInvites.tsx — Member More Options Menu (⋮)
- **Location:** Member list, per non-owner member row
- **Current behavior:** Button renders but code comment reads `"Dropdown would appear here"` — no dropdown is implemented
- **Intended behavior:** Open a dropdown with `Change Role` and `Remove Member` actions
- **Why it matters:** Role changes and removals are frequent admin tasks; hiding them behind a missing dropdown blocks team management
- **Type:** `no-handler`

---

## 14. Support Settings

### SupportSettings.tsx — Start Chat Button
- **Location:** In-App Chat section
- **Current behavior:** No `onClick` handler, no chat widget integrated
- **Intended behavior:** Open a live chat widget (e.g., Intercom, Crisp, or similar) connected to the support team
- **Why it matters:** Live chat is the primary support channel for SaaS tools; without it users have no real-time help
- **Type:** `no-handler`

### SupportSettings.tsx — Help Topic Links (4 items)
- **Location:** Help Resources section
- **Current behavior:** All 4 links use `href="#"` — broken
- **Intended behavior:** Navigate to relevant help documentation pages
- **Why it matters:** Self-service docs reduce support load; broken links erode trust
- **Type:** `no-handler`

---

## 15. Deletion Settings

### DeletionSettings.tsx — Recent Uploads List (Hardcoded)
- **Location:** Delete Uploads section
- **Current behavior:** Always shows 3 hardcoded sample files
- **Intended behavior:** Fetch and display the user's actual recent uploads from the API
- **Why it matters:** Users deleting data need to see their real files, not placeholders
- **Type:** `hardcoded-data`

### DeletionSettings.tsx — Recent Artifacts List (Hardcoded)
- **Location:** Delete Artifacts section
- **Current behavior:** Always shows 3 hardcoded sample artifacts
- **Intended behavior:** Fetch and display the user's actual generated artifacts from the API
- **Why it matters:** Same — deletion UX must show real data
- **Type:** `hardcoded-data`

### DeleteUploadModal.tsx / DeleteArtifactModal.tsx / DeleteWorkspaceModal.tsx — Hardcoded Names
- **Location:** Respective confirmation modals
- **Current behavior:** Modal content uses hardcoded `uploadName`, `artifactName`, `workspaceName` props rather than dynamically selected items
- **Intended behavior:** Pass the actual selected item's name and ID from the parent component; wire delete button to an API call
- **Why it matters:** Confirmation modals that delete the wrong thing (or nothing) are a critical UX and data integrity failure
- **Type:** `hardcoded-data`

---

## Priority Summary

| Priority | Items | Reason |
|----------|-------|--------|
| **P0 — Breaks core workflow** | Save buttons (3), Edit Brief save, Export DOCX/PDF, Re-run Matching | Data loss or unusable primary features |
| **P1 — Hardcoded content** | ProposalStarter / IssueTree / WorkplanTab content, MatchPreviewModal, VersionHistory | Every engagement shows wrong data |
| **P2 — Missing actions** | Member menu, File preview, Add source file, Delete workspace | Admin and content management blocked |
| **P3 — Broken links / polish** | Help topics, Book a demo, Copy to clipboard, Sort dropdown | Trust and discoverability issues |
