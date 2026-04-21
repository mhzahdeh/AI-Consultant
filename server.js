import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const PORT = Number(process.env.PORT || 3001);

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
};

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
};

const ensureDb = async () => {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DB_PATH, "utf8");
  } catch {
    await writeFile(DB_PATH, JSON.stringify(seedData(), null, 2));
  }
};

const loadDb = async () => {
  await ensureDb();
  const file = await readFile(DB_PATH, "utf8");
  const parsed = JSON.parse(file);
  if (!parsed || !parsed.organization) {
    const seeded = seedData();
    await saveDb(seeded);
    return seeded;
  }
  return parsed;
};

const saveDb = async (db) => {
  db.meta.updatedAt = new Date().toISOString();
  await writeFile(DB_PATH, JSON.stringify(db, null, 2));
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const id = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const nowRelative = () => "just now";

const buildBootstrap = (db) => {
  const activeMembers = db.members.filter((member) => member.status === "active");
  const invites = db.members.filter((member) => member.status !== "active");

  return {
    user: db.user,
    organization: {
      ...db.organization,
      membersCount: activeMembers.length,
      invitesCount: invites.length,
    },
    dashboard: {
      engagements: db.engagements.map(toDashboardEngagement),
      vault: db.vault,
    },
    usage: db.usage,
    billing: db.billing,
    members: db.members,
    settings: db.settings,
  };
};

const toDashboardEngagement = (engagement) => ({
  id: engagement.id,
  title: engagement.title,
  client: engagement.client,
  problemType: engagement.problemType,
  status: engagement.status,
  lastUpdated: engagement.lastUpdated,
  progress: engagement.progress,
  objective: engagement.objective,
  outputs: engagement.outputs,
});

const getEngagement = (db, engagementId) =>
  db.engagements.find((engagement) => engagement.id === engagementId);

const requestHandler = async (req, res) => {
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

    if (url.pathname === "/api/bootstrap" && req.method === "GET") {
      const db = await loadDb();
      json(res, 200, buildBootstrap(db));
      return;
    }

    if (url.pathname === "/api/engagements" && req.method === "POST") {
      const body = await parseBody(req);
      const db = await loadDb();
      const created = {
        id: id("eng"),
        title: body.title,
        client: body.client,
        problemType: body.problemType,
        status: "Draft",
        lastUpdated: nowRelative(),
        createdAt: new Date().toISOString(),
        objective:
          body.objective ||
          body.brief?.split(".").slice(0, 2).join(".").trim() ||
          "New engagement created from client brief.",
        progress: 18,
        outputs: ["Brief", "Proposal Starter"],
        brief: body.brief || "",
        notes: body.notes || "",
        uploads: body.uploads || [],
        matchedCases: seedMatchedCases(body.problemType || "Strategy"),
        workspace: seedWorkspace(body.title || "New Engagement", body.client || "Client"),
      };
      db.engagements.unshift(created);
      db.usage.summary[0].used = db.engagements.length;
      db.usage.recentActivity.unshift({
        id: id("act"),
        action: "Engagement created",
        engagement: created.title,
        user: db.user.fullName,
        timestamp: nowRelative(),
      });
      await saveDb(db);
      json(res, 201, created);
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+$/) && req.method === "GET") {
      const db = await loadDb();
      const engagementId = url.pathname.split("/").pop();
      const engagement = getEngagement(db, engagementId);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      json(res, 200, engagement);
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/brief$/) && req.method === "PATCH") {
      const db = await loadDb();
      const engagementId = url.pathname.split("/")[3];
      const engagement = getEngagement(db, engagementId);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      const body = await parseBody(req);
      engagement.brief = body.brief ?? engagement.brief;
      engagement.lastUpdated = nowRelative();
      engagement.workspace.lastSaved = nowRelative();
      await saveDb(db);
      json(res, 200, engagement);
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/matches\/[^/]+$/) && req.method === "PATCH") {
      const db = await loadDb();
      const [, , , engagementId, , caseId] = url.pathname.split("/");
      const engagement = getEngagement(db, engagementId);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      const body = await parseBody(req);
      engagement.matchedCases = engagement.matchedCases.map((item) =>
        item.id === caseId ? { ...item, included: Boolean(body.included) } : item
      );
      engagement.lastUpdated = nowRelative();
      await saveDb(db);
      json(res, 200, engagement.matchedCases);
      return;
    }

    if (url.pathname.match(/^\/api\/engagements\/[^/]+\/regenerate$/) && req.method === "POST") {
      const db = await loadDb();
      const engagementId = url.pathname.split("/")[3];
      const engagement = getEngagement(db, engagementId);
      if (!engagement) {
        json(res, 404, { error: "Engagement not found" });
        return;
      }
      const body = await parseBody(req);
      const section = body.section || "section";
      engagement.workspace.regenerationLog.unshift({
        id: id("regen"),
        section,
        instructions: body.instructions || "",
        timestamp: new Date().toISOString(),
      });
      engagement.lastUpdated = nowRelative();
      db.usage.summary[2].used += 1;
      db.usage.recentActivity.unshift({
        id: id("act"),
        action: `${section} regenerated`,
        engagement: engagement.title,
        user: db.user.fullName,
        timestamp: nowRelative(),
      });
      await saveDb(db);
      json(res, 200, { ok: true });
      return;
    }

    if (url.pathname === "/api/members/invite" && req.method === "POST") {
      const db = await loadDb();
      const body = await parseBody(req);
      const invite = {
        id: id("mem"),
        name: body.email.split("@")[0].replace(/[._-]/g, " "),
        email: body.email,
        role: body.role,
        status: "invited",
        invitedAt: nowRelative(),
      };
      db.members.push(invite);
      await saveDb(db);
      json(res, 201, invite);
      return;
    }

    if (url.pathname.match(/^\/api\/members\/[^/]+$/) && req.method === "PATCH") {
      const db = await loadDb();
      const memberId = url.pathname.split("/").pop();
      const body = await parseBody(req);
      db.members = db.members.map((member) =>
        member.id === memberId ? { ...member, role: body.role || member.role } : member
      );
      await saveDb(db);
      json(res, 200, db.members.find((member) => member.id === memberId));
      return;
    }

    if (url.pathname.match(/^\/api\/members\/[^/]+$/) && req.method === "DELETE") {
      const db = await loadDb();
      const memberId = url.pathname.split("/").pop();
      db.members = db.members.filter((member) => member.id !== memberId);
      await saveDb(db);
      json(res, 200, { ok: true });
      return;
    }

    if (url.pathname === "/api/settings/organization" && req.method === "PATCH") {
      const db = await loadDb();
      const body = await parseBody(req);
      db.organization.name = body.name || db.organization.name;
      db.organization.slug = slugify(db.organization.name);
      await saveDb(db);
      json(res, 200, db.organization);
      return;
    }

    if (url.pathname === "/api/billing/plan" && req.method === "PATCH") {
      const db = await loadDb();
      const body = await parseBody(req);
      const selected = db.billing.plans.find((plan) => plan.name === body.planName);
      if (!selected) {
        json(res, 404, { error: "Plan not found" });
        return;
      }
      db.billing.currentPlan = {
        ...db.billing.currentPlan,
        name: selected.name,
        price: selected.price,
        interval: selected.interval,
        seats: selected.seats ?? db.billing.currentPlan.seats,
      };
      db.organization.plan = selected.name;
      await saveDb(db);
      json(res, 200, db.billing.currentPlan);
      return;
    }

    json(res, 404, { error: "Not found" });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : "Unknown error" });
  }
};

