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

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function bulletize(items, prefix = "- ") {
  return items.filter(Boolean).map((item) => `${prefix}${item}`).join("\n");
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function inferThemes(engagement) {
  const tokens = tokenize(
    [
      engagement.problemType,
      engagement.brief,
      engagement.notes,
      ...uploadedSources(engagement, 5).map((item) => `${item.name} ${item.extractedText || ""}`),
      ...selectedCases(engagement, 4).flatMap((item) => [item.engagementTitle, item.rationale, ...(item.reusableElements || [])]),
    ].join(" ")
  );

  const rules = [
    { key: "regulatory", match: ["regulatory", "license", "licensing", "approval", "policy", "compliance", "government"], label: "regulatory and stakeholder constraints" },
    { key: "pricing", match: ["pricing", "price", "margin", "promotion", "commercial"], label: "pricing and margin logic" },
    { key: "customer", match: ["customer", "segment", "consumer", "client", "channel", "sales"], label: "customer and segment priorities" },
    { key: "operations", match: ["operations", "supply", "plant", "process", "capacity", "service"], label: "operating model and process constraints" },
    { key: "technology", match: ["digital", "technology", "data", "analytics", "ai", "genai", "automation"], label: "technology and enablement choices" },
    { key: "economics", match: ["cost", "economics", "investment", "return", "roi", "ebitda"], label: "economics and investment tradeoffs" },
    { key: "organization", match: ["organization", "talent", "capability", "team", "governance", "change"], label: "organization, talent, and change requirements" },
  ];

  return rules.filter((rule) => rule.match.some((term) => tokens.includes(term))).map((rule) => rule.label).slice(0, 4);
}

function caseInsights(engagement, limit = 3) {
  return selectedCases(engagement, limit).map((item) => ({
    title: item.engagementTitle,
    rationale: item.rationale,
    elements: Array.isArray(item.reusableElements) ? item.reusableElements.slice(0, 3) : [],
    confidence: item.confidence,
    confidenceLabel: item.confidenceLabel,
  }));
}

function uploadInsights(engagement, limit = 3) {
  return uploadedSources(engagement, limit).map((item) => ({
    name: item.name,
    status: item.status,
    excerpt:
      sentenceFragments(item.extractedText, 1)[0] ||
      `${item.name} is available as uploaded source material.`,
  }));
}

function formatInstruction(instructions) {
  const clean = String(instructions || "").trim();
  if (!clean) return "";
  return clean.endsWith(".") ? clean : `${clean}.`;
}

function formatCaseInfluence(engagement, fallback = "No analog cases are currently selected.") {
  const cases = caseInsights(engagement, 3);
  if (!cases.length) return fallback;
  return cases
    .map(
      (item) =>
        `${item.title} (${item.confidence}% ${String(item.confidenceLabel || "").toLowerCase()} match): ${item.elements.length ? item.elements.join(", ") : item.rationale}`
    )
    .join("; ");
}

function proposalSectionLibrary(engagement) {
  const title = engagement.title || "Proposal Starter";
  const client = engagement.client || "Client";
  const problemType = engagement.problemType || "Strategy";
  const briefSummary = summarizeBrief(
    engagement.brief,
    `${client} needs a structured ${problemType.toLowerCase()} recommendation for ${title}.`
  );
  const themes = inferThemes(engagement);
  const cases = caseInsights(engagement, 3);
  const uploads = uploadInsights(engagement, 2);
  const casePattern = formatCaseInfluence(engagement);
  const themeLine = themes.length ? themes.join(", ") : "decision framing, evidence priorities, and execution risks";
  const uploadLine = uploads.length
    ? uploads.map((item) => `${item.name}: ${item.excerpt}`).join(" ")
    : "No uploaded source excerpts are available yet.";

  return {
    problem_statement: `${briefSummary} The first draft should answer the core decision for ${client} while explicitly addressing ${themeLine}. The work should stay grounded in the current brief and available source material rather than generic transformation language.`,
    objectives: bulletize([
      `Define the decision that leadership must make and the criteria that will determine a sound recommendation.`,
      `Build the fact base around ${themeLine}.`,
      cases.length ? `Translate the most relevant analog patterns into this client context: ${casePattern}.` : `Identify the minimum additional analog or market evidence needed to strengthen the recommendation.`,
      `Produce a recommendation path that can be challenged, refined, and mobilized quickly by the team.`,
    ]),
    workstreams: bulletize([
      `Decision framing and current-state synthesis: convert the brief and uploads into a clean working problem statement and decision architecture.`,
      `Hypothesis and option development: shape the strategic options, using selected cases to inform where the team should look first.`,
      `Evidence and economics: quantify benefits, risks, investment needs, and operational implications tied to ${themeLine}.`,
      `Recommendation and mobilization: turn the preferred path into an executive narrative, a workplan, and explicit next decisions.`,
    ]),
    deliverables: bulletize([
      `Executive recommendation narrative that states the decision, recommendation logic, and open questions.`,
      `Issue-led analysis structure covering the highest-priority themes: ${themeLine}.`,
      `Decision-ready workplan with owners, sequencing, and dependencies.`,
      cases.length ? `Analog evidence appendix drawing from ${cases.map((item) => item.title).join(", ")}.` : `Evidence gap log showing where more internal or external references are still needed.`,
    ]),
    case_evidence: cases.length
      ? cases
          .map(
            (item, index) =>
              `${index + 1}. ${item.title} (${item.confidence}% ${String(item.confidenceLabel || "").toLowerCase()} match)\nReusable patterns: ${item.elements.join(", ") || "Delivery pattern and recommendation structure"}\nWhy it matters here: ${item.rationale}`
          )
          .join("\n\n")
      : `No analog cases were explicitly selected. Strengthen this draft by selecting internal cases or importing higher-quality reference material before finalizing.`,
    timeline: bulletize([
      `Weeks 1-2: lock the problem framing, review uploads, and align on decision criteria.`,
      `Weeks 3-5: develop hypotheses and compare strategic or operating options against the strongest analogs.`,
      `Weeks 6-8: pressure-test economics, execution risks, and stakeholder implications.`,
      `Weeks 9-12: finalize recommendation, implementation logic, and leadership-ready outputs.`,
    ]),
    assumptions: bulletize([
      `The client can provide enough data to test the highest-priority questions around ${themeLine}.`,
      uploads.length ? `Uploaded sources are directionally reliable and can be used as an initial fact base: ${uploads.map((item) => item.name).join(", ")}.` : `The existing brief is sufficient to build an initial view before more data arrives.`,
      cases.length ? `Selected analog cases are useful starting points but will be translated into the client's context rather than copied literally.` : `The team will need to supplement the brief with analog evidence before the final recommendation is locked.`,
    ]),
    risks: bulletize([
      `If the fact base stays thin, the draft may remain directionally helpful but not decision-ready.`,
      themes.includes("regulatory and stakeholder constraints")
        ? `Regulatory or stakeholder constraints could change the recommendation path late in the process if not surfaced early.`
        : `Late stakeholder input could reframe the problem and force changes to workstreams and output emphasis.`,
      cases.length
        ? `Analog cases may create false confidence if the team does not adapt them to current client realities.`
        : `Without selected analogs, the draft may lean too heavily on generic consulting structure instead of proven internal patterns.`,
    ]),
    source_note: uploadLine,
  };
}

function applyEvidenceModeToSection(body, engagement, evidenceMode, sectionKey) {
  if (evidenceMode === "brief-only") {
    return `${body}\n\nGrounding note: this revision relies only on the client brief and deliberately excludes analog and upload references.`;
  }
  if (evidenceMode === "uploads-only") {
    const uploads = uploadInsights(engagement, 3);
    return uploads.length
      ? `${body}\n\nGrounding note: this revision emphasizes uploaded sources: ${uploads.map((item) => item.name).join(", ")}.`
      : body;
  }
  if (evidenceMode === "cases-only") {
    const caseLine = formatCaseInfluence(engagement, "");
    return caseLine
      ? `${body}\n\nGrounding note: this revision emphasizes selected analog cases: ${caseLine}.`
      : body;
  }
  if (sectionKey === "case_evidence") {
    return body;
  }
  const uploads = uploadInsights(engagement, 2);
  return uploads.length ? `${body}\n\nGrounding note: this section is additionally informed by ${uploads.map((item) => item.name).join(", ")}.` : body;
}

function reviseProposalSection({ engagement, sectionKey, instructions = "", evidenceMode = "brief-cases" }) {
  const library = proposalSectionLibrary(engagement);
  let body = library[sectionKey] || library.problem_statement;
  body = applyEvidenceModeToSection(body, engagement, evidenceMode, sectionKey);
  const cleanInstructions = formatInstruction(instructions);
  if (cleanInstructions) {
    body = `${body}\n\nRevision emphasis: ${cleanInstructions}`;
  }
  return body;
}

function issueTreeBlueprint(problemType, client, themes, cases) {
  const reusable = unique(cases.flatMap((item) => item.elements)).slice(0, 4);
  const analogLine = reusable.length ? ` using analog cues such as ${reusable.join(", ")}` : "";

  const templates = {
    "Market Entry Strategy": {
      rootQuestion: `What entry path gives ${client} the highest-probability route to win, and what evidence is still required before committing capital?`,
      branches: [
        {
          title: "Is the market worth entering?",
          hypotheses: [
            `Demand pools and segment growth are attractive enough to justify entry.`,
            `Profitability structure supports a viable position for ${client}.`,
          ],
          requiredData: ["Market size and growth by segment", "Margin pool economics", "Competitive intensity and barriers"],
        },
        {
          title: "What is the right entry model?",
          hypotheses: [
            "A focused beachhead is superior to a broad launch.",
            `Local partnerships or staged investment may reduce risk${analogLine}.`,
          ],
          requiredData: ["Channel and route-to-market options", "Partner landscape", "Entry sequencing choices"],
        },
        {
          title: "Can the client execute the move?",
          hypotheses: [
            `${client} can build the required capabilities on the needed timeline.`,
            "The operating model can absorb the entry without eroding economics.",
          ],
          requiredData: ["Capability gaps", "Operating requirements", "Investment and ramp plan"],
        },
      ],
    },
    "Digital Transformation": {
      rootQuestion: `Where should ${client} focus first to create measurable value from digital change, and what operating model will sustain it?`,
      branches: [
        {
          title: "Where is the value pool?",
          hypotheses: [
            "A small number of use cases account for most near-term value.",
            `Value should be prioritized around ${themes.join(", ") || "customer, operations, and data foundations"}.`,
          ],
          requiredData: ["Current pain points", "Use-case value sizing", "Baseline process metrics"],
        },
        {
          title: "What capabilities must change?",
          hypotheses: [
            "Technology alone will not unlock value without operating-model change.",
            "Data, process, and decision rights need to be redesigned together.",
          ],
          requiredData: ["Capability maturity", "Data architecture", "Process ownership and governance"],
        },
        {
          title: "How will adoption hold?",
          hypotheses: [
            "The organization can sustain the new ways of working with targeted change support.",
            "Leadership governance can force prioritization and benefit realization.",
          ],
          requiredData: ["Adoption barriers", "Change readiness", "Governance design"],
        },
      ],
    },
    "Operations Optimization": {
      rootQuestion: `Which operational levers will move performance most materially for ${client}, and how should the team sequence them?`,
      branches: [
        {
          title: "Where are the biggest bottlenecks?",
          hypotheses: [
            "A small set of process or capacity constraints explains most of the performance loss.",
            "The current baseline hides avoidable variation and waste.",
          ],
          requiredData: ["Operational baseline", "Throughput and utilization", "Failure or delay points"],
        },
        {
          title: "Which levers are highest impact?",
          hypotheses: [
            `Levers tied to ${themes.join(", ") || "cost, process, and capacity"} will yield the biggest return.`,
            "A phased improvement program will outperform broad simultaneous change.",
          ],
          requiredData: ["Improvement levers", "Impact sizing", "Implementation complexity"],
        },
        {
          title: "Can improvements sustain?",
          hypotheses: [
            "Governance and frontline routines can hold the gains after rollout.",
            "Capability building is required to avoid backsliding.",
          ],
          requiredData: ["Governance routines", "Capability gaps", "Sustainment metrics"],
        },
      ],
    },
    "Growth Strategy": {
      rootQuestion: `Which growth bets should ${client} back, and what evidence makes those bets defendable?`,
      branches: [
        {
          title: "Where should growth come from?",
          hypotheses: [
            "A limited set of customer, product, or market plays accounts for the majority of upside.",
            "The current portfolio hides underinvested growth pools.",
          ],
          requiredData: ["Growth pool sizing", "Customer and segment attractiveness", "Current portfolio performance"],
        },
        {
          title: "How can the client win?",
          hypotheses: [
            `${client} has a right-to-win in only a subset of the identified pools.`,
            `Commercial or capability moves${analogLine ? ` ${analogLine}` : ""} are needed to capture the upside.`,
          ],
          requiredData: ["Differentiators", "Commercial model effectiveness", "Capability gaps"],
        },
        {
          title: "What is the risk-adjusted value?",
          hypotheses: [
            "The preferred growth path outperforms alternatives on risk-adjusted economics.",
            "Execution complexity is manageable with the right sequencing.",
          ],
          requiredData: ["Investment profile", "Scenario economics", "Key execution risks"],
        },
      ],
    },
    "Cost Reduction": {
      rootQuestion: `Which cost actions give ${client} the cleanest path to savings without damaging strategic capability?`,
      branches: [
        {
          title: "Where is the cost base structurally misaligned?",
          hypotheses: [
            "A limited set of categories explains most of the gap to target performance.",
            "The baseline includes structural spend that can be redesigned, not just trimmed.",
          ],
          requiredData: ["Cost baseline", "Category decomposition", "Benchmark gap"],
        },
        {
          title: "Which levers are credible?",
          hypotheses: [
            "Portfolio, process, or organization levers can unlock the majority of savings.",
            "Some cost actions are one-time, while others require operating-model change.",
          ],
          requiredData: ["Savings levers", "Implementation feasibility", "Timing and dependencies"],
        },
        {
          title: "What are the risks to delivery?",
          hypotheses: [
            "Aggressive savings could erode growth or service if sequencing is wrong.",
            "Leadership governance is needed to sustain benefits.",
          ],
          requiredData: ["Service impact assessment", "Risk scenarios", "Governance and owner map"],
        },
      ],
    },
    "Organization Design": {
      rootQuestion: `What organization model will best support the strategy for ${client}, and where must roles, governance, and capabilities change?`,
      branches: [
        {
          title: "What must the organization enable?",
          hypotheses: [
            "The future-state strategy requires clearer role mandates and decision ownership.",
            "The current structure creates friction across high-value decisions or processes.",
          ],
          requiredData: ["Strategy and capability priorities", "Decision pain points", "Current operating model"],
        },
        {
          title: "What should change structurally?",
          hypotheses: [
            "A revised structure can simplify accountability and improve execution speed.",
            "Spans, layers, or interfaces are creating avoidable complexity.",
          ],
          requiredData: ["Org structure options", "Role charters", "Layer and span analysis"],
        },
        {
          title: "How will the change stick?",
          hypotheses: [
            "Governance, incentives, and capability building are as important as structure.",
            "Transition planning is needed to prevent organizational ambiguity.",
          ],
          requiredData: ["Change impact", "Capability plan", "Governance and transition model"],
        },
      ],
    },
  };

  return templates[problemType] || {
    rootQuestion: `What is the best recommendation for ${client}, and what evidence will make that recommendation defensible?`,
    branches: [
      {
        title: "What is the core decision?",
        hypotheses: ["The problem can be framed into a small set of decision options.", "Decision criteria can be made explicit early."],
        requiredData: ["Client objective", "Decision criteria", "Constraints and boundaries"],
      },
      {
        title: "What evidence matters most?",
        hypotheses: ["A limited set of facts will decide the recommendation.", "Analogs and uploads can sharpen the evidence hierarchy."],
        requiredData: ["Fact base", "Analog references", "Data gaps"],
      },
      {
        title: "How will the recommendation land?",
        hypotheses: ["The recommendation must be executable, not just analytically correct.", "Risks and change implications matter to adoption."],
        requiredData: ["Execution dependencies", "Stakeholder impacts", "Risk profile"],
      },
    ],
  };
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
    objectives: [briefTrace, ...caseTraces.slice(0, 2), ...uploadTraces.slice(0, 1)].slice(0, 4),
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
  const library = proposalSectionLibrary(engagement);
  const sections = [
    { key: "problem_statement", label: "Problem Statement", body: library.problem_statement },
    { key: "objectives", label: "Objectives", body: library.objectives },
    { key: "workstreams", label: "Proposed Workstreams", body: library.workstreams },
    { key: "deliverables", label: "Deliverables", body: library.deliverables },
    { key: "case_evidence", label: "Analog Case Evidence", body: library.case_evidence },
    { key: "timeline", label: "Timeline Draft", body: library.timeline },
    { key: "assumptions", label: "Assumptions", body: library.assumptions },
    { key: "risks", label: "Risks", body: library.risks },
  ];

  return {
    sections,
    provenance: buildProposalProvenance(engagement),
  };
}

export function buildIssueTreeArtifactContent(engagement) {
  const client = engagement.client || "Client";
  const themes = inferThemes(engagement);
  const cases = caseInsights(engagement, 2);
  const blueprint = issueTreeBlueprint(engagement.problemType, client, themes, cases);
  return {
    rootQuestion: blueprint.rootQuestion,
    branches: blueprint.branches,
    provenance: buildIssueTreeProvenance(engagement, blueprint.branches),
  };
}

export function buildWorkplanArtifactContent(engagement) {
  const themes = inferThemes(engagement);
  const cases = caseInsights(engagement, 2);
  const uploads = uploadInsights(engagement, 2);
  const problemType = engagement.problemType || "Strategy";

  const phases = [
    {
      name: "Frame",
      weeks: "Weeks 1-2",
      deliverables: unique([
        "Decision framing and success criteria",
        "Source-material synthesis and fact-base outline",
        themes.length ? `Priority themes confirmed: ${themes.join(", ")}` : "Priority themes and open questions confirmed",
        uploads[0] ? `Upload review anchored in ${uploads[0].name}` : "",
      ]),
    },
    {
      name: "Pressure-Test",
      weeks: "Weeks 3-6",
      deliverables: unique([
        `${problemType} issue tree and hypotheses`,
        "Options, scenarios, or levers assessed against available evidence",
        cases[0] ? `Analog translation from ${cases[0].title}` : "Initial analog comparison and evidence gap review",
        "Economics, execution implications, and risk assessment",
      ]),
    },
    {
      name: "Recommend",
      weeks: "Weeks 7-9",
      deliverables: unique([
        "Recommendation narrative and executive storyline",
        "Decision-ready exhibits and supporting logic",
        cases[1] ? `Cross-case synthesis using ${cases[1].title}` : "Final rationale for the preferred path",
        "Leadership alignment session materials",
      ]),
    },
    {
      name: "Mobilize",
      weeks: "Weeks 10-12",
      deliverables: unique([
        "12-week mobilization plan with owners and milestones",
        "Governance and decision cadence",
        "Risk watchlist, dependencies, and next-step plan",
      ]),
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

export function regenerateProposalSection(engagement, sectionKey, instructions = "", evidenceMode = "brief-cases") {
  return reviseProposalSection({ engagement, sectionKey, instructions, evidenceMode });
}
