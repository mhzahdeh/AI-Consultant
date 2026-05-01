import OpenAI from "openai";
import {
  buildIssueTreeArtifactContent,
  buildProposalArtifactContent,
  buildWorkplanArtifactContent,
  regenerateProposalSection as regenerateLocalProposalSection,
} from "./artifacts.js";

const env = globalThis.process?.env || {};
const DEFAULT_MODEL = env.OPENAI_MODEL || "gpt-5";

const client = env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL || undefined,
    })
  : null;

export function isOpenAIConfigured() {
  return Boolean(client);
}

function compactText(value, maxLength = 1600) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}...` : normalized;
}

function compactEngagementContext(engagement) {
  return {
    title: engagement.title,
    client: engagement.client,
    problemType: engagement.problemType,
    objective: engagement.objective,
    brief: compactText(engagement.brief, 2200),
    notes: compactText(engagement.notes, 1400),
    uploads: Array.isArray(engagement.uploads)
      ? engagement.uploads.slice(0, 3).map((item) => ({
          name: item.name,
          status: item.status,
          excerpt: compactText(item.extractedText, 500),
        }))
      : [],
    matchedCases: Array.isArray(engagement.matchedCases)
      ? engagement.matchedCases
          .filter((item) => item.included)
          .slice(0, 4)
          .map((item) => ({
            title: item.engagementTitle,
            confidence: item.confidence,
            confidenceLabel: item.confidenceLabel,
            rationale: compactText(item.rationale, 400),
            reusableElements: Array.isArray(item.reusableElements) ? item.reusableElements.slice(0, 4) : [],
          }))
      : [],
  };
}

function extractJsonPayload(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function dedupeStrings(values, limit) {
  return [...new Set((Array.isArray(values) ? values : []).map((item) => String(item || "").trim()).filter(Boolean))].slice(0, limit);
}

async function generateText({ system, user }) {
  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await client.responses.create({
    model: DEFAULT_MODEL,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: system }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: user }],
      },
    ],
  });

  const output = String(response.output_text || "").trim();
  if (!output) {
    throw new Error("OpenAI returned an empty response");
  }
  return output;
}

async function generateJson(args) {
  return extractJsonPayload(await generateText(args));
}

function providerNotice(label, error) {
  const detail = error instanceof Error ? error.message : String(error);
  globalThis.console?.warn(`[openai] Falling back to local ${label}: ${detail}`);
}

export async function generateArtifactsForEngagement(engagement) {
  const localProposal = buildProposalArtifactContent(engagement);
  const localIssueTree = buildIssueTreeArtifactContent(engagement);
  const localWorkplan = buildWorkplanArtifactContent(engagement);

  if (!client) {
    return {
      proposal: localProposal,
      issueTree: localIssueTree,
      workplan: localWorkplan,
      provider: "local",
    };
  }

  const context = JSON.stringify(compactEngagementContext(engagement), null, 2);

  const system =
    "You write consulting-quality engagement artifacts. Use only the supplied engagement context. Be specific, evidence-aware, and avoid generic AI filler. Return only valid JSON.";

  const [proposal, issueTree, workplan] = await Promise.all([
    generateProposalArtifact({ context, localProposal, system }).catch((error) => {
      providerNotice("proposal generation", error);
      return localProposal;
    }),
    generateIssueTreeArtifact({ context, localIssueTree, system }).catch((error) => {
      providerNotice("issue tree generation", error);
      return localIssueTree;
    }),
    generateWorkplanArtifact({ context, localWorkplan, system }).catch((error) => {
      providerNotice("workplan generation", error);
      return localWorkplan;
    }),
  ]);

  return {
    proposal,
    issueTree,
    workplan,
    provider: "openai",
  };
}

async function generateProposalArtifact({ context, localProposal, system }) {
  const schema = {
    sections: localProposal.sections.map((item) => ({
      key: item.key,
      label: item.label,
      body: "string",
    })),
  };

  const payload = await generateJson({
    system,
    user: [
      "Create a consulting proposal starter artifact as JSON.",
      "Return an object matching this shape exactly:",
      JSON.stringify(schema, null, 2),
      "Requirements:",
      "- Keep the same section order and keys.",
      "- `body` must be a plain string for each section. Bullet sections may use newline bullets inside the string.",
      "- Use the engagement details, uploads, and selected analog cases where relevant.",
      "- Be concrete and internally consistent.",
      "",
      "Engagement context:",
      context,
    ].join("\n"),
  });

  const sectionMap = new Map(
    (Array.isArray(payload.sections) ? payload.sections : [])
      .map((item) => [String(item?.key || ""), String(item?.body || "").trim()])
      .filter(([key, body]) => key && body)
  );

  return {
    ...localProposal,
    sections: localProposal.sections.map((item) => ({
      ...item,
      body: sectionMap.get(item.key) || item.body,
    })),
  };
}

async function generateIssueTreeArtifact({ context, localIssueTree, system }) {
  const payload = await generateJson({
    system,
    user: [
      "Create an issue tree artifact as JSON.",
      "Return exactly this shape:",
      JSON.stringify(
        {
          rootQuestion: "string",
          branches: [
            {
              title: "string",
              hypotheses: ["string"],
              requiredData: ["string"],
            },
          ],
        },
        null,
        2
      ),
      "Requirements:",
      "- Return 3 to 5 branches.",
      "- Each branch needs 2 to 3 hypotheses and 2 to 4 requiredData items.",
      "- Keep it issue-led and decision-oriented.",
      "",
      "Engagement context:",
      context,
    ].join("\n"),
  });

  const branches = (Array.isArray(payload.branches) ? payload.branches : [])
    .map((item) => ({
      title: String(item?.title || "").trim(),
      hypotheses: dedupeStrings(item?.hypotheses, 3),
      requiredData: dedupeStrings(item?.requiredData, 4),
    }))
    .filter((item) => item.title && item.hypotheses.length && item.requiredData.length)
    .slice(0, 5);

  if (!String(payload.rootQuestion || "").trim() || branches.length === 0) {
    throw new Error("Issue tree payload was incomplete");
  }

  return {
    ...localIssueTree,
    rootQuestion: String(payload.rootQuestion).trim(),
    branches,
  };
}

async function generateWorkplanArtifact({ context, localWorkplan, system }) {
  const payload = await generateJson({
    system,
    user: [
      "Create a 12-week consulting workplan as JSON.",
      "Return exactly this shape:",
      JSON.stringify(
        {
          phases: [
            {
              name: "string",
              weeks: "string",
              deliverables: ["string"],
            },
          ],
        },
        null,
        2
      ),
      "Requirements:",
      "- Return 3 to 5 phases.",
      "- Each phase needs 3 to 5 concrete deliverables.",
      "- Keep week labels practical and sequential.",
      "",
      "Engagement context:",
      context,
    ].join("\n"),
  });

  const phases = (Array.isArray(payload.phases) ? payload.phases : [])
    .map((item) => ({
      name: String(item?.name || "").trim(),
      weeks: String(item?.weeks || "").trim(),
      deliverables: dedupeStrings(item?.deliverables, 5),
    }))
    .filter((item) => item.name && item.weeks && item.deliverables.length)
    .slice(0, 5);

  if (phases.length === 0) {
    throw new Error("Workplan payload was incomplete");
  }

  return {
    ...localWorkplan,
    phases,
  };
}

export async function regenerateProposalSectionWithOpenAI({
  engagement,
  sectionKey,
  instructions = "",
  evidenceMode = "brief-cases",
  evidenceContext = "",
}) {
  const fallback = regenerateLocalProposalSection(engagement, sectionKey, instructions, evidenceMode);
  if (!client) return fallback;

  const proposal = buildProposalArtifactContent(engagement);
  const targetSection = proposal.sections.find((item) => item.key === sectionKey);
  if (!targetSection) return fallback;

  try {
    const text = await generateText({
      system:
        "You rewrite one consulting proposal section at a time. Stay grounded in the supplied evidence and produce polished, decision-oriented business writing. Return plain text only.",
      user: [
        `Rewrite the "${targetSection.label}" section for a consulting proposal.`,
        `Section key: ${sectionKey}`,
        `Evidence mode: ${evidenceMode}`,
        evidenceContext ? `Evidence guidance: ${evidenceContext}` : "",
        instructions ? `User instructions: ${String(instructions).trim()}` : "User instructions: none",
        "",
        "Current engagement context:",
        JSON.stringify(compactEngagementContext(engagement), null, 2),
        "",
        "Current section draft:",
        targetSection.body,
        "",
        "Return only the rewritten section body as plain text.",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return text.trim() || fallback;
  } catch (error) {
    providerNotice(`section regeneration for ${sectionKey}`, error);
    return fallback;
  }
}
