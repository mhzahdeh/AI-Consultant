import { useEffect, useMemo, useState } from "react";
import { Database, ExternalLink, EyeOff, FileText, Filter, Heart, Loader2, RefreshCw, Search, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { Sidebar } from "./shared/Sidebar";
import { BackButton } from "./shared/BackButton";
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

  const handleFeedback = async (caseId: string, action: "favorite" | "hide" | "use_again") => {
    await updateVaultCaseFeedback(caseId, action);
    const refreshed = await getVaultOverview({ query, sourceFirm, industry, capability, limit: 18 });
    setOverview(refreshed);
    setFeedbackNotice(action === "hide" ? "Case hidden from standard browsing" : "Vault feedback saved");
    window.setTimeout(() => setFeedbackNotice(""), 2200);
  };

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
            <section className="grid gap-6 md:grid-cols-3">
              <div className="border border-black/10 bg-white p-6">
                <div className="mb-1 text-xs text-black/40">Approved cases</div>
                <div className="text-3xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)" }}>
                  {overview?.totals.totalCases ?? 0}
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

            <section className="border border-black/10 bg-white p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="mb-2 text-lg tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                    Explore Cases
                  </h2>
                  <p className="text-sm text-black/60">Use filters to narrow curated cases and inspect the foundation your matching engine uses.</p>
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
                  {cases.map((vaultCase) => (
                    <div key={vaultCase.id} className="border border-black/10 bg-white p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center bg-black px-3 py-1 text-xs text-white">{vaultCase.sourceFirm}</span>
                        {vaultCase.isInternal && <span className="inline-flex items-center border border-black bg-black px-3 py-1 text-xs text-white">Internal</span>}
                        <span className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black">{vaultCase.problemType}</span>
                        <span className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black/70">{vaultCase.industry}</span>
                        {typeof vaultCase.matchScore === "number" && (
                          <span className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black/70">Match score {vaultCase.matchScore}</span>
                        )}
                        {vaultCase.isFavorite && <span className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black/70">Favorited</span>}
                        {vaultCase.useAgainCount > 0 && <span className="inline-flex items-center border border-black/10 px-3 py-1 text-xs text-black/70">Used again {vaultCase.useAgainCount}x</span>}
                      </div>
                      <h3 className="mb-2 text-lg tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                        {vaultCase.title}
                      </h3>
                      <p className="mb-4 text-sm leading-relaxed text-black/70">{vaultCase.summary}</p>
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
                  ))}
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
