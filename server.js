const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID, createHash } = require("node:crypto");
const { URL } = require("node:url");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.2";
const SESSION_COOKIE = "ai_consultant_session";
const TRUSTED_VAULT_SOURCES = [
  {
    id: "accenture-case-studies",
    name: "Accenture",
    domain: "accenture.com",
    listUrl: "https://www.accenture.com/us-en/insights/strategy/reinvented-with-accenture",
    allowedPathPrefixes: ["/us-en/case-studies/"],
    extractor: "accenture",
  },
  {
    id: "deloitte-operate-case-studies",
    name: "Deloitte",
    domain: "deloitte.com",
    listUrl: "https://www.deloitte.com/us/en/services/consulting/services/operate-case-studies.html",
    allowedPathPrefixes: ["/content/dam/"],
    allowedUrlPattern: "case-study",
    allowedExtensions: [".pdf"],
    extractor: "deloitte",
  },
];

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function sanitizeFilename(value) {
  return String(value || "upload.bin")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "upload.bin";
}

function getUploadStorageDir(engagementId) {
  return path.join(UPLOADS_DIR, engagementId);
}

function ensureUploadDir(engagementId) {
  const dir = getUploadStorageDir(engagementId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function hashPassword(value) {
  return createHash("sha256").update(String(value || "")).digest("hex");
}

function estimatePagesFromText(text) {
  const length = String(text || "").trim().length;
  if (!length) return 1;
  return Math.max(1, Math.ceil(length / 2200));
}

function getUploadPreview(rawText, limit = 4000) {
  return collapseWhitespace(String(rawText || "")).slice(0, limit);
}

function extractTextFromUpload(filename, mimeType, buffer) {
  const ext = path.extname(filename).toLowerCase();
  const textTypes = new Set([".txt", ".md", ".csv", ".json"]);
  if (String(mimeType || "").startsWith("text/") || textTypes.has(ext)) {
    return {
      extractedText: buffer.toString("utf8"),
      extractionStatus: "Extracted",
    };
  }

  if (ext === ".pdf") {
    return {
      extractedText: "",
      extractionStatus: "Stored",
      extractionNote: "PDF preview is not extracted in this prototype yet.",
    };
  }

  if (ext === ".docx" || ext === ".doc") {
    return {
      extractedText: "",
      extractionStatus: "Stored",
      extractionNote: "Word document parsing is not enabled in this prototype yet.",
    };
  }

  if (ext === ".xlsx" || ext === ".xls") {
    return {
      extractedText: "",
      extractionStatus: "Stored",
      extractionNote: "Spreadsheet parsing is not enabled in this prototype yet.",
    };
  }

  return {
    extractedText: "",
    extractionStatus: "Stored",
    extractionNote: "This file type is stored, but preview extraction is not available yet.",
  };
}

function ensureEngagementDefaults(engagement) {
  if (!Array.isArray(engagement.uploads)) {
    engagement.uploads = [];
  }
  if (!Array.isArray(engagement.versions)) {
    engagement.versions = [];
  }
}

function snapshotEngagement(engagement, label) {
  ensureEngagementDefaults(engagement);
  engagement.versions.unshift({
    id: randomUUID(),
    label,
    createdAt: new Date().toISOString(),
    snapshot: {
      brief: engagement.brief,
      businessContext: engagement.businessContext,
      insights: engagement.insights,
      issueTree: engagement.issueTree,
      proposalStarter: engagement.proposalStarter,
      workplan: engagement.workplan,
      keyRisks: engagement.keyRisks,
      referenceWork: engagement.referenceWork,
      uploads: engagement.uploads,
    },
  });
  engagement.versions = engagement.versions.slice(0, 20);
}

function storeUploadForEngagement(engagement, body) {
  ensureEngagementDefaults(engagement);
  const uploadId = randomUUID();
  const originalName = sanitizeFilename(body.name || "upload.bin");
  const mimeType = String(body.mimeType || MIME_TYPES[path.extname(originalName).toLowerCase()] || "application/octet-stream");
  const size = Number(body.size || 0);

  if (!body.base64Data) {
    const manualUpload = {
      id: uploadId,
      name: originalName,
      mimeType,
      size,
      status: "Added",
      pages: Number(body.pages || 1),
      extractedText: "",
      previewText: "",
      extractionStatus: "Not processed",
      extractionNote: "No file contents were provided.",
      storedAt: new Date().toISOString(),
      storedFileName: null,
    };
    engagement.uploads.unshift(manualUpload);
    return manualUpload;
  }

  const buffer = Buffer.from(String(body.base64Data), "base64");
  const storedFileName = `${uploadId}-${originalName}`;
  const uploadDir = ensureUploadDir(engagement.id);
  fs.writeFileSync(path.join(uploadDir, storedFileName), buffer);

  const extracted = extractTextFromUpload(originalName, mimeType, buffer);
  const upload = {
    id: uploadId,
    name: originalName,
    mimeType,
    size: size || buffer.byteLength,
    status: extracted.extractionStatus,
    pages: extracted.extractedText ? estimatePagesFromText(extracted.extractedText) : Number(body.pages || 1),
    extractedText: extracted.extractedText,
    previewText: getUploadPreview(extracted.extractedText),
    extractionStatus: extracted.extractionStatus,
    extractionNote: extracted.extractionNote || null,
    storedAt: new Date().toISOString(),
    storedFileName,
  };
  engagement.uploads.unshift(upload);
  return upload;
}

function getUploadById(engagement, uploadId) {
  ensureEngagementDefaults(engagement);
  return engagement.uploads.find((item) => item.id === uploadId) || null;
}

function createSeed() {
  const orgId = randomUUID();
  const userId = randomUUID();
  const engagementId = randomUUID();
  const now = new Date().toISOString();
  const seedPassword = "demo1234";

  return {
    sessions: [],
    users: [
      {
        id: userId,
        fullName: "Morgan Lee",
        email: "morgan@altitudeadvisory.com",
        title: "Principal Consultant",
        passwordHash: hashPassword(seedPassword),
        organizationIds: [orgId],
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
    vault: {
      cases: [],
      internalAssets: [
        {
          id: randomUUID(),
          title: "Executive proposal starter template",
          type: "Template",
          origin: "Internal knowledge",
          focus: "Proposal development",
        },
        {
          id: randomUUID(),
          title: "Issue tree workshop guide",
          type: "Playbook",
          origin: "Internal knowledge",
          focus: "Problem structuring",
        },
        {
          id: randomUUID(),
          title: "12-week workplan blueprint",
          type: "Delivery asset",
          origin: "Internal knowledge",
          focus: "Program planning",
        },
      ],
      derivedPatterns: [
        {
          id: randomUUID(),
          title: "Commercial acceleration pattern",
          type: "Pattern",
          description: "Reusable sequence for diagnosing growth leakage, prioritizing interventions, and landing a 90-day recovery plan.",
        },
        {
          id: randomUUID(),
          title: "Operating model redesign pattern",
          type: "Pattern",
          description: "Reusable structure for role clarity, governance reset, and execution cadence design.",
        },
      ],
      sources: TRUSTED_VAULT_SOURCES.map((source) => ({
        ...source,
        enabled: true,
        lastImportedAt: null,
        lastImportCount: 0,
        lastError: null,
      })),
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

function ensureVault(db) {
  if (!db.vault || typeof db.vault !== "object") {
    db.vault = { cases: [], sources: [] };
  }
  if (!Array.isArray(db.vault.cases)) {
    db.vault.cases = [];
  }
  if (!Array.isArray(db.vault.internalAssets)) {
    db.vault.internalAssets = [
      {
        id: randomUUID(),
        title: "Executive proposal starter template",
        type: "Template",
        origin: "Internal knowledge",
        focus: "Proposal development",
      },
      {
        id: randomUUID(),
        title: "Issue tree workshop guide",
        type: "Playbook",
        origin: "Internal knowledge",
        focus: "Problem structuring",
      },
      {
        id: randomUUID(),
        title: "12-week workplan blueprint",
        type: "Delivery asset",
        origin: "Internal knowledge",
        focus: "Program planning",
      },
    ];
  }
  if (!Array.isArray(db.vault.derivedPatterns)) {
    db.vault.derivedPatterns = [
      {
        id: randomUUID(),
        title: "Commercial acceleration pattern",
        type: "Pattern",
        description:
          "Reusable sequence for diagnosing growth leakage, prioritizing interventions, and landing a 90-day recovery plan.",
      },
      {
        id: randomUUID(),
        title: "Operating model redesign pattern",
        type: "Pattern",
        description: "Reusable structure for role clarity, governance reset, and execution cadence design.",
      },
    ];
  }
  const existingSources = Array.isArray(db.vault.sources) ? db.vault.sources : [];
  db.vault.sources = TRUSTED_VAULT_SOURCES.map((source) => {
    const match = existingSources.find((item) => item.id === source.id) || {};
    return {
      ...source,
      enabled: match.enabled !== false,
      lastImportedAt: match.lastImportedAt || null,
      lastImportCount: Number(match.lastImportCount || 0),
      lastError: match.lastError || null,
    };
  });
  db.vault.cases = db.vault.cases.filter((item) =>
    db.vault.sources.some(
      (source) =>
        source.id === item.sourceId &&
        source.domain === item.sourceDomain &&
        matchesSourceRules(item.url, source)
    )
  );
  return db.vault;
}

function ensureSessions(db) {
  if (!Array.isArray(db.sessions)) {
    db.sessions = [];
  }
  return db.sessions;
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
  if (!parsed || !Array.isArray(parsed.engagements)) {
    parsed = createSeed();
  }
  ensureVault(parsed);
  ensureSessions(parsed);
  parsed.engagements.forEach((engagement) => ensureEngagementDefaults(engagement));
  fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2));
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

function sendJsonWithHeaders(res, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    ...headers,
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
      if (raw.length > 40_000_000) {
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

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  return Object.fromEntries(
    raw
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const separator = item.indexOf("=");
        if (separator === -1) return [item, ""];
        return [item.slice(0, separator), decodeURIComponent(item.slice(separator + 1))];
      })
  );
}

function createSession(db, userId, organizationId) {
  ensureSessions(db);
  const session = {
    id: randomUUID(),
    userId,
    organizationId,
    createdAt: new Date().toISOString(),
  };
  db.sessions = db.sessions.filter((item) => item.userId !== userId);
  db.sessions.push(session);
  return session;
}

function getRequestSession(db, req) {
  ensureSessions(db);
  const sessionId = parseCookies(req)[SESSION_COOKIE];
  if (!sessionId) return null;
  return db.sessions.find((item) => item.id === sessionId) || null;
}

function getCurrentUser(db, session) {
  if (!session) return null;
  return db.users.find((user) => user.id === session.userId) || null;
}

function getCurrentOrg(db, session) {
  if (!session) return null;
  return db.organizations.find((org) => org.id === session.organizationId) || null;
}

function sessionCookieHeader(sessionId) {
  return `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax`;
}

function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function requireAuth(db, req, res) {
  const session = getRequestSession(db, req);
  const user = getCurrentUser(db, session);
  const organization = getCurrentOrg(db, session);
  if (!session || !user || !organization) {
    sendJson(res, 401, { error: "Authentication required" });
    return null;
  }
  return { session, user, organization };
}

function getProjectArtifacts(db) {
  return db.engagements
    .flatMap((engagement) =>
      (engagement.uploads || []).map((upload) => ({
        id: upload.id,
        engagementId: engagement.id,
        engagementTitle: engagement.title,
        name: upload.name,
        status: upload.status,
        pages: upload.pages,
        size: upload.size || 0,
        storedAt: upload.storedAt || engagement.updatedAt,
      }))
    )
    .sort((a, b) => String(b.storedAt || "").localeCompare(String(a.storedAt || "")));
}

function getDashboard(db, session) {
  const org = getCurrentOrg(db, session);
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

function getVaultSummary(db) {
  const vault = ensureVault(db);
  const cases = [...vault.cases].sort((a, b) => {
    return String(b.importedAt || "").localeCompare(String(a.importedAt || ""));
  });
  const internalAssets = [...vault.internalAssets];
  const derivedPatterns = [...vault.derivedPatterns];
  const projectArtifacts = getProjectArtifacts(db);

  return {
    positioning: {
      title: "Trusted internal knowledge, enriched by public analog cases",
      summary:
        "The vault is anchored in internal assets and project artifacts. Public consulting cases act as an external evidence layer that seeds analogs, proof points, and retrieval.",
    },
    totals: {
      internalAssetCount: internalAssets.length,
      publicCaseCount: cases.length,
      projectArtifactCount: projectArtifacts.length,
      derivedPatternCount: derivedPatterns.length,
      knowledgeObjectCount: internalAssets.length + cases.length + projectArtifacts.length,
    },
    sourceCount: vault.sources.filter((source) => source.enabled).length,
    sources: vault.sources,
    internalAssets,
    derivedPatterns,
    projectArtifacts,
    recentCases: cases.slice(0, 8),
    cases,
  };
}

function buildBootstrap(db, session) {
  return {
    session: session
      ? {
          id: session.id,
          userId: session.userId,
          organizationId: session.organizationId,
        }
      : null,
    user: getCurrentUser(db, session),
    organization: getCurrentOrg(db, session),
    dashboard: session ? getDashboard(db, session) : { stats: [], engagements: [] },
    vault: getVaultSummary(db),
    billing: db.billing,
    settings: db.settings,
  };
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function collapseWhitespace(value) {
  return decodeHtmlEntities(String(value || "").replace(/\s+/g, " ")).trim();
}

function stripTags(value) {
  return collapseWhitespace(String(value || "").replace(/<[^>]+>/g, " "));
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isTrustedUrl(urlString, source) {
  try {
    const parsed = new URL(urlString);
    if (!(parsed.protocol.startsWith("http") && parsed.hostname.endsWith(source.domain))) {
      return false;
    }
    if (Array.isArray(source.allowedPathPrefixes) && source.allowedPathPrefixes.length) {
      return source.allowedPathPrefixes.some((prefix) => parsed.pathname.startsWith(prefix));
    }
    if (source.allowedUrlPattern) {
      return parsed.pathname.toLowerCase().includes(String(source.allowedUrlPattern).toLowerCase());
    }
    return true;
  } catch {
    return false;
  }
}

function matchesSourceRules(urlString, source) {
  try {
    const parsed = new URL(urlString);
    if (Array.isArray(source.allowedPathPrefixes) && source.allowedPathPrefixes.length) {
      if (!source.allowedPathPrefixes.some((prefix) => parsed.pathname.startsWith(prefix))) {
        return false;
      }
    }
    if (source.allowedUrlPattern) {
      if (!parsed.pathname.toLowerCase().includes(String(source.allowedUrlPattern).toLowerCase())) {
        return false;
      }
    }
    if (source.allowedExtensions && source.allowedExtensions.length) {
      if (!source.allowedExtensions.some((ext) => parsed.pathname.toLowerCase().endsWith(ext.toLowerCase()))) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

function toTrustedAbsoluteUrl(value, source) {
  try {
    const resolved = new URL(value, source.listUrl).toString();
    return isTrustedUrl(resolved, source) && matchesSourceRules(resolved, source) ? resolved : null;
  } catch {
    return null;
  }
}

function getMetaContent(html, attribute, name) {
  const expression = new RegExp(
    `<meta[^>]+${attribute}=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const reverseExpression = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${name}["'][^>]*>`,
    "i"
  );
  return collapseWhitespace(
    html.match(expression)?.[1] || html.match(reverseExpression)?.[1] || ""
  );
}

function extractJsonLdObjects(html) {
  const objects = [];
  const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      objects.push(parsed);
    } catch {
      continue;
    }
  }
  return objects;
}

function collectJsonLdCandidates(node, bucket = []) {
  if (!node) return bucket;
  if (Array.isArray(node)) {
    node.forEach((item) => collectJsonLdCandidates(item, bucket));
    return bucket;
  }
  if (typeof node !== "object") {
    return bucket;
  }

  const title = collapseWhitespace(node.headline || node.name || node.title || "");
  const url = collapseWhitespace(
    node.url || node["@id"] || node.mainEntityOfPage?.["@id"] || node.mainEntityOfPage?.url || ""
  );
  const description = collapseWhitespace(node.description || node.abstract || "");
  const publishedAt = collapseWhitespace(node.datePublished || node.dateCreated || "");

  if (title && url) {
    bucket.push({ title, url, summary: description, publishedAt });
  }

  if (Array.isArray(node.itemListElement)) {
    node.itemListElement.forEach((item) => collectJsonLdCandidates(item.item || item, bucket));
  }

  Object.values(node).forEach((value) => {
    if (value && typeof value === "object") {
      collectJsonLdCandidates(value, bucket);
    }
  });
  return bucket;
}

function extractAnchorCandidates(html, source) {
  const bucket = [];
  const pattern = /<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    const url = toTrustedAbsoluteUrl(match[2], source);
    const title = stripTags(match[3]);
    if (!url || title.length < 18) continue;
    if (/^(read more|learn more|view more|explore)$/i.test(title)) continue;
    if (!/(case|impact|result|transform|growth|pricing|operations|strategy|client)/i.test(title)) {
      continue;
    }
    bucket.push({ title, url, summary: "", publishedAt: "" });
  }
  return bucket;
}

function normalizeImportedCase(candidate, source) {
  const rawUrl = toTrustedAbsoluteUrl(candidate.url, source);
  const fallbackTitle = rawUrl
    ? decodeURIComponent(rawUrl.split("/").pop() || "")
        .replace(/\.[a-z0-9]+$/i, "")
        .replace(/[-_]+/g, " ")
    : "";
  const title = collapseWhitespace(candidate.title || fallbackTitle);
  const url = rawUrl;
  if (!title || !url) return null;

  return {
    title,
    url,
    summary: collapseWhitespace(candidate.summary || ""),
    publishedAt: collapseWhitespace(candidate.publishedAt || ""),
  };
}

function extractAccentureCandidates(html, source) {
  const seen = new Set();
  const candidates = [];
  const pattern = /href=(["'])(.*?)\1/gi;
  for (const match of html.matchAll(pattern)) {
    const url = toTrustedAbsoluteUrl(match[2], source);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    candidates.push({
      title: "",
      url,
      summary: "",
      publishedAt: "",
    });
  }
  return candidates;
}

function extractDeloitteCandidates(html, source) {
  const seen = new Set();
  const candidates = [];
  const pattern = /href=(["'])(.*?)\1/gi;
  for (const match of html.matchAll(pattern)) {
    const url = toTrustedAbsoluteUrl(match[2], source);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    candidates.push({
      title: "",
      url,
      summary: "Imported from Deloitte case-study PDF link.",
      publishedAt: "",
    });
  }
  return candidates;
}

function extractListingCandidates(html, source) {
  if (source.extractor === "accenture") {
    return extractAccentureCandidates(html, source)
      .map((item) => normalizeImportedCase(item, source))
      .filter(Boolean);
  }
  if (source.extractor === "deloitte") {
    return extractDeloitteCandidates(html, source)
      .map((item) => normalizeImportedCase(item, source))
      .filter(Boolean);
  }

  const candidates = [];
  for (const jsonLd of extractJsonLdObjects(html)) {
    const extracted = collectJsonLdCandidates(jsonLd).map((item) => normalizeImportedCase(item, source));
    candidates.push(...extracted.filter(Boolean));
  }
  candidates.push(
    ...extractAnchorCandidates(html, source).map((item) => normalizeImportedCase(item, source)).filter(Boolean)
  );

  return uniqueBy(candidates, (item) => item.url).filter((item) => item.url !== source.listUrl);
}

function extractParagraphSummary(html) {
  const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripTags(match[1]))
    .filter((text) => text.length > 80);
  return paragraphs.slice(0, 2).join(" ");
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "AI-Consultant-Vault/1.0 (+local prototype)",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.text();
}

async function enrichImportedCase(candidate, source) {
  if (/\.pdf($|\?)/i.test(candidate.url)) {
    return candidate;
  }
  try {
    const html = await fetchHtml(candidate.url);
    const jsonLdCandidates = extractJsonLdObjects(html)
      .flatMap((item) => collectJsonLdCandidates(item))
      .map((item) => normalizeImportedCase(item, source))
      .filter(Boolean);
    const best = jsonLdCandidates.find((item) => item.url === candidate.url) || jsonLdCandidates[0] || null;
    return {
      ...candidate,
      title: best?.title || collapseWhitespace(getMetaContent(html, "property", "og:title")) || candidate.title,
      summary:
        best?.summary ||
        collapseWhitespace(getMetaContent(html, "property", "og:description")) ||
        collapseWhitespace(getMetaContent(html, "name", "description")) ||
        extractParagraphSummary(html) ||
        candidate.summary,
      publishedAt: best?.publishedAt || candidate.publishedAt,
    };
  } catch {
    return candidate;
  }
}

async function importVaultCases(db, sourceId, limit = 12) {
  const vault = ensureVault(db);
  const selectedSources = vault.sources.filter((source) => source.enabled && (!sourceId || source.id === sourceId));
  if (!selectedSources.length) {
    throw new Error("Trusted source not found");
  }

  const imported = [];
  for (const source of selectedSources) {
    try {
      const html = await fetchHtml(source.listUrl);
      const candidates = extractListingCandidates(html, source).slice(0, Math.max(1, Math.min(limit, 8)));
      const enriched = [];
      for (const candidate of candidates) {
        enriched.push(await enrichImportedCase(candidate, source));
      }

      const fresh = uniqueBy(enriched, (item) => item.url)
        .filter((item) => !vault.cases.some((entry) => entry.url === item.url))
        .map((item) => ({
          id: randomUUID(),
          sourceId: source.id,
          sourceName: source.name,
          sourceDomain: source.domain,
          title: item.title,
          summary: item.summary,
          url: item.url,
          publishedAt: item.publishedAt || null,
          importedAt: new Date().toISOString(),
        }));

      vault.cases.unshift(...fresh);
      source.lastImportedAt = new Date().toISOString();
      source.lastImportCount = fresh.length;
      source.lastError = null;
      imported.push(...fresh);
    } catch (error) {
      source.lastImportedAt = new Date().toISOString();
      source.lastImportCount = 0;
      source.lastError = error.message || "Import failed";
    }
  }

  vault.cases = uniqueBy(vault.cases, (item) => item.url).sort((a, b) =>
    String(b.importedAt || "").localeCompare(String(a.importedAt || ""))
  );
  return imported;
}

function buildFallbackArtifacts(engagement) {
  const title = engagement.title || engagement.client || "Consulting Engagement";
  const client = engagement.client || "the client";
  const goal = engagement.brief.goal || "clarify priorities and build a plan";
  const summary = engagement.brief.summary || "Draft a sharper consultant-ready brief.";

  return {
    businessContext: {
      currentSituation: `${client} needs a tighter case for change and a clearer fact base before leadership can commit to a proposal scope.`,
      constraints:
        "The team needs a practical plan that sharpens the brief quickly without creating avoidable stakeholder churn or over-analysis.",
    },
    insights: [
      `Leadership is aligned on urgency, but the current brief for ${client} is still too broad for immediate execution.`,
      `The strongest early win is to turn "${goal}" into a quantified, time-bound outcome with named owners.`,
      "The proposal will be stronger if the storyline pairs diagnostic evidence with a pragmatic first-90-days plan.",
    ],
    issueTree: [
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
    ],
    matchedCases: [
      {
        title: `${title} analog: commercial acceleration`,
        fit: 91,
        blurb:
          "Comparable transformation that combined opportunity sizing, leadership workshops, and a phased workplan to secure executive sign-off.",
      },
      {
        title: `${title} analog: operating model redesign`,
        fit: 86,
        blurb:
          "Case example focused on turning a broad strategic brief into a board-ready proposal with sequenced workstreams and measurable outcomes.",
      },
    ],
    proposalStarter: {
      hook: `A focused consulting sprint for ${client} to ${goal.toLowerCase()} while keeping leadership aligned on the highest-value decisions.`,
      sections: [
        "Executive context",
        "Key problems to solve",
        "Approach and workstreams",
        "Indicative timeline and outputs",
        "Risks, dependencies, and team structure",
      ],
    },
    workplan: [
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
    ],
    keyRisks: [
      `Scope could sprawl if ${summary.toLowerCase()} is not narrowed into explicit choices.`,
      "Stakeholder interviews may reveal competing success metrics across leadership roles.",
      "The final proposal may over-index on analysis unless deliverables and decision points are locked early.",
    ],
    referenceWork: [
      "Executive proposal starter template",
      "Issue tree workshop guide",
      "Matched case evidence summary",
      "12-week workplan blueprint",
    ],
  };
}

function generationSchema() {
  return {
    name: "engagement_artifacts",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: [
        "businessContext",
        "insights",
        "issueTree",
        "matchedCases",
        "proposalStarter",
        "workplan",
        "keyRisks",
        "referenceWork",
      ],
      properties: {
        businessContext: {
          type: "object",
          additionalProperties: false,
          required: ["currentSituation", "constraints"],
          properties: {
            currentSituation: { type: "string" },
            constraints: { type: "string" },
          },
        },
        insights: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 5,
        },
        issueTree: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "children"],
            properties: {
              title: { type: "string" },
              children: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 4,
              },
            },
          },
          minItems: 3,
          maxItems: 4,
        },
        matchedCases: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["title", "fit", "blurb"],
            properties: {
              title: { type: "string" },
              fit: { type: "integer", minimum: 60, maximum: 99 },
              blurb: { type: "string" },
            },
          },
          minItems: 2,
          maxItems: 3,
        },
        proposalStarter: {
          type: "object",
          additionalProperties: false,
          required: ["hook", "sections"],
          properties: {
            hook: { type: "string" },
            sections: {
              type: "array",
              items: { type: "string" },
              minItems: 4,
              maxItems: 6,
            },
          },
        },
        workplan: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["week", "focus", "output"],
            properties: {
              week: { type: "string" },
              focus: { type: "string" },
              output: { type: "string" },
            },
          },
          minItems: 3,
          maxItems: 5,
        },
        keyRisks: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 5,
        },
        referenceWork: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 5,
        },
      },
    },
  };
}