createServer(requestHandler).listen(PORT, () => {
  console.log(`API listening on http://127.0.0.1:${PORT}`);
});

function seedWorkspace(title, client) {
  return {
    lastSaved: "5 minutes ago",
    sourceText: [
      {
        id: id("src"),
        source: "RFP",
        content: `${client} is evaluating a strategic initiative tied to ${title}. The project requires market sizing, competitive analysis, and an implementation roadmap.`,
      },
    ],
    proposalStarter: {
      title: `${title} - Proposal Starter`,
      generatedFrom: 3,
    },
    issueTree: {
      title: `${title} - Issue Tree`,
    },
    workplan: {
      title: `${title} - 12 Week Workplan`,
    },
    regenerationLog: [],
  };
}

function seedMatchedCases(problemType) {
  return [
    {
      id: id("case"),
      fileTitle: `${problemType}_Framework.pdf`,
      engagementTitle: `${problemType} Strategy Reference`,
      confidence: 92,
      confidenceLabel: "Strong",
      rationale: `Strong alignment on problem framing, workstream structure, and reusable consulting modules for ${problemType}.`,
      reusableElements: ["Proposal structure", "Hypothesis tree", "Workplan sequencing"],
      included: true,
    },
    {
      id: id("case"),
      fileTitle: `${problemType}_Template.pptx`,
      engagementTitle: `${problemType} Prior Engagement`,
      confidence: 81,
      confidenceLabel: "Strong",
      rationale: "Relevant strategic framing with similar executive output expectations.",
      reusableElements: ["Deliverable outline", "Executive summary pattern"],
      included: true,
    },
  ];
}

