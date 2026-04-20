const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { URL } = require("node:url");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function createSeed() {
  const orgId = randomUUID();
  const userId = randomUUID();
  const engagementId = randomUUID();
  const now = new Date().toISOString();

  return {
    session: {
      userId,
      organizationId: orgId,
    },
    users: [
      {
        id: userId,
        fullName: "Morgan Lee",
        email: "morgan@altitudeadvisory.com",
        title: "Principal Consultant",
      },
    ],
    organizations: [
      {
        id: orgId,
        name: "Altitude Advisory",
        plan: "Team",
        monthlyRuns: 42,
        monthlyLimit: 120,
        members: [
          {
            id: randomUUID(),
            name: "Morgan Lee",
            email: "morgan@altitudeadvisory.com",
            role: "Admin",
            status: "Active",
          },
          {
            id: randomUUID(),
            name: "Priya Chen",
            email: "priya@altitudeadvisory.com",
            role: "Editor",
            status: "Active",
          },
          {
            id: randomUUID(),
            name: "Jon Alvarez",
            email: "jon@altitudeadvisory.com",
            role: "Viewer",
            status: "Invited",
          },
        ],
      },
    ],
    billing: {
      plan: "Team",
      status: "Active",
      nextInvoiceDate: "2026-05-01",
      amount: 149,
      cardBrand: "Visa",
      cardLast4: "4242",
    },
    settings: {
      privacyMode: true,
      supportEmail: "support@altitudeadvisory.com",
      autoDeleteDays: 180,
    },
    engagements: [
      {
        id: engagementId,
        title: "Northstar Logistics Margin Expansion",
        client: "Northstar Logistics",
        type: "Pricing and operations strategy",
        owner: "Morgan Lee",
        stage: "Workspace",
        updatedAt: now,
        tags: ["Logistics", "Pricing", "Operations"],
        uploads: [
          {
            id: randomUUID(),
            name: "northstar-board-deck.pdf",
            status: "Processed",
            pages: 34,
          },
          {
            id: randomUUID(),
            name: "customer-segmentation.xlsx",
            status: "Processed",
            pages: 6,
          },
        ],
        brief: {
          summary:
            "Northstar wants a proposal starter focused on gross margin recovery, warehouse productivity, and customer segment repricing over the next two quarters.",
          goal:
            "Identify the top profit levers, quantify impact, and outline a 12-week delivery plan with client and consultant responsibilities.",
          ask:
            "Prepare an executive-ready proposal starter and workplan with supporting evidence from prior cases.",
        },
        businessContext: {
          industry: "Third-party logistics",
          currentSituation:
            "Margins have compressed 280 bps over 18 months due to contract drift, rising accessorial complexity, and underutilized warehouse labor.",
          constraints:
            "Leadership wants changes that do not disrupt major customer renewals in Q3 and must preserve service levels for strategic accounts.",
        },
        insights: [
          "Top 15 customers account for 68% of revenue but only 41% of contribution margin.",
          "Warehouse overtime in the Southeast region is 1.8x peer benchmark.",
          "Accessorial charges are billed inconsistently across legacy contracts.",
        ],
        issueTree: [
          {
            title: "Revenue quality",
            children: ["Contract repricing", "Accessorial capture", "Customer mix"],
          },
          {
            title: "Cost-to-serve",
            children: ["Warehouse labor", "Route density", "Exception handling"],
          },
          {
            title: "Execution risk",
            children: ["Renewal timing", "Client adoption", "Data quality"],
          },
        ],
        matchedCases: [
          {
            id: randomUUID(),
            title: "FreightWorks pricing redesign",
            fit: 94,
            blurb:
              "Improved EBITDA by $7.8M through repricing and service-tier rationalization across enterprise accounts.",
          },
          {
            id: randomUUID(),
            title: "HarborShip warehouse reset",
            fit: 88,
            blurb:
              "Reduced overtime 23% by redesigning labor scheduling and slotting logic across three sites.",
          },
        ],
        proposalStarter: {
          hook: "Recover 200 to 300 bps of gross margin within two quarters without jeopardizing strategic renewals.",
          sections: [
            "Situation and stakes",
            "Where value is leaking today",
            "Workstreams and expected impact",
            "Delivery cadence and team",
          ],
        },
        workplan: [
          {
            week: "Weeks 1-2",
            focus: "Diagnostic and data validation",
            output: "Profit pool baseline and customer-segment heatmap",
          },
          {
            week: "Weeks 3-6",
            focus: "Pricing and operations design",
            output: "Repricing playbook and labor reset recommendations",
          },
          {
            week: "Weeks 7-12",
            focus: "Pilot and leadership materials",
            output: "Pilot results, proposal narrative, implementation plan",
          },
        ],
        keyRisks: [
          "Renewal calendar may limit repricing speed for top-tier accounts.",
          "Historical cost allocation is incomplete for two acquired regions.",
          "Client change capacity is constrained due to ERP migration.",
        ],
        referenceWork: [
          "Pricing waterfall diagnostic",
          "Warehouse labor benchmark pack",
          "Client interview guide",
        ],
      },
    ],
  };
}

