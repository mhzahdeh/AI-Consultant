import { existsSync, readFileSync } from "node:fs";

export function loadVaultCaseSeed(seedPath) {
  if (!existsSync(seedPath)) return [];
  const parsed = JSON.parse(readFileSync(seedPath, "utf8"));
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.cases)) return parsed.cases;
  return [];
}

export function syncVaultCaseSeed({ db, seedPath, isoNow, runTransaction }) {
  const seedCases = loadVaultCaseSeed(seedPath);
  if (!seedCases.length) return;
  const now = isoNow();
  const seedIds = seedCases.map((item) => item.id);
  const upsert = db.prepare(
    `INSERT INTO vault_cases (
      id, title, client_name, source_firm, source_url, industry, business_function, problem_type,
      capability, summary, outcomes_json, tags_json, region, year, evidence_strength, review_status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      client_name = excluded.client_name,
      source_firm = excluded.source_firm,
      source_url = excluded.source_url,
      industry = excluded.industry,
      business_function = excluded.business_function,
      problem_type = excluded.problem_type,
      capability = excluded.capability,
      summary = excluded.summary,
      outcomes_json = excluded.outcomes_json,
      tags_json = excluded.tags_json,
      region = excluded.region,
      year = excluded.year,
      evidence_strength = excluded.evidence_strength,
      review_status = excluded.review_status,
      updated_at = excluded.updated_at`
  );

  runTransaction(() => {
    for (const item of seedCases) {
      upsert.run(
        item.id,
        item.title,
        item.client_name,
        item.source_firm,
        item.source_url,
        item.industry,
        item.business_function,
        item.problem_type,
        item.capability,
        item.summary,
        JSON.stringify(Array.isArray(item.outcomes) ? item.outcomes : []),
        JSON.stringify(Array.isArray(item.tags) ? item.tags : []),
        item.region || "Global",
        Number.isFinite(item.year) ? item.year : null,
        Math.max(1, Math.min(5, Number(item.evidence_strength || 3))),
        item.review_status || "approved",
        item.created_at || now,
        now
      );
    }

    const existingIds = db.prepare(`SELECT id FROM vault_cases WHERE is_internal = 0`).all().map((row) => row.id);
    const staleIds = existingIds.filter((id) => !seedIds.includes(id));
    for (const staleId of staleIds) {
      db.prepare(`DELETE FROM vault_cases WHERE id = ? AND is_internal = 0`).run(staleId);
    }
  });
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function tokenizeContext(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

export function serializeVaultCase(row) {
  return {
    id: row.id,
    title: row.title,
    clientName: row.client_name,
    sourceFirm: row.source_firm,
    sourceUrl: row.source_url,
    industry: row.industry,
    businessFunction: row.business_function,
    problemType: row.problem_type,
    capability: row.capability,
    summary: row.summary,
    outcomes: JSON.parse(row.outcomes_json),
    tags: JSON.parse(row.tags_json),
    region: row.region,
    year: row.year,
    evidenceStrength: row.evidence_strength,
    reviewStatus: row.review_status,
    isFavorite: Boolean(row.is_favorite),
    isHidden: Boolean(row.is_hidden),
    useAgainCount: Number(row.use_again_count || 0),
    isInternal: Boolean(row.is_internal),
    linkedEngagementId: row.linked_engagement_id || null,
  };
}

export function scoreVaultCase(row, context) {
  const tokens = tokenizeContext(
    [context.query, context.title, context.client, context.problemType, context.industry, context.capability, context.brief].join(" ")
  );
  const haystack = [
    row.title,
    row.client_name,
    row.source_firm,
    row.industry,
    row.business_function,
    row.problem_type,
    row.capability,
    row.summary,
    row.region,
    row.tags_json,
    row.outcomes_json,
  ]
    .join(" ")
    .toLowerCase();

  let score = row.evidence_strength * 8 + Number(row.use_again_count || 0) * 4 + (row.is_favorite ? 10 : 0);
  const matchedSignals = [];

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += token.length >= 7 ? 6 : 3;
    }
  }

  if (context.problemType && row.problem_type.toLowerCase() === String(context.problemType).toLowerCase()) {
    score += 18;
    matchedSignals.push(`problem type: ${row.problem_type}`);
  }
  if (context.industry && row.industry.toLowerCase() === String(context.industry).toLowerCase()) {
    score += 14;
    matchedSignals.push(`industry: ${row.industry}`);
  }
  if (context.capability && row.capability.toLowerCase() === String(context.capability).toLowerCase()) {
    score += 10;
    matchedSignals.push(`capability: ${row.capability}`);
  }
  if (context.sourceFirm && row.source_firm.toLowerCase() === String(context.sourceFirm).toLowerCase()) {
    score += 8;
    matchedSignals.push(`source: ${row.source_firm}`);
  }

  return { score, matchedSignals };
}