function seedData() {
  return {
    meta: {
      updatedAt: new Date().toISOString(),
    },
    user: {
      id: "user_1",
      fullName: "Sarah Chen",
      email: "sarah@northstar-advisory.com",
      role: "owner",
    },
    organization: {
      id: "org_1",
      name: "Northstar Advisory",
      slug: "northstar-advisory",
      plan: "Team",
      created: "January 15, 2026",
      owner: "Sarah Chen",
      ownerEmail: "sarah@northstar-advisory.com",
    },
    vault: {
      totalDocuments: 47,
      recentlyAdded: [
        "Pricing Strategy Framework - SaaS.pdf",
        "Market Entry Playbook - APAC.pdf",
        "GTM Strategy Template - B2B.pdf",
      ],
    },
    members: [
      {
        id: "mem_owner",
        name: "Sarah Chen",
        email: "sarah@northstar-advisory.com",
        role: "owner",
        status: "active",
        joinedAt: "6 months ago",
      },
      {
        id: "mem_admin",
        name: "Michael Rodriguez",
        email: "michael@northstar-advisory.com",
        role: "admin",
        status: "active",
        joinedAt: "4 months ago",
      },
      {
        id: "mem_editor",
        name: "Emily Watson",
        email: "emily@northstar-advisory.com",
        role: "editor",
        status: "active",
        joinedAt: "2 months ago",
      },
      {
        id: "mem_invite",
        name: "Lisa Anderson",
        email: "lisa@northstar-advisory.com",
        role: "viewer",
        status: "invited",
        invitedAt: "2 days ago",
      },
    ],
    usage: {
      billingPeriod: "Apr 1 - Apr 30, 2026",
      summary: [
        { label: "Active Engagements", used: 3, limit: "Unlimited", icon: "FileText" },
        { label: "Uploads Used", used: 247, limit: 1000, icon: "Upload" },
        { label: "Generations Used", used: 834, limit: 5000, icon: "RefreshCw" },
        { label: "Exports Used", used: 156, limit: 500, icon: "FileDown" },
        { label: "Storage Used", used: 8.4, limit: 50, unit: "GB", icon: "Database" },
      ],
      metrics: [
        { category: "Active Engagements", used: 3, limit: "Unlimited", percentage: 0, resetDate: null, isNearLimit: false, isAtLimit: false },
        { category: "Uploads", used: 247, limit: 1000, percentage: 24.7, resetDate: "May 1, 2026", isNearLimit: false, isAtLimit: false },
        { category: "Artifact Generations", used: 834, limit: 5000, percentage: 16.7, resetDate: "May 1, 2026", isNearLimit: false, isAtLimit: false },
        { category: "Exports", used: 156, limit: 500, percentage: 31.2, resetDate: "May 1, 2026", isNearLimit: false, isAtLimit: false },
        { category: "Storage", used: 8.4, limit: 50, unit: "GB", percentage: 16.8, resetDate: null, isNearLimit: false, isAtLimit: false },
      ],
      recentActivity: [
        { id: "act_1", action: "Proposal Starter generated", engagement: "Market Entry Strategy - Saudi Arabia", user: "Sarah Chen", timestamp: "2 hours ago" },
        { id: "act_2", action: "Issue Tree regenerated", engagement: "Market Entry Strategy - Saudi Arabia", user: "Sarah Chen", timestamp: "3 hours ago" },
        { id: "act_3", action: "File uploaded", engagement: "Digital Transformation Roadmap", user: "Michael Rodriguez", timestamp: "5 hours ago" },
      ],
    },
    billing: {
      hasPaymentIssue: false,
      currentPlan: {
        name: "Team",
        price: 149,
        interval: "month",
        renewalDate: "May 1, 2026",
        status: "Active",
        seats: 5,
        seatsUsed: 3,
      },
      paymentMethod: "•••• 4242",
      plans: [
        {
          name: "Starter",
          price: 0,
          interval: "month",
          description: "For exploring consulting AI workflows",
          seats: 1,
          features: [
            { label: "Seats", value: "1 user" },
            { label: "Active engagements", value: "3 at a time" },
            { label: "Uploads", value: "50/month" },
          ],
        },
        {
          name: "Solo",
          price: 49,
          interval: "month",
          description: "For independent consultants and advisors",
          seats: 1,
          features: [
            { label: "Seats", value: "1 user" },
            { label: "Generations", value: "2,000/month" },
            { label: "Storage", value: "25 GB" },
          ],
        },
        {
          name: "Team",
          price: 149,
          interval: "month",
          description: "For boutique firms and advisory teams",
          seats: 5,
          features: [
            { label: "Seats", value: "Up to 5 users" },
            { label: "Uploads", value: "1,000/month" },
            { label: "Generations", value: "5,000/month" },
          ],
        },
        {
          name: "Enterprise",
          price: null,
          interval: "custom",
          description: "For larger firms with custom requirements",
          seats: null,
          features: [
            { label: "Seats", value: "Unlimited" },
            { label: "Uploads", value: "5,000/month" },
            { label: "Generations", value: "25,000/month" },
          ],
        },
      ],
    },
    settings: {
      privacyContact: "privacy@aicopilot.com",
      supportEmail: "support@aicopilot.com",
      enterpriseEmail: "enterprise@aicopilot.com",
    },
    engagements: [
      {
        id: "eng_ksa",
        title: "Market Entry Strategy - Saudi Arabia",
        client: "Northstar Retail",
        problemType: "Market Entry",
        status: "In Progress",
        lastUpdated: "2 hours ago",
        createdAt: "2026-04-18T15:00:00.000Z",
        objective: "Evaluate market opportunity and define go-to-market approach for Saudi Arabia, UAE, and Egypt.",
        progress: 60,
        outputs: ["Proposal Starter", "Issue Tree", "Workplan"],
        brief:
          "Client seeks to assess expansion opportunity into the Saudi Arabia retail market for a consumer electronics portfolio. Key questions include market timing, entry mode, licensing considerations, competitive landscape, consumer behavior, and logistics requirements.",
        notes: "Board steering committee in week 2. Emphasis on pragmatic implementation sequence.",
        uploads: [
          { id: "up_1", name: "RFP_Northstar_Saudi_Expansion.pdf", size: "1.4 MB", type: "PDF", status: "parsed", uploadedAt: "2 hours ago", pages: 12 },
          { id: "up_2", name: "Client_Email_Chain.docx", size: "280 KB", type: "DOC", status: "parsed", uploadedAt: "2 hours ago", pages: 4 },
        ],
        matchedCases: seedMatchedCases("Market Entry"),
        workspace: seedWorkspace("Market Entry Strategy - Saudi Arabia", "Northstar Retail"),
      },
      {
        id: "eng_digital",
        title: "Digital Transformation Roadmap",
        client: "Global Manufacturing Inc",
        problemType: "Digital Strategy",
        status: "Draft",
        lastUpdated: "1 day ago",
        createdAt: "2026-04-16T12:00:00.000Z",
        objective: "Define phased transformation roadmap across operations, commercial, and data foundations.",
        progress: 25,
        outputs: ["Brief", "Proposal Starter"],
        brief: "Transformation roadmap brief with focus on industrial operations and AI-enabled planning.",
        notes: "",
        uploads: [],
        matchedCases: seedMatchedCases("Digital Strategy"),
        workspace: seedWorkspace("Digital Transformation Roadmap", "Global Manufacturing Inc"),
      },
      {
        id: "eng_cost",
        title: "Cost Optimization Program",
        client: "TechCorp Industries",
        problemType: "Operations",
        status: "Completed",
        lastUpdated: "3 days ago",
        createdAt: "2026-04-10T10:00:00.000Z",
        objective: "Identify structural cost levers and sequence implementation across SG&A and supply chain.",
        progress: 100,
        outputs: ["Proposal Starter", "Issue Tree", "Workplan"],
        brief: "Completed operations optimization program archived for reuse.",
        notes: "",
        uploads: [],
        matchedCases: seedMatchedCases("Operations"),
        workspace: seedWorkspace("Cost Optimization Program", "TechCorp Industries"),
      },
    ],
  };
}
