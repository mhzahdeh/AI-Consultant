function firstNonEmptyLine(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) || "";
}

function sentenceFragments(value, count = 2) {
  return String(value || "")
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, count);
}

function summarizeBrief(brief, fallback) {
  const fragments = sentenceFragments(brief, 2);
  return fragments.length ? fragments.join(" ") : fallback;
}

function makeTrace(label, detail, sourceType = "system", sourceId = null) {
  return {
    label,
    detail,
    sourceType,
    sourceId,
  };
}

function selectedCases(engagement, limit = 3) {
  return Array.isArray(engagement.matchedCases)
    ? engagement.matchedCases.filter((item) => item.included).slice(0, limit)
    : [];
}

function uploadedSources(engagement, limit = 3) {
  return Array.isArray(engagement.uploads) ? engagement.uploads.slice(0, limit) : [];
}

function buildProposalProvenance(engagement) {
  const briefSummary = summarizeBrief(
    engagement.brief,
    `Primary engagement objective for ${engagement.client || "the client"}.`
  );
  const cases = selectedCases(engagement, 3);
  const uploads = uploadedSources(engagement, 3);
  const briefTrace = makeTrace("Client brief", briefSummary, "brief", `${engagement.id || "engagement"}_brief`);
  const caseTraces = cases.map((item) =>
    makeTrace(item.engagementTitle, item.rationale, "case", item.id || item.engagementTitle)
  );
  const uploadTraces = uploads.map((item) =>
    makeTrace(item.name, `Uploaded source available for grounding (${item.status}).`, "upload", item.id || item.name)
  );

  return {
    problem_statement: [briefTrace, ...uploadTraces].slice(0, 4),
    objectives: [briefTrace, ...caseTraces.slice(0, 1), ...uploadTraces.slice(0, 1)].slice(0, 4),
    workstreams: [briefTrace, ...caseTraces, ...uploadTraces.slice(0, 1)].slice(0, 4),
    deliverables: [briefTrace, ...caseTraces.slice(0, 2), ...uploadTraces.slice(0, 1)].slice(0, 4),
    case_evidence: caseTraces.length
      ? caseTraces
      : [makeTrace("Coverage gap", "No analog cases are currently selected. Add internal or external references to strengthen this section.")],
    timeline: [briefTrace, ...caseTraces.slice(0, 2)].slice(0, 4),
    assumptions: [briefTrace, ...uploadTraces.slice(0, 2)].slice(0, 4),
    risks: [briefTrace, ...uploadTraces.slice(0, 2)].slice(0, 4),
  };
}

function buildIssueTreeProvenance(engagement, branches) {
  const briefTrace = makeTrace(
    "Root brief",
    summarizeBrief(engagement.brief, `Primary client brief used to frame the issue tree for ${engagement.client || "the client"}.`),
    "brief",
    `${engagement.id || "engagement"}_brief`
  );
  const cases = selectedCases(engagement, 2).map((item) =>
    makeTrace(item.engagementTitle, `Reference analog contributing hypotheses and branch structure.`, "case", item.id || item.engagementTitle)
  );
  const uploads = uploadedSources(engagement, 2).map((item) =>
    makeTrace(item.name, `Supporting upload informing data requirements (${item.status}).`, "upload", item.id || item.name)
  );

  return {
    rootQuestion: [briefTrace, ...cases.slice(0, 1), ...uploads.slice(0, 1)].slice(0, 4),
    branches: Object.fromEntries(
      branches.map((branch) => [
        branch.title,
        [
          briefTrace,
          ...cases.map((trace) => ({
            ...trace,
            detail: `${trace.detail} Branch focus: ${branch.title.toLowerCase()}.`,
          })),
          ...uploads,
        ].slice(0, 4),
      ])
    ),
  };
}