export function listVaultCases(db, context = {}) {
  const limit = clamp(Number(context.limit || 20), 1, 50);
  const rows = db
    .prepare(`SELECT * FROM vault_cases WHERE review_status = 'approved' ORDER BY evidence_strength DESC, title ASC`)
    .all();

  const filtered = rows.filter((row) => {
    if (!context.includeHidden && row.is_hidden) return false;
    if (context.industry && row.industry.toLowerCase() !== String(context.industry).toLowerCase()) return false;
    if (context.problemType && row.problem_type.toLowerCase() !== String(context.problemType).toLowerCase()) return false;
    if (context.capability && row.capability.toLowerCase() !== String(context.capability).toLowerCase()) return false;
    if (context.sourceFirm && row.source_firm.toLowerCase() !== String(context.sourceFirm).toLowerCase()) return false;
    if (context.favoriteOnly && !row.is_favorite) return false;
    return true;
  });

  const ranked = filtered
    .map((row) => ({ row, ...scoreVaultCase(row, context) }))
    .sort((a, b) => b.score - a.score || b.row.evidence_strength - a.row.evidence_strength || a.row.title.localeCompare(b.row.title))
    .slice(0, limit);

  return ranked.map((item) => ({
    ...serializeVaultCase(item.row),
    matchScore: item.score,
    matchedSignals: item.matchedSignals,
  }));
}

export function getVaultCasesByIds(db, ids) {
  const normalized = Array.isArray(ids)
    ? [...new Set(ids.map((item) => String(item || "").trim()).filter(Boolean))]
    : [];
  if (!normalized.length) return [];

  const placeholders = normalized.map(() => "?").join(", ");
  const rows = db
    .prepare(`SELECT * FROM vault_cases WHERE review_status = 'approved' AND id IN (${placeholders})`)
    .all(...normalized);

  return normalized
    .map((id) => rows.find((row) => row.id === id))
    .filter(Boolean);
}

export function matchedCaseFromVaultRow(row, context = {}, selected = false) {
  const { score, matchedSignals } = scoreVaultCase(row, context);
  const confidence = clamp(selected ? 92 : 55 + Math.round(score / 2), 62, 97);
  return {
    fileTitle: `${row.source_firm} case study`,
    engagementTitle: row.title,
    confidence,
    confidenceLabel: confidence >= 85 ? "Strong" : confidence >= 72 ? "Medium" : "Weak",
    rationale: selected
      ? `Manually selected from the case library. ${row.summary}`
      : matchedSignals.length
      ? `Matched on ${matchedSignals.join(", ")}. ${row.summary}`
      : row.summary,
    reusableElements: [...JSON.parse(row.tags_json).slice(0, 2), ...JSON.parse(row.outcomes_json).slice(0, 2)].slice(0, 4),
    included: true,
  };
}

export function buildContextualMatchedCases(db, { title, client, problemType, brief, industry, capability }, limit = 4) {
  const candidates = listVaultCases(db, { title, client, problemType, brief, industry, capability, limit });
  return candidates.map((item) =>
    matchedCaseFromVaultRow(
      {
        id: item.id,
        title: item.title,
        client_name: item.clientName,
        source_firm: item.sourceFirm,
        source_url: item.sourceUrl,
        industry: item.industry,
        business_function: item.businessFunction,
        problem_type: item.problemType,
        capability: item.capability,
        summary: item.summary,
        outcomes_json: JSON.stringify(item.outcomes),
        tags_json: JSON.stringify(item.tags),
        region: item.region,
        year: item.year,
        evidence_strength: item.evidenceStrength,
        review_status: item.reviewStatus,
      },
      { title, client, problemType, brief, industry, capability },
      false
    )
  );
}