function extractOutputText(responseBody) {
  if (typeof responseBody.output_text === "string" && responseBody.output_text.trim()) {
    return responseBody.output_text.trim();
  }

  const parts = [];
  for (const item of responseBody.output || []) {
    if (item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const contentItem of item.content) {
      if (contentItem.type === "output_text" && typeof contentItem.text === "string") {
        parts.push(contentItem.text);
      }
    }
  }
  return parts.join("\n").trim();
}

function buildGenerationPrompt(engagement) {
  const uploadSummary = engagement.uploads.length
    ? engagement.uploads
        .map((upload) => {
          const excerpt = upload.previewText ? ` Excerpt: ${upload.previewText.slice(0, 320)}` : "";
          return `${upload.name} (${upload.status}, ${upload.pages} pages).${excerpt}`;
        })
        .join("; ")
    : "No uploaded files yet";

  return [
    "Generate concise consulting artifacts for the engagement below.",
    "Keep outputs executive-ready, specific, and plausible.",
    "Do not mention AI, language models, or missing context.",
    "",
    `Title: ${engagement.title || "Untitled engagement"}`,
    `Client: ${engagement.client || "Unknown client"}`,
    `Type: ${engagement.type || "Strategy"}`,
    `Owner: ${engagement.owner || "Unassigned"}`,
    `Industry: ${engagement.businessContext?.industry || "Unknown"}`,
    `Brief summary: ${engagement.brief?.summary || "Not provided"}`,
    `Business objective: ${engagement.brief?.goal || "Not provided"}`,
    `Desired output: ${engagement.brief?.ask || "Not provided"}`,
    `Known current situation: ${engagement.businessContext?.currentSituation || "Not provided"}`,
    `Known constraints: ${engagement.businessContext?.constraints || "Not provided"}`,
    `Reference inputs: ${uploadSummary}`,
  ].join("\n");
}

