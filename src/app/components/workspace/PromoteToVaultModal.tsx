import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Archive, X } from "lucide-react";

interface PromoteToVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaults: {
    title: string;
    summary: string;
    industry: string;
    businessFunction: string;
    problemType: string;
    capability: string;
    tags: string[];
    outcomes: string[];
  };
  onSubmit: (payload: {
    title: string;
    summary: string;
    industry: string;
    businessFunction: string;
    problemType: string;
    capability: string;
    tags: string[];
    outcomes: string[];
  }) => Promise<void>;
}

export function PromoteToVaultModal({ isOpen, onClose, defaults, onSubmit }: PromoteToVaultModalProps) {
  const [title, setTitle] = useState(defaults.title);
  const [summary, setSummary] = useState(defaults.summary);
  const [industry, setIndustry] = useState(defaults.industry);
  const [businessFunction, setBusinessFunction] = useState(defaults.businessFunction);
  const [problemType, setProblemType] = useState(defaults.problemType);
  const [capability, setCapability] = useState(defaults.capability);
  const [tags, setTags] = useState(defaults.tags.join(", "));
  const [outcomes, setOutcomes] = useState(defaults.outcomes.join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const normalizedTags = tags.split(",").map((item) => item.trim()).filter(Boolean);
  const normalizedOutcomes = outcomes.split(",").map((item) => item.trim()).filter(Boolean);
  const reuseSignals = [
    problemType.trim() ? `Reusable for future ${problemType.trim().toLowerCase()} engagements` : "",
    capability.trim() ? `Will strengthen ${capability.trim().toLowerCase()} retrieval` : "",
    normalizedTags.length ? `Adds ${Math.min(normalizedTags.length, 4)} reusable knowledge tags` : "",
    normalizedOutcomes.length ? `Captures ${Math.min(normalizedOutcomes.length, 4)} outcome signals future teams can cite` : "",
  ].filter(Boolean);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(defaults.title);
    setSummary(defaults.summary);
    setIndustry(defaults.industry);
    setBusinessFunction(defaults.businessFunction);
    setProblemType(defaults.problemType);
    setCapability(defaults.capability);
    setTags(defaults.tags.join(", "));
    setOutcomes(defaults.outcomes.join(", "));
    setFormError("");
  }, [defaults, isOpen]);

  const handleSubmit = async () => {
    if (!title.trim() || !summary.trim() || !industry.trim() || !problemType.trim()) {
      setFormError("Title, summary, industry, and problem type are required before saving to the vault.");
      return;
    }
    setIsSubmitting(true);
    try {
      setFormError("");
      await onSubmit({
        title,
        summary,
        industry,
        businessFunction,
        problemType,
        capability,
        tags: normalizedTags,
        outcomes: normalizedOutcomes,
      });
      onClose();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save engagement to vault.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgb(0,0,0,0.12)]"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="mb-1 text-xl tracking-tight text-black" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                  Save Engagement to Vault
                </h2>
                <p className="text-sm text-black/60">Turn this engagement into private team knowledge that can resurface in future work.</p>
              </div>
              <button onClick={onClose} aria-label="Close save to vault modal" className="text-black/40 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none" placeholder="Vault case title" />
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} className="border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none" placeholder="Industry" />
              <input value={businessFunction} onChange={(e) => setBusinessFunction(e.target.value)} className="border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none" placeholder="Business function" />
              <input value={problemType} onChange={(e) => setProblemType(e.target.value)} className="border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none" placeholder="Problem type" />
              <input value={capability} onChange={(e) => setCapability(e.target.value)} className="border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none md:col-span-2" placeholder="Capability" />
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={5} className="border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none md:col-span-2" placeholder="Strategic reuse summary: why this case should resurface, what teams should borrow, and when it is useful" />
              <input value={tags} onChange={(e) => setTags(e.target.value)} className="border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none md:col-span-2" placeholder="Tags, comma separated" />
              <input value={outcomes} onChange={(e) => setOutcomes(e.target.value)} className="border border-black/10 px-4 py-3 text-sm text-black focus:border-black focus:outline-none md:col-span-2" placeholder="Outcomes, comma separated" />
            </div>

            {formError ? (
              <div className="mt-4 border-l-2 border-red-700/70 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="border-l-2 border-black bg-black/[0.02] p-4">
                <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-black/40">Why Save This</div>
                <p className="text-sm leading-relaxed text-black/70">
                  This creates a private internal vault case that can rank ahead of public analogs when future engagements look similar.
                </p>
              </div>
              <div className="border border-black/10 bg-white p-4">
                <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-black/40">Future Reuse Value</div>
                <div className="space-y-2">
                  {reuseSignals.map((item) => (
                    <div key={item} className="text-sm text-black/70">{item}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button onClick={onClose} className="flex-1 border border-black/10 bg-white px-6 py-3 text-sm text-black hover:border-black/20">
                Cancel
              </button>
              <button onClick={() => void handleSubmit()} className="flex-1 inline-flex items-center justify-center gap-2 border border-black bg-black px-6 py-3 text-sm text-white hover:bg-black/90">
                <Archive className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save to Vault"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
