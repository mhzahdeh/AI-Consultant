const state = {
  bootstrap: null,
  view: "dashboard",
  authMode: "login",
  activeTab: "brief",
  selectedEngagementId: null,
  modal: null,
  toastTimer: null,
  generatingId: null,
  selectedUploadId: null,
};

const app = document.getElementById("app");

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(payload.error || "Request failed");
  }
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function getEngagements() {
  return state.bootstrap?.dashboard?.engagements || [];
}

function getVault() {
  return state.bootstrap?.vault || {
    cases: [],
    recentCases: [],
    sources: [],
    internalAssets: [],
    derivedPatterns: [],
    projectArtifacts: [],
    totals: {
      internalAssetCount: 0,
      publicCaseCount: 0,
      projectArtifactCount: 0,
      derivedPatternCount: 0,
      knowledgeObjectCount: 0,
    },
    positioning: {
      title: "",
      summary: "",
    },
  };
}

function getVaultCases() {
  return getVault().cases || [];
}

function getVaultSources() {
  return getVault().sources || [];
}

function getVaultTotals() {
  return getVault().totals || {};
}

function getSelectedEngagement() {
  return getEngagements().find((item) => item.id === state.selectedEngagementId) || null;
}

function getSelectedUpload() {
  const engagement = getSelectedEngagement();
  if (!engagement || !state.selectedUploadId) return null;
  return (engagement.uploads || []).find((item) => item.id === state.selectedUploadId) || null;
}

