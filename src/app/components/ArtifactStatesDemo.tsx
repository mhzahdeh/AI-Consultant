import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { BackButton } from './shared/BackButton';
import { Sidebar } from './shared/Sidebar';
import { SkeletonLoader, SkeletonCard } from './design-system/SkeletonLoader';

export default function ArtifactStatesDemo() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeItem="engagements" />

      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-black/5 bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <BackButton fallbackTo="/workspace" label="Back to Workspace" />
          </div>
          <div className="mt-4">
            <h1
              className="mb-1 text-3xl tracking-tight text-black"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              Artifact Generation States
            </h1>
            <p className="text-sm text-black/60">All states for document generation and editing</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          <div className="mx-auto max-w-4xl space-y-16">
            {/* Generation In Progress */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                1. Generation In Progress
              </h2>
              <div className="space-y-6 border border-black/10 bg-white p-8">
                <div className="flex items-center justify-center gap-3 border border-black/10 bg-white p-8 text-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  <p className="text-sm text-black/60">Generating proposal starter from matched cases...</p>
                </div>
                <SkeletonLoader className="h-8 w-1/2" />
                <SkeletonLoader className="h-4 w-full" />
                <SkeletonLoader className="h-4 w-full" />
                <SkeletonLoader className="h-4 w-3/4" />
              </div>
            </section>

            {/* Section Being Regenerated */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                2. Section Being Regenerated
              </h2>
              <div className="border border-black/10 bg-white p-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3
                    className="text-lg tracking-tight text-black"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    Problem Statement
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-black/60">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Regenerating...
                  </div>
                </div>
                <div className="space-y-3">
                  <SkeletonLoader className="h-4 w-full" />
                  <SkeletonLoader className="h-4 w-full" />
                  <SkeletonLoader className="h-4 w-3/4" />
                </div>
              </div>
            </section>

            {/* Save Success */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                3. Save Success
              </h2>
              <div className="border border-black/10 bg-white p-4">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-black" />
                  <span className="text-black">Saved successfully</span>
                </div>
              </div>
            </section>

            {/* Export Success */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                4. Export Success
              </h2>
              <div className="border border-black/10 bg-white p-8">
                <div className="flex items-center justify-center gap-3 text-center">
                  <CheckCircle2 className="h-6 w-6 text-black" />
                  <div>
                    <div className="mb-1 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Export Complete
                    </div>
                    <div className="text-xs text-black/60">
                      Your DOCX file has been downloaded
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Export Failure */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                5. Export Failure with Retry
              </h2>
              <div className="space-y-6 border border-black/10 bg-white p-8">
                <div className="flex items-center justify-center gap-3 text-center">
                  <AlertCircle className="h-6 w-6 text-black/60" />
                  <div>
                    <div className="mb-1 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Export Failed
                    </div>
                    <div className="text-xs text-black/60">
                      There was a problem exporting your document
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex-1 border border-black bg-black px-6 py-3 text-sm text-white transition-all hover:bg-black/90">
                    Try Again
                  </button>
                  <button className="border border-black/10 bg-white px-6 py-3 text-sm text-black transition-all hover:border-black/20">
                    Cancel
                  </button>
                </div>
              </div>
            </section>

            {/* Section Hover State */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                6. Section Hover State with Actions
              </h2>
              <div className="border border-black/10 bg-white p-8">
                <div className="group border-t border-black/5 pt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h3
                      className="text-lg tracking-tight text-black"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      Objectives
                    </h3>
                    <div className="flex items-center gap-2 opacity-100">
                      <button className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-1 text-xs text-black transition-all hover:border-black/20">
                        <RefreshCw className="h-3 w-3" />
                        Regenerate
                      </button>
                      <button className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-1 text-xs text-black transition-all hover:border-black/20">
                        Copy
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-black">
                    Sample section content with regeneration and copy actions visible on hover...
                  </p>
                </div>
              </div>
            </section>

            {/* Version Preserved Notice */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                7. Version Preserved After Regeneration
              </h2>
              <div className="border-l-2 border-black/10 bg-black/[0.02] p-6">
                <div className="mb-2 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                  Previous Version Preserved
                </div>
                <div className="text-xs text-black/70">
                  Version 6 has been saved to version history. You can restore it anytime from the Version History panel.
                </div>
              </div>
            </section>

            {/* Generation Complete Banner */}
            <section>
              <h2
                className="mb-6 text-xl tracking-tight text-black"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                8. Generation Complete
              </h2>
              <div className="border border-black/10 bg-black/[0.02] p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-black" />
                  <div>
                    <div className="mb-1 text-sm text-black" style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                      Proposal Starter Generated
                    </div>
                    <div className="text-xs text-black/60">
                      Generated from 3 matched cases • Review and edit below
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
