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

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

export function tokenizeContext(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

const STOP_TOKENS = new Set([
  "about",
  "across",
  "after",
  "again",
  "against",
  "align",
  "among",
  "around",
  "because",
  "before",
  "between",
  "brief",
  "build",
  "business",
  "capability",
  "cases",
  "client",
  "company",
  "could",
  "deliver",
  "delivery",
  "engagement",
  "focus",
  "from",
  "into",
  "market",
  "needs",
  "opportunity",
  "phase",
  "prior",
  "program",
  "project",
  "proposal",
  "recommendation",
  "strategy",
  "support",
  "team",
  "their",
  "there",
  "these",
  "this",
  "through",
  "work",
  "workplan",
]);

function tokenSet(value) {
  return new Set(tokenizeContext(value));
}

function overlapTerms(left, right, max = 4) {
  const leftSet = tokenSet(left);
  const rightSet = tokenSet(right);
  return [...leftSet].filter((token) => rightSet.has(token)).slice(0, max);
}

function startsWithClientAlias(clientName, client) {
  const normalizedClientName = normalizeText(clientName);
  const normalizedClient = normalizeText(client);
  return Boolean(normalizedClient && normalizedClientName && (normalizedClientName.includes(normalizedClient) || normalizedClient.includes(normalizedClientName)));
}

function meaningfullyTokenized(value) {
  return tokenizeContext(value).filter((token) => !STOP_TOKENS.has(token));
}

function overlapMeaningfulTerms(left, right, max = 5) {
  const leftSet = new Set(meaningfullyTokenized(left));
  const rightSet = new Set(meaningfullyTokenized(right));
  return [...leftSet].filter((token) => rightSet.has(token)).slice(0, max);
}

function normalizeFieldMatch(left, right) {
  return Boolean(left && right && normalizeText(left) === normalizeText(right));
}

function buildContextProfile(context = {}) {
  return {
    title: context.title || "",
    client: context.client || "",
    query: context.query || "",
    problemType: context.problemType || "",
    industry: context.industry || "",
    capability: context.capability || "",
    brief: context.brief || "",
    narrative: [context.query, context.title, context.client, context.problemType, context.industry, context.capability, context.brief].join(" "),
  };
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
  const profile = buildContextProfile(context);
  const tokens = meaningfullyTokenized(profile.narrative);
  const tagTokens = JSON.parse(row.tags_json).map((item) => normalizeText(item));
  const outcomeTokens = JSON.parse(row.outcomes_json).map((item) => normalizeText(item));
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
  const briefOverlap = overlapMeaningfulTerms(profile.brief, `${row.summary} ${row.tags_json} ${row.outcomes_json}`, 5);
  const titleOverlap = overlapMeaningfulTerms(`${profile.title} ${profile.query}`, `${row.title} ${row.client_name}`, 3);
  const taxonomyOverlap = overlapMeaningfulTerms(
    `${profile.problemType} ${profile.industry} ${profile.capability}`,
    `${row.problem_type} ${row.industry} ${row.capability} ${row.business_function}`,
    4
  );
  const structuralHits = [];
  const proofPoints = [];

  let score =
    row.evidence_strength * 10 +
    Number(row.use_again_count || 0) * 5 +
    (row.is_favorite ? 12 : 0) +
    (row.is_internal ? 8 : 0) +
    (row.year ? Math.max(0, row.year - 2022) : 0);
  const matchedSignals = [];
  let directHitCount = 0;
  let contextualHitCount = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += token.length >= 7 ? 5 : 2;
      contextualHitCount += 1;
    }
    if (tagTokens.some((item) => item.includes(token))) {
      score += 5;
      contextualHitCount += 1;
    }
    if (outcomeTokens.some((item) => item.includes(token))) {
      score += 4;
      contextualHitCount += 1;
    }
  }

  if (normalizeFieldMatch(row.problem_type, profile.problemType)) {
    score += 30;
    directHitCount += 1;
    structuralHits.push("problem type");
    matchedSignals.push(`same problem type (${row.problem_type})`);
    proofPoints.push(`same problem type`);
  }
  if (normalizeFieldMatch(row.industry, profile.industry)) {
    score += 24;
    directHitCount += 1;
    structuralHits.push("industry");
    matchedSignals.push(`same industry (${row.industry})`);
    proofPoints.push(`same industry`);
  }
  if (normalizeFieldMatch(row.capability, profile.capability)) {
    score += 20;
    directHitCount += 1;
    structuralHits.push("capability");
    matchedSignals.push(`same capability (${row.capability})`);
    proofPoints.push(`same capability`);
  }
  if (normalizeFieldMatch(row.source_firm, context.sourceFirm)) {
    score += 8;
    matchedSignals.push(`source filter match (${row.source_firm})`);
  }
  if (startsWithClientAlias(row.client_name, profile.client)) {
    score += 18;
    directHitCount += 1;
    structuralHits.push("client");
    matchedSignals.push(`client analog (${row.client_name})`);
    proofPoints.push(`client analog`);
  }
  if (taxonomyOverlap.length) {
    score += taxonomyOverlap.length * 7;
    matchedSignals.push(`taxonomy overlap (${taxonomyOverlap.join(", ")})`);
  }
  if (briefOverlap.length) {
    score += briefOverlap.length * 8;
    matchedSignals.push(`brief overlap (${briefOverlap.join(", ")})`);
    proofPoints.push(`brief overlap on ${briefOverlap.join(", ")}`);
  }
  if (titleOverlap.length) {
    score += titleOverlap.length * 5;
    matchedSignals.push(`title overlap (${titleOverlap.join(", ")})`);
  }
  if (row.is_internal && (directHitCount >= 1 || briefOverlap.length >= 2 || taxonomyOverlap.length >= 2)) {
    score += 26;
    matchedSignals.push("internal reusable case");
    proofPoints.push("internal reusable case");
  } else if (row.is_internal) {
    matchedSignals.push("internal case");
  }
  if (row.is_favorite) {
    matchedSignals.push("team favorite");
  }
  if (Number(row.use_again_count || 0) > 0) {
    matchedSignals.push(`used again ${row.use_again_count}x`);
  }

  const quality =
    directHitCount * 20 +
    briefOverlap.length * 9 +
    taxonomyOverlap.length * 7 +
    titleOverlap.length * 5 +
    Math.min(12, contextualHitCount) +
    (row.is_internal ? 6 : 0) +
    (row.is_favorite ? 3 : 0) +
    Math.min(8, Number(row.use_again_count || 0) * 2);

  const fitTier =
    directHitCount >= 2 || quality >= 48
      ? "high"
      : directHitCount >= 1 || briefOverlap.length >= 2 || quality >= 30
      ? "medium"
      : "low";

  return {
    score,
    quality,
    directHitCount,
    contextualHitCount,
    briefOverlap,
    titleOverlap,
    taxonomyOverlap,
    structuralHits,
    proofPoints: [...new Set(proofPoints)].slice(0, 4),
    fitTier,
    matchedSignals: [...new Set(matchedSignals)].slice(0, 5),
  };
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
    if (context.internalOnly && !row.is_internal) return false;
    return true;
  });

  const ranked = filtered
    .map((row) => ({ row, ...scoreVaultCase(row, context) }))
    .sort((a, b) => b.score - a.score || b.quality - a.quality || b.row.evidence_strength - a.row.evidence_strength || a.row.title.localeCompare(b.row.title))
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
  const { score, quality, directHitCount, briefOverlap, proofPoints, fitTier, matchedSignals } = scoreVaultCase(row, context);
  const confidence = clamp(
    selected ? 92 : 44 + Math.round(score / 4) + directHitCount * 6 + Math.min(8, briefOverlap.length * 3),
    selected ? 88 : 58,
    96
  );
  const confidenceLabel = selected
    ? "Strong"
    : fitTier === "high" || confidence >= 84
    ? "Strong"
    : fitTier === "medium" || confidence >= 71
    ? "Medium"
    : "Weak";
  return {
    fileTitle: `${row.source_firm} case study`,
    engagementTitle: row.title,
    confidence,
    confidenceLabel,
    rationale: selected
      ? `Manually selected from the case library. Why it belongs: ${proofPoints.join("; ") || matchedSignals.join("; ") || "relevant reusable case"}. ${row.summary}`
      : proofPoints.length
      ? `Why it surfaced: ${proofPoints.join("; ")}. ${row.summary}`
      : matchedSignals.length
      ? `Why it surfaced: ${matchedSignals.join("; ")}. ${row.summary}`
      : row.summary,
    reusableElements: [...JSON.parse(row.tags_json).slice(0, 2), ...JSON.parse(row.outcomes_json).slice(0, 2)].slice(0, 4),
    included: true,
    qualityScore: quality,
    matchSignals: matchedSignals,
    reasoningPoints: proofPoints.length ? proofPoints : matchedSignals,
  };
}