function setSelectedEngagement(id) {
  state.selectedEngagementId = id;
  state.view = "projectDetail";
  render();
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / 104857.6) / 10} MB`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function parseLineItems(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseIssueTree(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, children] = line.split(":");
      return {
        title: (title || "").trim(),
        children: String(children || "")
          .split("|")
          .map((child) => child.trim())
          .filter(Boolean),
      };
    })
    .filter((item) => item.title && item.children.length);
}

function parseWorkplan(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [week, focus, output] = line.split("|");
      return {
        week: String(week || "").trim(),
        focus: String(focus || "").trim(),
        output: String(output || "").trim(),
      };
    })
    .filter((item) => item.week && item.focus && item.output);
}

function getGenerationLabel(engagement) {
  if (!engagement?.generationMeta) {
    return "Not generated yet";
  }
  if (engagement.generationMeta.provider === "openai") {
    return `OpenAI • ${engagement.generationMeta.model}`;
  }
  return `Local fallback${engagement.generationMeta.note ? ` • ${engagement.generationMeta.note}` : ""}`;
}

function initials(name) {
  return name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderAuth() {
  return `
    <div class="hero-grid">
      <section class="hero">
        <span class="eyebrow">Consulting workspace with local backend</span>
        <div class="hero-copy">
          <h1>AI Consultant</h1>
          <p>
            Turn raw client context into a sharp proposal starter, matched reference work, an issue tree,
            and a consultant-ready workplan. This demo runs end-to-end on a local JSON API, so the flows
            actually work instead of being static screens.
          </p>
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary" data-action="switch-auth" data-mode="signup">Create workspace</button>
          <button class="btn btn-secondary" data-action="switch-auth" data-mode="login">Use demo account</button>
        </div>
        <div class="hero-metrics">
          <div class="metric-card">
            <span class="subtle">Artifacts</span>
            <strong>9</strong>
            <span class="muted">Generated workspace tabs</span>
          </div>
          <div class="metric-card">
            <span class="subtle">Team ops</span>
            <strong>Org</strong>
            <span class="muted">Members, invites, billing, settings</span>
          </div>
          <div class="metric-card">
            <span class="subtle">Persistence</span>
            <strong>Local</strong>
            <span class="muted">Backed by JSON on disk</span>
          </div>
        </div>
      </section>
      <aside class="auth-card">
        <div class="auth-tabs">
          <button class="tab-button ${state.authMode === "login" ? "active" : ""}" data-action="switch-auth" data-mode="login">Log in</button>
          <button class="tab-button ${state.authMode === "signup" ? "active" : ""}" data-action="switch-auth" data-mode="signup">Sign up</button>
        </div>
        <div>
          <h2 class="auth-title">${state.authMode === "login" ? "Welcome back" : "Create your consultant workspace"}</h2>
          <p class="muted">${state.authMode === "login" ? "Use the seeded demo user or create a new account." : "New accounts are added to the active organization automatically."}</p>
        </div>
        <form id="auth-form" class="field-grid">
          ${
            state.authMode === "signup"
              ? `
            <div class="field">
              <label for="fullName">Full name</label>
              <input id="fullName" name="fullName" placeholder="Jordan Patel" required />
            </div>
            <div class="field">
              <label for="title">Title</label>
              <input id="title" name="title" placeholder="Senior Consultant" />
            </div>
          `
              : ""
          }
          <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" value="${state.authMode === "login" ? "morgan@altitudeadvisory.com" : ""}" placeholder="you@firm.com" required />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" value="demo1234" placeholder="••••••••" required />
          </div>
          <div class="auth-actions">
            <button class="btn btn-primary" type="submit">${state.authMode === "login" ? "Enter workspace" : "Create account"}</button>
            <button class="btn btn-ghost" type="button" data-action="demo-login">Quick demo</button>
          </div>
        </form>
      </aside>
    </div>
  `;
}

function renderSidebar() {
  const bootstrap = state.bootstrap;
  const user = bootstrap.user;
  const org = bootstrap.organization;
  const navItems = [
    ["dashboard", "Dashboard"],
    ["workspace", "Projects"],
    ["vault", "Vault"],
    ["usage", "Usage"],
    ["billing", "Billing"],
    ["settings", "Settings"],
  ];
  const navIcons = {
    dashboard: "▦",
    workspace: "◫",
    vault: "⌂",
    usage: "◔",
    billing: "$",
    settings: "⚙",
  };
  return `
    <aside class="sidebar strategy-sidebar">
      <div class="brand strategy-brand">
        <div class="strategy-mark"></div>
        <div class="brand-copy">
          <h1>AI Strategy Workspace</h1>
          <p>${org.name}</p>
        </div>
      </div>
      <div class="nav-group strategy-nav">
        ${navItems
          .map(
            ([key, label]) => `
          <button class="nav-button strategy-nav-button ${state.view === key ? "active" : ""}" data-action="navigate" data-view="${key}">
            <span class="strategy-nav-icon">${navIcons[key]}</span>
            ${label}
          </button>
        `
          )
          .join("")}
      </div>
      <div class="strategy-sidebar-footer">
        <div class="strategy-plan-label">Current plan</div>
        <div class="strategy-plan-name">${org.plan}</div>
        <div class="strategy-plan-meta">${user.fullName}</div>
      </div>
    </aside>
  `;
}

function renderDashboard() {
  const { dashboard } = state.bootstrap;
  const vault = getVault();
  const totals = getVaultTotals();
  const workflows = [
    ["↗", "Go-to-Market Strategy", "Product launch planning, channel strategy, positioning"],
    ["$", "Pricing Strategy", "Price optimization, packaging, competitive analysis"],
    ["⊕", "Market Entry", "Geographic expansion, TAM analysis, market assessment"],
    ["◔", "Growth Plan", "Customer acquisition, retention, expansion strategy"],
    ["✣", "Operating Model", "Org design, process optimization, capability building"],
    ["◎", "Strategic Review", "Performance analysis, initiative prioritization, roadmap"],
  ];
  const recentProjects = [
    {
      id: dashboard.engagements[0]?.id || "",
      title: "EMEA Market Entry - Consumer Hardware",
      objective:
        "Evaluate market opportunity and define go-to-market approach for Saudi Arabia, UAE, and Egypt",
      status: "In Progress",
      outputs: ["Strategy Draft", "Analysis Tree", "Execution Plan"],
      updated: "2 hours ago",
      progress: 63,
    },
    {
      id: dashboard.engagements[0]?.id || "",
      title: "SaaS Pricing Model Redesign",
      objective:
        "Transition from seat-based to usage-based pricing with value metric analysis",
      status: "Draft",
      outputs: ["Strategy Draft", "Analysis Tree"],
      updated: "1 day ago",
      progress: 42,
    },
  ];
  const vaultDocs = vault.recentCases.length
    ? vault.recentCases.slice(0, 3).map((item) => item.title)
    : ["No imported cases yet"];
  const usageCards = [
    ["Active Projects", String(getEngagements().length), "of Unlimited"],
    ["Knowledge Objects", String(totals.knowledgeObjectCount || 0), "internal assets, analogs, artifacts"],
    ["Generations", String(state.bootstrap.organization.monthlyRuns), "of 5,000"],
  ];

  return `
    <section class="strategy-dashboard clean-dashboard">
      <div class="dashboard-section-head">
        <h3>Common Workflows</h3>
      </div>
      <div class="workflow-grid clean-workflow-grid">
        ${workflows
          .map(
            ([icon, title, text]) => `
          <button class="workflow-card clean-workflow-card" data-action="navigate" data-view="new">
            <span class="workflow-icon clean-workflow-icon">${icon}</span>
            <strong>${title}</strong>
            <span>${text}</span>
          </button>
        `
          )
          .join("")}
      </div>

      <div class="dashboard-section-head clean-section-spacer">
        <h3>Recent Projects</h3>
        <button class="dashboard-link" data-action="navigate" data-view="workspace">View all</button>
      </div>
      <div class="recent-projects-list clean-project-list">
        ${recentProjects
          .map(
            (project) => `
          <article class="project-card clean-project-card">
            <div class="project-card-head clean-project-card-head">
              <div>
                <strong>${project.title}</strong>
                <div class="project-label">Business Objective</div>
              </div>
              <span class="project-status clean-project-status">${project.status}</span>
            </div>
            <p class="project-objective clean-project-objective">${project.objective}</p>
            <div class="project-meta-grid clean-project-meta-grid">
              <div>
                <div class="project-label">Outputs Generated</div>
                <div class="project-badges">
                  ${project.outputs.map((output) => `<span class="project-badge clean-project-badge">${output}</span>`).join("")}
                </div>
              </div>
              <div>
                <div class="project-label">Last Updated</div>
                <div class="project-updated clean-project-updated">◔ ${project.updated}</div>
              </div>
            </div>
            <div class="clean-project-progress"><span style="width:${project.progress}%"></span></div>
            <div class="project-footer clean-project-footer">
              <button class="project-open-btn clean-project-open-btn" data-action="open-engagement" data-id="${project.id}">Open Workspace →</button>
            </div>
          </article>
        `
          )
          .join("")}
      </div>

      <div class="dashboard-section-head clean-section-spacer">
        <h3>Reference Knowledge</h3>
      </div>
      <section class="reference-card">
        <div class="reference-card-top">
          <div class="reference-summary">
            <div class="reference-icon">◫</div>
            <div>
              <strong>${vault.positioning.title}</strong>
              <p>${vault.positioning.summary}</p>
            </div>
          </div>
          <button class="reference-action" data-action="navigate" data-view="vault">Manage Vault</button>
        </div>
        <div class="reference-divider"></div>
        <div class="reference-recent">
          <div class="reference-label">Recently Added</div>
          <div class="reference-doc-list">
            ${vaultDocs.map((doc) => `<div class="reference-doc">◧ ${doc}</div>`).join("")}
          </div>
        </div>
      </section>

      <div class="dashboard-section-head clean-section-spacer">
        <h3>Usage This Month</h3>
      </div>
      <div class="dashboard-usage-grid">
        ${usageCards
          .map(
            ([label, value, note]) => `
          <article class="dashboard-usage-card">
            <div class="dashboard-usage-label">${label}</div>
            <div class="dashboard-usage-value">${value}</div>
            <div class="dashboard-usage-note">${note}</div>
          </article>
        `
          )
          .join("")}
      </div>
      <div class="dashboard-usage-link-row">
        <button class="dashboard-link" data-action="navigate" data-view="usage">View detailed usage</button>
      </div>
    </section>
  `;
}

function renderNewEngagement() {
  const user = state.bootstrap.user;
  const templates = [
    ["↗", "Go-to-Market Strategy", "Product launch planning, channel strategy, market positioning", ["Launch plan", "Channel strategy", "Positioning framework", "Execution roadmap"]],
    ["$", "Pricing Strategy", "Price optimization, packaging design, competitive benchmarking", ["Pricing framework", "Value metric analysis", "Competitive analysis", "Risks"]],
    ["⊕", "Market Entry Strategy", "Geographic expansion, TAM assessment, regulatory navigation", ["Market-entry analysis", "Entry mode evaluation", "Regulatory roadmap", "Execution plan"]],
    ["◔", "Growth Strategy", "Customer acquisition, retention optimization, expansion planning", ["Growth roadmap", "Acquisition strategy", "Retention framework", "Recommendation"]],
    ["◎", "Customer Segmentation", "Market segmentation, persona development, targeting strategy", ["Segmentation logic", "Persona profiles", "Targeting criteria", "Value proposition"]],
    ["▧", "Competitive Review", "Competitive landscape, differentiation, strategic response", ["Landscape map", "Competitor profiles", "Threat assessment", "Response plan"]],
    ["✣", "Operating Model", "Org design, process optimization, capability building", ["Org model", "Process map", "Capability gaps", "Roadmap"]],
    ["◫", "Strategic Review", "Performance analysis, initiative prioritization, roadmap", ["Performance review", "Initiative portfolio", "Decision tree", "Roadmap"]],
  ];
  return `
    <section class="strategy-dashboard">
      <div class="strategy-heading">
        <h2>Choose a starting point</h2>
        <p>Select a strategic workflow or define your own challenge from scratch.</p>
      </div>
      <button class="strategy-hero-cta" data-action="open-modal" data-modal="customProject">
        <span class="strategy-cta-plus">+</span>
        <span class="strategy-cta-copy">
          <strong>Start from blank</strong>
          <span>Define a custom business objective, context, and desired outputs</span>
        </span>
        <span class="strategy-cta-arrow">→</span>
      </button>
      <div class="template-grid">
        ${templates
          .map(
            ([icon, title, text, outputs]) => `
          <button class="template-card" data-action="open-modal" data-modal="customProject" data-template="${title}">
            <span class="template-icon">${icon}</span>
            <strong>${title}</strong>
            <p>${text}</p>
            <div class="template-output-row">
              ${outputs.map((output) => `<span>${output}</span>`).join("")}
            </div>
          </button>
        `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderWorkspace() {
  const engagement = getSelectedEngagement();
  if (!engagement) {
    return `
      <section class="strategy-dashboard">
        <div class="strategy-heading">
          <h2>No project selected</h2>
          <p>Open a project from the projects list.</p>
        </div>
      </section>
    `;
  }

  const tabs = [
    ["brief", "Brief"],
    ["business", "Business Context"],
    ["insights", "Insights"],
    ["issueTree", "Issue Tree"],
    ["matched", "Matched Cases"],
    ["proposal", "Proposal Starter"],
    ["workplan", "Workplan"],
    ["risks", "Key Risks"],
    ["reference", "Reference Work"],
  ];

  const isGenerating = state.generatingId === engagement.id;

  return `
    <section class="strategy-dashboard project-workspace">
      <div class="workspace-command-bar">
        <div>
          <div class="project-label">Business Objective</div>
          <h2>${engagement.title}</h2>
          <p>${engagement.brief.summary || engagement.type}</p>
          <div class="workspace-generation-meta">
            <span class="project-label">Generation source</span>
            <strong>${getGenerationLabel(engagement)}</strong>
          </div>
        </div>
        <div class="workspace-command-actions">
          <button class="project-open-btn secondary" data-action="generate" data-id="${engagement.id}" ${isGenerating ? "disabled" : ""}>
            ${isGenerating ? "Generating..." : "Regenerate outputs"}
          </button>
          <button class="project-open-btn" data-action="open-modal" data-modal="export">Export →</button>
        </div>
      </div>

      <div class="workspace-tabbar">
        ${tabs
          .map(
            ([key, label]) => `
          <button class="${state.activeTab === key ? "active" : ""}" data-action="tab" data-tab="${key}">${label}</button>
        `
          )
          .join("")}
      </div>

      <div class="workspace-layout strategy-workspace-layout">
        <section class="workspace-panel strategy-workspace-panel">${renderWorkspaceTab(engagement)}</section>
        <aside class="workspace-side strategy-workspace-side">
          <div class="project-label">Reference inputs</div>
          <h3>Knowledge used</h3>
          <form id="upload-form" class="workspace-upload-form">
            <label class="workspace-upload-picker">
              <span>Select files</span>
              <input type="file" name="files" multiple />
            </label>
            <button type="submit">Upload</button>
          </form>
          <div class="workspace-source-list">
            ${engagement.uploads
              .map(
                (upload) => `
              <article class="workspace-source-card" data-action="open-upload" data-upload-id="${upload.id}">
                <strong>${upload.name}</strong>
                <span>${upload.status} • ${upload.pages} pages • ${formatBytes(upload.size)}</span>
              </article>
            `
              )
              .join("")}
          </div>
        </aside>
      </div>
    </section>
  `;
}

function renderMiniMetric(label, value) {
  return `
    <article class="mini-metric">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

function renderStructuredList(items) {
  if (!items.length) {
    return `<div class="empty-state strategy-empty">Generate outputs to populate this section.</div>`;
  }
  return `
    <div class="structured-list">
      ${items.map((item) => `<article>${item}</article>`).join("")}
    </div>
  `;
}

function renderWorkspaceTab(engagement) {
  switch (state.activeTab) {
    case "brief":
      return `
        <div class="workspace-panel-head">
          <div>
            <div class="project-label">Input brief</div>
            <h3>Strategic challenge</h3>
          </div>
          <button class="strategy-text-link" data-action="save-brief">Save changes</button>
        </div>
        <form id="brief-form" class="strategy-form">
          <label>
            <span>Context</span>
            <textarea name="summary">${engagement.brief.summary || ""}</textarea>
          </label>
          <div class="strategy-form-grid">
            <label>
              <span>Business objective</span>
              <textarea name="goal">${engagement.brief.goal || ""}</textarea>
            </label>
            <label>
              <span>Desired output</span>
              <textarea name="ask">${engagement.brief.ask || ""}</textarea>
            </label>
          </div>
        </form>
      `;
    case "business":
      return `
        <form id="business-form" class="strategy-form compact">
        <div class="workspace-panel-head">
          <div>
            <div class="project-label">Business Context</div>
            <h3>Situation framing</h3>
          </div>
          <button class="strategy-text-link" type="submit">Save changes</button>
        </div>
        <div class="metric-grid">
          ${renderMiniMetric("Industry", engagement.businessContext.industry || "Not set")}
          ${renderMiniMetric("Project type", engagement.type)}
        </div>
        <label>
          <span>Current situation</span>
          <textarea name="currentSituation">${engagement.businessContext.currentSituation || ""}</textarea>
        </label>
        <label>
          <span>Constraints</span>
          <textarea name="constraints">${engagement.businessContext.constraints || ""}</textarea>
        </label>
        </form>
      `;
    case "insights":
      return `
        <form id="insights-form" class="strategy-form compact">
          <div class="workspace-panel-head"><div><div class="project-label">Analysis</div><h3>Key insights</h3></div><button class="strategy-text-link" type="submit">Save changes</button></div>
          <label>
            <span>One insight per line</span>
            <textarea name="insightsText">${(engagement.insights || []).join("\n")}</textarea>
          </label>
        </form>
      `;
    case "issueTree":
      return `
        <form id="issue-tree-form" class="strategy-form compact">
          <div class="workspace-panel-head"><div><div class="project-label">Analysis Tree</div><h3>Issue tree</h3></div><button class="strategy-text-link" type="submit">Save changes</button></div>
          <label>
            <span>Format: Branch title: child one | child two | child three</span>
            <textarea name="issueTreeText">${(engagement.issueTree || []).map((branch) => `${branch.title}: ${branch.children.join(" | ")}`).join("\n")}</textarea>
          </label>
        </form>
      `;
    case "matched":
      return `
        <div class="workspace-panel-head"><div><div class="project-label">Reference Knowledge</div><h3>Matched reference work</h3></div></div>
        <div class="reference-card-list">
          ${
            engagement.matchedCases.length
              ? engagement.matchedCases
                  .map(
                    (item) => `
                <article>
                  <strong>${item.title}</strong>
                  <p>${item.blurb}</p>
                  <span>${item.fit}% fit</span>
                </article>
              `
                  )
                  .join("")
              : `<div class="empty-state strategy-empty">No reference work matched yet.</div>`
          }
        </div>
      `;
    case "proposal":
      return `
        <form id="proposal-form" class="strategy-form compact">
          <div class="workspace-panel-head"><div><div class="project-label">Strategy Draft</div><h3>Proposal starter</h3></div><button class="strategy-text-link" type="submit">Save changes</button></div>
          <label>
            <span>Lead narrative</span>
            <textarea name="hook">${engagement.proposalStarter.hook || ""}</textarea>
          </label>
          <label>
            <span>Section outline, one per line</span>
            <textarea name="sectionsText">${(engagement.proposalStarter.sections || []).join("\n")}</textarea>
          </label>
        </form>
      `;
    case "workplan":
      return `
        <form id="workplan-form" class="strategy-form compact">
          <div class="workspace-panel-head"><div><div class="project-label">Execution Plan</div><h3>Workplan</h3></div><button class="strategy-text-link" type="submit">Save changes</button></div>
          <label>
            <span>Format: Weeks 1-2 | Focus | Output</span>
            <textarea name="workplanText">${(engagement.workplan || []).map((item) => `${item.week} | ${item.focus} | ${item.output}`).join("\n")}</textarea>
          </label>
        </form>
      `;
    case "risks":
      return `
        <form id="risks-form" class="strategy-form compact">
          <div class="workspace-panel-head"><div><div class="project-label">Assumptions & Risks</div><h3>Key risks</h3></div><button class="strategy-text-link" type="submit">Save changes</button></div>
          <label>
            <span>One risk per line</span>
            <textarea name="risksText">${(engagement.keyRisks || []).join("\n")}</textarea>
          </label>
        </form>
      `;
    case "reference":
      return `
        <form id="reference-form" class="strategy-form compact">
          <div class="workspace-panel-head"><div><div class="project-label">Institutional Knowledge</div><h3>Reference work</h3></div><button class="strategy-text-link" type="submit">Save changes</button></div>
          <label>
            <span>One item per line</span>
            <textarea name="referenceText">${(engagement.referenceWork || []).join("\n")}</textarea>
          </label>
        </form>
      `;
    default:
      return "";
  }
}

function renderProjects() {
  const engagementsMarkup = getEngagements().length
    ? getEngagements()
        .map(
          (item) => `
        <article class="project-card">
          <div class="project-card-head">
            <div>
              <strong>${item.title}</strong>
              <div class="project-label">${item.client}</div>
            </div>
            <span class="project-status">${item.stage}</span>
          </div>
          <p class="project-objective">${item.brief.summary || item.type}</p>
          <div class="project-meta-grid">
            <div>
              <div class="project-label">Outputs Generated</div>
              <div class="project-badges">
                <span class="project-badge">Strategy Draft</span>
                <span class="project-badge">Analysis Tree</span>
                <span class="project-badge">Workplan</span>
              </div>
            </div>
            <div>
              <div class="project-label">Last Updated</div>
              <div class="project-updated">◔ ${formatDate(item.updatedAt)}</div>
            </div>
          </div>
          <div class="project-footer">
            <button class="project-open-btn" data-action="open-engagement" data-id="${item.id}">Open Workspace →</button>
            <div class="project-progress"><span style="width:70%"></span></div>
          </div>
        </article>
      `
        )
        .join("")
    : `<div class="empty-state">No projects yet.</div>`;

  return `
    <section class="strategy-dashboard">
      <div class="strategy-heading">
        <h2>Projects</h2>
        <p>Your strategy workspaces and generated outputs.</p>
      </div>
      <div class="recent-projects-list">${engagementsMarkup}</div>
    </section>
  `;
}

function renderVault() {
  const vault = getVault();
  const totals = getVaultTotals();
  const sources = getVaultSources();
  const cases = getVaultCases();
  const internalAssets = vault.internalAssets || [];
  const derivedPatterns = vault.derivedPatterns || [];
  const projectArtifacts = vault.projectArtifacts || [];
  return `
    <section class="strategy-dashboard">
      <div class="strategy-heading">
        <h2>Reference Knowledge</h2>
        <p>${vault.positioning.summary}</p>
      </div>
      <div class="vault-summary-grid">
        <article class="vault-stat-card">
          <div class="project-label">Internal foundation</div>
          <strong>${totals.internalAssetCount || 0}</strong>
        </article>
        <article class="vault-stat-card">
          <div class="project-label">Public analog cases</div>
          <strong>${totals.publicCaseCount || 0}</strong>
        </article>
        <article class="vault-stat-card">
          <div class="project-label">Project artifacts</div>
          <strong>${totals.projectArtifactCount || 0}</strong>
        </article>
        <article class="vault-stat-card">
          <div class="project-label">Derived patterns</div>
          <strong>${totals.derivedPatternCount || 0}</strong>
        </article>
      </div>
      <article class="project-card vault-foundation-card">
        <div class="strategy-section-head" style="margin-bottom:12px;">
          <h3>How the vault is positioned</h3>
        </div>
        <div class="vault-positioning-copy">
          <p>The vault is not positioned as a scraped-case database. It is positioned as a consulting knowledge base with three evidence layers.</p>
          <div class="vault-layer-grid">
            <article class="vault-layer-card">
              <div class="project-label">Layer 1</div>
              <strong>Internal knowledge foundation</strong>
              <p>Templates, playbooks, frameworks, and delivery assets that represent your proprietary operating baseline.</p>
            </article>
            <article class="vault-layer-card">
              <div class="project-label">Layer 2</div>
              <strong>Public analog case library</strong>
              <p>Curated consulting firm cases used as external evidence, analogs, and quantified proof points rather than the core source of truth.</p>
            </article>
            <article class="vault-layer-card">
              <div class="project-label">Layer 3</div>
              <strong>Project artifact layer</strong>
              <p>Uploads and engagement-specific materials that ground recommendations in the live client context.</p>
            </article>
          </div>
        </div>
      </article>
      <div class="vault-knowledge-grid">
        <article class="project-card">
          <div class="strategy-section-head" style="margin-bottom:12px;">
            <h3>Internal knowledge foundation</h3>
          </div>
          <div class="vault-simple-list">
            ${internalAssets
              .map(
                (item) => `
              <article class="vault-simple-card">
                <div class="project-label">${item.type}</div>
                <strong>${item.title}</strong>
                <p>${item.focus}</p>
              </article>
            `
              )
              .join("")}
          </div>
        </article>
        <article class="project-card">
          <div class="strategy-section-head" style="margin-bottom:12px;">
            <h3>Project artifact layer</h3>
          </div>
          ${
            projectArtifacts.length
              ? `
            <div class="vault-simple-list">
              ${projectArtifacts
                .slice(0, 6)
                .map(
                  (item) => `
                <article class="vault-simple-card">
                  <div class="project-label">${item.engagementTitle}</div>
                  <strong>${item.name}</strong>
                  <p>${item.status} • ${item.pages} pages</p>
                </article>
              `
                )
                .join("")}
            </div>
          `
              : `<div class="empty-state">No project artifacts uploaded yet.</div>`
          }
        </article>
      </div>
      <article class="project-card vault-import-card">
        <div class="strategy-section-head vault-import-head">
          <div>
            <h3>Public analog case library</h3>
            <p class="muted">The importer only pulls from whitelisted consulting firm domains and stores source attribution for every imported case.</p>
          </div>
          <button class="project-open-btn" data-action="import-vault-source" data-source-id="">Import all sources</button>
        </div>
        <div class="vault-source-grid">
          ${sources
            .map(
              (source) => `
            <article class="vault-source-card">
              <div class="project-label">${source.domain}</div>
              <strong>${source.name}</strong>
              <p>${source.lastImportedAt ? `Last import ${formatDate(source.lastImportedAt)}` : "Not imported yet"}</p>
              <div class="vault-source-meta">
                <span>${source.lastImportCount || 0} new last run</span>
                <button class="strategy-text-link" data-action="import-vault-source" data-source-id="${source.id}">Import</button>
              </div>
              ${source.lastError ? `<div class="vault-source-error">${source.lastError}</div>` : ""}
            </article>
          `
            )
            .join("")}
        </div>
      </article>
      <div class="project-card">
        <div class="strategy-section-head" style="margin-bottom:12px;">
          <h3>Imported public analog cases</h3>
        </div>
        ${
          cases.length
            ? `
          <div class="vault-case-list">
            ${cases
              .map(
                (item) => `
              <article class="vault-case-card">
                <div class="project-label">${item.sourceName}</div>
                <strong>${item.title}</strong>
                <p>${item.summary || "Summary unavailable from source page."}</p>
                <div class="vault-case-meta">
                  <span>${item.publishedAt ? formatDate(item.publishedAt) : "Publication date unavailable"}</span>
                  <a href="${item.url}" target="_blank" rel="noreferrer">Open source</a>
                </div>
              </article>
            `
              )
              .join("")}
          </div>
        `
            : `<div class="empty-state">No imported case studies yet.</div>`
        }
      </div>
      <article class="project-card">
        <div class="strategy-section-head" style="margin-bottom:12px;">
          <h3>Derived reusable patterns</h3>
        </div>
        <div class="vault-simple-list">
          ${derivedPatterns
            .map(
              (item) => `
            <article class="vault-simple-card">
              <div class="project-label">${item.type}</div>
              <strong>${item.title}</strong>
              <p>${item.description}</p>
            </article>
          `
            )
            .join("")}
        </div>
      </article>
    </section>
  `;
}

function renderTopChrome() {
  const user = state.bootstrap.user;
  const routeMap = {
    dashboard: "/dashboard",
    new: "/templates",
    workspace: "/projects",
    projectDetail: "/projects/workspace",
    vault: "/vault",
    usage: "/usage",
    billing: "/billing",
    settings: "/settings",
  };
  return `
    <div class="app-topbar">
      <div class="app-topbar-left">
        <div class="topbar-chip">AI</div>
        <div class="topbar-route">${routeMap[state.view] || "/dashboard"}</div>
      </div>
      <div class="app-topbar-right">
        <div class="topbar-avatar">${initials(user.fullName).slice(0, 1)}</div>
      </div>
    </div>
  `;
}

function renderUsage() {
  const org = state.bootstrap.organization;
  const totals = getVaultTotals();
  const usagePct = Math.round((org.monthlyRuns / org.monthlyLimit) * 100);
  return `
    <section class="strategy-dashboard">
      <div class="strategy-heading">
        <h2>Usage</h2>
        <p>Track strategy generations, reference knowledge, and active project volume.</p>
      </div>
      <div class="usage-grid">
        ${renderMiniMetric("Active Projects", getEngagements().length)}
        ${renderMiniMetric("Knowledge Objects", totals.knowledgeObjectCount || 0)}
        ${renderMiniMetric("Generations", org.monthlyRuns)}
      </div>
      <article class="project-card">
        <div class="project-card-head">
          <div>
            <strong>Monthly generation budget</strong>
            <div class="project-label">${usagePct}% used</div>
          </div>
          <span class="project-status">${usagePct > 75 ? "Review" : "Healthy"}</span>
        </div>
        <div class="project-progress usage-progress"><span style="width:${Math.min(usagePct, 100)}%"></span></div>
        <p class="project-objective">${org.monthlyRuns} of ${org.monthlyLimit} strategy runs used this cycle.</p>
      </article>
    </section>
  `;
}

function renderBilling() {
  const billing = state.bootstrap.billing;
  return `
    <section class="strategy-dashboard">
      <div class="strategy-heading">
        <h2>Billing</h2>
        <p>Manage plan access for your strategy workspace.</p>
      </div>
      <div class="billing-plan-card">
        <div>
          <div class="project-label">Current plan</div>
          <h3>${billing.plan}</h3>
          <p>${billing.status} subscription. Next invoice on ${billing.nextInvoiceDate}.</p>
        </div>
        <strong>$${billing.amount}</strong>
      </div>
      <div class="vault-summary-grid">
        ${renderMiniMetric("Payment method", `${billing.cardBrand} •••• ${billing.cardLast4}`)}
        ${renderMiniMetric("Included generations", state.bootstrap.organization.monthlyLimit)}
      </div>
    </section>
  `;
}

function renderSettings() {
  const settings = state.bootstrap.settings;
  const org = state.bootstrap.organization;
  return `
    <section class="strategy-dashboard">
      <div class="strategy-heading">
        <h2>Settings</h2>
        <p>Organization access, privacy defaults, and workspace controls.</p>
      </div>
      <div class="settings-layout">
        <article class="project-card">
          <div class="project-card-head">
            <strong>Members and invites</strong>
            <button class="strategy-text-link" data-action="open-modal" data-modal="invite">Invite teammate</button>
          </div>
          <div class="settings-member-list">
            ${org.members
              .map(
                (member) => `
              <article>
                <div>
                  <strong>${member.name}</strong>
                  <span>${member.email}</span>
                </div>
                <button data-action="toggle-role" data-id="${member.id}">${member.role}</button>
              </article>
            `
              )
              .join("")}
          </div>
        </article>
        <article class="project-card">
          <strong>Workspace defaults</strong>
          <form id="settings-form" class="strategy-form compact">
            <label>
              <span>Support email</span>
              <input name="supportEmail" value="${settings.supportEmail}" />
            </label>
            <label>
              <span>Auto-delete uploads after days</span>
              <input name="autoDeleteDays" type="number" value="${settings.autoDeleteDays}" />
            </label>
            <label>
              <span>Privacy mode</span>
              <select name="privacyMode">
                <option value="true" ${settings.privacyMode ? "selected" : ""}>Enabled</option>
                <option value="false" ${!settings.privacyMode ? "selected" : ""}>Disabled</option>
              </select>
            </label>
            <button class="project-open-btn" type="submit">Save settings →</button>
          </form>
        </article>
      </div>
    </section>
  `;
}

function renderModal() {
  if (!state.modal) {
    return `<div class="modal" id="modal-root"></div>`;
  }

  if (state.modal === "invite") {
    return `
      <div class="modal open" id="modal-root">
        <div class="modal-card">
          <div class="section-head">
            <h3 class="section-title">Invite teammate</h3>
            <button class="btn btn-ghost" data-action="close-modal">Close</button>
          </div>
          <form id="invite-form" class="field-grid" style="margin-top:16px;">
            <div class="field">
              <label for="invite-name">Name</label>
              <input id="invite-name" name="name" placeholder="Avery Kim" required />
            </div>
            <div class="field">
              <label for="invite-email">Email</label>
              <input id="invite-email" name="email" type="email" placeholder="avery@firm.com" required />
            </div>
            <div class="field">
              <label for="invite-role">Role</label>
              <select id="invite-role" name="role">
                <option>Viewer</option>
                <option>Editor</option>
              </select>
            </div>
            <button class="btn btn-primary" type="submit">Send invite</button>
          </form>
        </div>
      </div>
    `;
  }

  if (state.modal === "export") {
    return `
      <div class="modal open" id="modal-root">
        <div class="modal-card">
          <div class="section-head">
            <h3 class="section-title">Export workspace snapshot</h3>
            <button class="btn btn-ghost" data-action="close-modal">Close</button>
          </div>
          <p class="muted" style="margin-top:16px;">Download a plain-text export generated by the backend.</p>
          <div class="toolbar-actions" style="margin-top:18px;">
            <button class="btn btn-primary" data-action="download-export">Download</button>
          </div>
        </div>
      </div>
    `;
  }

  if (state.modal === "customProject") {
    const template = state.selectedTemplate || "Custom Strategy Project";
    return `
      <div class="modal open" id="modal-root">
        <div class="modal-card strategy-modal-card">
          <div class="workspace-panel-head">
            <div>
              <div class="project-label">New project</div>
              <h3>${template}</h3>
            </div>
            <button class="strategy-text-link" data-action="close-modal">Close</button>
          </div>
          <form id="engagement-form" class="strategy-form compact">
            <label>
              <span>Project title</span>
              <input name="title" value="${template === "Custom Strategy Project" ? "" : template}" placeholder="EMEA Market Entry - Consumer Hardware" required />
            </label>
            <label>
              <span>Business area</span>
              <input name="client" placeholder="Consumer Hardware" required />
            </label>
            <label>
              <span>Workflow type</span>
              <input name="type" value="${template}" />
            </label>
            <label>
              <span>Industry</span>
              <input name="industry" placeholder="Technology, healthcare, retail..." />
            </label>
            <label>
              <span>Business context</span>
              <textarea name="summary" placeholder="What is the strategic challenge?"></textarea>
            </label>
            <label>
              <span>Business objective</span>
              <textarea name="goal" placeholder="What decision or plan should this produce?"></textarea>
            </label>
            <label>
              <span>Desired outputs</span>
              <textarea name="ask" placeholder="Strategy draft, analysis tree, execution plan..."></textarea>
            </label>
            <input type="hidden" name="owner" value="${state.bootstrap.user.fullName}" />
            <button class="project-open-btn" type="submit">Create workspace →</button>
          </form>
        </div>
      </div>
    `;
  }

  if (state.modal === "uploadDetail") {
    const upload = getSelectedUpload();
    return `
      <div class="modal open" id="modal-root">
        <div class="modal-card strategy-modal-card">
          <div class="workspace-panel-head">
            <div>
              <div class="project-label">Source document</div>
              <h3>${upload ? upload.name : "Upload not found"}</h3>
            </div>
            <button class="strategy-text-link" data-action="close-modal">Close</button>
          </div>
          ${
            upload
              ? `
            <div class="upload-detail-grid">
              <div class="mini-metric"><span>Status</span><strong>${upload.status}</strong></div>
              <div class="mini-metric"><span>Pages</span><strong>${upload.pages}</strong></div>
              <div class="mini-metric"><span>Size</span><strong>${formatBytes(upload.size)}</strong></div>
            </div>
            <p class="muted">${upload.extractionNote || "Extracted text is available below when supported."}</p>
            <div class="upload-preview-panel"><pre>${escapeHtml(upload.previewText || "No preview text extracted for this file yet.")}</pre></div>
            <div class="toolbar-actions" style="margin-top:18px;">
              <a class="btn btn-secondary" href="/api/engagements/${getSelectedEngagement().id}/uploads/${upload.id}/file">Download file</a>
            </div>
          `
              : `<p class="muted">The selected upload could not be found.</p>`
          }
        </div>
      </div>
    `;
  }

  return `<div class="modal" id="modal-root"></div>`;
}

function renderApp() {
  return `
    <div class="shell strategy-shell">
      ${renderSidebar()}
      <div class="strategy-main">
        ${renderTopChrome()}
        <main class="main strategy-content">
        ${
          state.view === "dashboard"
            ? renderDashboard()
            : state.view === "new"
              ? renderNewEngagement()
              : state.view === "workspace"
                ? renderProjects()
                : state.view === "projectDetail"
                  ? renderWorkspace()
                  : state.view === "vault"
                    ? renderVault()
                    : state.view === "usage"
                      ? renderUsage()
                      : state.view === "billing"
                        ? renderBilling()
                        : renderSettings()
        }
        </main>
      </div>
    </div>
    ${renderModal()}
  `;
}

function render() {
  app.innerHTML = state.bootstrap && state.bootstrap.session ? renderApp() : renderAuth();
}

async function bootstrap() {
  state.bootstrap = await request("/api/bootstrap");
  if (!state.selectedEngagementId) {
    state.selectedEngagementId = state.bootstrap.dashboard.engagements[0]?.id || null;
  }
  render();
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function refreshBootstrap() {
  const currentId = state.selectedEngagementId;
  state.bootstrap = await request("/api/bootstrap");
  state.selectedEngagementId = currentId || state.bootstrap.dashboard.engagements[0]?.id || null;
  render();
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;

  if (action === "switch-auth") {
    state.authMode = button.dataset.mode;
    render();
    return;
  }

  if (action === "demo-login") {
    try {
      state.bootstrap = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "morgan@altitudeadvisory.com" }),
      });
      showToast("Logged into demo workspace");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (action === "navigate") {
    state.view = button.dataset.view;
    render();
    return;
  }

  if (action === "open-engagement") {
    setSelectedEngagement(button.dataset.id);
    return;
  }

  if (action === "tab") {
    state.activeTab = button.dataset.tab;
    render();
    return;
  }

  if (action === "generate") {
    if (state.generatingId === button.dataset.id) {
      return;
    }
    try {
      state.generatingId = button.dataset.id;
      render();
      const data = await request(`/api/engagements/${button.dataset.id}/generate`, {
        method: "POST",
      });
      state.bootstrap.dashboard = data.dashboard;
      state.selectedEngagementId = data.engagement.id;
      const providerLabel =
        data.generation?.provider === "openai"
          ? `OpenAI (${data.generation.model})`
          : `local fallback${data.generation?.note ? `: ${data.generation.note}` : ""}`;
      showToast(`Artifacts generated with ${providerLabel}`);
      render();
    } catch (error) {
      showToast(error.message);
    } finally {
      state.generatingId = null;
      render();
    }
    return;
  }

  if (action === "import-vault-source") {
    try {
      const data = await request("/api/vault/import", {
        method: "POST",
        body: JSON.stringify({ sourceId: button.dataset.sourceId || "" }),
      });
      state.bootstrap.vault = data.vault;
      showToast(
        data.importedCount
          ? `Imported ${data.importedCount} case${data.importedCount === 1 ? "" : "s"}`
          : "Import finished with no new cases"
      );
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (action === "seed-example") {
    const form = document.getElementById("engagement-form");
    form.title.value = "Apollo Health commercial reset";
    form.client.value = "Apollo Health";
    form.type.value = "Growth strategy";
    form.industry.value = "Healthcare services";
    form.summary.value = "Apollo wants a proposal starter to stabilize sales productivity after a disappointing expansion launch.";
    form.goal.value = "Prioritize the highest-impact interventions and define a 90-day commercial recovery plan.";
    form.ask.value = "Build a compelling proposal narrative with workstreams, evidence, and expected outcomes.";
    return;
  }

  if (action === "open-modal") {
    if (button.dataset.template) {
      state.selectedTemplate = button.dataset.template;
    }
    state.selectedUploadId = null;
    state.modal = button.dataset.modal;
    render();
    return;
  }

  if (action === "open-upload") {
    state.selectedUploadId = button.dataset.uploadId;
    state.modal = "uploadDetail";
    render();
    return;
  }

  if (action === "close-modal") {
    state.modal = null;
    state.selectedUploadId = null;
    render();
    return;
  }

  if (action === "download-export") {
    window.location.href = "/api/export";
    state.modal = null;
    state.selectedUploadId = null;
    render();
    return;
  }

  if (action === "toggle-role") {
    try {
      const member = state.bootstrap.organization.members.find((item) => item.id === button.dataset.id);
      const nextRole = member.role === "Viewer" ? "Editor" : "Viewer";
      const data = await request(`/api/organizations/members/${member.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole }),
      });
      state.bootstrap.organization = data.organization;
      showToast(`Role updated to ${nextRole}`);
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (action === "save-brief") {
    const form = document.getElementById("brief-form");
    const engagement = getSelectedEngagement();
    if (!form || !engagement) return;
    try {
      const payload = formToObject(form);
      const data = await request(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          versionLabel: "Updated brief",
          brief: {
            ...engagement.brief,
            ...payload,
          },
        }),
      });
      state.bootstrap.dashboard = data.dashboard;
      showToast("Brief saved");
      render();
    } catch (error) {
      showToast(error.message);
    }
  }
});

