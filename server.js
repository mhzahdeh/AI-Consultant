import { createServer } from "node:http";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import {
  buildIssueTreeArtifactContent as buildIssueTreeArtifactContentModule,
  buildProposalArtifactContent as buildProposalArtifactContentModule,
  buildProposalProvenanceForRegeneration,
  regenerateProposalSection as regenerateProposalSectionModule,
  buildWorkplanArtifactContent as buildWorkplanArtifactContentModule,
} from "./server/artifacts.js";
import {
  buildContextualMatchedCases,
  buildSelectedMatchedCases,
  buildVaultOverview,
  listVaultCases,
  promoteEngagementToVaultCase,
  syncVaultCaseSeed,
  updateVaultCaseFeedback,
} from "./server/vault.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "app.db");
const LEGACY_DB_PATH = path.join(DATA_DIR, "db.json");
const VAULT_CASE_SEED_PATH = path.join(DATA_DIR, "vault_cases.seed.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const PORT = Number(process.env.PORT || 3001);
const SESSION_COOKIE = "aic_session";
const SESSION_TTL_DAYS = 14;
const DEMO_PASSWORD = "ChangeMe123!";

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(UPLOADS_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");

initializeDatabase();
syncVaultCaseSeed({ db, seedPath: VAULT_CASE_SEED_PATH, isoNow, runTransaction });
seedDatabaseIfEmpty();
backfillArtifactProvenance();

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS id_counters (
      name TEXT PRIMARY KEY,
      value INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      plan TEXT NOT NULL,
      use_case TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memberships (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      joined_at TEXT,
      invited_at TEXT,
      invited_by_user_id TEXT,
      UNIQUE(user_id, organization_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      active_organization_id TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (active_organization_id) REFERENCES organizations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS invites (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      invited_by_user_id TEXT NOT NULL,
      status TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      accepted_at TEXT,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS engagements (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      title TEXT NOT NULL,
      client TEXT NOT NULL,
      problem_type TEXT NOT NULL,
      status TEXT NOT NULL,
      objective TEXT NOT NULL,
      notes TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS uploads (
      id TEXT PRIMARY KEY,
      engagement_id TEXT NOT NULL,
      organization_id TEXT NOT NULL,
      name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      extension TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      status TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      extracted_text TEXT,
      page_count INTEGER,
      uploaded_at TEXT NOT NULL,
      processed_at TEXT,
      error_message TEXT,
      FOREIGN KEY (engagement_id) REFERENCES engagements(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS matched_cases (
      id TEXT PRIMARY KEY,
      engagement_id TEXT NOT NULL,
      file_title TEXT NOT NULL,
      engagement_title TEXT NOT NULL,
      confidence INTEGER NOT NULL,
      confidence_label TEXT NOT NULL,
      rationale TEXT NOT NULL,
      match_signals_json TEXT NOT NULL DEFAULT '[]',
      reasoning_points_json TEXT NOT NULL DEFAULT '[]',
      quality_score INTEGER NOT NULL DEFAULT 0,
      reusable_elements_json TEXT NOT NULL,
      included INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (engagement_id) REFERENCES engagements(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vault_cases (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      client_name TEXT NOT NULL,
      source_firm TEXT NOT NULL,
      source_url TEXT NOT NULL,
      industry TEXT NOT NULL,
      business_function TEXT NOT NULL,
      problem_type TEXT NOT NULL,
      capability TEXT NOT NULL,
      summary TEXT NOT NULL,
      outcomes_json TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      region TEXT NOT NULL,
      year INTEGER,
      evidence_strength INTEGER NOT NULL DEFAULT 3,
      review_status TEXT NOT NULL DEFAULT 'approved',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS artifacts (
      id TEXT PRIMARY KEY,
      engagement_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      title TEXT NOT NULL,
      generated_from INTEGER NOT NULL DEFAULT 0,
      content_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(engagement_id, kind),
      FOREIGN KEY (engagement_id) REFERENCES engagements(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS engagement_versions (
      id TEXT PRIMARY KEY,
      engagement_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      source TEXT NOT NULL,
      description TEXT NOT NULL,
      snapshot_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      created_by_user_id TEXT NOT NULL,
      FOREIGN KEY (engagement_id) REFERENCES engagements(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      organization_id TEXT,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  ensureMatchedCaseColumns();
  ensureVaultCaseFeedbackColumns();
}

function ensureMatchedCaseColumns() {
  const columns = new Set(
    db.prepare(`PRAGMA table_info(matched_cases)`).all().map((column) => column.name)
  );
  if (!columns.has("match_signals_json")) {
    db.exec(`ALTER TABLE matched_cases ADD COLUMN match_signals_json TEXT NOT NULL DEFAULT '[]'`);
  }
  if (!columns.has("reasoning_points_json")) {
    db.exec(`ALTER TABLE matched_cases ADD COLUMN reasoning_points_json TEXT NOT NULL DEFAULT '[]'`);
  }
  if (!columns.has("quality_score")) {
    db.exec(`ALTER TABLE matched_cases ADD COLUMN quality_score INTEGER NOT NULL DEFAULT 0`);
  }
}

function ensureVaultCaseFeedbackColumns() {
  const columns = new Set(
    db.prepare(`PRAGMA table_info(vault_cases)`).all().map((column) => column.name)
  );
  if (!columns.has("is_favorite")) {
    db.exec(`ALTER TABLE vault_cases ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0`);
  }
  if (!columns.has("is_hidden")) {
    db.exec(`ALTER TABLE vault_cases ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0`);
  }
  if (!columns.has("use_again_count")) {
    db.exec(`ALTER TABLE vault_cases ADD COLUMN use_again_count INTEGER NOT NULL DEFAULT 0`);
  }
  if (!columns.has("is_internal")) {
    db.exec(`ALTER TABLE vault_cases ADD COLUMN is_internal INTEGER NOT NULL DEFAULT 0`);
  }
  if (!columns.has("linked_engagement_id")) {
    db.exec(`ALTER TABLE vault_cases ADD COLUMN linked_engagement_id TEXT`);
  }
  if (!columns.has("owner_organization_id")) {
    db.exec(`ALTER TABLE vault_cases ADD COLUMN owner_organization_id TEXT`);
  }
}

function seedDatabaseIfEmpty() {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (userCount > 0) return;

  const legacy = existsSync(LEGACY_DB_PATH)
    ? JSON.parse(readFileSync(LEGACY_DB_PATH, "utf8"))
    : null;

  const now = isoNow();
  const ownerUserId = nextId("usr");
  const orgId = nextId("org");
  const ownerName = legacy?.user?.fullName || "Sarah Chen";
  const ownerEmail = legacy?.user?.email || "sarah@northstar-advisory.com";
  const organizationName = legacy?.organization?.name || "Northstar Advisory";
  const organizationPlan = legacy?.organization?.plan || "Team";

  runTransaction(() => {
    db.prepare(
      `INSERT INTO users (id, full_name, email, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(ownerUserId, ownerName, ownerEmail, hashPassword(DEMO_PASSWORD), now);

    db.prepare(
      `INSERT INTO organizations (id, name, slug, plan, use_case, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(orgId, organizationName, slugify(organizationName), organizationPlan, "boutique", now);

    db.prepare(
      `INSERT INTO memberships (id, user_id, organization_id, role, status, joined_at, invited_at, invited_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(nextId("mem"), ownerUserId, orgId, "owner", "active", now, now, ownerUserId);

    if (legacy) {
      migrateLegacyOrganization(legacy, orgId, ownerUserId);
    } else {
      seedSampleWorkspace(orgId, ownerUserId);
    }
  });
}

function loadVaultCaseSeed() {
  if (!existsSync(VAULT_CASE_SEED_PATH)) return [];
  const parsed = JSON.parse(readFileSync(VAULT_CASE_SEED_PATH, "utf8"));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.cases)) return parsed.cases;
  return [];
}

function syncVaultCaseSeedLegacyStub() {}

function migrateLegacyOrganization(legacy, organizationId, ownerUserId) {
  const members = Array.isArray(legacy.members) ? legacy.members : [];
  const engagements = Array.isArray(legacy.engagements) ? legacy.engagements : [];

  for (const member of members) {
    if (member.email === legacy.user?.email) continue;
    const userId = nextId("usr");
    const createdAt = isoNow();
    db.prepare(
      `INSERT INTO users (id, full_name, email, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(
      userId,
      member.name || member.email.split("@")[0],
      member.email,
      hashPassword(DEMO_PASSWORD),
      createdAt
    );
    db.prepare(
      `INSERT INTO memberships (id, user_id, organization_id, role, status, joined_at, invited_at, invited_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      nextId("mem"),
      userId,
      organizationId,
      normalizeRole(member.role),
      member.status === "active" ? "active" : "invited",
      member.status === "active" ? createdAt : null,
      createdAt,
      ownerUserId
    );
  }

  for (const engagement of engagements) {
    createEngagementRecord({
      organizationId,
      actorUserId: ownerUserId,
      title: engagement.title,
      client: engagement.client,
      problemType: engagement.problemType,
      brief: engagement.brief || "",
      notes: engagement.notes || "",
      uploads: [],
      objective: engagement.objective || "",
      progress: engagement.progress || 18,
      status: engagement.status || "Draft",
      matchedCases: engagement.matchedCases || seedMatchedCases(engagement.problemType || "Strategy"),
      artifactSeed: buildLegacyArtifactSeed(engagement),
      migrateUploads: engagement.uploads || [],
      seedVersions: engagement.workspace?.versions || [],
      useTransaction: false,
    });
  }

  if (!engagements.length) {
    seedSampleWorkspace(organizationId, ownerUserId);
  }
}

function seedSampleWorkspace(organizationId, ownerUserId) {
  createEngagementRecord({
    organizationId,
    actorUserId: ownerUserId,
    title: "EMEA Market Entry - Consumer Hardware",
    client: "Northstar Retail",
    problemType: "Market Entry",
    brief:
      "Evaluate market opportunity and define go-to-market approach for Saudi Arabia, UAE, and Egypt. Assess TAM, competitive dynamics, entry options, investment requirements, and 12-week execution roadmap.",
    notes: "Board wants a recommendation memo and executive presentation.",
    uploads: [],
    objective:
      "Evaluate market opportunity and define go-to-market approach for Saudi Arabia, UAE, and Egypt.",
    progress: 62,
    status: "In Progress",
    matchedCases: seedMatchedCases("Market Entry"),
    useTransaction: false,
  });
  createEngagementRecord({
    organizationId,
    actorUserId: ownerUserId,
    title: "SaaS Pricing Model Redesign",
    client: "Nimbus Analytics",
    problemType: "Pricing Strategy",
    brief:
      "Transition from seat-based to usage-based pricing while preserving ARR. Rework package architecture, target segments, migration risks, and commercial launch plan.",
    notes: "",
    uploads: [],
    objective: "Transition from seat-based to usage-based pricing with value metric analysis.",
    progress: 31,
    status: "Draft",
    matchedCases: seedMatchedCases("Pricing Strategy"),
    useTransaction: false,
  });
}

function buildLegacyArtifactSeed(engagement) {
  const workspace = engagement.workspace || {};
  return {
    brief: {
      title: "Canonical Brief",
      generatedFrom: 0,
      content: buildBriefArtifactContent(engagement.brief || ""),
    },
    proposal: {
      title: workspace.proposalStarter?.title || `${engagement.title} - Proposal Starter`,
      generatedFrom: workspace.proposalStarter?.generatedFrom || 0,
        content: buildProposalArtifactContentModule(engagement),
    },
    issueTree: {
      title: workspace.issueTree?.title || `${engagement.title} - Issue Tree`,
      generatedFrom: 0,
        content: buildIssueTreeArtifactContentModule(engagement),
    },
    workplan: {
      title: workspace.workplan?.title || `${engagement.title} - 12 Week Workplan`,
      generatedFrom: 0,
        content: buildWorkplanArtifactContentModule(engagement),
    },
  };
}

function json(res, statusCode, payload, options = {}) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "http://127.0.0.1:5173",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...(options.headers || {}),
  };
  if (options.cookie) headers["Set-Cookie"] = options.cookie;
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(payload));
}

function parseCookies(headerValue) {
  if (!headerValue) return {};
  return Object.fromEntries(
    headerValue.split(";").map((chunk) => {
      const [name, ...rest] = chunk.trim().split("=");
      return [name, decodeURIComponent(rest.join("=") || "")];
    })
  );
}

async function parseBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function isoNow() {
  return new Date().toISOString();
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function relativeTimeFrom(dateValue) {
  const diffMs = Date.now() - new Date(dateValue).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function runTransaction(fn) {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function nextId(prefix) {
  const current = db.prepare("SELECT value FROM id_counters WHERE name = ?").get(prefix);
  const nextValue = (current?.value || 0) + 1;
  db.prepare(
    `INSERT INTO id_counters (name, value) VALUES (?, ?)
     ON CONFLICT(name) DO UPDATE SET value = excluded.value`
  ).run(prefix, nextValue);
  return `${prefix}_${String(nextValue).padStart(6, "0")}`;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, originalHash] = String(stored || "").split(":");
  if (!salt || !originalHash) return false;
  const candidate = scryptSync(password, salt, 64);
  const original = Buffer.from(originalHash, "hex");
  return candidate.length === original.length && timingSafeEqual(candidate, original);
}

function sessionCookie(sessionId, expiresAt) {
  const expires = new Date(expiresAt).toUTCString();
  return `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function normalizeRole(role) {
  const allowed = new Set(["owner", "admin", "editor", "viewer", "billing"]);
  return allowed.has(role) ? role : "viewer";
}

function createAuditLog({ organizationId, userId, action, entityType, entityId, details }) {
  db.prepare(
    `INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, details_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(nextId("aud"), organizationId || null, userId || null, action, entityType, entityId, JSON.stringify(details || {}), isoNow());
}

function getSessionFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies[SESSION_COOKIE];
  if (!sessionId) return null;
  const session = db.prepare(
    `SELECT s.*, u.full_name, u.email
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = ?`
  ).get(sessionId);
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
    return null;
  }
  return session;
}

function requireSession(req, res) {
  const session = getSessionFromRequest(req);
  if (!session) {
    json(res, 401, { error: "Authentication required" });
    return null;
  }
  return session;
}

function getMembership(userId, organizationId) {
  return db.prepare(
    `SELECT m.*, o.name AS organization_name, o.slug AS organization_slug, o.plan AS organization_plan
     FROM memberships m
     JOIN organizations o ON o.id = m.organization_id
     WHERE m.user_id = ? AND m.organization_id = ?`
  ).get(userId, organizationId);
}

function requireOrganizationContext(req, res) {
  const session = requireSession(req, res);
  if (!session) return null;
  const memberships = listOrganizationsForUser(session.user_id);
  const activeOrganizationId = session.active_organization_id || memberships[0]?.id || null;
  if (!activeOrganizationId) {
    json(res, 409, { error: "No organization selected" });
    return null;
  }
  const membership = getMembership(session.user_id, activeOrganizationId);
  if (!membership || membership.status !== "active") {
    json(res, 403, { error: "You do not have access to this organization" });
    return null;
  }
  if (session.active_organization_id !== activeOrganizationId) {
    db.prepare("UPDATE sessions SET active_organization_id = ? WHERE id = ?").run(activeOrganizationId, session.id);
  }
  return { session: { ...session, active_organization_id: activeOrganizationId }, membership };
}

function requireRole(res, membership, roles) {
  if (!roles.includes(membership.role)) {
    json(res, 403, { error: "You do not have permission for this action" });
    return false;
  }
  return true;
}

function listOrganizationsForUser(userId) {
  return db.prepare(
    `SELECT o.id, o.name, o.slug, o.plan, m.role, m.status,
            (SELECT COUNT(*) FROM memberships mm WHERE mm.organization_id = o.id AND mm.status = 'active') AS member_count
     FROM memberships m
     JOIN organizations o ON o.id = m.organization_id
     WHERE m.user_id = ?
     ORDER BY o.created_at ASC`
  ).all(userId);
}

function buildSessionPayload(session) {
  const organizations = listOrganizationsForUser(session.user_id).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    plan: row.plan,
    role: row.role,
    status: row.status,
    memberCount: row.member_count,
    isActive: row.id === session.active_organization_id,
  }));
  const active = organizations.find((item) => item.id === session.active_organization_id) || organizations[0] || null;
  return {
    authenticated: true,
    user: {
      id: session.user_id,
      fullName: session.full_name,
      email: session.email,
    },
    organizations,
    activeOrganizationId: active?.id || null,
    activeRole: active?.role || null,
    bootstrapReady: Boolean(active),
  };
}

function buildPublicSessionPayload() {
  return {
    authenticated: false,
    user: null,
    organizations: [],
    activeOrganizationId: null,
    activeRole: null,
    bootstrapReady: false,
    onboarding: {
      seededOwnerEmail: "sarah@northstar-advisory.com",
      seededOwnerPassword: DEMO_PASSWORD,
    },
  };
}

function buildBootstrap(organizationId, userId) {
  const organization = db.prepare(
    `SELECT o.*,
            (SELECT COUNT(*) FROM memberships m WHERE m.organization_id = o.id AND m.status = 'active') AS members_count,
            (SELECT COUNT(*) FROM invites i WHERE i.organization_id = o.id AND i.status = 'pending') AS invites_count
     FROM organizations o
     WHERE o.id = ?`
  ).get(organizationId);
  const membership = getMembership(userId, organizationId);
  const engagements = db.prepare(
    `SELECT * FROM engagements
     WHERE organization_id = ?
     ORDER BY updated_at DESC`
  ).all(organizationId);
  const totalDocs = db.prepare(
    `SELECT COUNT(*) AS count
     FROM uploads
     WHERE organization_id = ?`
  ).get(organizationId).count;
  const recentlyAdded = db.prepare(
    `SELECT name
     FROM uploads
     WHERE organization_id = ?
     ORDER BY uploaded_at DESC
     LIMIT 3`
  ).all(organizationId).map((row) => row.name);
  const activeMembers = listMembersForOrganization(organizationId);
  const usageSummary = buildUsageSummary(organizationId);
  return {
    user: {
      id: userId,
      fullName: db.prepare("SELECT full_name FROM users WHERE id = ?").get(userId).full_name,
      email: db.prepare("SELECT email FROM users WHERE id = ?").get(userId).email,
      role: membership.role,
    },
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      plan: organization.plan,
      created: formatDateLabel(organization.created_at),
      owner: activeMembers.find((member) => member.role === "owner")?.name || "",
      ownerEmail: activeMembers.find((member) => member.role === "owner")?.email || "",
      membersCount: organization.members_count,
      invitesCount: organization.invites_count,
    },
    dashboard: {
      engagements: engagements.map((engagement) => toDashboardEngagement(engagement)),
      vault: {
        totalDocuments: totalDocs,
        recentlyAdded,
      },
    },
    usage: usageSummary,
    billing: buildBilling(organizationId),
    members: buildMembersPayload(organizationId),
    settings: {
      privacyContact: "privacy@aiconsultant.local",
      supportEmail: "support@aiconsultant.local",
      enterpriseEmail: "enterprise@aiconsultant.local",
    },
  };
}

function buildBilling(organizationId) {
  const organization = db.prepare("SELECT plan FROM organizations WHERE id = ?").get(organizationId);
  const seatsUsed = db.prepare(
    `SELECT COUNT(*) AS count FROM memberships WHERE organization_id = ? AND status = 'active'`
  ).get(organizationId).count;
  const plans = [
    {
      name: "Starter",
      price: 0,
      interval: "month",
      description: "For individuals validating the workflow",
      seats: 1,
      features: [
        { label: "Seats", value: "1" },
        { label: "Uploads", value: "100 / month" },
        { label: "Generations", value: "500 / month" },
      ],
    },
    {
      name: "Solo",
      price: 49,
      interval: "month",
      description: "Single consultant, unlimited projects",
      seats: 1,
      features: [
        { label: "Seats", value: "1" },
        { label: "Uploads", value: "500 / month" },
        { label: "Generations", value: "2,000 / month" },
      ],
    },
    {
      name: "Team",
      price: 149,
      interval: "month",
      description: "Boutique team workspace",
      seats: 10,
      features: [
        { label: "Seats", value: "Up to 10" },
        { label: "Uploads", value: "1,500 / month" },
        { label: "Generations", value: "7,500 / month" },
      ],
    },
    {
      name: "Enterprise",
      price: null,
      interval: "month",
      description: "Custom governance and scale",
      seats: null,
      features: [
        { label: "Seats", value: "Unlimited" },
        { label: "Uploads", value: "Custom" },
        { label: "Governance", value: "Custom controls" },
      ],
    },
  ];
  const current = plans.find((plan) => plan.name === organization.plan) || plans[2];
  return {
    hasPaymentIssue: false,
    currentPlan: {
      name: current.name,
      price: current.price,
      interval: current.interval,
      renewalDate: "May 21, 2026",
      status: "Active",
      seats: current.seats,
      seatsUsed,
    },
    paymentMethod: "Demo billing profile",
    plans,
  };
}

function buildUsageSummary(organizationId) {
  const engagementCount = db.prepare(
    `SELECT COUNT(*) AS count FROM engagements WHERE organization_id = ?`
  ).get(organizationId).count;
  const uploadCount = db.prepare(
    `SELECT COUNT(*) AS count FROM uploads WHERE organization_id = ?`
  ).get(organizationId).count;
  const generationCount = db.prepare(
    `SELECT COUNT(*) AS count FROM audit_logs
     WHERE organization_id = ? AND action IN ('artifact.regenerated', 'engagement.created')`
  ).get(organizationId).count;
  const exportCount = db.prepare(
    `SELECT COUNT(*) AS count FROM audit_logs
     WHERE organization_id = ? AND action = 'artifact.exported'`
  ).get(organizationId).count;
  const recentActivity = db.prepare(
    `SELECT a.*, u.full_name
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.organization_id = ?
     ORDER BY a.created_at DESC
     LIMIT 10`
  ).all(organizationId).map((row) => ({
    id: row.id,
    action: humanizeAuditAction(row.action),
    engagement: row.details_json ? JSON.parse(row.details_json).engagementTitle || "Workspace" : "Workspace",
    user: row.full_name || "System",
    timestamp: relativeTimeFrom(row.created_at),
  }));

  const summary = [
    { label: "Active Projects", used: engagementCount, limit: "Unlimited", icon: "folder" },
    { label: "Reference Docs", used: uploadCount, limit: 1000, icon: "database" },
    { label: "Generations", used: generationCount, limit: 5000, icon: "sparkles" },
    { label: "Exports", used: exportCount, limit: 500, icon: "download" },
  ];

  return {
    billingPeriod: "April 1, 2026 - April 30, 2026",
    summary,
    metrics: summary.map((item) => ({
      category: item.label,
      used: item.used,
      limit: item.limit,
      unit: typeof item.limit === "number" ? "items" : undefined,
      percentage: typeof item.limit === "number" && item.limit > 0 ? Math.min(100, Math.round((item.used / item.limit) * 100)) : 0,
      resetDate: "May 1, 2026",
      isNearLimit: typeof item.limit === "number" ? item.used / item.limit >= 0.8 : false,
      isAtLimit: typeof item.limit === "number" ? item.used >= item.limit : false,
      icon: item.icon,
    })),
    recentActivity,
  };
}

function buildMembersPayload(organizationId) {
  const members = listMembersForOrganization(organizationId);
  const invites = db.prepare(
    `SELECT i.*, u.full_name AS invited_by_name
     FROM invites i
     JOIN users u ON u.id = i.invited_by_user_id
     WHERE i.organization_id = ? AND i.status = 'pending'
     ORDER BY i.created_at DESC`
  ).all(organizationId);
  return [
    ...members,
    ...invites.map((invite) => ({
      id: invite.id,
      name: invite.email.split("@")[0].replace(/[._-]/g, " "),
      email: invite.email,
      role: invite.role,
      status: "invited",
      invitedAt: relativeTimeFrom(invite.created_at),
      joinedAt: undefined,
    })),
  ];
}

function listMembersForOrganization(organizationId) {
  return db.prepare(
    `SELECT m.id, u.full_name AS name, u.email, m.role, m.status, m.joined_at, m.invited_at
     FROM memberships m
     JOIN users u ON u.id = m.user_id
     WHERE m.organization_id = ?
     ORDER BY CASE m.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, u.full_name ASC`
  ).all(organizationId).map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status,
    joinedAt: member.joined_at ? relativeTimeFrom(member.joined_at) : undefined,
    invitedAt: member.invited_at ? relativeTimeFrom(member.invited_at) : undefined,
  }));
}

function toDashboardEngagement(engagement) {
  const outputs = db.prepare(
    `SELECT kind FROM artifacts WHERE engagement_id = ? ORDER BY kind`
  ).all(engagement.id).map((row) => artifactLabel(row.kind));
  return {
    id: engagement.id,
    title: engagement.title,
    client: engagement.client,
    problemType: engagement.problem_type,
    status: engagement.status,
    lastUpdated: relativeTimeFrom(engagement.updated_at),
    progress: engagement.progress,
    objective: engagement.objective,
    outputs,
  };
}

// Vault retrieval, ranking, and seed synchronization live in ./server/vault.js.

function artifactLabel(kind) {
  return {
    brief: "Brief",
    proposal: "Proposal Starter",
    issue_tree: "Issue Tree",
    workplan: "Workplan",
  }[kind] || kind;
}

function getEngagementForUser(engagementId, userId) {
  const row = db.prepare(
    `SELECT e.*
     FROM engagements e
     JOIN memberships m ON m.organization_id = e.organization_id
     WHERE e.id = ? AND m.user_id = ? AND m.status = 'active'`
  ).get(engagementId, userId);
  return row || null;
}

function serializeEngagement(engagementId) {
  const engagement = db.prepare("SELECT * FROM engagements WHERE id = ?").get(engagementId);
  if (!engagement) return null;
  const uploads = db.prepare(
    `SELECT * FROM uploads WHERE engagement_id = ? ORDER BY uploaded_at ASC`
  ).all(engagementId).map((upload) => ({
    id: upload.id,
    name: upload.name,
    size: formatBytes(upload.size_bytes),
    type: upload.extension.toUpperCase(),
    mimeType: upload.mime_type,
    status: upload.status,
    uploadedAt: relativeTimeFrom(upload.uploaded_at),
    uploadedAtIso: upload.uploaded_at,
    pages: upload.page_count || undefined,
    extractedText: upload.extracted_text || "",
    error: upload.error_message || null,
  }));
  const matchedCases = db.prepare(
    `SELECT * FROM matched_cases WHERE engagement_id = ? ORDER BY confidence DESC`
  ).all(engagementId).map((row) => ({
    id: row.id,
    fileTitle: row.file_title,
    engagementTitle: row.engagement_title,
    confidence: row.confidence,
    confidenceLabel: row.confidence_label,
    rationale: row.rationale,
    matchSignals: JSON.parse(row.match_signals_json || "[]"),
    reasoningPoints: JSON.parse(row.reasoning_points_json || "[]"),
    qualityScore: Number(row.quality_score || 0),
    reusableElements: JSON.parse(row.reusable_elements_json),
    included: Boolean(row.included),
  }));
  const artifacts = Object.fromEntries(
    db.prepare(`SELECT * FROM artifacts WHERE engagement_id = ?`).all(engagementId).map((artifact) => [
      artifact.kind,
      {
        id: artifact.id,
        title: artifact.title,
        generatedFrom: artifact.generated_from,
        content: JSON.parse(artifact.content_json),
        updatedAt: artifact.updated_at,
      },
    ])
  );
  const versions = db.prepare(
    `SELECT * FROM engagement_versions WHERE engagement_id = ? ORDER BY version_number DESC`
  ).all(engagementId).map((version) => ({
    id: version.id,
    number: version.version_number,
    timestamp: relativeTimeFrom(version.created_at),
    createdAt: version.created_at,
    source: version.source,
    description: version.description,
  }));
  const latestVersionId = versions[0]?.id || null;
  const sourceText = uploads
    .filter((upload) => upload.extractedText)
    .map((upload) => ({
      id: `${upload.id}_src`,
      source: upload.name,
      content: upload.extractedText,
    }));

  return {
    id: engagement.id,
    title: engagement.title,
    client: engagement.client,
    problemType: engagement.problem_type,
    status: engagement.status,
    lastUpdated: relativeTimeFrom(engagement.updated_at),
    createdAt: engagement.created_at,
    objective: engagement.objective,
    progress: engagement.progress,
    outputs: Object.keys(artifacts).map((kind) => artifactLabel(kind)),
    brief: artifacts.brief?.content?.text || "",
    notes: engagement.notes,
    uploads,
    matchedCases,
    workspace: {
      lastSaved: relativeTimeFrom((versions[0]?.createdAt) || engagement.updated_at),
      currentVersionId: latestVersionId,
      versions,
      sourceText: sourceText.length ? sourceText : [{
        id: `${engagement.id}_brief`,
        source: "Canonical Brief",
        content: artifacts.brief?.content?.text || "",
      }],
      proposalStarter: artifacts.proposal || {
        id: "",
        title: `${engagement.title} - Proposal Starter`,
        generatedFrom: matchedCases.filter((item) => item.included).length,
        content: buildProposalArtifactContentModule({
          title: engagement.title,
          client: engagement.client,
          brief: artifacts.brief?.content?.text || "",
          problemType: engagement.problem_type,
          matchedCases,
          uploads,
        }),
      },
      issueTree: artifacts.issue_tree || {
        id: "",
        title: `${engagement.title} - Issue Tree`,
        generatedFrom: 0,
        content: buildIssueTreeArtifactContentModule({
          title: engagement.title,
          client: engagement.client,
          brief: artifacts.brief?.content?.text || "",
          matchedCases,
          uploads,
        }),
      },
      workplan: artifacts.workplan || {
        id: "",
        title: `${engagement.title} - 12 Week Workplan`,
        generatedFrom: 0,
        content: buildWorkplanArtifactContentModule({
          title: engagement.title,
          client: engagement.client,
          brief: artifacts.brief?.content?.text || "",
          uploads,
          matchedCases,
        }),
      },
      regenerationLog: db.prepare(
        `SELECT details_json, created_at, entity_id FROM audit_logs
         WHERE entity_type = 'engagement' AND entity_id = ? AND action = 'artifact.regenerated'
         ORDER BY created_at DESC`
      ).all(engagementId).map((row) => {
        const details = JSON.parse(row.details_json);
        return {
          id: row.entity_id,
          section: details.section,
          instructions: details.instructions || "",
          timestamp: row.created_at,
        };
      }),
    },
  };
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatDateLabel(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function humanizeAuditAction(action) {
  return {
    "engagement.created": "Engagement created",
    "engagement.archived": "Engagement archived",
    "engagement.duplicated": "Engagement duplicated",
    "engagement.deleted": "Engagement deleted",
    "engagement.promoted_to_vault": "Saved to vault",
    "artifact.regenerated": "Section regenerated",
    "workspace.saved": "Workspace saved",
    "version.restored": "Version restored",
    "member.invited": "Member invited",
    "member.role.updated": "Role updated",
    "member.removed": "Member removed",
    "artifact.exported": "Artifact exported",
  }[action] || action;
}

function backfillArtifactProvenance() {
  const engagementIds = db.prepare(`SELECT id FROM engagements ORDER BY created_at ASC`).all().map((row) => row.id);
  for (const engagementId of engagementIds) {
    const serialized = serializeEngagement(engagementId);
    if (!serialized) continue;
    const proposalContent = serialized.workspace.proposalStarter.content;
    const issueTreeContent = serialized.workspace.issueTree.content;
    const workplanContent = serialized.workspace.workplan.content;
    const proposalTemplate = buildProposalArtifactContentModule(serialized);
    const issueTemplate = buildIssueTreeArtifactContentModule(serialized);
    const workplanTemplate = buildWorkplanArtifactContentModule(serialized);

    if (!proposalContent.provenance) {
      db.prepare(
        `UPDATE artifacts SET content_json = ?, updated_at = ? WHERE engagement_id = ? AND kind = 'proposal'`
      ).run(JSON.stringify({ ...proposalContent, provenance: proposalTemplate.provenance }), isoNow(), engagementId);
    }
    if (!issueTreeContent.provenance) {
      db.prepare(
        `UPDATE artifacts SET content_json = ?, updated_at = ? WHERE engagement_id = ? AND kind = 'issue_tree'`
      ).run(JSON.stringify({ ...issueTreeContent, provenance: issueTemplate.provenance }), isoNow(), engagementId);
    }
    if (!workplanContent.provenance) {
      db.prepare(
        `UPDATE artifacts SET content_json = ?, updated_at = ? WHERE engagement_id = ? AND kind = 'workplan'`
      ).run(JSON.stringify({ ...workplanContent, provenance: workplanTemplate.provenance }), isoNow(), engagementId);
    }
  }
}

function createSession(userId, activeOrganizationId = null) {
  const sessionId = nextId("ses");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    `INSERT INTO sessions (id, user_id, active_organization_id, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(sessionId, userId, activeOrganizationId, expiresAt, isoNow());
  return { sessionId, expiresAt };
}

function buildBriefArtifactContent(text) {
  return {
    text,
    notes: "",
  };
}

function buildProposalArtifactContent(engagement) {
  const title = engagement.title || "Proposal Starter";
  const client = engagement.client || "Client";
  const problemType = engagement.problemType || "Strategy";
  const caseEvidence = Array.isArray(engagement.matchedCases) ? engagement.matchedCases.filter((item) => item.included).slice(0, 3) : [];
  return {
    sections: [
      {
        key: "problem_statement",
        label: "Problem Statement",
        body: `${client} needs a structured ${problemType.toLowerCase()} recommendation for ${title}. This artifact captures the working problem statement, proposed scope, deliverables, and delivery timeline.`,
      },
      {
        key: "objectives",
        label: "Objectives",
        body: `1. Clarify the client objective.\n2. Frame the key decisions required.\n3. Develop an evidence-backed recommendation.\n4. Turn analysis into an execution-ready plan.`,
      },
      {
        key: "workstreams",
        label: "Proposed Workstreams",
        body: `Workstream 1: Diagnose current state and market context.\nWorkstream 2: Build hypotheses and strategic options.\nWorkstream 3: Quantify implications, risks, and investment requirements.\nWorkstream 4: Translate the recommendation into a delivery roadmap.`,
      },
      {
        key: "deliverables",
        label: "Deliverables",
        body: `Executive recommendation memo\nAnalysis tree and supporting evidence\nDecision-ready workplan\nImplementation roadmap and risk register`,
      },
      {
        key: "case_evidence",
        label: "Analog Case Evidence",
        body: caseEvidence.length
          ? caseEvidence
              .map(
                (item, index) =>
                  `${index + 1}. ${item.engagementTitle} (${item.confidence}% ${item.confidenceLabel.toLowerCase()} match)\nWhy it matters: ${item.rationale}`
              )
              .join("\n\n")
          : `No analog cases were explicitly selected. This draft should be refined against additional reference material as it becomes available.`,
      },
      {
        key: "timeline",
        label: "Timeline Draft",
        body: `Weeks 1-2: Intake and market/context scan\nWeeks 3-5: Analysis and option development\nWeeks 6-8: Recommendation and business case\nWeeks 9-12: Execution roadmap and leadership readout`,
      },
      {
        key: "assumptions",
        label: "Assumptions",
        body: `Stakeholder interviews available within the first two weeks.\nRelevant commercial and operating data can be shared.\nDecision-makers are aligned on the evaluation criteria.`,
      },
      {
        key: "risks",
        label: "Risks",
        body: `Incomplete source material may slow generation quality.\nLate stakeholder input could delay synthesis.\nUnclear scope changes may require a revised workplan.`,
      },
    ],
  };
}

function buildIssueTreeArtifactContent(engagement) {
  const client = engagement.client || "Client";
  return {
    rootQuestion: `What is the best recommendation for ${client}?`,
    branches: [
      {
        title: "Is the opportunity attractive?",
        hypotheses: [
          "The target segment is large enough to justify investment.",
          "Growth and margin profile support the strategic move.",
        ],
        requiredData: [
          "Market size and growth",
          "Segment profitability",
          "Competitive intensity",
        ],
      },
      {
        title: "Can the client win?",
        hypotheses: [
          "The client has a differentiated right-to-win.",
          "Required capabilities can be built or acquired in time.",
        ],
        requiredData: [
          "Current capabilities",
          "Capability gaps",
          "Partner or acquisition options",
        ],
      },
      {
        title: "Is the plan economically sound?",
        hypotheses: [
          "Investment requirements are acceptable.",
          "The return profile beats alternatives.",
        ],
        requiredData: [
          "Investment profile",
          "Scenario model",
          "Risk-adjusted returns",
        ],
      },
    ],
  };
}

function buildWorkplanArtifactContent(engagement) {
  const caseEvidence = Array.isArray(engagement.matchedCases) ? engagement.matchedCases.filter((item) => item.included).slice(0, 2) : [];
  return {
    phases: [
      {
        name: "Diagnose",
        weeks: "Weeks 1-3",
        deliverables: [
          "Problem framing and success criteria",
          "Source material synthesis",
          "Initial fact base",
          ...(caseEvidence[0] ? [`Analog scan anchored in ${caseEvidence[0].engagementTitle}`] : []),
        ],
      },
      {
        name: "Analyze",
        weeks: "Weeks 4-7",
        deliverables: [
          "Issue tree and hypotheses",
          "Option analysis",
          "Economics and risk assessment",
          ...(caseEvidence[1] ? [`Cross-case comparison with ${caseEvidence[1].engagementTitle}`] : []),
        ],
      },
      {
        name: "Recommend",
        weeks: "Weeks 8-10",
        deliverables: [
          "Recommendation narrative",
          "Executive deck and memo",
          "Leadership alignment session",
          "Explicit rationale for where analog case evidence influenced the recommendation",
        ],
      },
      {
        name: "Mobilize",
        weeks: "Weeks 11-12",
        deliverables: [
          "12-week execution plan",
          "Governance and owners",
          "Decision log and next steps",
        ],
      },
    ],
  };
}

function seedMatchedCases(problemType) {
  return [
    {
      fileTitle: `${problemType} Strategy Reference.pdf`,
      engagementTitle: `${problemType} Prior Engagement`,
      confidence: 92,
      confidenceLabel: "Strong",
      rationale: `Strong alignment on problem framing, workstream structure, and reusable consulting modules for ${problemType}.`,
      reusableElements: ["Proposal structure", "Hypothesis tree", "Workplan sequencing"],
      included: true,
    },
    {
      fileTitle: `${problemType} Template.pptx`,
      engagementTitle: `${problemType} Executive Pack`,
      confidence: 81,
      confidenceLabel: "Strong",
      rationale: "Relevant strategic framing with similar executive output expectations.",
      reusableElements: ["Deliverable outline", "Executive summary pattern"],
      included: true,
    },
  ];
}

function snapshotEngagementArtifacts(engagementId) {
  const artifacts = db.prepare(
    `SELECT kind, title, generated_from, content_json, updated_at FROM artifacts WHERE engagement_id = ?`
  ).all(engagementId);
  return {
    artifacts: Object.fromEntries(
      artifacts.map((artifact) => [
        artifact.kind,
        {
          title: artifact.title,
          generatedFrom: artifact.generated_from,
          content: JSON.parse(artifact.content_json),
          updatedAt: artifact.updated_at,
        },
      ])
    ),
    uploads: db.prepare(
      `SELECT id, name, mime_type, extension, size_bytes, status, extracted_text, page_count, uploaded_at, processed_at
       FROM uploads WHERE engagement_id = ?`
    ).all(engagementId),
  };
}

function createVersionSnapshot({ engagementId, actorUserId, source, description }) {
  const nextVersionNumber =
    (db.prepare(
      `SELECT COALESCE(MAX(version_number), 0) AS value FROM engagement_versions WHERE engagement_id = ?`
    ).get(engagementId).value || 0) + 1;
  const versionId = nextId("ver");
  db.prepare(
    `INSERT INTO engagement_versions (id, engagement_id, version_number, source, description, snapshot_json, created_at, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    versionId,
    engagementId,
    nextVersionNumber,
    source,
    description,
    JSON.stringify(snapshotEngagementArtifacts(engagementId)),
    isoNow(),
    actorUserId
  );
  return versionId;
}

function createArtifact(engagementId, kind, title, generatedFrom, content) {
  db.prepare(
    `INSERT INTO artifacts (id, engagement_id, kind, title, generated_from, content_json, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(nextId("art"), engagementId, kind, title, generatedFrom, JSON.stringify(content), isoNow());
}

async function saveUploadRecord({ organizationId, engagementId, upload }) {
  const uploadId = nextId("upl");
  const extension = fileExtension(upload.name);
  const fileBuffer = Buffer.from(upload.contentBase64, "base64");
  const storagePath = path.join(UPLOADS_DIR, `${uploadId}_${sanitizeFileName(upload.name)}`);
  await fs.writeFile(storagePath, fileBuffer);

  db.prepare(
    `INSERT INTO uploads (id, engagement_id, organization_id, name, mime_type, extension, size_bytes, status, storage_path, uploaded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(uploadId, engagementId, organizationId, upload.name, upload.mimeType, extension, fileBuffer.byteLength, "processing", storagePath, isoNow());

  try {
    const extraction = await extractFileContents({
      fileBuffer,
      filePath: storagePath,
      mimeType: upload.mimeType,
      extension,
    });
    db.prepare(
      `UPDATE uploads
       SET status = ?, extracted_text = ?, page_count = ?, processed_at = ?, error_message = NULL
       WHERE id = ?`
    ).run("parsed", extraction.text, extraction.pages || null, isoNow(), uploadId);
  } catch (error) {
    db.prepare(
      `UPDATE uploads
       SET status = ?, processed_at = ?, error_message = ?
       WHERE id = ?`
    ).run("failed", isoNow(), error instanceof Error ? error.message : "Upload processing failed", uploadId);
  }
}

async function extractFileContents({ fileBuffer, filePath, mimeType, extension }) {
  if (mimeType.startsWith("text/") || ["txt", "md", "csv", "json"].includes(extension)) {
    return { text: fileBuffer.toString("utf8"), pages: null };
  }
  if (mimeType === "application/pdf" || extension === "pdf") {
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();
    await parser.destroy();
    return { text: result.text.trim(), pages: result.numpages || null };
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "docx"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return { text: result.value.trim(), pages: null };
  }
  return {
    text: `Stored ${path.basename(filePath)} successfully. Text extraction is not available for ${extension.toUpperCase()} yet.`,
    pages: null,
  };
}

function fileExtension(fileName) {
  return (fileName.split(".").pop() || "file").toLowerCase();
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

const ALLOWED_PROBLEM_TYPES = new Set([
  "Market Entry Strategy",
  "Digital Transformation",
  "Operations Optimization",
  "Growth Strategy",
  "Cost Reduction",
  "Organization Design",
]);

function normalizeRequiredText(value) {
  return String(value || "").trim();
}

function validateUploadDrafts(rawUploads) {
  if (!Array.isArray(rawUploads)) {
    return { uploads: [], error: "Uploads must be an array" };
  }
  const uploads = rawUploads.map((upload) => ({
    name: normalizeRequiredText(upload?.name),
    mimeType: normalizeRequiredText(upload?.mimeType) || "application/octet-stream",
    contentBase64: String(upload?.contentBase64 || "").trim(),
  }));
  if (uploads.some((upload) => !upload.name || !upload.contentBase64)) {
    return { uploads: [], error: "Each upload must include a file name and file contents" };
  }
  return { uploads, error: null };
}

function createEngagementRecord({
  organizationId,
  actorUserId,
  title,
  client,
  problemType,
  brief,
  notes,
  uploads = [],
  objective,
  progress = 18,
  status = "Draft",
  matchedCases = null,
  selectedVaultCaseIds = [],
  artifactSeed,
  migrateUploads = [],
  seedVersions = [],
  useTransaction = true,
}) {
  const engagementId = nextId("eng");
  const now = isoNow();
  const selectedMatchedCases = buildSelectedMatchedCases(db, {
    selectedVaultCaseIds,
    title,
    client,
    problemType,
    brief,
  });
  const resolvedMatchedCases =
    Array.isArray(matchedCases) && matchedCases.length
      ? matchedCases
      : Array.isArray(selectedMatchedCases) && selectedMatchedCases.length
      ? selectedMatchedCases
      : buildContextualMatchedCases(db, { title, client, problemType, brief });
  const artifacts = artifactSeed || {
    brief: {
      title: "Canonical Brief",
      generatedFrom: 0,
      content: buildBriefArtifactContent(brief),
    },
    proposal: {
      title: `${title} - Proposal Starter`,
      generatedFrom: resolvedMatchedCases.filter((item) => item.included).length,
      content: buildProposalArtifactContentModule({ title, client, problemType, brief, matchedCases: resolvedMatchedCases, uploads }),
    },
    issueTree: {
      title: `${title} - Issue Tree`,
      generatedFrom: 0,
      content: buildIssueTreeArtifactContentModule({ title, client, brief, matchedCases: resolvedMatchedCases, uploads }),
    },
    workplan: {
      title: `${title} - 12 Week Workplan`,
      generatedFrom: 0,
      content: buildWorkplanArtifactContentModule({ title, client, brief, matchedCases: resolvedMatchedCases, uploads }),
    },
  };

  const persist = () => {
    db.prepare(
      `INSERT INTO engagements (id, organization_id, title, client, problem_type, status, objective, notes, progress, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      engagementId,
      organizationId,
      title,
      client,
      problemType,
      status,
      objective || deriveObjectiveFromBrief(brief),
      notes || "",
      progress,
      now,
      now
    );

    createArtifact(engagementId, "brief", artifacts.brief.title, 0, artifacts.brief.content);
    createArtifact(engagementId, "proposal", artifacts.proposal.title, artifacts.proposal.generatedFrom || 0, artifacts.proposal.content);
    createArtifact(engagementId, "issue_tree", artifacts.issueTree.title, artifacts.issueTree.generatedFrom || 0, artifacts.issueTree.content);
    createArtifact(engagementId, "workplan", artifacts.workplan.title, artifacts.workplan.generatedFrom || 0, artifacts.workplan.content);

    for (const item of resolvedMatchedCases) {
      db.prepare(
        `INSERT INTO matched_cases (
          id, engagement_id, file_title, engagement_title, confidence, confidence_label,
          rationale, match_signals_json, reasoning_points_json, quality_score, reusable_elements_json, included
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        nextId("cas"),
        engagementId,
        item.fileTitle,
        item.engagementTitle,
        item.confidence,
        item.confidenceLabel,
        item.rationale,
        JSON.stringify(item.matchSignals || []),
        JSON.stringify(item.reasoningPoints || []),
        Number(item.qualityScore || 0),
        JSON.stringify(item.reusableElements),
        item.included ? 1 : 0
      );
    }
  };

  if (useTransaction) {
    runTransaction(persist);
  } else {
    persist();
  }

  for (const upload of uploads) {
    queueUploadIngestion({ organizationId, engagementId, upload });
  }

  for (const legacyUpload of migrateUploads) {
    const fileName = legacyUpload.name || "legacy-upload.txt";
    queueUploadIngestion({
      organizationId,
      engagementId,
      upload: {
        name: fileName,
        mimeType: legacyUpload.mimeType || "text/plain",
        contentBase64: Buffer.from(legacyUpload.extractedText || legacyUpload.name || "", "utf8").toString("base64"),
      },
    });
  }

  createVersionSnapshot({
    engagementId,
    actorUserId,
    source: "Initial generation",
    description: "Initial artifact set created from engagement brief",
  });

  for (const version of seedVersions) {
    db.prepare(
      `INSERT INTO engagement_versions (id, engagement_id, version_number, source, description, snapshot_json, created_at, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      nextId("ver"),
      engagementId,
      version.number,
      version.source,
      version.description,
      JSON.stringify(snapshotEngagementArtifacts(engagementId)),
      isoNow(),
      actorUserId
    );
  }

  createAuditLog({
    organizationId,
    userId: actorUserId,
    action: "engagement.created",
    entityType: "engagement",
    entityId: engagementId,
    details: { engagementTitle: title },
  });

  return engagementId;
}

function queueUploadIngestion(args) {
  void saveUploadRecord(args).catch((error) => {
    console.error("Upload ingestion failed", error);
  });
}

function deriveObjectiveFromBrief(brief) {
  const firstSentence = String(brief || "").split(".").slice(0, 2).join(".").trim();
  return firstSentence || "New engagement created from client brief.";
}

function buildEvidenceContext(engagementId, evidenceMode) {
  const uploads = db.prepare(
    `SELECT name FROM uploads WHERE engagement_id = ? ORDER BY uploaded_at DESC LIMIT 3`
  ).all(engagementId).map((row) => row.name);
  const cases = db.prepare(
    `SELECT engagement_title FROM matched_cases WHERE engagement_id = ? AND included = 1 ORDER BY confidence DESC LIMIT 3`
  ).all(engagementId).map((row) => row.engagement_title);

  const briefLabel = "canonical brief";
  if (evidenceMode === "brief-only") {
    return `Ground this revision only in the ${briefLabel}. Do not rely on analog cases or uploads.`;
  }
  if (evidenceMode === "uploads-only") {
    return uploads.length
      ? `Ground this revision only in uploaded source files: ${uploads.join(", ")}.`
      : `No uploaded files are available, so fall back to the ${briefLabel}.`;
  }
  if (evidenceMode === "cases-only") {
    return cases.length
      ? `Ground this revision only in selected analog cases: ${cases.join(", ")}.`
      : `No selected analog cases are available, so fall back to the ${briefLabel}.`;
  }
  const parts = [briefLabel];
  if (cases.length) parts.push(`selected cases (${cases.join(", ")})`);
  if (uploads.length) parts.push(`uploads (${uploads.join(", ")})`);
  return `Ground this revision in ${parts.join(", ")}.`;
}

function duplicateEngagementRecord({ engagementId, organizationId, actorUserId }) {
  const engagement = db.prepare("SELECT * FROM engagements WHERE id = ?").get(engagementId);
  if (!engagement) return null;
  const artifacts = Object.fromEntries(
    db.prepare(`SELECT * FROM artifacts WHERE engagement_id = ?`).all(engagementId).map((artifact) => [
      artifact.kind,
      {
        title: artifact.title.replace(engagement.title, `${engagement.title} Copy`),
        generatedFrom: artifact.generated_from,
        content: JSON.parse(artifact.content_json),
      },
    ])
  );
  const matchedCases = db.prepare(
    `SELECT * FROM matched_cases WHERE engagement_id = ? ORDER BY confidence DESC`
  ).all(engagementId).map((row) => ({
    fileTitle: row.file_title,
    engagementTitle: row.engagement_title,
    confidence: row.confidence,
    confidenceLabel: row.confidence_label,
    rationale: row.rationale,
    matchSignals: JSON.parse(row.match_signals_json || "[]"),
    reasoningPoints: JSON.parse(row.reasoning_points_json || "[]"),
    qualityScore: Number(row.quality_score || 0),
    reusableElements: JSON.parse(row.reusable_elements_json),
    included: Boolean(row.included),
  }));
  const uploads = db.prepare(
    `SELECT * FROM uploads WHERE engagement_id = ? ORDER BY uploaded_at ASC`
  ).all(engagementId).map((upload) => ({
    name: upload.name,
    mimeType: upload.mime_type,
    extractedText: upload.extracted_text || "",
  }));

  return createEngagementRecord({
    organizationId,
    actorUserId,
    title: `${engagement.title} Copy`,
    client: engagement.client,
    problemType: engagement.problem_type,
    brief: JSON.parse(db.prepare(`SELECT content_json FROM artifacts WHERE engagement_id = ? AND kind = 'brief'`).get(engagementId).content_json).text || "",
    notes: engagement.notes,
    objective: engagement.objective,
    progress: 12,
    status: "Draft",
    matchedCases,
    artifactSeed: {
      brief: artifacts.brief,
      proposal: artifacts.proposal,
      issueTree: artifacts.issue_tree,
      workplan: artifacts.workplan,
    },
    migrateUploads: uploads,
  });
}

async function updateArtifact({ engagementId, kind, actorUserId, organizationId, title, content, source, description }) {
  db.prepare(
    `UPDATE artifacts
     SET title = ?, content_json = ?, updated_at = ?
     WHERE engagement_id = ? AND kind = ?`
  ).run(title, JSON.stringify(content), isoNow(), engagementId, kind);
  db.prepare("UPDATE engagements SET updated_at = ? WHERE id = ?").run(isoNow(), engagementId);
  const versionId = createVersionSnapshot({
    engagementId,
    actorUserId,
    source,
    description,
  });
  createAuditLog({
    organizationId,
    userId: actorUserId,
    action: source === "Section regeneration" ? "artifact.regenerated" : "workspace.saved",
    entityType: "engagement",
    entityId: engagementId,
    details: { engagementTitle: db.prepare("SELECT title FROM engagements WHERE id = ?").get(engagementId).title, kind, versionId, section: description, instructions: description },
  });
  return versionId;
}

async function requestHandler(req, res) {
  if (!req.url) {
    json(res, 404, { error: "Not found" });
    return;
  }

  if (req.method === "OPTIONS") {
    json(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (url.pathname === "/api/health" && req.method === "GET") {
      json(res, 200, { ok: true });
      return;
    }

    if (url.pathname === "/api/session" && req.method === "GET") {
      const session = getSessionFromRequest(req);
      json(res, 200, session ? buildSessionPayload(session) : buildPublicSessionPayload());
      return;
    }

    if (url.pathname === "/api/auth/signup" && req.method === "POST") {
      const body = await parseBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const fullName = String(body.fullName || body.organizationName || email.split("@")[0] || "User").trim();
      if (!email || !password || password.length < 8) {
        json(res, 400, { error: "A valid email and password are required" });
        return;
      }
      const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
      if (existing) {
        json(res, 409, { error: "An account with this email already exists" });
        return;
      }
      const userId = nextId("usr");
      db.prepare(
        `INSERT INTO users (id, full_name, email, password_hash, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run(userId, fullName, email, hashPassword(password), isoNow());
      const { sessionId, expiresAt } = createSession(userId, null);
      json(
        res,
        201,
        {
          ok: true,
          session: buildSessionPayload({
            id: sessionId,
            user_id: userId,
            active_organization_id: null,
            full_name: fullName,
            email,
          }),
        },
        { cookie: sessionCookie(sessionId, expiresAt) }
      );
      return;
    }

    if (url.pathname === "/api/auth/login" && req.method === "POST") {
      const body = await parseBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user || !verifyPassword(password, user.password_hash)) {
        json(res, 401, { error: "Invalid email or password" });
        return;
      }
      const organizations = listOrganizationsForUser(user.id);
      const activeOrganizationId = organizations.length === 1 ? organizations[0].id : null;
      const { sessionId, expiresAt } = createSession(user.id, activeOrganizationId);
      json(
        res,
        200,
        {
          ok: true,
          session: buildSessionPayload({
            id: sessionId,
            user_id: user.id,
            active_organization_id: activeOrganizationId,
            full_name: user.full_name,
            email: user.email,
          }),
        },
        { cookie: sessionCookie(sessionId, expiresAt) }
      );
      return;
    }

    if (url.pathname === "/api/auth/logout" && req.method === "POST") {
      const session = getSessionFromRequest(req);
      if (session) {
        db.prepare("DELETE FROM sessions WHERE id = ?").run(session.id);
      }
      json(res, 200, { ok: true }, { cookie: clearSessionCookie() });
      return;
    }

    if (url.pathname === "/api/organizations" && req.method === "POST") {
      const session = requireSession(req, res);
      if (!session) return;
      const body = await parseBody(req);
      const name = String(body.name || "").trim();
      const slug = slugify(body.slug || name);
      if (!name || !slug) {
        json(res, 400, { error: "Organization name is required" });
        return;
      }
      const exists = db.prepare("SELECT id FROM organizations WHERE slug = ?").get(slug);
      if (exists) {
        json(res, 409, { error: "That workspace slug is already taken" });
        return;
      }
      const organizationId = nextId("org");
      runTransaction(() => {
        db.prepare(
          `INSERT INTO organizations (id, name, slug, plan, use_case, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(organizationId, name, slug, body.plan || "Team", body.useCase || "", isoNow());
        db.prepare(
          `INSERT INTO memberships (id, user_id, organization_id, role, status, joined_at, invited_at, invited_by_user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(nextId("mem"), session.user_id, organizationId, "owner", "active", isoNow(), isoNow(), session.user_id);
        db.prepare("UPDATE sessions SET active_organization_id = ? WHERE id = ?").run(organizationId, session.id);
      });
      createAuditLog({
        organizationId,
        userId: session.user_id,
        action: "organization.created",
        entityType: "organization",
        entityId: organizationId,
        details: { organizationName: name },
      });
      json(res, 201, { ok: true, organizationId });
      return;
    }

    if (url.pathname === "/api/organizations/select" && req.method === "POST") {
      const session = requireSession(req, res);
      if (!session) return;
      const body = await parseBody(req);
      const organizationId = String(body.organizationId || "");
      const membership = getMembership(session.user_id, organizationId);
      if (!membership || membership.status !== "active") {
        json(res, 403, { error: "You do not have access to that organization" });
        return;
      }
      db.prepare("UPDATE sessions SET active_organization_id = ? WHERE id = ?").run(organizationId, session.id);
      json(res, 200, { ok: true });
      return;
    }

    if (url.pathname.match(/^\/api\/invites\/[^/]+$/) && req.method === "GET") {
      const token = url.pathname.split("/").pop();
      const invite = db.prepare(
        `SELECT i.*, o.name AS organization_name, o.plan, u.full_name AS invited_by_name, u.email AS invited_by_email
         FROM invites i
         JOIN organizations o ON o.id = i.organization_id
         JOIN users u ON u.id = i.invited_by_user_id
         WHERE i.token = ?`
      ).get(token);
      if (!invite) {
        json(res, 404, { error: "Invitation not found" });
        return;
      }
      json(res, 200, {
        token,
        organizationName: invite.organization_name,
        invitedBy: invite.invited_by_name,
        invitedByEmail: invite.invited_by_email,
        role: invite.role,
        expiresIn: relativeTimeFrom(invite.expires_at),
        organizationPlan: invite.plan,
        status: invite.status,
        email: invite.email,
      });
      return;
    }

    if (url.pathname.match(/^\/api\/invites\/[^/]+\/accept$/) && req.method === "POST") {
      const token = url.pathname.split("/")[3];
      const body = await parseBody(req);
      const invite = db.prepare("SELECT * FROM invites WHERE token = ?").get(token);
      if (!invite || invite.status !== "pending") {
        json(res, 404, { error: "Invitation not found or already used" });
        return;
      }
      if (new Date(invite.expires_at).getTime() < Date.now()) {
        json(res, 410, { error: "Invitation has expired" });
        return;
      }

      let user = getSessionFromRequest(req)
        ? db.prepare("SELECT * FROM users WHERE id = ?").get(getSessionFromRequest(req).user_id)
        : db.prepare("SELECT * FROM users WHERE email = ?").get(invite.email);

      if (!user) {
        const password = String(body.password || "");
        const fullName = String(body.fullName || invite.email.split("@")[0]).trim();
        if (password.length < 8) {
          json(res, 400, { error: "Create a password with at least 8 characters to accept the invite" });
          return;
        }
        const userId = nextId("usr");
        db.prepare(
          `INSERT INTO users (id, full_name, email, password_hash, created_at)
           VALUES (?, ?, ?, ?, ?)`
        ).run(userId, fullName, invite.email, hashPassword(password), isoNow());
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      }

      const existingMembership = getMembership(user.id, invite.organization_id);
      runTransaction(() => {
        if (!existingMembership) {
          db.prepare(
            `INSERT INTO memberships (id, user_id, organization_id, role, status, joined_at, invited_at, invited_by_user_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).run(nextId("mem"), user.id, invite.organization_id, invite.role, "active", isoNow(), invite.created_at, invite.invited_by_user_id);
        } else {
          db.prepare(
            `UPDATE memberships SET role = ?, status = 'active', joined_at = ? WHERE id = ?`
          ).run(invite.role, isoNow(), existingMembership.id);
        }
        db.prepare(
          `UPDATE invites SET status = 'accepted', accepted_at = ? WHERE id = ?`
        ).run(isoNow(), invite.id);
      });

      const { sessionId, expiresAt } = createSession(user.id, invite.organization_id);
      json(
        res,
        200,
        { ok: true },
        { cookie: sessionCookie(sessionId, expiresAt) }
      );
      return;
    }

    if (url.pathname === "/api/bootstrap" && req.method === "GET") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      json(res, 200, buildBootstrap(context.membership.organization_id, context.session.user_id));
      return;
    }

    if (url.pathname === "/api/vault/cases" && req.method === "GET") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      const cases = listVaultCases(db, {
        query: url.searchParams.get("query") || "",
        title: url.searchParams.get("title") || "",
        client: url.searchParams.get("client") || "",
        brief: url.searchParams.get("brief") || "",
        problemType: url.searchParams.get("problemType") || "",
        industry: url.searchParams.get("industry") || "",
        capability: url.searchParams.get("capability") || "",
        sourceFirm: url.searchParams.get("sourceFirm") || "",
        limit: url.searchParams.get("limit") || 20,
      });
      json(res, 200, { cases, total: cases.length });
      return;
    }

    if (url.pathname === "/api/vault/overview" && req.method === "GET") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      const overview = buildVaultOverview(
        db,
        { relativeTimeFrom },
        {
          query: url.searchParams.get("query") || "",
          problemType: url.searchParams.get("problemType") || "",
          industry: url.searchParams.get("industry") || "",
          capability: url.searchParams.get("capability") || "",
          sourceFirm: url.searchParams.get("sourceFirm") || "",
          limit: url.searchParams.get("limit") || 20,
        }
      );
      json(res, 200, overview);
      return;
    }

    if (url.pathname.match(/^\/api\/vault\/cases\/[^/]+\/feedback$/) && req.method === "PATCH") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      const caseId = url.pathname.split("/")[4];
      const body = await parseBody(req);
      const action = String(body.action || "");
      if (!["favorite", "hide", "use_again"].includes(action)) {
        json(res, 400, { error: "Invalid feedback action" });
        return;
      }
      const updated = updateVaultCaseFeedback(db, caseId, action);
      if (!updated) {
        json(res, 404, { error: "Vault case not found" });
        return;
      }
      json(res, 200, { ok: true, caseId, action });
      return;
    }

    if (url.pathname === "/api/engagements" && req.method === "POST") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const body = await parseBody(req);
      const title = normalizeRequiredText(body.title);
      const client = normalizeRequiredText(body.client);
      const problemType = normalizeRequiredText(body.problemType);
      const brief = String(body.brief || "").trim();
      const notes = String(body.notes || "");
      const { uploads, error: uploadError } = validateUploadDrafts(Array.isArray(body.uploads) ? body.uploads : []);
      if (!title) {
        json(res, 400, { error: "Engagement title is required" });
        return;
      }
      if (!client) {
        json(res, 400, { error: "Client alias is required" });
        return;
      }
      if (!problemType) {
        json(res, 400, { error: "Problem type is required" });
        return;
      }
      if (!ALLOWED_PROBLEM_TYPES.has(problemType)) {
        json(res, 400, { error: "Problem type is not supported" });
        return;
      }
      if (!brief && uploads.length === 0) {
        json(res, 400, { error: "Add a brief or at least one uploaded source file" });
        return;
      }
      if (uploadError) {
        json(res, 400, { error: uploadError });
        return;
      }
      const engagementId = createEngagementRecord({
        organizationId: context.membership.organization_id,
        actorUserId: context.session.user_id,
        title,
        client,
        problemType,
        brief,
        notes,
        uploads,
        selectedVaultCaseIds: Array.isArray(body.selectedVaultCaseIds) ? body.selectedVaultCaseIds : [],
      });
      json(res, 201, serializeEngagement(engagementId));
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+$/) && req.method === "GET") {
      const session = requireSession(req, res);
      if (!session) return;
      const engagementId = url.pathname.split("/").pop();
      const engagement = getEngagementForUser(engagementId, session.user_id);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      json(res, 200, serializeEngagement(engagementId));
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/status$/) && req.method === "PATCH") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const engagementId = url.pathname.split("/")[3];
      const engagement = getEngagementForUser(engagementId, context.session.user_id);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      const body = await parseBody(req);
      const status = String(body.status || "").trim() || engagement.status;
      db.prepare("UPDATE engagements SET status = ?, updated_at = ? WHERE id = ?").run(status, isoNow(), engagementId);
      createAuditLog({
        organizationId: context.membership.organization_id,
        userId: context.session.user_id,
        action: status === "Archived" ? "engagement.archived" : "workspace.saved",
        entityType: "engagement",
        entityId: engagementId,
        details: { engagementTitle: engagement.title, status },
      });
      json(res, 200, serializeEngagement(engagementId));
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/duplicate$/) && req.method === "POST") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const engagementId = url.pathname.split("/")[3];
      const engagement = getEngagementForUser(engagementId, context.session.user_id);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      const duplicateId = duplicateEngagementRecord({
        engagementId,
        organizationId: context.membership.organization_id,
        actorUserId: context.session.user_id,
      });
      createAuditLog({
        organizationId: context.membership.organization_id,
        userId: context.session.user_id,
        action: "engagement.duplicated",
        entityType: "engagement",
        entityId: engagementId,
        details: { engagementTitle: engagement.title, duplicateId },
      });
      json(res, 201, serializeEngagement(duplicateId));
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+$/) && req.method === "DELETE") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const engagementId = url.pathname.split("/")[3];
      const engagement = getEngagementForUser(engagementId, context.session.user_id);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      runTransaction(() => {
        db.prepare("DELETE FROM uploads WHERE engagement_id = ?").run(engagementId);
        db.prepare("DELETE FROM matched_cases WHERE engagement_id = ?").run(engagementId);
        db.prepare("DELETE FROM artifacts WHERE engagement_id = ?").run(engagementId);
        db.prepare("DELETE FROM engagement_versions WHERE engagement_id = ?").run(engagementId);
        db.prepare("DELETE FROM audit_logs WHERE entity_type = 'engagement' AND entity_id = ?").run(engagementId);
        db.prepare("DELETE FROM engagements WHERE id = ?").run(engagementId);
      });
      createAuditLog({
        organizationId: context.membership.organization_id,
        userId: context.session.user_id,
        action: "engagement.deleted",
        entityType: "organization",
        entityId: context.membership.organization_id,
        details: { engagementTitle: engagement.title },
      });
      json(res, 200, { ok: true, engagementId });
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/brief$/) && req.method === "PATCH") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const engagementId = url.pathname.split("/")[3];
      const engagement = getEngagementForUser(engagementId, context.session.user_id);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      const body = await parseBody(req);
      const brief = String(body.brief || "").trim();
      if (!brief) {
        json(res, 400, { error: "Brief content cannot be empty" });
        return;
      }
      await updateArtifact({
        engagementId,
        kind: "brief",
        actorUserId: context.session.user_id,
        organizationId: context.membership.organization_id,
        title: "Canonical Brief",
        content: buildBriefArtifactContent(brief),
        source: "Manual edit",
        description: "Updated canonical brief",
      });
      json(res, 200, serializeEngagement(engagementId));
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/artifacts\/[^/]+$/) && req.method === "PATCH") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const engagementId = url.pathname.split("/")[3];
      const kind = url.pathname.split("/")[5];
      const engagement = getEngagementForUser(engagementId, context.session.user_id);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      const artifactKind = kind === "issue-tree" ? "issue_tree" : kind;
      const body = await parseBody(req);
      const title = normalizeRequiredText(body.title);
      if (!title) {
        json(res, 400, { error: "Artifact title is required" });
        return;
      }
      if (!body.content || typeof body.content !== "object") {
        json(res, 400, { error: "Artifact content is required" });
        return;
      }
      await updateArtifact({
        engagementId,
        kind: artifactKind,
        actorUserId: context.session.user_id,
        organizationId: context.membership.organization_id,
        title,
        content: body.content,
        source: "Manual edit",
        description: `Saved ${artifactLabel(artifactKind)} changes`,
      });
      json(res, 200, serializeEngagement(engagementId));
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/save$/) && req.method === "PATCH") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const engagementId = url.pathname.split("/")[3];
      const engagement = getEngagementForUser(engagementId, context.session.user_id);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      createVersionSnapshot({
        engagementId,
        actorUserId: context.session.user_id,
        source: "Manual edit",
        description: "Saved workspace changes",
      });
      createAuditLog({
        organizationId: context.membership.organization_id,
        userId: context.session.user_id,
        action: "workspace.saved",
        entityType: "engagement",
        entityId: engagementId,
        details: { engagementTitle: engagement.title },
      });
      db.prepare("UPDATE engagements SET updated_at = ? WHERE id = ?").run(isoNow(), engagementId);
      json(res, 200, serializeEngagement(engagementId));
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/matches\/[^/]+$/) && req.method === "PATCH") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const engagementId = url.pathname.split("/")[3];
      const caseId = url.pathname.split("/")[5];
      const body = await parseBody(req);
      db.prepare(
        `UPDATE matched_cases SET included = ? WHERE id = ? AND engagement_id = ?`
      ).run(body.included ? 1 : 0, caseId, engagementId);
      db.prepare("UPDATE engagements SET updated_at = ? WHERE id = ?").run(isoNow(), engagementId);
      json(res, 200, serializeEngagement(engagementId));
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/rematch$/) && req.method === "POST") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const engagementId = url.pathname.split("/")[3];
      const engagement = getEngagementForUser(engagementId, context.session.user_id);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      const serialized = serializeEngagement(engagementId);
      const nextMatches = buildContextualMatchedCases(db, {
        title: serialized.title,
        client: serialized.client,
        problemType: serialized.problemType,
        brief: serialized.brief,
      });
      runTransaction(() => {
        db.prepare(`DELETE FROM matched_cases WHERE engagement_id = ?`).run(engagementId);
        for (const item of nextMatches) {
          db.prepare(
            `INSERT INTO matched_cases (
              id, engagement_id, file_title, engagement_title, confidence, confidence_label,
              rationale, match_signals_json, reasoning_points_json, quality_score, reusable_elements_json, included
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).run(
            nextId("cas"),
            engagementId,
            item.fileTitle,
            item.engagementTitle,
            item.confidence,
            item.confidenceLabel,
            item.rationale,
            JSON.stringify(item.matchSignals || []),
            JSON.stringify(item.reasoningPoints || []),
            Number(item.qualityScore || 0),
            JSON.stringify(item.reusableElements),
            item.included ? 1 : 0
          );
        }
        const refreshed = serializeEngagement(engagementId);
        const proposal = buildProposalArtifactContentModule(refreshed);
        const issueTree = buildIssueTreeArtifactContentModule(refreshed);
        const workplan = buildWorkplanArtifactContentModule(refreshed);
        db.prepare(`UPDATE artifacts SET generated_from = ?, content_json = ?, updated_at = ? WHERE engagement_id = ? AND kind = 'proposal'`)
          .run(nextMatches.filter((item) => item.included).length, JSON.stringify(proposal), isoNow(), engagementId);
        db.prepare(`UPDATE artifacts SET content_json = ?, updated_at = ? WHERE engagement_id = ? AND kind = 'issue_tree'`)
          .run(JSON.stringify(issueTree), isoNow(), engagementId);
        db.prepare(`UPDATE artifacts SET content_json = ?, updated_at = ? WHERE engagement_id = ? AND kind = 'workplan'`)
          .run(JSON.stringify(workplan), isoNow(), engagementId);
        db.prepare(`UPDATE engagements SET updated_at = ? WHERE id = ?`).run(isoNow(), engagementId);
      });
      createAuditLog({
        organizationId: context.membership.organization_id,
        userId: context.session.user_id,
        action: "workspace.saved",
        entityType: "engagement",
        entityId: engagementId,
        details: { engagementTitle: engagement.title, description: "Re-ran case matching" },
      });
      json(res, 200, serializeEngagement(engagementId));
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/regenerate$/) && req.method === "POST") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const engagementId = url.pathname.split("/")[3];
      const engagement = getEngagementForUser(engagementId, context.session.user_id);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      const body = await parseBody(req);
      const section = String(body.section || "section");
      const evidenceMode = String(body.evidenceMode || "brief-cases");
      const artifact = db.prepare(
        `SELECT * FROM artifacts WHERE engagement_id = ? AND kind = 'proposal'`
      ).get(engagementId);
      const content = JSON.parse(artifact.content_json);
      const evidenceContext = buildEvidenceContext(engagementId, evidenceMode);
      const serializedEngagement = serializeEngagement(engagementId);
      const nextProvenance = {
        ...(content.provenance || {}),
        [section]: buildProposalProvenanceForRegeneration(serializedEngagement, section, evidenceMode),
      };
      const nextSections = content.sections.map((item) =>
        item.key === section || item.label.toLowerCase().replace(/\s+/g, "_") === section
          ? {
              ...item,
              body: regenerateProposalSectionModule(serializedEngagement, item.key, body.instructions, evidenceMode),
            }
          : item
      );
      await updateArtifact({
        engagementId,
        kind: "proposal",
        actorUserId: context.session.user_id,
        organizationId: context.membership.organization_id,
        title: artifact.title,
        content: { ...content, sections: nextSections, provenance: nextProvenance },
        source: "Section regeneration",
        description: `Regenerated "${section}" section${body.instructions ? " with targeted instructions" : ""} using ${evidenceMode}`,
      });
      json(res, 200, serializeEngagement(engagementId));
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/promote-to-vault$/) && req.method === "POST") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const engagementId = url.pathname.split("/")[3];
      const engagement = getEngagementForUser(engagementId, context.session.user_id);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      const body = await parseBody(req);
      const promoted = promoteEngagementToVaultCase(db, {
        nextId,
        isoNow,
        engagementId,
        organizationId: context.membership.organization_id,
        title: String(body.title || `${engagement.title} - Internal Case`).trim(),
        summary: String(body.summary || engagement.objective || engagement.notes || "").trim() || `Internal case derived from ${engagement.title}.`,
        industry: String(body.industry || "General").trim(),
        businessFunction: String(body.businessFunction || "Strategy").trim(),
        problemType: String(body.problemType || engagement.problem_type).trim(),
        capability: String(body.capability || "Delivery").trim(),
        tags: Array.isArray(body.tags) ? body.tags.map((item) => String(item).trim()).filter(Boolean) : [],
        outcomes: Array.isArray(body.outcomes) ? body.outcomes.map((item) => String(item).trim()).filter(Boolean) : [],
      });
      if (!promoted) {
        json(res, 500, { error: "Unable to promote engagement to vault" });
        return;
      }
      createAuditLog({
        organizationId: context.membership.organization_id,
        userId: context.session.user_id,
        action: "engagement.promoted_to_vault",
        entityType: "engagement",
        entityId: engagementId,
        details: { engagementTitle: engagement.title, vaultCaseId: promoted.id },
      });
      json(res, 201, { ok: true, vaultCaseId: promoted.id });
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/versions\/[^/]+\/restore$/) && req.method === "POST") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const engagementId = url.pathname.split("/")[3];
      const versionId = url.pathname.split("/")[5];
      const version = db.prepare(
        `SELECT * FROM engagement_versions WHERE id = ? AND engagement_id = ?`
      ).get(versionId, engagementId);
      if (!version) {
        json(res, 404, { error: "Version not found" });
        return;
      }
      const snapshot = JSON.parse(version.snapshot_json);
      runTransaction(() => {
        for (const [kind, artifact] of Object.entries(snapshot.artifacts || {})) {
          db.prepare(
            `UPDATE artifacts
             SET title = ?, generated_from = ?, content_json = ?, updated_at = ?
             WHERE engagement_id = ? AND kind = ?`
          ).run(artifact.title, artifact.generatedFrom || 0, JSON.stringify(artifact.content), isoNow(), engagementId, kind);
        }
        db.prepare("UPDATE engagements SET updated_at = ? WHERE id = ?").run(isoNow(), engagementId);
        createVersionSnapshot({
          engagementId,
          actorUserId: context.session.user_id,
          source: "Version restore",
          description: `Restored version ${version.version_number}`,
        });
      });
      createAuditLog({
        organizationId: context.membership.organization_id,
        userId: context.session.user_id,
        action: "version.restored",
        entityType: "engagement",
        entityId: engagementId,
        details: {
          engagementTitle: db.prepare("SELECT title FROM engagements WHERE id = ?").get(engagementId).title,
          versionNumber: version.version_number,
        },
      });
      json(res, 200, serializeEngagement(engagementId));
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/uploads$/) && req.method === "POST") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin", "editor"])) return;
      const engagementId = url.pathname.split("/")[3];
      const engagement = getEngagementForUser(engagementId, context.session.user_id);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      const body = await parseBody(req);
      const { uploads, error: uploadError } = validateUploadDrafts(Array.isArray(body.uploads) ? body.uploads : []);
      if (uploadError) {
        json(res, 400, { error: uploadError });
        return;
      }
      if (!uploads.length) {
        json(res, 400, { error: "Add at least one source file" });
        return;
      }
      for (const upload of uploads) {
        await saveUploadRecord({
          organizationId: context.membership.organization_id,
          engagementId,
          upload,
        });
      }
      createVersionSnapshot({
        engagementId,
        actorUserId: context.session.user_id,
        source: "Upload ingestion",
        description: `Added ${uploads.length} source file${uploads.length === 1 ? "" : "s"}`,
      });
      json(res, 200, serializeEngagement(engagementId));
      return;
    }

    if (url.pathname === "/api/members/invite" && req.method === "POST") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin"])) return;
      const body = await parseBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const role = normalizeRole(body.role);
      if (!email) {
        json(res, 400, { error: "Email is required" });
        return;
      }
      const token = randomBytes(24).toString("hex");
      const inviteId = nextId("inv");
      db.prepare(
        `INSERT INTO invites (id, organization_id, email, role, token, invited_by_user_id, status, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        inviteId,
        context.membership.organization_id,
        email,
        role,
        token,
        context.session.user_id,
        "pending",
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isoNow()
      );
      createAuditLog({
        organizationId: context.membership.organization_id,
        userId: context.session.user_id,
        action: "member.invited",
        entityType: "invite",
        entityId: inviteId,
        details: { email },
      });
      json(res, 201, { id: inviteId, email, role, inviteUrl: `/accept-invite?token=${token}` });
      return;
    }

    if (url.pathname.match(/^\/api\/members\/[^/]+$/) && req.method === "PATCH") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin"])) return;
      const membershipId = url.pathname.split("/").pop();
      const body = await parseBody(req);
      const role = normalizeRole(body.role);
      db.prepare(
        `UPDATE memberships SET role = ? WHERE id = ? AND organization_id = ?`
      ).run(role, membershipId, context.membership.organization_id);
      createAuditLog({
        organizationId: context.membership.organization_id,
        userId: context.session.user_id,
        action: "member.role.updated",
        entityType: "membership",
        entityId: membershipId,
        details: { role },
      });
      json(res, 200, { ok: true });
      return;
    }

    if (url.pathname.match(/^\/api\/members\/[^/]+$/) && req.method === "DELETE") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin"])) return;
      const membershipId = url.pathname.split("/").pop();
      const target = db.prepare(
        `SELECT * FROM memberships WHERE id = ? AND organization_id = ?`
      ).get(membershipId, context.membership.organization_id);
      if (!target) {
        json(res, 404, { error: "Member not found" });
        return;
      }
      if (target.role === "owner") {
        json(res, 400, { error: "Cannot remove the owner" });
        return;
      }
      db.prepare("DELETE FROM memberships WHERE id = ?").run(membershipId);
      createAuditLog({
        organizationId: context.membership.organization_id,
        userId: context.session.user_id,
        action: "member.removed",
        entityType: "membership",
        entityId: membershipId,
        details: {},
      });
      json(res, 200, { ok: true });
      return;
    }

    if (url.pathname === "/api/settings/organization" && req.method === "PATCH") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "admin"])) return;
      const body = await parseBody(req);
      const name = String(body.name || "").trim();
      if (!name) {
        json(res, 400, { error: "Organization name is required" });
        return;
      }
      db.prepare(
        `UPDATE organizations SET name = ?, slug = ? WHERE id = ?`
      ).run(name, slugify(name), context.membership.organization_id);
      json(res, 200, { ok: true });
      return;
    }

    if (url.pathname === "/api/billing/plan" && req.method === "PATCH") {
      const context = requireOrganizationContext(req, res);
      if (!context) return;
      if (!requireRole(res, context.membership, ["owner", "billing"])) return;
      const body = await parseBody(req);
      const allowed = new Set(["Starter", "Solo", "Team", "Enterprise"]);
      if (!allowed.has(body.planName)) {
        json(res, 404, { error: "Plan not found" });
        return;
      }
      db.prepare("UPDATE organizations SET plan = ? WHERE id = ?").run(body.planName, context.membership.organization_id);
      json(res, 200, buildBilling(context.membership.organization_id).currentPlan);
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/export$/) && req.method === "POST") {
      const session = requireSession(req, res);
      if (!session) return;
      const engagementId = url.pathname.split("/")[3];
      const engagement = getEngagementForUser(engagementId, session.user_id);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      createAuditLog({
        organizationId: engagement.organization_id,
        userId: session.user_id,
        action: "artifact.exported",
        entityType: "engagement",
        entityId: engagementId,
        details: { engagementTitle: engagement.title },
      });
      json(res, 200, serializeEngagement(engagementId));
      return;
    }

    json(res, 404, { error: "Not found" });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
}

createServer(requestHandler).listen(PORT, () => {
  console.log(`API listening on http://127.0.0.1:${PORT}`);
});
