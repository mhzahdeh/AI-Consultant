const state = {
  bootstrap: null,
  view: "dashboard",
  authMode: "login",
  activeTab: "brief",
  selectedEngagementId: null,
  modal: null,
  toastTimer: null,
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

function getSelectedEngagement() {
  return getEngagements().find((item) => item.id === state.selectedEngagementId) || null;
}

function setSelectedEngagement(id) {
  state.selectedEngagementId = id;
  state.view = "workspace";
  render();
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

  return `
    <section class="strategy-dashboard">
      <div class="strategy-heading">
        <h2>What are you working on?</h2>
        <p>Generate structured strategy from your business context and institutional knowledge</p>
      </div>

      <button class="strategy-hero-cta" data-action="navigate" data-view="new">
        <span class="strategy-cta-plus">+</span>
        <span class="strategy-cta-copy">
          <strong>Start New Project</strong>
          <span>Choose from templates or define your own strategic challenge</span>
        </span>
        <span class="strategy-cta-arrow">→</span>
      </button>

      <div class="strategy-section-head">
        <h3>Common Workflows</h3>
      </div>
      <div class="workflow-grid">
        ${workflows
          .map(
            ([icon, title, text]) => `
          <button class="workflow-card" data-action="navigate" data-view="new">
            <span class="workflow-icon">${icon}</span>
            <strong>${title}</strong>
            <span>${text}</span>
          </button>
        `
          )
          .join("")}
      </div>

      <div class="strategy-section-head recent-projects-head">
        <h3>Recent Projects</h3>
        <button class="strategy-text-link" data-action="navigate" data-view="workspace">View all</button>
      </div>
      <div class="recent-projects-list">
        ${recentProjects
          .map(
            (project) => `
          <article class="project-card">
            <div class="project-card-head">
              <div>
                <strong>${project.title}</strong>
                <div class="project-label">Business Objective</div>
              </div>
              <span class="project-status">${project.status}</span>
            </div>
            <p class="project-objective">${project.objective}</p>
            <div class="project-meta-grid">
              <div>
                <div class="project-label">Outputs Generated</div>
                <div class="project-badges">
                  ${project.outputs.map((output) => `<span class="project-badge">${output}</span>`).join("")}
                </div>
              </div>
              <div>
                <div class="project-label">Last Updated</div>
                <div class="project-updated">◔ ${project.updated}</div>
              </div>
            </div>
            <div class="project-footer">
              <button class="project-open-btn" data-action="open-engagement" data-id="${project.id}">Open Workspace →</button>
              <div class="project-progress"><span style="width:${project.progress}%"></span></div>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderNewEngagement() {
  const user = state.bootstrap.user;
  return `
    <div class="topbar">
      <div>
        <span class="pill">Create</span>
        <h2 class="section-title" style="font-size:2.4rem;margin-top:14px;">Start a new engagement</h2>
        <p class="muted">Capture the client brief, upload source materials, and generate the workspace.</p>
      </div>
    </div>
    <section class="workspace-panel">
      <form id="engagement-form" class="field-grid">
        <div class="field-grid two-col">
          <div class="field">
            <label for="title">Engagement title</label>
            <input id="title" name="title" placeholder="Apollo Health commercial reset" required />
          </div>
          <div class="field">
            <label for="client">Client</label>
            <input id="client" name="client" placeholder="Apollo Health" required />
          </div>
        </div>
        <div class="field-grid two-col">
          <div class="field">
            <label for="type">Engagement type</label>
            <select id="type" name="type">
              <option>Growth strategy</option>
              <option>Pricing strategy</option>
              <option>Operations transformation</option>
              <option>Commercial diligence</option>
              <option>PMO support</option>
            </select>
          </div>
          <div class="field">
            <label for="industry">Industry</label>
            <input id="industry" name="industry" placeholder="Healthcare services" />
          </div>
        </div>
        <div class="field">
          <label for="summary">Brief summary</label>
          <textarea id="summary" name="summary" placeholder="What problem is the client trying to solve?"></textarea>
        </div>
        <div class="field-grid two-col">
          <div class="field">
            <label for="goal">Success goal</label>
            <textarea id="goal" name="goal" placeholder="Define the target outcome."></textarea>
          </div>
          <div class="field">
            <label for="ask">Proposal ask</label>
            <textarea id="ask" name="ask" placeholder="What should the proposal starter help sell?"></textarea>
          </div>
        </div>
        <input type="hidden" name="owner" value="${user.fullName}" />
        <div class="toolbar-actions">
          <button class="btn btn-primary" type="submit">Create engagement</button>
          <button class="btn btn-secondary" type="button" data-action="seed-example">Fill example</button>
        </div>
      </form>
    </section>
  `;
}

function renderWorkspace() {
  const engagement = getSelectedEngagement();
  if (!engagement) {
    return `
      <section class="workspace-panel">
        <div class="empty-state">
          <h3 class="section-title">No workspace selected</h3>
          <p class="muted">Open an engagement from the dashboard or create a new one.</p>
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

  return `
    <div class="workspace-topbar">
      <div>
        <span class="pill">${engagement.client}</span>
        <h2 class="section-title" style="font-size:2.4rem;margin-top:14px;">${engagement.title}</h2>
        <p class="muted">Updated ${formatDate(engagement.updatedAt)} • ${engagement.type}</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn btn-secondary" data-action="generate" data-id="${engagement.id}">Generate artifacts</button>
        <button class="btn btn-primary" data-action="open-modal" data-modal="export">Export</button>
      </div>
    </div>
    <div class="workspace-tabs">
      ${tabs
        .map(
          ([key, label]) => `
        <button class="tab-button ${state.activeTab === key ? "active" : ""}" data-action="tab" data-tab="${key}">${label}</button>
      `
        )
        .join("")}
    </div>
    <div class="workspace-layout">
      <section class="workspace-panel">${renderWorkspaceTab(engagement)}</section>
      <aside class="workspace-side">
        <h3 class="section-title">Workspace rail</h3>
        <div class="upload-zone" style="margin-top:14px;">
          <strong>Source uploads</strong>
          <p class="muted">Add a filename to simulate ingestion through the backend.</p>
          <form id="upload-form" class="field-grid" style="margin-top:14px;">
            <div class="field">
              <label for="upload-name">Filename</label>
              <input id="upload-name" name="name" placeholder="board-pack.pdf" />
            </div>
            <button class="btn btn-secondary" type="submit">Add upload</button>
          </form>
        </div>
        <div class="engagement-list">
          ${engagement.uploads
            .map(
              (upload) => `
            <article class="upload-item">
              <strong>${upload.name}</strong>
              <p class="muted">${upload.status} • ${upload.pages} pages</p>
            </article>
          `
            )
            .join("")}
        </div>
      </aside>
    </div>
  `;
}

function renderWorkspaceTab(engagement) {
  switch (state.activeTab) {
    case "brief":
      return `
        <div class="section-head">
          <div>
            <h3 class="section-title">Client brief</h3>
            <p class="muted">Editable core context for the proposal generation flow.</p>
          </div>
          <button class="btn btn-ghost" data-action="save-brief">Save</button>
        </div>
        <form id="brief-form" class="field-grid" style="margin-top:16px;">
          <div class="field">
            <label for="brief-summary">Summary</label>
            <textarea id="brief-summary" name="summary">${engagement.brief.summary || ""}</textarea>
          </div>
          <div class="split-grid">
            <div class="field">
              <label for="brief-goal">Goal</label>
              <textarea id="brief-goal" name="goal">${engagement.brief.goal || ""}</textarea>
            </div>
            <div class="field">
              <label for="brief-ask">Ask</label>
              <textarea id="brief-ask" name="ask">${engagement.brief.ask || ""}</textarea>
            </div>
          </div>
        </form>
      `;
    case "business":
      return `
        <div class="section-head">
          <div>
            <h3 class="section-title">Business context</h3>
            <p class="muted">Industry, situation, and constraints shaping the engagement.</p>
          </div>
        </div>
        <div class="field-grid" style="margin-top:16px;">
          <article class="engagement-item"><strong>Industry</strong><p class="muted">${engagement.businessContext.industry || "Not set"}</p></article>
          <article class="engagement-item"><strong>Current situation</strong><p class="muted">${engagement.businessContext.currentSituation || "Generate artifacts to populate this section."}</p></article>
          <article class="engagement-item"><strong>Constraints</strong><p class="muted">${engagement.businessContext.constraints || "Add deadlines, budget limits, stakeholder needs, or delivery boundaries."}</p></article>
        </div>
      `;
    case "insights":
      return `
        <h3 class="section-title">Key insights</h3>
        <div class="engagement-list" style="margin-top:16px;">
          ${
            engagement.insights.length
              ? engagement.insights.map((insight) => `<article class="insight-item">${insight}</article>`).join("")
              : `<div class="empty-state">No insights yet. Generate artifacts to synthesize the brief.</div>`
          }
        </div>
      `;
    case "issueTree":
      return `
        <h3 class="section-title">Issue tree</h3>
        <div class="engagement-list" style="margin-top:16px;">
          ${
            engagement.issueTree.length
              ? engagement.issueTree
                  .map(
                    (branch) => `
                  <article class="issue-item">
                    <strong>${branch.title}</strong>
                    <p class="muted">${branch.children.join(" • ")}</p>
                  </article>
                `
                  )
                  .join("")
              : `<div class="empty-state">No issue tree yet. Generate artifacts to scaffold one.</div>`
          }
        </div>
      `;
    case "matched":
      return `
        <div class="section-head">
          <div>
            <h3 class="section-title">Matched cases</h3>
            <p class="muted">Reference work surfaced by the backend generation flow.</p>
          </div>
        </div>
        <div class="case-list" style="margin-top:16px;">
          ${
            engagement.matchedCases.length
              ? engagement.matchedCases
                  .map(
                    (item) => `
                <article class="case-item">
                  <header>
                    <div>
                      <strong>${item.title}</strong>
                      <p class="muted">${item.blurb}</p>
                    </div>
                    <span class="badge">${item.fit}% fit</span>
                  </header>
                </article>
              `
                  )
                  .join("")
              : `<div class="empty-state">No matched cases yet. Generate artifacts to create them.</div>`
          }
        </div>
      `;
    case "proposal":
      return `
        <h3 class="section-title">Proposal starter</h3>
        ${
          engagement.proposalStarter.hook
            ? `
          <article class="engagement-item" style="margin-top:16px;">
            <strong>Hook</strong>
            <p class="muted">${engagement.proposalStarter.hook}</p>
          </article>
          <article class="engagement-item" style="margin-top:12px;">
            <strong>Suggested sections</strong>
            <p class="muted">${engagement.proposalStarter.sections.join(" • ")}</p>
          </article>
        `
            : `<div class="empty-state" style="margin-top:16px;">Generate artifacts to draft the proposal starter narrative.</div>`
        }
      `;
    case "workplan":
      return `
        <h3 class="section-title">Workplan</h3>
        <div class="timeline-list" style="margin-top:16px;">
          ${
            engagement.workplan.length
              ? engagement.workplan
                  .map(
                    (item) => `
                <article class="timeline-item">
                  <header>
                    <div>
                      <strong>${item.week}</strong>
                      <p class="muted">${item.focus}</p>
                    </div>
                    <span class="badge">Output</span>
                  </header>
                  <p class="muted">${item.output}</p>
                </article>
              `
                  )
                  .join("")
              : `<div class="empty-state">No workplan yet. Generate artifacts to build the phased delivery plan.</div>`
          }
        </div>
      `;
    case "risks":
      return `
        <h3 class="section-title">Key risks</h3>
        <div class="risk-list" style="margin-top:16px;">
          ${
            engagement.keyRisks.length
              ? engagement.keyRisks.map((risk) => `<article class="risk-item">${risk}</article>`).join("")
              : `<div class="empty-state">No key risks yet. Generate artifacts to outline them.</div>`
          }
        </div>
      `;
    case "reference":
      return `
        <h3 class="section-title">Reference work</h3>
        <div class="engagement-list" style="margin-top:16px;">
          ${
            engagement.referenceWork.length
              ? engagement.referenceWork.map((item) => `<article class="engagement-item">${item}</article>`).join("")
              : `<div class="empty-state">No reference work yet. Generate artifacts to populate this library.</div>`
          }
        </div>
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
  const engagement = getSelectedEngagement() || getEngagements()[0];
  const docs = [
    "Board strategy memo",
    "Market sizing workbook",
    "Operating model reference deck",
    "Prior pricing study",
  ];
  return `
    <section class="strategy-dashboard">
      <div class="strategy-heading">
        <h2>Reference Knowledge</h2>
        <p>Used for matching and context retrieval across strategy projects.</p>
      </div>
      <div class="vault-summary-grid">
        <article class="vault-stat-card">
          <div class="project-label">Documents in vault</div>
          <strong>${docs.length + (engagement?.uploads?.length || 0)}</strong>
        </article>
        <article class="vault-stat-card">
          <div class="project-label">Most recent project</div>
          <strong>${engagement?.title || "No project selected"}</strong>
        </article>
      </div>
      <div class="project-card">
        <div class="strategy-section-head" style="margin-bottom:12px;">
          <h3>Recently added documents</h3>
        </div>
        <div class="engagement-list">
          ${docs
            .concat((engagement?.uploads || []).map((item) => item.name))
            .map((doc) => `<article class="engagement-item">${doc}</article>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderTopChrome() {
  const user = state.bootstrap.user;
  const routeMap = {
    dashboard: "/dashboard",
    new: "/templates",
    workspace: "/projects",
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
  const usagePct = Math.round((org.monthlyRuns / org.monthlyLimit) * 100);
  return `
    <div class="topbar">
      <div>
        <span class="pill">Usage</span>
        <h2 class="section-title" style="font-size:2.4rem;margin-top:14px;">Generation usage</h2>
        <p class="muted">Keep an eye on workspace runs and plan headroom.</p>
      </div>
    </div>
    <section class="billing-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">
      <article class="usage-card">
        <span class="subtle">Current cycle</span>
        <div class="stat-value">${org.monthlyRuns} / ${org.monthlyLimit}</div>
        <p class="muted">${usagePct}% of plan capacity used.</p>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.min(usagePct, 100)}%;"></div></div>
      </article>
      <article class="usage-card">
        <span class="subtle">Recommendation</span>
        <div class="stat-value">${usagePct > 75 ? "Upgrade" : "Healthy"}</div>
        <p class="muted">${usagePct > 75 ? "You are approaching the monthly cap. Upgrade or tighten generation workflows." : "Current run rate is within plan limits."}</p>
      </article>
    </section>
  `;
}

function renderBilling() {
  const billing = state.bootstrap.billing;
  return `
    <div class="topbar">
      <div>
        <span class="pill">Billing</span>
        <h2 class="section-title" style="font-size:2.4rem;margin-top:14px;">Plan and payment</h2>
        <p class="muted">Basic billing surface for the local backend demo.</p>
      </div>
    </div>
    <section class="billing-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));">
      <article class="billing-card">
        <span class="subtle">Plan</span>
        <div class="stat-value">${billing.plan}</div>
        <p class="muted">${billing.status} subscription.</p>
      </article>
      <article class="billing-card">
        <span class="subtle">Next invoice</span>
        <div class="stat-value">$${billing.amount}</div>
        <p class="muted">${billing.nextInvoiceDate}</p>
      </article>
      <article class="billing-card">
        <span class="subtle">Payment method</span>
        <div class="stat-value">${billing.cardBrand}</div>
        <p class="muted">Ending in ${billing.cardLast4}</p>
      </article>
    </section>
  `;
}

function renderSettings() {
  const settings = state.bootstrap.settings;
  const org = state.bootstrap.organization;
  return `
    <div class="topbar">
      <div>
        <span class="pill">Settings</span>
        <h2 class="section-title" style="font-size:2.4rem;margin-top:14px;">Organization controls</h2>
        <p class="muted">Manage invites, privacy defaults, and cleanup policies.</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn btn-secondary" data-action="open-modal" data-modal="invite">Invite teammate</button>
      </div>
    </div>
    <section class="settings-grid" style="grid-template-columns:1.1fr .9fr;">
      <article class="settings-card">
        <h3 class="section-title">Members and invites</h3>
        <div class="member-list">
          ${org.members
            .map(
              (member) => `
            <article class="member-item">
              <header>
                <div>
                  <strong>${member.name}</strong>
                  <p class="muted">${member.email}</p>
                </div>
                <div class="row-actions">
                  <span class="badge">${member.role}</span>
                  <button class="btn btn-ghost" data-action="toggle-role" data-id="${member.id}">
                    ${member.role === "Viewer" ? "Promote" : "Demote"}
                  </button>
                </div>
              </header>
            </article>
          `
            )
            .join("")}
        </div>
      </article>
      <article class="settings-card">
        <h3 class="section-title">Workspace defaults</h3>
        <form id="settings-form" class="field-grid" style="margin-top:16px;">
          <div class="field">
            <label for="supportEmail">Support email</label>
            <input id="supportEmail" name="supportEmail" value="${settings.supportEmail}" />
          </div>
          <div class="field">
            <label for="autoDeleteDays">Auto-delete uploads after days</label>
            <input id="autoDeleteDays" name="autoDeleteDays" type="number" value="${settings.autoDeleteDays}" />
          </div>
          <div class="field">
            <label for="privacyMode">Privacy mode</label>
            <select id="privacyMode" name="privacyMode">
              <option value="true" ${settings.privacyMode ? "selected" : ""}>Enabled</option>
              <option value="false" ${!settings.privacyMode ? "selected" : ""}>Disabled</option>
            </select>
          </div>
          <button class="btn btn-primary" type="submit">Save settings</button>
        </form>
      </article>
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
    try {
      const data = await request(`/api/engagements/${button.dataset.id}/generate`, {
        method: "POST",
      });
      state.bootstrap.dashboard = data.dashboard;
      state.selectedEngagementId = data.engagement.id;
      showToast("Artifacts generated");
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
    state.modal = button.dataset.modal;
    render();
    return;
  }

  if (action === "close-modal") {
    state.modal = null;
    render();
    return;
  }

  if (action === "download-export") {
    window.location.href = "/api/export";
    state.modal = null;
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
      state.view = "workspace";
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
      const payload = formToObject(event.target);
      const data = await request(`/api/engagements/${engagement.id}/upload`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const selected = getSelectedEngagement();
      selected.uploads = data.engagement.uploads;
      selected.updatedAt = data.engagement.updatedAt;
      showToast("Upload added");
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
});

bootstrap().catch((error) => {
  app.innerHTML = `<div class="hero-grid"><section class="hero"><h1>Failed to load</h1><p>${error.message}</p></section></div>`;
});