document.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (event.target.id === "auth-form") {
    const payload = formToObject(event.target);
    const endpoint = state.authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
    try {
      state.bootstrap = await request(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast(state.authMode === "login" ? "Logged in" : "Account created");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (event.target.id === "engagement-form") {
    try {
      const payload = formToObject(event.target);
      const data = await request("/api/engagements", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      state.bootstrap.dashboard = data.dashboard;
      state.selectedEngagementId = data.engagement.id;
      state.view = "projectDetail";
      state.modal = null;
      showToast("Engagement created");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (event.target.id === "upload-form") {
    const engagement = getSelectedEngagement();
    if (!engagement) return;
    try {
      const input = event.target.querySelector('input[type="file"]');
      const files = Array.from(input?.files || []);
      if (!files.length) {
        showToast("Choose at least one file");
        return;
      }
      let latest = null;
      for (const file of files) {
        const base64Data = await readFileAsBase64(file);
        latest = await request(`/api/engagements/${engagement.id}/upload`, {
          method: "POST",
          body: JSON.stringify({
            name: file.name,
            mimeType: file.type,
            size: file.size,
            base64Data,
          }),
        });
      }
      const selected = getSelectedEngagement();
      selected.uploads = latest.engagement.uploads;
      selected.updatedAt = latest.engagement.updatedAt;
      event.target.reset();
      showToast(`${files.length} file${files.length === 1 ? "" : "s"} uploaded`);
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (event.target.id === "invite-form") {
    try {
      const payload = formToObject(event.target);
      const data = await request("/api/organizations/invite", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      state.bootstrap.organization = data.organization;
      state.modal = null;
      showToast("Invite created");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (event.target.id === "settings-form") {
    try {
      const payload = formToObject(event.target);
      const data = await request("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({
          supportEmail: payload.supportEmail,
          autoDeleteDays: Number(payload.autoDeleteDays),
          privacyMode: payload.privacyMode === "true",
        }),
      });
      state.bootstrap.settings = data.settings;
      showToast("Settings saved");
      render();
    } catch (error) {
      showToast(error.message);
    }
  }

  const engagement = getSelectedEngagement();
  if (!engagement) return;

  if (event.target.id === "business-form") {
    try {
      const payload = formToObject(event.target);
      const data = await request(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          versionLabel: "Updated business context",
          businessContext: {
            ...engagement.businessContext,
            currentSituation: payload.currentSituation,
            constraints: payload.constraints,
          },
        }),
      });
      state.bootstrap.dashboard = data.dashboard;
      showToast("Business context saved");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (event.target.id === "insights-form") {
    try {
      const payload = formToObject(event.target);
      const data = await request(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          versionLabel: "Updated insights",
          insights: parseLineItems(payload.insightsText),
        }),
      });
      state.bootstrap.dashboard = data.dashboard;
      showToast("Insights saved");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (event.target.id === "issue-tree-form") {
    try {
      const payload = formToObject(event.target);
      const data = await request(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          versionLabel: "Updated issue tree",
          issueTree: parseIssueTree(payload.issueTreeText),
        }),
      });
      state.bootstrap.dashboard = data.dashboard;
      showToast("Issue tree saved");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (event.target.id === "proposal-form") {
    try {
      const payload = formToObject(event.target);
      const data = await request(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          versionLabel: "Updated proposal starter",
          proposalStarter: {
            hook: payload.hook,
            sections: parseLineItems(payload.sectionsText),
          },
        }),
      });
      state.bootstrap.dashboard = data.dashboard;
      showToast("Proposal starter saved");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (event.target.id === "workplan-form") {
    try {
      const payload = formToObject(event.target);
      const data = await request(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          versionLabel: "Updated workplan",
          workplan: parseWorkplan(payload.workplanText),
        }),
      });
      state.bootstrap.dashboard = data.dashboard;
      showToast("Workplan saved");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (event.target.id === "risks-form") {
    try {
      const payload = formToObject(event.target);
      const data = await request(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          versionLabel: "Updated risks",
          keyRisks: parseLineItems(payload.risksText),
        }),
      });
      state.bootstrap.dashboard = data.dashboard;
      showToast("Risks saved");
      render();
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (event.target.id === "reference-form") {
    try {
      const payload = formToObject(event.target);
      const data = await request(`/api/engagements/${engagement.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          versionLabel: "Updated reference work",
          referenceWork: parseLineItems(payload.referenceText),
        }),
      });
      state.bootstrap.dashboard = data.dashboard;
      showToast("Reference work saved");
      render();
    } catch (error) {
      showToast(error.message);
    }
  }
});

bootstrap().catch((error) => {
  app.innerHTML = `<div class="hero-grid"><section class="hero"><h1>Failed to load</h1><p>${error.message}</p></section></div>`;
});