export function buildSelectedMatchedCases(db, { selectedVaultCaseIds, title, client, problemType, brief, industry, capability } = {}) {
  const rows = getVaultCasesByIds(db, selectedVaultCaseIds);
  if (!rows.length) return null;
  return rows.map((row) => matchedCaseFromVaultRow(row, { title, client, problemType, brief, industry, capability }, true));
}

export function buildVaultOverview(db, { relativeTimeFrom }, context = {}) {
  const cases = listVaultCases(db, context);
  const artifacts = db.prepare(
    `SELECT u.id, u.name, u.status, u.page_count, u.uploaded_at, e.id AS engagement_id, e.title AS engagement_title, e.client, e.problem_type
     FROM uploads u
     JOIN engagements e ON e.id = u.engagement_id
     ORDER BY u.uploaded_at DESC
     LIMIT 24`
  ).all().map((row) => ({
    id: row.id,
    name: row.name,
    engagementId: row.engagement_id,
    engagementTitle: row.engagement_title,
    client: row.client,
    problemType: row.problem_type,
    uploadedAt: relativeTimeFrom(row.uploaded_at),
    uploadedAtIso: row.uploaded_at,
    status: row.status,
    pages: row.page_count || undefined,
  }));

  const highlightedCapabilities = [...new Set(cases.map((item) => item.capability))].slice(0, 6);

  return {
    totals: {
      totalCases: db.prepare(`SELECT COUNT(*) AS count FROM vault_cases WHERE review_status = 'approved' AND is_hidden = 0`).get().count,
      totalArtifacts: db.prepare(`SELECT COUNT(*) AS count FROM uploads`).get().count,
      totalSources: db.prepare(`SELECT COUNT(DISTINCT source_firm) AS count FROM vault_cases WHERE review_status = 'approved'`).get().count,
    },
    highlightedCapabilities,
    cases,
    artifacts,
  };
}

export function updateVaultCaseFeedback(db, caseId, action) {
  const existing = db.prepare(`SELECT * FROM vault_cases WHERE id = ?`).get(caseId);
  if (!existing) return null;

  if (action === "favorite") {
    db.prepare(`UPDATE vault_cases SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?`).run(caseId);
  } else if (action === "hide") {
    db.prepare(`UPDATE vault_cases SET is_hidden = CASE WHEN is_hidden = 1 THEN 0 ELSE 1 END WHERE id = ?`).run(caseId);
  } else if (action === "use_again") {
    db.prepare(`UPDATE vault_cases SET use_again_count = use_again_count + 1 WHERE id = ?`).run(caseId);
  } else {
    throw new Error("Unsupported vault feedback action");
  }

  return db.prepare(`SELECT * FROM vault_cases WHERE id = ?`).get(caseId);
}

export function promoteEngagementToVaultCase(db, { nextId, isoNow, engagementId, organizationId, title, summary, industry, businessFunction, problemType, capability, tags, outcomes }) {
  const engagement = db.prepare(`SELECT * FROM engagements WHERE id = ? AND organization_id = ?`).get(engagementId, organizationId);
  if (!engagement) return null;

  const artifactRows = db.prepare(`SELECT kind, title, content_json FROM artifacts WHERE engagement_id = ? ORDER BY kind`).all(engagementId);
  const uploads = db.prepare(`SELECT name FROM uploads WHERE engagement_id = ? ORDER BY uploaded_at DESC LIMIT 5`).all(engagementId);
  const matchedCases = db.prepare(`SELECT engagement_title, confidence, rationale FROM matched_cases WHERE engagement_id = ? AND included = 1 ORDER BY confidence DESC LIMIT 4`).all(engagementId);

  const recordId = nextId("vlt");
  db.prepare(
    `INSERT INTO vault_cases (
      id, title, client_name, source_firm, source_url, industry, business_function, problem_type,
      capability, summary, outcomes_json, tags_json, region, year, evidence_strength, review_status,
      created_at, updated_at, is_internal, linked_engagement_id, owner_organization_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  ).run(
    recordId,
    title,
    engagement.client,
    "Internal Vault",
    "",
    industry,
    businessFunction,
    problemType || engagement.problem_type,
    capability,
    summary,
    JSON.stringify(outcomes),
    JSON.stringify(tags),
    "Internal",
    new Date().getFullYear(),
    5,
    "approved",
    isoNow(),
    isoNow(),
    engagementId,
    organizationId
  );

  return {
    id: recordId,
    artifactRows,
    uploads,
    matchedCases,
  };
}