function normalizeGeneratedArtifacts(payload, engagement) {
  const fallback = buildFallbackArtifacts(engagement);

  return {
    businessContext: {
      currentSituation:
        payload?.businessContext?.currentSituation?.trim() || fallback.businessContext.currentSituation,
      constraints: payload?.businessContext?.constraints?.trim() || fallback.businessContext.constraints,
    },
    insights:
      Array.isArray(payload?.insights) && payload.insights.length
        ? payload.insights.map((item) => String(item).trim()).filter(Boolean)
        : fallback.insights,
    issueTree:
      Array.isArray(payload?.issueTree) && payload.issueTree.length
        ? payload.issueTree
            .map((branch) => ({
              title: String(branch?.title || "").trim(),
              children: Array.isArray(branch?.children)
                ? branch.children.map((child) => String(child).trim()).filter(Boolean)
                : [],
            }))
            .filter((branch) => branch.title && branch.children.length)
        : fallback.issueTree,
    matchedCases:
      Array.isArray(payload?.matchedCases) && payload.matchedCases.length
        ? payload.matchedCases
            .map((item) => ({
              id: randomUUID(),
              title: String(item?.title || "").trim(),
              fit: Math.max(60, Math.min(99, Number(item?.fit || 80))),
              blurb: String(item?.blurb || "").trim(),
            }))
            .filter((item) => item.title && item.blurb)
        : fallback.matchedCases.map((item) => ({ ...item, id: randomUUID() })),
    proposalStarter: {
      hook: payload?.proposalStarter?.hook?.trim() || fallback.proposalStarter.hook,
      sections:
        Array.isArray(payload?.proposalStarter?.sections) && payload.proposalStarter.sections.length
          ? payload.proposalStarter.sections.map((item) => String(item).trim()).filter(Boolean)
          : fallback.proposalStarter.sections,
    },
    workplan:
      Array.isArray(payload?.workplan) && payload.workplan.length
        ? payload.workplan
            .map((item) => ({
              week: String(item?.week || "").trim(),
              focus: String(item?.focus || "").trim(),
              output: String(item?.output || "").trim(),
            }))
            .filter((item) => item.week && item.focus && item.output)
        : fallback.workplan,
    keyRisks:
      Array.isArray(payload?.keyRisks) && payload.keyRisks.length
        ? payload.keyRisks.map((item) => String(item).trim()).filter(Boolean)
        : fallback.keyRisks,
    referenceWork:
      Array.isArray(payload?.referenceWork) && payload.referenceWork.length
        ? payload.referenceWork.map((item) => String(item).trim()).filter(Boolean)
        : fallback.referenceWork,
  };
}