function readDb() {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(createSeed(), null, 2));
  }
  const raw = fs.readFileSync(DB_PATH, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  if (!parsed || !parsed.session || !Array.isArray(parsed.engagements)) {
    parsed = createSeed();
    fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2));
  }
  return parsed;
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const stream = fs.createReadStream(filePath);
  stream.on("error", () => {
    res.writeHead(404);
    res.end("Not found");
  });
  res.writeHead(200, { "Content-Type": contentType });
  stream.pipe(res);
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request too large"));
      }
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function getCurrentUser(db) {
  return db.users.find((user) => user.id === db.session.userId) || null;
}

function getCurrentOrg(db) {
  return db.organizations.find((org) => org.id === db.session.organizationId) || null;
}

function getDashboard(db) {
  const org = getCurrentOrg(db);
  const engagements = [...db.engagements].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return {
    stats: [
      {
        label: "Active engagements",
        value: engagements.length,
        note: "Workspace and in-flight drafts",
      },
      {
        label: "Proposal runs",
        value: org ? org.monthlyRuns : 0,
        note: "This billing cycle",
      },
      {
        label: "Matched cases",
        value: engagements.reduce((sum, item) => sum + item.matchedCases.length, 0),
        note: "Across all workspaces",
      },
      {
        label: "Team members",
        value: org ? org.members.length : 0,
        note: org ? `${org.plan} plan` : "No plan",
      },
    ],
    engagements,
  };
}

function buildBootstrap(db) {
  return {
    session: db.session,
    user: getCurrentUser(db),
    organization: getCurrentOrg(db),
    dashboard: getDashboard(db),
    billing: db.billing,
    settings: db.settings,
  };
}

function makeGeneratedArtifacts(engagement) {
  const title = engagement.title || engagement.client || "Consulting Engagement";
  const client = engagement.client || "the client";
  const goal = engagement.brief.goal || "clarify priorities and build a plan";
  const summary = engagement.brief.summary || "Draft a sharper consultant-ready brief.";

  engagement.insights = [
    `Leadership is aligned on urgency, but the current brief for ${client} is still too broad for immediate execution.`,
    `The strongest early win is to turn "${goal}" into a quantified, time-bound outcome with named owners.`,
    `Prior work suggests the most persuasive proposal narrative will combine diagnostic evidence with a pragmatic first-90-days plan.`,
  ];

  engagement.issueTree = [
    {
      title: "Why now",
      children: ["Business pressure", "Leadership mandate", "Timing constraints"],
    },
    {
      title: "Where value sits",
      children: ["Revenue growth", "Cost efficiency", "Operating model"],
    },
    {
      title: "How to execute",
      children: ["Decision cadence", "Team roles", "Pilot and rollout"],
    },
  ];

  engagement.matchedCases = [
    {
      id: randomUUID(),
      title: `${title} analog: commercial acceleration`,
      fit: 91,
      blurb:
        "Comparable transformation that combined opportunity sizing, leadership workshops, and a phased workplan to secure executive sign-off.",
    },
    {
      id: randomUUID(),
      title: `${title} analog: operating model redesign`,
      fit: 86,
      blurb:
        "Case example focused on turning a broad strategic brief into a board-ready proposal with sequenced workstreams and measurable outcomes.",
    },
  ];

  engagement.proposalStarter = {
    hook: `A focused consulting sprint for ${client} to ${goal.toLowerCase()} while keeping leadership aligned on the highest-value decisions.`,
    sections: [
      "Executive context",
      "Key problems to solve",
      "Approach and workstreams",
      "Indicative timeline and outputs",
      "Risks, dependencies, and team structure",
    ],
  };

  engagement.workplan = [
    {
      week: "Week 1",
      focus: "Clarify scope and success metrics",
      output: "Approved problem statement and steering questions",
    },
    {
      week: "Weeks 2-4",
      focus: "Diagnostic and evidence gathering",
      output: "Initial fact base, hypotheses, and opportunity sizing",
    },
    {
      week: "Weeks 5-8",
      focus: "Recommendation design",
      output: "Draft proposal storyline and workstream architecture",
    },
    {
      week: "Weeks 9-12",
      focus: "Executive alignment and final packaging",
      output: "Final proposal starter, implementation roadmap, and risk plan",
    },
  ];

  engagement.keyRisks = [
    `Scope could sprawl if ${summary.toLowerCase()} is not narrowed into explicit choices.`,
    "Stakeholder interviews may reveal competing success metrics across leadership roles.",
    "The final proposal may over-index on analysis unless deliverables and decision points are locked early.",
  ];

  engagement.referenceWork = [
    "Executive proposal starter template",
    "Issue tree workshop guide",
    "Matched case evidence summary",
    "12-week workplan blueprint",
  ];
}