export function buildContextualMatchedCases(db, { title, client, problemType, brief, industry, capability }, limit = 4) {
  const context = { title, client, problemType, brief, industry, capability, limit: limit * 3 };
  const candidates = listVaultCases(db, context)
    .map((item) => {
      const row = {
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
        is_favorite: item.isFavorite ? 1 : 0,
        is_internal: item.isInternal ? 1 : 0,
        use_again_count: item.useAgainCount || 0,
      };
      const scored = scoreVaultCase(row, context);
      return { row, scored };
    })
    .filter(({ scored }, index) => {
      if (index === 0 && (scored.directHitCount >= 1 || scored.briefOverlap.length >= 1 || scored.quality >= 28)) return true;
      if (scored.directHitCount >= 2) return true;
      if (scored.directHitCount >= 1 && scored.quality >= 30) return true;
      if (scored.briefOverlap.length >= 3) return true;
      if (scored.quality >= 42) return true;
      return false;
    })
    .sort((left, right) => {
      if (right.scored.directHitCount !== left.scored.directHitCount) {
        return right.scored.directHitCount - left.scored.directHitCount;
      }
      if (Boolean(right.row.is_internal) !== Boolean(left.row.is_internal)) {
        return Number(Boolean(right.row.is_internal)) - Number(Boolean(left.row.is_internal));
      }
      return right.scored.score - left.scored.score;
    })
    .slice(0, limit);

  if (!candidates.length) {
    const fallback = listVaultCases(db, { ...context, limit: 2 }).slice(0, Math.min(2, limit));
    return fallback.map((item) =>
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
          is_favorite: item.isFavorite ? 1 : 0,
          is_internal: item.isInternal ? 1 : 0,
          use_again_count: item.useAgainCount || 0,
        },
        { title, client, problemType, brief, industry, capability },
        false
      )
    );
  }

  return candidates.map(({ row }) => matchedCaseFromVaultRow(row, { title, client, problemType, brief, industry, capability }, false));
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
  const internalTotals = db.prepare(
    `SELECT
      SUM(CASE WHEN is_internal = 1 THEN 1 ELSE 0 END) AS internal_cases,
      SUM(CASE WHEN is_internal = 0 THEN 1 ELSE 0 END) AS external_cases,
      SUM(CASE WHEN is_internal = 1 AND use_again_count > 0 THEN 1 ELSE 0 END) AS reusable_internal_cases
     FROM vault_cases
     WHERE review_status = 'approved' AND is_hidden = 0`
  ).get();

  return {
    totals: {
      totalCases: db.prepare(`SELECT COUNT(*) AS count FROM vault_cases WHERE review_status = 'approved' AND is_hidden = 0`).get().count,
      totalArtifacts: db.prepare(`SELECT COUNT(*) AS count FROM uploads`).get().count,
      totalSources: db.prepare(`SELECT COUNT(DISTINCT source_firm) AS count FROM vault_cases WHERE review_status = 'approved'`).get().count,
      internalCases: Number(internalTotals.internal_cases || 0),
      externalCases: Number(internalTotals.external_cases || 0),
      reusableInternalCases: Number(internalTotals.reusable_internal_cases || 0),
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