async function generateArtifactsWithOpenAI(engagement) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions:
        "You create concise, credible consulting artifacts. Return only structured output that matches the schema.",
      input: buildGenerationPrompt(engagement),
      text: {
        format: {
          type: "json_schema",
          ...generationSchema(),
        },
      },
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error?.message || `OpenAI request failed with status ${response.status}`;
    throw new Error(message);
  }

  const payload = await response.json();
  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new Error("OpenAI response did not include any text output");
  }

  return {
    artifacts: normalizeGeneratedArtifacts(JSON.parse(outputText), engagement),
    meta: {
      provider: "openai",
      model: payload.model || OPENAI_MODEL,
      responseId: payload.id || null,
      generatedAt: new Date().toISOString(),
    },
  };
}

function applyGeneratedArtifacts(engagement, artifacts, meta) {
  engagement.businessContext = {
    ...engagement.businessContext,
    currentSituation: artifacts.businessContext.currentSituation,
    constraints: artifacts.businessContext.constraints,
  };
  engagement.insights = artifacts.insights;
  engagement.issueTree = artifacts.issueTree;
  engagement.matchedCases = artifacts.matchedCases;
  engagement.proposalStarter = artifacts.proposalStarter;
  engagement.workplan = artifacts.workplan;
  engagement.keyRisks = artifacts.keyRisks;
  engagement.referenceWork = artifacts.referenceWork;
  engagement.generationMeta = meta;
}