async function handleApi(req, res, url) {
  const db = readDb();
  const method = req.method || "GET";
  const pathname = url.pathname;

  if (method === "GET" && pathname === "/api/bootstrap") {
    return sendJson(res, 200, buildBootstrap(db));
  }

  if (method === "POST" && pathname === "/api/auth/login") {
    const body = await collectBody(req);
    const email = (body.email || "").trim().toLowerCase();
    let user = db.users.find((entry) => entry.email.toLowerCase() === email);
    if (!user) {
      user = {
        id: randomUUID(),
        fullName: body.fullName || "New User",
        email: email || `user-${Date.now()}@example.com`,
        title: "Consultant",
      };
      db.users.push(user);
    }
    db.session.userId = user.id;
    writeDb(db);
    return sendJson(res, 200, buildBootstrap(db));
  }

  if (method === "POST" && pathname === "/api/auth/signup") {
    const body = await collectBody(req);
    const user = {
      id: randomUUID(),
      fullName: body.fullName || "New User",
      email: (body.email || `user-${Date.now()}@example.com`).trim().toLowerCase(),
      title: body.title || "Consultant",
    };
    db.users.push(user);
    db.session.userId = user.id;
    const org = getCurrentOrg(db);
    if (org) {
      org.members.push({
        id: randomUUID(),
        name: user.fullName,
        email: user.email,
        role: "Editor",
        status: "Active",
      });
    }
    writeDb(db);
    return sendJson(res, 201, buildBootstrap(db));
  }

  if (method === "POST" && pathname === "/api/engagements") {
    const body = await collectBody(req);
    const engagement = {
      id: randomUUID(),
      title: body.title || "Untitled Engagement",
      client: body.client || "New Client",
      type: body.type || "Strategy",
      owner: body.owner || getCurrentUser(db)?.fullName || "Unassigned",
      stage: "Workspace",
      updatedAt: new Date().toISOString(),
      tags: body.tags || ["New"],
      uploads: [],
      brief: {
        summary: body.summary || "",
        goal: body.goal || "",
        ask: body.ask || "",
      },
      businessContext: {
        industry: body.industry || "",
        currentSituation: "",
        constraints: "",
      },
      insights: [],
      issueTree: [],
      matchedCases: [],
      proposalStarter: {
        hook: "",
        sections: [],
      },
      workplan: [],
      keyRisks: [],
      referenceWork: [],
    };
    db.engagements.unshift(engagement);
    const org = getCurrentOrg(db);
    if (org) {
      org.monthlyRuns += 1;
    }
    writeDb(db);
    return sendJson(res, 201, { engagement, dashboard: getDashboard(db) });
  }

  const engagementMatch = pathname.match(/^\/api\/engagements\/([^/]+)$/);
  if (engagementMatch && method === "GET") {
    const engagement = db.engagements.find((item) => item.id === engagementMatch[1]);
    if (!engagement) {
      return sendJson(res, 404, { error: "Engagement not found" });
    }
    return sendJson(res, 200, { engagement });
  }

  if (engagementMatch && method === "PATCH") {
    const body = await collectBody(req);
    const engagement = db.engagements.find((item) => item.id === engagementMatch[1]);
    if (!engagement) {
      return sendJson(res, 404, { error: "Engagement not found" });
    }
    Object.assign(engagement, body, { updatedAt: new Date().toISOString() });
    writeDb(db);
    return sendJson(res, 200, { engagement, dashboard: getDashboard(db) });
  }

  const generateMatch = pathname.match(/^\/api\/engagements\/([^/]+)\/generate$/);
  if (generateMatch && method === "POST") {
    const engagement = db.engagements.find((item) => item.id === generateMatch[1]);
    if (!engagement) {
      return sendJson(res, 404, { error: "Engagement not found" });
    }
    makeGeneratedArtifacts(engagement);
    engagement.updatedAt = new Date().toISOString();
    const org = getCurrentOrg(db);
    if (org) {
      org.monthlyRuns += 1;
    }
    writeDb(db);
    return sendJson(res, 200, { engagement, dashboard: getDashboard(db) });
  }

  const uploadMatch = pathname.match(/^\/api\/engagements\/([^/]+)\/upload$/);
  if (uploadMatch && method === "POST") {
    const body = await collectBody(req);
    const engagement = db.engagements.find((item) => item.id === uploadMatch[1]);
    if (!engagement) {
      return sendJson(res, 404, { error: "Engagement not found" });
    }
    engagement.uploads.unshift({
      id: randomUUID(),
      name: body.name || "uploaded-file.pdf",
      status: "Processed",
      pages: body.pages || 12,
    });
    engagement.updatedAt = new Date().toISOString();
    writeDb(db);
    return sendJson(res, 200, { engagement });
  }

  if (method === "POST" && pathname === "/api/organizations/invite") {
    const body = await collectBody(req);
    const org = getCurrentOrg(db);
    if (!org) {
      return sendJson(res, 404, { error: "Organization not found" });
    }
    org.members.push({
      id: randomUUID(),
      name: body.name || "New Member",
      email: body.email || `invite-${Date.now()}@example.com`,
      role: body.role || "Viewer",
      status: "Invited",
    });
    writeDb(db);
    return sendJson(res, 201, { organization: org });
  }

  const memberMatch = pathname.match(/^\/api\/organizations\/members\/([^/]+)$/);
  if (memberMatch && method === "PATCH") {
    const body = await collectBody(req);
    const org = getCurrentOrg(db);
    if (!org) {
      return sendJson(res, 404, { error: "Organization not found" });
    }
    const member = org.members.find((item) => item.id === memberMatch[1]);
    if (!member) {
      return sendJson(res, 404, { error: "Member not found" });
    }
    Object.assign(member, body);
    writeDb(db);
    return sendJson(res, 200, { organization: org });
  }

  if (method === "PATCH" && pathname === "/api/settings") {
    const body = await collectBody(req);
    db.settings = { ...db.settings, ...body };
    writeDb(db);
    return sendJson(res, 200, { settings: db.settings });
  }

  if (method === "GET" && pathname === "/api/export") {
    const dashboard = getDashboard(db);
    const lines = [
      "AI Consultant Export",
      "",
      `Organization: ${getCurrentOrg(db)?.name || "Unknown"}`,
      `Active engagements: ${dashboard.engagements.length}`,
      "",
      ...dashboard.engagements.map(
        (item) => `- ${item.title} | ${item.client} | ${new Date(item.updatedAt).toLocaleDateString()}`
      ),
    ];
    const body = lines.join("\n");
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ai-consultant-export.txt"',
    });
    res.end(body);
    return;
  }

  return sendJson(res, 404, { error: "API route not found" });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    let filePath = path.join(PUBLIC_DIR, url.pathname === "/" ? "index.html" : url.pathname);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      sendFile(res, filePath);
      return;
    }
    sendFile(res, path.join(PUBLIC_DIR, "index.html"));
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Unexpected server error" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`AI Consultant running at http://127.0.0.1:${PORT}`);
});
