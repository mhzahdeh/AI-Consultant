import { useEffect, useMemo, useState } from "react";
import { Database, ExternalLink, EyeOff, FileText, Filter, Heart, Loader2, RefreshCw, Search, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, Treemap } from "recharts";
import { Sidebar } from "./shared/Sidebar";
import { BackButton } from "./shared/BackButton";
import { KnowledgeSunburst } from "./visualizations/KnowledgeSunburst";
import { chartTheme } from "./visualizations/chartTheme";
import { useAppData } from "../lib/AppProvider";

export default function VaultPage() {
  const { getVaultOverview, updateVaultCaseFeedback } = useAppData();
  const [query, setQuery] = useState("");
  const [sourceFirm, setSourceFirm] = useState("");
  const [industry, setIndustry] = useState("");
  const [capability, setCapability] = useState("");
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof getVaultOverview>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [internalOnly, setInternalOnly] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);
      setError("");
      void getVaultOverview({ query, sourceFirm, industry, capability, limit: 18 })
        .then((result) => setOverview(result))
        .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load vault"))
        .finally(() => setIsLoading(false));
    }, 200);
    return () => window.clearTimeout(timeoutId);
  }, [capability, getVaultOverview, industry, query, sourceFirm]);

  const cases = (overview?.cases ?? []).filter((item) => {
    if (favoriteOnly && !item.isFavorite) return false;
    if (internalOnly && !item.isInternal) return false;
    return true;
  });
  const artifacts = overview?.artifacts ?? [];
  const highlightedCapabilities = useMemo(() => overview?.highlightedCapabilities ?? [], [overview]);
  const internalCases = useMemo(
    () =>
      cases
        .filter((item) => item.isInternal)
        .sort((left, right) => (right.useAgainCount - left.useAgainCount) || Number(right.isFavorite) - Number(left.isFavorite) || (right.matchScore || 0) - (left.matchScore || 0)),
    [cases]
  );
  const externalCases = useMemo(
    () => cases.filter((item) => !item.isInternal),
    [cases]
  );
  const featuredInternalCases = internalCases.slice(0, 3);
  const compositionRadar = useMemo(() => {
    const internal = cases.filter((item) => item.isInternal);
    const external = cases.filter((item) => !item.isInternal);
    const buildProfile = (items: typeof cases) => ({
      "Reuse Strength": Math.min(100, items.reduce((sum, item) => sum + item.useAgainCount, 0) * 18 + items.length * 4),
      "Evidence Quality": items.length ? Math.round((items.reduce((sum, item) => sum + item.evidenceStrength, 0) / items.length) * 20) : 0,
      "Capability Breadth": Math.min(100, new Set(items.map((item) => item.capability)).size * 14),
      "Industry Breadth": Math.min(100, new Set(items.map((item) => item.industry)).size * 14),
      "Favorites Density": Math.min(100, items.filter((item) => item.isFavorite).length * 20),
    });
    const internalProfile = buildProfile(internal);
    const externalProfile = buildProfile(external);
    return Object.keys(internalProfile).map((dimension) => ({
      dimension,
      Internal: internalProfile[dimension as keyof typeof internalProfile],
      External: externalProfile[dimension as keyof typeof externalProfile],
    }));
  }, [cases]);
  const treemapData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of cases) {
      counts.set(item.problemType, (counts.get(item.problemType) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, size]) => ({ name, size }));
  }, [cases]);

  const handleFeedback = async (caseId: string, action: "favorite" | "hide" | "use_again") => {
    await updateVaultCaseFeedback(caseId, action);
    const refreshed = await getVaultOverview({ query, sourceFirm, industry, capability, limit: 18 });
    setOverview(refreshed);
    setFeedbackNotice(action === "hide" ? "Case hidden from standard browsing" : "Vault feedback saved");
    window.setTimeout(() => setFeedbackNotice(""), 2200);
  };

  const strategicValue = (vaultCase: typeof cases[number]) => {
    if (vaultCase.isInternal) {
      const reasons = [
        vaultCase.useAgainCount > 0 ? `Already reused ${vaultCase.useAgainCount} time${vaultCase.useAgainCount === 1 ? "" : "s"}` : "Available for future team reuse",
        vaultCase.isFavorite ? "Flagged by the team as worth resurfacing" : "",
        vaultCase.linkedEngagementId ? "Linked to the source engagement for deeper context" : "",
        vaultCase.outcomes[0] ? `Carries outcome evidence around ${vaultCase.outcomes[0].toLowerCase()}` : "",
      ].filter(Boolean);
      return reasons.slice(0, 2).join(" • ");
    }
    return [
      "Useful as an external analog",
      vaultCase.evidenceStrength >= 4 ? "High evidence quality" : "Supplementary reference value",
      vaultCase.tags[0] ? `Strong on ${vaultCase.tags[0].toLowerCase()}` : "",
    ].filter(Boolean).slice(0, 2).join(" • ");
  };

  const renderCaseCard = (vaultCase: typeof cases[number], emphasizeInternal = false) => (
    <div key={vaultCase.id} className={`border p-6 ${emphasizeInternal ? "border-black/15 bg-black/[0.02]" : "border-black/10 bg-white"}`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center px-3 py-1 text-xs ${vaultCase.isInternal ? "border border-black bg-black text-white" : "bg-black text-white"}`}>
          {vaultCase.isInternal ? "Internal Knowledge" : vaultCase.sourceFirm}
        </span>
        {!vaultCase.isInternal && <span className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black/70">Public analog</span>}
        <span className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black">{vaultCase.problemType}</span>
        <span className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black/70">{vaultCase.industry}</span>
        {vaultCase.useAgainCount > 0 && <span className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black/70">Used again {vaultCase.useAgainCount}x</span>}
      </div>
      <h3 className="mb-2 text-lg tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
        {vaultCase.title}
      </h3>
      <p className="mb-3 text-sm leading-relaxed text-black/70">{vaultCase.summary}</p>
      <div className="mb-4 border-l-2 border-black/10 bg-black/[0.015] px-4 py-3">
        <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-black/40">
          {vaultCase.isInternal ? "Strategic Reuse Value" : "Reference Value"}
        </div>
        <p className="text-sm text-black/70">{strategicValue(vaultCase)}</p>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {vaultCase.tags.slice(0, 6).map((tag) => (
          <span key={tag} className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black/70">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-4">
        <div className="text-xs text-black/50">
          {vaultCase.businessFunction} • {vaultCase.capability} • {vaultCase.region}
          {vaultCase.linkedEngagementId ? " • Linked engagement available" : ""}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleFeedback(vaultCase.id, "favorite")}
            className="inline-flex items-center gap-1 border border-black/10 px-3 py-1.5 text-xs text-black/70 hover:border-black/20"
          >
            <Heart className="h-3 w-3" />
            {vaultCase.isFavorite ? "Unfavorite" : "Favorite"}
          </button>
          <button
            type="button"
            onClick={() => void handleFeedback(vaultCase.id, "use_again")}
            className="inline-flex items-center gap-1 border border-black/10 px-3 py-1.5 text-xs text-black/70 hover:border-black/20"
          >
            <RefreshCw className="h-3 w-3" />
            Use Again
          </button>
          <button
            type="button"
            onClick={() => void handleFeedback(vaultCase.id, "hide")}
            className="inline-flex items-center gap-1 border border-black/10 px-3 py-1.5 text-xs text-black/70 hover:border-black/20"
          >
            <EyeOff className="h-3 w-3" />
            Hide
          </button>
          {vaultCase.linkedEngagementId && (
            <Link to={`/workspace?id=${vaultCase.linkedEngagementId}`} className="inline-flex items-center gap-1 text-sm text-black/60 underline decoration-black/20 hover:text-black hover:decoration-black">
              Source engagement
            </Link>
          )}
          {vaultCase.sourceUrl ? (
            <a href={vaultCase.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-black/60 underline decoration-black/20 hover:text-black hover:decoration-black">
              Source
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeItem="vault" />

      <div className="flex-1">
        <header className="border-b border-black/5 bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <BackButton fallbackTo="/dashboard" />
          </div>
          <div className="mt-4">
            <h1
              className="mb-1 text-3xl tracking-tight text-black"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.02em" }}
            >
              Vault
            </h1>
            <p className="text-sm text-black/60">Curated analog cases and uploaded organizational knowledge in one place</p>
          </div>
        </header>

        <div className="p-8">
          <div className="mx-auto max-w-7xl space-y-10">
            <section className="grid gap-6 md:grid-cols-3 xl:grid-cols-6">
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-1 text-xs text-black/40">Approved cases</div>
                <div className="text-3xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>
                  {overview?.totals.totalCases ?? 0}
                </div>
              </div>
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-1 text-xs text-black/40">Internal cases</div>
                <div className="text-3xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>
                  {overview?.totals.internalCases ?? 0}
                </div>
              </div>
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-1 text-xs text-black/40">Public analogs</div>
                <div className="text-3xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>
                  {overview?.totals.externalCases ?? 0}
                </div>
              </div>
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-1 text-xs text-black/40">Reusable internal cases</div>
                <div className="text-3xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>
                  {overview?.totals.reusableInternalCases ?? 0}
                </div>
              </div>
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-1 text-xs text-black/40">Uploaded artifacts</div>
                <div className="text-3xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>
                  {overview?.totals.totalArtifacts ?? 0}
                </div>
              </div>
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-1 text-xs text-black/40">Source firms</div>
                <div className="text-3xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>
                  {overview?.totals.totalSources ?? 0}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="border border-black/10 bg-white p-8">
                <div className="mb-4">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-black/35">Compounding Knowledge</div>
                  <h2 className="mb-2 text-xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                    Internal cases are your reusable edge
                  </h2>
                  <p className="text-sm text-black/60">
                    Internal cases should resurface because they capture how your team actually solved similar problems, not just what public firms published.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {featuredInternalCases.length ? (
                    featuredInternalCases.map((vaultCase) => (
                      <div key={vaultCase.id} className="border border-black/10 bg-black/[0.015] p-5">
                        <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-black/40">Internal case</div>
                        <h3 className="mb-2 text-base tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                          {vaultCase.title}
                        </h3>
                        <p className="mb-3 text-sm text-black/65">{strategicValue(vaultCase)}</p>
                        <div className="text-xs text-black/45">{vaultCase.problemType} • {vaultCase.capability}</div>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-3 border border-dashed border-black/15 bg-black/[0.015] p-6 text-sm text-black/55">
                      No internal cases yet. Saving strong engagements to the vault is what makes future retrieval meaningfully smarter.
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-black/10 bg-white p-8">
                <div className="mb-4">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-black/35">Use The Vault Well</div>
                  <h2 className="mb-2 text-xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                    Internal knowledge vs public analogs
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="border border-black/10 bg-black/[0.015] p-4">
                    <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-black/40">Internal knowledge</div>
                    <p className="text-sm leading-relaxed text-black/70">Use these when you want reusable structures, proof from your own work, and cases future teams should inherit.</p>
                  </div>
                  <div className="border border-black/10 bg-white p-4">
                    <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-black/40">Public analogs</div>
                    <p className="text-sm leading-relaxed text-black/70">Use these when you need external reference points, precedent, or inspiration across industries and capabilities.</p>
                  </div>
                  <div className="border-l-2 border-black bg-black/[0.02] p-4 text-sm text-black/70">
                    The product gets stronger when strong engagements are saved back into the vault and then reused ahead of public references.
                  </div>
                </div>
              </div>
            </section>

            {!isLoading && cases.length > 0 ? (
              <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
                <KnowledgeSunburst cases={cases} />

                <div className="space-y-6">
                  <div className="border border-black/10 bg-white p-6 shadow-[0_14px_36px_rgba(0,0,0,0.03)]">
                    <div className="mb-4">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-black/35">Knowledge Balance</div>
                      <h3 className="mb-1 text-lg tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                        Internal vs External Radar
                      </h3>
                      <p className="text-sm text-black/60">Polar profile comparing the depth and spread of your internal knowledge against curated external analogs.</p>
                    </div>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={compositionRadar} outerRadius="72%">
                          <PolarGrid stroke={chartTheme.grid} />
                          <PolarAngleAxis dataKey="dimension" tick={{ fill: chartTheme.muted, fontSize: 11 }} />
                          <Tooltip contentStyle={{ borderRadius: 0, borderColor: chartTheme.grid, backgroundColor: chartTheme.paper, boxShadow: "0 12px 30px rgba(0,0,0,0.06)" }} />
                          <Radar name="Internal" dataKey="Internal" stroke={chartTheme.ink} fill={chartTheme.ink} fillOpacity={0.16} strokeWidth={2} />
                          <Radar name="External" dataKey="External" stroke={chartTheme.soft} fill={chartTheme.soft} fillOpacity={0.12} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="border border-black/10 bg-white p-6 shadow-[0_14px_36px_rgba(0,0,0,0.03)]">
                    <div className="mb-4">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-black/35">Problem Density</div>
                      <h3 className="mb-1 text-lg tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                        Problem Type Treemap
                      </h3>
                      <p className="text-sm text-black/60">Tree-sized view of where the vault is densest by problem type.</p>
                    </div>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                          data={treemapData}
                          dataKey="size"
                          stroke="#ffffff"
                          fill={chartTheme.mid}
                        />
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="border border-black/10 bg-white p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="mb-2 text-lg tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                    Explore Cases
                  </h2>
                  <p className="text-sm text-black/60">Internal cases are your team memory. Public analogs are external reference points. Browse both, but do not confuse them.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFavoriteOnly((prev) => !prev)}
                    className={`inline-flex items-center gap-2 border px-4 py-2 text-sm transition-all ${
                      favoriteOnly ? "border-black bg-black text-white" : "border-black/10 bg-black/[0.02] text-black/70"
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                    Favorites
                  </button>
                  <button
                    type="button"
                    onClick={() => setInternalOnly((prev) => !prev)}
                    className={`inline-flex items-center gap-2 border px-4 py-2 text-sm transition-all ${
                      internalOnly ? "border-black bg-black text-white" : "border-black/10 bg-black/[0.02] text-black/70"
                    }`}
                  >
                    Internal cases
                  </button>
                  <div className="inline-flex items-center gap-2 border border-black/10 bg-black/[0.02] px-4 py-2 text-sm text-black/70">
                    <Filter className="h-4 w-4" />
                    {cases.length} shown
                  </div>
                </div>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-4">
                <label className="flex items-center gap-3 border border-black/10 px-4 py-3 focus-within:border-black">
                  <Search className="h-4 w-4 text-black/40" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search the vault..."
                    className="w-full bg-transparent text-sm text-black placeholder-black/40 outline-none"
                  />
                </label>
                <select value={sourceFirm} onChange={(event) => setSourceFirm(event.target.value)} className="border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none">
                  <option value="">All sources</option>
                  <option value="McKinsey">McKinsey</option>
                  <option value="Bain">Bain</option>
                  <option value="BCG">BCG</option>
                  <option value="Internal Vault">Internal Vault</option>
                </select>
                <input
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  placeholder="Filter by industry"
                  className="border border-black/10 px-4 py-3 text-sm text-black placeholder-black/40 focus:border-black focus:outline-none"
                />
                <input
                  value={capability}
                  onChange={(event) => setCapability(event.target.value)}
                  placeholder="Filter by capability"
                  className="border border-black/10 px-4 py-3 text-sm text-black placeholder-black/40 focus:border-black focus:outline-none"
                />
              </div>

              {highlightedCapabilities.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {highlightedCapabilities.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCapability(item)}
                      className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black/70 transition-colors hover:border-black/20"
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      {item}
                    </button>
                  ))}
                </div>
              )}

              {error && <div className="border-l-2 border-black/20 bg-black/[0.02] p-4 text-sm text-black/70">{error}</div>}
              {feedbackNotice && <div className="border-l-2 border-black bg-black/[0.02] p-4 text-sm text-black/70">{feedbackNotice}</div>}

              {isLoading ? (
                <div className="flex items-center justify-center border border-black/10 bg-black/[0.01] px-6 py-12 text-sm text-black/60">
                  <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                  Loading vault...
                </div>
              ) : (
                <div className="space-y-4">
                  {internalCases.length ? (
                    <div className="space-y-4">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-black/40">Internal cases</div>
                      {internalCases.map((vaultCase) => renderCaseCard(vaultCase, true))}
                    </div>
                  ) : null}

                  {externalCases.length ? (
                    <div className="space-y-4">
                      <div className="pt-4 text-[11px] uppercase tracking-[0.2em] text-black/40">Public analogs</div>
                      {externalCases.map((vaultCase) => renderCaseCard(vaultCase, false))}
                    </div>
                  ) : null}
                </div>
              )}
            </section>

            <section className="border border-black/10 bg-white p-8">
              <div className="mb-6">
                <h2 className="mb-2 text-lg tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  Uploaded Vault Artifacts
                </h2>
                <p className="text-sm text-black/60">Every uploaded document already contributes to your organizational memory and can later support better retrieval.</p>
              </div>

              <div className="space-y-3">
                {artifacts.map((artifact) => (
                  <div key={artifact.id} className="flex items-center justify-between gap-4 border border-black/10 bg-white p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <Database className="h-4 w-4 shrink-0 text-black/40" />
                      <div className="min-w-0">
                        <div className="truncate text-sm text-black">{artifact.name}</div>
                        <div className="text-xs text-black/40">
                          {artifact.client} • {artifact.problemType} • Added {artifact.uploadedAt}
                        </div>
                      </div>
                    </div>
                    <Link to={`/workspace?id=${artifact.engagementId}`} className="inline-flex items-center gap-2 text-sm text-black/60 underline decoration-black/20 hover:text-black hover:decoration-black">
                      <FileText className="h-4 w-4" />
                      Open Engagement
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