function buildWorkplanProvenance(engagement, phases) {
  const briefTrace = makeTrace(
    "Client brief",
    `Phase sequencing is anchored to the objective for ${engagement.client || "the client"}.`,
    "brief",
    `${engagement.id || "engagement"}_brief`
  );
  const cases = selectedCases(engagement, 2);
  const uploads = uploadedSources(engagement, 2);
  return Object.fromEntries(
    phases.map((phase, index) => [
      phase.name,
      [
        briefTrace,
        ...cases.map((item) =>
          makeTrace(
            item.engagementTitle,
            `Analog applied to ${phase.name.toLowerCase()} through ${item.reusableElements.slice(0, 2).join(", ") || "prior delivery patterns"}.`,
            "case",
            item.id || item.engagementTitle
          )
        ),
        ...uploads.slice(0, index === 0 ? 2 : 1).map((item) =>
          makeTrace(item.name, `Uploaded artifact used as supporting evidence (${item.status}).`, "upload", item.id || item.name)
        ),
      ].slice(0, 4),
    ])
  );
}

export function buildProposalArtifactContent(engagement) {
  const title = engagement.title || "Proposal Starter";
  const client = engagement.client || "Client";
  const problemType = engagement.problemType || "Strategy";
  const caseEvidence = selectedCases(engagement, 3);
  const briefSummary = summarizeBrief(
    engagement.brief,
    `${client} needs a structured ${problemType.toLowerCase()} recommendation for ${title}.`
  );
  const sections = [
    {
      key: "problem_statement",
      label: "Problem Statement",
      body: `${briefSummary} This draft translates that brief into a scoped consulting response with a recommendation path, evidence plan, and delivery structure.`,
    },
    {
      key: "objectives",
      label: "Objectives",
      body: `1. Clarify the client objective and critical decisions.\n2. Translate the brief into an evidence-backed recommendation path.\n3. Pressure-test options against execution realities and risk.\n4. Produce a decision-ready output set the team can refine quickly.`,
    },
    {
      key: "workstreams",
      label: "Proposed Workstreams",
      body: `Workstream 1: Confirm the current-state fact base and stakeholder objectives.\nWorkstream 2: Frame hypotheses, analog patterns, and strategic options.\nWorkstream 3: Quantify implications, risks, and investment requirements.\nWorkstream 4: Convert the recommendation into an executable roadmap and leadership narrative.`,
    },
    {
      key: "deliverables",
      label: "Deliverables",
      body: `Executive recommendation memo\nIssue-led analysis structure with supporting evidence\nDecision-ready workplan\nImplementation roadmap with risks, assumptions, and dependencies`,
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
      body: `Weeks 1-2: Intake, fact-base review, and stakeholder alignment\nWeeks 3-5: Analysis, option development, and analog comparison\nWeeks 6-8: Recommendation shaping, economics, and risk testing\nWeeks 9-12: Execution roadmap, leadership readout, and handoff`,
    },
    {
      key: "assumptions",
      label: "Assumptions",
      body: `Stakeholder access is available early in the engagement.\nRelevant commercial and operating data can be shared in time for synthesis.\nThe client team can align on decision criteria before recommendation lock.`,
    },
    {
      key: "risks",
      label: "Risks",
      body: `Incomplete source material may limit the specificity of the recommendation.\nLate stakeholder input could delay synthesis and reprioritize workstreams.\nScope changes without evidence refresh may weaken the final recommendation quality.`,
    },
  ];

  return {
    sections,
    provenance: buildProposalProvenance(engagement),
  };
}

export function buildIssueTreeArtifactContent(engagement) {
  const client = engagement.client || "Client";
  const branches = [
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
  ];
  return {
    rootQuestion: `What is the best recommendation for ${client}, and what evidence will make that recommendation defensible?`,
    branches,
    provenance: buildIssueTreeProvenance(engagement, branches),
  };
}

export function buildWorkplanArtifactContent(engagement) {
  const caseEvidence = selectedCases(engagement, 2);
  const phases = [
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
  ];

  return {
    phases,
    provenance: buildWorkplanProvenance(engagement, phases),
  };
}

export function buildProposalProvenanceForRegeneration(engagement, sectionKey, evidenceMode) {
  const proposal = buildProposalArtifactContent(engagement);
  const traces = proposal.provenance?.[sectionKey] || [];
  const filtered = traces.filter((item) => {
    if (evidenceMode === "brief-only") return item.sourceType === "brief";
    if (evidenceMode === "uploads-only") return item.sourceType === "upload";
    if (evidenceMode === "cases-only") return item.sourceType === "case";
    return true;
  });
  if (filtered.length) return filtered;
  return proposal.provenance?.[sectionKey] || [];
}