async function generateArtifactsForEngagement(engagement) {
  if (!OPENAI_API_KEY) {
    return {
      artifacts: normalizeGeneratedArtifacts(null, engagement),
      meta: {
        provider: "fallback",
        model: "local-template",
        generatedAt: new Date().toISOString(),
        note: "OPENAI_API_KEY not configured",
      },
    };
  }

  try {
    return await generateArtifactsWithOpenAI(engagement);
  } catch (error) {
    return {
      artifacts: normalizeGeneratedArtifacts(null, engagement),
      meta: {
        provider: "fallback",
        model: "local-template",
        generatedAt: new Date().toISOString(),
        note: error.message || "OpenAI generation failed",
      },
    };
  }
}

async function handleApi(req, res, url) {
  const db = readDb();
  const method = req.method || "GET";
  const pathname = url.pathname;

  if (method === "GET" && pathname === "/api/bootstrap") {
    return sendJson(res, 200, buildBootstrap(db, getRequestSession(db, req)));
  }

  if (method === "POST" && pathname === "/api/auth/login") {
    const body = await collectBody(req);
    const email = (body.email || "").trim().toLowerCase();
    const passwordHash = hashPassword(body.password || "");
    const user = db.users.find((entry) => entry.email.toLowerCase() === email);
    if (!user || user.passwordHash !== passwordHash) {
      return sendJson(res, 401, { error: "Invalid email or password" });
    }
    const organizationId = user.organizationIds?.[0] || db.organizations[0]?.id || null;
    const session = createSession(db, user.id, organizationId);
    writeDb(db);
    return sendJsonWithHeaders(res, 200, buildBootstrap(db, session), {
      "Set-Cookie": sessionCookieHeader(session.id),
    });
  }

  if (method === "POST" && pathname === "/api/auth/signup") {
    const body = await collectBody(req);
    const organizationId = db.organizations[0]?.id || null;
    const user = {
      id: randomUUID(),
      fullName: body.fullName || "New User",
      email: (body.email || `user-${Date.now()}@example.com`).trim().toLowerCase(),
      title: body.title || "Consultant",
      passwordHash: hashPassword(body.password || ""),
      organizationIds: organizationId ? [organizationId] : [],
    };
    db.users.push(user);
    const org = getCurrentOrg(db, organizationId ? { organizationId } : null);
    if (org) {
      org.members.push({
        id: randomUUID(),
        name: user.fullName,
        email: user.email,
        role: "Editor",
        status: "Active",
      });
    }
    const session = createSession(db, user.id, organizationId);
    writeDb(db);
    return sendJsonWithHeaders(res, 201, buildBootstrap(db, session), {
      "Set-Cookie": sessionCookieHeader(session.id),
    });
  }

  if (method === "POST" && pathname === "/api/auth/logout") {
    const existingSession = getRequestSession(db, req);
    if (existingSession) {
      db.sessions = db.sessions.filter((item) => item.id !== existingSession.id);
      writeDb(db);
    }
    return sendJsonWithHeaders(res, 200, { ok: true }, { "Set-Cookie": clearSessionCookieHeader() });
  }

  const auth = requireAuth(db, req, res);
  if (!auth) return;

  if (method === "GET" && pathname === "/api/vault") {
    return sendJson(res, 200, { vault: getVaultSummary(db) });
  }

  if (method === "POST" && pathname === "/api/vault/import") {
    const body = await collectBody(req);
    const imported = await importVaultCases(db, body.sourceId || "", Number(body.limit || 4));
    writeDb(db);
    return sendJson(res, 200, {
      importedCount: imported.length,
      imported,
      vault: getVaultSummary(db),
    });
  }

  if (method === "POST" && pathname === "/api/engagements") {
    const body = await collectBody(req);
    const engagement = {
      id: randomUUID(),
      title: body.title || "Untitled Engagement",
      client: body.client || "New Client",
      type: body.type || "Strategy",
      owner: body.owner || auth.user.fullName || "Unassigned",
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
      versions: [],
    };
    db.engagements.unshift(engagement);
    const org = auth.organization;
    if (org) {
      org.monthlyRuns += 1;
    }
    writeDb(db);
    return sendJson(res, 201, { engagement, dashboard: getDashboard(db, auth.session) });
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
    const { versionLabel, ...updates } = body;
    snapshotEngagement(engagement, versionLabel || "Workspace edit");
    Object.assign(engagement, updates, { updatedAt: new Date().toISOString() });
    writeDb(db);
    return sendJson(res, 200, { engagement, dashboard: getDashboard(db, auth.session) });
  }

  const generateMatch = pathname.match(/^\/api\/engagements\/([^/]+)\/generate$/);
  if (generateMatch && method === "POST") {
    const engagement = db.engagements.find((item) => item.id === generateMatch[1]);
    if (!engagement) {
      return sendJson(res, 404, { error: "Engagement not found" });
    }
    const generated = await generateArtifactsForEngagement(engagement);
    snapshotEngagement(engagement, "Regenerated outputs");
    applyGeneratedArtifacts(engagement, generated.artifacts, generated.meta);
    engagement.updatedAt = new Date().toISOString();
    const org = auth.organization;
    if (org) {
      org.monthlyRuns += 1;
    }
    writeDb(db);
    return sendJson(res, 200, {
      engagement,
      dashboard: getDashboard(db, auth.session),
      generation: generated.meta,
    });
  }

  const uploadMatch = pathname.match(/^\/api\/engagements\/([^/]+)\/upload$/);
  if (uploadMatch && method === "POST") {
    const body = await collectBody(req);
    const engagement = db.engagements.find((item) => item.id === uploadMatch[1]);
    if (!engagement) {
      return sendJson(res, 404, { error: "Engagement not found" });
    }
    snapshotEngagement(engagement, `Uploaded ${body.name || "reference file"}`);
    storeUploadForEngagement(engagement, body);
    engagement.updatedAt = new Date().toISOString();
    writeDb(db);
    return sendJson(res, 200, { engagement });
  }

  const uploadDetailMatch = pathname.match(/^\/api\/engagements\/([^/]+)\/uploads\/([^/]+)$/);
  if (uploadDetailMatch && method === "GET") {
    const engagement = db.engagements.find((item) => item.id === uploadDetailMatch[1]);
    if (!engagement) {
      return sendJson(res, 404, { error: "Engagement not found" });
    }
    const upload = getUploadById(engagement, uploadDetailMatch[2]);
    if (!upload) {
      return sendJson(res, 404, { error: "Upload not found" });
    }
    return sendJson(res, 200, { upload });
  }

  const uploadFileMatch = pathname.match(/^\/api\/engagements\/([^/]+)\/uploads\/([^/]+)\/file$/);
  if (uploadFileMatch && method === "GET") {
    const engagement = db.engagements.find((item) => item.id === uploadFileMatch[1]);
    if (!engagement) {
      return sendJson(res, 404, { error: "Engagement not found" });
    }
    const upload = getUploadById(engagement, uploadFileMatch[2]);
    if (!upload || !upload.storedFileName) {
      return sendJson(res, 404, { error: "Upload file not found" });
    }
    const filePath = path.join(getUploadStorageDir(engagement.id), upload.storedFileName);
    if (!fs.existsSync(filePath)) {
      return sendJson(res, 404, { error: "Stored file missing" });
    }
    res.writeHead(200, {
      "Content-Type": upload.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${upload.name}"`,
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  if (method === "POST" && pathname === "/api/organizations/invite") {
    const body = await collectBody(req);
    const org = auth.organization;
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
    const org = auth.organization;
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
    const dashboard = getDashboard(db, auth.session);
    const lines = [
      "AI Consultant Export",
      "",
      `Organization: ${auth.organization?.name || "Unknown"}`,
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
